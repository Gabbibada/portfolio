// ══════════════════════════════════════════
// CURSOR SYSTEM
// ══════════════════════════════════════════
const cur    = document.getElementById('cur');
const ring   = document.getElementById('cur-ring');
const glow   = document.getElementById('cur-glow');
const label  = document.getElementById('cur-label');
let mx=0,my=0, rx=0,ry=0, gx=0,gy=0;

document.addEventListener('mousemove',e=>{
  mx=e.clientX; my=e.clientY;
  cur.style.left=mx+'px';   cur.style.top=my+'px';
  label.style.left=mx+'px'; label.style.top=my+'px';
});

(function raf(){
  rx+=(mx-rx)*.14; ry+=(my-ry)*.14;
  ring.style.left=rx+'px'; ring.style.top=ry+'px';
  gx+=(mx-gx)*.04; gy+=(my-gy)*.04;
  glow.style.left=gx+'px'; glow.style.top=gy+'px';
  requestAnimationFrame(raf);
})();

// Hover scale on interactive elements
document.querySelectorAll('a,button,.disc-card,.ind-item,.bench-card').forEach(el=>{
  el.addEventListener('mouseenter',()=>{ cur.classList.add('big'); ring.classList.add('big'); });
  el.addEventListener('mouseleave',()=>{ cur.classList.remove('big'); ring.classList.remove('big'); });
});

// VIEW label on project entries
document.querySelectorAll('.proj-entry').forEach(el=>{
  el.addEventListener('mouseenter',()=>label.classList.add('show'));
  el.addEventListener('mouseleave',()=>label.classList.remove('show'));
});

// ══════════════════════════════════════════
// SMOOTH ANCHOR SCROLL
// ══════════════════════════════════════════
function easeInOutCubic(t){
  return t<.5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2;
}
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click',e=>{
    const id = a.getAttribute('href');
    if(id==='#') return;
    const target = document.querySelector(id);
    if(!target) return;
    e.preventDefault();
    const start = window.scrollY;
    const end   = target.getBoundingClientRect().top + start - 80;
    const dur   = 1100;
    const t0    = performance.now();
    (function step(ts){
      const p = Math.min((ts-t0)/dur,1);
      window.scrollTo(0, start+(end-start)*easeInOutCubic(p));
      if(p<1) requestAnimationFrame(step);
    })(performance.now());
  });
});

// ══════════════════════════════════════════
// LOADER + HERO REVEAL
// ══════════════════════════════════════════
let n=0;
const lc = document.getElementById('lcount');
const lb = document.getElementById('lbar');
const ld = document.getElementById('loader');
document.body.style.overflow='hidden';

const tick=setInterval(()=>{
  n++;
  lc.textContent=n.toString().padStart(2,'0');
  lb.style.width=n+'%';
  if(n>=100){
    clearInterval(tick);
    setTimeout(()=>{
      ld.classList.add('hidden');
      document.body.style.overflow='';
      triggerHeroReveal();
    },500);
  }
},20);

function triggerHeroReveal(){
  // Staggered word drop
  document.querySelectorAll('.hwi').forEach(w=>w.classList.add('on'));
  // Start section-title scramble listener after brief delay
  setTimeout(initScramble, 600);
}

// ══════════════════════════════════════════
// TEXT SCRAMBLE
// ══════════════════════════════════════════
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
function scrambleTo(el, finalText, dur=1100){
  const len = finalText.length;
  let t0 = null;
  (function frame(ts){
    if(!t0) t0=ts;
    const p  = Math.min((ts-t0)/dur, 1);
    const revealed = Math.floor(p*len);
    let out='';
    for(let i=0;i<len;i++){
      if(finalText[i]===' '){out+=' ';continue;}
      out += i<revealed
        ? finalText[i]
        : CHARS[Math.floor(Math.random()*CHARS.length)];
    }
    el.textContent=out;
    if(p<1) requestAnimationFrame(frame);
    else el.textContent=finalText;
  })(performance.now());
}

function initScramble(){
  const so = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting && !e.target.dataset.sc){
        e.target.dataset.sc='1';
        scrambleTo(e.target, e.target.textContent.trim().toUpperCase());
      }
    });
  },{threshold:.7});
  document.querySelectorAll('.sec-title').forEach(el=>so.observe(el));
}

// ══════════════════════════════════════════
// SCROLL PROGRESS BAR
// ══════════════════════════════════════════
const prog = document.getElementById('prog-bar');
window.addEventListener('scroll',()=>{
  const total = document.documentElement.scrollHeight - window.innerHeight;
  prog.style.width=(window.scrollY/total*100)+'%';
},{passive:true});

// ══════════════════════════════════════════
// SCROLL REVEAL
// ══════════════════════════════════════════
const revObs = new IntersectionObserver(entries=>{
  entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('in'); });
},{threshold:.1});
document.querySelectorAll('.rv').forEach(el=>revObs.observe(el));

// ══════════════════════════════════════════
// STATS COUNTER
// ══════════════════════════════════════════
const countObs = new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(!e.isIntersecting) return;
    const num = e.target.querySelector('[data-count]');
    if(!num || num.dataset.counted) return;
    num.dataset.counted='1';
    const target = parseInt(num.dataset.count);
    const suf = num.querySelector('.suf') ? num.querySelector('.suf').outerHTML : '';
    const t0 = performance.now();
    const dur = 1400;
    (function step(ts){
      const p = Math.min((ts-t0)/dur,1);
      const ease = 1-Math.pow(1-p,3);
      num.innerHTML = Math.floor(ease*target)+suf;
      if(p<1) requestAnimationFrame(step);
      else num.innerHTML = target+suf;
    })(performance.now());
  });
},{threshold:.6});
document.querySelectorAll('.stat').forEach(el=>countObs.observe(el));

// ══════════════════════════════════════════
// PHILOSOPHY STRIKETHROUGH
// ══════════════════════════════════════════
const phiObs=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.querySelectorAll('.struck').forEach((el,i)=>{
        setTimeout(()=>el.classList.add('active'),300+i*400);
      });
    }
  });
},{threshold:.55});
document.querySelectorAll('#philosophy').forEach(el=>phiObs.observe(el));

// ══════════════════════════════════════════
// ACTIVE NAV HIGHLIGHT
// ══════════════════════════════════════════
const navLinks = document.querySelectorAll('.nav-links a');
const sectionIds = ['about','disciplines','projects','experience','benchmarks','contact'];
const sectionEls = sectionIds.map(id=>document.getElementById(id)).filter(Boolean);

const activeObs = new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      const id = e.target.id;
      navLinks.forEach(a=>{
        const href = a.getAttribute('href').replace('#','');
        a.classList.toggle('active', href===id);
      });
    }
  });
},{threshold:.25, rootMargin:'-80px 0px -55% 0px'});
sectionEls.forEach(s=>activeObs.observe(s));

// ══════════════════════════════════════════
// NAV HIDE / SHOW
// ══════════════════════════════════════════
let lastY=0;
const navEl = document.getElementById('nav');
window.addEventListener('scroll',()=>{
  const y=window.scrollY;
  navEl.style.transition='transform .4s ease';
  navEl.style.transform = (y>lastY && y>100) ? 'translateY(-100%)' : 'translateY(0)';
  lastY=y;
},{passive:true});

// ══════════════════════════════════════════
// MOBILE MENU
// ══════════════════════════════════════════
const menuBtn = document.getElementById('menu-btn');
const mmEl    = document.getElementById('mm');
const mmAnchors = document.querySelectorAll('.mm-a');

menuBtn.addEventListener('click',()=>{
  const open = mmEl.classList.toggle('open');
  menuBtn.classList.toggle('active',open);
  document.body.style.overflow = open ? 'hidden' : '';
});
mmAnchors.forEach(a=>{
  a.addEventListener('click',()=>{
    mmEl.classList.remove('open');
    menuBtn.classList.remove('active');
    document.body.style.overflow='';
  });
});

// ══════════════════════════════════════════
// PROJECT PARALLAX
// ══════════════════════════════════════════
const projVisuals = document.querySelectorAll('.proj-visual');
window.addEventListener('scroll',()=>{
  projVisuals.forEach(v=>{
    const rect = v.getBoundingClientRect();
    const mid  = rect.top + rect.height/2 - window.innerHeight/2;
    const offset = mid * -0.07;
    const bgText = v.querySelector('.proj-visual-bg-text');
    const vGlow  = v.querySelector('.proj-visual-glow');
    if(bgText) bgText.style.transform = `translateY(${offset}px)`;
    if(vGlow)  vGlow.style.transform  = `translate(-50%,${offset*.5}px)`;
  });
},{passive:true});
