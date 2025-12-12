const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const surgerySchema = new Schema({

},{timestamps:true})

const Surgery  = mongoose.model('Surgery',surgerySchema);

module.exports = Surgery