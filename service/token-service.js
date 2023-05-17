const jwt = require("jsonwebtoken");
const {UserRefreshToken} = require("../models/models");
const ApiError = require("../error/ApiError");
const {validate} = require("uuid");
const {User} = require('../models/models')
require('dotenv').config()


class TokenService {

    generateJwt(payload) {

        const accessToken = jwt.sign(
            payload,
            process.env.ACCESS_SECRET_KEY,
            {
                expiresIn: '24d',
            }
        )
        const refreshToken = jwt.sign(
            payload,
            process.env.REFRESH_SECRET_KEY,
            {
                expiresIn: '60d',
            }
        )

        return {
            accessToken,
            refreshToken
        }
    }

    async saveToken(userId, refreshToken) {

        const tokenData = await UserRefreshToken.findOne({where: {userId}})

        if (tokenData) {
            const token = await UserRefreshToken.update({refreshToken}, {where: {userId}})
            return token
        } else {
            const token = await UserRefreshToken.create({userId, refreshToken})

            return token
        }

    }

    async removeToken(refreshToken) {
        const tokenData = await UserRefreshToken.destroy({where: refreshToken})
        return tokenData
    }

    async findToken(refreshToken) {
        const tokenData = await UserRefreshToken.findOne({where: {refreshToken}})
        return tokenData
    }


    async refresh(refreshToken, next){
        console.log({refreshToken})
        if(!refreshToken){
            return next(ApiError.internal("Пользователь неавторизован"))
        }

        const userData = await this.validateRefreshToken(refreshToken)
        const tokenFromDB = await this.findToken(refreshToken)

        if(!userData || !tokenFromDB){
            return false
        }

        const user = await User.findOne({where: {id: tokenFromDB.userId}})

        return user
    }

    validateAccessToken(token) {
        try {
            const userData = jwt.verify(token, process.env.ACCESS_SECRET_KEY)
            return userData
        } catch (e) {
            return null;
        }
    }

    validateRefreshToken(token) {
        try {
            const userData = jwt.verify(token, process.env.REFRESH_SECRET_KEY)
            return userData
        } catch (e) {
            return null;
        }
    }
}

module.exports = new TokenService()