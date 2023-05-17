const Router = require('express')
const checkRole = require("../middleware/CheckRoleMiddleware");
const productController = require("../controllers/productController");
const router = new Router()

router.post('/', checkRole("ADMIN"), productController.create)
router.get('/', productController.getPublished)
router.get('/all', checkRole("ADMIN"), productController.getAll)
router.put('/', checkRole("ADMIN"), productController.modify)
router.delete('/', checkRole("ADMIN"), productController.delete)
router.post('/img', checkRole("ADMIN"), productController.addImg)
router.delete('/img', checkRole("ADMIN"), productController.delImg)
router.post('/attribute', checkRole("ADMIN"), productController.addAttribute)
router.delete('/attribute', checkRole("ADMIN"), productController.delAttribute)
router.post('/category', checkRole("ADMIN"), productController.addProductCategory)
router.delete('/category', checkRole("ADMIN"), productController.delProductCategory)
module.exports = router