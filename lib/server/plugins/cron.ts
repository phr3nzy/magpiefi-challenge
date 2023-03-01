import type { FastifyInstance } from 'fastify';
import cron from 'fastify-cron';
import fp from 'fastify-plugin';

type PairsQueryResult = {
	pairs: {
		id: string;
		token0: {
			id: string;
			symbol: string;
			name: string;
			derivedETH: string;
		};
		token1: {
			id: string;
			symbol: string;
			name: string;
			derivedETH: string;
		};
		reserve0: string;
		reserve1: string;
		reserveUSD: string;
		trackedReserveETH: string;
		token0Price: string;
		token1Price: string;
		volumeUSD: string;
		txCount: string;
	}[];
};

export default fp(
	async (app: FastifyInstance) => {
		await app.register(cron, {
			jobs: [
				{
					name: 'sync-pairs',
					cronTime: '0 */30 * * * *', // Every 30 minutes
					runOnInit: true, // Start as soon as server begins
					start: true,
					startWhenReady: true,
					onTick: async () => {
						try {
							app.log.debug('Syncing pairs from thegraph...');
							const { data, error } = await app.urql
								.query<PairsQueryResult>(
									`
									query pairs($skip: Int!) {
										pairs(first: 1000, skip: $skip) {
											id
											token0 {
												id
												symbol
												name
												derivedETH
											}
											token1 {
												id
												symbol
												name
												derivedETH
											}
											reserve0
											reserve1
											reserveUSD
											trackedReserveETH
											token0Price
											token1Price
											volumeUSD
											txCount
										}
									}
								`,
									{ skip: 10 },
								)
								.toPromise();

							if (!data) {
								throw new Error('Failed to fetch pairs', {
									cause: {
										data,
										error,
									},
								});
							}

							const formattedPairs = data?.pairs.map(pair => ({
								pairId: pair.id,
								token0: {
									id: pair.token0.id,
									symbol: pair.token0.symbol,
									name: pair.token0.name,
									derivedETH: parseFloat(pair.token0.derivedETH),
								},
								token1: {
									id: pair.token1.id,
									symbol: pair.token1.symbol,
									name: pair.token1.name,
									derivedETH: parseFloat(pair.token1.derivedETH),
								},
								reserve0: parseFloat(pair.reserve0),
								reserve1: parseFloat(pair.reserve1),
								reserveUSD: parseFloat(pair.reserveUSD),
								trackedReserveETH: parseFloat(pair.trackedReserveETH),
								token0Price: parseFloat(pair.token0Price),
								token1Price: parseFloat(pair.token1Price),
								volumeUSD: parseFloat(pair.volumeUSD),
								txCount: parseFloat(pair.txCount),
							}));

							if (!formattedPairs) {
								throw new Error('Error while formatting pairs', {
									cause: {
										formattedPairs,
									},
								});
							}

							// Let's first check if we have pairs in the database. This is so we update the few that we have
							// and create the ones we don't.
							const pairsInDb = await app.db.pair.findMany();

							if (pairsInDb.length > 0) {
								const pairIdsInDb = pairsInDb.map(pair => pair.pairId);
								const pairsIdsToSync = formattedPairs.map(pair => pair.pairId);
								const pairsToCreate: ReturnType<typeof app.db.pair.create>[] =
									[];
								const pairsToUpdate: ReturnType<typeof app.db.pair.update>[] =
									[];

								pairsIdsToSync.forEach(id => {
									// If we have pairs in the database matching ones in the fetched payload,
									// we update the respective records
									if (pairIdsInDb.includes(id)) {
										const recordToUpdate = formattedPairs.find(pair => {
											return pair.pairId === id;
										});
										if (recordToUpdate) {
											pairsToUpdate.push(
												app.db.pair.update({
													where: { pairId: recordToUpdate.pairId },
													data: {
														...recordToUpdate,
													},
												}),
											);
										}
									} else {
										// If we don't have that specific pairId in the database,
										// we create a record for it
										const recordToCreate = formattedPairs.find(pair => {
											return pair.pairId === id;
										});
										if (recordToCreate) {
											pairsToCreate.push(
												app.db.pair.create({
													data: {
														...recordToCreate,
													},
												}),
											);
										}
									}
								});

								// Run the transaction by first creating the pairs we don't have
								// and then updating the ones that we do
								const upsertedPairs = await app.db.$transaction([
									...pairsToCreate,
									...pairsToUpdate,
								]);
								app.log.debug(`${upsertedPairs.length} pairs upserted.`);
							} else {
								const createdPairs = await app.db.pair.createMany({
									data: formattedPairs,
								});
								app.log.debug(`${createdPairs.count} pairs created.`);
							}
							app.log.debug('Pairs synced.');
						} catch (error) {
							app.log.error(error, 'Failed to sync pairs.');
						}
					},
				},
			],
		});
	},
	{
		name: 'cron',
		dependencies: ['config', 'db', 'urql'],
	},
);
