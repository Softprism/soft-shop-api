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
const sendUserNewOrderSentMail = async (toEmail, store) => {
  let subject = "Order sent";
  let body = `Your order has been sent to ${store} we'll also notify you when they start preparing your order.`;
  let sendAction = await sendEmail(toEmail, subject, body);
  if (!sendAction) {
    console.log("new order initiated mail not sent");
  }
};

const sendUserNewOrderAcceptedMail = async (toEmail, store) => {
  let subject = "Order Accepted";
  let body = `Your order has been accepted and is being prepared by ${store} we'll also notify you when your order is on the way.`;
  let sendAction = await sendEmail(toEmail, subject, body);
  if (!sendAction) {
    console.log("new order initiated mail not sent");
  }
};

const sendUserNewOrderRejectedMail = async (toEmail, store) => {
  let subject = "Order Rejected";
  let body = `Your order has been rejected by ${store} you can checkout alternative store near you for the same items.`;
  let sendAction = await sendEmail(toEmail, subject, body);
  if (!sendAction) {
    console.log("new order initiated mail not sent");
  }
};

const sendUserOrderReadyMail = async (toEmail) => {
  let subject = "Order is ready";
  let body = "Your order is now ready for delivery, we'll also notify you when your order has been picked up.";
  let sendAction = await sendEmail(toEmail, subject, body);
  if (!sendAction) {
    console.log("new order initiated mail not sent");
  }
};

const sendUserOrderPickedUpMail = async (toEmail, dropoff) => {
  let subject = "Order has been picked up";
  let body = `Your order is now enroute to ${dropoff}, we'll also notify you when he gets to your location.`;
  let sendAction = await sendEmail(toEmail, subject, body);
  if (!sendAction) {
    console.log("new order initiated mail not sent");
  }
};

const sendUserOrderDeliveredMail = async (toEmail, dropoff) => {
  let subject = "Your Order has Arrived";
  let body = `Your order is now at ${dropoff}, our agent will be waiting for your collection.`;
  let sendAction = await sendEmail(toEmail, subject, body);
  if (!sendAction) {
    console.log("new order initiated mail not sent");
  }
};

const sendStoreSignUpMail = async (toEmail) => {
  let subject = "Welcome To SoftShop!";
  let body = "Thanks for signing up!";
  let sendAction = await sendEmail(toEmail, subject, body);
  if (!sendAction) {
    console.log("signup mail not sent");
  }
};

const sendStoreUpdateRequestMail = async (toEmail) => {
  let subject = "Request To Change Sensitive Data";
  let body = "We've received your request to make certain changes to your account, just to be safe, these changes won't be applied yet as we'll need further confirmation from you. Please Reply this mail with your acknowledgement to get started or disconfirmation if you didn't initiate this request. ";
  let sendAction = await sendEmail(toEmail, subject, body);
  if (!sendAction) {
    console.log("signup mail not sent");
  }
};

const sendStoreUpdateRequestApprovalMail = async (toEmail) => {
  let subject = "Request To Change Sensitive Data Approved";
  let body = "We've approved your request to make certain changes to your account. ";
  let sendAction = await sendEmail(toEmail, subject, body);
  if (!sendAction) {
    console.log("signup mail not sent");
  }
};

const sendStoreCreditMail = async (toEmail, amount) => {
  let subject = "Softshop Acccount Credited!";
  let body = `this is to notify you that your softshop balance has been credited with ₦${amount}. `;
  let sendAction = await sendEmail(toEmail, subject, body);
  if (!sendAction) {
    console.log("signup mail not sent");
  }
};

const sendStoreDebitMail = async (toEmail, amount) => {
  let subject = "Softshop Acccount Debited!";
  let body = `this is to notify you that your softshop balance has been debited with ₦${amount}. `;
  let sendAction = await sendEmail(toEmail, subject, body);
  if (!sendAction) {
    console.log("signup mail not sent");
  }
};

const sendStorePayoutRequestMail = async (toEmail, amount) => {
  let subject = "Payout Request";
  let body = `We've received your request to withdraw ₦${amount} from your SoftShop account, just some checks here and there and your funds will be released to you in no time. `;
  let sendAction = await sendEmail(toEmail, subject, body);
  if (!sendAction) {
    console.log("signup mail not sent");
  }
};

const sendStorePayoutApprovalMail = async (toEmail, amount) => {
  let subject = "Payout Request Approved!";
  let body = `We've approved your request to withdraw ₦${amount} from your SoftShop account. `;
  let sendAction = await sendEmail(toEmail, subject, body);
  if (!sendAction) {
    console.log("signup mail not sent");
  }
};

const sendStorePasswordResetRequestMail = async (toEmail) => {
  let subject = "Request To Reset Password";
  let body = "We've received your request to make a sensitive change to your account, in a few moment from now, you'll receive another mail containing instructions on how to get back into your account. ";
  let sendAction = await sendEmail(toEmail, subject, body);
  if (!sendAction) {
    console.log("signup mail not sent");
  }
};

const sendStorePasswordResetConfirmationMail = async (toEmail, randomCode) => {
  let subject = "Reset Password Successful";
  let body = `Your reset password request has been approved, please sign in to your account with <b> ${randomCode} </b> as your password. Reset your password afterwards`;
  let sendAction = await sendEmail(toEmail, subject, body);
  if (!sendAction) {
    console.log("signup mail not sent");
  }
};
export {
  sendEmail,
  sendUserSignUpMail,
  sendSignUpOTPmail,
  sendPasswordChangeMail,
  sendForgotPasswordMail,
  sendNewOrderInitiatedMail,
  sendStoreSignUpMail,
  sendStoreUpdateRequestMail,
  sendStorePayoutRequestMail,
  sendStorePasswordResetRequestMail,
  sendStorePasswordResetConfirmationMail,
  sendStoreUpdateRequestApprovalMail,
  sendStorePayoutApprovalMail,
  sendUserNewOrderAcceptedMail,
  sendUserNewOrderRejectedMail,
  sendUserNewOrderSentMail,
  sendUserOrderReadyMail,
  sendUserOrderPickedUpMail,
  sendUserOrderDeliveredMail,
  sendStoreCreditMail,
  sendStoreDebitMail
};
