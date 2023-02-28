// Main entrypoint for the server
import sensible from '@fastify/sensible';
import fastify from 'fastify';
import { SERVER_CONFIG } from './config/server.js';
import env from './plugins/config.js';
import cron from './plugins/cron.js';
import db from './plugins/db.js';
import health from './plugins/health.js';
import urql from './plugins/urql.js';
import validator from './plugins/validator.js';

export const bootstrap = async () => {
	const server = fastify(SERVER_CONFIG);

	// Register plugins
	// validator plugin will add ajv, magic-regexp and fluent-json-schema support
	await server.register(validator);
	// env plugin will validate environment variables
	await server.register(env);
	// sensible plugin will add some sensible defaults (404, 500, etc.)
	await server.register(sensible);
	// db plugin will add database support
	await server.register(db);
	// urql plugin will register graphql client connected with thegraph API
	await server.register(urql);
	// health plugin will add health check support
	await server.register(health);
	// cron plugin will add cron support
	await server.register(cron);

	// Register routes
	await server.register(import('./routes/index.js'));

	return server;
};

export default bootstrap;
