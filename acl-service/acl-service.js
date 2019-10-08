const express = require("express");

/* Zee:
  not very clear what registerAction really registers. 
 */
module.exports.registerAction = ({
  key,
  domainLogic,
  permissionsModel,
  defaultPermission
}) => {
  //update permissions object for all users if it doesn't exist
  Object.keys(domainLogic).map(actionKey => {
    //look for all user permissions
    let lookUpKey = `${key}_${actionKey}`;
    // clearPermissions(permissionsModel);
    setPermissions(permissionsModel, lookUpKey, defaultPermission);
  });
};

const setPermissions = (permissionsModel, lookUpKey) => {
  permissionsModel.update(
    { key: lookUpKey },
    { users: [] },
    { multi: true, upsert: true },
    (err, user) => {
      if (err) {
        console.error(err);
      }
      console.log("permissions set!");
    }
  );
};

const clearPermissions = permissionsModel => {
  return permissionsModel.update(
    {},
    { obj: {} },
    { multi: true },
    (err, user) => {
      if (err) {
        return reject(err);
      }
      console.log("updated!");
    }
  );
};

module.exports.isPermitted = function isPermitted({ key }) {
  return true;
};

module.exports.aclService = function({ permissionsModel }) {
  const apiRoutes = express.Router();
  return apiRoutes;
};
