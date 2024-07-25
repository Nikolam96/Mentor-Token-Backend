const Rating = require("../pkg/rating/ratingSchema");

exports.rateMentor = async (req, res, next) => {
  try {
    const { rating, companyId, mentorId } = req.body;
    const parsedRating = parseInt(rating);

    const existingRating = await Rating.findOne({
      companyId: companyId,
      mentorId: mentorId,
    });

    if (existingRating) {
      existingRating.rating = parsedRating;
      await existingRating.save();
    } else {
      await Rating.create({
        companyId: companyId,
        mentorId: mentorId,
        rating: parsedRating,
      });
    }

    const allRatings = await Rating.find({ mentorId: req.body.mentorId });

    const ratingSum = allRatings.reduce((sum, r) => sum + r.rating, 0);
    const ratingAvg = allRatings.length ? ratingSum / allRatings.length : 0;

    res.json({
      avg: ratingAvg,
      total: allRatings.length,
    });
  } catch (err) {
    next(err);
  }
};

exports.getRating = async (req, res, next) => {
  try {
    const allRatings = await Rating.find({ mentorId: req.body.mentorId });

    const ratingSum = allRatings.reduce((sum, r) => sum + r.rating, 0);
    const ratingAvg = allRatings.length ? ratingSum / allRatings.length : 0;

    res.json({
      avg: ratingAvg,
      total: allRatings.length,
    });
  } catch (err) {
    next(err);
  }
};
