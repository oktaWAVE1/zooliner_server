require('dotenv').config()
const express = require('express')
const cors = require('cors')
const sequelize = require('./db')
const models = require('./models/models')
const router = require('./routes')
const path = require("path");
const errorHandler = require('./middleware/ErrorHandlingMiddleware')
const fileUpload = require('express-fileupload')
const cookieParser = require('cookie-parser')


const port = process.env.PORT || 5000

const app = express()
app.use(cookieParser())
app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URL
}))
app.use(express.json())
app.use(express.static(path.resolve(__dirname, 'static')))
app.use(fileUpload({}))
app.use('/api', router)

app.use(errorHandler)


const start = async () => {
    try{
        await sequelize.authenticate()
        await sequelize.sync()
        app.listen(port, () => console.log(`Server's started on port: ${port}`))
    } catch (e) {
        console.log(e)
    }
}

start()