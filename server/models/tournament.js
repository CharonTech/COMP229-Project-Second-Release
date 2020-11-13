let mongoose = require('mongoose');
let user = require('./user');
let bracket = require('./bracket')

let TournamentSchema = mongoose.Schema({
    title: String,
    tournamentType: {
        type: String,
        default: 'Single-Elimination'
    },
    /* owner?: user.userModel, */
    game: String,
    beginsAt: Date,
    endsAt: Date,
    /* URL?: String, */
    /* brackets: [bracket.bracketModel] */
},
{
    collection: 'tournaments'
});

module.exports.tournamentModel = mongoose.model('Tournament', TournamentSchema);