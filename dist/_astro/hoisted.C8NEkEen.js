import"./hoisted.C04Bytwv.js";const $={"l-bg":0,"l-fondo":.08,"l-musicos":.38,"l-crowd":.68},w=26,E=22,M=52,L=.38,b=4;let m=0,f=0,i=0,d=0,u=0,v=0;const l=document.getElementById("hero");if(!l)throw new Error("hero not found");l.addEventListener("mousemove",e=>{const t=l.getBoundingClientRect();m=(e.clientX-t.left)/t.width*2-1,f=(e.clientY-t.top)/t.height*2-1});l.addEventListener("mouseleave",()=>{m=0,f=0});window.addEventListener("scroll",()=>{v=Math.min(window.scrollY/(l.offsetHeight||window.innerHeight),1);const e=document.querySelector(".hero-content");e&&(e.style.transform=`translateX(-50%) translateY(${window.scrollY*.17}px)`)},{passive:!0});(function e(){u+=.007,i+=(m-i)*.055,d+=(f-d)*.055;for(const[t,n]of Object.entries($)){const a=document.getElementById(t);if(!a)continue;const r=-i*w*n+Math.sin(u*.65+n*2)*6*n-v*M*(1-n),o=(L-n)*b,s=d*E*o+Math.cos(u*.5+n*1.5)*5*n;a.style.transform=`translate(${r}px,${s}px)`}requestAnimationFrame(e)})();const y=["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"],A={festival:"#9A9A18",social:"#3A9A86",workshop:"#9A2090",competicion:"#9A2020",exchange:"#209A7A"};function B(e){return e.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}const I=document.getElementById("events-data").textContent,p=JSON.parse(I);function C(e){return new Date(e).getDate().toString().padStart(2,"0")}function D(e){return y[new Date(e).getMonth()].slice(0,3)}function S(e){const t=new Date(e);return`${y[t.getMonth()]} ${t.getFullYear()}`}function H(e){const t=e.type==="festival",n=t?"a":"div",a=t?`href="/${B(e.name)}/${new Date(e.date).getFullYear()}/"`:"",r=t?"ev-row ev-row--festival":"ev-row",o=t?`data-astro-transition-name="festival-${e.id}"`:"",s=t?'<span class="ev-arrow">→</span>':"",c=A[e.type]??"#888";return`<${n} class="${r}" ${a}>
      <div class="ev-date">
        <span class="ev-day">${C(e.date)}</span>
        <span class="ev-ms">${D(e.date)}</span>
      </div>
      <div class="ev-info">
        <div class="ev-name" ${o}>${e.name}</div>
        <div class="ev-meta">
          <span><i class="dot"></i>${e.city}, ${e.country}</span>
          <span><i class="dot"></i>${e.style}</span>
          <span><i class="dot"></i>${e.continent}</span>
        </div>
      </div>
      <div class="ev-aside">
        <span class="ev-tag" style="color:${c};border-color:${c};">${e.type}</span>
        ${s}
      </div>
    </${n}>`}function g(e){const t=document.getElementById("events-out"),n=document.getElementById("results-info");if(!e.length){t.innerHTML='<div class="no-results">No se encontraron eventos con los filtros seleccionados.</div>',n.innerHTML="";return}const a=[...e].sort((s,c)=>s.date.localeCompare(c.date)),r={};a.forEach(s=>{(r[S(s.date)]??=[]).push(s)});const o=Object.keys(r);n.innerHTML=`Mostrando <b>${e.length}</b> evento${e.length!==1?"s":""} en <b>${o.length}</b> mes${o.length!==1?"es":""}`,t.innerHTML=o.map((s,c)=>`
      <div class="month-block reveal visible" style="--rd:${c*.08}s">
        <div class="month-hdr">${s}<span>${r[s].length} evento${r[s].length!==1?"s":""}</span></div>
        ${r[s].map(H).join("")}
      </div>`).join(""),document.dispatchEvent(new CustomEvent("events-rendered"))}function h(){const e=document.getElementById("f-search").value.toLowerCase(),t=document.getElementById("f-style").value,n=document.getElementById("f-cont").value,a=document.getElementById("f-country").value,r=document.getElementById("f-type").value;g(p.filter(o=>!(e&&!o.name.toLowerCase().includes(e)&&!o.city.toLowerCase().includes(e)||t&&o.style!==t||n&&o.continent!==n||a&&o.country!==a||r&&o.type!==r)))}document.getElementById("btn-filter").addEventListener("click",h);document.getElementById("btn-clear").addEventListener("click",()=>{["f-search","f-style","f-cont","f-country","f-type"].forEach(e=>{document.getElementById(e).value=""}),g(p),document.getElementById("results-info").innerHTML=""});document.getElementById("f-search").addEventListener("keydown",e=>{e.key==="Enter"&&h()});
