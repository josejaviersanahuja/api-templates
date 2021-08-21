/**
 * Workers a schedule running programs that will delete old data from DataBases like expired tokens
 * 
 */

const {tokensModel} = require('../mongoose/models')

// initializing module object
const workers = {}

// worker to clean old tokens from data base, running every 5 minutes
workers.cleanTokens = function(){
    setInterval(async function(){
        const answer = await tokensModel.deleteMany({expires : {$lte : Date.now()}})
        if (answer.n > 0) {
            console.log('\x1b[33m%s\x1b[0m', answer.n + ' expired tokens deleted');
        }
    }, 1000*60*5)
}

// workers init
workers.init= function(){
    //initiate expired tokens cleaner
    workers.cleanTokens()
    console.log('\x1b[33m%s\x1b[0m', "Workers runnig.")
}
//exporting module
module.exports = workers
