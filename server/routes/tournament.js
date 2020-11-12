const router = require("express").Router();

router.get("/", (req, res) => {
    res.render('tournament/create', {title: "Create Tournament", tournament: ""});
});


module.exports = router;
