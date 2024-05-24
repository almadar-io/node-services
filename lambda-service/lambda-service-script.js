import fs from 'fs';
import path from 'path';
import {  connectToDb  } from '../utils/dbutils.js';
import {  getHandler  } from './handler.js';
import {  getServerlessFile  } from './serverless.js';
import {  getPackage  } from './package.js';
import {  getMain  } from './main.js';

function formatServiceFile(file) {
  const lines = file.split("\n");
  return lines.map((line, index) => {});
}

const lambdaService =({
  lambdaModel,
  APP_PATH,
  MODELS_FOLDER,
  MongoDb,
  config
})=>{
  connectToDb(MongoDb, config, (err, data) => {
    //store all the routes that will be part of lambda
    lambdaModel.find({}).exec((err, routes) => {
      //add required handler files
      routes.map(({ path: p, modelname }) => {
        let handler = getHandler(modelname, p);
        let serverless = getServerlessFile(modelname);
        let main = getMain(modelname);
        let pack = getPackage("./services/lambda-service/package.json");
        if (!fs.existsSync(`${APP_PATH}/lambda-service`)) {
          fs.mkdirSync(`${APP_PATH}/lambda-service`);
        }
        if (!fs.existsSync(`${APP_PATH}/lambda-service/${modelname}`)) {
          fs.mkdirSync(`${APP_PATH}/lambda-service/${modelname}`);
        }
        if (!fs.existsSync(`${APP_PATH}/lambda-service/${modelname}/config`)) {
          fs.mkdirSync(`${APP_PATH}/lambda-service/${modelname}/config`);
        }
        //Assemble files
        let service = fs.readFileSync(`${p}/index.js`, "utf8");
        //format service file, remove action calls (registerLambda,registerForms,registerAction)
        // formatServiceFile(service);
        let defaultConfig = fs.readFileSync(`./config/qa.json`, "utf8");
        let babelConfig = fs.readFileSync(`./babel.config.js`, "utf8");
        let babelrc = fs.readFileSync(`./.babelrc`, "utf8");
        let model = fs.readFileSync(
          path.resolve(`${MODELS_FOLDER}`, `${modelname}.js`)
        );
        let permissionsModel = fs.readFileSync(
          path.resolve(`${MODELS_FOLDER}`, `permissions.js`)
        );
        let formsModel = fs.readFileSync(
          path.resolve(`${MODELS_FOLDER}`, `forms.js`)
        );
        //Write files
        fs.writeFileSync(
          `${APP_PATH}/lambda-service/${modelname}/index.js`,
          service
        );
        fs.writeFileSync(
          `${APP_PATH}/lambda-service/${modelname}/${modelname}.js`,
          model
        );
        fs.writeFileSync(
          `${APP_PATH}/lambda-service/${modelname}/permissions.js`,
          permissionsModel
        );
        fs.writeFileSync(
          `${APP_PATH}/lambda-service/${modelname}/forms.js`,
          formsModel
        );
        fs.writeFileSync(
          `${APP_PATH}/lambda-service/${modelname}/main.js`,
          main
        );
        fs.writeFileSync(
          `${APP_PATH}/lambda-service/${modelname}/handler.js`,
          handler
        );
        fs.writeFileSync(
          `${APP_PATH}/lambda-service/${modelname}/package.json`,
          pack
        );
        fs.writeFileSync(
          `${APP_PATH}/lambda-service/${modelname}/serverless.yml`,
          serverless
        );
        fs.writeFileSync(
          `${APP_PATH}/lambda-service/${modelname}/config/default.json`,
          defaultConfig
        );
      });
    });
  });
};

export default lambdaService;
