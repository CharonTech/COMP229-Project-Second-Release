const mongoose = require('mongoose');
const Tournament = require('../models/tournament');
const Bracket = require('../models/bracket');

/**
 * Get the tournament information with the associated brackets **fully populated**
 *
 * @param id ID of the tournament
 * @param callback Callback function with (error, tournament) signature
 */
function getTournamentWithBrackets(id, callback) {
    // BEGIN validation
    if (!(typeof(id) === 'string' || id instanceof mongoose.Types.ObjectId)) {
        callback(new Error("The tournament argument must be a string or an ObjectId"));
        return;
    }
    const tournamentId = typeof(id) === 'string' ? new mongoose.Types.ObjectId(id) : id;
    // END validation

    Tournament
        .findById(tournamentId)
        .exec()
        .then(async tournament => {
            const brackets = await Bracket.find({ tournament: tournamentId }).exec();

            for (const bracket of brackets) {
                if (bracket.children.length == 2) {
                    bracket.children[0] = brackets.find(b => b._id == bracket.children[0]);
                    bracket.children[1] = brackets.find(b => b._id == bracket.children[1]);
                    bracket.children[0].parent = bracket;
                    bracket.children[1].parent = bracket;
                }
            }
            tournament.finalBracket = brackets.find(b => b._id == tournament.finalBracket);
            tournament.finalBracket.parent = undefined;

            callback(undefined, tournament);
        })
        .catch(callback);
}

/**
 * Create a new tournament and save in the database
 *
 * @param info Information of the new bracket with the following fields:
 *             - title (required - string)
 *             - game (string)
 *             - beginsAt (date)
 *             - endsAt (date)
 *             - teams (required - array of the names OR number of the teams)
 * @param callback Callback funciton with (error, newInstance) signature
 */
function createTournament(info, callback) {
    let { title, game, beginsAt, endsAt, teams } = info;

    // BEGIN validations
    if (!title) {
        callback(new Error("The title of the tournament must be specified"));
        return;
    }

    let teamsArray;
    try {
        teamsArray = normalizeTeamsArray(teams);
    } catch (err) {
        callback(err);
        return;
    }
    // END validation

    let tournament = new Tournament({ title, game, beginsAt, endsAt });
    tournament.teams = teamsArray;

    mongoose.startSession()
        .then(async session => {
            session.startTransaction();
            try {
                tournament = await tournament.save({ session });
                const finalBracket = await createBrackets(session, tournament._id, teamsArray.length);
                tournament.finalBracket = finalBracket;
                await tournament.save({ session });
            } catch (err) {
                await session.abortTransaction();
                callback(err);
                return session;
            }
            await session.commitTransaction();
            callback(undefined, tournament);
            return session;
        })
        .then(session => {
            session.endSession();
        })
        .catch(callback);
}

/**
 * Updates the information on the given tornament
 *
 * Only changed fields will be updated.
 * It should be notified to the users that the team order will be reset if the number of the teams is changed.
 *
 * @param id ID of the tournament
 * @param info Information to change
 *             - title (string)
 *             - game (string)
 *             - beginsAt (date)
 *             - endsAt (date)
 *             - teams (array of the names OR number of the teams)
 * @param callback Callback funciton with (error, tournament) signature
 */
function updateTournament(id, info, callback) {
    let { title, game, beginsAt, endsAt, teams } = info;

    // BEGIN validation
    if (!(typeof(id) === 'string' || id instanceof mongoose.Types.ObjectId)) {
        callback(new Error("The id argument must be a string or an ObjectId"));
        return;
    }
    const tournamentId = typeof(id) === 'string' ? new mongoose.Types.ObjectId(id) : id;

    let teamsArray;
    try {
        teamsArray = normalizeTeamsArray(teams);
    } catch (err) {
        callback(err);
        return;
    }
    // END validation

    mongoose.startSession()
        .then(async session => {
            session.startTransaction();

            let tournament;
            let isChanged = false;

            try {
                tournament = await Tournament.findById(tournamentId).session(session).exec();

                if (title !== tournament.title) {
                    tournament.title = title;
                    isChanged = true;
                }

                if (game !== tournament.game) {
                    tournament.game = game;
                    isChanged = true;
                }

                if (beginsAt !== tournament.beginsAt) {
                    tournament.beginsAt = beginsAt;
                    isChanged = true;
                }

                if (endsAt !== tournament.endsAt) {
                    tournament.endsAt = endsAt;
                    isChanged = true;
                }

                if (teamsArray.length !== tournament.teams.length) {
                    // rebuild the brackets if the length is changed
                    tournament.teams = teamsArray;
                    await Bracket.deleteMany({ tournament: tournamentId }).session(session).exec();
                    const finalBracket = await createBrackets(session, tournamentId, teamsArray.length);
                    tournament.finalBracket = finalBracket._id;
                    isChanged = true;
                } else {
                    // apply any changes to team names
                    for (let i = 0; i < teamsArray.length; i++) {
                        if (teamsArray[i].name !== tournament.teams[i].name) {
                            tournament.teams[i].name = teamsArray[i].name;
                            isChanged = true;
                        }
                    }
                }

                if (isChanged) {
                    await tournament.save({ session });
                }
            } catch (err) {
                await session.abortTransaction();
                callback(err);
                return session;
            }

            if (isChanged) {
                await session.commitTransaction();
            }
            callback(undefined, tournament);
            return session;
        })
        .then(session => {
            session.endSession();
        })
        .catch(callback);
}

/**
 * Reset the brackets and rebuild it for the given tournament
 *
 * It should be notified to the users that the team order will be reset.
 *
 * @param id String of the id or the ObjectId of the tournament
 * @param newTeams Optional - array of the names OR number of the teams
 * @param callback Callback function with (error, tournament) signature
 */
function rebuildTournamentBrackets(id, newTeams, callback) {
    // BEGIN validation
    if (!(typeof(id) === 'string' || id instanceof mongoose.Types.ObjectId)) {
        callback(new Error("The id argument must be a string or an ObjectId"));
        return;
    }
    const tournamentId = typeof(id) === 'string' ? new mongoose.Types.ObjectId(id) : id;

    let teamsArray;
    if (newTeams) {
        try {
            teamsArray = normalizeTeamsArray(newTeams);
        } catch (err) {
            callback(err);
            return;
        }
    }
    // END validation

    mongoose.startSession()
        .then(async session => {
            session.startTransaction();
            let tournament;
            try {
                tournament = await Tournament.findById(tournamentId).session(session).exec();
                if (!tournament) {
                    throw new Error(`No tournament found with id ${tournamentId.toString()}`);
                }

                if (!teamsArray) {
                    // no new teams; keep original ones
                    teamsArray = tournament.teams;
                } else if (newTeams instanceof Number) {
                    // retain original names if possible
                    const minLength = Math.min(teamsArray.length, tournament.teams.length);
                    for (let i = 0; i < minLength; i++) {
                        teamsArray[i].name = tournament.teams[i].name;
                    }
                }

                await Bracket.deleteMany({ tournament: tournamentId }).session(session).exec();
                const finalBracket = await createBrackets(session, tournamentId, teamsArray.length);
                tournament.finalBracket = finalBracket._id;

                tournament.teams = teamsArray;
                await tournament.save({ session });
            } catch (err) {
                await session.abortTransaction();
                callback(err);
                return session;
            }
            await session.commitTransaction();
            callback(undefined, tournament);
            return session;
        })
        .then(session => {
            session.endSession();
        })
        .catch(callback);
}

/**
 * Deletes the given tournament and all associated brackets
 *
 * @param id ID of the tournament
 * @param callback Callback function with signature of (error)
 */
function deleteTournament(id, callback) {
    // BEGIN validation
    if (!(typeof(id) === 'string' || id instanceof mongoose.Types.ObjectId)) {
        callback(new Error("The id argument must be a string or an ObjectId"));
        return;
    }
    const tournamentId = typeof(id) === 'string' ? new mongoose.Types.ObjectId(id) : id;
    // END validation

    mongoose.startSession()
        .then(async session => {
            await Tournament.findByIdAndDelete(tournamentId).session(session).exec();
            await Bracket.deleteMany({ _id: tournamentId }).session(session).exec();
            session.endSession();
            callback(undefined);
        })
        .catch(callback);
}

module.exports = {
    getTournamentWithBrackets,
    createTournament,
    updateTournament,
    rebuildTournamentBrackets,
    deleteTournament
};

/**
 * (Private) Validate the teams argument and normalize it to an array of objects
 *
 * @param teams Array of the names OR number of the teams
 * @returns [{ name: String }]
 */
function normalizeTeamsArray(teams) {
    if (!teams || !(teams instanceof Number || teams instanceof Array)) {
        throw new Error("The list of the teams of the tournament must be specified or be a number or a list");
    }

    if (teams instanceof Array && teams.length < 2 || teams < 2) {
        throw new Error("The list of the teams of the tournament must have at least 2 teams");
    }

    let teamsArray;
    if (teams instanceof Number) {
        teamsArray = new Array(teams);
        for (let i = 0; i < teams; i++) {
            teamsArray[i] = { name: `Team${i + 1}` }; // Give names like Team1, Team2, etc.
        }
    } else {
        teamsArray = new Array(teams.length);
        for (let i = 0; i < teams.length; i++) {
            teamsArray[i] = { name: teams[i] };
        }
    }

    return teamsArray;
}

/**
 * (Private) Create new brackets based on the given tournament id and array of the teams
 *
 * FIXME There might be a better way where there are less database operations
 *
 * @param session Current session of the transaction
 * @param tournamentId ObjectId
 * @param teams Number MUST BE ALREADY VERIFIED that it is greater than 1
 * @returns Promise<ObjectId> The final match bracket (root of the tree)
 */
async function createBrackets(session, tournamentId, teams) {
    // What we're doing here is storing the binary-tree-like bracket structure into an array of brackets.
    // So the final bracket is at index 0, and the next level ones are at indices 1 and 2, and so on.

    let brackets = [{ tournament: tournamentId }];

    if (teams == 2) {
        brackets[0].team1 = 0;
        brackets[0].team2 = 1;
        brackets = await Bracket.create(brackets, { session });
        return brackets[0]._id;
    }

    brackets = await Bracket.create(brackets, { session });
    const lastLevel = Math.ceil(Math.log2(Math.ceil(teams / 2.0)));

    // create brackets
    for (let i = 0; i < lastLevel; i++) {
        const halfNumBracketsInThisLevel = Math.pow(2, i);
        for (let j = 0; j < halfNumBracketsInThisLevel; j++) {
            const parentIndex = (Math.pow(2, i + 1) + 2 * j) / 2 - 1;
            const newBrackets = await Bracket.create([
                { tournament: tournamentId, parent: brackets[parentIndex]._id },
                { tournament: tournamentId, parent: brackets[parentIndex]._id }
            ], { session });
            brackets.push(...newBrackets);
            brackets[parentIndex].children = [newBrackets[0]._id, newBrackets[1]._id];
            await brackets[parentIndex].save({ session });
        }
    }

    const numBracketsInLastLevel = Math.pow(2, lastLevel);
    const lastLevelStartIndex = numBracketsInLastLevel - 1;

    // First, fill in the first team of each bracket
    for (let i = 0; i < numBracketsInLastLevel; i++) {
        brackets[lastLevelStartIndex + i].team1 = i;
    }

    // Fill in the rest of the teams into appropriatedly distributed brackets
    for (let i = numBracketsInLastLevel; i < teams; i++) {
        // FIXME the teams are not equally distributed yet
        brackets[lastLevelStartIndex + i - numBracketsInLastLevel].team2 = i;
    }

    // Remove redundant brackets and merge the teams into the parent brackets
    for (let i = 0; i < numBracketsInLastLevel; i += 2) {
        const thisIndex = lastLevelStartIndex + i;
        if (brackets[thisIndex].team2 < 0 && brackets[thisIndex + 1].team2 < 0) {
            const parentIndex = (thisIndex - 1) / 2;
            brackets[parentIndex].team1 = brackets[thisIndex].team1;
            brackets[parentIndex].team2 = brackets[thisIndex + 1].team1;
            brackets[parentIndex].children = [];
            await brackets[parentIndex].save({ session });
            await Bracket.findByIdAndDelete(brackets[thisIndex]._id).session(session).exec();
            await Bracket.findByIdAndDelete(brackets[thisIndex + 1]._id).session(session).exec();
        } else {
            await brackets[thisIndex].save({ session });
            await brackets[thisIndex + 1].save({ session });
        }
    }

    return brackets[0]._id;
}
