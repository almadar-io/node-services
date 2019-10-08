const express = require("express");
var bodyParser = require("body-parser");
const graphqlHTTP = require("express-graphql");
const userSchema = require("./schemas/user");

// ---------------------------------------------------------
// get an instance of the router for api routes
// ---------------------------------------------------------

module.exports = function GraphQL({ app, userModel }, dbSchemas) {
  let apiRoutes = express.Router();

  // parse POST body as text
  apiRoutes.use(
    bodyParser.text({
      type: "application/graphql"
    })
  );
  apiRoutes.use(
    "/",
    graphqlHTTP({
      schema: userSchema(userModel),
      graphiql: true
    })
  );

  return apiRoutes;
};
