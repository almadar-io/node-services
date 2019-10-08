const express = require("express");
var google = require("googleapis");

// ---------------------------------------------------------
// get an instance of the router for api routes
// ---------------------------------------------------------
var apiRoutes = express.Router();

module.exports = function driveApi({ oauth2Client }) {
  var drive = google.drive({
    version: "v2",
    auth: oauth2Client
  });

  apiRoutes.post("/file/list", function(req, res) {
    // '0B9tPYCpuqoIrflBJN01SZEFFcUJLS3FkYTktbXVPOUwyZFh6OGZRSmRnWXFYNGUxQk9iRzA' in parents
    const params = {
      pageSize: 2,
      q:
        "title contains 'Formal' OR title contains 'Social' OR title contains 'Natural' OR title contains 'Career'"
    };

    var retrievePageOfFiles = function(
      request,
      result,
      nextPageToken,
      callback
    ) {
      request
        .then(function(resp) {
          result = result.concat(resp.data.items);
          var nextPageToken = resp.data.nextPageToken;
          // resp.data.items.map(item=>console.log(item.title));
          if (nextPageToken) {
            request = getFiles(nextPageToken);
            retrievePageOfFiles(request, result, nextPageToken, callback);
          } else {
            callback(result);
          }
        })
        .catch(err => {
          res.status(500).send(err);
        });
    };
    function getFiles(nextPageToken) {
      if (nextPageToken) {
        params.pageToken = nextPageToken;
      }
      return new Promise((resolve, reject) => {
        drive.files.list(params, (err, result) => {
          if (err) {
            return reject(err);
          }
          return resolve(result);
        });
      });
    }
    var request = getFiles();
    retrievePageOfFiles(request, [], null, results => {
      res.send(results);
    });
  });

  apiRoutes.post("/file/list/manual", function(req, res) {
    // '0B9tPYCpuqoIrflBJN01SZEFFcUJLS3FkYTktbXVPOUwyZFh6OGZRSmRnWXFYNGUxQk9iRzA' in parents
    let fileName = req.body.fileName;
    const params = {
      q: `title contains '${fileName}.mup'`
    };

    var retrievePageOfFiles = function(
      request,
      result,
      nextPageToken,
      callback
    ) {
      request
        .then(function(resp) {
          result = result.concat(resp.data.items);
          var nextPageToken = resp.data.nextPageToken;
          if (nextPageToken) {
            request = getFiles(nextPageToken);
            retrievePageOfFiles(request, result, nextPageToken, callback);
          } else {
            callback(result);
          }
        })
        .catch(err => {
          res.status(500).send(err);
        });
    };
    function getFiles(nextPageToken) {
      if (nextPageToken) {
        params.nextPageToken = nextPageToken;
      }
      return new Promise((resolve, reject) => {
        drive.files.list(params, (err, result) => {
          if (err) {
            return reject(err);
          }
          return resolve(result);
        });
      });
    }
    var request = getFiles();
    retrievePageOfFiles(request, [], null, results => {
      res.send(results);
    });
  });

  apiRoutes.post("/file/download", (req, res) => {
    var fileId = req.body.file_id;
    const params = {
      fileId: fileId,
      alt: "media"
    };
    drive.files.get(params, (err, result) => {
      res.send(result.data);
    });
  });

  return apiRoutes;
};
