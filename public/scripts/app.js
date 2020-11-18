(function(){
    const registerForm = document.querySelector('#registerForm');
    const mainNav = document.querySelector('#mainNav');
    
    window.addEventListener('scroll', () => {
        if (document.body.scrollTop > registerForm.scrollTop || document.documentElement.scrollTop > registerForm.scrollTop) {
            mainNav.style.backgroundColor = `rgba(220, 130, 91, 0.9)`;
        }
        else
        {
            mainNav.style.backgroundColor = ``;
        }
    });
})();  