let mongoose = require('mongoose');
let User = require('./user').UserSchema;
let bracket = require('./bracket')

let tournamentModel = mongoose.Schema({
    title: String,
    tournamentType: {
        type: String,
        default: 'Single-Elimination'
    },
    owner:
    {
        type: User,
        required: false
    },
    game: String,
    beginsAt: Date,
    endsAt: Date
    /* URL?: String, */
    /* brackets: [bracket.bracketModel] */
},
{
    collection: 'tournaments'
});

module.exports = mongoose.model('Tournament', tournamentModel);