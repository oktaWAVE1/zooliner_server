const Router = require('express')
const router = new Router()
const checkRole = require('../middleware/CheckRoleMiddleware')
const promotionController = require('../controllers/promotionController')

router.post('/', checkRole("ADMIN"), promotionController.create)
router.get('/all', checkRole("ADMIN"), promotionController.getAll)
router.get('/', promotionController.getValid)
router.put('/', checkRole("ADMIN"), promotionController.modify)
router.patch('/index', checkRole("ADMIN"), promotionController.setIndex)
router.delete('/', checkRole("ADMIN"), promotionController.delete)

module.exports = router