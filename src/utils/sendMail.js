/* eslint-disable no-empty */
import nodemailer from "nodemailer";
import handlebars from "handlebars";
import path from "path";
import fs from "fs";

const sendEmail = async (toEmail, mailSubj, mailBody, fileName, path, cid) => {
  try {
    let transporter = nodemailer.createTransport({
      host: "mail.soft-shop.app",
      port: 465,
      secure: true,
      auth: {
        user: "nduka@soft-shop.app",
        pass: "2021@Softprism",
      }
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
      attachments: [{
        fileName,
        path,
        cid
      }],
      html: mailBody,
    };

    // Send email
    let sender = await transporter.sendMail(mailOptions);
    return sender;
  } catch (error) {
    throw error;
  }
};

const sendWaitListSignupMail = async (toEmail) => {
  const textWLogo = path.join(__dirname, "../mails/excited.hbs");
  const source = fs.readFileSync(textWLogo, "utf-8").toString();
  // const template = handlebars.compile(source);
  // const replacements = {
  //   first_name
  // };
  // const htmlToSend = template(replacements);
  try {
    let transporter = nodemailer.createTransport({
      host: "mail.soft-shop.app",
      port: 465,
      secure: true,
      auth: {
        user: "nduka@soft-shop.app",
        pass: "2021@Softprism",
      }
    });

    // Verify connection configuration
    transporter.verify((error, success) => {
      if (error) {
        console.log(error.message);
      } else {
        console.log("Server is ready to send waitlist message.");
      }
    });

    // Set mail options
    let mailOptions = {
      from: "\"Nduka from Softshop\" <nduka@soft-shop.app>",
      to: toEmail,
      subject: "Early Access To SoftShop 🎉",
      attachments: [{
        fileName: "logo.png",
        path: `${__dirname}/../mails/logo.png`,
        cid: "logo"
      }],
      html: source,
      headers: {
        priority: "high"
      },
    };

    // Send email
    let sender = await transporter.sendMail(mailOptions);
    return sender;
  } catch (error) {
    throw error;
  }
};

const sendWaitListInvite = async (toEmails) => {
  const textWLogo = path.join(__dirname, "../mails/invitation.hbs");
  const source = fs.readFileSync(textWLogo, "utf-8").toString();
  const template = handlebars.compile(source);
  try {
    let transporter = nodemailer.createTransport({
      host: "mail.soft-shop.app",
      port: 465,
      secure: true,
      auth: {
        user: "nduka@soft-shop.app",
        pass: "2021@Softprism",
      }
    });

    // Verify connection configuration
    transporter.verify((error, success) => {
      if (error) {
        console.log(error.message);
      } else {
        console.log("Server is ready to send waitlist message.");
      }
    });
    // Set mail options
    let mailOptions = {
      from: "\"Nduka from Softshop\" <nduka@soft-shop.app>",
      to: [],
      bcc: toEmails,
      replyTo: "beta@soft-shop.app",
      subject: "Invitation To SoftShop Beta🥳",
      attachments: [
        {
          fileName: "logo.png",
          path: `${__dirname}/../mails/logo.png`,
          cid: "logo"
        },
        {
          fileName: "image.png",
          path: `${__dirname}/../mails/image.png`,
          cid: "image"
        }
      ],
      html: source,
      headers: {
        priority: "high"
      },
    };

    // Send email
    let sender = await transporter.sendMail(mailOptions);
    return sender;
  } catch (error) {
    throw error;
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

const sendUserSignUpMail = async (toEmail, firstName) => {
  const textWLogo = path.join(__dirname, "../mails/thanks.hbs");
  const source = fs.readFileSync(textWLogo, "utf-8").toString();
  const template = handlebars.compile(source);
  const replacements = {
    first_name: firstName
  };
  const htmlToSend = template(replacements);
  let subject = "Welcome To SoftShop 😊 ";
  let fileName = "logo.png";
  let filePath = `${__dirname}/../mails/logo.png`;
  let cid = "logo";

  let sendAction = await sendEmail(toEmail, subject, htmlToSend, fileName, filePath, cid);
  console.log(sendAction);
  if (!sendAction) {
    console.log(`signup mail not sent to ${toEmail}`);
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

const sendNewOrderInitiatedMail = async (orderId, toEmail, amount, store) => {
  let subject = `New Order ${orderId} Initiated`;
  let body = `Your order has been initiated, once we confirm the receipt of ₦${amount} we'll notify ${store} so they can start preparing your order.`;
  let sendAction = await sendEmail(toEmail, subject, body);
  if (!sendAction) {
    console.log("new order initiated mail not sent");
  }
};
const sendUserNewOrderSentMail = async (orderId, toEmail, store) => {
  let subject = `Order ${orderId} sent`;
  let body = `Your order has been sent to ${store} we'll also notify you when they start preparing your order.`;
  let sendAction = await sendEmail(toEmail, subject, body);
  if (!sendAction) {
    console.log("new order initiated mail not sent");
  }
};

const sendUserNewOrderPaymentFailedMail = async (orderId, toEmail) => {
  let subject = `Payment For Order ${orderId} failed`;
  let body = "We noticed that your payment for your order has failed, please contact us if you've made payment and have been debited, else try initiating the order again with another payment method.";
  let sendAction = await sendEmail(toEmail, subject, body);
  if (!sendAction) {
    console.log("new order initiated mail not sent");
  }
};

const sendStoreNewOrderSentMail = async (orderId, toEmail) => {
  let subject = `Order ${orderId} created`;
  let body = "An order has been created for you, please check your order app for more details.";
  let sendAction = await sendEmail(toEmail, subject, body);
  if (!sendAction) {
    console.log("new order initiated mail not sent");
  }
};

const sendUserNewOrderApprovedMail = async (orderId, toEmail, store) => {
  let subject = `Order ${orderId} Confirmed by ${store}`;
  let body = `Your order has been confirmed and is being prepared by ${store} we'll also notify you when your order is on the way.`;
  let sendAction = await sendEmail(toEmail, subject, body);
  if (!sendAction) {
    console.log("new order initiated mail not sent");
  }
};

const sendUserNewOrderRejectedMail = async (orderId, toEmail, store) => {
  let subject = `Order ${orderId} Rejected`;
  let body = `Your order has been rejected by ${store} you can checkout alternative store near you for the same items.`;
  let sendAction = await sendEmail(toEmail, subject, body);
  if (!sendAction) {
    console.log("new order initiated mail not sent");
  }
};

const sendUserOrderReadyMail = async (orderId, toEmail) => {
  let subject = `Order ${orderId} ready for delivery`;
  let body = "Your order is now ready for delivery, we'll also notify you when your order has been picked up.";
  let sendAction = await sendEmail(toEmail, subject, body);
  if (!sendAction) {
    console.log("new order initiated mail not sent");
  }
};

const sendUserOrderAcceptedMail = async (orderId, toEmail, dropoff) => {
  let subject = `Order ${orderId} has been assigned a delivery agent`;
  let body = `Your order has been accepted by a delivery agent. We'll also notify you when the agent is on his way to ${dropoff}`;
  let sendAction = await sendEmail(toEmail, subject, body);
  if (!sendAction) {
    console.log("new order initiated mail not sent");
  }
};

const sendUserOrderPickedUpMail = async (orderId, toEmail, dropoff) => {
  let subject = `Order ${orderId} has been picked up`;
  let body = `Your order is now enroute to ${dropoff}, we'll also notify you when he gets to your location.`;
  let sendAction = await sendEmail(toEmail, subject, body);
  if (!sendAction) {
    console.log("new order initiated mail not sent");
  }
};

const sendUserOrderDeliveredMail = async (orderId, toEmail, dropoff) => {
  let subject = `Your ${orderId} Order has Arrived`;
  let body = `Your order is now at ${dropoff}, our delivery personnel will be waiting for your collection.`;
  let sendAction = await sendEmail(toEmail, subject, body);
  if (!sendAction) {
    console.log("new order initiated mail not sent");
  }
};

const sendUserOrderCompletedMail = async (orderId, toEmail) => {
  let subject = `Your ${orderId} Order is now completed`;
  let body = "Thanks for shopping with us, we hope you enjoyed your experience. Don't forget to rate your experience shopping from the store on our app.";
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

const sendStorePayoutSentMail = async (toEmail, amount) => {
  let subject = "Payout Sent!";
  let body = `₦${amount} has been sent to your account. `;
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
const sendRiderPayoutRequestMail = async (toEmail, amount) => {
  let subject = "Payout Request";
  let body = `We've received your request to withdraw ₦${amount} from your SoftShop account, just some checks here and there and your funds will be released to you in no time. `;
  let sendAction = await sendEmail(toEmail, subject, body);
  if (!sendAction) {
    console.log("signup mail not sent");
  }
};
const sendRiderCreditMail = async (toEmail, amount) => {
  let subject = "Softshop Acccount Credited!";
  let body = `this is to notify you that your softshop balance has been credited with ₦${amount}. `;
  let sendAction = await sendEmail(toEmail, subject, body);
  if (!sendAction) {
    console.log("signup mail not sent");
  }
};
const sendRiderDebitMail = async (toEmail, amount) => {
  let subject = "Softshop Acccount Debited!";
  let body = `this is to notify you that your softshop balance has been debited with ₦${amount}. `;
  let sendAction = await sendEmail(toEmail, subject, body);
  if (!sendAction) {
    console.log("signup mail not sent");
  }
};
export {
  sendWaitListSignupMail,
  sendWaitListInvite,
  sendEmail,
  sendSignUpOTPmail,
  sendPasswordChangeMail,
  sendForgotPasswordMail,
  sendUserSignUpMail,
  sendUserNewOrderApprovedMail,
  sendUserNewOrderRejectedMail,
  sendUserNewOrderSentMail,
  sendStoreNewOrderSentMail,
  sendUserNewOrderPaymentFailedMail,
  sendUserOrderReadyMail,
  sendUserOrderAcceptedMail,
  sendUserOrderPickedUpMail,
  sendUserOrderDeliveredMail,
  sendUserOrderCompletedMail,
  sendNewOrderInitiatedMail,
  sendStoreSignUpMail,
  sendStoreUpdateRequestMail,
  sendStorePayoutRequestMail,
  sendStorePayoutSentMail,
  sendStorePasswordResetRequestMail,
  sendStorePasswordResetConfirmationMail,
  sendStoreUpdateRequestApprovalMail,
  sendStorePayoutApprovalMail,
  sendStoreCreditMail,
  sendStoreDebitMail,
  sendRiderPayoutRequestMail,
  sendRiderCreditMail,
  sendRiderDebitMail
};
