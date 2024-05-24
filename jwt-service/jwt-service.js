import express from 'express';
import jwt from 'jsonwebtoken';
var apiRoutes = express.Router();

export const isAuthenticated = (token, secret) => {
  // verifies secret and checks exp
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, function(err, decoded) {
      if (err) {
        reject(err);
      } else {
        resolve(decoded);
      }
    });
  });
};

export const jwtService = ({ secret, onVerify }) {
  // route middleware to verify a token
  apiRoutes.use("/", function(req, res, next) {
    // check header or url parameters or post parameters for token
    var token =
      req.body.token || req.query.token || req.headers["x-access-token"];

    if (req.method === "OPTIONS") {
      return res.send(200);
    }

    // decode token
    if (token) {
      // verifies secret and checks exp
      jwt.verify(token, secret, function(err, decoded) {
        if (err) {
          return res.json({
            success: false,
            message: "Failed to authenticate token."
          });
        } else {
          // if everything is good, save to request for use in other routes
          onVerify(decoded)
            .then(user => {
              req.decoded = user;
              next();
            })
            .catch(err => {
              res.status(500).send(err);
            });
        }
      });
    } else {
      // if there is no token
      // return an error
      return res.status(403).send({
        success: false,
        message: "No token provided."
      });
    }
  });

  apiRoutes.post("/", (req, res) => {
    res.status(200).send(req.decoded);
  });
  return apiRoutes;
};
