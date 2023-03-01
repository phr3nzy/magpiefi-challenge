import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import urql from 'urql';

declare module 'fastify' {
	interface FastifyInstance {
		urql: ReturnType<typeof urql.createClient>;
	}
}

export default fp(
	// eslint-disable-next-line @typescript-eslint/require-await
	async (app: FastifyInstance) => {
		const client = urql.createClient({ url: app.config.GRAPH_API_URL });

		app.decorate('urql', client);
	},
	{
		name: 'urql',
		dependencies: ['config', 'db'],
	},
);
