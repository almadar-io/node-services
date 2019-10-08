const express = require("express");
const googleDrive = require("./google-drive");
const googleTranslate = require("./google-translate");
const googleAuth = require("./google-auth");

let googleApiRoutes = express.Router();
module.exports = function googleService({ config, userModel }) {
  let { apiRoutes, oauth2Client } = googleAuth({ config, userModel });
  let googleDriveApiRoutes = googleDrive({ oauth2Client });
  let googleTranslateApiRoutes = googleTranslate({ oauth2Client });
  googleApiRoutes.use("/", apiRoutes);
  googleApiRoutes.use("/drive", googleDriveApiRoutes);
  googleApiRoutes.use("/translate", googleTranslateApiRoutes);
  return googleApiRoutes;
};
