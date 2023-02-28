import 'make-promises-safe';
import '@total-typescript/ts-reset';
import { bootstrap } from './server/index.js';

/**
 * Start the server
 */
const start = async () => {
	try {
		// Bootstrap the server
		const server = await bootstrap();

		// Catch and log any errors during plugin registration
		await server.ready();

		// Start listening for requests
		await server.listen({ host: server.env.HOST, port: server.env.PORT });

		// Log the routes
		server.log.debug(server.printRoutes());

		// Handle SIGINT and SIGTERM signals
		const handleSignal = (signal: string) => {
			server.log.debug(`Received ${signal} signal, shutting down...`);
			server
				.close()
				.then(() => {
					process.exit(0);
				})
				.catch(error =>
					console.error(
						'An error occured while attempting to shutdown the server',
						error,
					),
				);
		};

		process.on('SIGINT', handleSignal);
		process.on('SIGTERM', handleSignal);
		process.on('uncaughtException', (error, origin) => {
			server.log.fatal({ error, origin }, 'Uncaught Exception');
			server
				.close()
				.then(() => {
					process.exit(1);
				})
				.catch(err =>
					console.error(
						'An error occured while attempting to shutdown the server after an uncaught exception occured',
						{ error: err as Error, originalError: error, origin },
					),
				);
		});
		process.on('unhandledRejection', (error, rejectedPromise) => {
			server.log.fatal({ error, rejectedPromise }, 'Unhandled Rejection');
			server
				.close()
				.then(() => {
					process.exit(1);
				})
				.catch(err =>
					console.error(
						'An error occured while attempting to shutdown the server after an uncaught exception occured',
						{ error: err as Error, originalError: error, rejectedPromise },
					),
				);
		});
	} catch (error) {
		Error.captureStackTrace(error as Error);
		console.error('An error occured during initialization.', error);
		process.exit(1);
	}
};

await start();
