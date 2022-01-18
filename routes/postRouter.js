const express = require('express');
const router = express.Router({mergeParams: true});
const passport = require('passport');

const multer = require('multer');
const upload = multer({ dest: 'uploads/ '});

const post_controller = require('../controllers/postController');

// Get post listing from user
router.get('/', post_controller.postlist_get);

// Direct post routes
router.post('/', passport.authenticate('jwt', {session: false}), upload.single('imgfile'), post_controller.post_post);
router.get('/:postID', post_controller.post_get);
router.put('/:postID', passport.authenticate('jwt', {session: false}), post_controller.post_put);
router.delete('/:postID', passport.authenticate('jwt', {session: false}), post_controller.post_delete);

// Post likes
router.post('/:postID/like', passport.authenticate('jwt', {session: false}), post_controller.post_like_post);
router.delete('/:postID/like', passport.authenticate('jwt', {session: false}), post_controller.post_like_delete);

// Misc
router.get('/:postID/imgS3/:key', passport.authenticate('jwt', {session: false}), user_controller.post_imgS3_get);



module.exports = router;
