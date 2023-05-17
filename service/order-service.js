const {Product, BasketProduct, Basket} = require('../models/models')

class OrderService {

    async calculateOrder(basketId) {
        let sum = 0
        let discountSum = 0
        await BasketProduct.findAll({where: {basketId}}).then((basketItems) => {
            basketItems.forEach(async (item, index, array) => {
                await Product.findByPk(item.productId).then(product => {
                    sum += (product.price * item.qty)
                    if(product.discountedPrice>0){
                        discountSum += (product.price - product.discountedPrice)*item.qty
                    }
                    if(index===array.length-1){
                        return {sum, discountSum}
                    }
                })
            })
        })
    }

}


module.exports = new OrderService()