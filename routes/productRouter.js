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
module.exports = router