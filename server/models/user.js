let mongoose = require('mongoose');
let passportLocalMongoose = require('passport-local-mongoose');

let UserSchema = mongoose.Schema({
    username: String,
    email: String,
    firstName: String,
    lastName: String,
    emailAddress: String,
    dateCreated: 
    {
        type: Date,
        default: Date.now()
    }
},
{
    collection: 'users'
});

//configure options for our User model
let options = ({missingPasswordError: 'Incorrect password!'});

UserSchema.plugin(passportLocalMongoose, options);

module.exports.userModel = mongoose.model('User', UserSchema);