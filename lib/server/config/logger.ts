import pino, { Level, multistream, StreamEntry } from 'pino';
import pretty from 'pino-pretty';

const {
	LOG_LEVEL = 'debug',
	DISABLE_LOGGING = false,
	NODE_ENV = 'development',
	SERVICE_NAME = 'api',
	LOG_TO_FILE = false,
	LOG_FILE_PATH = 'logs/api.log',
} = process.env as typeof process.env & {
	LOG_LEVEL: Level;
	DISABLE_LOGGING: boolean;
	NODE_ENV: 'development' | 'production' | 'testing';
	SERVICE_NAME: string;
	LOG_TO_FILE: boolean;
	LOG_FILE_PATH: string;
};

// Set up the streams we want to log to.
const streams: StreamEntry[] = [];

// If we're in development or testing, we want to pretty print the logs.
if (NODE_ENV === 'development' || NODE_ENV === 'testing') {
	streams.push({
		stream: pretty({ colorize: true, sync: NODE_ENV === 'testing' }),
		level: LOG_LEVEL,
	});
} else {
	// Otherwise, we just want to log to stdout.
	streams.push({ stream: process.stdout, level: LOG_LEVEL });
}

// If we're in production, we also want to log to a file.
if (NODE_ENV === 'production' && LOG_TO_FILE && LOG_FILE_PATH) {
	streams.push({
		stream: pino.destination({
			dest: LOG_FILE_PATH,
			sync: false,
		}),
		level: LOG_LEVEL,
	});
}

/**
 * The logger instance.
 */
export const logger = pino(
	{
		name: SERVICE_NAME,
		level: LOG_LEVEL,
		enabled: !DISABLE_LOGGING,
		timestamp: true,
	},
	multistream(streams),
);

export default logger;
