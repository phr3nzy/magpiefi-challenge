export const ENVIRONMENT_VARIABLES_SCHEMA = {
	type: 'object',
	required: ['NODE_ENV', 'HOST', 'PORT', 'DATABASE_URL', 'GRAPH_API_URL'],
	properties: {
		NODE_ENV: {
			type: 'string',
			enum: ['development', 'production', 'testing'],
		},
		HOST: {
			type: 'string',
		},
		PORT: {
			type: 'integer',
		},
		SERVICE_NAME: {
			type: 'string',
			default: 'magpiefi-challenge-server',
		},
		SERVICE_VERSION: {
			type: 'string',
			default: '1.0.0',
			pattern: '^([\\d]{1}).([\\d]{1,8}).([\\d]{1,8})([-_](alpha|beta|rc))?$',
		},
		LOG_LEVEL: {
			type: 'string',
			enum: ['fatal', 'error', 'warn', 'info', 'debug', 'trace'],
			default: 'debug',
		},
		DISABLE_LOGGING: {
			type: 'boolean',
			default: false,
		},
		DATABASE_URL: {
			type: 'string',
			format: 'uri',
		},
		GRAPH_API_URL: {
			type: 'string',
		},
	},
} as const;

// Here we are using the ENVIRONMENT_VARIABLES_SCHEMA to create a type that
// is the same as the schema, but with the enum values added to the string
// types. This allows us to use the enum values in our code, but still have
// the type checking of the schema.
type TEnvSchemaProperties = (typeof ENVIRONMENT_VARIABLES_SCHEMA)['properties'];

export type TEnvSchema = {
	[key in keyof TEnvSchemaProperties]: TEnvSchemaProperties[key]['type'] extends 'string'
		? // @ts-expect-error - Typescript doesn't know that the enum property exists in some properties with the string type
		  string & TEnvSchemaProperties[key]['enum'][number]
		: TEnvSchemaProperties[key]['type'] extends 'integer'
		? number
		: TEnvSchemaProperties[key]['type'] extends 'boolean'
		? boolean
		: never;
};
