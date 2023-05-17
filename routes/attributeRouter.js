const Router = require('express')
const router = new Router()
const attributeController = require('../controllers/attributeController')
const authMiddleware = require('../middleware/AuthMiddleware')
const checkRole = require('../middleware/CheckRoleMiddleware')


router.get('/category',checkRole('ADMIN'), attributeController.getAllCategories)
router.post('/category',checkRole('ADMIN'), attributeController.createCategory)
router.put('/category',checkRole('ADMIN'), attributeController.changeCategory)
router.delete('/category',checkRole('ADMIN'), attributeController.deleteCategory)
router.get('/',checkRole('ADMIN'), attributeController.getAllAttributes)
router.post('/',checkRole('ADMIN'), attributeController.createAttribute)
router.put('/',checkRole('ADMIN'), attributeController.changeAttribute)
router.delete('/',checkRole('ADMIN'), attributeController.deleteAttribute)

module.exports = router