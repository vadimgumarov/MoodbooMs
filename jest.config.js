module.exports = {
  // Look for tests in these directories
  testMatch: [
    "<rootDir>/tests/**/*.test.js",
    "<rootDir>/tests/**/*.test.jsx"
  ],
  
  // Setup files to run before tests
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  
  // Module name mapper for absolute imports
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy"
  },
  
  // Transform files with babel-jest
  transform: {
    "^.+\\.(js|jsx)$": "babel-jest"
  },
  
  // Test environment
  testEnvironment: "jsdom",
  
  // Coverage configuration
  collectCoverageFrom: [
    "src/**/*.{js,jsx}",
    "!src/index.js",
    "!src/reportWebVitals.js"
  ],
  
  // Module directories
  moduleDirectories: ["node_modules", "src"],
  
  // Clear mocks between tests
  clearMocks: true
};