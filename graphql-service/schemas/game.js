var mongoose = require("mongoose");
var Schema = mongoose.Schema;

// set up a mongoose model
let gameSchema = new Schema({
  name: String,
  characterPosition: Object,
  stageX: Object,
  player: { type: Schema.Types.ObjectId, ref: "User" },
  isASeed: { type: Boolean, default: false },
  resource: { type: String, default: "game" }
});
module.exports = mongoose.model("Game", gameSchema);
