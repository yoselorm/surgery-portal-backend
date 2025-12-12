const jwt = require('jsonwebtoken')
require('dotenv').config()

exports.generateRefreshTokens = (user) =>{
    return jwt.sign(
        {id: user._id},
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn: '7d'}
    )
}

exports.generateAccessTokens = (user) =>{
    return jwt.sign(
        {id: user._id},
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn:'15m'}
    )
}