const fs = require("fs");
const path = require("path");

module.exports.executeDomain = (req, res, domainFn) => {
  //returns criteria
  let user = req.decoded;
  if (!user) {
    console.error(
      `${req.url} User doesn't exist in domain execute function make sure you have jwt protected routes and try again.`
    );
  }
  return domainFn(user, req, res);
};

module.exports.parseNumberQuery = obj => {
  Object.keys(obj).map(key => {
    if (parseInt(obj[key] && obj[key] !== 0)) {
      obj[key] = parseInt(obj[key]);
    }
  });
  return obj;
};

module.exports.capitalize = function(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
};
module.exports.readFiles = function(dirname, onFileContent, onError) {
  fs.readdir(path.join(__dirname, dirname), function(err, filenames) {
    if (err) {
      onError(err);
      return;
    }
    filenames.forEach(function(filename) {
      fs.readFile(path.join(__dirname, dirname) + filename, "utf-8", function(
        err,
        content
      ) {
        if (err) {
          onError(err);
          return;
        }
        onFileContent(filename, content);
      });
    });
  });
};

