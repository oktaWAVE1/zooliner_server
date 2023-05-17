const {DeliveryMethod} = require('../models/models')


class DeliveryService {
    async calculateDelivery(id, sum) {
        const method = await DeliveryMethod.findByPk(id)
        if (method.freeSum >= sum) {
            return 0
        } else {
            return method.price
        }
    }

}

module.exports = new DeliveryService()