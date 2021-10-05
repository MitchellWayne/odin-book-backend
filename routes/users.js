const express = require('express');
const router = express.Router();

const users_controller = require('../controllers/usersController');

/* GET users listing. */
router.get('/', users_controller.users_get);

module.exports = router;
