const bonusService = require('../service/bonus-service')
const {Order, BonusPoint, BonusPointsLog} = require('../models/models')
const ApiError = require("../error/ApiError");



class BonusController {
    async get(req, res, next) {
        const userId = req.user.id
        const userBonus = await BonusPoint.findOne({where: {userId}})
        return res.json(userBonus)
    }

    async getLogs(req, res, next) {
        const userBonus = await BonusPointsLog.findAll()
        return res.json(userBonus)
    }


    async add(req, res, next) {
        try {
            const {userId, qty, comment} = req.body
            const changeDescription = `Изменено админимтратором. ${comment}`
            const userBonus = await bonusService.addPoints(userId, qty, changeDescription)
            return res.json(userBonus)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }


}



module.exports = new BonusController()