export default {
	testEnvironment: 'node',
	testMatch: ['**/tests/**/*.test.js'],
	collectCoverageFrom: ['src/**/*.js', '!src/server.js', '!src/config/**'],
	coverageDirectory: 'coverage',
	coverageReporters: ['text', 'lcov', 'html'],
	transformIgnorePatterns: ['node_modules/(?!(.*\\.mjs$))'],
	moduleNameMapper: {
		'^(\\.{1,2}/.*)\\.js$': '$1',
	},
};
