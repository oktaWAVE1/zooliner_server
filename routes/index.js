const Router = require('express')
const router = new Router()
const userRouter = require('./userRouter')
const productRouter = require('./productRouter')
const categoryRouter = require('./categoryRouter')
const orderRouter = require('./orderRouter')
const brandRouter = require('./brandRouter')
const basketRouter = require('./basketRouter')
const bonusRouter = require('./bonusRouter')

router.use('/user', userRouter)
router.use('/category', categoryRouter)
router.use('/product', productRouter)
router.use('/order', orderRouter)
router.use('/brand', brandRouter)
router.use('/basket', basketRouter)
router.use('/bonus', bonusRouter)



module.exports = router