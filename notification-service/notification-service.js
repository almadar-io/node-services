import {  SNSClient, PublishCommand, SubscribeCommand  } from '@aws-sdk/client-sns';
import express from 'express';
import socketService from '../socket-service/socket-service.js';

// Initialize the SNS client
const snsClient = new SNSClient({ region: "us-east-1" });

export const notificationService = function({ modelName, server, config }) {
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

  afterSocketInit.then(({ io, socket }) => {
    apiRoutes.post(
      `${config.get("notificationUrl")}/${modelName}`,
      (req, res) => {
        io.emit("sns-data", req.body);
        res.send("done!");
      }
    );
  });

  return { apiRoutes, afterSocketInit };
};

export const publish = async function publish({ modelName, message }) {
  try {
    // Create publish parameters
    const params = {
      Message: message, /* required */
      TopicArn: modelName
    };

    // Create publish command
    const publishCommand = new PublishCommand(params);

    // Send publish command
    const data = await snsClient.send(publishCommand);

    console.log(`Message "${params.Message}" sent to the topic "${params.TopicArn}"`);
    console.log("MessageID is " + data.MessageId);

    return data;
  } catch (err) {
    console.error(err, err.stack);
    throw err;
  }
};

export const subscribe = async function subscribe({ modelName, onEvent, config }) {
  try {
    const params = {
      Protocol: "https", /* required */
      TopicArn: modelName,
      Endpoint: `${config.get("notificationUrl")}/${modelName}`
    };

    // Create subscribe command
    const subscribeCommand = new SubscribeCommand(params);

    // Send subscribe command
    const data = await snsClient.send(subscribeCommand);

    onEvent(data);
    return data;
  } catch (err) {
    console.error(err, err.stack);
    throw err;
  }
};
