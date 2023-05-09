const Router = require('express')
const router = new Router()
const checkRole = require('../middleware/CheckRoleMiddleware')
const categoryController = require('../controllers/categoryController')

router.post('/', checkRole("ADMIN"), categoryController.create)
router.get('/', categoryController.getPublished)
router.get('/all', checkRole("ADMIN"), categoryController.getAll)
router.put('/', checkRole("ADMIN"), categoryController.modify)
router.delete('/', checkRole("ADMIN"), categoryController.delete)
router.post('/img', checkRole("ADMIN"), categoryController.addImg)
router.delete('/img', checkRole("ADMIN"), categoryController.delImg)

module.exports = router