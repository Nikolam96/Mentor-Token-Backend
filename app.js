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
app.use(cors());
app.use(express.static("public"));

// app.use(tokenHandler);

db.init();

app.post("/api/v1/signup", auth.uploadProfilePhoto, auth.signup);
app.post("/api/v1/login", auth.login);
app.post("/api/v1/checkEmail", auth.checkEmail);
app.get("/api/v1/getUsers", auth.getAll);
app.get("/api/v1/getUser/:id", auth.getUser);

app.post("/api/v1/createJob", auth.uploadProfilePhoto, job.createJob);
app.patch("/api/v1/updateJob/:id", auth.uploadProfilePhoto, job.updateJob);
app.get("/api/v1/jobs", job.getOpen);
app.get("/api/v1/jobs/:id", job.getMyJobs);
app.get("/api/v1/getJob/:id", job.getJob);
app.get("/api/v1/getAll", job.getAll);
app.delete("/api/v1/deleteJob/:id", job.deleteJob);

app.post("/api/v1/createApplication", application.createApplication);
app.get("/api/v1/applications/:id", application.getApplications);
app.patch("/api/v1/updateApplication/:id", application.updateApplication);
app.get("/api/v1/applications", application.getAll);
app.get("/api/v1/getUserApplication/:id", application.getUserApplications);
app.get(
  "/api/v1/getUserPendingApplication/:id",
  application.getUserPendingApplications
);
app.get("/api/v1/getTopMentors", application.getTopMentors);
app.get("/api/v1/mentorStats/:id", application.mentorStats);
app.get(
  "/api/v1/getApplicationsByMonth/:id",
  application.getApplicationsByMonth
);

app.delete("/api/v1/deleteApplication/:id", application.deleteApplication);
app.delete("/api/v1/deleteOffer/:id", application.deleteOffer);

app.post("/reset", auth.forgotPassword);
app.post("/resetUrl/:id", auth.resetPassword);
app.post("/api/v1/offerJob", auth.uploadProfilePhoto, job.offerJob);
app.get("/api/v1/searchMentors", auth.searchMentor);

app.use(errorHandler);

app.listen(process.env.PORT, (err) => {
  if (err) {
    return console.log("Could not start service");
  }
  console.log(`Service started successfully on port ${process.env.PORT}`);
});
