const jwt = require("jsonwebtoken");
const User = require("../pkg/users/userSchema");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const uuid = require("uuid");
const crypto = require("crypto");
const sendMailGun = require("../utils/mailGun");
const Application = require("../pkg/application/ApplicationSchema");
const path = require("path");

const imageId = uuid.v4();

const multerStorage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "public/images");
  },
  filename: (req, file, callback) => {
    const ext = file.mimetype.split("/")[1];
    callback(null, `image-${imageId}-${Date.now()}.${ext}`);
  },
});

const multerFilter = (req, file, callback) => {
  if (file.mimetype.startsWith("image")) {
    callback(null, true);
  } else {
    callback(new Error("This file type is not supported"), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadProfilePhoto = upload.single("picture");

exports.signup = async (req, res, next) => {
  if (req.file) {
    req.body.picture = req.file.filename;
  }

  try {
    if (req.body.startUpName) {
      const startUpName = await User.findOne({
        startUpName: req.body.startUpName,
      });
      if (startUpName) {
        const error = new Error("That Startup Name already exists");
        error.statusCode = 400;
        throw error;
      }
    }

    const newUser = await User.create(req.body);
    const token = jwt.sign(
      {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        startUpName: newUser.startUpName,
        picture: newUser.picture,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES,
      }
    );

    res.cookie("jwt", token, {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
      ),
      secure: false,
      httpOnly: true,
    });

    res.status(201).json({
      status: "success",
      data: {
        token,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.checkEmail = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      const error = new Error("That Email already exists");
      error.statusCode = 401;
      throw error;
    }
    res.status(200).json({ status: "success" });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      const error = new Error("Please provide email and password!");
      error.statusCode = 400;
      throw error;
    }
    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      throw error;
    }
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      throw error;
    }
    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        startUpName: user.startUpName,
        picture: user.picture,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES,
      }
    );

    res.cookie("jwt", token, {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
      ),
      secure: false,
      httpOnly: true,
    });

    res.status(200).json({
      data: {
        token,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.restrict = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.auth.role)) {
      const error = new Error("You don't have access");
      error.statusCode = 403;
      next(error);
    } else {
      next();
    }
  };
};

const getOneMonthAgoDate = () => {
  const date = new Date();
  date.setMonth(date.getMonth() - 1);
  return date;
};

exports.getAll = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 5;
  const options = {
    page: page,
    limit: limit,
    sort: { createdAt: -1 },
  };
  const oneMonthAgo = getOneMonthAgoDate();

  const totalAppliedJobs = await Application.countDocuments({
    createdAt: { $gte: oneMonthAgo },
  });
  const totalUsers = await User.countDocuments({
    role: "mentor",
    createdAt: { $gte: oneMonthAgo },
  });

  const finishedJobs = await Application.countDocuments({
    acceptedStatus: "done",
    createdAt: { $gte: oneMonthAgo },
  });
  try {
    const users = await User.paginate({ role: "mentor" }, options);
    res.status(200).json({
      status: "success",
      data: {
        users: users,
        totalJobs: totalAppliedJobs,
        finishedJobs: finishedJobs,
        totalUsers: totalUsers,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      const error = new Error("This user doesn't exist");
      error.statusCode = 404;
      next(error);
    }
    const resetToken = crypto.randomBytes(32).toString("hex");

    user.passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.passwordResetExpires = Date.now() + 30 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/resetPassword/${resetToken}`;

    const message = `If you forgot your password, please use the PATCH request with your new password at this URL: ${resetUrl}`;

    await sendMailGun({
      email: "nikola1696@gmail.com",
      subject: "URGENT!!! Reset password within 30 minutes",
      message: message,
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const token = req.params.token;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) {
      const error = new Error("Token expired");
      error.statusCode = 404;
      next(error);
    }

    user.password = req.body.password;
    user.passwordResetExpires = undefined;
    user.passwordResetToken = undefined;

    await user.save();
    const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES,
    });

    res.cookie("jwt", jwtToken, {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
      ),
      secure: false,
      httpOnly: true,
    });

    res.status(201).json({
      status: "success",
      token: jwtToken,
    });
  } catch (err) {
    next(err);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      const error = new Error("This User doesn't exist");
      error.statusCode = 404;
      next(error);
    }

    res.json({
      data: {
        user: user,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.searchMentor = async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ error: "Query parameter is required" });
    }
    const mentors = await User.find({
      role: "mentor",
      name: new RegExp(query, "i"),
    });

    res.json(mentors);
  } catch (err) {
    next(err);
  }
};
