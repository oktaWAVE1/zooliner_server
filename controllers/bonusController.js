
const {Order, BonusPoint, BonusPointsLog} = require('../models/models')
const ApiError = require("../error/ApiError");



class BonusController {
    async get(req, res, next) {
        const {userId} = req.body
        const userBonus = await BonusPoint.findOne({where: {userId}})
        return res.json(userBonus)

    }

    async getLogs(req, res, next) {
        const {userId} = req.body
        const userBonus = await BonusPointsLog.findAll({where: {userId}})
        return res.json(userBonus)
    }


    async add(req, res, next) {
        try {
            const {userId, qty, comment} = req.body
            const currentBonus = await BonusPoint.findOne({where: {userId}})
            const updatedQty = (parseInt(qty)+parseInt(currentBonus.currentQty)) > 0?
                parseInt(qty)+parseInt(currentBonus.currentQty):
                0
            const userBonus = await BonusPoint.update({currentQty: updatedQty}, {where: {userId}})
            const changeDescription = `Изменено админимтратором. ${comment}`
            await BonusPointsLog.create({qtyChanges: qty, description: changeDescription, bonusPointId: currentBonus.id})
            return res.json(userBonus)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }

    }
    async orderBonus(req, res, next) {
        try {
            const {id, cancelOrder} = req.body
            const order = await Order.findByPk(id)
            const currentBonus = await BonusPoint.findOne({where: {userId: order.userId}})
            let updatedQty = currentBonus?.currentQty
            if (currentBonus){
                if(cancelOrder) {
                    updatedQty = parseInt(currentBonus.currentQty) - parseInt(order.accruedBonus)
                } else {
                    updatedQty = parseInt(order.accruedBonus) + parseInt(currentBonus.currentQty)
                }

                await BonusPoint.update({currentQty: updatedQty}, {where: {userId: order.userId}})
                const changeDescription = cancelOrder ? `Отмена заказа № ${order.id}` : `Начислено ${order.accruedBonus} бонусов по заказу № ${order.id}`
                const bonusLog = await BonusPointsLog.create({qtyChanges: order.accruedBonus, description: changeDescription, bonusPointId: currentBonus.id, orderId: order.id})
                return res.json(bonusLog)
            }
            return res.json("Заказ неавторизованного пользователя")
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }

    }


}



module.exports = new BonusController()