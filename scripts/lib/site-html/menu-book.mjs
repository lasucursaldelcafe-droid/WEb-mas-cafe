import { loadDriveAssets, resolveMenuBookPages } from "../drive-assets.mjs";

/** Proporción real de las páginas del menú (792×1224 px) */
const MENU_PAGE_RATIO = "792 / 1224";

export function menuBookStyles() {
  return `
    .menu-book-section{
      padding:0 0 clamp(3rem,7vw,5rem);
      background:linear-gradient(180deg,var(--cream) 0%,var(--cream-dark) 100%);
    }
    .menu-book-stage{
      max-width:920px;
      width:100%;
      margin:0 auto;
      padding:0;
    }
    .menu-book-ui,
    .menu-book-hint,
    .menu-book-footer{
      padding-left:clamp(1.15rem,4vw,1.5rem);
      padding-right:clamp(1.15rem,4vw,1.5rem);
    }
    .menu-book-hint{
      text-align:center;font-size:.84rem;color:rgba(43,43,43,.55);
      margin-top:1rem;font-style:italic;line-height:1.65;
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
      -webkit-tap-highlight-color:transparent;
    }
    .menu-book-btn:hover:not(:disabled){transform:translateY(-2px);background:#fff}
    .menu-book-btn:disabled{opacity:.35;cursor:not-allowed}
    .menu-book-counter{
      min-width:5.5rem;text-align:center;font-size:.88rem;color:var(--blue);
      font-variant-numeric:tabular-nums;letter-spacing:.04em;font-weight:500;
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
      gap:0;width:100%;
      border-radius:1rem;overflow:hidden;
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
      aspect-ratio:${MENU_PAGE_RATIO};
      min-height:0;
    }
    .menu-book-page-slot.left{border-radius:1rem 0 0 1rem}
    .menu-book-page-slot.right{border-radius:0 1rem 1rem 0}
    .menu-book-page-slot.blank{
      background:linear-gradient(135deg,#f0ebe3,#e7e0d5);
    }
    .menu-book-page-slot img{
      position:absolute;inset:0;width:100%;height:100%;
      display:block;object-fit:cover;object-position:center;
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
    .menu-book-flip-face img{
      position:absolute;inset:0;width:100%;height:100%;
      display:block;object-fit:cover;object-position:center;
    }
    .menu-book-flip-face.back{transform:rotateY(180deg)}
    .menu-book-hotzones{
      position:absolute;inset:0;display:grid;grid-template-columns:1fr 1fr;
      z-index:8;
    }
    .menu-book-hotzones button{
      appearance:none;border:0;background:transparent;cursor:pointer;
      -webkit-tap-highlight-color:transparent;
      -webkit-touch-callout:none;
      user-select:none;
    }
    .menu-book-hotzones button:active{background:transparent!important}
    .menu-book-hotzones button:focus-visible{
      outline:2px solid var(--sage);outline-offset:-4px;
    }
    .menu-book-mobile{
      display:none;position:relative;border-radius:1rem;overflow:hidden;
      width:100%;
      box-shadow:0 24px 60px rgba(7,57,84,.18);
      background:#fff;
      perspective:1600px;
      -webkit-tap-highlight-color:transparent;
    }
    .menu-book-mobile-stack{
      position:relative;width:100%;aspect-ratio:${MENU_PAGE_RATIO};
      transform-style:preserve-3d;
    }
    .menu-book-mobile-under,
    .menu-book-mobile-current{
      position:absolute;inset:0;background:#fff;
    }
    .menu-book-mobile-under{z-index:1}
    .menu-book-mobile-current{z-index:2}
    .menu-book-mobile-under img,
    .menu-book-mobile-current img{
      position:absolute;inset:0;width:100%;height:100%;
      display:block;object-fit:cover;object-position:center;
    }
    .menu-book-mobile-flipper{
      position:absolute;inset:0;transform-style:preserve-3d;
      transform-origin:left center;z-index:3;pointer-events:none;
      transition:transform .58s cubic-bezier(.42,.02,.25,1);
      transform:rotateY(0deg);
    }
    .menu-book-mobile-flipper.flipping-forward{transform:rotateY(-180deg)}
    .menu-book-mobile-flipper.flipping-back-from{
      transform-origin:right center;transform:rotateY(180deg);
    }
    .menu-book-mobile-flipper.flipping-back-from:not(.flipping-back-to){transition:none}
    .menu-book-mobile-flipper.flipping-back-from.flipping-back-to{
      transform:rotateY(0deg);
    }
    .menu-book-mobile-face{
      position:absolute;inset:0;backface-visibility:hidden;overflow:hidden;
      background:#fff;border-radius:1rem;
      box-shadow:-8px 0 28px rgba(7,57,84,.14);
    }
    .menu-book-mobile-face.back{transform:rotateY(180deg)}
    .menu-book-mobile-face img{
      position:absolute;inset:0;width:100%;height:100%;
      display:block;object-fit:cover;object-position:center;
    }
    .menu-book-mobile.menu-book-mobile-animating .menu-book-mobile-current{
      visibility:hidden;
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
      .menu-book-hint{font-size:.82rem}
      .menu-book-counter{font-size:.82rem}
      .menu-book-btn:active:not(:disabled){
        transform:none;
        box-shadow:0 4px 18px rgba(7,57,84,.08);
        background:var(--cream);
      }
    }
    @media(prefers-reduced-motion:reduce){
      .menu-book-flipper{transition:none}
      .menu-book-mobile-flipper{transition:none}
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
      var stage=root.closest('.menu-book-stage')||root.parentElement||root;
      var pages=JSON.parse(root.getAttribute('data-pages')||'[]');
      if(!pages.length)return;

      var spreadEl=root.querySelector('.menu-book-spread');
      var mobileEl=root.querySelector('.menu-book-mobile');
      var mobileCurrentImg=mobileEl?mobileEl.querySelector('.menu-book-mobile-current img'):null;
      var mobileUnderImg=mobileEl?mobileEl.querySelector('.menu-book-mobile-under img'):null;
      var mobileFlipper=mobileEl?mobileEl.querySelector('.menu-book-mobile-flipper'):null;
      var mobileFlipFront=mobileFlipper?mobileFlipper.querySelector('.menu-book-mobile-face.front img'):null;
      var mobileFlipBack=mobileFlipper?mobileFlipper.querySelector('.menu-book-mobile-face.back img'):null;
      var leftSlot=root.querySelector('.menu-book-page-slot.left');
      var rightSlot=root.querySelector('.menu-book-page-slot.right');
      var flipper=root.querySelector('.menu-book-flipper');
      var flipFront=flipper?flipper.querySelector('.menu-book-flip-face.front img'):null;
      var flipBack=flipper?flipper.querySelector('.menu-book-flip-face.back img'):null;
      var counter=stage.querySelector('.menu-book-counter');
      var navPrev=stage.querySelectorAll('[data-book-prev]');
      var navNext=stage.querySelectorAll('[data-book-next]');
      var reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var mobile=window.matchMedia('(max-width: 767px)').matches;

      var spread=0;
      var page=0;
      var busy=false;
      var touchX=0;
      var pageReady={};
      var inView=true;
      var autoplayTimer=null;
      var autoplayPaused=false;
      var autoplayResumeTimer=null;
      var AUTOPLAY_MS=parseInt(root.getAttribute('data-autoplay-ms')||'4200',10)||4200;
      var AUTOPLAY_START_MS=parseInt(root.getAttribute('data-autoplay-start-ms')||'1600',10)||1600;
      var AUTOPLAY_RESUME_MS=12000;

      function clearAutoplay(){
        if(autoplayTimer){window.clearTimeout(autoplayTimer);autoplayTimer=null;}
      }

      function clearAutoplayResume(){
        if(autoplayResumeTimer){window.clearTimeout(autoplayResumeTimer);autoplayResumeTimer=null;}
      }

      function isAtEnd(){
        if(mobile)return page>=pages.length-1;
        return spread>=spreadsCount()-1;
      }

      function canAutoplay(){
        if(reduced||autoplayPaused||busy||document.hidden||!inView)return false;
        return true;
      }

      function scheduleAutoplay(delay){
        clearAutoplay();
        if(!canAutoplay())return;
        autoplayTimer=window.setTimeout(function(){
          autoplayTimer=null;
          if(!canAutoplay())return;
          if(isAtEnd()){
            if(mobile){
              page=0;
              renderMobile(function(){scheduleAutoplay(AUTOPLAY_MS);});
            }else{
              spread=0;
              renderSpread(function(){scheduleAutoplay(AUTOPLAY_MS);});
            }
            return;
          }
          goNext(true);
          scheduleAutoplay(AUTOPLAY_MS);
        },typeof delay==='number'?delay:AUTOPLAY_MS);
      }

      function startAutoplay(){
        if(reduced)return;
        clearAutoplay();
        autoplayTimer=window.setTimeout(function(){
          autoplayTimer=null;
          scheduleAutoplay(AUTOPLAY_MS);
        },AUTOPLAY_START_MS);
      }

      function pauseAutoplay(){
        autoplayPaused=true;
        clearAutoplay();
        clearAutoplayResume();
        autoplayResumeTimer=window.setTimeout(function(){
          autoplayPaused=false;
          scheduleAutoplay(AUTOPLAY_MS);
        },AUTOPLAY_RESUME_MS);
      }

      function userTookControl(){
        pauseAutoplay();
      }

      function markReady(){
        root.classList.remove('menu-book-loading');
      }

      function loadPage(idx,cb){
        if(idx<0||idx>=pages.length){if(cb)cb();return;}
        if(pageReady[idx]){if(cb)cb();return;}
        var img=new Image();
        img.decoding='async';
        var done=function(){
          pageReady[idx]=true;
          if(cb)cb();
        };
        img.onload=done;
        img.onerror=done;
        img.src=pages[idx];
      }

      function loadPages(indices,cb){
        var pending=0;
        var seen={};
        for(var i=0;i<indices.length;i++){
          var idx=indices[i];
          if(idx<0||idx>=pages.length||seen[idx])continue;
          seen[idx]=true;
          if(pageReady[idx])continue;
          pending++;
          loadPage(idx,function(){
            pending--;
            if(pending<=0&&cb)cb();
          });
        }
        if(pending===0&&cb)cb();
      }

      function preloadAllPages(){
        for(var i=0;i<pages.length;i++)loadPage(i);
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

      function setImg(el,idx,cb){
        if(!el){if(cb)cb();return;}
        if(idx<0||idx>=pages.length){
          el.removeAttribute('src');
          el.alt='';
          if(cb)cb();
          return;
        }
        loadPage(idx,function(){
          if(el.src!==pages[idx])el.src=pages[idx];
          el.alt='Página '+(idx+1)+' del menú';
          el.loading='eager';
          el.decoding='async';
          if(el.complete&&el.naturalWidth>0){if(cb)cb();return;}
          el.addEventListener('load',function(){if(cb)cb();},{once:true});
          el.addEventListener('error',function(){if(cb)cb();},{once:true});
        });
      }

      function assignImg(el,idx){
        if(!el)return;
        if(idx<0||idx>=pages.length){
          el.removeAttribute('src');
          el.alt='';
          return;
        }
        el.src=pages[idx];
        el.alt='Página '+(idx+1)+' del menú';
        el.loading='eager';
        el.decoding='async';
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
        var atStart=mobile?(page<=0):(spread<=0);
        var atEnd=mobile?(page>=pages.length-1):(spread>=spreadsCount()-1);
        navPrev.forEach(function(btn){btn.disabled=atStart;});
        navNext.forEach(function(btn){btn.disabled=atEnd;});
      }

      function renderSpread(cb){
        var s=spreadPages(spread);
        setBlank(leftSlot,s.left<0);
        setBlank(rightSlot,s.right<0);
        var leftDone=s.left<0;
        var rightDone=s.right<0;
        function done(){
          if(leftDone&&rightDone){
            updateCounter();
            updateButtons();
            if(cb)cb();
          }
        }
        if(s.left>=0){
          setImg(leftSlot&&leftSlot.querySelector('img'),s.left,function(){leftDone=true;done();});
        }
        if(s.right>=0){
          setImg(rightSlot&&rightSlot.querySelector('img'),s.right,function(){rightDone=true;done();});
        }
        if(s.left<0&&s.right<0)done();
      }

      function renderMobile(cb){
        if(!mobileCurrentImg){if(cb)cb();return;}
        setImg(mobileCurrentImg,page,function(){
          if(mobileUnderImg){
            mobileUnderImg.removeAttribute('src');
            mobileUnderImg.alt='';
          }
          updateCounter();
          updateButtons();
          if(cb)cb();
        });
      }

      function finishMobileFlip(cb){
        if(mobileFlipper)mobileFlipper.className='menu-book-mobile-flipper';
        if(mobileEl)mobileEl.classList.remove('menu-book-mobile-animating');
        busy=false;
        if(cb)cb();
      }

      function animateMobileFlip(dir,cb){
        if(!mobileFlipper||!mobileCurrentImg||reduced){
          if(cb)cb();
          return;
        }
        var target=dir>0?page+1:page-1;
        if(target<0||target>=pages.length)return;
        loadPages([page,target],function(){
          busy=true;
          mobileEl.classList.add('menu-book-mobile-animating');
          if(dir>0){
            assignImg(mobileUnderImg,target);
            assignImg(mobileFlipFront,page);
            assignImg(mobileFlipBack,target);
            mobileFlipper.className='menu-book-mobile-flipper flipping-forward';
            window.setTimeout(function(){finishMobileFlip(cb);},580);
          }else{
            assignImg(mobileUnderImg,target);
            assignImg(mobileFlipFront,target);
            assignImg(mobileFlipBack,page);
            mobileFlipper.className='menu-book-mobile-flipper flipping-back-from';
            void mobileFlipper.offsetHeight;
            mobileFlipper.className='menu-book-mobile-flipper flipping-back-from flipping-back-to';
            window.setTimeout(function(){finishMobileFlip(cb);},580);
          }
        });
      }

      function render(){
        mobile=window.matchMedia('(max-width: 767px)').matches;
        if(mobile)renderMobile();
        else renderSpread();
      }

      function animateFlip(dir,cb){
        if(!flipper||reduced||mobile){
          if(cb)cb();
          return;
        }
        var s=spreadPages(spread);
        var next=dir>0?spreadPages(spread+1):spreadPages(spread-1);
        var frontIdx=dir>0?s.right:(next.right>=0?next.right:next.left);
        var backIdx=dir>0?(next.right>=0?next.right:next.left):(s.left>=0?s.left:s.right);
        loadPages([frontIdx,backIdx],function(){
          assignImg(flipFront,frontIdx);
          assignImg(flipBack,backIdx);
          flipper.className='menu-book-flipper '+(dir>0?'flipping-forward':'flipping-back');
          busy=true;
          window.setTimeout(function(){
            flipper.className='menu-book-flipper';
            busy=false;
            if(cb)cb();
          }, reduced?0:650);
        });
      }

      function goNext(fromAutoplay){
        if(busy)return;
        if(!fromAutoplay)userTookControl();
        if(mobile){
          if(page>=pages.length-1)return;
          animateMobileFlip(1,function(){
            page+=1;
            renderMobile();
          });
          return;
        }
        if(spread>=spreadsCount()-1)return;
        animateFlip(1,function(){
          spread+=1;
          renderSpread(prefetchAround);
        });
      }

      function goPrev(fromAutoplay){
        if(busy)return;
        if(!fromAutoplay)userTookControl();
        if(mobile){
          if(page<=0)return;
          animateMobileFlip(-1,function(){
            page-=1;
            renderMobile();
          });
          return;
        }
        if(spread<=0)return;
        spread-=1;
        renderSpread();
      }

      function prefetchAround(){
        if(mobile){
          loadPages([page-1,page,page+1,page+2]);
        }else{
          var s=spreadPages(spread);
          var next=spreadPages(spread+1);
          loadPages([s.left,s.right,next.left,next.right]);
        }
      }

      navNext.forEach(function(el){
        el.addEventListener('click',function(){goNext(false);});
      });
      navPrev.forEach(function(el){
        el.addEventListener('click',function(){goPrev(false);});
      });

      root.addEventListener('keydown',function(e){
        if(e.key==='ArrowRight'||e.key==='PageDown'){e.preventDefault();goNext(false);}
        if(e.key==='ArrowLeft'||e.key==='PageUp'){e.preventDefault();goPrev(false);}
      });

      root.addEventListener('touchstart',function(e){
        touchX=e.changedTouches[0].clientX;
        userTookControl();
      },{passive:true});

      root.addEventListener('touchend',function(e){
        var dx=e.changedTouches[0].clientX-touchX;
        if(Math.abs(dx)<40)return;
        if(dx<0)goNext(false);
        else goPrev(false);
      },{passive:true});

      if('IntersectionObserver' in window){
        var observer=new IntersectionObserver(function(entries){
          inView=!!(entries[0]&&entries[0].isIntersecting);
          if(inView&&!autoplayPaused&&!reduced)scheduleAutoplay(AUTOPLAY_MS);
          else clearAutoplay();
        },{threshold:0.3});
        observer.observe(root);
      }

      document.addEventListener('visibilitychange',function(){
        if(document.hidden)clearAutoplay();
        else if(!autoplayPaused&&!reduced)scheduleAutoplay(AUTOPLAY_MS);
      });

      window.addEventListener('resize',function(){
        var wasMobile=mobile;
        mobile=window.matchMedia('(max-width: 767px)').matches;
        if(wasMobile!==mobile)render();
      });

      root.classList.add('menu-book-loading');
      loadPage(0,function(){
        render();
        var firstVisible=mobile?mobileCurrentImg:(rightSlot&&rightSlot.querySelector('img'));
        watchImageLoad(firstVisible,function(){
          markReady();
          preloadAllPages();
          prefetchAround();
          startAutoplay();
        });
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
      <div class="menu-book-viewport menu-book-loading" id="menu-book" data-pages='${dataPages}' data-autoplay-ms="4200" data-autoplay-start-ms="1600" tabindex="0" aria-label="Menú digital interactivo">
        <div class="menu-book-spread" aria-hidden="false">
          <div class="menu-book-page-slot left blank"><img alt="" loading="eager" decoding="async"/></div>
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
          <div class="menu-book-mobile-stack">
            <div class="menu-book-mobile-under" aria-hidden="true"><img alt="" decoding="async"/></div>
            <div class="menu-book-mobile-current">
              <img src="${pageUrls[0]}" alt="Página 1 del menú" loading="eager" fetchpriority="high" decoding="async"/>
            </div>
            <div class="menu-book-mobile-flipper" aria-hidden="true">
              <div class="menu-book-mobile-face front"><img alt="" decoding="async"/></div>
              <div class="menu-book-mobile-face back"><img alt="" decoding="async"/></div>
            </div>
          </div>
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
      <p class="menu-book-hint">El menú avanza solo al abrir. Desliza o toca los lados para pasar página como un libro</p>
      ${disclaimer ? `<div class="menu-book-footer"><p>${disclaimer}</p></div>` : ""}
    </div>
  </div>
  <script>${menuBookScript()}</script>`;
}

export function getMenuBookPagePaths(manifest = loadDriveAssets()) {
  return resolveMenuBookPages(manifest);
}
