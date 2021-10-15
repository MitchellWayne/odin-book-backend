const express = require('express');
const router = express.Router();
const passport = require('passport');

const post_controller = require('../controllers/postController');

// Get post listing from user
router.get('/', post_controller.postlist_get);

// Create new post for user
router.post('/', passport.authenticate('jwt', {session: false}), post_controller.post_post);

// Get post by ID
router.get('/:postID', post_controller.post_get);

// Update post by ID
router.put('/:postID', passport.authenticate('jwt', {session: false}), post_controller.post_put);

// Delete post by ID
router.delete('/:postID', passport.authenticate('jwt', {session: false}), post_controller.post_delete);

module.exports = router;
