(function(){
    const styledForm = document.querySelector('#styledForm');
    const tournaments = document.querySelector('#tournaments');
    const mainNav = document.querySelector('#mainNav');
    
    if (styledForm)
    {
        window.addEventListener('scroll', () => {
        if (document.body.scrollTop > styledForm.scrollTop || document.documentElement.scrollTop > styledForm.scrollTop) {
            mainNav.style.backgroundColor = `rgba(220, 130, 91, 0.9)`;
        }
        else
        {
            mainNav.style.backgroundColor = ``;
        }
        });
    }
    else if (tournaments)
    {
        window.addEventListener('scroll', () => {
            if (document.body.scrollTop > tournaments.scrollTop || document.documentElement.scrollTop > tournaments.scrollTop) {
                mainNav.style.backgroundColor = `rgba(220, 130, 91, 0.9)`;
            }
            else
            {
                mainNav.style.backgroundColor = ``;
            }
            });
    }
    
    
})();

// ask a user to confirm deletion or cancel it
(function()
{
    function Start()
    {
        let deleteButtons = document.querySelectorAll('.btn-danger');
        
        for(button of deleteButtons)
        {
            button.addEventListener('click', (event)=>{
                if(!confirm("Are you sure?")) 
                {
                    event.preventDefault();
                    window.location.assign('/tournaments');
                }
            });
        }
    }
    
    window.addEventListener("load", Start);
})();