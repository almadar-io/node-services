const express = require("express");
var google = require("googleapis");

var apiRoutes = express.Router();
module.exports = function translateApi({ oauth2Client }) {
  var translate = google.translate({
    version: "v2",
    auth: oauth2Client
  });
  return apiRoutes;
};
