const { GraphQLObjectType, GraphQLSchema, GraphQLInt } = require("graphql");

let count = 0;

let schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "RootQueryType",
    fields: {
      count: {
        type: GraphQLInt,
        description: "The count!",
        resolve: function() {
          return count;
        }
      }
    }
  }),
  mutation: new GraphQLObjectType({
    name: "RootMutationType",
    fields: {
      updateCount: {
        type: GraphQLInt,
        description: "Updates the count",
        resolve: function() {
          count += 1;
          return count;
        }
      }
    }
  })
});

module.exports = schema;
