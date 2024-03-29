const Router = require('express')
const router = new Router()
const basketController = require('../controllers/basketController')
const authMiddleware = require("../middleware/AuthMiddleware");
const userController = require("../controllers/userController");

router.get('/', authMiddleware, basketController.get)
router.get('/unauthorized', basketController.getUnauthorized)
router.post('/', authMiddleware, basketController.add)
router.post('/copy/:orderId', authMiddleware, basketController.copyOrder)
router.put('/', authMiddleware, basketController.modify)
router.delete('/', authMiddleware, basketController.del)
router.delete('/clear', authMiddleware, basketController.clear)


module.exports = router