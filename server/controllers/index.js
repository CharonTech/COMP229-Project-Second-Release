const moment = require('moment');
const passport = require('passport');
// define the Tournament model
const Tournament = require("../models/tournament");

// import the user model
const User = require('../models/user').userModel;

// Display Home Page
module.exports.displayHomePage = (req, res) => {

    Tournament.find((err, tournaments) => {
        if (err)
        {
            return console.error(err);
        }
        else
        {
            res.render('tournament/homepage', {
                title: 'Home Page',
                tournaments: tournaments,
                moment: moment,
                firstName: req.user ? req.user.firstName : "",
            });
        }
    });
};

// Display register page
module.exports.displayRegisterPage = (req, res) => {
    if (!req.user)
    {
        res.render('auth/register',
            {
                layout: 'layouts/authLayout',
                title: "Register",
                messages: req.flash("registerMessage"),
                heading: "Registration"
            });
    }
    else
    {
        return res.redirect('/');
    }
  
};

// Process register page
module.exports.processRegisterPage = (req, res) => {
    // instantiate a user object
    let newUser = new User({
        username: req.body.username,
        emailAddress: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName
    });

    User.register(newUser, req.body.password, (err) => {
        //server error
        if (err) {
      
            if (err.name == "UserExistsError") {
                req.flash("registerMessage", "Registration Error: User already exists!");
            }
            return res.render('auth/register',
                {
                    layout: "layouts/authLayout",
                    title: "Register",
                    messages: req.flash("registerMessage"),
                    firstName: req.user ? req.user.firstName : '',
                    heading: "Registration"
                });
        }
        else {
            // if no error is present, registration successful
            //redirect the user, authenticate user
      
            return passport.authenticate('local')(req, res, () => {
                res.redirect('/tournaments');
            });
        }
    });
};

// Display Login Page
module.exports.displayLoginPage = (req, res) => {
    if (!req.user)
    {
        res.render('auth/login',
        {
            layout: "layouts/authLayout",
            title: "Login",
            messages: req.flash("loginMessage"),
            heading: "User Login"
        });
    }
    else
    {
        return res.redirect('/');
    }
};

// Process Login Page
module.exports.processLoginPage = (req, res, next) => {
    passport.authenticate('local',
        (err, user, info) => {
            //server err
            if (err) {
                return next(err);
            }
            //if user login error
            if (!user) {
                req.flash('loginMessage', 'Authentication Error');
                return res.redirect('/login');
            }
            else {
                req.login(user, (err) => {
                    //server error
                    if (err) {
                        return next(err);
                    }

                    return res.redirect('/tournaments');
                });
            }
        }
    )(req, res, next);
};

module.exports.PerformLogout = (req, res, next) => {
  req.logout();
  res.redirect('/');
};