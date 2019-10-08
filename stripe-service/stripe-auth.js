const express = require("express");
const Stripe = require("stripe");
module.exports = function({ config, userModel }) {
  let clientId = config.get("auth.stripe.stripeId");
  let clientSecret = config.get("auth.stripe.stripeSecret");
  let stripe = Stripe("sk_test_Rpzo6B4XejK2b2arJJjfBybB");
  return { stripe };
};
