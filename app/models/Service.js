import mongoose from 'mongoose';

const ServiceSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  subtext: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  highlights: [{
    type: String
  }],
  packages: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.models.Service || mongoose.model('Service', ServiceSchema);
