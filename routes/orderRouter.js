const Router = require('express')
const router = new Router()
const orderController = require('../controllers/orderController')
const authMiddleware = require("../middleware/AuthMiddleware");
const checkRole = require("../middleware/CheckRoleMiddleware");

router.get('/:accessLink', orderController.getOrder)
router.get('/:id', checkRole('ADMIN'), orderController.checkOrder)
router.get('/all', checkRole('ADMIN'), orderController.getAll)
router.get('/', authMiddleware, orderController.userOrders)
router.delete('/:accessLink', orderController.clearOrder)
router.patch('/:id', checkRole('ADMIN'), orderController.changeStatus)
router.post('/', orderController.createOrder)
router.patch('/', orderController.placeOrder)




module.exports = router