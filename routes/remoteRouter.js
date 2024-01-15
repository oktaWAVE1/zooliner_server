const Router = require('express')
const router = new Router()
const userController = require('../controllers/remoteController')
const authMiddleware = require('../middleware/AuthMiddleware')
const checkRole = require('../middleware/CheckRoleMiddleware')


router.get('/customers', checkRole('ADMIN'), userController.getCustomers)
router.get('/products', userController.getAllRemoteProducts)




module.exports = router