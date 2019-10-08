const { makeExecutableSchema } = require("graphql-tools");

const typeDefs = `
  type User {
    name: String!
    id: ID!
    name: String!
    email: String!
    password: String!
    gender: String
    image: String
    jwtToken: String
    googleId: String
    googleAccessToken: String
    googleRefreshToken: String
    googleProfile: String
    facebookId: String
    facebookAccessToken: String
    facebookRefreshToken: String
    facebookProfile: String
    twitterId: String
    twitterAccessToken: String
    twitterRefreshToken: String
    twitterProfile: String
    acl: [String]
    hasSeenTutorial: Boolean
    hasConfirmedEmail: Boolean
    isAdmin: Boolean
    permissions: [String]
    resource: String
  }

  input userInput {
    name: String!
    email: String!
    password: String!
    gender: String
    image: String
  }

  type Query {
    users: [User]
  }

  type Mutations {
    createUser(name: String!): User
    deleteUser(arn: String!): User
    updateUser(user: userInput): User
  }
`;

const resolvers = userModel => {
  return {
    Mutations: {
      createUser: {
        resolve: root => {}
      },
      updateUser: {
        resolve: root => {}
      },
      deleteUser: {
        resolve: root => {}
      }
    },
    Query: {
      users() {
        console.log("being resolved");
        return userModel
          .find({})
          .exec()
          .then(users => {
            console.log(users);
            return users;
          });
      }
    }
  };
};

const userSchema = userModel =>
  makeExecutableSchema({
    typeDefs,
    resolvers: resolvers(userModel)
  });

module.exports = userSchema;
