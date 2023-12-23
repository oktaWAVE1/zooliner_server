require('dotenv').config()
const nodemailer = require('nodemailer')
const fs = require("fs");


class MailService {

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: true,
            tls: {
                rejectUnauthorized: false,
            },
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
        }
        })
    }

    async sendActivationMail(to, link) {
        let html = fs.readFileSync('templates/email/order.html', { encoding: 'utf-8' })
        html = html.replace("${greeting}", `Рады приветсвовать Вас на сайте ${process.env.API_URL}!`)
        html = html.replace("${text}", `
                <div>
                    <h4>Для завершения регистрации перейдите по <a href="${link}" target="_blank">>ссылке</a></h4>                    
                    <h4>Если не получилось, скопируйте следующую ссылку в строку браузера: <br/>
                        <a href="${link}" target="_blank">${link}</a>                    
                    </h4>
                </div>`)
        await this.transporter.sendMail({
            from: `"ЗооЛАЙНЕР" <${process.env.SMTP_USER}>`,
            to,
            subject: 'Активация аккаунта на ' + process.env.API_URL,
            text: '',
            html
        }).catch(async (e) => {
            console.log(e)
            const date = new Date()
            const timeStampLog = date.toLocaleString()

            await fs.appendFile(`../server/logs/logs.txt`, `${timeStampLog} Ошибка: ${e} \n`, (err) => {
                if (err) {
                    console.log(err);
                }
            })
        })

    }

    async sendOrderToCustomer(to, order, paymentMethod, deliveryMethod) {
        const items = order.order_items.map(i =>
            `<div style="color:#637381; width: 100%">${i.name} | ${i.discountedPrice ? i.discountedPrice : i.price} ₽ | ${i.qty} шт. - ${i.sum} ₽</div><hr style="color: #AAAAAA; line-height: 3px;" />`
        )
        const itemsString = items.join(' ')
        const total = order.discountedSalesSum+order.deliverySum-order.bonusPointsUsed
        let html = fs.readFileSync('templates/email/order.html', { encoding: 'utf-8' })
        html = html.replace("${greeting}", `Добрый день, ${order.customerName}. Ваш заказ № ${order.orderNumber} получен, мы скоро Вам перезвоним для уточнения деталей.`)
        html = html.replace("${text}", `  <div style="color:#637381">Ваш телефон для связи: ${order.customerTel}</div>
                    <div style="color:#637381">Адрес доставки: ${order.orderAddress}</div>
                    ${order.comment ? `<div style="color:#637381">Комментарий к заказу: ${order.comment}</div>` : ""}
                    <div style="color:#637381">Сумма Вашего заказа с учетом доставки: ${order.discountedSalesSum+order.deliverySum} ₽</div>
                    <div style="color:#637381">Способ доставки: ${deliveryMethod}</div>
                    <div style="color:#637381">Стоимость доставки: ${order.deliverySum} ₽</div>
                    <div style="color:#637381">Способ оплаты: ${paymentMethod}</div>
                    <h3 style="color:#637381; margin: 0.6rem 0; text-align: center;">Ваш заказ:</h3>
                    ${itemsString}
                    ${order.bonusPointsUsed>0 ? `<br/><div style="color:#637381">Бонусов использовано: <strong>${order.bonusPointsUsed}</strong></div>` : ''}
                    <h3 style="color:#637381; text-align: right;">Итого: ${total} ₽</h3>       `)
        await this.transporter.sendMail({
            from: `"ЗооЛАЙНЕР" <${process.env.SMTP_USER}>`,
            to,
            subject: `Заказ № ${order.orderNumber} принят`,
            text: '',
            html
        }).catch(async (e) => {
            console.log(e)
            const date = new Date()
            const timeStampLog = date.toLocaleString()

            await fs.appendFile(`../server/logs/logs.txt`, `${timeStampLog} Ошибка: ${e} \n`, (err) => {
                if (err) {
                    console.log(err);
                }
            })
        })

    }

    async sendOrderToShop(order, paymentMethod, deliveryMethod) {
        const items = order.order_items.map(i =>
            `<div style="color:#637381; width: 100%">${i?.product?.SKU}. ${i.name} | ${i.discountedPrice ? i.discountedPrice : i.price} ₽ | ${i.qty} шт. - ${i.sum} ₽<hr style="color: #AAAAAA; line-height: 5px;" /></div>`
        )
        const total = order.discountedSalesSum+order.deliverySum-order.bonusPointsUsed
        const itemsString = items.join(' ')
        let html = fs.readFileSync('templates/email/order.html', { encoding: 'utf-8' })
        html = html.replace("${greeting}", `Новый заказ, ${order.orderNumber}. Клиент: ${order.customerName}`)
        html = html.replace("${text}", `  <div></div><div style="color:#637381">Телефон: ${order.customerTel}</div>
                    <div style="color:#637381">Адрес доставки: ${order.orderAddress}</div>
                    ${order.comment ? `<div style="color:#637381">Комментарий к заказу: ${order.comment}</div>` : ""}
                    <div style="color:#637381">Сумма заказа с учетом доставки: ${order.discountedSalesSum+order.deliverySum} ₽</div>
                    <div style="color:#637381">Способ доставки: ${deliveryMethod}</div>
                    <div style="color:#637381">Стоимость доставки: ${order.deliverySum} ₽</div>
                    <div style="color:#637381">Способ оплаты: ${paymentMethod}</div>
                    <h3 style="color:#637381; margin: 0.6rem 0; text-align: center;">Заказ:</h3>
                    ${itemsString}
                    ${order.bonusPointsUsed>0 ? `<br/><div style="color:#637381">Бонусов использовано: <strong>${order.bonusPointsUsed}</strong></div>` : ''}
                    <h3 style="color:#637381; text-align: right;">Итого: ${total} ₽</h3>
                    </div>`)
        await this.transporter.sendMail({

            from: `"ЗооЛАЙНЕР" <${process.env.SMTP_USER}>`,
            to: process.env.SHOP_EMAIL,
            subject: `Новый заказ № ${order.orderNumber}. Клиент: ${order.customerName}`,
            text: '',
            html
        }).catch(async (e) => {
            console.log(e)
            const date = new Date()
            const timeStampLog = date.toLocaleString()

            await fs.appendFile(`../server/logs/logs.txt`, `${timeStampLog} Ошибка: ${e} \n`, (err) => {
                if (err) {
                    console.log(err);
                }
            })
        })
    }

    async sendResetPassMail(to, link) {
        let html = fs.readFileSync('templates/email/order.html', { encoding: 'utf-8' })
        html = html.replace("${greeting}", `Рады приветсвовать Вас на сайте ${process.env.API_URL}!`)
        html = html.replace("${text}", `
                <div>
                    <h4>Для сброса пароля перейдите по <a href="${link}" target="_blank">>ссылке</a></h4>                    
                    <h4>Если не получилось, скопируйте следующую ссылку в строку браузера: <br/>
                        <a href="${link}" target="_blank">${link}</a>                    
                    </h4>
                </div>`)
        await this.transporter.sendMail({
            from: `"ЗооЛАЙНЕР" <${process.env.SMTP_USER}>`,
            to,
            subject: 'Сброс пароля для ' + process.env.CLIENT_URL,
            text: '',
            html
        }).catch(async (e) => {
            console.log(e)
            const date = new Date()
            const timeStampLog = date.toLocaleString()

            await fs.appendFile(`../server/logs/logs.txt`, `${timeStampLog} Ошибка: ${e} \n`, (err) => {
                if (err) {
                    console.log(err);
                }
            })
        })

    }



}

module.exports = new MailService()