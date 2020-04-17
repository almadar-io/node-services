const express = require("express");
const { executeDomain } = require("../utils/utils");

//c,r,u,d is domain logic hooks (before creation, read, update or delete);
//params is something we use to attach this resource to (for example, the current user id so we don't return resources for other users)
const crudService = function({
  Model,
  crudDomainLogic: { create, read, update, del, search }
}) {
  var apiRoutes = express.Router();

  apiRoutes.get("/", function(req, res) {
    let {
      criteria,
      isPermitted,
      populate,
      onResponse,
      exclude
    } = executeDomain(req, res, read);
    let { query } = criteria;
    if (!populate) {
      populate = "";
    }
    if (!isPermitted) {
      return res.status(409).send({
        message: `You are not authorized to read ${Model.modelName}s`
      });
    }
    let exclusionList = exclude && exclude.map(ex => `-${ex}`).join(" ");
    console.log(query);
    Model.find(query)
      .sort("-createdAt")
      .populate((Array.isArray(populate) && populate.join(" ")) || "")
      .select(exclusionList)
      .exec((err, data) => {
        if (err) {
          return res.status(500).send(err);
        }
        onResponse ? onResponse({ data: data, count: data.length }, req, res) : res.status(200).send({ data: data, count: data.length });
      });
  });

  apiRoutes.get("/paginate/:page/:limit", (req, res) => {
    let {
      criteria,
      isPermitted,
      populate,
      onResponse,
      exclude
    } = executeDomain(req, res, read);
    let { query } = criteria;
    let { page, limit } = req.params;
    page = parseInt(page);
    limit = parseInt(limit);
    if (!populate) {
      populate = "";
    }
    if (!isPermitted) {
      return res.status(409).send({
        message: `You are not authorized to read ${Model.modelName}s`
      });
    }
    let exclusionList = exclude && exclude.map(ex => `-${ex}`).join(" ");
    Model.count({}, function(err, count) {
      if (err) { return res.status(500).send(err) }
      Model.paginate(
        query, {
          page,
          limit,
          select: exclusionList,
          sort: `-createdAt`
        },
        (err, data) => {
          if (err) {
            return res.status(500).send(err);
          }
          onResponse
            ?
            onResponse({ data: data.docs, count }, req, res) :
            res.status(200).send({ data: data.docs, count });
        }
      );
    })
  });

  apiRoutes.post("/create", function(req, res) {
    let { isPermitted, onResponse } = executeDomain(req, res, create);
    let newModel = new Model(req.body.model);

    if (Model.joiValidate) {
      let { error } = Model.joiValidate(newModel);
      if (error) {
        return res.status(409).send({
          message: `error validating your input ${error}`
        });
      }
    }

    if (!isPermitted) {
      return res.status(409).send({
        message: `You are not authorized to create this ${Model.modelName}`
      });
    }

    newModel.save(err => {
      if (err) {
        return res.status(409).send({ message: err.message });
      }
      onResponse
        ?
        onResponse(newModel, req, res) :
        res.status(200).send(newModel);
    });
  });

  apiRoutes.put("/", (req, res) => {
    //take the consted Model, format it and add it to the Models collection
    let { criteria, isPermitted, onResponse } = executeDomain(req, res, update);
    if (!isPermitted) {
      return res.status(409).send({
        message: `You are not authorized to update this ${Model.modelName}`
      });
    }

    let newModel = Object.assign({}, req.body.model);

    if (Model.joiValidate) {
      let { error } = Model.joiValidate(newModel);
      if (error) {
        return res.status(409).send({
          message: `Error validating your input ${error}`
        });
      }
    }

    Model.findOneAndUpdate({ _id: newModel._id, ...criteria },
      newModel, {
        upsert: false
      },
      function(err, doc) {
        if (err) return res.send(500, { error: err });
        onResponse
          ?
          onResponse(newModel, req, res) :
          res.status(200).send(newModel);
      }
    );
  });

  apiRoutes.delete("/:_id", (req, res) => {
    let requestModelID = req.params._id;
    let { criteria, isPermitted } = executeDomain(req, res, del);
    if (!isPermitted) {
      return res.status(409).send({
        message: `You are not authorized to delete this ${Model.modelName}`
      });
    }
    Model.find({
        _id: requestModelID,
        ...criteria
      })
      .remove()
      .exec(err => {
        if (err) {
          return res.status(500).send(err);
        }
        res.status(200).send();
      });
  });

  apiRoutes.post("/search", (req, res) => {
    let query = req.body.query;
    let { criteria, isPermitted, onResponse } = executeDomain(req, res, search);
    if (!isPermitted) {
      return res.status(409).send({
        message: `You are not authorized to search ${Model.modelName}s`
      });
    }
    Model.find({ ...query, ...criteria }).exec((err, results) => {
      if (err) {
        return res.status(500).send(err);
      }
      return onResponse ?
        onResponse(results, req, res) :
        res.status(200).send(results);
    });
  });

  return apiRoutes;
};

module.exports = crudService;
