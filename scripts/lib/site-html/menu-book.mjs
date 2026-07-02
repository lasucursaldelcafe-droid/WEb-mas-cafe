import { loadDriveAssets, resolveMenuBookPages } from "../drive-assets.mjs";

/** Proporción real de las páginas del menú (792×1224 px) */
const MENU_PAGE_RATIO = "792 / 1224";

/** Página inicial del flipbook (índice 0 = página 1). Por defecto: página 2. */
export const MENU_BOOK_START_PAGE = 1;

export function menuBookStyles() {
  return `
    .menu-book-section{
      padding:0 0 clamp(3.5rem,8vw,5.5rem);
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
    }
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
      touch-action:pan-y;
      min-height:min(72vw,520px);
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
    .menu-book-flipper{display:none}
    .menu-book-hotzones{
      position:absolute;inset:0;z-index:8;pointer-events:none;
    }
    .menu-book-hotzones button{
      appearance:none;border:0;background:transparent;cursor:pointer;
      position:absolute;top:0;bottom:0;width:18%;max-width:5.5rem;
      pointer-events:auto;
      -webkit-tap-highlight-color:transparent;
      -webkit-touch-callout:none;
      user-select:none;
    }
    .menu-book-hotzones button[data-book-prev]{left:0}
    .menu-book-hotzones button[data-book-next]{right:0}
    .menu-book-hotzones button:active{background:transparent!important}
    .menu-book-hotzones button:focus-visible{
      outline:2px solid var(--sage);outline-offset:-4px;
    }
    .menu-book-mobile{
      display:none;position:relative;border-radius:1rem;overflow:hidden;
      width:100%;
      box-shadow:0 24px 60px rgba(7,57,84,.18);
      background:#fff;
      -webkit-tap-highlight-color:transparent;
    }
    .menu-book-mobile-stack{
      position:relative;width:100%;aspect-ratio:${MENU_PAGE_RATIO};
    }
    .menu-book-mobile-current{
      position:absolute;inset:0;background:#fff;
    }
    .menu-book-mobile-current img{
      position:absolute;inset:0;width:100%;height:100%;
      display:block;object-fit:cover;object-position:center;
    }
    .menu-book-mobile-flipper{display:none}
    .menu-book-mobile .menu-book-hotzones button[data-book-prev]{left:0}
    .menu-book-mobile .menu-book-hotzones button[data-book-next]{right:0}
    .menu-book-footer{
      text-align:center;
      padding:clamp(2rem,4vw,2.5rem) clamp(1.15rem,4vw,1.5rem) clamp(2.75rem,7vw,4rem);
      margin-top:.75rem;
    }
    .menu-book-footer p{
      font-size:clamp(.82rem,1.05vw,.92rem);letter-spacing:.05em;
      color:rgba(43,43,43,.45);font-style:italic;line-height:1.65;
    }
    @media(min-width:768px){
      .menu-book-ui{margin-top:1.5rem}
      .menu-book-hint{font-size:.92rem;margin-top:1.25rem;line-height:1.7}
      .menu-book-counter{font-size:.95rem}
    }
    @media(max-width:767px){
      .menu-book-spread{display:none}
      .menu-book-mobile{display:block}
      .menu-book-hint{font-size:.82rem}
      .menu-book-counter{font-size:.82rem}
      .menu-book-btn:active:not(:disabled){
        transform:none;
        box-shadow:0 4px 18px rgba(7,57,84,.08);
        background:var(--cream);
      }
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
      var leftSlot=root.querySelector('.menu-book-page-slot.left');
      var rightSlot=root.querySelector('.menu-book-page-slot.right');
      var counter=stage.querySelector('.menu-book-counter');
      var navPrev=stage.querySelectorAll('[data-book-prev]');
      var navNext=stage.querySelectorAll('[data-book-next]');
      var mobile=window.matchMedia('(max-width: 767px)').matches;

      var startPage=parseInt(root.getAttribute('data-initial-page')||'${MENU_BOOK_START_PAGE}',10);
      if(isNaN(startPage)||startPage<0)startPage=0;
      if(startPage>=pages.length)startPage=pages.length-1;
      var startSpread=parseInt(root.getAttribute('data-initial-spread')||'1',10);
      if(isNaN(startSpread)||startSpread<0)startSpread=0;

      var spread=startPage>0?startSpread:0;
      var page=startPage;
      var touchX=0;
      var pageReady={};

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

      function markDomReady(el,idx){
        if(!el||!el.src||idx<0)return;
        if(el.complete&&el.naturalWidth>0)pageReady[idx]=true;
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

      function assignImg(el,idx){
        if(!el)return;
        if(idx<0||idx>=pages.length){
          el.removeAttribute('src');
          el.alt='';
          return;
        }
        if(el.src!==pages[idx])el.src=pages[idx];
        el.alt='Página '+(idx+1)+' del menú';
        el.loading='eager';
        el.decoding='sync';
        if(el.complete&&el.naturalWidth>0)pageReady[idx]=true;
      }

      function setBlank(slot,blank){
        if(!slot)return;
        slot.classList.toggle('blank',!!blank);
        var img=slot.querySelector('img');
        if(blank&&img){img.removeAttribute('src');img.alt='';}
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
        if(s.left>=0)assignImg(leftSlot&&leftSlot.querySelector('img'),s.left);
        if(s.right>=0)assignImg(rightSlot&&rightSlot.querySelector('img'),s.right);
        updateCounter();
        updateButtons();
        if(cb)cb();
      }

      function renderMobile(cb){
        if(!mobileCurrentImg){if(cb)cb();return;}
        assignImg(mobileCurrentImg,page);
        updateCounter();
        updateButtons();
        if(cb)cb();
      }

      function render(cb){
        mobile=window.matchMedia('(max-width: 767px)').matches;
        if(mobile)renderMobile(cb);
        else renderSpread(cb);
      }

      function prefetchAround(){
        if(mobile){
          loadPages([page-1,page,page+1,page+2]);
        }else{
          var s=spreadPages(spread);
          var next=spreadPages(spread+1);
          var prev=spreadPages(spread-1);
          loadPages([s.left,s.right,next.left,next.right,prev.left,prev.right]);
        }
      }

      function goNext(){
        if(mobile){
          if(page>=pages.length-1)return;
          page+=1;
          renderMobile(prefetchAround);
          return;
        }
        if(spread>=spreadsCount()-1)return;
        spread+=1;
        renderSpread(prefetchAround);
      }

      function goPrev(){
        if(mobile){
          if(page<=0)return;
          page-=1;
          renderMobile(prefetchAround);
          return;
        }
        if(spread<=0)return;
        spread-=1;
        renderSpread(prefetchAround);
      }

      navNext.forEach(function(el){
        el.addEventListener('click',function(){goNext();});
      });
      navPrev.forEach(function(el){
        el.addEventListener('click',function(){goPrev();});
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

      markDomReady(mobileCurrentImg,startPage);
      if(leftSlot)markDomReady(leftSlot.querySelector('img'),spreadPages(spread).left);
      if(rightSlot)markDomReady(rightSlot.querySelector('img'),spreadPages(spread).right);

      page=startPage;
      spread=startPage>0?startSpread:0;
      render(prefetchAround);
    })();
  `;
}

function initialSpreadForPage(pageIndex) {
  if (pageIndex <= 0) return 0;
  return 1;
}

function initialCounterLabel(pageIndex, pageCount, spreadIndex, pages) {
  if (pageCount <= 1) return `1 / ${pageCount}`;
  const s =
    spreadIndex === 0
      ? { left: -1, right: 0 }
      : { left: 2 * spreadIndex - 1, right: Math.min(2 * spreadIndex, pageCount - 1) };
  const mobile = `${pageIndex + 1} / ${pageCount}`;
  const parts = [];
  if (s.left >= 0) parts.push(s.left + 1);
  if (s.right >= 0 && s.right !== s.left) parts.push(s.right + 1);
  const desktop = parts.length ? `Pág. ${parts.join(" · ")} / ${pageCount}` : mobile;
  return { mobile, desktop };
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
  const startPage = Math.min(MENU_BOOK_START_PAGE, pages.length - 1);
  const startSpread = initialSpreadForPage(startPage);
  const s = startSpread === 0 ? { left: -1, right: 0 } : { left: startPage, right: Math.min(startPage + 1, pages.length - 1) };
  const labels = initialCounterLabel(startPage, pages.length, startSpread, pages);

  const leftBlank = s.left < 0;
  const rightBlank = s.right < 0;
  const leftImg = !leftBlank ? pageUrls[s.left] : "";
  const rightImg = !rightBlank ? pageUrls[s.right] : "";
  const mobileImg = pageUrls[startPage];

  return `
  <div class="menu-book-section">
    <style>${menuBookStyles()}</style>
    <div class="menu-book-stage">
      <div class="menu-book-viewport" id="menu-book" data-pages='${dataPages}' data-initial-page="${startPage}" data-initial-spread="${startSpread}" tabindex="0" aria-label="Menú digital interactivo">
        <div class="menu-book-spread" aria-hidden="false">
          <div class="menu-book-page-slot left${leftBlank ? " blank" : ""}">
            <img src="${leftImg}" alt="${leftBlank ? "" : `Página ${s.left + 1} del menú`}" loading="eager" fetchpriority="high" decoding="sync"${leftBlank ? ' style="display:none"' : ""}/>
          </div>
          <div class="menu-book-page-slot right${rightBlank ? " blank" : ""}">
            <img src="${rightImg}" alt="${rightBlank ? "" : `Página ${s.right + 1} del menú`}" loading="eager" fetchpriority="high" decoding="sync"${rightBlank ? ' style="display:none"' : ""}/>
          </div>
          <div class="menu-book-hotzones" aria-hidden="true">
            <button type="button" data-book-prev aria-label="Página anterior"></button>
            <button type="button" data-book-next aria-label="Página siguiente"></button>
          </div>
        </div>
        <div class="menu-book-mobile">
          <div class="menu-book-mobile-stack">
            <div class="menu-book-mobile-current">
              <img src="${mobileImg}" alt="Página ${startPage + 1} del menú" loading="eager" fetchpriority="high" decoding="sync"/>
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
        <span class="menu-book-counter" data-counter-mobile="${labels.mobile}" data-counter-desktop="${labels.desktop}">${labels.mobile}</span>
        <button type="button" class="menu-book-btn" data-book-next aria-label="Página siguiente">›</button>
      </div>
      <p class="menu-book-hint">Usa las flechas o toca los bordes izquierdo y derecho para pasar página. Sin animación — cambio instantáneo.</p>
      ${disclaimer ? `<div class="menu-book-footer"><p>${disclaimer}</p></div>` : ""}
    </div>
  </div>
  <script>${menuBookScript()}</script>`;
}

export function getMenuBookPagePaths(manifest = loadDriveAssets()) {
  return resolveMenuBookPages(manifest);
}
