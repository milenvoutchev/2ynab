module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'src/strategy/DkbGirokontoStrategy_2026.js',
    'src/strategy/DkbGirokontoStrategy.js'
  ],
  coverageThreshold: {
    './src/strategy/DkbGirokontoStrategy_2026.js': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    },
    './src/strategy/DkbGirokontoStrategy.js': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};

