const {DeliveryMethod} = require('../models/models')


class DeliveryService {
    async calculateDelivery(id, sum) {
        const method = await DeliveryMethod.findByPk(id)
        if (sum < method.freeSum) {
            return Number(method.price)
        } else {
            return 0
        }
    }

}

module.exports = new DeliveryService()