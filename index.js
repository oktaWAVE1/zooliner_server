require('dotenv').config()
const express = require('express')
const cors = require('cors')
const sequelize = require('./db')
const sequelizeRemote = require('./db_remote')
const models = require('./models/models')  // import is required to work
const router = require('./routes')
const path = require("path");
const errorHandler = require('./middleware/ErrorHandlingMiddleware')
const fileUpload = require('express-fileupload')
const cookieParser = require('cookie-parser')
const {update} = require('./service/product-update-service')
const {sitemapGenerator} = require('./service/sitemap-generator')
const {yandexFeedGenerator} = require('./service/yandex-feed-generator')


const port = process.env.PORT || 5000

const app = express()
app.use(cookieParser())
app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URL
}))
app.use(express.json())
app.use(function(req, res, next) {
    res.setHeader('Cache-Control', 'no-cache');
    next();
})


app.use('/xml', express.static(path.resolve(__dirname, 'static/xml'), {
    setHeaders: function(res, path) {
        res.set("Access-Control-Allow-Origin", "*");
        // res.set("Access-Control-Allow-Headers");
        res.set("Access-Control-Allow-Methods","GET, OPTIONS");
        res.set("X-Powered-By",' 3.2.1')
        res.type("application/xml");
        res.status(200)
    }
}))
app.use(express.static(path.resolve(__dirname, 'static')))
app.use(fileUpload({}))
app.use('/api', router)

app.use(errorHandler)


const productUpdater = setInterval(() => update(2), 1000*60*5)
const productDailyUpdater = setInterval(() => update(240), 1000*60*60*24)
const sitemapDailyUpdater = setInterval(() => sitemapGenerator(), 1000*60*60*24)
const yandexFeedDailyUpdater = setInterval(() => yandexFeedGenerator(), 1000*60*60*24)
sitemapGenerator()
yandexFeedGenerator()

const start = async () => {
    try{
        await sequelize.authenticate()
        await sequelize.sync()
        await sequelizeRemote.authenticate()
        await sequelizeRemote.sync()

        app.listen(port, () => console.log(`Server's started on port: ${port}`))
    } catch (e) {
        console.log(e)
    }
}

start()