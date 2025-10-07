
// Smooth scroll with fixed header offset
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click', e=>{
    const targetId = a.getAttribute('href');
    if(targetId.length>1){
      const el = document.querySelector(targetId);
      if(el){
        e.preventDefault();
        const header = document.querySelector('.header');
        const top = el.getBoundingClientRect().top + window.scrollY - (header?.offsetHeight || 80) - 12;
        window.scrollTo({top, behavior:'smooth'});
      }
    }
  });
});

// Active link on scroll
const sections = [...document.querySelectorAll('section[id]')];
const navLinks = [...document.querySelectorAll('.nav a')];
function setActive(){
  const y = window.scrollY + (document.querySelector('.header').offsetHeight || 90) + 40;
  let current = sections[0]?.id;
  sections.forEach(sec=>{
    if(sec.offsetTop <= y) current = sec.id;
  });
  navLinks.forEach(l=>l.classList.toggle('active', l.getAttribute('href') === '#'+current));
}
window.addEventListener('scroll', setActive);
window.addEventListener('load', setActive);
