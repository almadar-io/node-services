var LocalStrategy = require("passport-local");

const local = ({ passport, onVerify }) => {
  passport.use(
    new LocalStrategy({ usernameField: "email" }, (username, password, cb) => {
      onVerify({ username, password, cb, providerName: "local" });
    })
  );
};

export default local;