/** @type {import('jest').Config} */
export default {
  displayName: 'deferred-data-access',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]sx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
      },
    ],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testMatch: ['**/*.spec.ts', '**/*.test.ts'],
  moduleNameMapper: {
    '^@actualwave/deferred-data-access/command$': '<rootDir>/command/index.ts',
    '^@actualwave/deferred-data-access/interface$': '<rootDir>/interface/index.ts',
    '^@actualwave/deferred-data-access/proxy$': '<rootDir>/proxy/index.ts',
    '^@actualwave/deferred-data-access/resource$': '<rootDir>/resource/index.ts',
    '^@actualwave/deferred-data-access/record$': '<rootDir>/record/index.ts',
    '^@actualwave/deferred-data-access/utils$': '<rootDir>/utils/index.ts',
    '^@actualwave/deferred-data-access$': '<rootDir>/index.ts',
  },
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    '**/*.ts',
    '!**/*.spec.ts',
    '!**/*.d.ts',
    '!**/index.ts',
    '!**/index-module.ts',
    '!jest.config.js',
    '!rollup.config.js',
  ],
};
