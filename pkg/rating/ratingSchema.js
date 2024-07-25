const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
  },
  mentorId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
});

const Rating = mongoose.model("Rating", ratingSchema);

module.exports = Rating;
