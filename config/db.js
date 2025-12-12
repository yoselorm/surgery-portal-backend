const mongoose = require('mongoose')
require('dotenv').config()

const mongouri = process.env.MONGODB_URI

const database = async () =>{
    try {
        await mongoose.connect(mongouri)
        console.log('Database is connected')
    } catch (error) {
        console.group(error)
    }
}

module.exports = database