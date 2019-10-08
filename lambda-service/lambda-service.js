const { capitalize } = require("../utils/utils.js");
module.exports.registerLambdaFunction = function registerLambdaFunction({
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
        console.log("lambda set!");
      }
    );
  });
};
