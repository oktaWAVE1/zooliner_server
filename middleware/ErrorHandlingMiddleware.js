const ApiError = require('../error/ApiError')

module.exports = async function(err, req, res, next) {
    const error = await err
    if (error instanceof ApiError) {
        return res.status(error.status).json({message: error.message})
    }
    return res.status(500).json({message: "Непредвиденная ошибка."})
    next()
}