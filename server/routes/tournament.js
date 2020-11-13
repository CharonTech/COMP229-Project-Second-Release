const router = require("express").Router();

// define the Tournament model
const Tournament = require("../models/tournament");

/* Display the Create tournament page */
router.get("/create", (req, res) => {
    res.render('tournament/details', {title: "Create Tournament", tournament: ""});
});

/* POST request for the Create page */
router.post("/create", (req, res) => {
    //let participants = req.body.participantNames.split('\n');
    let newTournament = Tournament({
        //"_id": req.body.id,
        "title": req.body.title,
        "game": req.body.game
        //"beginsAt": req.body.beginsAt,
        //"endsAt": req.body.endsAt
    });
    Tournament.create(newTournament, (err) =>{
        if(err)
        {
            console.log(err);
            res.end(err);
        }
        else
        {
            //refresh the tournament list (home page)
            res.redirect('/');
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
            res.render('tournament/details', {title: 'Edit Tournament', tournament: tournamentToEdit})
        }
    });
});

/* POST Route for processing the Edit page - UPDATE Operation */
router.post('/edit/:id', (req, res, next) => {
    let id = req.params.id

    let updatedTournament = Tournament({
        "_id": id,
        "title": req.body.title,
        "game": req.body.game
    });

    Tournament.updateOne({_id: id}, updatedTournament, (err) => {
        if(err)
        {
            console.log(err);
            res.end(err);
        }
        else
        {
            // refresh the tournament list (home page)
            res.redirect('/');
        }
    });
});

/* GET to perform  Deletion - DELETE Operation */
router.get('/delete/:id', (req, res, next) => {
    let id = req.params.id;

    Tournament.remove({_id: id}, (err) => {
        if(err)
        {
            console.log(err);
            res.end(err);
        }
        else
        {
             // refresh the tournament list (home page)
             res.redirect('/');
        }
    });
});

module.exports = router;
