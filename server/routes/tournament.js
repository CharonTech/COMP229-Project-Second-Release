const router = require("express").Router();
const tournamentController = require('../controllers/tournament');

// helper function for guard purposes
function requireAuth(req, res, next)
{
    //check if the user is logged in 
    if(!req.isAuthenticated())
    {
        return res.redirect('/login');
    }
    next();
}

/* GET Tournament List page. READ Operation */
router.get('/', requireAuth, tournamentController.displayTournaments);

/* GET Tournament List page. */
router.get("/create", requireAuth, tournamentController.displayCreatePage);

/* POST request for the Create page - CREATE Operation */
router.post("/create", requireAuth, tournamentController.processCreatePage);

/* GET Route for displaying the Edit page*/
router.get('/edit/:id', requireAuth, tournamentController.displayEditPage);

/* POST Route for processing the Edit page - UPDATE Operation */
router.post('/edit/:id', requireAuth, tournamentController.processEditPage);

/* GET to perform  Deletion - DELETE Operation */
router.get('/delete/:id', requireAuth, tournamentController.performDelete);
module.exports = router;
