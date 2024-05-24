import {  capitalize  } from '../utils/utils.js';
export const registerLambdaFunction = function registerLambdaFunction({
  modelname,
  path,
  lambdaModel
}) {
  lambdaModel.remove({}, () => {
    lambdaModel.update(
      { modelname, path: `${path}${capitalize(modelname)}` },
      { users: [] },
      { multi: true, upsert: true },
      (err, user) => {
        if (err) {
          console.error(err);
        }
        console.info("lambda set!");
      }
    );
  });
};
