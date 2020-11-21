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

module.exports = {
    swapTeamsOfSingleBracket,
    swapTeamsBetweenTwoBrackets
};
