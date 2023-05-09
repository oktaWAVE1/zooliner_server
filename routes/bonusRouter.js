const Router = require('express')
const router = new Router()
const bonusController = require('../controllers/bonusController')
const authMiddleware = require('../middleware/AuthMiddleware')
const checkRole = require('../middleware/CheckRoleMiddleware')



router.get('/', authMiddleware, bonusController.get)
router.get('/logs', checkRole('ADMIN'), bonusController.getLogs)
router.post('/', checkRole('ADMIN'), bonusController.add)
router.put('/', checkRole('ADMIN'), bonusController.orderBonus)

module.exports = router