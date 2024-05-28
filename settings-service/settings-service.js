import express from 'express';
import {  executeDomain  } from '../utils/utils.js';

export const settingsService = function settingsService({
  Model,
  settingsDomainLogic: { read }
}) {
  var apiRoutes = express.Router();

  apiRoutes.get("/settings", function(req, res) {
    let { criteria, isPermitted, onResponse } = executeDomain(req, res, read);
    if (!isPermitted) {
      return res.status(409).send({
        message: `You are not authorized to read ${Model.modelName}s`
      });
    }
    Model.findOne(criteria)
      .sort("-date")
      .exec((err, data) => {
        if (err) {
          console.error(err);
          return res.status(500).send(err);
        }
        onResponse ? onResponse(data, req, res) : res.status(200).send(data);
      });
  });

  return apiRoutes;
};

export const registerSettings = ({ key, fields, settingsModel }) => {
  let lookUpKey = key;
  // clearPermissions(settingsModel);
  setSettings(lookUpKey, fields, settingsModel);
};

const setSettings = (lookUpKey, fields, settingsModel) => {
  settingsModel.update(
    { key: lookUpKey },
    { fields },
    { multi: true, upsert: true },
    (err, user) => {
      if (err) {
        console.error(err);
      }
      console.info("settings set!");
    }
  );
};

const clearSettings = settingsModel => {
  return settingsModel.update({}, { obj: {} }, { multi: true }, (err, user) => {
    if (err) {
      return reject(err);
    }
    console.log("updated!");
  });
};
