const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const membershipSchema = new Schema({
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    communityId: {
      type: Schema.Types.ObjectId,
      ref: 'Community',
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ['owner', 'admin', 'member'],
    },
  }, { autoIndex: false }); // Disable automatic indexing
  
  membershipSchema.index({ userId: 1, communityId: 1 }, { unique: true }); // Create index manually
  
  module.exports = mongoose.model('Membership', membershipSchema);
  