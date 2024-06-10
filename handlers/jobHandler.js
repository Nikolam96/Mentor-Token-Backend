const Job = require("../pkg/job/jobSchema");

exports.createJob = async (req, res, next) => {
  try {
    console.log(req.body);
    const newJob = await Job.create(req.body);
    res.status(201).json({
      job: newJob,
    });
  } catch (err) {
    next(err);
  }
};
