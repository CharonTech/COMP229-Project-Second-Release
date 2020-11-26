const router = require("express").Router();
const tournamentController = require('../controllers/tournament');
const bracketController = require('../controllers/bracket');
const Tournament = require('../models/tournament');

// helper function for guard purposes
function requireAuth(req, res, next)
{
    //check if the user is logged in
    if(!req.isAuthenticated())
    {
        return res.redirect('/login');
    }
    next();
}

/* GET Tournament List page. READ Operation */
router.get('/', requireAuth, tournamentController.displayTournaments);

/* GET Tournament List page. */
router.get("/create", requireAuth, tournamentController.displayCreatePage);

/* POST request for the Create page */
router.post("/create", requireAuth, (req, res) => {
    const participants = req.body.participantNames.split('\n');
    tournamentController.createTournament({
        title: req.body.title,
        game: req.body.game,
        owner: req.user,
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

/* GET Route for displaying the Edit page*/
router.get('/edit/:id', requireAuth, tournamentController.displayEditPage);

/* POST Route for processing the Edit page - UPDATE Operation */

router.post('/edit/:id', (req, res, next) => {
    const id = req.params.id
    const teams = req.body.participantNames.split('\n');
    tournamentController.updateTournament(id, {
        title: req.body.title,
        game: req.body.game,
        owner: req.user,
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
    tournamentController.deleteTournament(id, err => {
        if (err) {
            console.log(err);
            res.end(err);
        } else {
            res.redirect('/tournaments');
        }
    });
});
module.exports = router;

router.get('/view/:id', (req, res, next) => {
    let id = req.params.id;
    tournamentController.getTournamentWithBrackets(id, (err, tournament) => {
        if (err)
        {
            console.log(err);
            res.end(err);
        }
        else
        {
            res.render('tournament/view',
            {
                title: "Tournament View",
                tournament: tournament,
                Tournament: Tournament,
                firstName: req.user ? req.user.firstName : "",
                currentUser: req.user,
                additionalScripts: '../tournament/partials/bracketModalScript'
            });
        }
    });

});

router.post('/view/:id', (req, res, next) => {
    let id = req.params.id;
    bracketController.setScoresOfBracket(
        req.body['bracket-id'],
        {
            score1: Number(req.body['team1-score']),
            score2: Number(req.body['team2-score'])
        },
        (err) => {
            if (err) {
                console.error(err);
                res.end(err);
            } else {
                res.redirect(`/tournaments/view/${id}`);
            }
        }
    );
});

router.post('/bracket/finish/:id', (req, res, next) => {
    let tournamentId = req.params.id;
    bracketController.setWinnerOfBracket(req.body['bracket-finish-id'], (err, isFirstWon, parentBracket) => {
        if (err) {
            console.error(err);
            res.end(err);
        } else {
            res.redirect(`/tournaments/view/${tournamentId}`);
        }
    });
});
