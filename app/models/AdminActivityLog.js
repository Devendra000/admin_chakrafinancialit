import mongoose from 'mongoose';

const AdminActivityLogSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  action: {
    type: String,
    required: true
  },
  details: {
    type: String,
    required: false
  },
  ipAddress: {
    type: String,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const AdminActivityLog = mongoose.models.AdminActivityLog || mongoose.model('AdminActivityLog', AdminActivityLogSchema);

export default AdminActivityLog;
