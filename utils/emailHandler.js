const nodemailer = require("nodemailer");

const sendMail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_ADRESS,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  transporter.verify((err, succ) => {
    if (err) {
      console.log(err.message);
    } else {
      console.log("Successfully send email");
    }
  });

  const mailOptions = {
    from: "Semos Academy <semos@academy.mk>",
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html || options.message,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendMail;
