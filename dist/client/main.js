import"./chunk-SMOAJWVW.js";var ae=window._;var D=class{constructor(o,t){this.dbName=o,this.storeName=t}openDB(){return new Promise((o,t)=>{let e=indexedDB.open(this.dbName,1);e.onupgradeneeded=s=>{let r=s.target.result;r.objectStoreNames.contains(this.storeName)||r.createObjectStore(this.storeName,{keyPath:"id",autoIncrement:!0})},e.onsuccess=s=>{o(s.target.result)},e.onerror=s=>{t(s.target.error)}})}addItem(o){return this.openDB().then(t=>new Promise((e,s)=>{let l=t.transaction([this.storeName],"readwrite").objectStore(this.storeName).add(o);l.onsuccess=()=>{e(l.result)},l.onerror=()=>{s(l.error)}}))}getAllItems(){return this.openDB().then(o=>new Promise((t,e)=>{let a=o.transaction([this.storeName],"readonly").objectStore(this.storeName).getAll();a.onsuccess=()=>{t(a.result)},a.onerror=()=>{e(a.error)}}))}deleteItem(o){return this.openDB().then(t=>new Promise((e,s)=>{let l=t.transaction([this.storeName],"readwrite").objectStore(this.storeName).delete(o);l.onsuccess=()=>{e()},l.onerror=()=>{s(l.error)}}))}};var R="choleraData",_="observaDB",P=class{constructor(){this.dbEngine=new D(_,R)}async checkCholeraDataExists(){try{return await this.dbEngine.getCount()>0}catch(o){return console.error("Erreur lors de la v\xE9rification des donn\xE9es chol\xE9ra:",o),!1}}async fetchCholeraDataFromMongo(){try{let o=await fetch("/api/cholera");if(!o.ok)throw new Error(`Erreur HTTP: ${o.status}`);return await o.json()}catch(o){throw console.error("Erreur lors de la r\xE9cup\xE9ration des donn\xE9es depuis MongoDB:",o),o}}async syncCholeraData(){try{if(console.log("D\xE9but de la synchronisation des donn\xE9es chol\xE9ra..."),await this.checkCholeraDataExists())return console.log("Les donn\xE9es chol\xE9ra sont d\xE9j\xE0 \xE0 jour dans IndexedDB."),!0;{console.log("Aucune donn\xE9e chol\xE9ra trouv\xE9e dans IndexedDB. T\xE9l\xE9chargement depuis MongoDB...");let t=await this.fetchCholeraDataFromMongo();if(t&&t.length>0){for(let e of t)await this.dbEngine.addItem(e);return console.log(`Synchronisation termin\xE9e. ${t.length} enregistrements ajout\xE9s \xE0 IndexedDB.`),!0}else return console.log("Aucune donn\xE9e chol\xE9ra disponible dans MongoDB."),!1}}catch(o){return console.error("Erreur lors de la synchronisation des donn\xE9es chol\xE9ra:",o),!1}}async getAllCholeraData(){try{return await this.dbEngine.getAllItems()}catch(o){throw console.error("Erreur lors de la r\xE9cup\xE9ration des donn\xE9es chol\xE9ra:",o),o}}},ce=new P;var v=null,d=null,i={},b=null,c={},M={},h=L.layerGroup();async function F(){try{console.log("Chargement des zones de sant\xE9..."),b=await d3.json("./lib/leaflet/zoneSante.geojson"),console.log("Zones de sant\xE9 charg\xE9es:",b.features.length,"zones"),i.zones||(i.zones=new Set,i.zoneData={}),b.features.forEach(t=>{let e=t.properties;e.ZoneDeSante&&(i.zones.add(e.ZoneDeSante),i.zoneData[e.ZoneDeSante]={dps:e.DPS,territoire:e.TERRITOIRE,zone:e.ZoneDeSante,pcode:e.Pcode,feature:t})}),console.log("Index des zones cr\xE9\xE9:",i.zones.size,"zones index\xE9es"),Y(),await G();let o=document.getElementById("search-motif");o&&o.value.trim()&&o.dispatchEvent(new Event("input"))}catch(n){console.error("Erreur lors du chargement des zones de sant\xE9:",n)}}function Y(){if(!b||!p){console.log("Donn\xE9es ou carte non disponibles pour ajouter les zones");return}console.log("Ajout des zones de sant\xE9 \xE0 la carte...");let n=L.geoJSON(b,{style:function(o){return{weight:1,opacity:.8,color:"#666",fillColor:"#f0f0f0",fillOpacity:.3}},onEachFeature:function(o,t){let e=o.properties;e.ZoneDeSante&&t.bindTooltip(`
                    <div style="font-weight: bold;">${e.ZoneDeSante}</div>
                    <div>DPS: ${e.DPS||"N/A"}</div>
                    <div>Territoire: ${e.TERRITOIRE||"N/A"}</div>
                `,{permanent:!1,direction:"center",className:"zone-tooltip"}),t.on({click:function(){A({type:"Zone de Sant\xE9",name:e.ZoneDeSante,displayName:e.ZoneDeSante,category:"Zone de Sant\xE9",dps:e.DPS,territoire:e.TERRITOIRE,feature:o})}})}});n.addTo(p),window.zonesLayer=n,console.log("Zones de sant\xE9 ajout\xE9es \xE0 la carte")}function W(n){if(!n||n.trim().length<2)return[];let o=n.toLowerCase().trim(),t=[];return i.zones&&i.zones.forEach(e=>{if(e.toLowerCase().includes(o)){let s=i.zoneData[e];t.push({name:e,displayName:e,type:"Zone de Sant\xE9",category:"Zone de Sant\xE9",dps:s==null?void 0:s.dps,territoire:s==null?void 0:s.territoire,feature:s==null?void 0:s.feature})}}),i.dps&&i.dps.forEach(e=>{e.toLowerCase().includes(o)&&t.push({name:e,displayName:e,type:"DPS",category:"DPS"})}),i.provinces&&i.provinces.forEach(e=>{e.toLowerCase().includes(o)&&t.push({name:e,displayName:e,type:"Province",category:"Province"})}),t.slice(0,10).sort((e,s)=>{let r=e.name.toLowerCase()===o,a=s.name.toLowerCase()===o;if(r&&!a)return-1;if(!r&&a)return 1;let l={"Zone de Sant\xE9":1,DPS:2,Province:3};return l[e.type]-l[s.type]})}function U(n){A(n)}function A(n){let o=document.getElementById("province-info");if(o)if(n.type==="Zone de Sant\xE9"){let t=null,e=null;if(i&&i.zoneData&&(t=i.zoneData[n.name],e=(t==null?void 0:t.choleraData)||null),!t&&n.feature){let r=n.feature.properties;t={dps:r.DPS,territoire:r.TERRITOIRE,zone:r.ZoneDeSante}}!e&&c&&c.zones&&(e=c.zones[n.name]);let s="";if(e){let r=e.totalCas>0?(e.totalDeces/e.totalCas*100).toFixed(2):0,a=e.totalPop>0?(e.totalCas/e.totalPop*1e5).toFixed(2):0;s=`
                <div class="mt-3 p-3 bg-light rounded border">
                    <h6 class="text-primary mb-3">\u{1F4CA} Statistiques Chol\xE9ra (${e.anneesCount} ann\xE9es)</h6>
                    <div class="row">
                        <div class="col-6">
                            <div class="text-center p-2 bg-danger text-white rounded mb-2">
                                <strong>${e.totalCas.toLocaleString()}</strong>
                                <div class="small">Total Cas</div>
                            </div>
                        </div>
                        <div class="col-6">
                            <div class="text-center p-2 bg-dark text-white rounded mb-2">
                                <strong>${e.totalDeces.toLocaleString()}</strong>
                                <div class="small">Total D\xE9c\xE8s</div>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-6">
                            <div class="text-center p-2 bg-warning text-dark rounded mb-2">
                                <strong>${r}%</strong>
                                <div class="small">Taux Mortalit\xE9</div>
                            </div>
                        </div>
                        <div class="col-6">
                            <div class="text-center p-2 bg-info text-white rounded mb-2">
                                <strong>${a}</strong>
                                <div class="small">Incidence/100k</div>
                            </div>
                        </div>
                    </div>
                    <div class="mt-2">
                        <small class="text-muted">
                            <strong>Population:</strong> ${e.totalPop.toLocaleString()}<br>
                            <strong>P\xE9riode:</strong> ${e.annees[0]} - ${e.annees[e.annees.length-1]}
                        </small>
                    </div>
                </div>
            `}else s=`
                <div class="mt-3 p-3 bg-light rounded border">
                    <h6 class="text-muted">\u{1F4CA} Statistiques Chol\xE9ra</h6>
                    <p class="text-muted mb-0">Aucune donn\xE9e disponible pour cette zone</p>
                </div>
            `;o.innerHTML=`
            <h5 class="border-bottom pb-2 mb-2">\u{1F3E5} ${n.name}</h5>
            <p><strong>Type:</strong> ${n.category}</p>
            <p><strong>DPS:</strong> ${(t==null?void 0:t.dps)||n.dps||"Non disponible"}</p>
            <p><strong>Province:</strong> ${(t==null?void 0:t.province)||n.province||"Non disponible"}</p>
            ${s}
        `}else if(n.type==="DPS"){let t=null;c&&c.dps&&(t=c.dps[n.name]);let e="";if(t){let s=t.totalCas>0?(t.totalDeces/t.totalCas*100).toFixed(2):0,r=t.totalPop>0?(t.totalCas/t.totalPop*1e5).toFixed(2):0;e=`
                <div class="mt-3 p-3 bg-light rounded border">
                    <h6 class="text-primary mb-3">\u{1F4CA} Statistiques DPS (${t.anneesCount} ann\xE9es)</h6>
                    <div class="row">
                        <div class="col-6">
                            <div class="text-center p-2 bg-danger text-white rounded mb-2">
                                <strong>${t.totalCas.toLocaleString()}</strong>
                                <div class="small">Total Cas</div>
                            </div>
                        </div>
                        <div class="col-6">
                            <div class="text-center p-2 bg-dark text-white rounded mb-2">
                                <strong>${t.totalDeces.toLocaleString()}</strong>
                                <div class="small">Total D\xE9c\xE8s</div>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-6">
                            <div class="text-center p-2 bg-warning text-dark rounded mb-2">
                                <strong>${s}%</strong>
                                <div class="small">Taux Mortalit\xE9</div>
                            </div>
                        </div>
                        <div class="col-6">
                            <div class="text-center p-2 bg-info text-white rounded mb-2">
                                <strong>${r}</strong>
                                <div class="small">Incidence/100k</div>
                            </div>
                        </div>
                    </div>
                    <div class="mt-2">
                        <small class="text-muted">
                            <strong>Zones de sant\xE9:</strong> ${t.zonesCount}<br>
                            <strong>Population:</strong> ${t.totalPop.toLocaleString()}<br>
                            <strong>P\xE9riode:</strong> ${t.annees[0]} - ${t.annees[t.annees.length-1]}
                        </small>
                    </div>
                </div>
            `}else e=`
                <div class="mt-3 p-3 bg-light rounded border">
                    <h6 class="text-muted">\u{1F4CA} Statistiques DPS</h6>
                    <p class="text-muted mb-0">Aucune donn\xE9e disponible pour ce DPS</p>
                </div>
            `;o.innerHTML=`
            <h5 class="border-bottom pb-2 mb-2">\u{1F3DB}\uFE0F ${n.name}</h5>
            <p><strong>Type:</strong> ${n.category}</p>
            ${e}
        `}else if(n.type==="Province"){let t=null;c&&c.provinces&&(t=c.provinces[n.name]);let e="";if(t){let s=t.totalCas>0?(t.totalDeces/t.totalCas*100).toFixed(2):0,r=t.totalPop>0?(t.totalCas/t.totalPop*1e5).toFixed(2):0;e=`
                <div class="mt-3 p-3 bg-light rounded border">
                    <h6 class="text-primary mb-3">\u{1F4CA} Statistiques Province (${t.anneesCount} ann\xE9es)</h6>
                    <div class="row">
                        <div class="col-6">
                            <div class="text-center p-2 bg-danger text-white rounded mb-2">
                                <strong>${t.totalCas.toLocaleString()}</strong>
                                <div class="small">Total Cas</div>
                            </div>
                        </div>
                        <div class="col-6">
                            <div class="text-center p-2 bg-dark text-white rounded mb-2">
                                <strong>${t.totalDeces.toLocaleString()}</strong>
                                <div class="small">Total D\xE9c\xE8s</div>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-6">
                            <div class="text-center p-2 bg-warning text-dark rounded mb-2">
                                <strong>${s}%</strong>
                                <div class="small">Taux Mortalit\xE9</div>
                            </div>
                        </div>
                        <div class="col-6">
                            <div class="text-center p-2 bg-info text-white rounded mb-2">
                                <strong>${r}</strong>
                                <div class="small">Incidence/100k</div>
                            </div>
                        </div>
                    </div>
                    <div class="mt-2">
                        <small class="text-muted">
                            <strong>DPS:</strong> ${t.dpsCount}<br>
                            <strong>Zones de sant\xE9:</strong> ${t.zonesCount}<br>
                            <strong>Population:</strong> ${t.totalPop.toLocaleString()}<br>
                            <strong>P\xE9riode:</strong> ${t.annees[0]} - ${t.annees[t.annees.length-1]}
                        </small>
                    </div>
                </div>
            `}else e=`
                <div class="mt-3 p-3 bg-light rounded border">
                    <h6 class="text-muted">\u{1F4CA} Statistiques Province</h6>
                    <p class="text-muted mb-0">Aucune donn\xE9e disponible pour cette province</p>
                </div>
            `;o.innerHTML=`
            <h5 class="border-bottom pb-2 mb-2">\u{1F5FA}\uFE0F ${n.name}</h5>
            <p><strong>Type:</strong> ${n.category}</p>
            ${e}
        `}else o.innerHTML=`
            <h5 class="border-bottom pb-2 mb-2">${n.name}</h5>
            <p><strong>Type:</strong> ${n.category}</p>
        `}async function j(){try{console.log("Chargement des donn\xE9es du chol\xE9ra..."),d=await(await fetch("./docs/cholera-db.json")).json(),console.log("Donn\xE9es du chol\xE9ra charg\xE9es:",d.length,"enregistrements"),J(),typeof T=="function"&&T()}catch(n){console.error("Erreur lors du chargement des donn\xE9es du chol\xE9ra:",n)}}function J(){if(!d)return;console.log("Calcul des statistiques du chol\xE9ra...");let n={},o={},t={};d.forEach(e=>{let s=e.ZoneDeSante,r=e.DPS,a=e.Province,l=parseInt(e.Cas)||0,u=parseInt(e.Deces)||0,g=parseFloat(e.Pop)||0,f=parseInt(e.Annees)||0;n[s]||(n[s]={totalCas:0,totalDeces:0,totalPop:0,annees:new Set,dps:r,province:a,records:[]}),n[s].totalCas+=l,n[s].totalDeces+=u,n[s].totalPop=Math.max(n[s].totalPop,g),n[s].annees.add(f),n[s].records.push(e),o[r]||(o[r]={totalCas:0,totalDeces:0,totalPop:0,zones:new Set,province:a,annees:new Set}),o[r].totalCas+=l,o[r].totalDeces+=u,o[r].totalPop=Math.max(o[r].totalPop,g),o[r].zones.add(s),o[r].annees.add(f),t[a]||(t[a]={totalCas:0,totalDeces:0,totalPop:0,dps:new Set,zones:new Set,annees:new Set}),t[a].totalCas+=l,t[a].totalDeces+=u,t[a].totalPop=Math.max(t[a].totalPop,g),t[a].dps.add(r),t[a].zones.add(s),t[a].annees.add(f)}),Object.keys(n).forEach(e=>{n[e].annees=Array.from(n[e].annees).sort(),n[e].anneesCount=n[e].annees.length}),Object.keys(o).forEach(e=>{o[e].zones=Array.from(o[e].zones),o[e].annees=Array.from(o[e].annees).sort(),o[e].zonesCount=o[e].zones.length,o[e].anneesCount=o[e].annees.length}),Object.keys(t).forEach(e=>{t[e].dps=Array.from(t[e].dps),t[e].zones=Array.from(t[e].zones),t[e].annees=Array.from(t[e].annees).sort(),t[e].dpsCount=t[e].dps.length,t[e].zonesCount=t[e].zones.length,t[e].anneesCount=t[e].annees.length}),c={zones:n,dps:o,provinces:t},O(),console.log("Statistiques calcul\xE9es:",{zones:Object.keys(n).length,dps:Object.keys(o).length,provinces:Object.keys(t).length})}function O(){c&&(i.zoneData&&Object.keys(c.zones).forEach(n=>{i.zoneData[n]&&(i.zoneData[n].choleraData=c.zones[n])}),i.dps||(i.dps=new Set,i.dpsData={}),i.provinces||(i.provinces=new Set,i.provinceData={}),Object.keys(c.dps).forEach(n=>{i.dps.add(n),i.dpsData[n]={name:n,type:"DPS",category:"DPS",choleraData:c.dps[n]}}),Object.keys(c.provinces).forEach(n=>{i.provinces.add(n),i.provinceData[n]={name:n,type:"Province",category:"Province",choleraData:c.provinces[n]}}),E(),S(),console.log("Index de recherche mis \xE0 jour avec les donn\xE9es du chol\xE9ra:",{zones:i.zones?i.zones.size:0,dps:i.dps.size,provinces:i.provinces.size}))}function E(){if(!c||!c.zones)return;let n=Object.values(c.zones).map(s=>s.totalCas),o=Object.values(c.zones).map(s=>s.totalDeces),t=Math.max(...n),e=Math.max(...o);M.cas=d3.scaleSequential().domain([0,t]).interpolator(d3.interpolateYlOrRd),M.deces=d3.scaleSequential().domain([0,e]).interpolator(d3.interpolateReds),console.log("\xC9chelles de couleurs cr\xE9\xE9es:",{maxCas:t,maxDeces:e})}function K(n){n?v||(v=L.geoJSON(null,{style:function(o){return{fillColor:"#ddd",weight:.25,opacity:1,color:"#ff0000",fillOpacity:.3}},onEachFeature:function(o,t){o.properties&&o.properties.name&&t.bindPopup("Zone de sant\xE9: "+o.properties.name)}}).addTo(p),fetch("./lib/leaflet/cours_eau.geojson").then(o=>o.json()).then(o=>{v.addData(o),p.fitBounds(v.getBounds())}).catch(o=>{console.error("Erreur lors du chargement des zones de sant\xE9:",o)})):v&&(p.removeLayer(v),v=null,toggle-cours-eau)}$(document).on("change","#toggle-cours-eaukk",function(){K($(this).is(":checked"))});function S(){window.zonesLayer&&(p.hasLayer(h)&&p.removeLayer(h),h=L.layerGroup(),window.zonesLayer.eachLayer(n=>{if(n.feature&&n.feature.properties){let t=n.feature.properties.ZoneDeSante;if(t&&c.zones[t]){let e=c.zones[t];if(e.totalCas>0){let s=n.getBounds().getCenter(),r=Math.max(5,Math.min(20,e.totalCas/50)),a=L.circleMarker(s,{radius:r,fillColor:"#FFA500",color:"#FFA500",weight:2,opacity:.7,fillOpacity:.5});a.bindTooltip(`<div style="font-weight: bold; color: #FFA500;">${t}</div><div><strong>Cas:</strong> ${e.totalCas.toLocaleString()}</div><div><strong>D\xE9c\xE8s:</strong> ${e.totalDeces.toLocaleString()}</div>`),h.addLayer(a)}if(e.totalDeces>0){let s=n.getBounds().getCenter(),r=Math.max(3,Math.min(15,e.totalDeces/10)),a=L.circleMarker(s,{radius:r,fillColor:"#B22222",color:"#B22222",weight:2,opacity:.8,fillOpacity:.8});a.bindTooltip(`<div style="font-weight: bold; color: #B22222;">${t}</div><div><strong>D\xE9c\xE8s:</strong> ${e.totalDeces.toLocaleString()}</div><div><strong>Cas:</strong> ${e.totalCas.toLocaleString()}</div>`),h.addLayer(a)}}}}),h.addTo(p),console.log("Projection spatiale chol\xE9ra appliqu\xE9e"))}function x(){let n=document.getElementById("cholera-legend");if(n){n.remove();return}let o=document.createElement("div");o.id="cholera-legend",o.style.cssText=`
        position: absolute;
        bottom: 20px;
        left: 20px;
        background: white;
        padding: 10px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        z-index: 1000;
        max-width: 220px;
        font-family: Arial, sans-serif;
        font-size: 12px;
    `,o.innerHTML=`
        <h6 style="margin: 0 0 8px 0; color: #333; font-size: 13px;">\u{1F4CA} L\xE9gende Chol\xE9ra</h6>
        <div style="margin-bottom: 10px;">
            <div style="font-weight: bold; margin-bottom: 3px; color: #FFA500; font-size: 12px;">Cercles des cas (orange)</div>
            <div style="display: flex; align-items: center; margin-bottom: 3px;">
                <svg width="16" height="16"><circle cx="8" cy="8" r="4" fill="#FFF2CC" fill-opacity="0.5" stroke="#FFA500" stroke-width="1.5"/></svg>
                <span style="font-size: 11px; margin-left: 7px;">0-100 cas</span>
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 3px;">
                <svg width="19" height="19"><circle cx="9.5" cy="9.5" r="6" fill="#FFD580" fill-opacity="0.5" stroke="#FFA500" stroke-width="1.5"/></svg>
                <span style="font-size: 11px; margin-left: 7px;">101-500 cas</span>
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 3px;">
                <svg width="22" height="22"><circle cx="11" cy="11" r="9" fill="#FFA500" fill-opacity="0.5" stroke="#FFA500" stroke-width="1.5"/></svg>
                <span style="font-size: 11px; margin-left: 7px;">501-1000 cas</span>
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 3px;">
                <svg width="25" height="25"><circle cx="12.5" cy="12.5" r="12" fill="#FF8C00" fill-opacity="0.5" stroke="#FFA500" stroke-width="1.5"/></svg>
                <span style="font-size: 11px; margin-left: 7px;">1000+ cas</span>
            </div>
        </div>
        <div style="margin-bottom: 10px;">
            <div style="font-weight: bold; margin-bottom: 3px; color: #B22222; font-size: 12px;">Cercles des d\xE9c\xE8s (rouge)</div>
            <div style="display: flex; align-items: center; margin-bottom: 3px;">
                <svg width="12" height="12"><circle cx="6" cy="6" r="3" fill="#B22222" fill-opacity="0.8" stroke="#B22222" stroke-width="1.5"/></svg>
                <span style="font-size: 11px; margin-left: 7px;">0-5 d\xE9c\xE8s</span>
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 3px;">
                <svg width="18" height="18"><circle cx="9" cy="9" r="6" fill="#B22222" fill-opacity="0.8" stroke="#B22222" stroke-width="1.5"/></svg>
                <span style="font-size: 11px; margin-left: 7px;">6-20 d\xE9c\xE8s</span>
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 3px;">
                <svg width="24" height="24"><circle cx="12" cy="12" r="10" fill="#B22222" fill-opacity="0.8" stroke="#B22222" stroke-width="1.5"/></svg>
                <span style="font-size: 11px; margin-left: 7px;">21-50 d\xE9c\xE8s</span>
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 3px;">
                <svg width="30" height="30"><circle cx="15" cy="15" r="14" fill="#B22222" fill-opacity="0.8" stroke="#B22222" stroke-width="1.5"/></svg>
                <span style="font-size: 11px; margin-left: 7px;">50+ d\xE9c\xE8s</span>
            </div>
        </div>
    `;let t=document.getElementById("geo-mapping");t&&t.appendChild(o)}function X(){p.hasLayer(h)?(p.removeLayer(h),console.log("Coloration du chol\xE9ra d\xE9sactiv\xE9e")):(h.addTo(p),console.log("Coloration du chol\xE9ra activ\xE9e"))}function Z(n,o,t=null){if(!d)return;console.log(`Filtrage des donn\xE9es de ${n} \xE0 ${o}`+(t?`, semaine ${t}`:"..."));let e=d.filter(s=>{let r=parseInt(s.Annees)||0,a=parseInt(s.Semaines)||0;return r>=n&&r<=o&&(t?a===t:!0)});I(e),E(),S(),x(),console.log(`Donn\xE9es filtr\xE9es: ${e.length} enregistrements sur ${d.length} total`)}function I(n){if(!n)return;let o={},t={},e={};n.forEach(s=>{let r=s.ZoneDeSante,a=s.DPS,l=s.Province,u=parseInt(s.Cas)||0,g=parseInt(s.Deces)||0,f=parseFloat(s.Pop)||0,w=parseInt(s.Annees)||0;o[r]||(o[r]={totalCas:0,totalDeces:0,totalPop:0,annees:new Set,dps:a,province:l,records:[]}),o[r].totalCas+=u,o[r].totalDeces+=g,o[r].totalPop=Math.max(o[r].totalPop,f),o[r].annees.add(w),o[r].records.push(s),t[a]||(t[a]={totalCas:0,totalDeces:0,totalPop:0,zones:new Set,province:l,annees:new Set}),t[a].totalCas+=u,t[a].totalDeces+=g,t[a].totalPop=Math.max(t[a].totalPop,f),t[a].zones.add(r),t[a].annees.add(w),e[l]||(e[l]={totalCas:0,totalDeces:0,totalPop:0,dps:new Set,zones:new Set,annees:new Set}),e[l].totalCas+=u,e[l].totalDeces+=g,e[l].totalPop=Math.max(e[l].totalPop,f),e[l].dps.add(a),e[l].zones.add(r),e[l].annees.add(w)}),Object.keys(o).forEach(s=>{o[s].annees=Array.from(o[s].annees).sort(),o[s].anneesCount=o[s].annees.length}),Object.keys(t).forEach(s=>{t[s].zones=Array.from(t[s].zones),t[s].annees=Array.from(t[s].annees).sort(),t[s].zonesCount=t[s].zones.length,t[s].anneesCount=t[s].annees.length}),Object.keys(e).forEach(s=>{e[s].dps=Array.from(e[s].dps),e[s].zones=Array.from(e[s].zones),e[s].annees=Array.from(e[s].annees).sort(),e[s].dpsCount=e[s].dps.length,e[s].zonesCount=e[s].zones.length,e[s].anneesCount=e[s].annees.length}),c={zones:o,dps:t,provinces:e},O(),console.log("Statistiques recalcul\xE9es avec les donn\xE9es filtr\xE9es")}function H(){d&&(I(d),console.log("Donn\xE9es r\xE9initialis\xE9es (toutes les ann\xE9es)"))}function Q(){let n=parseInt(document.getElementById("filter-start-year").value)||2e3,o=parseInt(document.getElementById("filter-end-year").value)||2025;if(n>o){alert("L'ann\xE9e de d\xE9but doit \xEAtre inf\xE9rieure ou \xE9gale \xE0 l'ann\xE9e de fin");return}Z(n,o),C()}var p=L.map("geo-mapping",{zoomControl:!1,center:[-2.8742272710558296,23.635858338586445],zoom:5.5876});window.map=p;window.displayGlobalCholeraSummary=C;window.selectSearchResult=ne;function V(){let n=document.getElementById("province-info");n&&(n.innerHTML=`
            <div class="text-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Chargement...</span>
                </div>
                <p class="mt-2">Chargement des statistiques...</p>
            </div>
        `)}window.clearProvinceInfo=V;window.displayColorLegend=x;window.toggleCholeraColoring=X;window.applyCholeraColoring=S;window.calculateCholeraStatisticsFromData=I;window.filterCholeraDataByYear=Z;window.resetCholeraData=H;window.applyYearFilter=Q;window.syncCholeraMapWithFilter=function(n){window.calculateCholeraStatisticsFromData&&window.createColorScales&&window.applyCholeraColoring&&window.displayColorLegend?(window.calculateCholeraStatisticsFromData(n),window.createColorScales(),window.applyCholeraColoring(),window.displayColorLegend(),console.log("Carte synchronis\xE9e avec les filtres")):console.warn("Impossible de synchroniser la carte : fonctions manquantes")};var ee={OpenStreetMap:L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:'&copy; <a href="#!">INOHA</a>/ UNIKIN Kinshasa-DR.Congo'}),Satellite:L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",{maxZoom:19,attribution:"Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"})};ee.OpenStreetMap.addTo(p);var be=L.layerGroup().addTo(p),te=new L.FeatureGroup;p.addLayer(te);p.on("locationerror",function(n){console.error("Erreur de g\xE9olocalisation:",n.message)});F();j();function q(){let n=document.getElementById("search-motif"),o=document.getElementById("search-results");if(!n||!o){console.log("\xC9l\xE9ments de recherche non trouv\xE9s");return}let t;n.addEventListener("input",function(){let e=this.value.trim();if(t&&clearTimeout(t),e.length<2){o.innerHTML="",o.style.display="none";return}t=setTimeout(()=>{let s=W(e);oe(s,o)},300)}),document.addEventListener("click",function(e){!n.contains(e.target)&&!o.contains(e.target)&&(o.style.display="none")})}function oe(n,o){if(n.length===0){o.innerHTML='<div class="p-2 text-muted">Aucun r\xE9sultat trouv\xE9</div>',o.style.display="block";return}let t=n.map(e=>{let s=e.type==="Zone de Sant\xE9"?"\u{1F3E5}":e.type==="DPS"?"\u{1F3DB}\uFE0F":"\u{1F5FA}\uFE0F";return`
            <div class="search-result-item p-2 border-bottom" 
                 onclick="selectSearchResult(${JSON.stringify(e).replace(/"/g,"&quot;")})">
                <div class="d-flex align-items-center">
                    <span class="me-2">${s}</span>
                    <div>
                        <div class="fw-bold">${e.displayName}</div>
                        <small class="text-muted">${e.type}</small>
                    </div>
                </div>
            </div>
        `}).join("");o.innerHTML=t,o.style.display="block"}function ne(n){let o=document.getElementById("search-results");o&&(o.style.display="none");let t=document.getElementById("search-motif");t&&(t.value=n.displayName),U(n)}function C(){if(!c){console.log("Statistiques du chol\xE9ra non disponibles");return}let n=c.provinces||{},o=c.dps||{},t=c.zones||{},e=0,s=0,r=0,a=Object.keys(t).length,l=Object.keys(o).length,u=Object.keys(n).length;Object.values(n).forEach(m=>{e+=m.totalCas,s+=m.totalDeces,r=Math.max(r,m.totalPop)});let g=e>0?(s/e*100).toFixed(2):0,f=r>0?(e/r*1e5).toFixed(2):0,w=Object.entries(n).sort((m,z)=>z[1].totalCas-m[1].totalCas).slice(0,5),k=document.getElementById("province-info");k&&(k.innerHTML=`
            <h5 class="border-bottom pb-2 mb-3">\u{1F4CA} R\xE9sum\xE9 Global Chol\xE9ra</h5>
            
            <div class="row mb-3">
                <div class="col-6">
                    <div class="text-center p-3 bg-danger text-white rounded">
                        <h4 class="mb-0">${e.toLocaleString()}</h4>
                        <small>Total Cas</small>
                    </div>
                </div>
                <div class="col-6">
                    <div class="text-center p-3 bg-dark text-white rounded">
                        <h4 class="mb-0">${s.toLocaleString()}</h4>
                        <small>Total D\xE9c\xE8s</small>
                    </div>
                </div>
            </div>
            
            <div class="row mb-3">
                <div class="col-6">
                    <div class="text-center p-3 bg-warning text-dark rounded">
                        <h4 class="mb-0">${g}%</h4>
                        <small>Taux Mortalit\xE9</small>
                    </div>
                </div>
                <div class="col-6">
                    <div class="text-center p-3 bg-info text-white rounded">
                        <h4 class="mb-0">${f}</h4>
                        <small>Incidence/100k</small>
                    </div>
                </div>
            </div>
            
            <div class="row mb-3">
                <div class="col-4">
                    <div class="text-center p-2 bg-primary text-white rounded">
                        <h5 class="mb-0">${u}</h5>
                        <small>Provinces</small>
                    </div>
                </div>
                <div class="col-4">
                    <div class="text-center p-2 bg-success text-white rounded">
                        <h5 class="mb-0">${l}</h5>
                        <small>DPS</small>
                    </div>
                </div>
                <div class="col-4">
                    <div class="text-center p-2 bg-secondary text-white rounded">
                        <h5 class="mb-0">${a}</h5>
                        <small>Zones de Sant\xE9</small>
                    </div>
                </div>
            </div>
            
            <div class="mt-3">
                <h6 class="text-primary">\u{1F3C6} Top 5 Provinces les plus touch\xE9es:</h6>
                <div class="list-group list-group-flush">
                    ${w.map((m,z)=>{let N=m[1].totalCas>0?(m[1].totalDeces/m[1].totalCas*100).toFixed(1):0;return`
                            <div class="list-group-item d-flex justify-content-between align-items-center">
                                <div>
                                    <span class="badge bg-primary me-2">${z+1}</span>
                                    ${m[0]}
                                </div>
                                <div class="text-end">
                                    <div class="fw-bold">${m[1].totalCas.toLocaleString()} cas</div>
                                    <small class="text-muted">${N}% mortalit\xE9</small>
                                </div>
                            </div>
                        `}).join("")}
                </div>
            </div>
            
            <div class="mt-3">
                <button class="btn btn-outline-primary btn-sm" onclick="displayGlobalCholeraSummary()">
                    \u{1F504} Actualiser
                </button>
            </div>
        `)}document.addEventListener("DOMContentLoaded",function(){let n=document.getElementById("geo-mapping");if(n&&!document.getElementById("advanced-filters")){let o=document.createElement("div");o.id="advanced-filters",o.style.cssText=`
            position: absolute;
            top: 70px;
            left: 15px;
            padding: 12px 16px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.08);
            z-index: 1100;
            font-size: 13px;
            max-width: 350px;
        `,o.classList.add("bg-body","border"),o.innerHTML=`
            <div style="font-weight:bold; margin-bottom:8px;">Filtres avanc\xE9s</div>
            <div class="row g-1">
                <div class="col-6 mb-1"><input id="filter-annee" class="form-control form-control-sm" type="number" placeholder="Ann\xE9e"></div>
                <div class="col-6 mb-1"><input id="filter-semaine" class="form-control form-control-sm" type="number" placeholder="Semaine"></div>
                <div class="col-6 mb-1"><input id="filter-dps" class="form-control form-control-sm" type="text" placeholder="DPS"></div>
                <div class="col-6 mb-1"><input id="filter-province" class="form-control form-control-sm" type="text" placeholder="Province"></div>
                <div class="col-6 mb-1"><input id="filter-zone" class="form-control form-control-sm" type="text" placeholder="Zone de Sant\xE9"></div>
                <div class="col-6 mb-1"><input id="filter-cas-min" class="form-control form-control-sm" type="number" placeholder="Cas min">
                </div>
                <div class="col-6 mb-1"><input id="filter-cas-max" class="form-control form-control-sm" type="number" placeholder="Cas max">
                </div>
                <div class="col-6 mb-1"><input id="filter-deces-min" class="form-control form-control-sm" type="number" placeholder="D\xE9c\xE8s min">
                </div>
                <div class="col-6 mb-1"><input id="filter-deces-max" class="form-control form-control-sm" type="number" placeholder="D\xE9c\xE8s max">
                </div>
            </div>
            <div class="mt-2 d-flex gap-2">
                <button id="btn-filtrer" class="btn btn-primary btn-sm w-100">Filtrer</button>
                <button id="btn-reset-filtre" class="btn btn-outline-secondary btn-sm w-100">R\xE9initialiser</button>
            </div>
        `,n.appendChild(o)}});document.addEventListener("DOMContentLoaded",function(){let n=document.getElementById("advanced-filters");if(n&&!document.getElementById("toggle-cours-eau")){let o=document.createElement("div");o.className="form-check mt-2 mb-2",o.innerHTML=`
            <input class="form-check-input" type="checkbox" id="toggle-cours-eau">
            <label class="form-check-label" for="toggle-cours-eau">Afficher les cours d'eau</label>
        `;let t=n.querySelector(".mt-2.d-flex")||n.lastChild;n.insertBefore(o,t)}});var y=null,B=!1;async function G(){if(!B)try{let o=await(await fetch("./lib/leaflet/cours_eau.geojson")).json();y=L.geoJSON(o,{style:{color:"#1E90FF",weight:2,opacity:.8},onEachFeature:function(t,e){t.properties&&t.properties.nom&&e.bindTooltip(t.properties.nom,{direction:"top"})}}),B=!0}catch(n){console.error("Erreur lors du chargement des cours d'eau:",n)}}function se(n){return d?d.filter(o=>!(n.annee&&parseInt(o.Annees)!==parseInt(n.annee)||n.semaine&&parseInt(o.Semaines)!==parseInt(n.semaine)||n.dps&&o.DPS&&!o.DPS.toLowerCase().includes(n.dps.toLowerCase())||n.province&&o.Province&&!o.Province.toLowerCase().includes(n.province.toLowerCase())||n.zone&&o.ZoneDeSante&&!o.ZoneDeSante.toLowerCase().includes(n.zone.toLowerCase())||n.casMin&&parseInt(o.Cas)<parseInt(n.casMin)||n.casMax&&parseInt(o.Cas)>parseInt(n.casMax)||n.decesMin&&parseInt(o.Deces)<parseInt(n.decesMin)||n.decesMax&&parseInt(o.Deces)>parseInt(n.decesMax))):[]}document.addEventListener("DOMContentLoaded",function(){q(),setTimeout(()=>{let n=document.getElementById("btn-filtrer");n&&n.addEventListener("click",function(){let t={annee:document.getElementById("filter-annee").value,semaine:document.getElementById("filter-semaine").value,dps:document.getElementById("filter-dps").value,province:document.getElementById("filter-province").value,zone:document.getElementById("filter-zone").value,casMin:document.getElementById("filter-cas-min").value,casMax:document.getElementById("filter-cas-max").value,decesMin:document.getElementById("filter-deces-min").value,decesMax:document.getElementById("filter-deces-max").value},e=se(t);I(e),E(),S(),x(),C()});let o=document.getElementById("btn-reset-filtre");o&&o.addEventListener("click",function(){document.getElementById("filter-annee").value="",document.getElementById("filter-semaine").value="",document.getElementById("filter-dps").value="",document.getElementById("filter-province").value="",document.getElementById("filter-zone").value="",document.getElementById("filter-cas-min").value="",document.getElementById("filter-cas-max").value="",document.getElementById("filter-deces-min").value="",document.getElementById("filter-deces-max").value="",H(),E(),S(),x(),C()})},2200)});function T(){if(!d)return;let n=document.getElementById("filter-annee");n&&(n.innerHTML="",Array.from(new Set(d.map(a=>a.Annees).filter(Boolean))).sort((a,l)=>l-a).forEach(a=>{let l=document.createElement("option");l.value=a,l.textContent=a,n.appendChild(l)}));let o=document.getElementById("filter-semaine");o&&(o.innerHTML="",Array.from(new Set(d.map(a=>a.Semaines).filter(Boolean))).sort((a,l)=>a-l).forEach(a=>{let l=document.createElement("option");l.value=a,l.textContent=a,o.appendChild(l)}));let t=document.getElementById("filter-dps");t&&(t.innerHTML="",Array.from(new Set(d.map(a=>a.DPS).filter(Boolean))).sort().forEach(a=>{let l=document.createElement("option");l.value=a,l.textContent=a,t.appendChild(l)}));let e=document.getElementById("filter-province");e&&(e.innerHTML="",Array.from(new Set(d.map(a=>a.Province).filter(Boolean))).sort().forEach(a=>{let l=document.createElement("option");l.value=a,l.textContent=a,e.appendChild(l)}));let s=document.getElementById("filter-zone");s&&(s.innerHTML="",Array.from(new Set(d.map(a=>a.ZoneDeSante).filter(Boolean))).sort().forEach(a=>{let l=document.createElement("option");l.value=a,l.textContent=a,s.appendChild(l)}))}document.addEventListener("DOMContentLoaded",function(){if(!document.getElementById("advanced-filters"))return;let o=document.getElementById("toggle-cours-eau");o&&o.addEventListener("change",async function(){B||await G(),this.checked?y&&(y.addTo(p),y.bringToFront()):y&&p.hasLayer(y)&&p.removeLayer(y)})});document.addEventListener("DOMContentLoaded",function(){console.log("DOM charg\xE9, v\xE9rification des donn\xE9es..."),b?console.log("Zones de sant\xE9 d\xE9j\xE0 charg\xE9es:",b.features.length,"zones"):(console.log("Zones de sant\xE9 non charg\xE9es, rechargement..."),F()),d?console.log("Donn\xE9es du chol\xE9ra d\xE9j\xE0 charg\xE9es:",d.length,"enregistrements"):(console.log("Donn\xE9es du chol\xE9ra non charg\xE9es, rechargement..."),j()),q(),setTimeout(()=>{if(c)C(),x();else{let n=setInterval(()=>{c&&(C(),x(),clearInterval(n))},1e3)}},2e3)});
//# sourceMappingURL=main.js.map
