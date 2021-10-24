const express = require('express');
const router = express.Router({mergeParams: true});

const comment_controller = require('../controllers/commentController');

// Get comments listing from postID
router.get('/', comment_controller.commentlist_get);

// Direct comment routes
router.post('/', comment_controller.comment_post);
router.get('/:commentID', comment_controller.comment_get);
// router.put('/:commentID', comment_controller.comment_put);
router.delete('/:commentID', comment_controller.comment_delete);

module.exports = router;
