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
 * Instance method for Tournament model: Get team names in semi-final brackets
 *
 * This is indented to be used by tournament models that are fetched by `getActiveTournamentList` controller method.
 */
tournamentModel.methods.getTop4Teams = function () {
    const teamNames = ["", "", "", ""];

    // final bracket is not found
    if (!this.finalBracket) {
        return teamNames;
    }

    // there are only 2 teams in this tournament
    if (this.teams.length === 2) {
        teamNames[0] = this.teams[0].name;
        teamNames[1] = this.teams[1].name;
        return teamNames;
    }

    // get the index of the teams in the semi-final brackets
    const idx1 = this.finalBracket.children[0].team1;
    const idx2 = this.finalBracket.children[0].team2;
    const idx3 = this.finalBracket.children[1].team1;
    const idx4 = this.finalBracket.children[1].team2;

    // populate team names if the indices are valid

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

/**
 * Instance method for Tournament model: Get the leading team if available
 *
 * This is indented to be used by tournament models that are fetched by `getActiveTournamentList` controller method.
 *
 * @returns Object with following fields
 *          - status: 'decided' | 'leading' | 'onPar' | 'notStarted'
 *          - topTeam: string
 *                     will be a single team name if 'decided' or 'leading'
 *                     will be two team names separated by ',' if 'onPar'
 *                     will be a single team name or empty string if 'notStarted'
 */
tournamentModel.methods.getTopTeam = function () {
    const result = { status: 'notStarted', topTeam: '' };

    // only one team is on final or no team is assigned to the final
    if (this.finalBracket.team1 < 0 || this.finalBracket.team2 < 0) {
        if (this.finalBracket.team1 >= 0) {
            result.topTeam = this.teams[this.finalBracket.team1].name;
        } else if (this.finalBracket.team2 >= 0) {
            result.topTeam = this.teams[this.finalBracket.team2].name;
        }
        return result;
    }

    const team1Name = this.teams[this.finalBracket.team1].name;
    const team2Name = this.teams[this.finalBracket.team2].name;

    // the final is already finished
    if (typeof this.finalBracket.isFirstWon === 'boolean') {
        result.status = 'decided';
        result.topTeam = this.finalBracket.isFirstWon ? team1Name : team2Name;
        return result;
    }

    // both teams have the same score
    if (this.finalBracket.score1 === this.finalBracket.score2) {
        result.status = 'onPar';
        result.topTeam = `${team1Name},${team2Name}`;
        return result;
    }

    // one team is winning
    result.status = 'leading';
    result.topTeam = this.finalBracket.score1 > this.finalBracket.score2 ? team1Name : team2Name;
    return result;
};

module.exports = mongoose.model('Tournament', tournamentModel, 'tournaments');
