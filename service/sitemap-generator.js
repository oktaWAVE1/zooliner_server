const {Category, Product} = require('../models/models')
const fs = require('fs')


async function sitemapGenerator () {
    try {
        let template = `<?xml version="1.0" encoding="UTF-8"?>
            <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
                <url>
                    <loc>${process.env.CLIENT_URL}</loc>
                    <changefreq>weekly</changefreq>
                    <priority>0.8</priority>
                </url>
                 <url>
                    <loc>${process.env.CLIENT_URL}/bonus</loc>
                    <changefreq>monthly</changefreq>
                    <priority>0.6</priority>
                </url>
                <url>
                    <loc>${process.env.CLIENT_URL}/contacts</loc>
                    <changefreq>monthly</changefreq>
                    <priority>0.6</priority>
                </url>
                <url>
                    <loc>${process.env.CLIENT_URL}/payment_and_delivery</loc>
                    <changefreq>monthly</changefreq>
                    <priority>0.6</priority>
                </url>
                <url>
                    <loc>${process.env.CLIENT_URL}/royal</loc>
                    <changefreq>monthly</changefreq>
                    <priority>0.6</priority>
                </url>
                %urls%
            </urlset>`
        const categories = await Category.findAll({where: {published: true}})
        const products = await Product.findAll({where: {published: true, productId: 0}})
        const pages = []
        categories.forEach(c => {
            pages.push(`                <url>
                    <loc>${process.env.CLIENT_URL}/category/${c.id}</loc>
                    <changefreq>weekly</changefreq>
                    <priority>0.8</priority>
                </url>`)
        })
        products.forEach(p => {
            pages.push(`                <url>
                    <loc>${process.env.CLIENT_URL}/product/${p.id}</loc>
                    <changefreq>daily</changefreq>
                    <priority>1</priority>
                </url>`)
        })
        const sitemap = template.replace("%urls%", pages.join('\n'))
        await fs.writeFile('./static/sitemap.xml', sitemap, async (err) => {
            await fs.appendFile(`./logs/logs.txt`, `${err} \n`, (err) => {
                if (err) {
                    console.log(err);
                }
            })
        })
    } catch (e) {
        await fs.appendFile(`./logs/logs.txt`, `${e.message} \n`, (err) => {
            if (err) {
                console.log(err);
            }
        })
    }

}

module.exports = {
    sitemapGenerator
}