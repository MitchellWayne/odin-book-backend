const express = require('express');
const router = express.Router();

const user_controller = require('../controllers/userController');

// Get users listing
router.get('/', user_controller.userlist_get);

// Create new user
router.get('/', user_controller.user_post);

// Get user by ID
router.get('/:userID', user_controller.user_get);

// Update user by ID
router.put('/:userID', user_controller.user_put);

// Delete user by ID
router.delete('/:userID', user_controller.user_delete);

module.exports = router;
