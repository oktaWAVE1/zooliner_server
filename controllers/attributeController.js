

const {ProductAttribute, ProductAttributeCategory, Product} = require('../models/models')
const ApiError = require("../error/ApiError");


class AttributeController {
    async getAllCategories(req, res, next) {
        const categories = await ProductAttributeCategory.findAll({include: [{model: ProductAttribute, as: 'product_attributes', attributes: ['value', 'id']}]})
        return res.json(categories)
    }

    async createCategory(req, res, next) {
        const {name} = req.body
        const lastAttributeCategory = await ProductAttributeCategory.findAll({limit:1, order:[["id", "DESC"]]})
        try {
            const category = await ProductAttributeCategory.create({name, id: (lastAttributeCategory[0].id+1)})
            return res.json(category)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async changeCategory(req, res, next) {
        const {id, published, name} = req.body
        try {
            const category = await ProductAttributeCategory.update({published, name}, {where: {id}})
            return res.json(category)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async deleteCategory(req, res, next) {
        const {id} = req.query
        try {
            await ProductAttributeCategory.destroy({where: {id}})
            return res.json("Удалено")
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async getAllAttributes(req, res, next) {
        const attributes = await ProductAttribute.findAll({include: [{model: ProductAttributeCategory, as: 'product_attribute_category', attributes: ['name']}]})
        return res.json(attributes)
    }

    async createAttribute(req, res, next) {
        const {productAttributeCategoryId, value} = req.body
        const lastAttribute = await ProductAttribute.findAll({limit:1, order:[["id", "DESC"]]})
        try {
            const attribute = await ProductAttribute.create({value, productAttributeCategoryId, id: (lastAttribute[0].id+1)})
            return res.json(attribute)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async changeAttribute(req, res, next) {
        const {id, value} = req.body
        try {
            const attribute = await ProductAttribute.update({value}, {where: {id}})
            return res.json(attribute)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }
    async deleteAttribute(req, res, next) {
        const {id} = req.query
        try {
            await ProductAttribute.destroy({where: {id}})
            return res.json("Удалено")
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }



}



module.exports = new AttributeController();