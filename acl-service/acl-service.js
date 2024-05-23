const express = require("express");

/* Zee:
  not very clear what registerAction really registers. 
 */
module.exports.registerAction = ({
  key,
  domainLogic,
  permissionsModel,
  defaultPermission,
}) => {
  //update permissions object for all users if it doesn't exist
  Object.keys(domainLogic).map((actionKey) => {
    //look for all user permissions
    let lookUpKey = `${key}_${actionKey}`;
    // clearPermissions(permissionsModel);
    setPermissions(permissionsModel, lookUpKey, defaultPermission);
  });
};

const setPermissions = (
  permissionsModel,
  lookUpKey,
  autoPopulateDB = false
) => {
  if (autoPopulateDB) {
    permissionsModel.update(
      { key: lookUpKey },
      { users: [] },
      { multi: true, upsert: true },
      (err, user) => {
        if (err) {
          console.error(err);
        }
        console.info("permissions set!");
      }
    );
  }
};

module.exports.isPermitted = function isPermitted({ key }) {
  return true;
};

module.exports.aclService = function ({ permissionsModel }) {
  const apiRoutes = express.Router();
  return apiRoutes;
};
