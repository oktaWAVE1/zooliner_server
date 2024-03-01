const path = require('path')
const {Product, ProductImages, Brand, Category, CategoryImages, ProductAttribute, Product_ProductAttribute,
    ProductAttributeCategory, Product_Category
} = require('../models/models')
const ApiError = require('../error/ApiError')
const imageService = require('../service/image-service')
const filterService = require('../service/filter-service')
const resizeWidth = parseInt(process.env.PRODUCT_WIDTH)
const directory = path.resolve(__dirname, '..', 'static/images/products')
const {Op} = require('sequelize')
const {fuseSearch} = require("../service/fuseSearch");

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
        const products = await Product.findAll({where: {productId: {[Op.eq]: 0}},
            order: [['title', 'ASC'], ['shortDescription', 'ASC'], [{model: ProductImages},'master', 'DESC']],
            include: [
                {model: Brand, as: 'brand', attributes: ['name']},
                {model: Category, as: 'category', attributes: ['name', 'id'], through: {attributes: []}},
                {model: ProductImages, as: 'product_images'}
            ]})

        return res.json(products)
    }

    async getPublished (req, res) {
        const products = await Product.findAll({where: {published: true, hidden: false, productId: {[Op.eq]: 0}}, order: [[{model: ProductImages},'master', 'DESC']],
            include: [
                // {model: Brand, as: 'brand', attributes: ['name']},
                // {model: Product, as: 'children'},
                {model: Category, as: 'category', attributes: ['name', 'id'], through: {attributes: []}},
                {model: ProductAttribute, as: 'productAttribute', through: {attributes: []},
                    include: [{model: ProductAttributeCategory, as: 'product_attribute_category', attributes: ['name', 'id']}]
                },
                {model: ProductImages, as: 'product_images'}
            ]})

        return res.json({products})
    }

    async getSearchedPublishedProducts (req, res) {
        const {query} = req.params
        const searchedProducts = []

        await Product.findAll({where: {published: true, hidden: false, productId: {[Op.eq]: 0}}, order: [['indexNumber', 'ASC'], [{model: ProductImages},'master', 'DESC']], include: [
                {model: Brand, as: 'brand', attributes: ['name']},
                {model: Product, as: 'children'},
                {model: Category, as: 'category', attributes: ['name', 'id'], through: {attributes: []}},
                {model: ProductAttribute, as: 'productAttribute', through: {attributes: []},
                    include: [{model: ProductAttributeCategory, as: 'product_attribute_category', attributes: ['name', 'id']}]
                },
                {model: ProductImages, as: 'product_images'}
            ]}).then(async (products) => {
            const search = await fuseSearch(products, query)
            search.forEach(item => searchedProducts.push(item.item))
        })
        const filteredItems = filterService.filterItems(searchedProducts)
        return res.json({products: searchedProducts, brands: filteredItems.brands, attributes: filteredItems.attributes})

    }

    async getPublishedProductInCategory (req, res) {
        const {id} = req.params
        console.log()
        const subCategories = await Category.findAll({where: {categoryId: id, published: true}, order:[['ordering', 'ASC']], include: [
            {model: CategoryImages, as: 'category_images'}]})
        const category = await Category.findByPk(id)
        if(!category && Number(id)!==0){
            return res.status(404).json(`Nothing`)
        }
        if (subCategories.length>0) {

            return res.json({subCategories: subCategories, category: category})
        }
        const products = await Product.findAll({where: {published: true, hidden: false, productId: {[Op.eq]: 0}}, order: [['indexNumber', 'ASC'], [{model: ProductImages},'master', 'DESC']], include: [
                {model: Brand, as: 'brand', attributes: ['name']},
                {model: Product, as: 'children'},
                {model: Category, as: 'category', attributes: ['name', 'id'], through: {attributes: []}, where: {id}},
                {model: ProductAttribute, as: 'productAttribute', through: {attributes: []},
                    include: [{model: ProductAttributeCategory, as: 'product_attribute_category', attributes: ['name', 'id']}]
                },
                {model: ProductImages, as: 'product_images'}
            ]})

        const filteredItems = filterService.filterItems(products)
        return res.json({products: products, brands: filteredItems.brands, attributes: filteredItems.attributes, category: category})

    }

    async getPublishedProduct (req, res) {
        const {id} = req.params

        const product = await Product.findOne({where: {published: true, hidden: false, id}, order: [[{model: ProductImages},'master', 'DESC']],
                include: [
                {model: Brand, as: 'brand', attributes: ['name']},
                {model: Product, as: 'children'},
                {model: ProductAttribute, as: 'productAttribute', through: {attributes: []}},
                {model: ProductImages, as: 'product_images'}
            ]})
        if(!product) {
            return res.status(404).json(`No product`)
        }
        return res.json(product)

    }

    async getProduct (req, res) {
        const {id} = req.params
        const product = await Product.findOne({where: {id}, order: [[{model: ProductImages},'master', 'DESC']],
            include: [
                {model: Brand, as: 'brand', attributes: ['name']},
                {model: Product, as: 'children'},
                {model: ProductAttribute, as: 'productAttribute', through: {attributes: []}, include:[
                        {model: ProductAttributeCategory},
                    ]},
                {model: ProductImages, as: 'product_images'},
                {model: Category, as: 'category', include: [
                        {model: Category, as: 'parent'}
                    ]}
            ]})
        return res.json(product)
    }

    async updateProductIndex (req, res) {
        const {id} = req.params
        const {indexNumber} = req.body
        await Product.update({indexNumber}, {where: {id}})
        return res.json("Порядок изменен")

    }


    async modify (req, res, next) {
        try {
            const {title, shortDescription, description, weight, price, indexNumber, discountedPrice, hidden, metaTitle, metaDescription, special, published, id} = req.body
            await Product.update({
                    title, shortDescription, description, weight, price, indexNumber, discountedPrice, hidden, metaTitle, metaDescription, published, special
                },
                {
                    where: {id},
                }
            )
            return res.json("Продукт обновлен")
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }

    }

    async addAttribute (req, res, next) {
        try {
            const {productId, productAttributeId} = req.body
            const product = await Product.findByPk(productId)
            const attribute = await ProductAttribute.findByPk(productAttributeId)
            await product.addProductAttribute(attribute, {through: 'Product_ProductAttribute'})
            return res.json("Добавлено")
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async delAttribute(req, res, next) {
        try {
            console.log(1)
            const {productId, productAttributeId} = req.query
            console.log(productId)
            console.log(productAttributeId)

            await Product_ProductAttribute.destroy({where: {productId, productAttributeId}})
            return res.json('Удалено')
        } catch (e) {
            console.log(e.message)
            next(ApiError.badRequest(e.message))
    }
    }

    async addProductCategory (req, res, next) {
        try {
            const {productId, categoryId} = req.body
            const product = await Product.findByPk(productId)
            const category = await Category.findByPk(categoryId)
            await product.addCategory(category, {through: 'Product_Category'})


            return res.json("Добавлено")
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async delProductCategory(req, res, next) {
        try {
            const {productId, categoryId} = req.query
            await Product_Category.destroy({where: {productId, categoryId}})
            return res.json('Удалено')
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async setMasterImg(req, res, next) {
        try {
            const {id} = req.body
            const {productId} = await ProductImages.findByPk(id)
            await ProductImages.update({master: false}, {where: {productId}}).then(async () => {
                await ProductImages.update({master: true}, {where: {id}})
            })
            return res.json('Мастер изображение обновлено')
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
                return res.json('Файлы добавлены')
            } else if (file){
                (async () => {
                    const fileName = await imageService.saveImg(file, directory, resizeWidth)
                    await ProductImages.create({img: fileName, productId})
                })()
                return res.json('Файлы добавлены')
            }
        return res.json('Нет файлов')
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }

    }

    async delImg (req, res, next) {
        const {id} = req.query
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
        try {
            const {id} = req.body
            try {
                await Product_ProductAttribute.destroy({where: {productId: id}})
                await Product_Category.destroy({where: {productId: id}})
            } catch (e) {
                console.log(e.message)
            }

            const imgList = await ProductImages.findAll({where: {productId: id}, attributes: ["img"]})
            await ProductImages.destroy({
                where: {productId: id},
            })
            await Product.destroy({
                where: {id},
            })

                imgList.forEach(async (img) => {
                    await imageService.delImg(img?.dataValues?.img, directory)
                })


        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
        return res.json('Удалено')
    }
}

module.exports = new ProductController()