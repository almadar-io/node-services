var LocalStrategy = require("passport-local");

module.exports =  function local({ passport, onVerify }) {
  passport.use(
    new LocalStrategy({ usernameField: "email" }, (username, password, cb) => {
      onVerify({ username, password, cb, providerName: "local" });
    })
  );
}
