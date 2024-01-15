const {ManufacturersRemote, ProductRemote, CategoryProductRemote, CategoryRemote} = require("../models/modelsRemote");
const {Brand, Product, Product_Category} = require("../models/models");
const {Op} = require("sequelize");
const fs = require("fs");

const update = async (timeOffset) => {
    const start = Date.now()
    const msSinceEpoch = (new Date()).getTime();
    const updatedStartTime = (new Date(msSinceEpoch + (1000 * 60 * 60 * 3) - (1000 * 60 * 60 * timeOffset))).toUTCString()
    const manufacturersList = await ManufacturersRemote.findAll()
    const manufacturers = new Map(manufacturersList.map(m => {
        return [m["Название производителя"], m.id_производителя]
    }))
    for (let [key, value] of manufacturers) {
        try{
            await Brand.findOne({where: {id: value}}).then(async (man) => {
                if (!man) {
                    console.log(key)
                    console.log(value)
                    await Brand.create({id: value, name: key})
                }
            })

        } catch (e) {
            console.log("*******: ", e.message)
        }
    }


    await ProductRemote.findAll({
        where: {updatedAt: {[Op.gt]: updatedStartTime}}, include: [
            {
                model: CategoryProductRemote, include: [
                    {model: CategoryRemote}
                ]
            },
            {model: ProductRemote, as: 'children'},
            {model: ProductRemote, as: 'parent', include: [
                    {model: CategoryProductRemote, include: [
                            {model: CategoryRemote}
                        ]
                    }]
            },
        ]
    }).then(async (remoteProducts) => {
        for (const pr of remoteProducts) {
            const categories = []
            pr.categoriesOfProductsRemotes.forEach(CFPR => {
                categories.push(CFPR.categoriesRemote.id_категории)
            })
            pr.parent?.categoriesOfProductsRemotes.forEach(CFPR => {
                categories.push(CFPR.categoriesRemote.id_категории)
            })
            let published = false

            if (pr.Published !== 0) {
                if (pr.product_in_stock > 0) {
                    published = true
                }
                if (pr.product_in_stock <= 0) {
                    if (categories.some(c => [2, 4, 6].includes(c))) {
                        if (pr.children.length > 0 && !pr.Акция) {
                            published = pr.children.some(ch => ch.Published !== 0)
                        }
                        if (pr.id_родительского > 0 && !pr.Акция) {
                            published = true
                        }
                    } else {
                        if (pr.children.length > 0) {
                            published = pr.children.some(ch => ch.product_in_stock > 0)
                        }

                    }
                }
            }


            try {

                const product = await Product.findOne({where: {id: pr.Код}})
                const content = {
                    id: pr.Код,
                    SKU: pr.Код,
                    inStock: pr.product_in_stock > 0,
                    price: pr.Цена,
                    title: pr.Наименование,
                    shortDescription: pr["Наименование (крат опис)"],
                    description: pr["Полное описание"],
                    weight: pr.Вес,
                    // discountedPrice: pr.discountedPrice,
                    // metaTitle: pr.metaTitle,
                    // metaDescription: pr.metaDescription,
                    // indexNumber: pr.indexNumber,
                    searchKeys: pr["Ключи для поиска"],
                    // pack: pr["pack"],
                    published,
                    brandId: manufacturers.get(pr.производитель),
                    special: Boolean(pr.Акция),
                    productId: pr.id_родительского,
                }
                if (content.title === null || content.title === 'Новый товар') continue
                if (product?.id) {
                    let id = content.id
                    delete content.id
                    delete content.SKU
                    await Product.update({...content}, {where: {id}})
                } else {
                    await Product.create({...content})
                }

            } catch (e) {
                console.log(e)
                const date = new Date()
                const timeStampLog = date.toLocaleString()

                await fs.appendFile(`../server/logs/logs.txt`, `${timeStampLog} Ошибка: ${e} \n`, (err) => {
                    if (err) {
                        console.log(err);
                    }
                })
            }

        }
    }).then(async () => {
            try {
                await CategoryProductRemote.findAll({
                    where: {updatedAt: {[Op.gt]: updatedStartTime}},
                    include: {model: CategoryRemote}
                }).then(async (remoteProductCategories) => {
                    for (const PRC of remoteProductCategories) {
                        try {
                            await Product_Category.findOrCreate({
                                where: {
                                    productId: PRC.код_товара,
                                    categoryId: PRC.categoriesRemote.id_категории
                                }
                            })

                        } catch (e) {
                            console.log(e)
                            const date = new Date()
                            const timeStampLog = date.toLocaleString()

                            await fs.appendFile(`../server/logs/logs.txt`, `${timeStampLog} Ошибка: ${e} \n`, (err) => {
                                if (err) {
                                    console.log(err);
                                }
                            })
                        }


                    }
                })

            } catch (e) {
                console.log(e)
                const date = new Date()
                const timeStampLog = date.toLocaleString()

                await fs.appendFile(`../server/logs/logs.txt`, `${timeStampLog} Ошибка: ${e} \n`, (err) => {
                    if (err) {
                        console.log(err);
                    }
                })
            }
        }
    ).then(() => {
        console.log(`result: Done in ${Math.floor((Date.now() - start) / 1000)} sec. StartSearch: ${updatedStartTime}`)
    })
}

module.exports = {
    update
}