const Application = require("../pkg/application/ApplicationSchema");

exports.createApplication = async (req, res, next) => {
  try {
    console.log(req.body);
    const newApplication = await Application.create(req.body);
    res.status(201).json({
      application: newApplication,
    });
  } catch (err) {
    next(err);
  }
};
