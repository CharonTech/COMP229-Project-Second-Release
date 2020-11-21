const router = require("express").Router();
const tournamentController = require('../controllers/tournament');

// define the Tournament model
const Tournament = require("../models/tournament");

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
