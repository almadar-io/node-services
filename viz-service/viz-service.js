import express from 'express';
import {  executeDomain  } from '../utils/utils.js';

const kernelService = function({
  Model,
  domainLogic: { average, min, max, count, distinct, sum, aggregate }
}) {
  var apiRoutes = express.Router();

  //fn is the function we are applying ($sum,$avg,$count)
  const aggregateOverTime = (criteria, period, fn, onResponse) => {
    if (period === "daily") {
      Model.aggregate(
        [
          { $match: { criteria } },
          {
            $group: {
              _id: {
                year: { $year: "$createdAt" },
                month: { $month: "$createdAt" },
                dayOfMonth: { $dayOfMonth: "$createdAt" }
              },
              res: fn
            }
          }
        ],
        onResponse
      );
    } else if (period === "monthly") {
      Model.aggregate(
        [
          { $match: { criteria } },
          {
            $group: {
              _id: {
                year: { $year: "$createdAt" },
                month: { $month: "$createdAt" }
              },
              res: fn
            }
          }
        ],
        onResponse
      );
    } else if (period === "yearly") {
      Model.aggregate(
        [
          { $match: { criteria } },
          {
            $group: {
              _id: {
                year: { $year: "$createdAt" }
              },
              res: fn
            }
          }
        ],
        onResponse
      );
    } else {
      onResponse(
        "period not supported, please choose yearly, monthly or daily for the period"
      );
    }
  };

  apiRoutes.get("/count", function(req, res) {
    let { criteria } = executeDomain(req, res, count);
    Model.count(criteria).exec((err, data) => {
      if (err) {
        console.log(err);
        return res.status(500).send(err);
      }
      res.status(200).send({ count: data });
    });
  });

  //count a field only, let's say you have a sub field ... like comments on a blog, how do you count them?
  apiRoutes.get("/count/:field", function(req, res) {
    const subField = req.params.field;
    Model.aggregate(
      [
        {
          $unwind: `$${subField}`
        },
        {
          $group: {
            _id: `$${subField}`,
            total: {
              $sum: 1
            }
          }
        },
        {
          $sort: {
            total: -1
          }
        }
      ],
      (err, data) => {
        if (err) {
          return res.status(500).send(err);
        }
        return res.send({ res: data });
      }
    );
  });

  apiRoutes.get("/count/time/:period", (req, res) => {
    let { criteria } = executeDomain(req, res, count);
    let { period } = req.params;
    let onResponse = (err, data) => {
      if (err) {
        return res.status(500).send(err);
      }
      return res.send({ res: data });
    };
    aggregateOverTime(criteria, period, { $sum: 1 }, onResponse);
  });

  apiRoutes.get("/count/:field/time/:period", function(req, res) {});

  //get the model with the max of a given field (:field)
  apiRoutes.get("/max/:field", function(req, res) {
    let { criteria } = executeDomain(req, res, max);
    let field = req.params.field;
    Model.find(criteria)
      .sort([[field, -1]])
      .exec((err, data) => {
        if (err) {
          console.log("err", err);
          return res.status(500).send(err);
        }
        res.status(200).send({ max: data[0][`${field}`], data: data[0] });
      });
  });

  apiRoutes.get("/max/:field/time/:period", (req, res) => {
    let { criteria } = executeDomain(req, res, count);
    let { period, field } = req.params;
    let onResponse = (err, data) => {
      if (err) {
        return res.status(500).send(err);
      }
      return res.send({ res: data });
    };
    aggregateOverTime(criteria, period, { $max: `$${field}` }, onResponse);
  });

  apiRoutes.get("/min/:field", function(req, res) {
    let { criteria } = executeDomain(req, res, min);
    let field = req.params.field;
    Model.find(criteria)
      .sort([[field, 1]])
      .exec((err, data) => {
        if (err) {
          console.log(err);
          return res.setStatus(500).send(err);
        }
        res.status(200).send({ min: data[0][`${field}`], data: data[0] });
      });
  });

  apiRoutes.get("/min/:field/time/:period", (req, res) => {
    let { criteria } = executeDomain(req, res, count);
    let { period, field } = req.params;
    let onResponse = (err, data) => {
      if (err) {
        return res.status(500).send(err);
      }
      return res.send({ res: data });
    };
    aggregateOverTime(criteria, period, { $min: `$${field}` }, onResponse);
  });

  apiRoutes.get("/sum/:field", function(req, res) {
    let { criteria } = executeDomain(req, res, sum);
    let field = req.params.field;
    Model.aggregate(
      [
        { $match: { criteria } },
        {
          $group: {
            _id: {},
            sum: { $sum: `$${field}` }
          }
        }
      ],
      (err, data) => {
        if (err) {
          return res.status(500).send(err);
        }
        return res.send({ res: data[0] });
      }
    );
  });

  apiRoutes.get("/sum/:field/time/:period", (req, res) => {
    let { criteria } = executeDomain(req, res, sum);
    let { period, field } = req.params;
    let onResponse = (err, data) => {
      if (err) {
        return res.status(500).send(err);
      }
      return res.send({ res: data });
    };
    aggregateOverTime(criteria, period, { $sum: `$${field}` }, onResponse);
  });

  apiRoutes.get("/average/:field", function(req, res) {
    let { criteria } = executeDomain(req, res, average);
    let field = req.params.field;
    Model.aggregate(
      [
        { $match: { criteria } },
        {
          $group: {
            _id: {},
            average: { $avg: `$${field}` }
          }
        }
      ],
      (err, data) => {
        if (err) {
          return res.status(500).send(err);
        }
        return res.send({ res: data[0] });
      }
    );
  });

  apiRoutes.get("/average/:field/time/:period", (req, res) => {
    let { criteria } = executeDomain(req, res, count);
    let { period, field } = req.params;
    let onResponse = (err, data) => {
      if (err) {
        return res.status(500).send(err);
      }
      return res.send({ res: data });
    };
    aggregateOverTime(criteria, period, { $avg: `$${field}` }, onResponse);
  });

  apiRoutes.get("/distinct/:field", function(req, res) {
    let { criteria } = executeDomain(req, res, distinct);
    let field = req.params.field;
    Model.find(criteria).distinct(field, function(err, data) {
      if (err) {
        return res.status(500).send(err);
      }
      return res.send(data);
    });
  });

  //op is the average, sum ... etc
  //fn is what is inside average
  //field is the field you want to do the aggregation on
  //https://docs.mongodb.com/manual/reference/operator/aggregation/sum/#grp._S_sum
  apiRoutes.get("/aggregate/:op/:fn/:fields", (req, res) => {
    let { criteria } = executeDomain(req, res, aggregate);
    let $group = {};
    let fields;
    try {
      fields = JSON.parse(req.params.fields);
    } catch (err) {
      return res.send(`error parsing your fields, ${err}`);
    }
    let fn = req.params.fn;
    let fnObject = {};
    fnObject[`${fn}`] = `${fields.map(field => `$${field}`)}`;

    let op = req.params.op;

    $group[`${op}`] = fnObject;
    $group["_id"] = {};

    let groupQuery = { $group };

    Model.aggregate([{ $match: { criteria } }, groupQuery], (err, data) => {
      if (err) {
        return res.status(500).send(err);
      }
      return res.send({ res: data[0] });
    });
  });

  return apiRoutes;
};

export default kernelService;
