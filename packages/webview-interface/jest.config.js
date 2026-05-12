/** @type {import('jest').Config} */
export default {
  displayName: 'webview-interface',
  testEnvironment: 'node',
  transform: { '^.+\\.[tj]sx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }] },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testMatch: ['**/*.spec.ts', '**/*.test.ts'],
  moduleNameMapper: {
    '^@actualwave/deferred-data-access/(.+)$':
      '<rootDir>/../../packages/deferred-data-access/$1/index.ts',
    '^@actualwave/deferred-data-access$':
      '<rootDir>/../../packages/deferred-data-access/index.ts',
  },
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    '**/*.ts',
    '!**/*.spec.ts',
    '!**/*.d.ts',
    '!**/index.ts',
    '!jest.config.js',
    '!rollup.config.js',
  ],
};
