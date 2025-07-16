export default {
	testEnvironment: 'node',
	transform: {},	// need to run the .js files as is
	testMatch: ['**/tests/**/*.test.js'],
	moduleNameMapper: {
		'^(\\.{1,2}/.*)\\.js$': '$1',
	},
	collectCoverageFrom: ['src/**/*.js', '!src/server.js', '!src/config/**'],
	coverageDirectory: 'coverage',
	coverageReporters: ['text', 'lcov', 'html'],
};