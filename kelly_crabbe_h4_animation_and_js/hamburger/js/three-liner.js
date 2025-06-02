const HAMBURGER = document.querySelector('#hamburger-icon');
const NAV_LIST = document.querySelector('#nav-list');

HAMBURGER.addEventListener('click', function(){
    NAV_LIST.classList.toggle('open');
    this.classList.toggle("bi-x-lg");
    this.classList.toggle("bi-list");
});