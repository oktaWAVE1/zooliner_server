const {Brand} = require('../models/models')
const ApiError = require('../error/ApiError')
const imageService = require("../service/image-service");
const path = require("path");
const directory = path.resolve(__dirname, '..', 'static/images/brands')
const resizeWidth = parseInt(process.env.BRAND_WIDTH)

class BrandController {
    async create(req, res, next) {
        const {name} = req.body
        const file = req?.files?.file
        try {
            if(file){
                await imageService.saveImg(file, directory, resizeWidth).then(async(img) => {
                    const brand = await Brand.create({name, img})
                    return res.json(brand)
                })
            } else {
                const brand = await Brand.create({name})
                return res.json(brand)
            }


        } catch (e) {
            next(ApiError.badRequest(e.message))
        }


    }
    async getPublished (req, res) {
        const brands = await Brand.findAll({where: {published: true}, attributes: ['id', 'name']})
        return res.json(brands)
    }

    async getAll (req, res) {
        const brands = await Brand.findAll()
        return res.json(brands)
    }

    async modify (req, res, next) {
        const {id, name} = req.body
        const file = req?.files?.file
        try {
            if (file) {
                const brandData = await Brand.findByPk(id)

                await imageService.delImg(brandData?.dataValues?.img, directory)
                await imageService.saveImg(file, directory, resizeWidth).then(async (img) => {
                    const brand = await Brand.update({name, img}, {
                        where: {id},
                    })
                    return res.json(brand)
                })
            } else {
                const brand = await Brand.update({name}, {
                    where: {id},
                })
                return res.json(brand)
            }

        } catch (e) {
            next(ApiError.badRequest(e.message))
        }

    }
    async delete (req, res, next) {
        const {id} = req.body
        const brand = await Brand.findByPk(id)
        await Brand.destroy({
            where: {id},
        })
        try {
            await imageService.delImg(brand?.dataValues?.img, directory)

        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
        return res.json('Удалено')
    }



}
module.exports = new BrandController()