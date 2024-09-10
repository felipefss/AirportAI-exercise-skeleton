const mongoose = require('mongoose');
const { Schema } = mongoose;

const reportedLostSchema = new Schema({
  item: String,
  brand: String,
  model: String,
  color: String,
  // The above may not be needed

  message: String,
  keywords: String,
  lostTime: {
    type: Date,
    default: Date.now,
  },
  reportedBy: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('ReportedLost', reportedLostSchema);
