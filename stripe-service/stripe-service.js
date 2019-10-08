const express = require("express");
const stripeAuth = require("./stripe-auth");

let stripeApiRoutes = express.Router();
module.exports = function stripeService({ config, userModel }) {
  let { stripe } = stripeAuth({ config, userModel });
  stripeApiRoutes.get("/", (req, res) => {
    stripe.balance.retrieve(function(err, balance) {
      console.log("balance is", balance);
      res.send(balance);
    });
  });
  return stripeApiRoutes;
};
