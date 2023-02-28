import { PrismaClient } from '@prisma/client';
import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

declare module 'fastify' {
	interface FastifyInstance {
		db: PrismaClient;
	}
}

export default fp(
	async (app: FastifyInstance) => {
		const prisma = new PrismaClient({
			errorFormat: app.config.NODE_ENV === 'production' ? 'minimal' : 'pretty',
			log: [
				{
					emit: 'event',
					level: 'query',
				},
				{
					emit: 'event',
					level: 'error',
				},
				{
					emit: 'event',
					level: 'info',
				},
				{
					emit: 'event',
					level: 'warn',
				},
			],
		});

		prisma.$on('query', event => {
			app.log.debug(event);
		});

		prisma.$on('error', event => {
			app.log.error(event);
		});

		prisma.$on('info', event => {
			app.log.info(event);
		});

		prisma.$on('warn', event => {
			app.log.warn(event);
		});

		await prisma.$connect();

		// Make Prisma Client available through the fastify server instance
		app.decorate('db', prisma);

		// Shutdown Prisma Client when the server closes
		app.addHook('onClose', async () => {
			app.log.debug('Database shutting down...');
			await prisma.$disconnect();
		});
	},
	{
		name: 'db',
		dependencies: ['config'],
	},
);
