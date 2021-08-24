/**
 * Lets Define the arquitech of our database
 *
 */
//DEPENDENCIES
const { Schema, model } = require("mongoose");

// All the Schemas
// users schema
// @TODO in apiTemplate mobileUsers cahnge email for phone
const usersSchema = new Schema({
  userName: {
    type:String
  },
  email: {
      type:String,
      unique:true,
      required:true
    },
  hashedPassword: String,
  signupDate: Number,
  confirmed:Boolean
});

//tokens schema
//@TODO in apitemplate mobileUsers change email for phone
const tokensSchema = new Schema({
  email: String,
  id: {
      type:String,
      unique:true,
      required:true
    },
  user:{
      type: Schema.Types.ObjectId,
      ref:'users'
  }
});

// Modules of Models
const models = {}

models.usersModel = model("users", usersSchema);
models.tokensModel = model('tokens', tokensSchema)

//Export all models
module.exports = models;
