const router = require("express").Router();
const moment = require('moment');

// define the Tournament model
const Tournament = require("../models/tournament");
const TournamentController = require('../controllers/tournament');

/* GET Tournament List page. READ */
router.get('/', (req, res, next) => {
    // find all tournaments in the tournaments collection
    Tournament.find( (err, tournaments) => {
      if (err) {
        return console.error(err);
      }
      else {
        res.render('tournament/list', {
          title: 'Tournaments',
          tournaments: tournaments,
          moment: moment
        });
      }
    });

  });

/* Display the Create tournament page */
router.get("/create", (req, res) => {
    res.render('tournament/details', {title: "Create Tournament", tournament: "", moment: moment});
});

/* POST request for the Create page */
router.post("/create", (req, res) => {
    const participants = req.body.participantNames.split('\n');
    TournamentController.createTournament({
        title: req.body.title,
        game: req.body.game,
        beginsAt: req.body.beginsAt,
        endsAt: req.body.endsAt,
        teams: participants
    }, (err, tournament) => {
        if (err) {
            console.log(err);
            res.end(err);
        } else {
            // res.redirect(`/tournaments/edit/${tournament._id}`);
            res.redirect('/tournaments');
        }
    });
});

/* GET Route for displaying the Edit page - UPDATE Operation */
router.get('/edit/:id', (req, res, next) => {
    let id = req.params.id;

    Tournament.findById(id, (err, tournamentToEdit) => {
        if(err)
        {
            console.log(err);
            res.end(err);
        }
        else
        {
            //show the edit view
            res.render('tournament/details', {title: 'Edit Tournament', tournament: tournamentToEdit, moment: moment})
        }
    });
});

/* POST Route for processing the Edit page - UPDATE Operation */
router.post('/edit/:id', (req, res, next) => {
    const id = req.params.id
    const teams = req.body.participantNames.split('\n');
    TournamentController.updateTournament(id, {
        title: req.body.title,
        game: req.body.game,
        beginsAt: req.body.beginsAt,
        endsAt: req.body.endsAt,
        teams: teams,
    }, (err, tournament) => {
        if (err) {
            console.log(err);
            res.end(err);
        } else {
            res.redirect('/tournaments');
        }
    });

    // let updatedTournament = Tournament({
    //     "_id": id,
    //     "title": req.body.title,
    //     "game": req.body.game,
    //     "beginsAt": new Date(req.body.beginsAt + 1000*60),
    //     "endsAt": new Date(req.body.endsAt) + 1
    // });
});

/* GET to perform  Deletion - DELETE Operation */
router.get('/delete/:id', (req, res, next) => {
    let id = req.params.id;
    TournamentController.deleteTournament(id, err => {
        if (err) {
            console.log(err);
            res.end(err);
        } else {
            res.redirect('/tournaments');
        }
    });
});

module.exports = router;
