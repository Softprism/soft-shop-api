import mongoose from 'mongoose';
import nodemailer from 'nodemailer';

const connectDB = async () => {
	try {
		const conn = await mongoose.connect(process.env.MONGO_URI, {
			useUnifiedTopology: true,
			useNewUrlParser: true,
			useCreateIndex: true,
		});

		console.log(`MongoDB Connected: ${conn.connection.host}`);
	} catch (error) {
		console.error(`Error: ${error.message}`);
		process.exit(1);
	}
};

const sendEmail = async (toEmail,mailSubj, mailBody) => {
  console.log(1, toEmail)
  let transporter = nodemailer.createTransport({
    host: "mail.soft-shop.app",
    port: 465,
    secure: true,
    auth: {
      user: "nduka@soft-shop.app",
      pass: "2021@Softprism",
    },
  });
  
  // verify connection configuration
  transporter.verify(function (error, success) {
    if (error) {
      console.log(error);
    } else {
      console.log("Server is ready to take our messages");
    }
  });
  
  // set mail options
  let mailOptions = {
    from: '"Nduka from Softprism" <nduka@soft-shop.app>',
    to: toEmail,
    subject: mailSubj,
    text: mailBody,
  };
  // send email
  transporter.sendMail(mailOptions, function(err, data) {
    if (err) {
      console.log("Error " + err);
    } else {
      console.log("Email sent successfully");
    }
  });
}

export {
  sendEmail,
  connectDB
}
