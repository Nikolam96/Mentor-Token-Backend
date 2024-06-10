const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const errorHandler = require("./utils/errorHandler");

const db = require("./pkg/db/index");
const auth = require("./handlers/authHandler");
const job = require("./handlers/jobHandler");
const application = require("./handlers/applicationHandler");
const tokenHandler = require("./utils/tokenHandler");
const app = express();

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

db.init();

app.use(cors());
app.use(errorHandler);
// app.use(tokenHandler);

app.post("/api/v1/signup", auth.uploadMoviePhoto, auth.signup);
app.post("/api/v1/login", auth.login);
app.post("/api/v1/checkEmail", auth.checkEmail);

app.post("/api/v1/createJob", job.createJob);

app.post("/api/v1/createApplication", application.createApplication);

app.listen(process.env.PORT, (err) => {
  if (err) {
    return console.log("Could not start service");
  }
  console.log(`Service started successfully on port ${process.env.PORT}`);
});
