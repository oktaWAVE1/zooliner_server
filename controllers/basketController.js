const {Product, BasketProduct, Basket} = require('../models/models')
const ApiError = require("../error/ApiError");


class BasketController {


    async get(req, res, next) {
        const {id} = req.body
        const basket = await Basket.findOne({where: {userId: id}})
        console.log(basket)
        const basketItems = await BasketProduct.findAll({where: {basketId: basket.id}, include: [
                {model: Product, as: 'product'},
              ]})
        return res.json(basketItems)
    }

    async add(req, res, next) {
        const {basketId, qty, productId} = req.body
        if (parseInt(qty)>0){
            try {
                await BasketProduct.findOne({where: {basketId, productId}}).then(async (basketProduct) => {
                    if (basketProduct) {
                        const updatedQty = parseInt(basketProduct.qty)+parseInt(qty)
                        await BasketProduct.update({qty: updatedQty}, {where: {basketId, productId}}).then()
                        return res.json('Количество изменено')

                    } else {
                            basketProduct = await BasketProduct.create({basketId, productId, qty})
                    }
                    return res.json(basketProduct)
                })


            } catch (e) {
                next(ApiError.badRequest(e.message))
            }
        } else {
            return res.json("Количество меньше минимального")
        }


    }

    async modify(req, res, next) {
        const {productId, basketId, qty} = req.body
        try {
            if (qty<=0){
                await BasketProduct.destroy({where: {productId, basketId}})
                return res.json('Позиция удалена')
            } else {
                await BasketProduct.update({qty}, {where: {productId, basketId}})
            }

        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
        return res.json('Количество обновлено')
    }


    async del(req, res, next) {
        const {productId, basketId} = req.body
        try {
            await BasketProduct.destroy({where: {productId, basketId}})

        } catch (e) {
            next(ApiError.badRequest(e.message))
        }

        return res.json('Позиция удалена')
    }

    async clear(req, res, next) {
        const {basketId} = req.body
        try {
            await BasketProduct.destroy({where: {basketId}})

        } catch (e) {
            next(ApiError.badRequest(e.message))
        }

        return res.json('Корзина очищена')

    }

}

module.exports = new BasketController()