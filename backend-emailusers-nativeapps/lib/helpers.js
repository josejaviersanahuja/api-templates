/**
 * Librería con funciones de apoyo
 *
 */

const nodemailer = require("nodemailer");
const crypto = require("crypto");
const global = require('../config');

//container for all helpers
const helpers = {};

//Create a SHA256 hash
helpers.hash = function (str) {
  if (typeof str == "string" && str.length > 0) {
    const hash = crypto
      .createHmac("sha256", process.env.HASHING_KEY)
      .update(str)
      .digest("hex");
    return hash;
  } else {
    return false;
  }
};

// create a random alphanumeric id of num length
helpers.createRandomString = function (num) {
  num = typeof num == "number" && num > 0 ? num : false;
  if (num) {
    const possibleCharacters =
      "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    let finalID = "";

    for (let index = 0; index < num; index++) {
      const randomElement = possibleCharacters.charAt(
        Math.floor(Math.random() * possibleCharacters.length)
      );

      finalID += randomElement;
    }

    return finalID;
  } else {
    return false;
  }
};

// EMAIL SENDER
// used only to recover an account and validate email
helpers.emailSender = async function (emailTo, newPassword, validation = false) {
  const mensaje = validation ? helpers.createValidationMessage(emailTo) : helpers.createRecoveryPasswordMessage(newPassword);
  // create reusable transporter object using the
  // SMTP Data Google provided before, its in the first Box

  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.MY_EMAIL, // my personal test email
      pass: process.env.MY_EMAIL_PASSWORD, // Personal password
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: `"no reply, automatic-email " <${process.env.MY_EMAIL}>`, // <> sender address
    to: emailTo, // list of receivers
    subject: validation? "Account Validation" : "Password Recovery", // Subject line
    html: mensaje, // html body
  });

  return info
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
};

helpers.createRecoveryPasswordMessage = function (pass) {
    return `<h2>Password Recovery</h2>
    <p>This email was sent because you want to recover your account of ${global.appName} </p>
    <p>Please Login again using this new password</p>
    <hr/>
    <h3>${pass}</h3>
    <hr/>
    <p>app created by ${global.author} || send an email to ${global.authorEmail} if you want to comment something</p>`;    
};

helpers.createValidationMessage = function(emailTo){
    return `<h2>Email Validation</h2>
    <p>Please follow the next link to validate your account</p>
    <p>This can activate the recovery account if you forget the password. Otherwise, if you loose the password, you'll loose the whole account</p>
    <hr/>
    <a href="${global.baseUrl}validation?email=${emailTo}&validation=true" target="_blank" rel="no referrer">FOLLOW THIS LINK</a>
    <hr/>
    <p>app created by ${global.author} || send an email to ${global.authorEmail} if you want to comment something</p>`
}
//exporting the helpers
module.exports = helpers;
