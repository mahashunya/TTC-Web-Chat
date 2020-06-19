'use strict';
const passport = require('passport');
var User = require('../models/user');
var LocalStrategy = require('passport-local').Strategy;

passport.serializeUser((user, done) => { 
  //console.log(user)
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  })
});
passport.use('local.signup', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, (req, email, password, done) => {
  User.findOne({
    'email': email
  }, (err, user) => {
    if (err) {
      return done(err);
    }
    if (user) {
      return done(null, false, req.flash('error', 'User already exists'))
    }
  
    
    const newUser = new User();
    newUser.name = req.body.name;
    newUser.email = req.body.email;
    newUser.password = newUser.encryptPassword(req.body.password);
    // console.log(newUser)
    newUser.save()
    .then(user =>{
      done(null,user)
    })
    // .save(() => { console.log('hello')
      

    // });
  
  });
}));

//signin

passport.use('local.signin', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, (req, email, password, done) => {

  User.findOne({'email': email}, (err, user) => {
    if (err) {
      return done(err);
    }

    const messages = [];
    if (!user || !user.validUserPassword(password)) {
      messages.push('Invalid email or password');
      return done(null, false, req.flash('error', messages));
    }

    return done(null, user);
  });
}));