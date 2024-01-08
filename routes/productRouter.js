const Router = require('express')
const checkRole = require("../middleware/CheckRoleMiddleware");
const productController = require("../controllers/productController");
const router = new Router()

router.post('/', checkRole("ADMIN"), productController.create)
router.get('/', productController.getPublished)
router.get('/in_category/:id', productController.getPublishedProductInCategory)
router.get('/search/:query', productController.getSearchedPublishedProducts)
router.get('/item/:id', productController.getPublishedProduct)
router.get('/current/:id', checkRole("ADMIN"), productController.getProduct)
router.patch('/current/:id', checkRole("ADMIN"), productController.updateProductIndex)
router.get('/all', checkRole("ADMIN"), productController.getAll)
router.put('/', checkRole("ADMIN"), productController.modify)
router.delete('/', checkRole("ADMIN"), productController.delete)
router.post('/img', checkRole("ADMIN"), productController.addImg)
router.patch('/img', checkRole("ADMIN"), productController.setMasterImg)
router.delete('/img', checkRole("ADMIN"), productController.delImg)
router.post('/attribute', checkRole("ADMIN"), productController.addAttribute)
router.delete('/attribute', checkRole("ADMIN"), productController.delAttribute)
router.post('/category', checkRole("ADMIN"), productController.addProductCategory)
router.delete('/category', checkRole("ADMIN"), productController.delProductCategory)
module.exports = router