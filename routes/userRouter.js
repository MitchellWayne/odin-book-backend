const express = require('express');
const router = express.Router();
const passport = require('passport');

const multer = require('multer');
const upload = multer({ dest: 'uploads/ '});

const user_controller = require('../controllers/userController');

// Get users listing
router.get('/', user_controller.userlist_get);

// Direct user routes
router.post('/', user_controller.user_post);
router.get('/:userID', user_controller.user_get);
router.put('/:userID', passport.authenticate('jwt', {session: false}), user_controller.user_put);
router.delete('/:userID', passport.authenticate('jwt', {session: false}), user_controller.user_delete);

// User friend routes
router.post('/:userID/friends', passport.authenticate('jwt', {session: false}), user_controller.user_friend_post);
router.delete('/:userID/friends', passport.authenticate('jwt', {session: false}), user_controller.user_friend_delete);

// User friend request routes
router.post('/:userID/requests', passport.authenticate('jwt', {session: false}), user_controller.user_request_post);
router.delete('/:userID/requests', passport.authenticate('jwt', {session: false}), user_controller.user_request_delete);

// User auth
router.post('/login', user_controller.user_login_post);
router.post('/logout', passport.authenticate('jwt', {session: false}), user_controller.user_logout_post);

// Misc
router.get('/:userID/pfp', user_controller.user_pfp_get);
router.get('/:userID/pfpS3/:key', passport.authenticate('jwt', {session: false}), user_controller.user_pfpS3_get);
router.post('/:userID/pfpS3', passport.authenticate('jwt', {session: false}), upload.single('pfp'), user_controller.user_pfpS3_post);

module.exports = router;
