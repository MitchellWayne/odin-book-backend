const express = require('express');
const router = express.Router({mergeParams: true});
const passport = require('passport');

const comment_controller = require('../controllers/commentController');

// Get comments listing from postID
router.get('/', comment_controller.commentlist_get);

// Direct comment routes
router.post('/', passport.authenticate('jwt', {session: false}), comment_controller.comment_post);
router.get('/:commentID', comment_controller.comment_get);
// router.put('/:commentID', comment_controller.comment_put);
router.delete('/:commentID', passport.authenticate('jwt', {session: false}), comment_controller.comment_delete);

module.exports = router;
