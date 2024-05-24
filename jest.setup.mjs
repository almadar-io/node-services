const jestConfig = {
  testEnvironment: "node",
  setupFilesAfterEnv: ["./setupTests.js"],
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
};

export default jestConfig;