const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const mongoosePaginate = require("mongoose-paginate-v2");

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
    },
    businessAddress: String,
    inviteMentors: {
      type: String,
      lowercase: true,
    },
    skills: [{ type: String }],
    description: String,
    phone: String,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },

  { timestamps: true }
);

userSchema.plugin(mongoosePaginate);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
