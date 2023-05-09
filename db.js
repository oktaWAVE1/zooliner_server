require('dotenv').config()
const {Sequelize} = require('sequelize')


module.exports = new Sequelize(
    process.env.DB_NAME, // db name
    process.env.DB_USER, // user
    process.env.DB_PASSWORD, // pwd
    {
        dialect: "postgres",
        host: process.env.DB_HOST,
        port: process.env.DB_PORT

    }

)