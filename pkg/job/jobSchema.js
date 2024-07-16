const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const jobSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: String,
    jobPicture: {
      type: String,
      default: "default.img",
    },
    description: String,
    status: {
      type: String,
      enum: ["direct", "open"],
    },
  },
  { timestamps: true }
);

jobSchema.plugin(mongoosePaginate);

const Job = mongoose.model("Job", jobSchema);

module.exports = Job;
