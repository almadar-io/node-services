const express = require("express");
var google = require("googleapis");
var OAuth2 = google.auth.OAuth2;

let apiRoutes = express.Router();

module.exports = function({ config, userModel }) {
  let clientId = config.get("auth.google.clientId");
  let clientSecret = config.get("auth.google.clientSecret");
  let callbackURL = config.get("auth.google.callbackURL");
  let redirectUrl = config.get("redirectUrl");

  var oauth2Client = new OAuth2(clientId, clientSecret, callbackURL);

  // // route middleware to verify a googleToken
  apiRoutes.use(function(req, res, next) {
    // check header or url parameters or post parameters for googleToken
    var googleToken =
      req.body.googleToken ||
      req.query.googleToken ||
      req.headers["x-access-google-token"];
    // decode token
    if (
      googleToken ||
      req.method === "OPTIONS" ||
      req.url.indexOf("/auth") !== -1
    ) {
      // Retrieve tokens via token exchange explained above or set them:
      oauth2Client.setCredentials({
        access_token: googleToken,
        refresh_token: req.body.google_refresh_token
      });
      next();
    } else {
      // if there is no token
      // return an error
      return res.status(403).send({
        success: false,
        message: "No token provided."
      });
    }
  });

  apiRoutes.get("/error", function(req, res) {
    res.status(401).send({ message: "Error Logging In!" });
  });

  apiRoutes.get("/auth", function(req, res) {
    // generate a url that asks permissions for Google+ and Google Calendar scopes
    const scopes = [
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/drive.appdata",
      "https://www.googleapis.com/auth/drive.file",
      "https://www.googleapis.com/auth/drive.metadata",
      "https://www.googleapis.com/auth/drive.metadata.readonly",
      "https://www.googleapis.com/auth/drive.photos.readonly",
      "https://www.googleapis.com/auth/drive.readonly",
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/gmail.readonly"
    ];
    var url = oauth2Client.generateAuthUrl({
      // 'online' (default) or 'offline' (gets refresh_token)
      access_type: "offline",

      // If you only need one scope you can pass it as a string
      scope: scopes

      // Optional property that passes state parameters to redirect URI
      // state: 'foo'
    });
    res.redirect(url);
  });

  apiRoutes.get("/auth/callback", (req, res) => {
    oauth2Client.getToken(req.query.code, function(
      err,
      { access_token, refresh_token }
    ) {
      // Now tokens contains an access_token and an optional refresh_token. Save them.
      if (!err) {
        oauth2Client.setCredentials({
          access_token,
          refresh_token
        });
        let oauth2 = google.oauth2({
          version: "v2",
          auth: oauth2Client
        });
        var gmail = google.gmail({
          auth: oauth2Client,
          version: "v1"
        });

        //try to find the user
        gmail.users.getProfile(
          {
            userId: "me"
          },
          function(err, { emailAddress }) {
            userModel
              .findOne({ email: emailAddress })
              .exec()
              .then(user => {
                if (user) {
                  console.log("user found", user);
                }
              });
          }
        );

        //try to locate the user by name at least to suggest linking profiles
        oauth2.userinfo.get((err, { name }) => {
          if (err) {
            console.error(err);
          }
          userModel
            .findOne({ name })
            .exec()
            .then(user => {
              if (user) {
                //update the profile to show the user a message to consolidate
                console.log("user found", user);
              }
            });
        });

        let redirectTo = `${redirectUrl}?google_access_token=${access_token}&google_refresh_token=${refresh_token}`;
        return res.redirect(redirectTo);
      } else {
        return res.send(err);
      }
    });
  });

  return { apiRoutes, oauth2Client };
};
