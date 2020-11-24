const Tournament = require("../../server/models/tournament");

(function(){
    const authForm = document.querySelector('#authForm');
    const mainNav = document.querySelector('#mainNav');
    
    function getParentTournament(id)
    {
        Tournament.findById(id).exec().then((tournament) => {
            console.log('This is the parent tournament ->' + tournament);
            return tournament;
        });
    }

    if (document.title == "Register" || document.title == "Login")
    {
        window.addEventListener('scroll', () => {
        if (document.body.scrollTop > authForm.scrollTop || document.documentElement.scrollTop > authForm.scrollTop) {
            mainNav.style.backgroundColor = `rgba(220, 130, 91, 0.9)`;
        }
        else
        {
            mainNav.style.backgroundColor = ``;
        }
    });
    }
    
    
})();  