import { loadDriveAssets, resolveMenuBookPages } from "../drive-assets.mjs";

export function menuBookStyles() {
  return `
    .menu-book-section{
      padding:0 0 clamp(3rem,7vw,5rem);
      background:linear-gradient(180deg,var(--cream) 0%,var(--cream-dark) 100%);
    }
    .menu-book-stage{
      max-width:min(920px,96vw);
      margin:0 auto;
      padding:0 1rem;
    }
    .menu-book-hint{
      text-align:center;font-size:.82rem;color:rgba(43,43,43,.5);
      margin-top:1rem;font-style:italic;
      transition:transform .4s cubic-bezier(.22,1,.36,1),color .25s ease;
    }
    .menu-book-hint:hover{transform:translateY(-1px);color:rgba(43,43,43,.68)}
    .menu-book-ui{
      display:flex;align-items:center;justify-content:center;gap:1rem;
      margin-top:1.35rem;flex-wrap:wrap;
    }
    .menu-book-btn{
      width:2.75rem;height:2.75rem;border-radius:999px;border:1px solid rgba(7,57,84,.15);
      background:var(--cream);color:var(--blue);font-size:1.5rem;line-height:1;
      cursor:pointer;transition:transform .15s,background .15s,box-shadow .15s;
      box-shadow:0 4px 18px rgba(7,57,84,.08);
    }
    .menu-book-btn:hover:not(:disabled){transform:translateY(-2px);background:#fff}
    .menu-book-btn:disabled{opacity:.35;cursor:not-allowed}
    .menu-book-counter{
      min-width:5.5rem;text-align:center;font-size:.9rem;color:var(--blue);
      font-variant-numeric:tabular-nums;letter-spacing:.04em;
    }
    .menu-book-viewport{
      position:relative;margin:0 auto;
      perspective:2200px;
      touch-action:pan-y;
    }
    .menu-book-viewport.menu-book-loading .menu-book-spread,
    .menu-book-viewport.menu-book-loading .menu-book-mobile{
      opacity:.92;
    }
    .menu-book-viewport.menu-book-loading .menu-book-page-slot.right:not(.blank)::after,
    .menu-book-viewport.menu-book-loading .menu-book-mobile::after{
      content:"";position:absolute;inset:0;z-index:5;pointer-events:none;
      background:linear-gradient(110deg,transparent 30%,rgba(255,255,255,.45) 50%,transparent 70%);
      background-size:220% 100%;
      animation:menu-book-shimmer 1.35s ease-in-out infinite;
    }
    @keyframes menu-book-shimmer{
      0%{background-position:120% 0}
      100%{background-position:-120% 0}
    }
    .menu-book-spread{
      position:relative;display:grid;grid-template-columns:1fr 1fr;
      gap:0;min-height:clamp(280px,52vw,560px);
      border-radius:1rem;overflow:visible;
      box-shadow:
        0 24px 60px rgba(7,57,84,.18),
        0 0 0 1px rgba(7,57,84,.06);
      background:linear-gradient(90deg,#e8e2d8 0%,#f5f0e8 48%,#f5f0e8 52%,#e8e2d8 100%);
    }
    .menu-book-spread::before{
      content:"";position:absolute;left:50%;top:0;bottom:0;width:2px;
      transform:translateX(-50%);
      background:linear-gradient(180deg,rgba(7,57,84,.04),rgba(7,57,84,.12),rgba(7,57,84,.04));
      z-index:4;pointer-events:none;
    }
    .menu-book-page-slot{
      position:relative;background:#fff;overflow:hidden;
      min-height:clamp(280px,52vw,560px);
    }
    .menu-book-page-slot.left{border-radius:1rem 0 0 1rem}
    .menu-book-page-slot.right{border-radius:0 1rem 1rem 0}
    .menu-book-page-slot.blank{
      background:linear-gradient(135deg,#f0ebe3,#e7e0d5);
    }
    .menu-book-page-slot img{
      width:100%;height:100%;object-fit:contain;display:block;
      background:#fff;
    }
    .menu-book-flipper{
      position:absolute;top:0;right:0;width:50%;height:100%;
      transform-style:preserve-3d;transform-origin:left center;
      transition:transform .65s cubic-bezier(.45,.05,.25,1);
      z-index:6;pointer-events:none;
    }
    .menu-book-flipper.flipping-forward{transform:rotateY(-180deg)}
    .menu-book-flipper.flipping-back{transform:rotateY(180deg)}
    .menu-book-flip-face{
      position:absolute;inset:0;backface-visibility:hidden;
      overflow:hidden;border-radius:0 1rem 1rem 0;
      box-shadow:-8px 0 24px rgba(7,57,84,.12);
    }
    .menu-book-flip-face img{width:100%;height:100%;object-fit:contain;background:#fff}
    .menu-book-flip-face.back{transform:rotateY(180deg)}
    .menu-book-hotzones{
      position:absolute;inset:0;display:grid;grid-template-columns:1fr 1fr;
      z-index:8;
    }
    .menu-book-hotzones button{
      appearance:none;border:0;background:transparent;cursor:pointer;
    }
    .menu-book-hotzones button:focus-visible{
      outline:2px solid var(--sage);outline-offset:-4px;
    }
    .menu-book-mobile{
      display:none;position:relative;border-radius:1rem;overflow:hidden;
      min-height:clamp(320px,120vw,520px);
      box-shadow:0 24px 60px rgba(7,57,84,.18);
      background:#fff;
    }
    .menu-book-mobile img{
      width:100%;height:100%;object-fit:contain;display:block;
      transition:opacity .25s ease;
    }
    .menu-book-mobile .menu-book-hotzones{grid-template-columns:1fr 1fr}
    .menu-book-footer{
      text-align:center;padding-top:2rem;margin-top:.5rem;
    }
    .menu-book-footer p{
      font-size:.78rem;letter-spacing:.06em;color:rgba(43,43,43,.45);font-style:italic;
    }
    @media(max-width:767px){
      .menu-book-spread{display:none}
      .menu-book-mobile{display:block}
      .menu-book-flipper{display:none}
    }
    @media(prefers-reduced-motion:reduce){
      .menu-book-flipper{transition:none}
      .menu-book-mobile img{transition:none}
      .menu-book-viewport.menu-book-loading .menu-book-page-slot.right::after,
      .menu-book-viewport.menu-book-loading .menu-book-mobile::after{animation:none;display:none}
    }
  `;
}

export function menuBookScript() {
  return `
    (function(){
      var root=document.getElementById('menu-book');
      if(!root)return;
      var pages=JSON.parse(root.getAttribute('data-pages')||'[]');
      if(!pages.length)return;

      var spreadEl=root.querySelector('.menu-book-spread');
      var mobileEl=root.querySelector('.menu-book-mobile');
      var mobileImg=mobileEl?mobileEl.querySelector('img'):null;
      var leftSlot=root.querySelector('.menu-book-page-slot.left');
      var rightSlot=root.querySelector('.menu-book-page-slot.right');
      var flipper=root.querySelector('.menu-book-flipper');
      var flipFront=flipper?flipper.querySelector('.menu-book-flip-face.front img'):null;
      var flipBack=flipper?flipper.querySelector('.menu-book-flip-face.back img'):null;
      var counter=root.querySelector('.menu-book-counter');
      var btnPrev=root.querySelector('[data-book-prev]');
      var btnNext=root.querySelector('[data-book-next]');
      var reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var mobile=window.matchMedia('(max-width: 767px)').matches;

      var spread=0;
      var page=0;
      var busy=false;
      var touchX=0;
      var preloaded={};

      function markReady(){
        root.classList.remove('menu-book-loading');
      }

      function preloadPage(idx){
        if(idx<0||idx>=pages.length||preloaded[idx])return;
        preloaded[idx]=true;
        var img=new Image();
        img.decoding='async';
        img.src=pages[idx];
      }

      function watchImageLoad(imgEl,onReady){
        if(!imgEl||!imgEl.src){
          if(onReady)onReady();
          return;
        }
        if(imgEl.complete&&imgEl.naturalWidth>0){
          if(onReady)onReady();
          return;
        }
        imgEl.addEventListener('load',function(){if(onReady)onReady();},{once:true});
        imgEl.addEventListener('error',function(){if(onReady)onReady();},{once:true});
      }

      function spreadsCount(){
        return Math.ceil((pages.length+1)/2);
      }

      function spreadPages(i){
        if(i===0)return {left:-1,right:0};
        var left=2*i-1;
        var right=2*i;
        if(right>=pages.length)right=-1;
        return {left:left,right:right};
      }

      function setImg(el,idx){
        if(!el)return;
        if(idx<0||idx>=pages.length){
          el.removeAttribute('src');
          el.alt='';
          return;
        }
        el.src=pages[idx];
        el.alt='Página '+(idx+1)+' del menú';
      }

      function setBlank(slot,blank){
        if(!slot)return;
        slot.classList.toggle('blank',!!blank);
        var img=slot.querySelector('img');
        if(blank&&img){img.removeAttribute('src');}
      }

      function updateCounter(){
        if(!counter)return;
        if(mobile){
          counter.textContent=(page+1)+' / '+pages.length;
        }else{
          var s=spreadPages(spread);
          var label=[];
          if(s.left>=0)label.push(s.left+1);
          if(s.right>=0)label.push(s.right+1);
          counter.textContent='Pág. '+label.join(' · ')+' / '+pages.length;
        }
      }

      function updateButtons(){
        if(btnPrev)btnPrev.disabled=mobile?(page<=0):(spread<=0);
        if(btnNext)btnNext.disabled=mobile?(page>=pages.length-1):(spread>=spreadsCount()-1);
      }

      function renderSpread(){
        var s=spreadPages(spread);
        setBlank(leftSlot,s.left<0);
        setBlank(rightSlot,s.right<0);
        setImg(leftSlot&&leftSlot.querySelector('img'),s.left);
        setImg(rightSlot&&rightSlot.querySelector('img'),s.right);
        updateCounter();
        updateButtons();
      }

      function renderMobile(){
        if(!mobileImg)return;
        mobileImg.src=pages[page];
        mobileImg.alt='Página '+(page+1)+' del menú';
        updateCounter();
        updateButtons();
      }

      function render(){
        mobile=window.matchMedia('(max-width: 767px)').matches;
        if(mobile)renderMobile();
        else renderSpread();
      }

      function animateFlip(dir,cb){
        if(!flipper||reduced||mobile){
          cb();
          return;
        }
        var s=spreadPages(spread);
        if(dir>0){
          setImg(flipFront,s.right);
          var next=spreadPages(spread+1);
          setImg(flipBack,next.right>=0?next.right:next.left);
          flipper.className='menu-book-flipper flipping-forward';
        }else{
          var prev=spreadPages(spread-1);
          setImg(flipFront,prev.right>=0?prev.right:prev.left);
          setImg(flipBack,s.left>=0?s.left:s.right);
          flipper.className='menu-book-flipper flipping-back';
        }
        busy=true;
        setTimeout(function(){
          flipper.className='menu-book-flipper';
          busy=false;
          cb();
        }, reduced?0:650);
      }

      function goNext(){
        if(busy)return;
        if(mobile){
          if(page>=pages.length-1)return;
          page+=1;
          renderMobile();
          return;
        }
        if(spread>=spreadsCount()-1)return;
        animateFlip(1,function(){
          spread+=1;
          renderSpread();
        });
      }

      function goPrev(){
        if(busy)return;
        if(mobile){
          if(page<=0)return;
          page-=1;
          renderMobile();
          return;
        }
        if(spread<=0)return;
        spread-=1;
        renderSpread();
      }

      root.querySelectorAll('[data-book-next]').forEach(function(el){
        el.addEventListener('click',goNext);
      });
      root.querySelectorAll('[data-book-prev]').forEach(function(el){
        el.addEventListener('click',goPrev);
      });

      root.addEventListener('keydown',function(e){
        if(e.key==='ArrowRight'||e.key==='PageDown'){e.preventDefault();goNext();}
        if(e.key==='ArrowLeft'||e.key==='PageUp'){e.preventDefault();goPrev();}
      });

      root.addEventListener('touchstart',function(e){
        touchX=e.changedTouches[0].clientX;
      },{passive:true});

      root.addEventListener('touchend',function(e){
        var dx=e.changedTouches[0].clientX-touchX;
        if(Math.abs(dx)<40)return;
        if(dx<0)goNext();
        else goPrev();
      },{passive:true});

      window.addEventListener('resize',function(){
        var wasMobile=mobile;
        mobile=window.matchMedia('(max-width: 767px)').matches;
        if(wasMobile!==mobile)render();
      });

      root.classList.add('menu-book-loading');
      preloadPage(0);
      preloadPage(1);
      preloadPage(2);
      render();
      var firstVisible=mobile?mobileImg:(rightSlot&&rightSlot.querySelector('img'));
      watchImageLoad(firstVisible,function(){
        markReady();
        if(mobile){
          preloadPage(page+1);
          preloadPage(page+2);
        }else{
          var s=spreadPages(spread);
          if(s.right>=0){preloadPage(s.right+1);preloadPage(s.right+2);}
        }
      });
    })();
  `;
}

export function renderMenuBook({ img, pages, disclaimer }) {
  if (!pages.length) {
    return `
    <div class="menu-book-stage">
      <p style="text-align:center;opacity:.7;padding:2rem 0">
        El menú digital se está preparando. Vuelve pronto o visítanos en el local.
      </p>
    </div>`;
  }

  const pageUrls = pages.map((p) => img(p));
  const dataPages = JSON.stringify(pageUrls).replace(/</g, "\\u003c");

  return `
  <div class="menu-book-section">
    <style>${menuBookStyles()}</style>
    <div class="menu-book-stage">
      <div class="menu-book-viewport menu-book-loading" id="menu-book" data-pages='${dataPages}' tabindex="0" aria-label="Menú digital interactivo">
        <div class="menu-book-spread" aria-hidden="false">
          <div class="menu-book-page-slot left blank"><img alt="" loading="lazy" decoding="async"/></div>
          <div class="menu-book-page-slot right"><img src="${pageUrls[0]}" alt="Página 1 del menú" loading="eager" fetchpriority="high" decoding="async"/></div>
          <div class="menu-book-flipper" aria-hidden="true">
            <div class="menu-book-flip-face front"><img alt=""/></div>
            <div class="menu-book-flip-face back"><img alt=""/></div>
          </div>
          <div class="menu-book-hotzones" aria-hidden="true">
            <button type="button" data-book-prev aria-label="Página anterior"></button>
            <button type="button" data-book-next aria-label="Página siguiente"></button>
          </div>
        </div>
        <div class="menu-book-mobile">
          <img src="${pageUrls[0]}" alt="Página 1 del menú" loading="eager" fetchpriority="high" decoding="async"/>
          <div class="menu-book-hotzones">
            <button type="button" data-book-prev aria-label="Página anterior"></button>
            <button type="button" data-book-next aria-label="Página siguiente"></button>
          </div>
        </div>
      </div>
      <div class="menu-book-ui">
        <button type="button" class="menu-book-btn" data-book-prev aria-label="Página anterior">‹</button>
        <span class="menu-book-counter">1 / ${pages.length}</span>
        <button type="button" class="menu-book-btn" data-book-next aria-label="Página siguiente">›</button>
      </div>
      <p class="menu-book-hint">Desliza, usa las flechas del teclado o toca los lados para pasar página</p>
      ${disclaimer ? `<div class="menu-book-footer"><p>${disclaimer}</p></div>` : ""}
    </div>
  </div>
  <script>${menuBookScript()}</script>`;
}

export function getMenuBookPagePaths(manifest = loadDriveAssets()) {
  return resolveMenuBookPages(manifest);
}
