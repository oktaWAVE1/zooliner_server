const {Category, Product, ProductImages} = require('../models/models')
const fs = require('fs')


async function yandexFeedGenerator () {
    try {
        const date = new Date
        const year = date.getFullYear()
        const month = date.getMonth()+1
        const day = date.getDate()
        const hours = date.getHours()
        const minutes = date.getMinutes()
        const dateTime = `${year}-${String(month).length>1 ? day : `0${month}`}-${String(day).length>1 ? day : `0${day}`}T${hours}:${minutes}`
        let template =
            `<?xml version="1.0" encoding="UTF-8"?>
<yml_catalog date="${dateTime}">
    <shop>
        <name>ЗооЛАЙНЕР</name>
        <company>ИП Косыгин С.В.</company>
        <url>https://zooliner.ru</url>
        <currencies>
            <currency id="RUR" rate="1"/>
        </currencies>
        <categories>
%categories%
        </categories>
        <offers>
           
%offers%                                           
               
    
        </offers>
        
    </shop>
</yml_catalog>`
        const categories = await Category.findAll({where: {published: true}})
        const products = await Product.findAll({where: {published: true, productId: 0}, include: [
                {model: Product, as: 'children'},
                {model: Category, as: 'category'},
                {model: ProductImages, as: 'product_images'}
            ]})
        const cats = []
        const offers = []
        categories.forEach(c => {
            cats.push(`            <category id="${c.id}" ${c?.categoryId>0 ? `parentId="${c.categoryId}"` : ''}>${c.description}</category>`)
        })
        products.filter(p => p?.product_images?.length>0 && p?.category?.length>0).forEach(p => {
            if(p.children.length===0){
                offers.push(`                        <offer id="${p.id}">
            <name>${p.title} ${p.shortDescription}</name>
            <url>${process.env.CLIENT_URL}/product/%{p.id}</url>
            <price>${p.discountedPrice>0 ? p.discountedPrice : p.price}</price>
            ${p.discountedPrice>0 ? `<oldprice>${p.price}</oldprice>` : ''}
            <enable_auto_discounts>true</enable_auto_discounts>
            <currencyId>RUR</currencyId>
            <categoryId>${p?.category[0].id}</categoryId>
            <picture>${process.env.API_URL}/images/products/${p.product_images[0].img}</picture>
            <description>
                <![CDATA[          
                    ${p.description || `<div><p>${p.title}</p><p>${p.shortDesription}</p></div>`}
                ]]>
            </description>
        </offer>`)
            } else {
                p.children.filter(pc => pc.published).forEach(pc => {
                    offers.push(`            <offer id="${pc.id}">
                <name>${p.title} ${p.shortDescription} ${pc.title}</name>
                <url>${process.env.CLIENT_URL}/product/%{p.id}</url>
                <price>${pc.discountedPrice>0 ? pc.discountedPrice : pc.price}</price>
                ${pc.discountedPrice>0 && `<oldprice>${pc.price}</oldprice>`}
                <enable_auto_discounts>true</enable_auto_discounts>
                <currencyId>RUR</currencyId>
                <categoryId>${p?.category[0].id}</categoryId>
                <picture>${process.env.API_URL}/images/products/${p.product_images[0].img}</picture>
                <description>            
                    <![CDATA[          
                        ${p.description || `<div><p>${p.title}</p><p>${p.shortDescription}</p><p>${pc.title}</p></div>`}
                    ]]>
                </description>
            </offer>`)
                })
            }
        })
        const feed = template.replace("%categories%", cats.join('\n'))
            .replace("%offers%", offers.join('\n'))
            .replaceAll("&", "&amp;")
            // .replaceAll("'", "&apos;")
            // .replaceAll("\"", "&quot;")
        await fs.writeFile('./static/xml/yandexfeed.yml', feed, async (err) => {
            await fs.appendFile(`./logs/logs.txt`, `${err} \n`, (err) => {
                if (err) {
                    console.debug(err);
                }
            })
        })
    } catch (e) {
        console.log(e)
        await fs.appendFile(`./logs/logs.txt`, `${e.message} \n`, (err) => {
            if (err) {
                console.debug(err);
            }
        })
    }

}

module.exports = {
    yandexFeedGenerator
}