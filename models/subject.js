const mongoose = require("mongoose");

const SubjectSchema = new mongoose.Schema({
  name: String,
  totalLectures: Number,
  totalDays: Number
});

module.exports = mongoose.model("Subject", SubjectSchema);
