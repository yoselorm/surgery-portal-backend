const mongoose = require('mongoose')

const Schema = mongoose.Schema

const tokenSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    refreshToken: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    }
}, { timestamps: true });


const Token = mongoose.model('Token', tokenSchema);

module.exports = Token