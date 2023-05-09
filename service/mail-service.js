require('dotenv').config()
const nodemailer = require('nodemailer')


class MailService {

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_APP_PASSWORD
        }
        })

    }

    async sendActivationMail(to, link) {
        await this.transporter.sendMail({
            from: process.env.SMTP_USER,
            to,
            subject: 'Активация аккаунта на ' + process.env.API_URL,
            text: '',
            html:
                `
                <div>
                <h2>Для активации перейдите по ссылке:</h2>
                <a href="${link}" target="_blank">${link}</a>
                </div>
                `

        })

    }

    async sendResetPassMail(to, link) {
        await this.transporter.sendMail({
            from: process.env.SMTP_USER,
            to,
            subject: 'Сброс пароля для ' + process.env.CLIENT_URL,
            text: '',
            html:
                `
                <div>
                <h2>Для сброса пароля по ссылке:</h2>
                <a href="${link}" target="_blank">${link}</a>
                </div>
                `

        })

    }



}

module.exports = new MailService()