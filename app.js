const express = require("express");
const app = express();
const passport = require('passport');
require('dotenv').config();


// Body parsers
app.use(express.urlencoded({ extended: true }));
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
app.use(
  "/fa",
  express.static(__dirname + "/node_modules/@fortawesome/fontawesome-free/")
); // font-awesome

// Setting up view engine
const expressLayouts = require("express-ejs-layouts");

app.set("view engine", "ejs");
app.set("views", __dirname + "/server/views");
app.set("layout", "layouts/layout");
app.use(expressLayouts);

// Routes
app.use("/", require("./server/routes/index"));
app.use("/tournaments", require("./server/routes/tournament"));

// Setting port to listen too
const PORT = process.env.PORT || 3000;
app.listen(PORT, console.log(`Listening on http://localhost:${PORT}`));
