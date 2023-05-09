const Router = require('express')
const router = new Router()
const checkRole = require('../middleware/CheckRoleMiddleware')
const brandController = require('../controllers/brandController')

router.post('/', checkRole("ADMIN"), brandController.create)
router.get('/all', checkRole("ADMIN"), brandController.getAll)
router.get('/', brandController.getPublished)
router.put('/', checkRole("ADMIN"), brandController.modify)
router.delete('/', checkRole("ADMIN"), brandController.delete)

module.exports = router