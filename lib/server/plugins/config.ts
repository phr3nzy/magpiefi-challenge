import env from '@fastify/env';
import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { ENVIRONMENT_VARIABLES_SCHEMA, TEnvSchema } from '../config/env.js';

declare module 'fastify' {
	interface FastifyInstance {
		env: TEnvSchema;
		config: TEnvSchema;
	}
}

export default fp(
	async (app: FastifyInstance) => {
		// Register the env plugin
		await app.register(env, {
			schema: ENVIRONMENT_VARIABLES_SCHEMA,
			dotenv: true,
			env: true,
			confKey: 'env',
			ajv: app.ajv,
		});

		// Add the config to the app
		app.decorate('config', {
			...app.env,
		});
	},
	{
		name: 'config',
	},
);
