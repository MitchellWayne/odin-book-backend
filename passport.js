const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcryptjs = require('bcryptjs');
const passportJWT = require("passport-jwt");
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

const User = require('./models/user');

require('dotenv').config();

// This is used only for logging in
passport.use(
  new LocalStrategy((username, password, done) => {
    User.findOne({username: username}, (err, theUser) => {
      if (err) return done(err);
      if (!theUser) return done(null, false, { message: "Incorrect username or password" });
      bcryptjs.compare(password, theUser.password, (err, res) => {
        if (res) {
          // Remove encrypted password from return object
          // (Need to convert mongoose object to js object)
          let safeUser = theUser.toObject();
          delete safeUser.password;

          return done(null, safeUser);
        }
        else return done (null, false, { message: "Incorrect username or password" });
      });
    });
  })
);

// This is used everytime an endpoint is called, checking the client's header
//  to see if they have a verified Bearer Token
passport.use(
  new JWTStrategy({
    // jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    jwtFromRequest: req => req.cookies.token,
    secretOrKey: process.env.JWT_SECRET,
  },
  function (jwtPayload, callback){
    return User.findOne({_id: jwtPayload.user_id})
    .then(user => { return callback(null, user); })
    .catch(err => { return callback(err); });
  }
  )
);