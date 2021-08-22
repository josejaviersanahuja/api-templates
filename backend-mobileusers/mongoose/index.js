/**
 * Archivo de conexión a la base de datos
 * 
 */
const mongoose = require('mongoose')

const { MONGODB_URI, MONGODB_URI_TEST, NODE_ENV } = process.env

const connectionString = NODE_ENV === 'production' ?  MONGODB_URI: MONGODB_URI_TEST

mongoose.connect( connectionString, { 
    useCreateIndex: true, 
    useFindAndModify: false, 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
}).then(() => { 
    console.log ('\x1b[36m%s\x1b[0m','Database connected in mode ' + NODE_ENV ) 
}).catch(e => { 
    console.error(e) 
})