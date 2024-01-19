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
        console.log(__dirname)
        console.log(message)
        await fs.appendFile(`../server/logs/logs.txt`, `${timeStampLog} Ошибка: ${message} \n`, (err) => {
            if (err) {
                console.log(404, err);
            }
        })
        return new ApiError(404, message)
    }
    static async internal (message) {
        console.log(__dirname)
        console.log(500, message)
        await fs.appendFile(`../server/logs/logs.txt`, `${timeStampLog} Ошибка: ${message} \n`, (err) => {
            if (err) {
                console.log(err);
            }
        })
        return new ApiError(500, message)
    }
    static async forbidden (message) {
        console.log(__dirname)
        console.log(403, message)
        await fs.appendFile(`../server/logs/logs.txt`, `${timeStampLog} Ошибка: ${message} \n`, (err) => {
            if (err) {
                console.log(err);
            }
        })
        return new ApiError(403, message)
    }
}

module.exports = ApiError