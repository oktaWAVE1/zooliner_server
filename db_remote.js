require('dotenv').config()
const {Sequelize} = require('sequelize')


module.exports = new Sequelize(
    process.env.DB_REMOTE_NAME, // db name
    process.env.DB_REMOTE_USER, // user
    process.env.DB_REMOTE_PASSWORD, // pwd

    {
        dialect: "mysql",
        host: process.env.DB_REMOTE_HOST,
        port: process.env.DB_REMOTE_PORT,
        define: {
            charset: 'utf8',
            engine: 'MYISAM',
            collate: 'utf8_unicode_ci',
            dialectOptions: { collate: 'utf8_unicode_ci' },
            timestamps: false,
        },
        pool: {
            max: 5,
            min: 0,
            acquire: 60000,
            idle: 10000
        },
        dialectOptions: {
            connectTimeout: 60000
        }
    }

)