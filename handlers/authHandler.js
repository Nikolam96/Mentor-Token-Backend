const jwt = require("jsonwebtoken");
const User = require("../pkg/users/userSchema");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const uuid = require("uuid");

const imageId = uuid.v4();

const multerStorage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "public");
  },
  filename: (req, file, callback) => {
    const ext = file.mimetype.split("/")[1];
    callback(null, `movie-${imageId}-${Date.now()}.${ext}`);
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

exports.uploadMoviePhoto = upload.single("picture");

exports.signup = async (req, res) => {
  if (req.file) {
    req.body.profilePicture = req.file.filename;
  }

  try {
    const startUpName = await User.findOne({
      startUpName: req.body.startUpName,
    });
    if (startUpName) {
      const error = new Error("That Startup Name already exists");
      error.statusCode = 400;
      throw error;
    }

    const newUser = await User.create(req.body);
    const token = jwt.sign(
      {
        id: newUser._id,
        email: newUser.email,
        role: newUser.role,
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
    res.status(500).send(err.message);
  }
};

exports.checkEmail = async (req, res) => {
  try {
    const user = await User.findOne(req.body);
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
      const error = new Error("You dont have access");
      error.statusCode = 500;
      throw error;
    }
    next();
  };
};
