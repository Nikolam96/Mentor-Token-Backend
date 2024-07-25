const formData = require("form-data");
const Mailgun = require("mailgun.js");
const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_PASS,
});

const sendMailByGun = async (option) => {
  try {
    let mailOption = {
      from: "Mailgun Sandbox <mailgun@sandbox8480f4debe00467ebc7d9d1d85daf2d3.mailgun.org>",
      to: option.email,
      subject: option.subject,
      text: option.message,
    };

    await mg.messages.create(process.env.MAILGUN_HOST, mailOption);
  } catch (error) {
    console.log(error);
  }
};

module.exports = sendMailByGun;
