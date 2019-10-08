var mongoose = require("mongoose");
var Schema = mongoose.Schema;

// set up a mongoose model
let eventSchema = new Schema({
  title: String,
  description: String,
  startDate: { type: Date, default: Date.now() },
  startDateTime: { type: Date, default: Date.now() },
  endDate: Date,
  endDateTime: { type: Date, default: Date.now() },
  isRecurring: Boolean,
  recurringRule: Object,
  image: String,
  lat: Number,
  long: Number,
  allDay: { type: Boolean, default: false },
  gallery: Array,
  attendees: [{ type: Schema.Types.ObjectId, ref: "User" }],
  organizer: { type: Schema.Types.ObjectId, ref: "User" },
  isASeed: { type: Boolean, default: false },
  resource: { type: String, default: "events" }
});
module.exports = mongoose.model("Event", eventSchema);
