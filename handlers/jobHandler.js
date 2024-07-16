const Job = require("../pkg/job/jobSchema");
const Application = require("../pkg/application/ApplicationSchema");

exports.createJob = async (req, res, next) => {
  if (req.file) {
    req.body.jobPicture = req.file.filename;
  }
  const { companyId, title, description } = req.body;

  if (!companyId || !title || !description) {
    const error = new Error("Invalid Data");
    error.statusCode = 400;
    return next(error);
  }

  try {
    const newJob = await Job.create(req.body);
    res.status(201).json({
      status: "success",
      data: {
        job: newJob,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.updateJob = async (req, res, next) => {
  try {
    if (req.file) {
      req.body.jobPicture = req.file.filename;
    }
    const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, {
      runValidators: true,
      new: true,
    });
    if (!updatedJob) {
      const error = new Error("Job not found");
      error.statusCode = 404;
      return next(error);
    }
    res.status(200).json({
      status: "success",
      data: {
        job: updatedJob,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteJob = async (req, res, next) => {
  try {
    const deletedJob = await Job.findByIdAndDelete(req.params.id);

    if (!deletedJob) {
      const error = new Error("Job not found");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      status: "success",
      data: {
        job: deletedJob,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getOpen = async (req, res, next) => {
  try {
    const jobs = await Job.find({ status: "open" });
    res.status(200).json({
      status: "success",
      data: {
        jobs: jobs,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getMyJobs = async (req, res, next) => {
  const companyId = req.params.id;
  const page = parseInt(req.query.page) || 1;
  const status = "open";

  const limit = 6;

  try {
    const options = {
      page: page,
      limit: limit,
      populate: {
        path: "companyId",
        select: "startUpName",
      },
      sort: { createdAt: -1 },
    };

    const result = await Job.paginate(
      { companyId: companyId, status: status },
      options
    );

    res.status(200).json({
      status: "success",
      data: {
        jobs: result.docs,
        pagination: {
          currentPage: result.page,
          totalPages: result.totalPages,
          totalJobs: result.totalDocs,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.offerJob = async (req, res, next) => {
  if (req.file) {
    req.body.jobPicture = req.file.filename;
  }

  const { companyId, title, description, mentorId } = req.body;

  if (!companyId || !title || !description) {
    const error = new Error("Invalid Data");
    error.statusCode = 400;
    return next(error);
  }

  try {
    const newJob = await Job.create({
      companyId: companyId,
      title: title,
      description: description,
      status: "direct",
    });

    const newApplication = await Application.create({
      mentorId: mentorId,
      companyId: companyId,
      jobId: newJob._id,
      status: "pending",
      acceptedStatus: "pending",
      applicationType: req.body.applicationType,
    });
    res.status(201).json({
      status: "success",
      data: {
        job: newJob,
        newApplication: newApplication,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      "companyId",
      "startUpName picture email"
    );

    if (!job) {
      const error = new Error("This Job doesn't exist");
      error.statusCode = 404;
      return next(error);
    }

    res.json({
      data: {
        job,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;

    const limit = req.query.limit || 8;
    const options = {
      page: page,
      limit: limit,
      sort: { createdAt: -1 },
    };

    const jobs = await Job.paginate({}, options);

    if (!jobs) {
      const error = new Error("There are no Jobs currently");
      error.statusCode = 404;
      next(error);
    }

    res.json({
      data: {
        jobs: jobs,
      },
    });
  } catch (err) {
    next(err);
  }
};
