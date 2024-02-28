const {Category, Product, ProductImages} = require('../models/models')
const fs = require('fs')


async function avitoFeedGenerator () {
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
<Ads target="Avito.ru" formatVersion="3">
%ads%
</Ads>`

        const content = `<AllowEmail>Да</AllowEmail>
    <InternetCalls>Нет</InternetCalls>
    <Condition>Новое</Condition>
    <Category>Товары для животных</Category>
    <Address>Анапа, улица Парковая, 60/1, оф. 26</Address>
    <Description>
<![CDATA[
<strong>ЗооЛАЙНЕР!</strong><br/>
Сухие и влажные корм для собак и кошек! Наполнители, переноски, одежда, аксессуары, и другие товары для ваших любимцев.<br/>
Бесплатная доставка по Анапе, Анапской и Супсеху при заказе от 1000 рублей, возможен самовывоз. Доставка в
Витязево, Гостагаевскую, Благовещенскую, Натухаевскую, Сукко, Варениковскую. <strong>Доставка в день заказа!</strong><br/> 
Оплата наличными/картой/переводом.<br/>
Полный актуальный каталог товаров всегда доступен на сайте <strong>https://zooliner.ru</strong>
]]>
    </Description>
    <Delivery>
        <Option>ПВЗ</Option>
        <Option>Свой курьер</Option>
    </Delivery>
    <ContactPhone>+7 (918) 495-85-13</ContactPhone>
    <AdStatus>Free</AdStatus>`
        const products = await Product.findAll({where: {published: true, productId: 0}, include: [
                {model: Product, as: 'children'},
                {model: Category, as: 'category'},
                {model: ProductImages, as: 'product_images'}
            ]})
        const ads = []
        products.filter(p => p?.product_images?.length>0 && p.price>1 && p?.category?.length>0).forEach(p => {
            if(p.children.length===0){
                ads.push(`  <Ad>
    <Id>${p.id}</Id>
    <Title>${p.title} ${p.shortDescription}</Title>
    <Price>${p.discountedPrice>0 ? p.discountedPrice : p.price}</Price>
    <Images>
    ${p.product_images.map(i =>
        `    <Image url="${process.env.API_URL}/images/products/${i.img}"/>`
                )}
    </Images>
    ${content}
</Ad>`)
            } else {
                p.children.filter(pc => pc.published && pc.price>1).forEach(pc => {
                    ads.push(`  <Ad>
    <Id>${pc.id}</Id>
    <Title>${p.title} ${p.shortDescription} ${pc.title}</Title>
    <Price>${pc.discountedPrice>0 ? pc.discountedPrice : pc.price}</Price>
    <Images>
    ${p.product_images.map(i =>
                        `    <Image url="${process.env.API_URL}/images/products/${i.img}"/>`
                    )}
    </Images>
    ${content}
</Ad>`)
                })
            }
        })
        const feed = template.replace("%ads%", ads.join('\n'))
            .replaceAll("&", "&amp;")
        await fs.writeFile('./static/xml/avitofeed.xml', feed, async (err) => {
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
    avitoFeedGenerator
}