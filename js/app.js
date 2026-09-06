document.querySelectorAll('a[href^="#"]').forEach(link=>{
  link.addEventListener('click',e=>{
    const alvo=document.querySelector(link.getAttribute('href'));
    if(alvo){
      e.preventDefault();
      alvo.scrollIntoView({behavior:'smooth'});
    }
  });
});
