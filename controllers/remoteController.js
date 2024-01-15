const {ProductRemote, ManufacturersRemote, CustomersRemote, CategoryProductRemote, CategoryRemote} = require("../models/modelsRemote");
const {Product, Brand, Product_Category} = require("../models/models")
const ApiError = require("../error/ApiError");
const {Op} = require('sequelize')
const fs = require("fs");


class RemoteController {

    async getAllRemoteProducts (req, res) {
        const remoteProducts = await ProductRemote.findAll({include: [
                {model: CategoryProductRemote, include: [
                        {model: CategoryRemote}
                    ]}
            ]})

        return res.json(remoteProducts)
    }

    async getCustomers (req, res) {
        const customers = await CustomersRemote.findAll()
        return res.json(customers)
    }








}
module.exports = new RemoteController()