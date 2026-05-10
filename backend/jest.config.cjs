module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src/tests'],
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.js'],
  collectCoverageFrom: ['src/**/*.js', '!src/tests/**'],
  cacheDirectory: '<rootDir>/.jest-cache'
};
