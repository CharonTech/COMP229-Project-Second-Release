let mongoose = require('mongoose');

let matchSchema = new mongoose.Schema({
    bracket: { type: mongoose.Types.ObjectId },
    team1: { type: Number, default: -1 },
    team2: { type: Number, default: -1 },
    score1: { type: Number, default: 0 },
    socre2: { type: Number, default: 0 },
    children: [mongoose.Types.ObjectId],
    isFirstWon: Boolean
});

module.exports = mongoose.model('Match', matchSchema, 'matches');
