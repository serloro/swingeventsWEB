import"./hoisted.Dz-OhTSf.js";const w={"l-bg":0,"l-fondo":.08,"l-musicos":.38,"l-crowd":.68},E=26,b=22,L=52,M=.38,A=4;let m=0,f=0,i=0,d=0,u=0,v=0;const l=document.getElementById("hero");if(!l)throw new Error("hero not found");l.addEventListener("mousemove",e=>{const t=l.getBoundingClientRect();m=(e.clientX-t.left)/t.width*2-1,f=(e.clientY-t.top)/t.height*2-1});l.addEventListener("mouseleave",()=>{m=0,f=0});window.addEventListener("scroll",()=>{v=Math.min(window.scrollY/(l.offsetHeight||window.innerHeight),1);const e=document.querySelector(".hero-content");e&&(e.style.transform=`translateX(-50%) translateY(${window.scrollY*.17}px)`)},{passive:!0});(function e(){u+=.007,i+=(m-i)*.055,d+=(f-d)*.055;for(const[t,n]of Object.entries(w)){const c=document.getElementById(t);if(!c)continue;const a=-i*E*n+Math.sin(u*.65+n*2)*6*n-v*L*(1-n),s=(M-n)*A,o=d*b*s+Math.cos(u*.5+n*1.5)*5*n;c.style.transform=`translate(${a}px,${o}px)`}requestAnimationFrame(e)})();const y=["January","February","March","April","May","June","July","August","September","October","November","December"],B={festival:"#9A9A18",social:"#3A9A86",workshop:"#9A2090",competicion:"#9A2020",exchange:"#209A7A"};function I(e){return e.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}const C=document.getElementById("events-data").textContent,h=JSON.parse(C);function S(e){return new Date(e).getDate().toString().padStart(2,"0")}function D(e){return y[new Date(e).getMonth()].slice(0,3)}function H(e){const t=new Date(e);return`${y[t.getMonth()]} ${t.getFullYear()}`}function O(e){const t=e.type==="festival",n=t?"a":"div",c=t?`href="/${I(e.name)}/${new Date(e.date).getFullYear()}/"`:"",a=t?"ev-row ev-row--festival":"ev-row",s=t?`data-astro-transition-name="festival-${e.id}"`:"",o=t?'<span class="ev-arrow">→</span>':"",r=B[e.type]??"#888",$=e.image?`<img src="${e.image}" alt="" class="ev-thumb" />`:"";return`<${n} class="${a}" ${c}>
      <div class="ev-date">
        <span class="ev-day">${S(e.date)}</span>
        <span class="ev-ms">${D(e.date)}</span>
      </div>
      <div class="ev-thumb-slot">${$}</div>
      <div class="ev-info">
        <div class="ev-name" ${s}>${e.name}</div>
        <div class="ev-meta">
          <span><i class="dot"></i>${e.city}, ${e.country}</span>
          <span><i class="dot"></i>${e.style}</span>
          <span><i class="dot"></i>${e.continent}</span>
        </div>
      </div>
      <div class="ev-aside">
        <span class="ev-tag" style="color:${r};border-color:${r};">${e.type}</span>
        ${o}
      </div>
    </${n}>`}function g(e){const t=document.getElementById("events-out"),n=document.getElementById("results-info");if(!e.length){t.innerHTML='<div class="no-results">No events found matching the selected filters.</div>',n.innerHTML="";return}const c=[...e].sort((o,r)=>o.date.localeCompare(r.date)),a={};c.forEach(o=>{(a[H(o.date)]??=[]).push(o)});const s=Object.keys(a);n.innerHTML=`Showing <b>${e.length}</b> event${e.length!==1?"s":""} across <b>${s.length}</b> month${s.length!==1?"s":""}`,t.innerHTML=s.map((o,r)=>`
      <div class="month-block">
        <div class="month-hdr">${o}<span>${a[o].length} event${a[o].length!==1?"s":""}</span></div>
        ${a[o].map(O).join("")}
      </div>`).join(""),document.dispatchEvent(new CustomEvent("events-rendered"))}function p(){const e=document.getElementById("f-search").value.toLowerCase(),t=document.getElementById("f-style").value,n=document.getElementById("f-cont").value,c=document.getElementById("f-country").value,a=document.getElementById("f-type").value;g(h.filter(s=>!(e&&!s.name.toLowerCase().includes(e)&&!s.city.toLowerCase().includes(e)||t&&s.style!==t||n&&s.continent!==n||c&&s.country!==c||a&&s.type!==a)))}document.getElementById("btn-filter").addEventListener("click",p);document.getElementById("btn-clear").addEventListener("click",()=>{["f-search","f-style","f-cont","f-country","f-type"].forEach(e=>{document.getElementById(e).value=""}),g(h),document.getElementById("results-info").innerHTML=""});document.getElementById("f-search").addEventListener("keydown",e=>{e.key==="Enter"&&p()});
