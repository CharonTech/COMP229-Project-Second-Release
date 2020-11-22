const mongoose = require('mongoose');
const Bracket = require('../models/bracket');

/**
 * Swaps the two teams of the given single bracket
 *
 * @param id ID of the bracket
 * @param callback Callback function with signature of (err)
 */
function swapTeamsOfSingleBracket(id, callback) {
    // BEGIN validation
    if (!(typeof(id) === 'string' || id instanceof mongoose.Types.ObjectId)) {
        callback(new Error("The id argument must be a string or an ObjectId"));
        return;
    }
    const bracketId = typeof(id) === 'string' ? new mongoose.Types.ObjectId(id) : id;
    // END validation

    mongoose.startSession()
        .then(async session => {
            session.startTransaction();

            let bracket;

            try {
                bracket = await Bracket.findById(bracketId).session(session).exec();
                if (!bracket) {
                    throw new Error(`No bracket found with id ${bracketId}`);
                }

                const teamTmp = bracket.team1;
                const scoreTmp = bracket.score1;
                bracket.team1 = bracket.team2;
                bracket.score1 = bracket.score2;
                bracket.team2 = teamTmp;
                bracket.score2 = scoreTmp;

                await bracket.save({ session });
            } catch (err) {
                await session.abortTransaction();
                callback(err);
                return session;
            }

            await session.commitTransaction();
            callback(undefined);
            return session;
        })
        .then(session => {
            session.endSession();
        })
        .catch(callback);
}

/**
 * Swaps two teams between the two given brackets
 *
 * The swap modes are as follows.
 * 1. Swap between team1's
 * 2. Swap betwwen team2's
 * 3. Swap between team1 from first bracket and team2 from second bracket
 * 4. Swap between team2 from first bracket and team1 from second bracket
 *
 * @param id1 ID of the first bracket
 * @param id2 ID of the second bracket
 * @param swapMode 1, 2, 3, or 4 depending on what teams are being swapped
 * @param callback Callback function with signiture of (err)
 */
function swapTeamsBetweenTwoBrackets(id1, id2, swapMode, callback) {
    // BEGIN validation
    if (!(typeof(id1) === 'string' || id1 instanceof mongoose.Types.ObjectId)) {
        callback(new Error("The id1 argument must be a string or an ObjectId"));
        return;
    }
    const bracketId1 = typeof(id1) === 'string' ? new mongoose.Types.ObjectId(id1) : id1;

    if (!(typeof(id2) === 'string' || id2 instanceof mongoose.Types.ObjectId)) {
        callback(new Error("The id2 argument must be a string or an ObjectId"));
        return;
    }
    const bracketId2 = typeof(id2) === 'string' ? new mongoose.Types.ObjectId(id2) : id2;
    // END validation

    mongoose.startSession()
        .then(async session => {
            session.startTransaction();

            try {
                const bracket1 = await Bracket.findById(bracketId1).session(session).exec();
                const bracket2 = await Bracket.findById(bracketId2).session(session).exec();
                if (!bracket1 || !bracket2) {
                    throw new Error(`Unable to find bracket of id ${bracketId1} or ${bracketId2}`);
                }

                const first = swapMode % 2 == 1 ? 1 : 2;
                const second = swapMode == 1 || swapMode == 4 ? 1 : 2;

                const teamTmp = bracket1[`team${first}`];
                const scoreTmp = bracket1[`score${first}`];
                bracket1[`team${first}`] = bracket2[`team${second}`];
                bracket1[`score${first}`] = bracket2[`score${second}`];
                bracket2[`team${second}`] = teamTmp;
                bracket2[`score${second}`] = scoreTmp;

                await bracket1.save({ session });
                await bracket2.save({ session });
            } catch (err) {
                await session.abortTransaction();
                callback(err);
                return session;
            }

            await session.commitTransaction();
            callback(undefined);
            return session;
        })
        .then(session => {
            session.endSession();
        })
        .catch(callback);
}

/**
 * Set scores for the given bracket
 *
 * @param id ID of the bracket
 * @param scores Object with following optional fields (can have both)
 *               - score1 (integer): new score for team1
 *               - score2 (integer): new score for team2
 * @param callback Callback function with (error) signature
 */
function setScoresOfBracket(id, scores, callback) {
    const { score1, score2 } = scores;

    // BEGIN validation
    if (!(typeof(id) === 'string' || id instanceof mongoose.Types.ObjectId)) {
        callback(new Error("The id argument must be a string or an ObjectId"));
        return;
    }
    const bracketId = typeof(id) === 'string' ? new mongoose.Types.ObjectId(id) : id;

    if (typeof(score1) !== 'number' && typeof(score2) !== 'number') {
        callback(new Error("Neither score1 and score2 are specified as numbers for modification"));
        return;
    }
    // END validation

    Bracket
        .findById(bracketId) // get the bracket from the database
        .exec()
        .then(async bracket => {
            if (!bracket) { // error if not found
                throw new Error(`Failed to find bracket with id ${bracketId}`);
            }

            // set score1 if given
            if (typeof(score1) === 'number') {
                bracket.score1 = score1;
            }

            // set score1 if given
            if (typeof(score2) === 'number') {
                bracket.score2 = score2;
            }

            // save the changes
            await bracket.save();
        })
        .catch(callback);
}

/**
 * Set the bracket finished and determine the winner
 *
 * This function also propagates changes to the parent bracket if there is one.
 *
 * @param id ID of the bracket
 * @param callback Callback function with (error, isFirstWon, parentBracket) signature
 *                 If `isFirstWon` is undefined, the scores are equal. (bool | undefined)
 *                 If `parentBracket` is undefined, there was no parent bracket to modify. (Bracket | undefined)
 */
function setWinnerOfBracket(id, callback) {
    // BEGIN validation
    if (!(typeof(id) === 'string' || id instanceof mongoose.Types.ObjectId)) {
        callback(new Error("The id argument must be a string or an ObjectId"));
        return;
    }
    const bracketId = typeof(id) === 'string' ? new mongoose.Types.ObjectId(id) : id;
    // END validation

    mongoose.startSession()
        .then(async session => {
            session.startTransaction();

            let isFirstWon = undefined;
            let parentBracket = undefined;

            // get the bracket with the given id
            const bracket = await Bracket.findById(bracketId).session(session).exec();
            if (!bracket) { // the bracket is not found
                await session.abortTransaction();
                session.endSession();
                throw new Error(`Failed to find bracket with id ${bracketId}`);
            }

            // see if there is a win/lose
            if (bracket.score1 > bracket.score2) {
                isFirstWon = true;
            } else if (bracket.score1 < bracket.score2) {
                isFirstWon = false;
            }

            // if the scores are the same, abort transaction and pass in undefined to all arguments for the callback
            if (isFirstWon === undefined) {
                await session.abortTransaction();
                session.endSession();
                callback(undefined, undefined, undefined);
                return;
            }

            // if there is a win/lose, save the info
            bracket.isFirstWon = isFirstWon;
            await bracket.save({ session });

            // assign the winning team to the parent bracket
            if (bracket.parent) { // the bracket has a parent bracket
                // find the parent bracket
                const parent = await Bracket.findById(bracket.parent).session(session).exec();

                if (parent) {
                    // the parent is found
                    if (parent.children.length != 2) {
                        // the children field of the parent bracket is not assigned
                        // this means the data integrity is broken
                        console.error(
                            `Bracket ${parent._id} does not have children while being parent of bracket ${bracketId}`);
                    } else {
                        // the parent bracket has children field assigned
                        parentBracket = parent; // set the modified bracket to pass into the callback

                        if (parent.children[0].toString() === bracketId.toString()) {
                            // the winning team is from the first child
                            parent.team1 = isFirstWon ? bracket.team1 : bracket.team2;
                        } else {
                            // the winning team is from the second child
                            parent.team2 = isFirstWon ? bracket.team1 : bracket.team2;
                        }

                        // save the change of the parent bracket
                        await parent.save({ session });
                    }
                } else {
                    // the parent is not found; this means the data integrity is broken
                    console.error(
                        `Bracket ${bracketId} has a parent with id ${bracket.parent}, but the parent is not found`);
                }
            }

            // commit all changes to the transaction and end the session
            await session.commitTransaction();
            session.endSession();
            callback(undefined, isFirstWon, parentBracket);
        })
        .catch(callback);
}

module.exports = {
    swapTeamsOfSingleBracket,
    swapTeamsBetweenTwoBrackets,
    setScoresOfBracket,
    setWinnerOfBracket
};
