import io from 'socket.io';
import express from 'express';
// ---------------------------------------------------------
// get an instance of the router for api routes
// ---------------------------------------------------------
const socketIO = ({
  onEvent,
  onUpdate,
  onDelete,
  onInit,
  channel,
  port,
  server
})=>{
  var apiRoutes = express.Router();
  var ioServer = io(server);
  ioServer.origins((origin, callback) => {
    callback(null, true);
  });
  ioServer.listen(port);
  apiRoutes.get("/", function(req, res) {
    res.send("Hello! this is socket service");
  });
  const namespace = ioServer.of(channel);
  namespace.on("connection", function(socket) {
    ioServer.emit("init", "connected");
    onInit(namespace, socket);
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

export default socketIO;
