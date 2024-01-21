const {Product, BasketProduct, Basket, ProductImages, Order, OrderItem} = require('../models/models')
const ApiError = require("../error/ApiError");


class BasketController {

    async get(req, res, next) {
        try {
            const {id} = req.query
            console.log(id)
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

    async copyOrder(req, res, next) {
        try {
        const {orderId} = req.params
        const {userId} = req.body
        const basket = await Basket.findOne({where: {userId}})
        await BasketProduct.destroy({where: {basketId: basket.id}})
        await Order.findOne({where: {id: orderId}, include: [
                {model: OrderItem, include: [
                        {model: Product}
                    ]}
                ]})
            .then(async (order) => {
                console.log(order)
                if(!order.order_items || order.order_items.length<1) {
                    next(ApiError.badRequest("Пустой заказ"))
                }
                for (let item of order.order_items){
                    if (item.product.published) {
                        await BasketProduct.create({basketId: basket.id, productId: item.product.id, qty: item.qty})
                    }
                }
            }
        )

        } catch (e) {
            next(ApiError.badRequest(e.message))
        }

        return res.json('Заказ продублирован')

    }

}

module.exports = new BasketController()