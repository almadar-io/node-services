var mongoose = require("mongoose");
var Schema = mongoose.Schema;

// set up a mongoose model
let houseSchema = new Schema({
  name: String,
  description: String,
  baths: Number,
  bedrooms: Number,
  size: Number,
  gallery: Array,
  isASeed: { type: Boolean, default: false },
  resource: { type: String, default: "house" }
});
module.exports = mongoose.model("House", houseSchema);
