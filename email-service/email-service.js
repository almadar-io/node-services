const nodemailer = require("nodemailer");
const express = require("express");
const aws = require("aws-sdk")
const apiRoutes = express.Router();

const getSESTransporter = () => {
  let transporter = nodemailer.createTransport({
    SES: new aws.SES({ apiVersion: '2010-12-01' })
  });
  return transporter;
}

const sendEmail = async(from, to, template, subject) => {
  // create reusable transporter object using the default SMTP transport
  let transporter = getSESTransporter();

  // send some mail
  transporter.sendMail({
    from: 'samalghanmi@markab.io',
    to: 'oalghnmi@gmail.com',
    text: template,
    subject: subject
  }, (err, info) => {
    if (err) {
      return console.log("ERR!", err)
    }
    console.log(info.envelope);
    console.log(info.messageId);
  });

  // send mail with defined transport object
  // let info = await transporter.sendMail(mailOptions);
  // console.log("Message sent: %s", info.messageId);
  // // Preview only available when sending through an Ethereal account
  // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
  // // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
};

module.exports.sendEmail = sendEmail;
module.exports.emailServiceApi = apiRoutes.post("/email", (req, res) => {
  let { from, to, template } = require(req.body);
  sendEmail(from, to, template);
});
