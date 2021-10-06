const express = require('express');
const router = express.Router();

const post_controller = require('../controllers/postController');

// Get post listing
router.get('/', post_controller.postlist_get);

// Create new post
router.get('/', post_controller.post_post);

// Get post by ID
router.get('/:postID', post_controller.post_get);

// Update post by ID
router.put('/:postID', post_controller.post_put);

// Delete post by ID
router.delete('/:postID', post_controller.post_delete);

module.exports = router;
