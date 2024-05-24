module.exports = {
  testEnvironment: "node",
  setupFilesAfterEnv: ["./setupTests.js"],
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
};
