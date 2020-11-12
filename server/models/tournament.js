let mongoose = require('mongoose');
let user = require('./user');
let bracket = require('./bracket')

let TournamentSchema = mongoose.Schema({
    _id: String,
    title: String,
    tournamentType: {
        type: String,
        default: 'Single-Elimination'
    },
    owner?: user.userModel,
    game: String,
    beginsAt: Date,
    endsAt: Date,
    URL: String,
    Brackets: [bracket.bracketModel]
},
{
    collection: 'tournaments'
});

module.exports.tournamentModel = mongoose.Model('Tournament', TournamentSchema);