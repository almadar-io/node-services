var mongoose = require("mongoose");
var Schema = mongoose.Schema;

// set up a mongoose model
let blogSchema = new Schema({
  title: String,
  body: String,
  status: String,
  gallery: Array,
  image: String,
  isASeed: { type: Boolean, default: false },
  resource: { type: String, default: "blog" }
});
module.exports = mongoose.model("Blog", blogSchema);
