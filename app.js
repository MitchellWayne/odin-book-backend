const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const passport = require('passport');
const cors = require('cors');

const indexRouter = require('./routes/index');
const userRouter = require('./routes/userRouter');
const postRouter = require('./routes/postRouter');
const commentRouter = require('./routes/commentRouter');

require('dotenv').config();
require('./passport');

// MongoDB Setup
let mongoose = require('mongoose');
mongoose.connect(
  process.env.DB_CRED,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
);
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(cors({
  origin: 'http://localhost:3001'
}));

app.use('/', indexRouter);
userRouter.use('/:userID/posts', postRouter);
postRouter.use('/:postID/comments', commentRouter);
app.use('/users', userRouter);

// app.use('/users/:userID/posts', postRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
