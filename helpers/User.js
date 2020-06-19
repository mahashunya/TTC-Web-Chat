'use strict';

module.exports = function () {
  return {
    SignUpValidation: (req, res, next) => {
      // req.checkBody('name', 'Name is required').notEmpty();

      // req.checkBody('email','Email is required').notEmpty();
      // req.checkBody('email', 'Email is invalid').isEmail();
      // req.checkBody('password', 'Password is required').notEmpty();
      // req.checkBody('password', 'Password must not be less than 5 characters').isLength({min:5});

      req.getValidationResult()
        .then((result) => {
          const errors = result.array();
          const messages = [];
          errors.forEach((error) => {
            messages.push(error.msg);
          })
          req.flash('error', messages);
          res.redirect('/signup');
        })
        .catch((err) => {
          return next();
        })
    },



    LoginValidation: (req, res, next) => {


      // req.checkBody('email','Email is required').notEmpty();
      // req.checkBody('email', 'Email is invalid').isEmail();
      // req.checkBody('password', 'Password is required').notEmpty();
      // req.checkBody('password', 'Password must not be less than 5 characters').isLength({min:5});

      req.getValidationResult()
        .then((result) => {
          const errors = result.array();
          const messages = [];
          errors.forEach((error) => {
            messages.push(error.msg);
          })
          req.flash('error', messages);
          res.redirect('/signin');
        })
        .catch((err) => {
          return next();
        })
    }

  }
}