import express from 'express';
var apiRoutes = express.Router();
import i18next from 'i18next';
import i18nextExpress from 'i18next-express-middleware';
import FilesystemBackend from 'i18next-node-fs-backend';

const i18nService = () => {
  //i18n
  i18next
    .use(i18nextExpress.LanguageDetector)
    .use(FilesystemBackend)
    .init({
      preload: ["en", "ar"],
      saveMissing: true,
      backend: {
        loadPath: __dirname + "/locales/{{lng}}/{{ns}}.json",
        addPath: __dirname + "/locales/{{lng}}/{{ns}}.missing.json"
      }
    });

  apiRoutes.use(
    i18nextExpress.handle(i18next, {
      removeLngFromUrl: false
    })
  );
  // missing keys
  apiRoutes.post(
    "/locales/add/:lng/:ns",
    i18nextExpress.missingKeyHandler(i18next)
  );
  // multiload backend route
  apiRoutes.get(
    "/locales/resources.json",
    i18nextExpress.getResourcesHandler(i18next)
  );

  return apiRoutes;
};

export default i18nService;
