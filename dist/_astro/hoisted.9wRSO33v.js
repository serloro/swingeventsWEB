import"./hoisted.DdjBS11S.js";const L={"l-bg":0,"l-fondo":.08,"l-musicos":.38,"l-crowd":.68},A=26,I=22,B=52,S=.38,C=4;let u=0,p=0,d=0,m=0,v=0,$=0;const c=document.getElementById("hero");if(!c)throw new Error("hero not found");c.addEventListener("mousemove",e=>{const t=c.getBoundingClientRect();u=(e.clientX-t.left)/t.width*2-1,p=(e.clientY-t.top)/t.height*2-1});c.addEventListener("mouseleave",()=>{u=0,p=0});window.addEventListener("scroll",()=>{$=Math.min(window.scrollY/(c.offsetHeight||window.innerHeight),1);const e=document.querySelector(".hero-content");e&&(e.style.transform=`translateX(-50%) translateY(${window.scrollY*.17}px)`)},{passive:!0});(function e(){v+=.007,d+=(u-d)*.055,m+=(p-m)*.055;for(const[t,n]of Object.entries(L)){const a=document.getElementById(t);if(!a)continue;const o=-d*A*n+Math.sin(v*.65+n*2)*6*n-$*B*(1-n),r=(S-n)*C,s=m*I*r+Math.cos(v*.5+n*1.5)*5*n;a.style.transform=`translate(${o}px,${s}px)`}requestAnimationFrame(e)})();const f=["January","February","March","April","May","June","July","August","September","October","November","December"],x={festival:"#9A9A18",social:"#3A9A86",workshop:"#9A2090",competicion:"#9A2020",exchange:"#209A7A"};function D(e){return e.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}const O=document.getElementById("events-data").textContent,y=JSON.parse(O);function g(e){return new Date(e).getDate().toString().padStart(2,"0")}function h(e){return f[new Date(e).getMonth()].slice(0,3)}function T(e){const t=new Date(e);return`${f[t.getMonth()]} ${t.getFullYear()}`}function H(e){const t=e.split(" "),n=String(f.indexOf(t[0])+1).padStart(2,"0");return`/mapa/${t[1]}/${n}/`}const Y='<svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M8 0C5.24 0 3 2.24 3 5c0 4.5 5 11 5 11S13 9.5 13 5c0-2.76-2.24-5-5-5zm0 7.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"/></svg>';function k(e){const t=e.type==="festival",n=t&&!!e.image,a=t?"a":"div",o=t?`href="/${D(e.name)}/${new Date(e.date).getFullYear()}/"`:"",r=`ev-row${t?" ev-row--festival":""}${n?" has-image":""}`,s=t?`data-astro-transition-name="festival-${e.id}"`:"",i=t?'<span class="ev-arrow">→</span>':"",l=x[e.type]??"#888",E=e.image?`<img src="${e.image}" alt="" class="ev-thumb" loading="lazy" />`:"",M=n?`
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
      </div>`:"";return`<${a} class="${r}" ${o}>
      ${M}
      <div class="ev-date">
        <span class="ev-day">${g(e.date)}</span>
        <span class="ev-ms">${h(e.date)}</span>
      </div>
      <div class="ev-thumb-slot">${E}</div>
      <div class="ev-info">
        <div class="ev-name" ${s}>${e.name}</div>
        <div class="ev-meta">
          <span><i class="dot"></i>${e.city}, ${e.country}</span>
          <span><i class="dot"></i>${e.style}</span>
          <span><i class="dot"></i>${e.continent}</span>
        </div>
      </div>
      <div class="ev-aside">
        ${t?"":`<span class="ev-tag" style="color:${l};border-color:${l};">${e.type}</span>`}
        ${i}
      </div>
    </${a}>`}function w(e){const t=document.getElementById("events-out"),n=document.getElementById("results-info");if(!e.length){t.innerHTML='<div class="no-results">No events found matching the selected filters.</div>',n.innerHTML="";return}const a=[...e].sort((s,i)=>s.date.localeCompare(i.date)),o={};a.forEach(s=>{(o[T(s.date)]??=[]).push(s)});const r=Object.keys(o);n.innerHTML=`Showing <b>${e.length}</b> event${e.length!==1?"s":""} across <b>${r.length}</b> month${r.length!==1?"s":""}`,t.innerHTML=r.map((s,i)=>`
      <div class="month-block">
        <div class="month-hdr">${s}<span>${o[s].length} event${o[s].length!==1?"s":""}</span><a href="${H(s)}" class="month-map-btn">${Y}View on map</a></div>
        ${o[s].map(k).join("")}
      </div>`).join(""),document.dispatchEvent(new CustomEvent("events-rendered"))}function b(){const e=document.getElementById("f-search").value.toLowerCase(),t=document.getElementById("f-style").value,n=document.getElementById("f-cont").value;w(y.filter(a=>!(e&&!a.name.toLowerCase().includes(e)&&!a.city.toLowerCase().includes(e)||t&&a.style!==t||n&&a.continent!==n)))}document.getElementById("btn-filter").addEventListener("click",b);document.getElementById("btn-clear").addEventListener("click",()=>{["f-search","f-style","f-cont"].forEach(e=>{document.getElementById(e).value=""}),w(y),document.getElementById("results-info").innerHTML=""});document.getElementById("f-search").addEventListener("keydown",e=>{e.key==="Enter"&&b()});
