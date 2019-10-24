const crudService = require("./crud-service/crud-service");
const eventService = require("./event-service/event-service");
const socketService = require("./socket-service/socket-service");
const mediaService = require("./media-service/media-service");
const formsService = require("./forms-service/forms-service");
const aclService = require("./acl-service/acl-service");
const helloService = require("./hello-service/hello-service");
const settingsService = require("./settings-service/settings-service");
const i18nService = require("./i18n-service/i18n-service");
const jobService = require("./job-service/job-service");
const jwtService = require("./jwt-service/jwt-service");
const lambdaService = require("./lambda-service/lambda-service");
const passportService = require("./passport-service/passport-service");
const notificationService = require("./notification-service/notification-service");
const vizService = require("./viz-service/viz-service");
const emailService = require("./email-service/email-service");

const exported = {
  crudService,
  eventService,
  socketService,
  mediaService,
  formsService,
  aclService,
  helloService,
  i18nService,
  jobService,
  jwtService,
  lambdaService,
  passportService,
  vizService,
  emailService,
  notificationService,
  settingsService
};

module.exports = exported;
