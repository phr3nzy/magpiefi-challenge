import type { FastifyInstance } from 'fastify';
import serverMetadataRoute from './metadata.js';
import pairsRoutes from './pairs/index.js';

export default async function routes(app: FastifyInstance) {
	await app.register(serverMetadataRoute);
	await app.register(pairsRoutes, { prefix: 'pairs' });
}
