const mongoose = require('mongoose');
const { Schema } = mongoose;

const reportedLostSchema = new Schema({
  message: String,
  keywords: [String],
  lostTime: {
    type: Date,
    default: Date.now,
  },
  reportedBy: {
    type: String,
    required: true,
  },
  reportedAt: {
    type: Date,
    default: Date.now,
  },
  deletedAt: Date,
});

module.exports = mongoose.model('ReportedLost', reportedLostSchema);
