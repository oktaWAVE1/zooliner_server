require('dotenv').config()
const {Product, Order, OrderItem, BasketProduct, Basket, User, PaymentMethod, DeliveryMethod, ProductImages, BonusPoint,
    BonusPointsLog
} = require('../models/models')
const ApiError = require('../error/ApiError')
const mailService = require("../service/mail-service")
const bonusService = require("../service/bonus-service")
const deliveryService = require("../service/delivery-service")
const uuid = require('uuid')
const { Op } = require("sequelize");



class OrderController {

    async getOrder(req, res, next) {
        try {
            const {accessLink} = req.params
            const order = await Order.findOne({where: {accessLink: accessLink}, include: [
                    {model: OrderItem, include: [{model: Product, as: 'product', include: [
                                {model: ProductImages, as: 'product_images'},
                                {model: Product, as: 'parent', include: [
                                        {model: ProductImages, as: 'product_images'}
                                    ]}]}],}
                ]})
            return res.json(order)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async userOrders (req, res, next) {
        try {
            const {userId} = req.query.data
            const orders = await Order.findAll({where: {userId: userId, status: {[Op.notLike]: "Создан"}},
                order: [['createdAt', 'DESC']],
                include: [
                    {model: OrderItem, include: [{model: Product, as: 'product', include: [
                                {model: ProductImages, as: 'product_images'},
                                {model: Product, as: 'parent', include: [
                                        {model: ProductImages, as: 'product_images'}
                                    ]}]}],}
                ]})
            return res.json(orders)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async getAll (req, res, next) {
        try {
            const orders = Order.findAll()
            return res.json(orders)
        } catch (e) {
            next(ApiError(e.m))
        }
    }
    async checkOrder(req, res, next) {
        try {
            const {id} = req.params
            const order = await Order.findByPk(id, {include: [
                    {model: OrderItem},
                ]})
            return res.json(order)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async placeOrder(req, res, next) {
        try {
            const {orderId, userId, paymentMethodId, deliveryMethodId, name, address, telephone, comment, customerEmail} = req.body
            let {bonusPoints} = req.body
            const bonusPointsUsed = Number(bonusPoints) || 0
            await Order.findByPk(orderId).then(async (data) => {
                const orderAddress = address || data.orderAddress
                const customerName = name || data.customerName
                const customerTel = telephone || data.customerTel
                const orderDiscount = Number(data.orderDiscount)+bonusPointsUsed
                const discountedSalesSum = data.discountedSalesSum - bonusPoints
                const accruedBonus = discountedSalesSum * process.env.BONUS_RATE
                const deliverySum = await deliveryService.calculateDelivery(deliveryMethodId, discountedSalesSum)
                const paymentMethod = await PaymentMethod.findByPk(paymentMethodId)
                const deliveryMethod = await DeliveryMethod.findByPk(deliveryMethodId)
                await Order.update({status: "Подтвержден покупателем", bonusPointsUsed, paymentMethodId, deliveryMethodId, orderAddress, customerName, customerTel, orderDiscount, accruedBonus, deliverySum, comment}, {where: {id: orderId}}).then(async() => {
                    await Order.findByPk(orderId, {include: [
                            {model: OrderItem, include: [
                                    {model: Product}
                                ]},
                        ]}).then(async (order) => {
                            const basket = await Basket.findOne({where: {userId}})
                            if (basket) {
                                await BasketProduct.destroy({where: {basketId: basket.id}})
                            }
                            if (customerEmail){
                                await mailService.sendOrderToCustomer(customerEmail, order, paymentMethod.name, deliveryMethod.name)
                            }
                            await mailService.sendOrderToShop(order, paymentMethod.name, deliveryMethod.name)
                            if (bonusPointsUsed>0){
                                await BonusPoint.findOne({where: {userId}}).then(async(BP) => {
                                    let currentQty = Number(BP.currentQty) - bonusPointsUsed
                                    let frozenPoints = Number(BP.frozenPoints) + bonusPointsUsed
                                    BonusPoint.update({currentQty, frozenPoints}, {where: {userId}})
                                    const log = `Списание ${bonusPointsUsed} баллов за заказ ${order.orderNumber}`
                                    await BonusPointsLog.create({qtyChanges: bonusPointsUsed, orderId, description: log, bonusPointId: BP.id})
                                })
                            }

                    })
            })

            })

            return res.json("Заказ подтвержден")
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }

    }

    async clearOrder (req, res, next) {
        const {accessLink} = req.params

        try {
            const order = await Order.findOne({where: {accessLink}})
            await Order.destroy({where: {accessLink}})
            await OrderItem.destroy({where: {orderId: order.id}})
            return res.json("Заказ очищен")
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async createOrder(req, res, next) {
        try {
            const {userId} = req.body
            const user = await User.findByPk(userId)
            const basket = await Basket.findOne({where: {userId}})
            const accessLink = uuid.v4()
            let orderNumber = new Date().toISOString()
            orderNumber = orderNumber.slice(2, 10)+orderNumber.slice(11, 22)
            orderNumber = orderNumber.replaceAll("-", "").replaceAll(":","").replace(".","")

            await Order.create({
                orderAddress: user?.address || '',
                customerName: user?.name || '',
                customerTel: user?.telephone || '',
                customerEmail: user?.email || '',
                salesSum: 0,
                orderDiscount: 0,
                discountedSalesSum: 0,
                userId,
                orderNumber,
                accessLink
            }
            ).then(async(order) => {
                console.log(order)
                const basketItems = await BasketProduct.findAll({where: {basketId: basket.id}, include: [
                        {model: Product, as: 'product', include: [
                                {model: Product, as: 'parent'}
                            ]},
                    ]})
                let salesSum = 0
                let discountSum = 0
                await basketItems.forEach(async (item, index, array) => {
                    const sum = item.product.discountedPrice > 0 ? item.product.discountedPrice * item.qty : item.product.price * item.qty
                    await OrderItem.create({
                        productId: item.productId,
                        orderId: order.id,
                        price: item.product.price,
                        discountedPrice: item.product.discountedPrice,
                        qty: item.qty,
                        name: item.product.productId > 0 ? `${item.product.parent.title}, ${item.product.parent.shortDescription}, ${item.product.title}` : `${item.product.title}, ${item.product.shortDescription}`,
                        sum
                    })
                    salesSum += item.product.price*item.qty
                    if(item.product.discountedPrice>0){
                        discountSum += (item.product.price-item.product.discountedPrice)*item.qty
                    }
                    if(index===array.length-1){
                        const discountedSalesSum = salesSum-discountSum
                        await Order.update({orderDiscount: discountSum, salesSum, discountedSalesSum}, {where: {id: order.id}})

                    }
                })
                return res.json(order.accessLink)
            })
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }


    }


    async changeStatus(req, res, next) {
        try {
            const {id, status} = req.body
            await Order.findByPk(id).then(async(order) => {
                if (status==="Подтвержден" && order.status==="Подтвержден покупателем" || status==="Подтвержден" && order.status==="Отменен") {
                    const Description = `Начислено ${order.accruedBonus} бонусов по заказу № ${order.id}`
                    const userBonus = await bonusService.addPoints(order.userId, order.accruedBonus, Description, order.id)
                    return res.json(userBonus)
                } else if (status==="Отменен" && order.status==="Подтвержден") {
                    const description = `Отмена заказа № ${order.id}`
                    const userBonus = await bonusService.addPoints(order.userId, -order.accruedBonus, description, order.id)
                    return res.json(userBonus)
                }
            })

            await Order.update({status}, {where: {id}})
            return res.json('Статус изменен')
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }

    }


}

module.exports = new OrderController()