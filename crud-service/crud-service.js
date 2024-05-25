import express from "express";
import { executeDomain } from "../utils/utils.js";

const crudService = function ({
  Model,
  crudDomainLogic: { create, read, update, del, search },
}) {
  const apiRoutes = express.Router();

  apiRoutes.get("/", async (req, res) => {
    try {
      const { criteria, isPermitted, populate, onResponse, exclude } =
        executeDomain(req, res, read);
      const query = criteria ? criteria.query : {};
      if (!isPermitted) {
        return res.status(409).send({
          message: `You are not authorized to read ${Model.modelName}s`,
        });
      }
      const exclusionList = exclude
        ? exclude.map((ex) => `-${ex}`).join(" ")
        : "";
      const data = await Model.find(query)
        .sort("-createdAt")
        .populate(Array.isArray(populate) ? populate.join(" ") : "")
        .select(exclusionList)
        .exec();

      if (onResponse) {
        onResponse({ data, count: data.length }, req, res);
      } else {
        res.status(200).send({ data, count: data.length });
      }
    } catch (err) {
      console.error(`Error occurred in GET /api: ${err.message}`);
      res
        .status(500)
        .send({ message: `Database connection error: ${err.message}` });
    }
  });

  apiRoutes.get("/paginate/:page/:limit", async (req, res) => {
    try {
      const { criteria, isPermitted, populate, onResponse, exclude } =
        executeDomain(req, res, read);
      const { query } = criteria;
      const { page, limit } = req.params;
      if (!isPermitted) {
        return res.status(409).send({
          message: `You are not authorized to read ${Model.modelName}s`,
        });
      }
      const exclusionList = exclude
        ? exclude.map((ex) => `-${ex}`).join(" ")
        : "";
      const count = await Model.countDocuments(query).exec();
      const data = await Model.paginate(query, {
        page: parseInt(page),
        limit: parseInt(limit),
        select: exclusionList,
        sort: "-createdAt",
      });

      if (onResponse) {
        onResponse({ data: data.docs, count }, req, res);
      } else {
        res.status(200).send({ data: data.docs, count });
      }
    } catch (err) {
      console.error(
        `Error occurred in GET /api/paginate/:page/:limit: ${err.message}`
      );
      res
        .status(500)
        .send({ message: `Database connection error: ${err.message}` });
    }
  });

  apiRoutes.post("/create", async (req, res) => {
    try {
      const { isPermitted, onResponse } = executeDomain(req, res, create);
      const newModel = new Model(req.body.model);

      if (Model.joiValidate) {
        const validation = Model.joiValidate(newModel) || {};
        const { error } = validation;
        if (error) {
          console.warn(`Error validating your input: ${error}`);
          return res.status(409).send({
            message: `Error validating your input: ${error}`,
          });
        }
      }

      if (!isPermitted) {
        console.warn(
          `You are not authorized to create this ${Model.modelName}`
        );
        return res.status(409).send({
          message: `You are not authorized to create this ${Model.modelName}`,
        });
      }

      await newModel.save();

      if (onResponse) {
        onResponse(newModel, req, res);
      } else {
        res.status(200).send(newModel);
      }
    } catch (err) {
      console.error(`Error occurred in POST /api/create: ${err.message}`);
      res.status(500).send({ message: `Database connection error: ${err.message}` });
    }
  });

  apiRoutes.put("/", async (req, res) => {
    try {
      const { criteria, isPermitted, onResponse } = executeDomain(
        req,
        res,
        update
      );
      if (!isPermitted) {
        console.warn(`You are not authorized to update this ${Model.modelName}`);
        return res.status(409).send({
          message: `You are not authorized to update this ${Model.modelName}`,
        });
      }

      const newModel = Object.assign({}, req.body.model);

      if (Model.joiValidate) {
        const { error } = Model.joiValidate(newModel);
        if (error) {
          console.warn(`Error validating your input ${error}`);
          return res.status(409).send({
            message: `Error validating your input ${error}`,
          });
        }
      }

      const updatedModel = await Model.findOneAndUpdate(
        { _id: newModel._id, ...criteria },
        newModel,
        { new: true, upsert: false }
      ).exec();

      if (onResponse) {
        onResponse(updatedModel, req, res);
      } else {
        res.status(200).send(updatedModel);
      }
    } catch (err) {
      console.error(`Error occurred in PUT /api: ${err.message}`);
      res
        .status(500)
        .send({ message: `Database connection error: ${err.message}` });
    }
  });

  apiRoutes.delete("/:_id", async (req, res) => {
    try {
      const requestModelID = req.params._id;
      const { criteria, isPermitted } = executeDomain(req, res, del);
      if (!isPermitted) {
        console.warn(
          `You are not authorized to delete this ${Model.modelName}`
        );
        return res.status(409).send({
          message: `You are not authorized to delete this ${Model.modelName}`,
        });
      }
      await Model.deleteOne({ _id: requestModelID, ...criteria }).exec();
      res.status(200).send();
    } catch (err) {
      console.error(`Error occurred in DELETE /api/:_id: ${err.message}`);
      res
        .status(500)
        .send({ message: `Database connection error: ${err.message}` });
    }
  });

  apiRoutes.post("/search", async (req, res) => {
    try {
      const query = req.body.query;
      const { criteria, isPermitted, onResponse } = executeDomain(
        req,
        res,
        search
      );
      if (!isPermitted) {
        console.warn(`You are not authorized to search ${Model.modelName}s`);
        return res.status(409).send({
          message: `You are not authorized to search ${Model.modelName}s`,
        });
      }
      const results = await Model.find({ ...query, ...criteria }).exec();
      if (onResponse) {
        onResponse(results, req, res);
      } else {
        res.status(200).send(results);
      }
    } catch (err) {
      console.error(`Error occurred in POST /api/search: ${err.message}`);
      res
        .status(500)
        .send({ message: `Database connection error: ${err.message}` });
    }
  });

  return apiRoutes;
};

export default crudService;
