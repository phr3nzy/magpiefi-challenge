import type { FastifyRequest, FastifyServerOptions } from 'fastify';
import qs from 'qs';
import { v4 as uuid } from 'uuid';
import { AJV_CONFIG } from './ajv.js';
import { logger } from './logger.js';

// Generate a request id - this is used for logging and tracing
function genReqId(_: FastifyRequest) {
	return uuid();
}

/**
 * Server configuration
 */
export const SERVER_CONFIG: FastifyServerOptions = {
	ajv: {
		customOptions: AJV_CONFIG,
		plugins: [
			(await import('ajv-formats')).default,
			(await import('ajv-errors')).default,
		],
	},
	trustProxy: true,
	logger,
	ignoreTrailingSlash: true,
	pluginTimeout: 60000, // 1 minute
	bodyLimit: 8192 * 2, // 16KB
	caseSensitive: false,
	connectionTimeout: 60000, // 1 minute,
	forceCloseConnections: 'idle',
	ignoreDuplicateSlashes: false,
	requestIdHeader: 'x-req-id',
	requestIdLogLabel: 'requestId',
	onProtoPoisoning: 'error',
	onConstructorPoisoning: 'error',
	genReqId,
	querystringParser: (str: string) =>
		qs.parse(str, {
			allowPrototypes: false,
			charset: 'utf-8',
			charsetSentinel: true,
			parseArrays: false,
			interpretNumericEntities: true,
			parameterLimit: 5,
			strictNullHandling: true,
			plainObjects: false,
		}),
};

export default SERVER_CONFIG;
