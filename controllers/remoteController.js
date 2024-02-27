const {ProductRemote, CustomersRemote, CategoryProductRemote, CategoryRemote} = require("../models/modelsRemote");



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








}
module.exports = new RemoteController()