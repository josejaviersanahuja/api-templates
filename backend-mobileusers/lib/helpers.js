/**
 * Librería con funciones de apoyo
 *
 */

const crypto = require("crypto");
const global = require("../config");
const querystring = require("querystring");
const https = require("https");

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

/****************************************************
 *                  TWILIO
 * ************************************************* */

helpers.sendTwilioSms = function (phone, newPassword =false) {
  const msg = newPassword? helpers.writeRecoveryPassSMS(newPassword) : helpers.writeValidationSMS(phone)
  return  new Promise((resolve, rejects) => {
    //Validate parameters
    phone =
      typeof phone == "string" && phone.trim().length === 11
        ? phone.trim()
        : false;
    msg =
      typeof msg == "string" && msg.trim().length > 0 && msg.length <= 1600
        ? msg.trim()
        : false;
    if (phone && msg) {
      //Configure the request payload
      const payload = {
        From: global.twilio.fromPhone,
        To: "+" + phone,
        Body: msg,
      };

      // Stringify payload
      const stringPayload = querystring.stringify(payload);

      //Configure the request
      const requestDetails = {
        protocol: "https:",
        hostname: "api.twilio.com",
        method: "POST",
        path:
          "/2010-04-01/Accounts/" + global.twilio.accountSid + "/Messages.json",
        auth: global.twilio.accountSid + ":" + global.twilio.authToken,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(stringPayload),
        },
      };
      // Instantiate the request object
      const req = https.request(requestDetails, function (res) {
        //Grab the status of the sent request
        const status = res.statusCode;
        // Callback succesfully if the request went through
        if (status == 200 || status == 201) {
          resolve({ sent: true, text: msg }); 
        } else {
          rejects("Message not sent. Status Code returned: " + status);
        }
      });

      // Bind to the error event
      req.on("error", function (e) {
        rejects(e);
      });

      // Add the payload
      req.write(stringPayload);

      //End the request
      req.end();
    } else {
      rejects("Given Parameters were missing or invalid");
    }
  });
};

helpers.writeValidationSMS= function(phone){
  return `Thank you for sign up to ${global.appName}. Please follow this link to validate your account. ${global.baseUrl}?phone=${phone}&validation=true`
}

helpers.writeRecoveryPassSMS = function(newPassword){
  return `Please log in again with this password ${newPassword}
  
  ${global.appUrl}`
}
//exporting the helpers
module.exports = helpers;
