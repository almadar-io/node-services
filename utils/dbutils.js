export const connectToDb = function(MongoDb, config, cb) {
  const dbConnection = MongoDb({
    config,
    onDBInit: data => cb(null, data),
    onError: err => cb("err", err),
    onDisconnect: err => cb("disconnect", err)
  });
  return dbConnection;
};
