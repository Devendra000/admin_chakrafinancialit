import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
      minlength: [2, "Name must be at least 2 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email address",
      ],
    },
    phone: {
      type: String,
      trim: true,
      validate: {
        validator: function (v: string) {
          // Allow empty phone or validate phone format
          return (
            !v || /^[\+]?[1-9][\d]{0,15}$/.test(v.replace(/[\s\-\(\)]/g, ""))
          );
        },
        message: "Please enter a valid phone number",
      },
    },
    company: {
      type: String,
      trim: true,
      maxlength: [150, "Company name cannot exceed 150 characters"],
    },
    service: {
      type: String,
      enum: {
        values: ["financial", "it-solutions", "both", "consultation", ""],
        message: "Please select a valid service option",
      },
    },
    message: {
      type: String,
      trim: true,
      maxlength: [2000, "Message cannot exceed 2000 characters"],
      default: "", // Allow empty messages
    },
    status: {
      type: String,
      enum: ["new", "read", "replied", "resolved", "archived"],
      default: "new",
    },
    source: {
      type: String,
      default: "contact_form", // Track where the message came from
      enum: ["contact_form", "phone", "email", "chat", "other"],
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin", // Reference to admin who handles this
      default: null,
    },
    response: {
      message: {
        type: String,
        trim: true,
      },
      respondedAt: {
        type: Date,
      },
      respondedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
      },
    },
    notes: [
      {
        note: {
          type: String,
          required: true,
          trim: true,
        },
        addedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Admin",
          required: true,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    // Tracking fields
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    referrer: {
      type: String,
    },
    // Email notification tracking
    admin_email_sent_status: {
      type: String,
      enum: ["pending", "sent", "failed", "skipped"],
      default: "pending",
    },
    admin_email_sent_at: {
      type: Date,
      default: null,
    },
    admin_email_error: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "contacts",
  }
);

// Indexes for better query performance
contactSchema.index({ status: 1, createdAt: -1 });
contactSchema.index({ email: 1 });
contactSchema.index({ service: 1 });
contactSchema.index({ priority: 1, status: 1 });
contactSchema.index({ assignedTo: 1, status: 1 });
contactSchema.index({ createdAt: -1 });

// Virtual for formatted creation date
contactSchema.virtual("formattedDate").get(function () {
  return this.createdAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
});

// Method to add internal notes
contactSchema.methods.addNote = function (note: string, adminId: any) {
  this.notes.push({
    note,
    addedBy: adminId,
    addedAt: new Date(),
  });
  return this.save();
};

// Method to mark as read
contactSchema.methods.markAsRead = function (adminId: any) {
  this.status = "read";
  if (adminId && !this.assignedTo) {
    this.assignedTo = adminId;
  }
  return this.save();
};

// Method to add response
contactSchema.methods.addResponse = function (responseMessage: string, adminId: any) {
  this.response = {
    message: responseMessage,
    respondedAt: new Date(),
    respondedBy: adminId,
  };
  this.status = "replied";
  return this.save();
};

// Method to update admin email status
contactSchema.methods.markAdminEmailSent = function () {
  this.admin_email_sent_status = "sent";
  this.admin_email_sent_at = new Date();
  this.admin_email_error = undefined;
  return this.save();
};

// Method to mark admin email as failed
contactSchema.methods.markAdminEmailFailed = function (errorMessage: string) {
  this.admin_email_sent_status = "failed";
  this.admin_email_error = errorMessage;
  return this.save();
};

// Method to skip admin email
contactSchema.methods.skipAdminEmail = function (reason: string) {
  this.admin_email_sent_status = "skipped";
  this.admin_email_error = reason;
  return this.save();
};

// Pre-save middleware for data processing
contactSchema.pre("save", function (next) {
  // Track if this is a new document
  // @ts-ignore
  this.wasNew = this.isNew;

  // Auto-assign priority based on service type
  // @ts-ignore
  if (this.isNew && !this.priority) {
    // @ts-ignore
    if (this.service === "both") {
      // @ts-ignore
      this.priority = "high";
    } else if (this.service === "consultation") {
      // @ts-ignore
      this.priority = "medium";
    } else {
      // @ts-ignore
      this.priority = "medium";
    }
  }

  // Auto-generate tags based on content
  // @ts-ignore
  if (this.isModified("message") || this.isNew) {
    // @ts-ignore
    const tags: string[] = [];
    // @ts-ignore
    const messageText = this.message ? this.message.toLowerCase() : "";

    // Service-based tags (only if message exists)
    if (
      messageText &&
      (messageText.includes("urgent") ||
        messageText.includes("asap") ||
        messageText.includes("emergency"))
    ) {
      // @ts-ignore
      this.priority = "urgent";
      tags.push("urgent");
    }

    if (
      messageText &&
      (messageText.includes("budget") ||
        messageText.includes("cost") ||
        messageText.includes("price"))
    ) {
      tags.push("pricing");
    }

    if (
      messageText &&
      (messageText.includes("demo") || messageText.includes("presentation"))
    ) {
      tags.push("demo-request");
    }

    if (
      messageText &&
      (messageText.includes("partnership") ||
        messageText.includes("collaborate"))
    ) {
      tags.push("partnership");
    }

    // Add unique tags only
    // @ts-ignore
    this.tags = [...new Set([...(this.tags || []), ...tags])];
  }

  next();
});

// Post-save middleware for automatic email notifications
contactSchema.post("save", async function (doc: any, next: any) {
  // Only send emails for new contacts (not updates)
  // @ts-ignore
  if (this.wasNew && this.admin_email_sent_status === "pending") {
    console.log(
      "🔄 New contact created, triggering automatic email notifications..."
    );

    // Send emails in background without blocking the save operation
    setImmediate(async () => {
      try {
        console.log("📧 Attempting to import email service...");

        // Try multiple import paths for different environments
        let emailService: any;
        try {
          // Try the correct path first
          // @ts-ignore - dynamic import path may not exist during static type check
          emailService = await import("../../lib/email-service");
        } catch (importError) {
          console.log("⚠️ Standard import failed, trying alternative paths...");
          try {
            // Try without .js extension
            // @ts-ignore - dynamic import path may not exist during static type check
            emailService = await import("../../lib/email-service");
          } catch (secondError) {
            console.error("❌ All import attempts failed:", {
              first: String(importError),
              second: String(secondError),
            });
            try {
              await doc.markAdminEmailFailed(
                "Email service import failed in production"
              );
            } catch (_) {
              /* ignore */
            }
            return;
          }
        }

        const { sendAdminNotification, sendAutoReply } = emailService;

        if (!sendAdminNotification || !sendAutoReply) {
          throw new Error("Email functions not found in imported module");
        }

        console.log("✅ Email service imported successfully");

        // Send admin notification
        console.log("📧 Sending admin notification for contact:", doc._id);
        const adminResult = await sendAdminNotification(doc);

        if (adminResult && adminResult.success) {
          await doc.markAdminEmailSent();
          console.log(
            "✅ Admin notification sent successfully for contact:",
            doc._id
          );
        } else {
          await doc.markAdminEmailFailed(adminResult?.error || "Unknown error");
          console.error(
            "❌ Admin notification failed for contact:",
            doc._id,
            adminResult?.error
          );
        }
      } catch (error: any) {
        console.error(
          "💥 Admin email error for contact:",
          doc._id,
          error.message
        );
        console.error("Full error stack:", error.stack);
        try {
          await doc.markAdminEmailFailed(error.message);
        } catch (updateError) {
          console.error("Failed to update email status:", updateError);
        }
      }

      try {
        // Import again for auto-reply (in case it failed above)
        let emailService: any;
        try {
          // @ts-ignore - dynamic import path may not exist during static type check
          emailService = await import("../../lib/email-service");
        } catch (importError) {
          try {
            // @ts-ignore - dynamic import path may not exist during static type check
            emailService = await import("../../lib/email-service");
          } catch (secondError) {
            console.error("❌ Auto-reply email service import failed:", {
              first: String(importError),
              second: String(secondError),
            });
            return;
          }
        }

        const { sendAutoReply } = emailService;

        // Send auto-reply to user
  console.log("📧 Sending auto-reply for contact:", doc._id);
        const userResult = await sendAutoReply(doc);

        if (userResult && userResult.success) {
          console.log("✅ Auto-reply sent successfully for contact:", doc._id);
        } else {
          console.error(
            "❌ Auto-reply failed for contact:",
            doc._id,
            userResult?.error
          );
        }
      } catch (error: any) {
        console.error(
          "💥 Auto-reply error for contact:",
          doc._id,
          error.message
        );
      }
    });
  }

  next();
});

const Contact = mongoose.models.Contact || mongoose.model("Contact", contactSchema);

export default Contact;
