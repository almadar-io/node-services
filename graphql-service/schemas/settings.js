var mongoose = require("mongoose");
var Schema = mongoose.Schema;

// set up a mongoose model
let settingsSchema = new Schema({
  title: String,
  serverLocation: String,
  image: String,
  gallery: Array,
  type: String,
  isASeed: { type: Boolean, default: false },
  user: { type: Schema.Types.ObjectId, ref: "User" },
  resource: { type: String, default: "settings" }
});
module.exports = mongoose.model("Settings", settingsSchema);
