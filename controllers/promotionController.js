const {Promotion, Brand} = require('../models/models')
const ApiError = require('../error/ApiError')
const {Op} = require('sequelize')
const imageService = require("../service/image-service");
const path = require("path");
const resizeWidth = parseInt(process.env.PROMOTION_WIDTH)
const directory = path.resolve(__dirname, '..', 'static/images/promotions')

class PromotionController {
    async getAll(req, res, next) {
        try {
            const promotions = await Promotion.findAll()
            return res.json(promotions)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }
    async getValid(req, res, next) {
        const now = Date.now()
        try {
            const promotions = await Promotion.findAll({where:
                    {
                        validSince: {
                            [Op.lte]: now
                        },
                        validUntil: {
                            [Op.gte]: now
                        }
                    }
            })
            return res.json(promotions)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }


    async create(req, res, next) {
        try {
            const {description, validSince, validUntil} = req.body
            let file
            try {
                file = req.files.file
            } catch {
                console.log("no imgs")
            } if (file) {
                const fileName = await imageService.saveImg(file, directory, resizeWidth)
                const promotion = await Promotion.create({description, validSince, validUntil, img: fileName})
                return res.json(promotion)
            } else {
                const promotion = await Promotion.create({description, validSince, validUntil})
                return res.json(promotion)
            }

        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async modify (req, res, next) {
        const {id, description, validSince, validUntil} = req.body
        const file = req?.files?.file
        try {
            if (file) {
                const promotionData = await Promotion.findByPk(id)

                await imageService.delImg(promotionData?.dataValues?.img, directory)
                await imageService.saveImg(file, directory, resizeWidth).then(async (img) => {
                    const promotion = await Promotion.update({description, validSince, validUntil, img}, {
                        where: {id},
                    })
                    return res.json(promotion)
                })
            } else {
                const promotion = await Promotion.update({description, validSince, validUntil}, {
                    where: {id},
                })
                return res.json(promotion)
            }

        } catch (e) {
            next(ApiError.badRequest(e.message))
        }

    }

    async delete (req, res, next) {
        const {id} = req.body
        const promotion = await Brand.findByPk(id)
        await Promotion.destroy({
            where: {id},
        })
        try {
            await imageService.delImg(promotion?.dataValues?.img, directory)

        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
        return res.json('Удалено')
    }




}


module.exports = new PromotionController()