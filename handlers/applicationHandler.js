const Application = require("../pkg/application/ApplicationSchema");
const Job = require("../pkg/job/jobSchema");
const mongoose = require("mongoose");

exports.createApplication = async (req, res, next) => {
  const { jobId, mentorId, applicationType } = req.body;

  if (!jobId || !mentorId || !applicationType) {
    const error = new Error("Invalid Data");
    error.statusCode = 401;
    throw error;
  }
  try {
    const newApplication = await Application.create(req.body);
    res.status(201).json({
      application: newApplication,
    });
  } catch (err) {
    next(err);
  }
};
exports.updateApplication = async (req, res, next) => {
  try {
    const updatedApplication = await Application.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        runValidators: true,
        new: true,
      }
    );

    if (!updatedApplication) {
      const error = new Error("Job not found");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      status: "success",
      data: {
        application: updatedApplication,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteApplication = async (req, res, next) => {
  try {
    const deletedApplication = await Application.findByIdAndDelete(
      req.params.id
    );

    if (!deletedApplication) {
      const error = new Error("Job not found");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      status: "success",
      data: {
        application: deletedApplication,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const application = await Application.find({});
    res.status(200).json({
      status: "success",
      data: {
        application: application,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getApplications = async (req, res, next) => {
  const jobId = req.params.id;
  const page = parseInt(req.query.page) || 1;
  const limit = 2;

  try {
    const options = {
      page: page,
      limit: limit,
      populate: {
        path: "mentorId",
        select: "name createdAt picture",
      },
      sort: { createdAt: -1 },
    };

    const result = await Application.paginate(
      { jobId: jobId, status: "pending", applicationType: "mentorToCompany" },
      options
    );

    if (!result) {
      const error = new Error("This application doesn't exist");
      error.statusCode = 404;
      next(error);
    }

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

exports.getUserApplications = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const userId = req.params.id;

    const limit = req.query.limit || 8;
    const options = {
      page: page,
      limit: limit,
      populate: {
        path: "jobId",
        select: "title",
      },
      sort: { createdAt: -1 },
    };

    const jobs = await Application.paginate(
      { mentorId: userId, acceptedStatus: { $ne: "pending" } },
      options
    );

    if (!jobs) {
      const error = new Error("This User doesn't exist");
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

exports.getUserPendingApplications = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const userId = req.params.id;

    const limit = req.query.limit || 8;
    const options = {
      page: page,
      limit: limit,
      populate: {
        path: "jobId",
        select: "title",
      },
      sort: { createdAt: -1 },
    };

    if (req.query.applicationType) {
      console.log(req.query.applicationType);
      const pending = await Application.paginate(
        {
          mentorId: userId,
          acceptedStatus: "pending",
          applicationType: req.query.applicationType,
        },
        options
      );

      res.json({
        data: {
          pending: pending,
        },
      });
    }

    const pending = await Application.paginate(
      { mentorId: userId, acceptedStatus: "pending" },
      options
    );

    if (!pending) {
      const error = new Error("This User doesn't exist");
      error.statusCode = 404;
      next(error);
    }

    res.json({
      data: {
        pending: pending,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteOffer = async (req, res, next) => {
  try {
    const deletedApplication = await Application.findByIdAndDelete(
      req.params.id
    );

    const deletedJob = await Job.findByIdAndDelete(deletedApplication.jobId);

    if (!deletedApplication) {
      const error = new Error("Job not found");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      status: "success",
      data: {
        application: deletedApplication,
        job: deletedJob,
      },
    });
  } catch (err) {
    next(err);
  }
};
exports.getTopMentors = async (req, res, next) => {
  try {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const topMentors = await Application.aggregate([
      {
        $match: {
          acceptedStatus: "done",
          createdAt: { $gte: oneMonthAgo },
        },
      },
      {
        $group: {
          _id: "$mentorId",
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
      {
        $limit: 3,
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "mentorDetails",
        },
      },
      {
        $unwind: "$mentorDetails",
      },
      {
        $project: {
          mentorId: "$_id",
          count: 1,
          name: "$mentorDetails.name",
          picture: "$mentorDetails.picture",
        },
      },
    ]);

    res.status(200).json({
      status: "success",
      data: {
        topMentors,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getApplicationsByMonth = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const applicationsByMonth = await Application.aggregate([
      {
        $match: {
          mentorId: new mongoose.Types.ObjectId(userId),
          createdAt: { $gte: oneYearAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          count: 1,
        },
      },
    ]);

    const formattedData = new Array(12).fill(0);
    applicationsByMonth.forEach((item) => {
      formattedData[item.month - 1] = item.count;
    });

    res.status(200).json({
      status: "success",
      data: formattedData,
    });
  } catch (err) {
    next(err);
  }
};

exports.mentorStats = async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!id) {
      const error = new Error("User not Found");
      error.statusCode = 404;
      return next(error);
    }

    const totalJobs = await Job.find({});
    const assignedJobs = await Application.find({
      mentorId: id,
      acceptedStatus: { $ne: "pending" },
    });
    const appliedJobs = await Application.find({
      mentorId: id,
      acceptedStatus: "pending",
      applicationType: "mentorToCompany",
    });
    const finishedJobs = await Application.find({
      mentorId: id,
      acceptedStatus: "done",
    });

    res.json({
      data: {
        totalJobs: totalJobs.length,
        assignedJobs: assignedJobs.length,
        appliedJobs: appliedJobs.length,
        finishedJobs: finishedJobs.length,
      },
    });
  } catch (err) {
    next(err);
  }
};
