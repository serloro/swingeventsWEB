import"./hoisted.DdjBS11S.js";const L={"l-bg":0,"l-fondo":.08,"l-musicos":.38,"l-crowd":.68},I=26,B=22,A=52,S=.38,C=4;let v=0,f=0,d=0,m=0,u=0,y=0;const c=document.getElementById("hero");if(!c)throw new Error("hero not found");c.addEventListener("mousemove",e=>{const t=c.getBoundingClientRect();v=(e.clientX-t.left)/t.width*2-1,f=(e.clientY-t.top)/t.height*2-1});c.addEventListener("mouseleave",()=>{v=0,f=0});window.addEventListener("scroll",()=>{y=Math.min(window.scrollY/(c.offsetHeight||window.innerHeight),1);const e=document.querySelector(".hero-content");e&&(e.style.transform=`translateX(-50%) translateY(${window.scrollY*.17}px)`)},{passive:!0});(function e(){u+=.007,d+=(v-d)*.055,m+=(f-m)*.055;for(const[t,n]of Object.entries(L)){const r=document.getElementById(t);if(!r)continue;const o=-d*I*n+Math.sin(u*.65+n*2)*6*n-y*A*(1-n),s=(S-n)*C,a=m*B*s+Math.cos(u*.5+n*1.5)*5*n;r.style.transform=`translate(${o}px,${a}px)`}requestAnimationFrame(e)})();const p=["January","February","March","April","May","June","July","August","September","October","November","December"],x={festival:"#9A9A18",social:"#3A9A86",workshop:"#9A2090",competicion:"#9A2020",exchange:"#209A7A"};function D(e){return e.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}const O=document.getElementById("events-data").textContent,$=JSON.parse(O);function g(e){return new Date(e).getDate().toString().padStart(2,"0")}function h(e){return p[new Date(e).getMonth()].slice(0,3)}function T(e){const t=new Date(e);return`${p[t.getMonth()]} ${t.getFullYear()}`}function H(e){const t=e.split(" "),n=String(p.indexOf(t[0])+1).padStart(2,"0");return`/mapa/${t[1]}/${n}/`}const Y='<svg viewBox="0 0 16 16" width="11" height="11" fill="currentColor" aria-hidden="true"><path d="M8 0C5.24 0 3 2.24 3 5c0 4.5 5 11 5 11S13 9.5 13 5c0-2.76-2.24-5-5-5zm0 7.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"/></svg>';function k(e){const t=e.type==="festival",n=t&&!!e.image,r=t?"a":"div",o=t?`href="/${D(e.name)}/${new Date(e.date).getFullYear()}/"`:"",s=`ev-row${t?" ev-row--festival":""}${n?" has-image":""}`,a=t?`data-astro-transition-name="festival-${e.id}"`:"",i=t?'<span class="ev-arrow">→</span>':"",l=x[e.type]??"#888",E=e.image?`<img src="${e.image}" alt="" class="ev-thumb" loading="lazy" />`:"",M=n?`
      <div class="ev-banner" aria-hidden="true">
        <img src="${e.image}" alt="" class="ev-banner-img" loading="lazy" />
        <div class="ev-banner-ui">
          <div class="ev-banner-date">
            <span class="ev-day">${g(e.date)}</span>
            <span class="ev-ms">${h(e.date)}</span>
          </div>
          <span class="ev-tag ev-tag--glass" style="color:${l};border-color:${l}">${e.type}</span>
        </div>
        <div class="ev-banner-foot">
          <div class="ev-banner-name">${e.name}</div>
          <div class="ev-banner-meta">
            <span>${e.city}, ${e.country}</span>
            <span>${e.style}</span>
          </div>
        </div>
        <span class="ev-arrow ev-arrow--banner">→</span>
      </div>`:"";return`<${r} class="${s}" ${o}>
      ${M}
      <div class="ev-date">
        <span class="ev-day">${g(e.date)}</span>
        <span class="ev-ms">${h(e.date)}</span>
      </div>
      <div class="ev-thumb-slot">${E}</div>
      <div class="ev-info">
        <div class="ev-name" ${a}>${e.name}</div>
        <div class="ev-meta">
          <span><i class="dot"></i>${e.city}, ${e.country}</span>
          <span><i class="dot"></i>${e.style}</span>
          <span><i class="dot"></i>${e.continent}</span>
        </div>
      </div>
      <div class="ev-aside">
        <span class="ev-tag" style="color:${l};border-color:${l};">${e.type}</span>
        ${i}
      </div>
    </${r}>`}function w(e){const t=document.getElementById("events-out"),n=document.getElementById("results-info");if(!e.length){t.innerHTML='<div class="no-results">No events found matching the selected filters.</div>',n.innerHTML="";return}const r=[...e].sort((a,i)=>a.date.localeCompare(i.date)),o={};r.forEach(a=>{(o[T(a.date)]??=[]).push(a)});const s=Object.keys(o);n.innerHTML=`Showing <b>${e.length}</b> event${e.length!==1?"s":""} across <b>${s.length}</b> month${s.length!==1?"s":""}`,t.innerHTML=s.map((a,i)=>`
      <div class="month-block">
        <div class="month-hdr">${a}<span>${o[a].length} event${o[a].length!==1?"s":""}</span><a href="${H(a)}" class="month-map-btn">${Y}Map</a></div>
        ${o[a].map(k).join("")}
      </div>`).join(""),document.dispatchEvent(new CustomEvent("events-rendered"))}function b(){const e=document.getElementById("f-search").value.toLowerCase(),t=document.getElementById("f-style").value,n=document.getElementById("f-cont").value,r=document.getElementById("f-country").value,o=document.getElementById("f-type").value;w($.filter(s=>!(e&&!s.name.toLowerCase().includes(e)&&!s.city.toLowerCase().includes(e)||t&&s.style!==t||n&&s.continent!==n||r&&s.country!==r||o&&s.type!==o)))}document.getElementById("btn-filter").addEventListener("click",b);document.getElementById("btn-clear").addEventListener("click",()=>{["f-search","f-style","f-cont","f-country","f-type"].forEach(e=>{document.getElementById(e).value=""}),w($),document.getElementById("results-info").innerHTML=""});document.getElementById("f-search").addEventListener("keydown",e=>{e.key==="Enter"&&b()});
