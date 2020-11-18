const router = require("express").Router();
const tournamentController = require('../controllers/tournament');

/* GET Tournament List page. READ Operation */
router.get('/', tournamentController.displayTournaments);

/* GET Tournament List page. */
router.get("/create", tournamentController.displayCreatePage);

/* POST request for the Create page - CREATE Operation */
router.post("/create", tournamentController.processCreatePage);

/* GET Route for displaying the Edit page*/
router.get('/edit/:id', tournamentController.displayEditPage);

/* POST Route for processing the Edit page - UPDATE Operation */
router.post('/edit/:id', tournamentController.processEditPage);

/* GET to perform  Deletion - DELETE Operation */
router.get('/delete/:id', tournamentController.performDelete);
module.exports = router;
