const router = require("express").Router();
const moment = require('moment');
const passport = require('passport')
// define the Tournament model
const Tournament = require("../models/tournament");

// import the user model
const User = require('../models/user').userModel;

router.get("/", (req, res) => {

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
        moment: moment
      });
    }
  });
});

//Display register page
router.get("/register", (req, res) => {
  if (!req.user)
  {
    res.render('auth/register', 
    {
        title: "Register",
        messages: req.flash("registerMessage"),
        displayName: req.user ? req.user.firstName: ''
    });
  }
  else
  {
    return res.redirect('/');
  }
  
});

//Process register page
router.post('/register', (req, res, next) => {
  //instantiate a user object
  let newUser = new User({
    username: req.body.username,
    emailAddress: req.body.email,
    firstName: req.body.firstName,
    lastName: req.body.lastName
  });

  User.register(newUser, req.body.password, (err) => {
    //server error
    if (err) {
      
      if (err.name == "UserExistsError")
      {
        req.flash("registerMessage", "Registration Error: User already exists!");
      }
      return res.render('auth/register',
        {
          title: "Register",
          messages: req.flash("registerMessage"),
          displayName: req.user ? req.user.displayName : ''
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
});

module.exports = router;
