const Router = require('express')
const router = new Router()
const orderController = require('../controllers/orderController')
const authMiddleware = require("../middleware/AuthMiddleware");
const checkRole = require("../middleware/CheckRoleMiddleware");

router.get('/current/:id', checkRole('ADMIN'), orderController.checkOrder)
router.get('/all', checkRole('ADMIN'), orderController.getAll)
router.get('/user/', authMiddleware, orderController.userOrders)
router.get('/access/:accessLink', orderController.getOrder)
router.delete('/access/:accessLink', checkRole('ADMIN'),orderController.clearOrder)
router.patch('/status/:id', checkRole('ADMIN'), orderController.changeStatus)
router.get('/status', checkRole('ADMIN'), orderController.getStatuses)
router.post('/', authMiddleware, orderController.createOrder)
router.post('/unauthorized', orderController.createOrderUnauthorized)
router.patch('/', orderController.placeOrder)




module.exports = router