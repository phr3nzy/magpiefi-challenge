import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

export default fp(
	async (app: FastifyInstance) => {
		await app.register(swagger, {
			swagger: {
				info: {
					title: app.config.SERVICE_NAME,
					description: 'Magpiefi Challenge API documentation',
					version: app.config.SERVICE_VERSION,
				},
				host: `${app.config.HOST}:${app.config.PORT}`,
				schemes: ['http', 'https'],
				consumes: ['application/json'],
				produces: ['application/json'],
			},
			mode: 'dynamic',
		});

		// swagger-ui plugin will add swagger-ui support
		await app.register(swaggerUi, {
			routePrefix: '/documentation',
			uiConfig: {
				syntaxHighlight: {
					theme: 'monokai',
				},
				tryItOutEnabled: false,
			},
		});
	},
	{
		name: 'swagger',
		dependencies: ['config'],
	},
);
