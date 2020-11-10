const router = require("express").Router();

router.get("/", (res, req) => {
  req.render("tournament/homepage", {title: "Home Page"});
});
router.get("/add", (res, req) => {
  req.render("tournament/crud-team", {title: "Add Team"});
});
router.get("/edit", (res, req) => {
  req.render("tournament/crud-team", {title: "Edit Team"});
});

module.exports = router;
