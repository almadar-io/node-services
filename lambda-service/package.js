export const getPackage = () => {
  return `{
  "name": "itechdom-playground-node",
  "version": "1.0.0",
  "description": "A way to get up and running quickly with any programming task.",
  "main": "src/javascript/index.js",
  "scripts": {
    "start": "./node_modules/.bin/serverless offline start --printOutput",
    "deploy":"./node_modules/.bin/serverless deploy"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/itechdom/playground.git"
  },
  "author": "",
  "license": "ISC",
  "bugs": {
    "url": "https://github.com/itechdom/playground/issues"
  },
  "homepage": "https://github.com/itechdom/playground#readme",
  "dependencies": {
    "aws-sdk": "^2.403.0",
    "config": "^1.25.1",
    "dotenv": "^7.0.0",
    "googleapis": "^18.0.0",
    "orbital-node-services": "^3.2.0",
    "joi": "^14.3.1",
    "moment": "^2.23.0",
    "stripe": "^6.25.1",
    "uuid": "^3.3.2",
    "mongoose": "^5.2.1",
    "mongoose-findorcreate": "^3.0.0",
    "mongoose-paginate": "^5.0.3",
    "serverless-http": "^2.3.0"
  },
  "devDependencies": {
    "serverless": "^1.52.0",
    "serverless-offline": "^5.11.0"
  },
  "jest": {
    "setupFiles": [
      "./setupTests.js"
    ]
  }
}`;
};
