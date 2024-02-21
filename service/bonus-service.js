const {BonusPoint, BonusPointsLog} = require("../models/models");


class BonusService {
    async addPoints(userId, qty, comment, orderId, usedFrozenPoints) {
        try {
            const currentBonus = await BonusPoint.findOne({where: {userId}})
            const updatedQty = (parseInt(qty) + parseInt(currentBonus.currentQty)) > 0 ?
                parseInt(qty) + parseInt(currentBonus.currentQty) :
                0
            const updateFrozenQty = (-parseInt(usedFrozenPoints) + parseInt(currentBonus.frozenPoints)) > 0 ?
                -parseInt(usedFrozenPoints) + parseInt(currentBonus.frozenPoints) :
                0

            await BonusPoint.update({currentQty: updatedQty, frozenPoints: updateFrozenQty}, {where: {userId}})
            const userBonusLog = await BonusPointsLog.create({qtyChanges: qty, description: comment, bonusPointId: currentBonus.id, orderId})
            return userBonusLog
        } catch {
            return null
        }
    }
}

module.exports = new BonusService()