const Router = require('express')
const router = new Router()
const remoteController = require('../controllers/remoteController')
const authMiddleware = require('../middleware/AuthMiddleware')
const checkRole = require('../middleware/CheckRoleMiddleware')


router.get('/customers', checkRole('ADMIN'), remoteController.getCustomers)
router.get('/today_deliveries', checkRole('ADMIN'), remoteController.getRealizationsDeliveriesToday)
router.get('/products', remoteController.getAllRemoteProducts)





module.exports = router