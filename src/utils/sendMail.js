/* eslint-disable no-empty */
import nodemailer from "nodemailer";

const sendEmail = async (toEmail, mailSubj, mailBody) => {
  try {
    let transporter = nodemailer.createTransport({
      host: "mail.soft-shop.app",
      port: 465,
      secure: true,
      auth: {
        user: "nduka@soft-shop.app",
        pass: "2021@Softprism",
      },
    });

    // Verify connection configuration
    transporter.verify((error, success) => {
      if (error) {
        console.log(error.message);
      } else {
        console.log("Server is ready to take our messages");
      }
    });

    // Set mail options
    let mailOptions = {
      from: "\"Nduka from Softshop\" <nduka@soft-shop.app>",
      to: toEmail,
      subject: mailSubj,
      html: mailBody,
    };

    // Send email
    transporter.sendMail(mailOptions, (err, data) => {
      if (err) {
        console.log(err.message);
      } else {
        console.log("Email sent successfully");
      }
    });
  } catch (error) {
    console.log(error);
  }
};

const sendSignUpOTPmail = async (toEmail, otp) => {
  let subject = "OTP For SoftShop Signup";
  let body = otp;

  let sendAction = await sendEmail(toEmail, subject, body);
  if (!sendAction) {
    console.log("signup OTP mail not sent");
  }
};
const sendUserSignUpMail = async (toEmail) => {
  let subject = "Welcome To SoftShop!";
  let body = "Thanks for signing up!";
  let sendAction = await sendEmail(toEmail, subject, body);
  if (!sendAction) {
    console.log("signup mail not sent");
  }
};

const sendPasswordChangeMail = async (toEmail) => {
  let subject = "SoftShop Account Password Change";
  let body = `We noticed a change of password on your account.
  if this change was done by you kindly ignore this mail, otherwise reach out to us to pevent malicious access to your account.`;

  let sendAction = await sendEmail(toEmail, subject, body);
  if (!sendAction) {
    console.log("password change mail not sent");
  }
};

const sendForgotPasswordMail = async (toEmail, otp) => {
  let subject = "SoftShop Account Password Reset";
  let body = `A request to change your password was made, use the code below to proceed.
  ${otp}.
  If you didn't make this request, kindly ignore as no action will be taken further.`;

  let sendAction = await sendEmail(toEmail, subject, body);
  if (!sendAction) {
    console.log("forget password request mail not sent");
  }
};

const sendNewOrderInitiatedMail = async (toEmail, amount, store) => {
  let subject = "New Order Initiated";
  let body = `Your order has been initiated, once we confirm the receipt of ₦${amount} we'll notify ${store} so they can start preparing your order.`;
  let sendAction = await sendEmail(toEmail, subject, body);
  if (!sendAction) {
    console.log("new order initiated mail not sent");
  }
};

export {
  sendEmail,
  sendUserSignUpMail,
  sendSignUpOTPmail,
  sendPasswordChangeMail,
  sendForgotPasswordMail,
  sendNewOrderInitiatedMail
};
