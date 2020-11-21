let mongoose = require('mongoose');

let User = require('./user').UserSchema;
let bracket = require('./bracket')

let tournamentModel = mongoose.Schema({
    title: { type: String, required: true, index: true },
    tournamentType: {
        type: String,
        default: 'Single-Elimination'
    },
    owner: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    game: String,
    beginsAt: Date,
    endsAt: Date,
    teams: [{
        name: { type: String, required: true }
    }], // must be more than 1
    finalBracket: { type: mongoose.Types.ObjectId , ref: 'Bracket', required: false }
    /* URL?: String, */
    /* brackets: [bracket.bracketModel] */
});

module.exports = mongoose.model('Tournament', tournamentModel, 'tournaments');
