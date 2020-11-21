let mongoose = require('mongoose');

let BracketSchema = mongoose.Schema({
    tournament: { type: mongoose.Types.ObjectId, required: true, index: true },
    team1: { type: Number, default: -1 },
    team2: { type: Number, default: -1 },
    score1: { type: Number, default: 0 },
    score2: { type: Number, default: 0 },
    parent: mongoose.Types.ObjectId,
    children: [mongoose.Types.ObjectId], // must have either 0 or 2 items; default is []
    isFirstWon: { type: Boolean, default: undefined }
});

module.exports = mongoose.model('Bracket', BracketSchema, 'brackets');
