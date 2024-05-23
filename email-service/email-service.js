const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");
const express = require("express");
const nodemailer = require("nodemailer");
const apiRoutes = express.Router();

// Initialize the SES client
const sesClient = new SESClient({ region: 'your-region' });

const getSESTransporter = () => {
  let transporter = nodemailer.createTransport({
    SES: { ses: sesClient, aws: require("@aws-sdk/client-ses") }
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

module.exports.sendEmail = sendEmail;
module.exports.emailServiceApi = apiRoutes.post("/email", (req, res) => {
  let { from, to, template, subject } = req.body;
  sendEmail(from, to, template, subject);
  res.status(200).send("Email sent");
});
