const {DeliveryMethod} = require('../models/models')
const ApiError = require('../error/ApiError')

class DeliveryController {
    async create(req, res, next) {
        const {name, minSum, freeSum, price} = req.body
        try {
            const deliveryMethod = await DeliveryMethod.create({name, minSum, freeSum, price})
            return res.json(deliveryMethod)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async getAll (req, res) {
        const deliveryMethods = await DeliveryMethod.findAll()
        return res.json(deliveryMethods)
    }

    async modify (req, res, next) {
        const {id, name, minSum, freeSum, price} = req.body
        try {
            const deliveryMethod = await DeliveryMethod.update({name, minSum, freeSum, price}, {
                where: {id},
            })
            return res.json(deliveryMethod)

        } catch (e) {
            next(ApiError.badRequest(e.message))
        }

    }
    async delete (req, res, next) {
        try {
            const {id} = req.body
            await DeliveryMethod.destroy( {where: {id}})
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
        return res.json('Удалено')
    }



}
module.exports = new DeliveryController()