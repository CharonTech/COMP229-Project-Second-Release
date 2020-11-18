const moment = require('moment');

// define the Tournament model
const Tournament = require("../models/tournament");

// Display Tournament List Page
module.exports.displayTournaments = (req, res, next) => {
    // find all tournaments in the tournaments collection
    Tournament.find((err, tournaments) => {
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
};

// Display Create Tournament Page
module.exports.displayCreatePage = (req, res) => {
    res.render('tournament/details', { title: "Create Tournament", tournament: "", moment: moment });
};

// Process Create Tournament Page
module.exports.processCreatePage = (req, res) => {
    //let participants = req.body.participantNames.split('\n');
    let newTournament = Tournament({
        "title": req.body.title,
        "game": req.body.game,
        "beginsAt": req.body.beginsAt,
        "endsAt": req.body.endsAt
    });
    Tournament.create(newTournament, (err) => {
        if (err) {
            console.log(err);
            res.end(err);
        }
        else {
            //refresh the tournament list
            res.redirect('/tournaments');
        }
    });
};

// Display Edit Tournament Page
module.exports.displayEditPage = (req, res, next) => {
    let id = req.params.id;

    Tournament.findById(id, (err, tournamentToEdit) => {
        if (err) {
            console.log(err);
            res.end(err);
        }
        else {
            //show the edit view
            res.render('tournament/details', { title: 'Edit Tournament', tournament: tournamentToEdit, moment: moment })
        }
    });
};

// Process Edit Tournament Page
module.exports.processEditPage = (req, res, next) => {
    let id = req.params.id

    let updatedTournament = Tournament({
        "_id": id,
        "title": req.body.title,
        "game": req.body.game,
        "beginsAt": new Date(req.body.beginsAt + 1000*60),
        "endsAt": new Date(req.body.endsAt) + 1
    });

    Tournament.updateOne({_id: id}, updatedTournament, (err) => {
        if(err)
        {
            console.log(err);
            res.end(err);
        }
        else
        {
            // refresh the tournament list
            res.redirect('/tournaments');
        }
    });
};

// Perform Delete
module.exports.performDelete = (req, res, next) => {
    let id = req.params.id;

    Tournament.remove({ _id: id }, (err) => {
        if (err) {
            console.log(err);
            res.end(err);
        }
        else {
            // refresh the tournament list
            res.redirect('/tournaments');
        }
    });
};



