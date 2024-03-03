const {ProductRemote, CustomersRemote, SellsCounterRemote, SellsRemote, DeliveryRemote} = require("../models/modelsRemote");
const {Op} = require("sequelize");


class RemoteController {

    async getAllRemoteProducts (req, res) {
        const remoteProducts = await ProductRemote.findAll({where: {id_родительского: 0},include: [
                {model: ProductRemote, as: 'children'},
            ]})

        return res.json(remoteProducts)
    }

    async getCustomers (req, res) {
        const customers = await CustomersRemote.findAll()
        return res.json(customers)
    }

    async getRealizationsDeliveriesToday (req, res, next) {
        const date = new Date()
        date.setHours(0)
        console.log(date)

        const realizations = await SellsCounterRemote.findAll(
            {order: [['deliveryId', "ASC"]],
                where: {deliveryId: {[Op.gt]: 0}},
                include: [
                    {model: SellsRemote, where: {
                            Дата: {[Op.gte]: date},
                        }},
                    {model: DeliveryRemote},
                    {model: CustomersRemote},
                ]}
        )

        return res.json(realizations)
    }








}
module.exports = new RemoteController()