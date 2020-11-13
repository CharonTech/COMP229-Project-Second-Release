const router = require("express").Router();

router.get("/", (req, res) => {
  res.render("tournament/homepage", {title: "Home Page", tournament: ""});
});

module.exports = router;
