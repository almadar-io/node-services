// Load the AWS SDK for Node.js
const AWS = require("aws-sdk");
const express = require("express");
const socketService = require("../socket-service/socket-service");
// Set region
AWS.config.update({ region: "us-east-1" });

module.exports.notificationService = function({ modelName, server, config }) {
  const apiRoutes = express.Router();
  const afterSocketInit = new Promise((resolve, reject) => {
    socketService({
      onEvent: data => {
        console.log("from notification service", data);
      },
      onUpdate: () => {},
      onDelete: () => {},
      onInit: (io, socket) => {
        resolve({ io, socket });
      },
      config,
      channel: `/${modelName}`,
      port: "5000",
      server
    });
  });
  afterSocketInit.then(socket => {
    apiRoutes.post(
      `${config.get("notificationUrl")}/${modelName}`,
      (req, res) => {
        socket.emit("sns-data", req.body);
        res.send("done!");
      }
    );
  });
  return { apiRoutes, afterSocketInit };
};
module.exports.publish = function publish({ modelName, message }) {
  // Create publish parameters
  var params = {
    Message: message /* required */,
    TopicArn: modelName
  };

  // Create promise and SNS service object
  var publishTextPromise = new AWS.SNS({ apiVersion: "2010-03-31" })
    .publish(params)
    .promise();

  // Handle promise's fulfilled/rejected states
  publishTextPromise
    .then(function(data) {
      console.log(
        "Message ${params.Message} send sent to the topic ${params.TopicArn}"
      );
      console.log("MessageID is " + data.MessageId);
    })
    .catch(function(err) {
      console.error(err, err.stack);
    });
  return publishTextPromise;
};
module.exports.subscribe = function subscribe({ modelName, onEvent }) {
  var params = {
    Protocol: "https" /* required */,
    TopicArn: modelName,
    Endpoint: `${config.get("notificationUrl")}/${modelName}`
  };
  sns.subscribe(params, function(err, data) {
    if (err) {
      console.log(err, err.stack);
      return;
    }
    onEvent(data);
  });
};
