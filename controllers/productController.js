const path = require('path')
const {Product, ProductImages, Brand, Category, ProductAttribute, Product_ProductAttribute} = require('../models/models')
const ApiError = require('../error/ApiError')
const imageService = require('../service/image-service')
const resizeWidth = parseInt(process.env.PRODUCT_WIDTH)
const directory = path.resolve(__dirname, '..', 'static/images/products')

class ProductController {
    async create (req, res, next) {
        try {
            let {title, shortDescription, description, weight, price, indexNumber, discountedPrice, metaTitle, metaDescription, SKU, published, special, brandId, categories, attributes} = req.body
            let file
            try {
                file = req.files.file
            } catch {
                console.log("no imgs")
            }


            await Product.create({title, shortDescription, description, weight, price, indexNumber, discountedPrice, metaTitle, metaDescription, SKU, brandId, published, special}).then(async (data) => {
                if(file) {
                    if(Array.isArray(file)) {
                        file.forEach(async(img) => {
                            const fileName = await imageService.saveImg(img, directory, resizeWidth)
                            await ProductImages.create({img: fileName, productId: data.id} )
                        })
                    } else {
                        (async () => {
                            const fileName = await imageService.saveImg(file, directory, resizeWidth)
                            await ProductImages.create({img: fileName, productId: data.id})
                        })()
                    }
                }

                if (categories){
                    categories = categories.split(";")
                    for (let i =0; i<categories.length; i++) {
                        const product = await Product.findByPk(data.id)
                        const category = await Category.findByPk(categories[i])
                        await product.addCategory(category, {through: 'Product_Category'})
                    }
                }
                if (attributes){
                    attributes = attributes.split(";")
                    for (let i =0; i<attributes.length; i++){
                        const product = await Product.findByPk(data.id)
                        const attribute = await ProductAttribute.findByPk(attributes[i])
                        await product.addProductAttribute(attribute, {through: 'Product_ProductAttribute'})
                    }
                }
                return res.json(data)
            })



        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }
    async getAll (req, res) {
        const products = await Product.findAll({include: [
                {model: Brand, as: 'brand', attributes: ['name']},
                {model: Product, as: 'children'},
                {model: Category, as: 'category', attributes: ['name', 'id'], through: {attributes: []}},
                {model: ProductAttribute, as: 'productAttribute', attributes: ['value', 'id'], through: {attributes: []}}
            ]})
        return res.json(products)
    }

    async getPublished (req, res) {
        const products = await Product.findAll({where: {published: true}, include: [
                {model: Brand, as: 'brand', attributes: ['name']},
                {model: Product, as: 'children'},
                {model: Category, as: 'category', attributes: ['name', 'id'], through: {attributes: []}},
                {model: ProductAttribute, as: 'productAttribute', attributes: ['value', 'id'], through: {attributes: []}}
            ]})
        return res.json(products)
    }


    async modify (req, res, next) {
        try {
            const {title, shortDescription, description, weight, price, indexNumber, discountedPrice, metaTitle, metaDescription, special, published, id} = req.body
            const product = await Product.update({
                    title, shortDescription, description, weight, price, indexNumber, discountedPrice, metaTitle, metaDescription, published, special
                },
                {
                    where: {id},
                }
            )
            return res.json(product)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }

    }

    async addAttribute (req, res, next) {
        try {
            const {productId, attributeId} = req.body
            const product = await Product.findByPk(productId)
            const attribute = await ProductAttribute.findByPk(attributeId)
            await product.addProductAttribute(attribute, {through: 'Product_ProductAttribute'})
            return res.json("Добавлено")
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async delAttribute(req, res, next) {
        try {
            const {productId, productAttributeId} = req.body
            await Product_ProductAttribute.destroy({where: {productId, productAttributeId}})
            return res.json('Удалено')
        } catch (e) {
        next(ApiError.badRequest(e.message))
    }
    }

    async addProductCategory (req, res, next) {
        try {
            const {productId, categoryId} = req.body
            const product = await Product.findByPk(productId)
            const category = await Category.findByPk(categoryId)
            await product.addProductCategory(category, {through: 'Product_Category'})
            return res.json("Добавлено")
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async delProductCategory(req, res, next) {
        try {
            const {productId, categoryId} = req.body
            await Product_Category.destroy({where: {productId, categoryId}})
            return res.json('Удалено')
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async addImg (req, res, next) {
        const {productId} = req.body
        const file = req?.files?.file
        try {
            if(Array.isArray(file)) {
                file.forEach(async(img) => {
                    const fileName = await imageService.saveImg(img, directory, resizeWidth)
                    await ProductImages.create({img: fileName, productId} )

                })
            } else {
                (async () => {
                    const fileName = await imageService.saveImg(file, directory, resizeWidth)
                    await ProductImages.create({img: fileName, productId})
                })()
            }
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
        return res.json('Файлы добавлены')
    }

    async delImg (req, res, next) {
        const {id} = req.body
        const img = await ProductImages.findByPk(id)
        try {
            await imageService.delImg(img?.dataValues?.img, directory)
            await ProductImages.destroy({
                where: {id},
            })
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
        return res.json('Файл удален')
    }

    async delete (req, res, next) {
        const {id} = req.body
        const imgList = await ProductImages.findAll({where: {productId: id}, attributes: ["img"]})
        await ProductImages.destroy({
            where: {productId: id},
        })
        await Product.destroy({
            where: {id},
        })
        try {
            imgList.forEach(async (img) => {
                await imageService.delImg(img?.dataValues?.img, directory)
            })
            await Product_ProductAttribute.destroy({where: {productId: id}})
            await Product_Category.destroy({where: {productId: id}})
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }

        return res.json('Удалено')
    }
}

module.exports = new ProductController()