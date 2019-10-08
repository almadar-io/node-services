const express = require("express");
const awsSES = require("./aws-ses");
let awsApiRoutes = express.Router();
module.exports = function awsService() {
  let awsSESApiRoutes = awsSES();
  awsApiRoutes.use("/", apiRoutes);
  awsApiRoutes.use("/ses", awsSESApiRoutes);
  return awsApiRoutes;
};
