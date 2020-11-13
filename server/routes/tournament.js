const router = require("express").Router();
const Tournament = require("../models/tournament").tournamentModel;

/* Display create tournament page */
router.get("/create", (req, res) => {
    res.render('tournament/create', {title: "Create Tournament", tournament: ""});
});

/* POST request for create page */
router.post("/create", (req, res) => {
    let participants = req.body.participantNames.split('\n');
    let newTournament = Tournament({
        "_id": req.body.id,
        "title": req.body.title,
        "game": req.body.game,
        "beginsAt": req.body.beginsAt,
        "endsAt": req.body.endsAt
    });
    Tournament.create(newTournament, (err) =>{
        if(err)
        {
            console.log(err);
            res.end(err);
        }
        else
        {
            //refresh the book list to be fresh
            res.redirect('/');
        }
    });
});


module.exports = router;
