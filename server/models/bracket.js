let mongoose = require('mongoose');

let BracketSchema = mongoose.Schema({
    _id: String,
    totalParticipants: Number,
    randomSeed: Boolean,
    participants: {
        _id: String,
        firstName: String,
        lastName: String,
        seed: Number
    }
},
{
    collection: 'brackets'
});

module.exports.bracketModel = mongoose.Model('Bracket', BracketSchema);