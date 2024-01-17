const path = require('path')
const {Category, CategoryImages, Brand, Product} = require('../models/models')
const ApiError = require('../error/ApiError')
const fs = require('fs');
const imageService = require('../service/image-service')
const directory = path.resolve(__dirname, '..', 'static/images/categories')
const resizeWidth = parseInt(process.env.CATEGORY_WIDTH)


class CategoryController {

    async create (req, res, next) {
        try {
            let {id, name, description, ordering, published, categoryId} = req.body
            const file = req?.files?.file


            await Category.create({id, name, description, ordering, published, categoryId}).then((data) => {
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
        const categories = await Category.findAll({include: [
                {model: Category, as: 'parent'},
                {model: Category, as: 'children'},
                {model: CategoryImages}
        ]})

        return res.json(categories)
    }

    async getCurrent (req, res) {
        const {id} = req.params
        const category = await Category.findOne({where: {id}, include: [
                {model: Category, as: 'parent'},
                {model: Category, as: 'children'},
                {model: CategoryImages}
            ]})

        return res.json(category)
    }

    async getPublished (req, res) {
        const categories = await Category.findAll({where: {published: true}, order: [['id', 'ASC'], [{model: Category, as: 'children'}, "ordering", "ASC"]], include: [
                {model: Category, as: 'children'}
            ]})
        return res.json(categories)
    }

    async modify (req, res) {

        const {id, name, description, ordering, published, categoryId, newId} = req.body
        const category = await Category.update({
                name, description, published, ordering, categoryId, id: newId
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
        let saved
        try {
            if(Array.isArray(file)) {
                file.forEach(async(img) => {
                    const fileName = await imageService.saveImg(img, directory, resizeWidth)
                    await CategoryImages.create({img: fileName, categoryId} )
                })
                return res.json('Файлы добавлены')
            } else if (file){
                (async () => {
                    const fileName = await imageService.saveImg(file, directory, resizeWidth)
                    saved = await CategoryImages.create({img: fileName, categoryId})
                })()
                return res.json('Файл добавлен')
            }
            return res.json('Нет файлов')
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }


    }

    async delImg (req, res, next) {
        const {id} = req.query
        const img = await CategoryImages.findByPk(id)
        try {
            await imageService.delImg(img?.dataValues?.img, directory)
            await CategoryImages.destroy({
                where: {id},
            }).then(() => {
                return res.json('Файл удален')

            })
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }

    }


    async delete (req, res, next) {
        const {id} = req.query
        await Category.findOne({where: {id}, include: [
            {model: Category,as: 'children'}
            ]}).then((data) => {
                if(data?.children?.length>0){
                    return res.json("Нельзя удалить категорию с дочерними категориями")
                }
        })
        console.log(id)
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