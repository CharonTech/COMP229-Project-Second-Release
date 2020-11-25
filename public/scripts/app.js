(function(){
    const authForm = document.querySelector('#authForm');
    const mainNav = document.querySelector('#mainNav');
    
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