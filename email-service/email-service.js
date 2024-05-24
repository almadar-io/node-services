import {  SESClient, SendEmailCommand  } from '@aws-sdk/client-ses';
import express from 'express';
import nodemailer from 'nodemailer';
const apiRoutes = express.Router();

// Initialize the SES client
const sesClient = new SESClient({ region: 'your-region' });

const getSESTransporter = () => {
  let transporter = nodemailer.createTransport({
    SES: { sesClient, aws: { region: 'us-east-1' } }
  });
  return transporter;
}

const sendEmail = async (from, to, template, subject) => {
  let transporter = getSESTransporter();

  transporter.sendMail({
    from: from,
    to: to,
    text: template,
    subject: subject
  }, (err, info) => {
    if (err) {
      return console.log("ERR!", err);
    }
    console.log(info.envelope);
    console.log(info.messageId);
  });
};

export const emailServiceApi = apiRoutes.post("/email", (req, res) => {
  let { from, to, template, subject } = req.body;
  sendEmail(from, to, template, subject);
  res.status(200).send("Email sent");
});
