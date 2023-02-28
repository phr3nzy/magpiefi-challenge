import underPressure from '@fastify/under-pressure';
import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

export default fp(
	async (app: FastifyInstance) => {
		await app.register(underPressure, {
			exposeStatusRoute: {
				routeOpts: {
					logLevel: app.config.LOG_LEVEL,
				},
				routeSchemaOpts: {
					tags: ['General'],
					description:
						"Ensures the service is healthy by invoking the DB, Cache, Keycloak and Vault if they're alive and running.",
					summary: 'Runs a Healthcheck.',
				},
				routeResponseSchemaOpts: {
					status: { type: 'string', default: 'ok' },
					metrics: {
						type: 'object',
						properties: {
							eventLoopDelay: { type: 'number' },
							rssBytes: { type: 'number' },
							heapUsed: { type: 'number' },
							eventLoopUtilized: { type: 'number' },
						},
					},
				},
				url: '/health',
			},
			healthCheck: async () => {
				try {
					const dbPing = (await app.db.$runCommandRaw({ ping: 1 })) as {
						ok: number;
					};
					const dbIsAlive = dbPing.ok === 1;

					if (!dbIsAlive) {
						app.log.error('Database is unreachable');
						return false;
					}

					// TODO: add thegraph healthcheck (must first figure out where their /health route is)

					return {
						status: 'ok',
						metrics: app.memoryUsage(),
					};
				} catch (error) {
					app.log.error(
						error,
						'An error occured while attempting to run a health check.',
					);
					return false;
				}
			},
			healthCheckInterval: 3000, // Every 3 seconds
		});
	},
	{
		name: 'health',
		dependencies: ['config', 'db', 'urql'],
	},
);
