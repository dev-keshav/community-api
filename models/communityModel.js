const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const communitySchema = new Schema({
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Membership',
      },
    ],
  }, { autoIndex: false }); // Disable automatic indexing
  
  communitySchema.index({ name: 1 }, { unique: true }); // Create index manually
  
  module.exports = mongoose.model('Community', communitySchema);
  