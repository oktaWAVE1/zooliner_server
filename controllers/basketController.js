const {Product, BasketProduct, Basket, ProductImages} = require('../models/models')
const ApiError = require("../error/ApiError");


class BasketController {

    async get(req, res, next) {
        try {
            const {id} = req.query
            const basket = await Basket.findOne({where: {userId: id}})
            const basketItems = await BasketProduct.findAll({where: {basketId: basket.id}, order: [['id', 'ASC']], include: [

                    {model: Product, as: 'product', include: [
                        {model: ProductImages, as: 'product_images'},
                        {model: Product, as: 'parent', include: [
                                {model: ProductImages, as: 'product_images'}
                            ]}]},
                ]})
            return res.json(basketItems)
        } catch (e) {
            return res.json(e.message)
        }
    }

    async getUnauthorized(req, res, next) {
        try {
            const {localBasket} = req.query
            let localBasketParsed = JSON.parse(localBasket)
            let localBasketProducts = []
            for (let i=0; i<localBasketParsed.length; i++) {
                let currentProduct = await Product.findOne({where: {id: localBasketParsed[i]['productId']}, include: [
                    {model: ProductImages, as: 'product_images'},
                    {model: Product, as: 'parent', include: [
                              {model: ProductImages, as: 'product_images'}
                          ]}]

                })
                localBasketProducts.push({...localBasketParsed[i], product: currentProduct})
            }

            return res.json(localBasketProducts)
        } catch (e) {
            return res.json(e.message)
        }

    }

    async add(req, res, next) {
        const {userId, qty, productId} = req.body
        const basket = await Basket.findOne({where: {userId}})
        if (parseInt(qty)>0){
            try {
                await BasketProduct.findOne({where: {basketId: basket.id, productId}}).then(async (basketProduct) => {
                    if (basketProduct) {
                        const updatedQty = parseInt(basketProduct.qty)+parseInt(qty)
                        await BasketProduct.update({qty: updatedQty}, {where: {productId, basketId: basket.id}})
                        return res.json('Количество изменено')

                    } else {
                            basketProduct = await BasketProduct.create({basketId: basket.id, productId, qty})
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
        const {userId, qty, productId} = req.body
        try {
        const basket = await Basket.findOne({where: {userId}})

            if (qty<=0){
                await BasketProduct.destroy({where: {productId, basketId: basket.id}})
                return res.json('Позиция удалена')
            } else {
                await BasketProduct.update({qty}, {where: {productId, basketId: basket.id}})
            }

        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
        return res.json('Количество обновлено')
    }


    async del(req, res, next) {
        const {userId, productId} = req.query
        const basket = await Basket.findOne({where: {userId}})
        try {
            await BasketProduct.destroy({where: {productId, basketId: basket.id}})

        } catch (e) {
            next(ApiError.badRequest(e.message))
        }

        return res.json('Позиция удалена')
    }

    async clear(req, res, next) {
        const {id} = req.query
        const basket = await Basket.findOne({where: {userId: id}})
        try {
            await BasketProduct.destroy({where: {basketId: basket.id}})

        } catch (e) {
            next(ApiError.badRequest(e.message))
        }

        return res.json('Корзина очищена')

    }

}

module.exports = new BasketController()