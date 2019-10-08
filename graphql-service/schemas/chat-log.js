var mongoose = require("mongoose");
var Schema = mongoose.Schema;

// set up a mongoose model
//users eventually will replace to, because we might have a group text feature in the future
let chatLogSchema = new Schema({
  translations: Object,
  text: String,
  deleted: { type: Boolean, default: false },
  updated: { type: Boolean, default: false },
  date: { type: Date, default: Date.now() },
  resource: { type: String, default: "chat-log" },
  from: { type: Schema.Types.ObjectId, ref: "User" },
  to: { type: Schema.Types.ObjectId, ref: "User" },
  users: [{ type: Schema.Types.ObjectId, ref: "User" }]
});
// chatLogSchema.plugin(autoIncrement.plugin, {
//   model: "ChatLog",
//   field: "chatId"
// });
module.exports = mongoose.model("ChatLog", chatLogSchema);
