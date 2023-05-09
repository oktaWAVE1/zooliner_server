const path = require('path')
const {Category, CategoryImages} = require('../models/models')
const ApiError = require('../error/ApiError')
const fs = require('fs');
const imageService = require('../service/image-service')
const directory = path.resolve(__dirname, '..', 'static/images/categories')
const resizeWidth = parseInt(process.env.CATEGORY_WIDTH)


class CategoryController {

    async create (req, res, next) {
        try {
            let {name, description, published} = req.body
            const file = req?.files?.file


            await Category.create({name, description, published}).then((data) => {
                if(file) {
                    if(Array.isArray(file)) {
                        file.forEach(async(img) => {
                            const fileName = await imageService.saveImg(img, directory, resizeWidth)
                            await CategoryImages.create({img: fileName, categoryId: data.id} )
                        })
                    } else {
                        (async () => {
                            const fileName = await imageService.saveImg(file, directory, resizeWidth)
                            await CategoryImages.create({img: fileName, categoryId: data.id})
                        })()
                    }
                }
                return res.json(data)
            })


        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }
    async getAll (req, res) {
        const categories = await Category.findAll()
        return res.json(categories)
    }

    async getPublished (req, res) {
        const categories = await Category.findAll({where: {published: true}})
        return res.json(categories)
    }


    async modify (req, res) {
        const {id, name, description, published} = req.body
        const category = await Category.update({
                name, description, published
            },
            {
                where: {id},
            }
        )
        return res.json(category)
    }

    async addImg (req, res, next) {
        const {categoryId} = req.body
        const file = req?.files?.file
        try {
            if(Array.isArray(file)) {
                file.forEach(async(img) => {
                    const fileName = await imageService.saveImg(img, directory, resizeWidth)
                    await CategoryImages.create({img: fileName, categoryId} )
                })
            } else {
                (async () => {
                    const fileName = await imageService.saveImg(file, directory, resizeWidth)
                    await CategoryImages.create({img: fileName, categoryId})
                })()
            }
        } catch (e) {
            next(ApiError.badRequest(e.message))
            return res.json('Ошибка: ' + e.message)
        }
        return res.json('Файлы добавлены')
    }

    async delImg (req, res, next) {
        const {id} = req.body
        const img = await CategoryImages.findByPk(id)
        try {
            await imageService.delImg(img?.dataValues?.img, directory)
            await CategoryImages.destroy({
                where: {id},
            })
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
        return res.json('Файл удален')
    }


    async delete (req, res, next) {
        const {id} = req.body
        const imgList = await CategoryImages.findAll({where: {categoryId: id}, attributes: ["img"]})

        try {
        imgList.forEach(async (img) => {
            await imageService.delImg(img?.dataValues?.img, directory)
        })
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
        await CategoryImages.destroy({
            where: {categoryId: id},
        })
        await Category.destroy({
            where: {id},
        })


        return res.json('Удалено')
    }
}

module.exports = new CategoryController()