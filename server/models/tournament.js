let mongoose = require('mongoose');

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
    finalBracket: { type: mongoose.Types.ObjectId, ref: 'Bracket', required: false },
    isActive: {type: Boolean, default: false}
    /* URL?: String, */
    /* brackets: [bracket.bracketModel] */
});

/**
 * Instance method for Tournament model
 *
 * This is indented to be used by tournament models that are fetched by `getActiveTournamentList` controller method.
 */
tournamentModel.methods.getTop4Teams = function () {
    const teamNames = ["", "", "", ""];

    if (!this.finalBracket) {
        return teamNames;
    }

    if (this.teams.length === 2) {
        teamNames[0] = this.teams[0].name;
        teamNames[1] = this.teams[1].name;
        return teamNames;
    }

    const idx1 = this.finalBracket.children[0].team1;
    const idx2 = this.finalBracket.children[0].team2;
    const idx3 = this.finalBracket.children[1].team1;
    const idx4 = this.finalBracket.children[1].team2;

    if (idx1 >= 0) {
        teamNames[0] = this.teams[idx1].name;
    }

    if (idx2 >= 0) {
        teamNames[1] = this.teams[idx2].name;
    }

    if (idx3 >= 0) {
        teamNames[2] = this.teams[idx3].name;
    }

    if (idx4 >= 0) {
        teamNames[3] = this.teams[idx4].name;
    }

    return teamNames;
}

module.exports = mongoose.model('Tournament', tournamentModel, 'tournaments');
