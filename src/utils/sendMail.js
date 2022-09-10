/* eslint-disable no-empty */
import nodemailer from "nodemailer";
import handlebars from "handlebars";
import path from "path";
import fs from "fs";

let startTime = performance.now(); // Run at the beginning of the code
function executingAt() {
  return (performance.now() - startTime) / 1000;
}
const sendEmail = async (toEmail, mailSubj, mailBody, fileName, path, cid) => {
  try {
    console.log(`Starting email send at ${executingAt()}`);
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
      from: "\"Nduka from SoftShop\" <nduka@soft-shop.app>",
      to: toEmail,
      // bcc: "logs@soft-shop.app",
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
    console.log(`ending email send at ${executingAt()}`);
    return sender;
  } catch (error) {
    throw error;
  }
};

const sendPlainEmail = async (toEmail, mailSubj, mailBody) => {
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
      from: "\"Logs from SoftShop\" <nduka@soft-shop.app>",
      to: toEmail,
      subject: mailSubj,
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
  // get path to email template
  const textWLogo = path.join(__dirname, "../mails/excited.hbs");

  // read template
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
      from: "\"Nduka from SoftShop\" <nduka@soft-shop.app>",
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
      from: "\"Nduka from SoftShop\" <nduka@soft-shop.app>",
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
  const textWLogo = path.join(__dirname, "../mails/signup-otp.hbs");
  const source = fs.readFileSync(textWLogo, "utf-8").toString();
  const template = handlebars.compile(source);
  const replacements = {
    otp
  };
  const htmlToSend = template(replacements);
  let subject = "OTP For SoftShop Signup";
  let fileName = "logo.png";
  let filePath = `${__dirname}/../mails/logo.png`;
  let cid = "logo";

  let sendAction = await sendEmail(toEmail, subject, htmlToSend, fileName, filePath, cid);
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
  const textWLogo = path.join(__dirname, "../mails/password-change.hbs");
  const source = fs.readFileSync(textWLogo, "utf-8").toString();

  let subject = "SoftShop Account Password Change";
  let fileName = "logo.png";
  let filePath = `${__dirname}/../mails/logo.png`;
  let cid = "logo";

  let sendAction = await sendEmail(toEmail, subject, source, fileName, filePath, cid);
  if (!sendAction) {
    console.log("password change mail not sent");
  }
};

const sendForgotPasswordMail = async (toEmail, otp) => {
  const textWLogo = path.join(__dirname, "../mails/forgot-password.hbs");
  const source = fs.readFileSync(textWLogo, "utf-8").toString();
  const template = handlebars.compile(source);
  const replacements = {
    otp
  };
  const htmlToSend = template(replacements);
  let subject = "SoftShop Account Password Reset";
  let fileName = "logo.png";
  let filePath = `${__dirname}/../mails/logo.png`;
  let cid = "logo";

  let sendAction = await sendEmail(toEmail, subject, htmlToSend, fileName, filePath, cid);
  if (!sendAction) {
    console.log("forget password request mail not sent");
  }
};

const sendNewOrderInitiatedMail = async (orderId, toEmail, amount, store) => {
  const textWLogo = path.join(__dirname, "../mails/new-order-initiated.hbs");
  const source = fs.readFileSync(textWLogo, "utf-8").toString();
  const template = handlebars.compile(source);
  const replacements = {
    amount,
    store
  };
  const htmlToSend = template(replacements);

  let subject = `New Order ${orderId} Initiated`;
  let fileName = "logo.png";
  let filePath = `${__dirname}/../mails/logo.png`;
  let cid = "logo";

  let sendAction = await sendEmail(toEmail, subject, htmlToSend, fileName, filePath, cid);
  if (!sendAction) {
    console.log("new order initiated mail not sent");
  }
};
const sendUserNewOrderSentMail = async (orderId, toEmail, store) => {
  const textWLogo = path.join(__dirname, "../mails/user-new-order-sent.hbs");
  const source = fs.readFileSync(textWLogo, "utf-8").toString();
  const template = handlebars.compile(source);
  const replacements = {
    store
  };
  const htmlToSend = template(replacements);

  let subject = `Order ${orderId} sent`;
  let fileName = "logo.png";
  let filePath = `${__dirname}/../mails/logo.png`;
  let cid = "logo";
  let sendAction = await sendEmail(toEmail, subject, htmlToSend, fileName, filePath, cid);
  if (!sendAction) {
    console.log("new order initiated mail not sent");
  }
};

const sendUserNewOrderPaymentFailedMail = async (orderId, toEmail) => {
  const textWLogo = path.join(__dirname, "../mails/user-new-order-payment-failed.hbs");
  const source = fs.readFileSync(textWLogo, "utf-8").toString();
  const template = handlebars.compile(source);
  const replacements = {};
  const htmlToSend = template(replacements);

  let subject = `Payment For Order ${orderId} failed`;
  let fileName = "logo.png";
  let filePath = `${__dirname}/../mails/logo.png`;
  let cid = "logo";
  let sendAction = await sendEmail(toEmail, subject, htmlToSend, fileName, filePath, cid);
  if (!sendAction) {
    console.log("new order initiated mail not sent");
  }
};

const sendStoreNewOrderSentMail = async (orderId, toEmail) => {
  const textWLogo = path.join(__dirname, "../mails/store-new-order-sent.hbs");
  const source = fs.readFileSync(textWLogo, "utf-8").toString();
  const template = handlebars.compile(source);
  const replacements = {};
  const htmlToSend = template(replacements);

  let subject = `You have a new order -  ${orderId}`;
  let fileName = "logo.png";
  let filePath = `${__dirname}/../mails/logo.png`;
  let cid = "logo";
  let sendAction = await sendEmail(toEmail, subject, htmlToSend, fileName, filePath, cid);

  if (!sendAction) {
    console.log("new order initiated mail not sent");
  }
};

const sendUserNewOrderApprovedMail = async (orderId, toEmail, store) => {
  // not in use
  const textWLogo = path.join(__dirname, "../mails/user-new-order-approved.hbs");
  const source = fs.readFileSync(textWLogo, "utf-8").toString();
  const template = handlebars.compile(source);
  const replacements = {
    store
  };
  let subject = `Order ${orderId} Confirmed by ${store}`;
  let body = `Your order has been confirmed and is being prepared by ${store} we'll also notify you when your order is on the way.`;
  let sendAction = await sendEmail(toEmail, subject, body);
  if (!sendAction) {
    console.log("new order initiated mail not sent");
  }
};

const sendUserNewOrderRejectedMail = async (orderId, toEmail, store) => {
  const textWLogo = path.join(__dirname, "../mails/user-new-order-rejected.hbs");
  const source = fs.readFileSync(textWLogo, "utf-8").toString();
  const template = handlebars.compile(source);
  const replacements = {
    store,
    orderId
  };
  const htmlToSend = template(replacements);

  let subject = `Order ${orderId} Rejected`;
  let fileName = "logo.png";
  let filePath = `${__dirname}/../mails/logo.png`;
  let cid = "logo";

  let sendAction = await sendEmail(toEmail, subject, htmlToSend, fileName, filePath, cid);
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
  const textWLogo = path.join(__dirname, "../mails/user-order-completed.hbs");
  const source = fs.readFileSync(textWLogo, "utf-8").toString();
  const template = handlebars.compile(source);
  const replacements = {};
  const htmlToSend = template(replacements);

  let subject = `Your ${orderId} Order is now completed 😌`;
  let fileName = "logo.png";
  let filePath = `${__dirname}/../mails/logo.png`;
  let cid = "logo";
  let sendAction = await sendEmail(toEmail, subject, htmlToSend, fileName, filePath, cid);
  if (!sendAction) {
    console.log("new order initiated mail not sent");
  }
};

const sendStoreSignUpMail = async (toEmail, store_name) => {
  const textWLogo = path.join(__dirname, "../mails/store-signup.hbs");
  const source = fs.readFileSync(textWLogo, "utf-8").toString();
  const template = handlebars.compile(source);
  const replacements = { store_name };
  const htmlToSend = template(replacements);

  let subject = "Welcome To SoftShop!";
  let fileName = "logo.png";
  let filePath = `${__dirname}/../mails/logo.png`;
  let cid = "logo";
  let sendAction = await sendEmail(toEmail, subject, htmlToSend, fileName, filePath, cid);
  if (!sendAction) {
    console.log("signup mail not sent");
  }
};

const sendStoreSignUpFollowUpMail = async ({ owner_email, owner_name }) => {
  const textWLogo = path.join(__dirname, "../mails/store-signup-follow-up.hbs");
  const source = fs.readFileSync(textWLogo, "utf-8").toString();
  const template = handlebars.compile(source);
  const replacements = {
    owner_name
  };
  const htmlToSend = template(replacements);

  let subject = "Welcome to SoftShop. Are you ready to step up?";
  let fileName = "logo.png";
  let filePath = `${__dirname}/../mails/logo.png`;
  let cid = "logo";
  let sendAction = await sendEmail(owner_email, subject, htmlToSend, fileName, filePath, cid);
  if (!sendAction) {
    console.log("signup follow up mail not sent");
  }
};

const sendStoreUpdateRequestMail = async (toEmail) => {
  const textWLogo = path.join(__dirname, "../mails/store-update-request.hbs");
  const source = fs.readFileSync(textWLogo, "utf-8").toString();
  const template = handlebars.compile(source);
  const replacements = {};
  const htmlToSend = template(replacements);

  let subject = "Request To Change Sensitive Data";
  let fileName = "logo.png";
  let filePath = `${__dirname}/../mails/logo.png`;
  let cid = "logo";
  let sendAction = await sendEmail(toEmail, subject, htmlToSend, fileName, filePath, cid);
  if (!sendAction) {
    console.log("signup mail not sent");
  }
};

const sendStoreUpdateRequestApprovalMail = async (toEmail) => {
  const textWLogo = path.join(__dirname, "../mails/store-update-request-approved.hbs");
  const source = fs.readFileSync(textWLogo, "utf-8").toString();
  const template = handlebars.compile(source);
  const replacements = {};
  const htmlToSend = template(replacements);

  let subject = "Request To Change Sensitive Data Approved";
  let fileName = "logo.png";
  let filePath = `${__dirname}/../mails/logo.png`;
  let cid = "logo";
  let sendAction = await sendEmail(toEmail, subject, htmlToSend, fileName, filePath, cid);
  if (!sendAction) {
    console.log("signup mail not sent");
  }
};

const sendStoreCreditMail = async (toEmail, amount) => {
  const textWLogo = path.join(__dirname, "../mails/store-credit.hbs");
  const source = fs.readFileSync(textWLogo, "utf-8").toString();
  const template = handlebars.compile(source);
  const replacements = {
    amount
  };
  const htmlToSend = template(replacements);

  let subject = "Softshop Acccount Credited!";
  let fileName = "logo.png";
  let filePath = `${__dirname}/../mails/logo.png`;
  let cid = "logo";
  let sendAction = await sendEmail(toEmail, subject, htmlToSend, fileName, filePath, cid);

  if (!sendAction) {
    console.log("signup mail not sent");
  }
};

const sendStoreDebitMail = async (toEmail, amount) => {
  const textWLogo = path.join(__dirname, "../mails/store-debit.hbs");
  const source = fs.readFileSync(textWLogo, "utf-8").toString();
  const template = handlebars.compile(source);
  const replacements = {
    amount
  };
  const htmlToSend = template(replacements);

  let subject = "Softshop Acccount Debited!";
  let fileName = "logo.png";
  let filePath = `${__dirname}/../mails/logo.png`;
  let cid = "logo";
  let sendAction = await sendEmail(toEmail, subject, htmlToSend, fileName, filePath, cid);

  if (!sendAction) {
    console.log("signup mail not sent");
  }
};

const sendStorePayoutRequestMail = async (toEmail, amount) => {
  const textWLogo = path.join(__dirname, "../mails/store-payout-request.hbs");
  const source = fs.readFileSync(textWLogo, "utf-8").toString();
  const template = handlebars.compile(source);
  const replacements = {
    amount
  };
  const htmlToSend = template(replacements);

  let subject = "Payout Request";
  let fileName = "logo.png";
  let filePath = `${__dirname}/../mails/logo.png`;
  let cid = "logo";
  let sendAction = await sendEmail(toEmail, subject, htmlToSend, fileName, filePath, cid);
  if (!sendAction) {
    console.log("signup mail not sent");
  }
};

const sendStorePayoutApprovalMail = async (toEmail, amount) => {
  const textWLogo = path.join(__dirname, "../mails/store-payout-approved.hbs");
  const source = fs.readFileSync(textWLogo, "utf-8").toString();
  const template = handlebars.compile(source);
  const replacements = {
    amount
  };
  const htmlToSend = template(replacements);

  let subject = "Payout Request Approved!";
  let fileName = "logo.png";
  let filePath = `${__dirname}/../mails/logo.png`;
  let cid = "logo";
  let sendAction = await sendEmail(toEmail, subject, htmlToSend, fileName, filePath, cid);

  if (!sendAction) {
    console.log("signup mail not sent");
  }
};

const sendStorePayoutSentMail = async (toEmail, amount) => {
  const textWLogo = path.join(__dirname, "../mails/store-payout-sent.hbs");
  const source = fs.readFileSync(textWLogo, "utf-8").toString();
  const template = handlebars.compile(source);
  const replacements = {
    amount
  };
  const htmlToSend = template(replacements);

  let subject = "Payout Sent!";
  let fileName = "logo.png";
  let filePath = `${__dirname}/../mails/logo.png`;
  let cid = "logo";
  let sendAction = await sendEmail(toEmail, subject, htmlToSend, fileName, filePath, cid);

  if (!sendAction) {
    console.log("signup mail not sent");
  }
};

const sendStorePasswordResetRequestMail = async (toEmail) => {
  const textWLogo = path.join(__dirname, "../mails/store-password-reset-request.hbs");
  const source = fs.readFileSync(textWLogo, "utf-8").toString();
  const template = handlebars.compile(source);
  const replacements = {};
  const htmlToSend = template(replacements);

  let subject = "Request To Reset Password";
  let fileName = "logo.png";
  let filePath = `${__dirname}/../mails/logo.png`;
  let cid = "logo";
  let sendAction = await sendEmail(toEmail, subject, htmlToSend, fileName, filePath, cid);

  if (!sendAction) {
    console.log("signup mail not sent");
  }
};

const sendStorePasswordResetConfirmationMail = async (toEmail, randomCode) => {
  const textWLogo = path.join(__dirname, "../mails/store-password-reset-confirmation.hbs");
  const source = fs.readFileSync(textWLogo, "utf-8").toString();
  const template = handlebars.compile(source);
  const replacements = {
    randomCode
  };
  const htmlToSend = template(replacements);

  let subject = "Reset Password Successful";
  let fileName = "logo.png";
  let filePath = `${__dirname}/../mails/logo.png`;
  let cid = "logo";
  let sendAction = await sendEmail(toEmail, subject, htmlToSend, fileName, filePath, cid);
  if (!sendAction) {
    console.log("signup mail not sent");
  }
};
const sendRiderSignupMail = async (toEmail, companyName) => {
  const textWLogo = path.join(__dirname, "../mails/rider-signup.hbs");
  const source = fs.readFileSync(textWLogo, "utf-8").toString();
  const template = handlebars.compile(source);
  const replacements = {
    companyName
  };
  const htmlToSend = template(replacements);
  let subject = "Welcome To SoftShop!";
  let fileName = "logo.png";
  let filePath = `${__dirname}/../mails/logo.png`;
  let cid = "logo";
  let sendAction = await sendEmail(toEmail, subject, htmlToSend, fileName, filePath, cid);

  if (!sendAction) {
    console.log("signup mail not sent");
  }
};

const sendRiderPayoutRequestMail = async (toEmail, amount) => {
  const textWLogo = path.join(__dirname, "../mails/rider-payout-request.hbs");
  const source = fs.readFileSync(textWLogo, "utf-8").toString();
  const template = handlebars.compile(source);
  const replacements = {
    amount
  };
  const htmlToSend = template(replacements);

  let subject = "Payout Request";
  let fileName = "logo.png";
  let filePath = `${__dirname}/../mails/logo.png`;
  let cid = "logo";
  let sendAction = await sendEmail(toEmail, subject, htmlToSend, fileName, filePath, cid);

  if (!sendAction) {
    console.log("signup mail not sent");
  }
};
const sendRiderCreditMail = async (toEmail, amount) => {
  let textWLogo = path.join(__dirname, "../mails/rider-credit.hbs");
  const source = fs.readFileSync(textWLogo, "utf-8").toString();
  const template = handlebars.compile(source);
  const replacements = {
    amount
  };
  const htmlToSend = template(replacements);

  let subject = "Softshop Acccount Credited!";
  let fileName = "logo.png";
  let filePath = `${__dirname}/../mails/logo.png`;
  let cid = "logo";
  let sendAction = await sendEmail(toEmail, subject, htmlToSend, fileName, filePath, cid);

  if (!sendAction) {
    console.log("signup mail not sent");
  }
};
const sendRiderDebitMail = async (toEmail, amount) => {
  let textWLogo = path.join(__dirname, "../mails/rider-debit.hbs");
  const source = fs.readFileSync(textWLogo, "utf-8").toString();
  const template = handlebars.compile(source);
  const replacements = {
    amount
  };
  const htmlToSend = template(replacements);

  let subject = "Softshop Acccount Debited!";
  let fileName = "logo.png";
  let filePath = `${__dirname}/../mails/logo.png`;
  let cid = "logo";
  let sendAction = await sendEmail(toEmail, subject, htmlToSend, fileName, filePath, cid);

  if (!sendAction) {
    console.log("signup mail not sent");
  }
};
export {
  sendWaitListSignupMail,
  sendWaitListInvite,
  sendEmail,
  sendPlainEmail,
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
  sendRiderDebitMail,
  sendStoreSignUpFollowUpMail,
  sendRiderSignupMail
};
