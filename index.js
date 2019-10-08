const crudService = require("./crud-service/crud-service");
const eventService = require("./event-service/event-service");
const socketService = require("./socket-service/socket-service");
const mediaService = require("./media-service/media-service");
const formsService = require("./forms-service/forms-service");
const googleService = require("./google-service/google-service");
const awsService = require("./aws-service/aws-service");
const aclService = require("./acl-service/acl-service");
const csvService = require("./csv-service/csv-service");
const graphqlService = require("./graphql-service/graphql-service");
const helloService = require("./hello-service/hello-service");
const i18nService = require("./i18n-service/i18n-service");
const jobService = require("./job-service/job-service");
const jwtService = require("./jwt-service/jwt-service");
const lambdaService = require("./lambda-service/lambda-service");
const passportService = require("./passport-service/passport-service");
const pushNotificationService = require("./push-notification-service/push-notification-service");
const stripeService = require("./stripe-service/stripe-service");
const vizService = require("./viz-service/viz-service");
const emailService = require("./email-service/email-service");

const exported = {
  crudService,
  eventService,
  socketService,
  mediaService,
  formsService,
  googleService,
  awsService,
  aclService,
  csvService,
  graphqlService,
  helloService,
  i18nService,
  jobService,
  jwtService,
  lambdaService,
  passportService,
  pushNotificationService,
  stripeService,
  vizService,
  emailService
};

module.exports = exported;
