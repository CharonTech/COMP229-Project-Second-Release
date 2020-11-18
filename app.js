const express = require("express");
const session = require('express-session');
const app = express();
const passport = require('passport');
let passportLocal = require('passport-local');
let localStrategy = passportLocal.Strategy;
let flash = require('connect-flash');

// Body parsers
app.use(express.urlencoded({extended: true}));
app.use(express.json());

// URI
let DB = require('./server/config/db');

//Db stuff
const mongoose = require("mongoose");
mongoose
  .connect(process.env.URI || DB.URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));


// Declaring static paths
app.use(express.static("public"));
app.use("/js", express.static(__dirname + "/node_modules/bootstrap/dist/js")); // redirect bootstrap JS
app.use("/js", express.static(__dirname + "/node_modules/jquery/dist")); // redirect JS jQuery
app.use("/css", express.static(__dirname + "/node_modules/bootstrap/dist/css")); // redirect CSS bootstrap
app.use("/fa", 
  express.static(__dirname + "/node_modules/@fortawesome/fontawesome-free/")
); // font-awesome

// Setting up view engine
const expressLayouts = require("express-ejs-layouts");

app.set("view engine", "ejs");
app.set("views", __dirname + "/server/views");
app.set("layout", "layouts/layout");
app.use(expressLayouts);

//setup express session
app.use(session({
  secret: "someSecret",
  saveUninitialized: false,
  resave: false
}));

//flash (message display)
app.use(flash());


//initialize passport
app.use(passport.initialize());
app.use(passport.session());

// import user model
const User = require('./server/models/user').userModel;

//implement a user authentication strategy
passport.use(User.createStrategy());

//serialize and deserialize the user info
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//passport.use(localStrategy);

// Routes
app.use("/", require("./server/routes/index"));
app.use("/tournaments", require("./server/routes/tournament"));

// Setting port to listen too
const PORT = process.env.PORT || 3000;
app.listen(PORT, console.log(`Listening on http://localhost:${PORT}`));
