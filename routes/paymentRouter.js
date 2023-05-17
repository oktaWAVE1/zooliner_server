const Router = require('express')
const router = new Router()
const checkRole = require('../middleware/CheckRoleMiddleware')
const paymentController = require('../controllers/paymentController')

router.post('/', checkRole("ADMIN"), paymentController.create)
router.get('/', paymentController.getAll)
router.put('/', checkRole("ADMIN"), paymentController.modify)
router.delete('/', checkRole("ADMIN"), paymentController.delete)

module.exports = router