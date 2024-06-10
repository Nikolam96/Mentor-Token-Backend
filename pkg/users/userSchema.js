const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      unique: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    role: {
      type: String,
      enum: ["startup", "mentor"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
    },
    picture: {
      type: String,
      default: "default.img",
    },
    startUpName: {
      type: String,
      unique: true,
      minlength: [3, "Password must be at least 8 characters"],
    },
    businessAddress: String,
    inviteMentors: {
      type: String,
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    acceptedJobs: [
      {
        type: mongoose.Schema.Types.ObjectId,
      },
    ],
    representative: String,
    jobsPosted: [
      {
        type: mongoose.Schema.Types.ObjectId,
      },
    ],
    skills: [{ type: String }],
    description: String,
    phone: Number,
  },

  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
