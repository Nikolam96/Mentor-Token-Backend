const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const applicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    mentorId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    companyId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    applicationType: {
      type: String,
      enum: ["mentorToCompany", "companyToMentor"],
    },
    status: {
      type: String,
      default: "pending",
    },
    acceptedStatus: {
      type: String,
      enum: ["done", "rejected", "in progress", "pending"],
      default: "pending",
    },
  },
  { timestamps: true }
);

applicationSchema.plugin(mongoosePaginate);

const Application = mongoose.model("Application", applicationSchema);

module.exports = Application;
