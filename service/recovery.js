const {ProductRemote, CategoryProductRemote, CategoryRemote} = require("../models/modelsRemote");
const {Op} = require("sequelize");
const {Product} = require("../models/models");
const fs = require("fs");


const updateRecovery = async (timeOffset=240) => {
    const start = Date.now()
    const msSinceEpoch = (new Date()).getTime();
    const updatedStartTime = (new Date(msSinceEpoch + (1000 * 60 * 60 * 3) - (1000 * 60 * 60 * timeOffset))).toUTCString()
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
            await updateProduct(pr)
        }
    }).then(() => {
        console.log(`Recovery: Done in ${Math.floor((Date.now() - start) / 1000)} sec. StartSearch: ${updatedStartTime}`)
    })
}

async function updateProduct (pr) {


    try {
        if(pr.parent?.Наименование.toLowerCase()==='royal canin'){


            await Product.findOne({where: {id: pr?.parent?.Код}}).then(async (data) =>{
                    console.log(data?._previousDataValues?.description)
                if (data?.dataValues?.description?.length<50 && data?._previousDataValues?.description?.length>50){
                    console.log("Updating")
                    await Product.update({description: data._previousDataValues.description}, {where: {id: data.dataValues.id}})
                }
            }
            )




        }

    } catch (e) {
        console.log(e)
        const date = new Date()
        const timeStampLog = date.toLocaleString()

        await fs.appendFile(`./logs/logs.txt`, `${timeStampLog} Ошибка: ${e} \n`, (err) => {
            if (err) {
                console.log(err);
            }
        })
    }
}

module.exports = {
    updateRecovery
}

