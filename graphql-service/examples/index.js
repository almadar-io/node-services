const { GraphQLSchema, GraphQLObjectType } = require("graphql");
const { aws } = require("./aws");

const schema = new GraphQLSchema({
  mutation: aws.Mutations,
  query: aws.Queries
});

module.exports = schema;
