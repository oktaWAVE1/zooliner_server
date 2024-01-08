const fs = require("fs");
const date = new Date()
const timeStampLog = date.toLocaleString()

class ApiError extends Error {
    constructor(status, message) {
        super();
        this.status = status
        this.message = message
    }
    static async badRequest (message) {
        await fs.appendFile(`../server/logs/logs.txt`, `${timeStampLog} Ошибка: ${message} \n`, (err) => {
            if (err) {
                console.log(err);
            }
        })
        return new ApiError(404, message)
    }
    static async internal (message) {
        await fs.appendFile(`../server/logs/logs.txt`, `${timeStampLog} Ошибка: ${message} \n`, (err) => {
            if (err) {
                console.log(err);
            }
        })
        return new ApiError(500, message)
    }
    static async forbidden (message) {
        await fs.appendFile(`../server/logs/logs.txt`, `${timeStampLog} Ошибка: ${message} \n`, (err) => {
            if (err) {
                console.log(err);
            }
        })
        return new ApiError(403, message)
    }
}

module.exports = ApiError