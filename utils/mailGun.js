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
      from: "Mailgun Sandbox <postmaster@sandbox0e23aa4df8434026b23166dce103eeaa.mailgun.org>",
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
