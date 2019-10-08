var TwitterStrategy = require("passport-twitter");

module.exports =  function twitter({
  passport,
  clientId,
  clientSecret,
  callbackURL,
  onVerify
}) {
  passport.use(
    new TwitterStrategy(
      {
        clientID: clientId,
        clientSecret: clientSecret,
        callbackURL
      },
      function(accessToken, refreshToken, profile, cb) {
        let providerName = "twitter";
        onVerify({ accessToken, refreshToken, profile, cb, providerName });
      }
    )
  );
}
