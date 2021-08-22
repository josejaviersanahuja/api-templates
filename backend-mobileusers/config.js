/**
 * global variables used in small little corners of this app
 * 
 */

const config = {
    appName:"api-templates-emailusers",
    author:"zitrojjdev",
    authorEmail:"josejaviersanahuja@gmail.com",
    baseUrl:"http://localhost:3000/",
    appUrl:"the url of the fron goes here",
    'twilio': {
        'fromPhone': '+17149092365',
        'accountSid': 'AC6e529c5151c30f0271b0283a53607a66',
        'authToken': process.env.TWILIO_AUTH_TOKEN
      },
}

module.exports = config