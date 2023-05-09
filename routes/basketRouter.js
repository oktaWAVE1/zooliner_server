const Router = require('express')
const router = new Router()
const basketController = require('../controllers/basketController')
const authMiddleware = require("../middleware/AuthMiddleware");
const userController = require("../controllers/userController");

router.get('/', authMiddleware, basketController.get)
router.post('/', authMiddleware, basketController.add)
router.put('/', authMiddleware, basketController.modify)
router.delete('/', authMiddleware, basketController.del)
router.delete('/clear', authMiddleware, basketController.clear)


module.exports = router