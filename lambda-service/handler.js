export const getHandler = (modelname, path) => {
  return `
  import mongoose from 'mongoose';
  import config from 'config';
  let conn = null;
  const uri = config.get("db.host");
  import serverless from 'serverless-http';
  import express from 'express';
  const ${modelname}Api = require("./index.js");
  const app = express()
  import model from './${modelname}.js';
  import permissionsSchema from './permissions.js';
  import formsSchema from './forms.js';
  let handler;
  exports.handler = async function(event, context) {
    // Make sure to add this so you can re-use "conn" between function calls.
    // See https://www.mongodb.com/blog/post/serverless-development-with-nodejs-aws-lambda-mongodb-atlas
    context.callbackWaitsForEmptyEventLoop = false;
    // Because "conn" is in the global scope, Lambda may retain it between
    // function calls thanks to "callbackWaitsForEmptyEventLoop".
    // This means your Lambda function doesn't have to go through the
    // potentially expensive process of connecting to MongoDB every time.
    if (conn == null) {
      conn = await mongoose.createConnection(uri, {
        // Buffering means mongoose will queue up operations if it gets
        // disconnected = MongoDB and send them when it reconnects.
        // With serverless, better to fail fast if not connected.
        bufferCommands: false, // Disable mongoose buffering
        bufferMaxEntries: 0 // and MongoDB driver buffering
      });
      const contactsModel = conn.model("${modelname}", model);
      const formsModel = conn.model("Forms", formsSchema);
      const permissionsModel = conn.model("Permissions", permissionsSchema);
      handler = serverless(app.use("/",${modelname}Api({${modelname}Model:conn.model("${modelname}"),formsModel:conn.model("Forms"),permissionsModel:conn.model("Permissions")})));
    }
    const result = await handler(event, context);
    return result
  };
  `;
};
