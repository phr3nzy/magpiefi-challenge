import type { FastifyInstance } from 'fastify';
import urql from 'urql';
import fp from 'fastify-plugin';

declare module 'fastify' {
	interface FastifyInstance {
		urql: ReturnType<typeof urql.createClient>;
	}
}

export default fp(
	async (app: FastifyInstance) => {
		const client = urql.createClient({ url: app.config.GRAPH_API_URL });

		app.decorate('urql', client);
	},
	{
		name: 'urql',
		dependencies: ['config', 'db'],
	},
);
