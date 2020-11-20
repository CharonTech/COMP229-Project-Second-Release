let mongoose = require('mongoose');

let tournamentModel = mongoose.Schema({
    title: { type: String, required: true, index: true },
    tournamentType: {
        type: String,
        default: 'Single-Elimination'
    },
    /* owner?: user.userModel, */
    game: String,
    beginsAt: Date,
    endsAt: Date,
    teams: [{
        name: { type: String, required: true }
    }], // must be more than 1
    finalBracket: { type: mongoose.Types.ObjectId, ref: 'Bracket' }
    /* URL?: String, */
    /* brackets: [bracket.bracketModel] */
});

module.exports = mongoose.model('Tournament', tournamentModel, 'tournaments');
