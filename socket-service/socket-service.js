const io = require("socket.io");
const express = require("express");
// ---------------------------------------------------------
// get an instance of the router for api routes
// ---------------------------------------------------------
module.exports = function socketIO({
  onEvent,
  onUpdate,
  onDelete,
  channel,
  port,
  server
}) {
  var apiRoutes = express.Router();
  var ioServer = io(server);
  ioServer.origins((origin, callback) => {
    callback(null, true);
  });
  ioServer.listen(port);
  apiRoutes.get("/", function(req, res) {
    res.send("Hello! this is socket service");
  });
  ioServer.of(channel).on("connection", function(socket) {
    ioServer.emit("init", "connected");
    socket.on(channel, function(msg) {
      let eventData = msg;
      if (onEvent) {
        onEvent(eventData, ioServer, socket);
      }
    });
    socket.on(`${channel}-update`, function(msg) {
      let eventData = msg;
      if (onUpdate) {
        onUpdate(eventData, ioServer, socket);
      }
    });
    socket.on(`${channel}-delete`, function(msg) {
      let eventData = msg;
      if (onDelete) {
        onDelete(eventData, ioServer, socket);
      }
    });
  });
  return apiRoutes;
};
