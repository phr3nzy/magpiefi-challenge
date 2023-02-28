export default {
	// Supports all esbuild.build options
	esbuild: {
		minify: false,
		target: 'es2022',
		format: 'esm',
	},
	// Prebuild hook
	prebuild: async () => {
		console.time('Prebuild');
		console.log('Running prebuild hook...');
		const rimraf = (await import('rimraf')).default;
		rimraf.sync('./dist'); // clean up dist folder
		rimraf.sync('./.tsbuildinfo');
		console.log('Prebuild hook ran successfully.');
		console.timeEnd('Prebuild');
	},
	// Postbuild hook
	postbuild: async () => {
		console.time('Postbuild');
		console.log('Running postbuild hook...');
		const cpy = (await import('cpy')).default;
		await cpy(
			[
				'lib/**/*.graphql', // Copy all .graphql files
				'lib/**/*.json', // Copy all .json files
				'lib/**/*.md', // Copy all .md files
				'!lib/**/*.{tsx,ts,js,jsx}', // Ignore already built files
			],
			'dist',
		);
		console.log('Postbuild hook ran successfully.');
		console.timeEnd('Postbuild');
	},
};
