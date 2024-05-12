const fs = require("fs");
const date = new Date()


class ApiError extends Error {
    constructor(status, message) {
        super();
        this.status = status
        this.message = message
    }
    static async badRequest (message) {
        console.log(message)
        const timeStampLog = date.toLocaleString()
        await fs.appendFile(`./logs/logs.txt`, `${timeStampLog} Ошибка: ${message} \n`, (err) => {
            if (err) {
                console.log(404, err);
            }
        })
        return new ApiError(404, message)
    }
    static async needEmailApproval (message) {
        console.log(message)
        const timeStampLog = date.toLocaleString()
        await fs.appendFile(`./logs/logs.txt`, `${timeStampLog} Ошибка: ${message} \n`, (err) => {
            if (err) {
                console.log(423, err);
            }
        })
        return new ApiError(423, message)
    }
    static async internal (message) {
        console.log(500, message)
        const timeStampLog = date.toLocaleString()
        await fs.appendFile(`./logs/logs.txt`, `${timeStampLog} Ошибка: ${message} \n`, (err) => {
            if (err) {
                console.log(err);
            }
        })
        return new ApiError(500, message)
    }
    static async forbidden (message) {
        console.log(403, message)
        const timeStampLog = date.toLocaleString()
        await fs.appendFile(`./logs/logs.txt`, `${timeStampLog} Ошибка: ${message} \n`, (err) => {
            if (err) {
                console.log(err);
            }
        })
        return new ApiError(403, message)
    }
}

module.exports = ApiError