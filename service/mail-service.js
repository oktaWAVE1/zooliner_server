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
                </div>`
        })

    }

    async sendOrderToCustomer(to, order, paymentMethod, deliveryMethod) {
        const items = order.orderItems.map(i =>
            `<div>${i.name} ${i.discountedPrice ? i.discountedPrice : i.price} ${i.qty} - ${i.sum}</div>`
        )
        let itemsString = "".join(items)
        await this.transporter.sendMail({
            from: process.env.SMTP_USER,
            to,
            subject: `Заказ № ${order.orderNumber} принят`,
            text: '',
            html:
                `
                <div>
                <h2>Добрый день, ${order.customerName}. Ваш заказ № ${order.orderNumber} получен, мы скоро Вам перезвоним для уточнения деталей.</h2>
                <p>Ваш телефон для связи: ${order.customerTel}</p>
                <p>Адрес доставки: ${order.orderAddress}</p>
                <p>${order.comment? order.comment: ""}</p> 
                <p>Сумма Вашего заказа с учетом доставки: ${order.discountedSalesSum+order.deliverySum} р.</p>
                <p>Способ доставки: ${deliveryMethod}</p>
                <p>Стоимость доставки: ${order.deliverySum}</p>
                <p>Способ оплаты: ${paymentMethod}</p>
                <h2>Ваш заказ:</h2>
                ${itemsString}
                <div>Итого: {order.discountedSalesSum}</div>       
                </div>`
        })

    }

    async sendOrderToShop(order, paymentMethod, deliveryMethod) {
        const items = order.orderItems.map(i =>
            `<div>${i.name} ${i.discountedPrice ? i.discountedPrice : i.price} ${i.qty} - ${i.sum}</div>`
        )
        let itemsString = "".join(items)
        await this.transporter.sendMail({
            from: process.env.SMTP_USER,
            to: process.env.SHOP_EMAIL,
            subject: `Заказ № ${order.orderNumber}. Клиент: ${order.customerName}ю`,
            text: '',
            html:
                `
                <div>
                <p>Телефон для связи: ${order.customerTel}</p>
                <p>Адрес доставки: ${order.orderAddress}</p>
                <p>Комментарий к заказу: ${order.comment? order.comment: ""}</p> 
                <p>Сумма заказа с учетом доставки: ${order.discountedSalesSum+order.deliverySum} р.</p>
                <p>Способ доставки: ${deliveryMethod}</p>
                <p>Стоимость доставки: ${order.deliverySum}</p>
                <p>Способ оплаты: ${paymentMethod}</p>
                <h2>Заказ:</h2>
                ${itemsString}
                <div>Итого: {order.discountedSalesSum}</div>       
                </div>`
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