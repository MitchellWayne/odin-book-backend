const express = require('express');
const router = express.Router();

const comment_controller = require('../controllers/commentController');

// Get comments listing
router.get('/', comment_controller.commentlist_get);

// Create new comment
router.get('/', comment_controller.comment_post);

// Get comment by ID
router.get('/:commentID', comment_controller.comment_get);

// Update comment by ID
router.put('/:commentID', comment_controller.comment_put);

// Delete comment by ID
router.delete('/:commentID', comment_controller.comment_delete);

module.exports = router;
