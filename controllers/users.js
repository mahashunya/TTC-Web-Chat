'use strict'

var User1 = require('../models/user')
var nodemailer = require("nodemailer");
var crypto = require("crypto");

module.exports = function (_, passport, User, async) {
  return {
    SetRouting: function (router) {
      router.get("/", this.indexPage);
      router.get("/signup", this.getSignUp);
      router.get("/signin", this.getSignIn);
      router.get("/forgot", function (req, res) {
        const errors = req.flash("error")
        return res.render("forgot", {
          title: "Text Connector | Forgot",
          messages: errors,
          hasErrors: errors.length > 0,
        });
      });
      router.get("/reset", function (req, res) {
        return res.render('reset')
      });


      router.post("/signin", User.LoginValidation, this.postSignIn);

      router.post("/signup", User.LoginValidation, this.postSignUp);



      router.post('/forgot', function (req, res, next) {
        async.waterfall([
          function (done) {
            crypto.randomBytes(20, function (err, buf) {
              var token = buf.toString('hex');
              done(err, token);
            });
          },
          function (token, done) {
            User1.findOne({
              email: req.body.email
            }, function (err, user) {
              if (!user) {
                req.flash('error', 'No account with that email address exists.');
                console.log('Invalid Email')
                return res.redirect('/forgot');
              }

              user.resetPasswordToken = token;
              user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
              req.flash('error', 'An email has been sent to you')
              user.save(function (err) {
                done(err, token, user);
              });
            });
          },
          function (token, user, done) {
            var smtpTransport = nodemailer.createTransport({
              service: "gmail",
              secure: false, //true
              port: 25, //465
              auth: {
                user: "teamtext.connect@gmail.com",
                pass: "teamtextconnector",
              },
              tls: {
                rejectUnauthorized: false,
              },
            });
            var mailOptions = {
              to: user.email,
              from: "teamtext.connect@gmail.com",
              subject: "Text Connect Password Reset",
              text: "You are receiving this because you have requested to reset the password of your TextConnect account.This link is valid only for an hour.\n\n" +
                "Please click on the following link to reset your password:\n\n" +
                "http://" +
                req.headers.host +
                "/reset/" +
                token +
                "\n\n" +
                "If you did not request this, please ignore this email and your password will remain unchanged.\n",
            };
            smtpTransport.sendMail(mailOptions, function (err) {
              console.log('mail sent');
              req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
              done(err, 'done');
            });
          }
        ], function (err) {
          if (err) return next(err);
          res.redirect('/forgot');
        });
      });

      router.get('/reset/:token', function (req, res) {
        User1.findOne({
          resetPasswordToken: req.params.token,
          resetPasswordExpires: {
            $gt: Date.now()
          }
        }, function (err, user) {
          if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            console.log('token invalid');
            
             
              
            return res.redirect('/forgot');
          }
          res.render('reset', {
            token: req.params.token
          });
        });
      });

      router.post('/reset/:token', function (req, res) {
        async.waterfall([
          function (done) {
            User1.findOne({
              resetPasswordToken: req.params.token,
              resetPasswordExpires: {
                $gt: Date.now()
              }
            }, function (err, user) {
              if (!user) {
                req.flash('error', 'Password reset token is invalid or has expired.');

                return res.redirect('back');
              }
              if ((user) && (req.body.password === req.body.confirm)) {
                var EmailV = req.body.email
                User1.findOne({

                  email: EmailV
                }, function (err, user) {

                  user.password = user.encryptPassword(req.body.confirm);
                  user.resetPasswordToken = undefined;
                  user.resetPasswordExpires = undefined;
                  user.save(function (err) {
                    done(err, user);
                    confirmMail(user, done);
                  });

                  function confirmMail(user, done) {
                    var smtpTransport = nodemailer.createTransport({
                      service: "gmail",
                      secure: false, //true
                      port: 25, //465
                      auth: {
                        user: "teamtext.connect@gmail.com",
                        pass: "teamtextconnector",
                      },
                      tls: {
                        rejectUnauthorized: false,
                      },
                    });
                    var mailOptions = {
                      to: user.email,
                      from: 'teamtext.connect@gmail.com',
                      subject: 'Your TextConnect password has been changed',
                      text: 'Hello,\n\n' +
                        'This is a confirmation that the password for your TextConnect account ' + user.email + ' has just been changed.\n'
                    };
                    smtpTransport.sendMail(mailOptions, function (err) {

                      req.flash('success', 'Success! Your password has been changed.');
                      console.log('password change successful');
                      done(err);
                    });
                  }
                })

                // user.setPassword(req.body.confirm, function (err) {



              } else {
                if (req.body.password != req.body.confirm) {
                 req.flash("error", "Passwords do not match.");
                  // console.log("error", "Passwords do not match.");
                  return res.redirect('forgot');
                }
              }
            });
          },

        ], function (err) {
          res.redirect('/home');
        });
      });

      //forget password ends

    },
    indexPage: function (req, res) {
      return res.render("index");
    },


    getSignIn: function (req, res) {
      const errors = req.flash("error");
      return res.render("signin", {
        title: "Text Connector | SignIn",
        messages: errors, user:req.user,
        hasErrors: errors.length > 0,
      });
    },

    postSignIn: passport.authenticate("local.signin", {
      successRedirect: "/home",
      failureRedirect: "/signin",
      failureFlash: true,
    }),
    getSignUp: function (req, res) {
      const errors = req.flash("error");
      return res.render("signup", {
        title: "Text Connector | SignUp",
        messages: errors, user: req.user,
        hasErrors: errors.length > 0,
      });
    },
    postSignUp: passport.authenticate("local.signup", {
      successRedirect: "/home",
      failureRedirect: "/signup",
      failureFlash: true,
    }),




  };
};