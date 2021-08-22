/**
 * Librería para revisar que los datos de entrada cumplen con los requisitos. 
 * si no cumplen, poder responder 400 sin desperdiciar recursos
 * 
 */

// initialize module object

const lib = {}

//checks if value is a string and is not empty, return trimmed str
// otherwise returns false
lib.notEmptyString = function(str){
    if (typeof str == 'string' && str.trim().length>0 ) {
        return str.trim()
    } else {
        return false
    }
}

//checks if the trimmed str has a valid format,string && length 20
lib.hasTokenFormat = function(str){
    if (typeof str == 'string' && str.trim().length === 20) {
        return str.trim()
    } else {
        return false   
    }
}

//checks if the trimmed str has a valid format,string && length 20
lib.phoneHasValidFormat = function(str){
    const possibleOptions = /^[0-9]+$/
    if (typeof str == 'string' && str.trim().length === 11 && str.trim().match(possibleOptions)) {
        return str.trim()
    } else {
        return false   
    }
}

//Exports module
module.exports = lib