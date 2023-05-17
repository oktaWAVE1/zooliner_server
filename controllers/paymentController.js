const {PaymentMethod} = require('../models/models')
const ApiError = require('../error/ApiError')

class PaymentController {
    async create(req, res, next) {
        const {name} = req.body
        try {
            const paymentMethod = await PaymentMethod.create({name})
            return res.json(paymentMethod)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async getAll (req, res) {
        const paymentMethods = await PaymentMethod.findAll()
        return res.json(paymentMethods)
    }

    async modify (req, res, next) {
        const {id, name} = req.body
        try {
            const paymentMethod = await PaymentMethod.update({name}, {
                where: {id},
            })
            return res.json(paymentMethod)

        } catch (e) {
            next(ApiError.badRequest(e.message))
        }

    }
    async delete (req, res, next) {
        try {
            const {id} = req.body

            await PaymentMethod.destroy( {where: {id}})
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
        return res.json('Удалено')
    }



}
module.exports = new PaymentController()