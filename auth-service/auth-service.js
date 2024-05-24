// basic route (http://localhost:8080)
import express from 'express';
import AWS from 'amazon-cognito-identity-js';

const authService = function({
  config,
  passport,
  onVerify,
  onSuccess,
  onLoginFail,
  onRegister,
  onResendEmailConfirmation,
  onEmailVerify,
  onPasswordReset,
  onPasswordResetConfirm,
  onPasswordChange
}) {
  const apiRoutes = express.Router();
  apiRoutes.post("/login", function(req, res, next) {
    const authenticationData = {
      Username: req.body.username,
      Password: req.body.password
    };
    const authenticationDetails = new AWS.CognitoIdentityServiceProvider.AuthenticationDetails(
      authenticationData
    );
    const poolData = {
      UserPoolId: "*removed for security*",
      ClientId: "*removed for security*"
    };
    const userPool = new AWS.CognitoIdentityServiceProvider.CognitoUserPool(
      poolData
    );
    const userData = {
      Username: req.body.username,
      Pool: userPool
    };

    const cognitoUser = new AWS.CognitoIdentityServiceProvider.CognitoUser(
      userData
    );

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: function(result) {
        console.log("access token + " + result.getAccessToken().getJwtToken());
        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
          IdentityPoolId: "*removed for security*",
          Logins: {
            "*removed for security*": result.getIdToken().getJwtToken()
          }
        });
      },
      onSuccess: function(suc) {
        console.log("Login Successful!");
      },
      onFailure: function(err) {
        console.log("Login Unsuccessful");
        alert(err);
      }
    });
  });
  apiRoutes.post("/register", function(req, res, next) {
  });
  return apiRoutes;
};

export default authService;
