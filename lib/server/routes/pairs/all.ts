import type { FastifyInstance } from 'fastify';

export default async function fetchAllPairsRoute(app: FastifyInstance) {
	app.route({
		method: 'GET',
		url: '/',
		schema: {
			operationId: 'fetchAllPairs',
			tags: ['Pairs'],
			description:
				'This route is used to fetch all pairs currently in the database. This route is public.',
			summary: 'Fetch All Pairs',
			produces: ['application/json'],
			response: {
				200: app.fluentSchema
					.object()
					.description('The response for a successful request')
					.prop('success', app.fluentSchema.boolean())
					.prop('message', app.fluentSchema.string())
					.prop(
						'pairs',
						app.fluentSchema
							.array()
							.items(
								app.fluentSchema
									.object()
									.prop('id', app.fluentSchema.string().format('uuid'))
									.prop('pairId', app.fluentSchema.string())
									.prop(
										'token0',
										app.fluentSchema
											.object()
											.prop('id', app.fluentSchema.string())
											.prop('symbol', app.fluentSchema.string())
											.prop('name', app.fluentSchema.string())
											.prop('derivedETH', app.fluentSchema.number()),
									)
									.prop(
										'token1',
										app.fluentSchema
											.object()
											.prop('id', app.fluentSchema.string())
											.prop('symbol', app.fluentSchema.string())
											.prop('name', app.fluentSchema.string())
											.prop('derivedETH', app.fluentSchema.number()),
									)
									.prop('reserve0', app.fluentSchema.number())
									.prop('reserve1', app.fluentSchema.number())
									.prop('reserveUSD', app.fluentSchema.number())
									.prop('trackedReserveETC', app.fluentSchema.number())
									.prop('token0Price', app.fluentSchema.number())
									.prop('token1Price', app.fluentSchema.number())
									.prop('volumeUSD', app.fluentSchema.number())
									.prop('txCount', app.fluentSchema.integer())
									.prop(
										'createdAt',
										app.fluentSchema.string().format('date-time'),
									)
									.prop(
										'updatedAt',
										app.fluentSchema.string().format('date-time'),
									),
							),
					),
				'4xx': app.fluentSchema
					.object()
					.description(
						'The response body for a failed request due to account error',
					)
					.prop('error', app.fluentSchema.string())
					.prop('message', app.fluentSchema.string())
					.prop('statusCode', app.fluentSchema.number()),
				'5xx': app.fluentSchema
					.object()
					.description(
						'The response body for a failed request due to an internal server error',
					)
					.prop('error', app.fluentSchema.string())
					.prop('message', app.fluentSchema.string())
					.prop('statusCode', app.fluentSchema.number()),
			},
		},
		handler: async (_, reply) => {
			const pairs = await app.db.pair.findMany();

			// eslint-disable-next-line @typescript-eslint/no-floating-promises
			reply.status(200);
			return {
				success: true,
				message: 'Pairs successfully fetched.',
				pairs,
			};
		},
	});
}
