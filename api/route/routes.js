const express = require('express');

const router = express.Router();

const userController = require('../controllers/userController');

const auth = require('../middleware/middleware');

router.get('/api/users', userController.all);
router.get('/api/user/', auth, userController.find);
router.put('/api/user/:id', auth, userController.update);
router.delete('/api/user/:id', auth, userController.delete);
router.post('/api/user/register', userController.register);
router.post('/api/auth/login', userController.login);
router.post('/api/auth/logout', userController.logout);

module.exports = router;
