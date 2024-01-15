const Router = require('express')
const router = new Router()
const userController = require('../controllers/userController')
const authMiddleware = require('../middleware/AuthMiddleware')
const checkRole = require('../middleware/CheckRoleMiddleware')

router.post('/registration', userController.registration)
router.post('/login', userController.login)
router.post('/login/vk', userController.VKID)
router.get('/auth', userController.check)
router.get('/', checkRole('ADMIN'), userController.getAll)
router.put('/modify', authMiddleware, userController.modify)
router.patch('/modify', checkRole('ADMIN'), userController.setRole)
router.post('/self', authMiddleware, userController.getSelf)
router.post('/logout', authMiddleware, userController.logout)
router.get('/activate/:link', userController.activate)
router.post('/reset', userController.sendResetPassMail)
router.post('/reset/apply', userController.resetPass)



module.exports = router