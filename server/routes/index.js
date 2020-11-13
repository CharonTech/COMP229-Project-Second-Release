const router = require("express").Router();
const moment = require('moment');
// define the Tournament model
const Tournament = require("../models/tournament");

router.get("/", (req, res) => {

  Tournament.find((err, tournaments) => {
    if (err) {
      return console.error(err);
    }
    else {
      res.render('tournament/homepage', {
        title: 'Home Page',
        tournaments: tournaments,
        moment: moment
      });
    }
  });
});

module.exports = router;
