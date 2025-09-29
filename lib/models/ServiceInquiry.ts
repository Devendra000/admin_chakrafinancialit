import mongoose from "mongoose";

const ServiceInquirySchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    serviceId: {
      type: String,
      required: true,
    },
    serviceName: {
      type: String,
      required: true,
    },
    packageType: {
      type: String,
      required: true,
      enum: ["basic", "standard", "premium"],
    },
    packageName: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "contacted", "completed", "cancelled"],
    },
    isEmailSent: {
      type: Boolean,
      default: false,
    },
    emailSentAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.ServiceInquiry ||
  mongoose.model("ServiceInquiry", ServiceInquirySchema);
