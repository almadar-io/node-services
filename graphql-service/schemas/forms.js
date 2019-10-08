var mongoose = require("mongoose");
var Schema = mongoose.Schema;

// set up a mongoose model
let formsSchema = new Schema({
  key: String,
  fields: { type: Array, default: [] },
  resource: { type: String, default: "forms" }
});
module.exports = mongoose.model("Forms", formsSchema);
