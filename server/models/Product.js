const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema = new Schema({
  type: {
    type: String,
    required: true,
  },
  brand: String,
  model: String,
  color: String,
  description: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  deletedAt: Date,
  reportedItem: {
    type: Schema.Types.ObjectId,
    ref: 'ReportedLost',
  },
});

module.exports = mongoose.model('Product', productSchema);
