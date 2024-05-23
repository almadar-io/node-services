const express = require("express");
const { executeDomain } = require("../utils/utils");

const crudService = function ({
  Model,
  crudDomainLogic: { create, read, update, del, search },
}) {
  const apiRoutes = express.Router();

  apiRoutes.get("/", async (req, res) => {
    try {
      let { criteria, isPermitted, populate, onResponse, exclude } =
        executeDomain(req, res, read);
      let query = criteria ? criteria.query : {};
      if (!populate) {
        populate = "";
      }
      if (!isPermitted) {
        return res.status(409).send({
          message: `You are not authorized to read ${Model.modelName}s`,
        });
      }
      let exclusionList = exclude && exclude.map((ex) => `-${ex}`).join(" ");
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
      return res
        .status(500)
        .send({ message: `Database connection error: ${err.message}` });
    }
  });

  apiRoutes.get("/paginate/:page/:limit", async (req, res) => {
    try {
      let { criteria, isPermitted, populate, onResponse, exclude } =
        executeDomain(req, res, read);
      let { query } = criteria;
      let { page, limit } = req.params;
      page = parseInt(page);
      limit = parseInt(limit);
      if (!populate) {
        populate = "";
      }
      if (!isPermitted) {
        return res.status(409).send({
          message: `You are not authorized to read ${Model.modelName}s`,
        });
      }
      let exclusionList = exclude && exclude.map((ex) => `-${ex}`).join(" ");
      const count = await Model.countDocuments(query).exec();
      const data = await Model.paginate(query, {
        page,
        limit,
        select: exclusionList,
        sort: `-createdAt`,
      });

      if (onResponse) {
        onResponse({ data: data.docs, count }, req, res);
      } else {
        res.status(200).send({ data: data.docs, count });
      }
    } catch (err) {
      return res
        .status(500)
        .send({ message: `Database connection error: ${err.message}` });
    }
  });

  apiRoutes.post("/create", async (req, res) => {
    try {
      let { isPermitted, onResponse } = executeDomain(req, res, create);
      let newModel = new Model(req.body.model);

      if (Model.joiValidate) {
        let { error } = Model.joiValidate(newModel);
        if (error) {
          return res.status(409).send({
            message: `Error validating your input ${error}`,
          });
        }
      }

      if (!isPermitted) {
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
      return res
        .status(500)
        .send({ message: `Database connection error: ${err.message}` });
    }
  });

  apiRoutes.put("/", async (req, res) => {
    try {
      let { criteria, isPermitted, onResponse } = executeDomain(
        req,
        res,
        update
      );
      if (!isPermitted) {
        return res.status(409).send({
          message: `You are not authorized to update this ${Model.modelName}`,
        });
      }

      let newModel = Object.assign({}, req.body.model);

      if (Model.joiValidate) {
        let { error } = Model.joiValidate(newModel);
        if (error) {
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
      return res
        .status(500)
        .send({ message: `Database connection error: ${err.message}` });
    }
  });

  apiRoutes.delete("/:_id", async (req, res) => {
    try {
      let requestModelID = req.params._id;
      let { criteria, isPermitted } = executeDomain(req, res, del);
      if (!isPermitted) {
        return res.status(409).send({
          message: `You are not authorized to delete this ${Model.modelName}`,
        });
      }
      await Model.deleteOne({ _id: requestModelID, ...criteria }).exec();
      res.status(200).send();
    } catch (err) {
      return res
        .status(500)
        .send({ message: `Database connection error: ${err.message}` });
    }
  });

  apiRoutes.post("/search", async (req, res) => {
    try {
      let query = req.body.query;
      let { criteria, isPermitted, onResponse } = executeDomain(
        req,
        res,
        search
      );
      if (!isPermitted) {
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
      return res
        .status(500)
        .send({ message: `Database connection error: ${err.message}` });
    }
  });

  return apiRoutes;
};

module.exports = crudService;
