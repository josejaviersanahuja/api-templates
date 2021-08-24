/**
 * Helpers tests
 *
 */

// Dependencies
const assert = require("assert");
const helpers = require("../../lib/helpers");

//Holder
const unit = {};

/**
 * * helpers.createRandomString
 */

//EXPECTED BEHAVIOUR
unit["helpers.createRandomString creates always a string with length equal to the entry param"] = function (done) {
  // entry param from 1 to 30
  const randomEntryParam = Math.floor(Math.random()*30) +1
  //possible values foreach char
  const possibleCharacters =
      "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const neverCharacters = "!·$%&/()=^*+-[]{}.,;:<>"
  //value of the random function
  const val = helpers.createRandomString(randomEntryParam);


  const arrayValue = val.split('')
  
  arrayValue.forEach(char => {
      //all chars must be included in possibleCharacters
    assert.ok(possibleCharacters.includes(char))
      //all chars are never special chars
    assert.ok(neverCharacters.indexOf(char) === -1)
  });
  

  //its always a string when the entry is as expected
  assert.strictEqual(typeof val, 'string')

  // it has always the length passed as entry
  assert.strictEqual(val.length, randomEntryParam);
  done();
};

//CORNER CASE (the entry is not an int)
unit["helpers.createRandomString When Entry is 0 or lesser must return false"] = function (done) {
  //values of corner cases
  const val1 = helpers.createRandomString(0);
  const val2 = helpers.createRandomString(-1);

  //assertions
  assert.strictEqual(val1, false)
  assert.strictEqual(val2, false)
  done()
}

/**
 * HASH
 */
//Expected behaviour
unit["helpers.hash returns a string with length 64 and all chars are in a HEX base"] =  function(done){
    //get a random strings with length 5,10 and 15 with createrandom string
    const entry5 = helpers.createRandomString(5)
    const entry10 = helpers.createRandomString(10)
    const entry15 = helpers.createRandomString(15)
    const val1 = helpers.hash(entry5)
    const val2 = helpers.hash(entry10)
    const val3 = helpers.hash(entry15)
    //all hashes has a length of 64
    assert.ok(val1.length === val2.length && val2.length=== val3.length && val3.length=== 64 )
    //all chars are hex types
    const possibleChars="0123456789abcdef"
    //array of all chars
    const arrayAllChars = val1.split('').concat(val2.split('').concat(val3.split('')))
    arrayAllChars.forEach(char=>{
        assert.ok(possibleChars.includes(char))
    })
    // no chars are g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z
    const neverChars="ghijklmnopqrstuvwxyz./*-+=?¿¡)([]{ç},:;-_!#~%"
    arrayAllChars.forEach(char=>{
        //are never a neverChars
        assert.ok(neverChars.indexOf(char)===-1)
    })
    done()
}

//Corner case, if entry is empty string or a different type
unit["helpers.hash returns false when entry is not a string or is an empty string"] =  function(done){
    const val1 = helpers.hash(false)
    const val2 = helpers.hash("")
    const val3 = helpers.hash(5)

    assert.ok(val1 === val2 && val2===val3 && val3===false)
    done()
}

/**
 * EMAILSENDER
 */
 unit["helpers.sendMail if it sends a mail return an object, the sending attemp will go to a rejected array or accepted array"] = async function(done){
    const answer1 = await helpers.emailSender("zitrojj@gmail.com","jhsadf")
    const answer2 = await helpers.emailSender("zitrojj@gmail.com","jhsadf", true)
    //if the email is accepted its pushed to an array in key answer.accepted
    assert.ok(answer1.accepted.length === 1 || answer1.rejected.length===1)
    //if the email is rejected its pushed to an array in key answer.rejected
    assert.ok(answer2.accepted.length === 1 || answer2.rejected.length===1)
    //answer.envelopeTime
    assert.ok(answer2.envelopeTime)
    
    //answer.messageTime
    assert.ok(answer2.messageTime)
    
    //answer.messageSize
    assert.ok(answer2.messageSize)
    
    //answer.response
    assert.ok(answer2.response)
    
    //answer.envelope
    assert.ok(answer2.envelope)
    
    //answer.messageId
    assert.ok(answer2.messageId)
    
    done()
 }
//CORNER CASE, the email is wrong
 unit["helpers.sendMail if the email is not good, it will throw"] = async function(done){
     helpers.emailSender('zitrojj@gmail.', "kjsadfkj").catch(err=>{
         assert.ok(err)
         done()
     })
 }
module.exports = unit;
