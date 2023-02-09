const nodemailer = require("nodemailer");
//const htmlToText = require("html-to-text");
// 1) Create a transporter
module.exports = class Email {
  constructor(req, emailId, password) {
    this.firstname = req.body?.name?.split(" ")[0];
    this.to = req.body.email;
    this.from = password;
    this.otp = req.body.otp;
    this.password = password;
    this.emailId = emailId;
  }
  newTransport() {
    return nodemailer.createTransport({
      // host: process.env.MAILGUN_HOST,
      // PORT: process.env.MAILGUN_PORT,
      service: "gmail",
      host: "smtp.gmail.com",
      secure: "true",
      auth: {
        user: this.emailId,
        pass: this.password,
      },
    });
  }

  async send(subject, template) {
    //console.log(html);
    // 2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html: template,
      //text: htmlToText.fromString(html),
    };

    // 3) Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }
  async sendOTP() {
    await this.send(
      `OTP to verify your account`,
      `Hello ${this.firstname || "User"}, Your otp to login to Bitotsav is:${
        this.otp
      }
      'This otp is valid only for 10 minutes.'

      'Thanks,'
      'BITOTSAV Team. `
    );
  }

  async sendPasswordReset() {
    await this.send(
      "passwordReset",
      "Your password reset token (valid for only 10 minutes)"
    );
  }
};
