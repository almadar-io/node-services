import express from 'express';
import {  executeDomain  } from '../utils/utils.js';

export const formsService = function formsService({
  Model,
  formsDomainLogic: { read },
}) {
  var apiRoutes = express.Router();

  apiRoutes.get("/forms", function (req, res) {
    let { criteria, isPermitted, onResponse } = executeDomain(req, res, read);
    if (!isPermitted) {
      return res.status(409).send({
        message: `You are not authorized to read ${Model.modelName}s`,
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

export const registerForms = ({ key, fields, formsModel }) => {
  let lookUpKey = key;
  // clearPermissions(formsModel);
  setForms(lookUpKey, fields, formsModel);
};

const setForms = (lookUpKey, fields, formsModel, autoPopulateDB) => {
  if (autoPopulateDB) {
    formsModel.update(
      { key: lookUpKey },
      { fields },
      { multi: true, upsert: true },
      (err, user) => {
        if (err) {
          console.error(err);
        }
        console.info("forms set!");
      }
    );
  }
};