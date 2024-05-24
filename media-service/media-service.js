import multer from 'multer';
import express from 'express';
import fs from 'fs';
import path from 'path';
import {  executeDomain  } from '../utils/utils.js';
import config from 'config'; // get our config require(file)
const MAX_SIZE = 10 * 1024 * 1024;
const MAX_FILE_COUNT = 30;

const mediaService = ({
  fileName,
  fileExtension,
  subRoute,
  modelName,
  mediaDomainLogic: { saveMedia },
  Model,
  onError
})=>{
  const ip = config.get("server.media");
  let apiRoutes = express.Router();
  let mediaFolder = "./media";

  //check if the folder exists and create it if not
  if (!fs.existsSync(mediaFolder)) {
    fs.mkdirSync(mediaFolder);
  }

  let storage = multer.diskStorage({
    destination: function(req, file, cb) {
      console.log("destination = storage", file);
      cb(null, `${mediaFolder}`);
    },
    filename: function(req, file, cb) {
      let { criteria, isPermitted } = executeDomain(req, null, saveMedia);
      let { query } = criteria;
      let tag = file.originalname;
      cb(null, `${tag}-${query._id}-${fileExtension}`);
    }
  });

  let upload = multer({
    storage: storage,
    limits: { fileSize: MAX_SIZE }
  });

  apiRoutes.use(`/file`, express.static(mediaFolder));

  let mediaRoute = `${subRoute ? subRoute : "/"}media`;
  let galleryRoute = `${subRoute ? subRoute : "/"}gallery`;

  apiRoutes.post(
    mediaRoute,
    upload.single(fileName + fileExtension),
    (req, res) => {
      let { criteria, isPermitted } = executeDomain(req, res, saveMedia);
      let { token } = criteria;
      let mediaFile = `${ip}/${modelName}/file/${req.file.filename}?token=${token}`;
      res.status(200).send(mediaFile);
    }
  );

  //if you upload a batch of file, we make the assumption it's a gallery
  apiRoutes.post(
    galleryRoute,
    upload.array(fileName + fileExtension, MAX_FILE_COUNT),
    (req, res) => {
      let { criteria, isPermitted } = executeDomain(
        req,
        res,
        saveMedia
      );
      let { tag, token, query } = criteria;
      console.log("req.files", req.files.map(file => file.filename));
      let gallery = req.files.map(
        (file, index) =>
          `${ip}/${modelName}/file/${file.filename}?token=${token}`
      );
      res.status(200).send(gallery);
    }
  );

  apiRoutes.put(
    mediaRoute,
    upload.single(fileName + fileExtension),
    (req, res) => {
      let { criteria, isPermitted } = executeDomain(
        req,
        res,
        saveMedia
      );
      let { tag, token, query } = criteria;
      Model.findOne(query).exec((err, data) => {
        if (err) {
        }
        data.image = `${modelName}/file/${req.file.filename}?token=${token}`;
        data.save((err, updatedData) => {
          if (err) {
            return res.status(500).send(err);
          }
          res.status(200).send(data.image);
        });
      });
    }
  );
  apiRoutes.put(
    galleryRoute,
    upload.array(fileName + fileExtension),
    (req, res) => {
      let { criteria, isPermitted } = executeDomain(
        req,
        res,
        saveMedia
      );
      let { tag, token, query } = criteria;
      let gallery = req.files.map(
        (file, index) =>
          `${ip}/${modelName}/file/${file.filename}?token=${token}`
      );
      Model.findOne(query).exec((err, data) => {
        if (err) {
        }
        data.gallery = gallery;
        data.save((err, updatedData) => {
          if (err) {
            return res.status(500).send(err);
          }
          res.status(200).send(gallery);
        });
      });
    }
  );
  apiRoutes.delete(`/remove${mediaRoute}`, (req, res) => {
    let { criteria, isPermitted } = executeDomain(req, res, saveMedia);
    let { tag, token, query } = criteria;
    let { _id, fileName } = query;
    fs.unlink(`${mediaFolder}/${fileName}`, err => {
      if (err) {
        return res.status(500).send(err);
      }
      return res.status(200).send("deleted!");
    });
  });

  return apiRoutes;
};

export default mediaService;
