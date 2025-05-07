import { defineConfig, globalIgnores } from 'eslint/config';
import { nodeConfig, setDirectoryConfigs, testingConfig } from 'eslint-config-brightspace';

export default defineConfig([
	setDirectoryConfigs([
		...nodeConfig,
		{
			languageOptions: {
				parserOptions: {
					ecmaVersion: 8,
					type: 'commonjs',
				}
			},
			rules: {
				strict: 'off',
				'no-unused-vars': ['error', { caughtErrorsIgnorePattern: '^ignore$' }],
			},
		},
		globalIgnores([
			'coverage',
			'.nyc_output',
			'!packages/node_modules/',
		]),
	], {
		'packages/node_modules/*/{spec,test}': testingConfig,
	})
]);
