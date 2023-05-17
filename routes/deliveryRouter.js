const Router = require('express')
const router = new Router()
const checkRole = require('../middleware/CheckRoleMiddleware')
const deliveryController = require('../controllers/deliveryController')

router.post('/', checkRole("ADMIN"), deliveryController.create)
router.get('/', deliveryController.getAll)
router.put('/', checkRole("ADMIN"), deliveryController.modify)
router.delete('/', checkRole("ADMIN"), deliveryController.delete)

module.exports = router