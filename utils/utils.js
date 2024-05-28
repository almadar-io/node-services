import fs from 'fs';
import path from 'path';

export const executeDomain = (req, res, domainLogic) => {
  const result = domainLogic(req, res);
  return {
    criteria: result.criteria || {},
    isPermitted: result.isPermitted || false,
    populate: result.populate || '',
    onResponse: result.onResponse || null,
    exclude: result.exclude || [],
  };
}

export const parseNumberQuery = obj => {
  Object.keys(obj).map(key => {
    if (parseInt(obj[key] && obj[key] !== 0)) {
      obj[key] = parseInt(obj[key]);
    }
  });
  return obj;
};

export const capitalize = function(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
};
export const readFiles = function(dirname, onFileContent, onError) {
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
