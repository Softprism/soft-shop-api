import nodemailer from "nodemailer";

const sendEmail = async (toEmail, mailSubj, mailBody) => {
  console.log(1, toEmail);

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
      console.log(error);
    } else {
      console.log("Server is ready to take our messages");
    }
  });

  // Set mail options
  let mailOptions = {
    from: '"Nduka from Softshop" <nduka@soft-shop.app>',
    to: toEmail,
    subject: mailSubj,
    text: mailBody,
  };

  // Send email
  transporter.sendMail(mailOptions, function (err, data) {
    if (err) {
      console.log("Error " + err);
    } else {
      console.log("Email sent successfully");
    }
  });
};

export { sendEmail };
