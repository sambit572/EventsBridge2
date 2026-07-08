import mongoose from "mongoose";

const posterSchema = new mongoose.Schema(
  {
    posterImageUrl: {
      type: String,
      required: [true, "Poster image URL is required"],
      trim: true,
    },
    cloudinaryPublicId: {
      type: String,
      trim: true,
      default: "",
    },
    offerTitle: {
      type: String,
      required: [true, "Offer title is required"],
      trim: true,
      maxlength: [100, "Offer title cannot exceed 100 characters"],
    },
    offerDescription: {
      type: String,
      trim: true,
      maxlength: [500, "Offer description cannot exceed 500 characters"],
      default: "",
    },
    offerType: {
      type: String,
      trim: true,
      default: "General",
      enum: {
        values: ["General", "Festival Special", "Seasonal Sale", "Flash Sale", "Clearance", "New Year", "Diwali", "Christmas", "Eid", "Holi", "Independence Day", "Republic Day", "Other"],
        message: "{VALUE} is not a valid offer type",
      },
    },
    discountPercentage: {
      type: Number,
      min: [0, "Discount percentage cannot be negative"],
      max: [100, "Discount percentage cannot exceed 100"],
      default: 0,
    },
    offerStartDate: {
      type: Date,
      required: [true, "Offer start date is required"],
    },
    offerEndDate: {
      type: Date,
      required: [true, "Offer end date is required"],
      validate: {
        validator: function (value) {
          return value > this.offerStartDate;
        },
        message: "Offer end date must be after start date",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
posterSchema.index({ isActive: 1, createdAt: -1 });

const Poster =
  mongoose.models.Poster || mongoose.model("Poster", posterSchema);

export default Poster;
