import type { FastifyInstance } from 'fastify';
import fetchAllPairsRoute from './all.js';

export default async function pairsRoutes(app: FastifyInstance) {
	await app.register(fetchAllPairsRoute);
}
