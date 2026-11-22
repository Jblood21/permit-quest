'use strict';
/* Avatar, car, garage store, onboarding, pretest and the drive between stops. Loaded after app.js and games.js. */
/* Character art: layered SVG parts (hair back, neck, outfit, face, hair front, extras, glasses, hat). Lavender world, slim teen proportions. */
const SKIN={s1:'#fbdcc4',s2:'#f2c29b',s3:'#dca576',s4:'#b97a4b',s5:'#8d5524',s6:'#5c3a21'};
const HAIRC={black:'#231f20',brown:'#6b4023',blonde:'#e3b865',auburn:'#8f3f27',red:'#c8501a',grey:'#a9a9b6',pink:'#ff7ab6',blue:'#4a8df0',green:'#2fbf6a',purple:'#8b5cf6'};
const EYEC={brown:'#6b3f1d',blue:'#3b82f6',green:'#3f9b5e',hazel:'#a1742f',grey:'#7b8794',violet:'#8b5cf6'};
const TOPC={cream:'#f3e9d8',white:'#f7f7fa',grey:'#b9bcc6',black:'#2f3039',lavender:'#b79cf2',pink:'#ff8fb8',green:'#0b7a3b',blue:'#5b8def',red:'#e5383b',yellow:'#ffc61a'};
const CARC={red:'#e5383b',blue:'#2f80ed',white:'#f3f4f6',black:'#2b2f3a',yellow:'#ffc61a',green:'#19a974',silver:'#aab2bf',orange:'#ff8a4c',pink:'#ff6fae',gold:'#d9a520'};
const MODELS={hatch:{by:48,bh:38,ct:12,ci:26,wh:28},sedan:{by:54,bh:32,ct:20,ci:24,wh:26},suv:{by:42,bh:46,ct:6,ci:20,wh:32},truck:{by:40,bh:50,ct:8,ci:22,wh:34},sport:{by:60,bh:26,ct:30,ci:32,wh:22}};
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
const sw=(map,p0,paid)=>Object.keys(map).map(k=>({id:k,n:cap(k),c:map[k],p:paid.includes(k)?p0:0}));
/* categories: key is the field on the avatar. kind picks the preview crop. Every character item is free; only cars cost coins. */
const CHARKEYS=['hairStyle','hairColor','skin','eyes','glasses','hat','extras','outfit','top'];
const isChar=k=>CHARKEYS.includes(k);
const free=a=>a.map(i=>Object.assign({p:0},i));
const CATS=[
 {key:'hairStyle',label:'Hair',kind:'head',items:free([{id:'waves',n:'Natural Waves'},{id:'ponytail',n:'High Ponytail'},{id:'bun',n:'Messy Bun'},{id:'braids',n:'Double Braids'},{id:'halfbow',n:'Half-Up Bow'},{id:'straight',n:'Sleek Straight'},{id:'curls',n:'Beachy Curls'},{id:'crown',n:'Braided Crown'},{id:'clip',n:'Claw Clip Updo'},{id:'bubble',n:'Bubble Ponytail'}])},
 {key:'hairColor',label:'Hair color',kind:'swatch',items:sw(HAIRC,0,[])},
 {key:'skin',label:'Skin',kind:'swatch',items:Object.keys(SKIN).map((k,i)=>({id:k,n:'Tone '+(i+1),c:SKIN[k],p:0}))},
 {key:'eyes',label:'Eyes',kind:'swatch',items:sw(EYEC,0,[])},
 {key:'glasses',label:'Glasses',kind:'head',items:free([{id:'none',n:'None'},{id:'round',n:'Round'},{id:'square',n:'Square'},{id:'shades',n:'Shades'},{id:'heart',n:'Hearts'}])},
 {key:'hat',label:'Hats',kind:'head',items:free([{id:'none',n:'None'},{id:'cap',n:'Cap'},{id:'fjhcap',n:'FJH cap'},{id:'beanie',n:'Beanie'},{id:'bow',n:'Big bow'},{id:'headband',n:'Headband'},{id:'husky',n:'Husky ears'},{id:'crown',n:'Crown'}])},
 {key:'extras',label:'Extras',kind:'head',multi:true,items:free([{id:'freckles',n:'Freckles'},{id:'hoops',n:'Hoop earrings'}])},
 {key:'outfit',label:'Outfits',kind:'body',items:free([{id:'casual',n:'Casual Everyday'},{id:'cheer',n:'Cheer Uniform'},{id:'athleisure',n:'Athleisure Workout'},{id:'school',n:'School Day'},{id:'gameday',n:'Game Day Spirit'},{id:'cozy',n:'Cozy Lounge'},{id:'street',n:'Trendy Street Style'},{id:'dressy',n:'Dressy Casual'},{id:'outdoors',n:'Outdoors Adventure'},{id:'holiday',n:'Holiday Seasonal'}])},
 {key:'top',label:'Top color',kind:'swatch',items:sw(TOPC,0,[])},
 {key:'car',label:'Car',kind:'car',items:[{id:'hatch',n:'Hatchback',p:0},{id:'sedan',n:'Sedan',p:100},{id:'suv',n:'SUV',p:160},{id:'truck',n:'Truck',p:200},{id:'sport',n:'Sports car',p:300}]},
 {key:'carColor',label:'Car color',kind:'swatch',items:sw(CARC,40,['pink','gold'])},
 {key:'up',label:'Upgrades',kind:'car',multi:true,items:[{id:'stripes',n:'Racing stripes',p:50},{id:'rims',n:'Gold rims',p:70},{id:'spoiler',n:'Spoiler',p:60},{id:'glow',n:'Underglow',p:90}]}
];
const DEFAV={name:'',skin:'s2',hairStyle:'waves',hairColor:'brown',eyes:'brown',glasses:'none',hat:'none',extras:['freckles','hoops'],outfit:'casual',top:'cream',car:'hatch',carColor:'red',up:[]};
const catOf=k=>CATS.find(c=>c.key===k);
const itemOf=(k,id)=>{const c=catOf(k);return c&&c.items.find(i=>i.id===id)};
const owns=(k,id)=>{if(isChar(k))return true;const it=itemOf(k,id);return !it||it.p===0||!!(S.own&&S.own[k+':'+id])};
/* old saves may hold retired ids: map each to its nearest new one */
const OLDHAIR={short:'bun',long:'waves',bob:'straight',buzz:'clip',curly:'curls'},OLDFIT={tee:'casual',hoodie:'cozy',polo:'dressy',dress:'dressy',varsity:'gameday',fjh:'cheer',racing:'athleisure'},OLDTOP={orange:'yellow',purple:'lavender'};
function fixAv(a){
 const o=Object.assign({},DEFAV,a||{}),has=(k,id)=>{const c=catOf(k);return c&&c.items.some(i=>i.id===id)};
 o.hairStyle=OLDHAIR[o.hairStyle]||o.hairStyle;if(!has('hairStyle',o.hairStyle))o.hairStyle=DEFAV.hairStyle;
 o.outfit=OLDFIT[o.outfit]||o.outfit;if(!has('outfit',o.outfit))o.outfit=DEFAV.outfit;
 o.top=OLDTOP[o.top]||o.top;if(!TOPC[o.top])o.top=DEFAV.top;
 if(!HAIRC[o.hairColor])o.hairColor=DEFAV.hairColor;if(!SKIN[o.skin])o.skin=DEFAV.skin;if(!EYEC[o.eyes])o.eyes=DEFAV.eyes;
 if(!has('glasses',o.glasses))o.glasses='none';if(!has('hat',o.hat))o.hat='none';
 if(!Array.isArray(o.extras))o.extras=[];o.extras=o.extras.filter(x=>has('extras',x));
 return o}
const AV_=()=>fixAv(S.avatar);

/* ---------- colour helpers ---------- */
const hx=c=>[1,3,5].map(i=>parseInt(c.substr(i,2),16));
const mix=(a,b,t)=>{const A=hx(a),B=hx(b);return '#'+A.map((v,i)=>('0'+Math.round(v+(B[i]-v)*t).toString(16)).slice(-2)).join('')};
const lite=(c,t)=>mix(c,'#ffffff',t),dk=(c,t)=>mix(c,'#000000',t);
const ht=c=>({b:c,d:dk(c,.28),h:mix(lite(c,.18),'#e6a85c',.3)});
const PA=(d,f,x)=>`<path d="${d}" fill="${f}"${x||''}/>`;
const LB=(pts,w,c,o)=>`<path d="M${pts.map(p=>p.join(' ')).join(' L')}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${o||''}/>`;
const SK=(d,c,w,o)=>`<path d="${d}" fill="none" stroke="${c}" stroke-width="${w||1.5}" stroke-linecap="round" stroke-linejoin="round"${o||''}/>`;
const MH=s=>`${s}<g transform="translate(100 0) scale(-1 1)">${s}</g>`;
const MR=s=>`${s}<g transform="translate(120 0) scale(-1 1)">${s}</g>`;
const hStr=(h,ds,w)=>ds.map(d=>SK(d,h,w||1.5,' opacity=".55"')).join('');
const scrunch=(x,y,col,rot)=>`<g transform="rotate(${rot||-25} ${x} ${y})"><ellipse cx="${x}" cy="${y}" rx="7.5" ry="4.8" fill="${col}"/>${SK(`M${x-4} ${y-3.4} Q${x-2} ${y} ${x-4} ${y+3.4} M${x} ${y-4.4} Q${x+2} ${y} ${x} ${y+4.4} M${x+4} ${y-3.4} Q${x+6} ${y} ${x+4} ${y+3.4}`,dk(col,.14),1)}</g>`;
const bowSVG=(x,y,a,b,s,rot)=>`<g transform="translate(${x} ${y}) rotate(${rot||0}) scale(${s||1})"><path d="M0 0 L-8 15 L-1 11 L2 17Z" fill="${b}"/><path d="M0 0 L9 14 L2 11 L-1 17Z" fill="${a}"/><path d="M0 0 Q-16 -15 -24 -4 Q-27 10 0 3Z" fill="${a}"/><path d="M0 0 Q16 -15 24 -4 Q27 10 0 3Z" fill="${a}"/><path d="M-3 0 Q-14 -8 -21 -2 M3 0 Q14 -8 21 -2" stroke="${b}" stroke-width="1.4" fill="none" stroke-linecap="round"/><path d="M-1 -1 Q-10 -5 -14 0" stroke="#fff" stroke-width="1" fill="none" opacity=".6" stroke-linecap="round"/><ellipse cx="0" cy="1.5" rx="4" ry="4.2" fill="${b}"/><ellipse cx="-1" cy=".5" rx="1.6" ry="1.4" fill="#fff" opacity=".45"/></g>`;

/* ---------- hair (head coordinates: face centre 50,53) ---------- */
function capF(t,lo){
 const x=lo>56?20:23;
 return PA(`M${x} ${lo} Q13 18 50 8 Q87 18 ${100-x} ${lo} Q${102-x} 48 68 40 Q58 34 50 31 Q42 34 32 40 Q${x-2} 48 ${x} ${lo}Z`,t.b)
  +hStr(t.h,['M30 38 Q38 22 54 19','M63 21 Q74 29 76 44','M38 33 Q44 31 49 29'],1.5)
  +SK('M50 14 L50 30',t.d,1,' opacity=".6"')}
const wispF=t=>MH(PA('M25 48 Q16 62 21 80 Q24 68 31 56Z',t.b)+SK('M26 54 Q20 66 22 78',t.h,1.1,' opacity=".6"'));
const curlWisp=t=>MH(SK('M28 50 Q21 62 27 72 Q31 78 26 84',t.b,2.8)+SK('M28 50 Q21 62 27 72 Q31 78 26 84',t.h,.8,' opacity=".5"'));
const wavyLockF=t=>MH(PA('M23 48 Q8 66 17 84 Q9 98 19 110 Q15 120 23 127 Q33 118 30 104 Q28 92 28 80 Q25 66 29 54Z',t.b)+hStr(t.h,['M24 60 Q17 78 24 92 Q20 104 26 116','M28 56 Q24 66 27 74'],1.3));
const wavyBack=t=>PA('M23 36 Q4 62 11 88 Q4 104 15 118 Q24 128 34 116 Q41 124 50 118 Q59 124 66 116 Q76 128 85 118 Q96 104 89 88 Q96 62 77 36Z',t.d)+hStr(t.h,['M18 50 Q10 80 18 102','M82 50 Q90 80 82 102','M42 80 Q36 98 44 112','M60 82 Q66 98 58 112'],1.3);
function hairBack(st,c,hat){const t=ht(c),u=PA('M20 62 Q12 6 50 3 Q88 6 80 62Z',t.d),cov=hat==='beanie'||hat==='cap'||hat==='fjhcap';
 switch(st){
 case'ponytail':return u+PA('M46 26 Q10 4 3 46 Q-3 84 10 114 Q14 124 24 114 Q21 96 26 78 Q30 58 46 40Z',t.b)+hStr(t.h,['M34 20 Q9 22 8 54 Q6 84 14 108','M26 42 Q15 64 19 92','M22 30 Q14 40 12 54'],1.7)+'';
 case'bun':return u+(cov?'':PA('M50 -9 Q74 -8 72 10 Q70 26 50 26 Q30 26 28 10 Q26 -8 50 -9Z',t.b)+hStr(t.h,['M40 -2 Q34 8 40 18','M52 -3 Q58 8 54 20','M60 2 Q64 8 62 16'],1.4)+SK('M36 2 Q28 0 28 8 M66 4 Q74 2 72 10',t.b,2.4)+'');
 case'braids':return u;
 case'halfbow':return wavyBack(t);
 case'straight':return PA('M23 36 Q10 76 12 126 L88 126 Q90 76 77 36Z',t.d)+hStr(t.h,['M20 50 Q14 90 16 120','M80 50 Q86 90 84 120','M46 70 L46 122','M56 70 L58 122'],1.2);
 case'curls':return [[14,42],[12,58],[9,74],[12,90],[10,106],[18,118],[30,118],[16,30],[86,42],[88,58],[91,74],[88,90],[90,106],[82,118],[70,118],[84,30],[44,120],[56,120]].map(p=>`<circle cx="${p[0]}" cy="${p[1]}" r="11" fill="${t.d}"/>`).join('')+u+[[26,22],[74,22],[50,10]].map(p=>`<circle cx="${p[0]}" cy="${p[1]}" r="12" fill="${t.b}"/>`).join('');
 case'crown':return u+PA('M23 40 Q6 68 14 92 Q8 104 18 112 Q28 118 34 108 L66 108 Q72 118 82 112 Q92 104 86 92 Q94 68 77 40Z',t.d)+hStr(t.h,['M18 54 Q11 80 19 98','M82 54 Q89 80 81 98'],1.3);
 case'clip':return u+(cov?'':PA('M58 16 Q70 -6 88 4 Q98 16 84 30 Q76 24 62 26Z',t.b)+hStr(t.h,['M66 10 Q78 2 88 10','M70 20 Q80 14 90 18'],1.3));
 case'bubble':return u+[[70,24,11],[80,44,11],[85,67,10.5],[85,91,10]].map((p,i)=>`<circle cx="${p[0]}" cy="${p[1]}" r="${p[2]}" fill="${t.b}"/>`+SK(`M${p[0]-4} ${p[1]-6} Q${p[0]-8} ${p[1]} ${p[0]-5} ${p[1]+6}`,t.h,1.4,' opacity=".6"')).join('')+[[75,34],[83,56],[86,79]].map(p=>`<ellipse cx="${p[0]}" cy="${p[1]}" rx="7.5" ry="2.8" fill="#f1e4cf" transform="rotate(${p[0]>84?85:65} ${p[0]} ${p[1]})"/>`).join('')+scrunch(66,18,'#f1e4cf',30);
 default:return wavyBack(t)}}
function braid(x0,y0,x1,y1,n,t){let s='',i;const L=[];for(i=0;i<n;i++){const k=i/(n-1),x=x0+(x1-x0)*k+Math.sin(k*5)*1.2,y=y0+(y1-y0)*k,r=5.6-k*1.6;s+=`<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${r.toFixed(1)}" ry="${(r*.82).toFixed(1)}" transform="rotate(${i%2?-32:32} ${x.toFixed(1)} ${y.toFixed(1)})" fill="${i%2?t.b:mix(t.b,t.h,.35)}" stroke="${t.d}" stroke-width=".7"/>`}
 return s+`<ellipse cx="${x1}" cy="${y1+3}" rx="3.6" ry="2.2" fill="#f7f7fa"/>`}
function crownBraid(t){let s='';const n=17;for(let i=0;i<n;i++){const a=(188+i*(164/(n-1)))*Math.PI/180,x=50+31*Math.cos(a),y=44+27*Math.sin(a),rot=a*180/Math.PI+90+(i%2?30:-30);
 s+=`<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="6.2" ry="4.6" transform="rotate(${rot.toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})" fill="${i%2?t.b:mix(t.b,t.h,.4)}" stroke="${t.d}" stroke-width=".7"/>`}return s}
function hairFront(st,c,hat){const t=ht(c);
 switch(st){
 case'ponytail':return capF(t,50)+curlWisp(t)+(hat==='bow'||hat==='cap'||hat==='fjhcap'||hat==='beanie'?'':scrunch(45,22,'#f7f7fa'));
 case'bun':return capF(t,52)+curlWisp(t)+(hat==='none'||hat==='bow'||hat==='headband'||hat==='crown'||hat==='husky'?scrunch(50,19,'#f7f7fa',0):'')+SK('M33 20 Q27 16 23 22 M68 18 Q74 14 78 22',t.b,2);
 case'braids':return capF(t,56)+MH(braid(28,64,25,124,8,t));
 case'halfbow':return capF(t,60)+wavyLockF(t)+(hat==='bow'?'':bowSVG(60,15,'#f7f7fa','#dfe3ec',1.35,-8));
 case'straight':return capF(t,64)+MH(PA('M25 48 Q15 80 16 116 L31 122 Q32 90 30 58Z',t.b)+hStr(t.h,['M22 60 L21 112','M27 62 L27 114'],1.2));
 case'curls':return capF(t,62)+[[30,26],[70,26],[50,18]].map(p=>`<circle cx="${p[0]}" cy="${p[1]}" r="8.5" fill="${t.b}"/>`).join('')+MH([[25,62,9],[22,76,9.5],[24,90,9.5],[22,104,9],[27,116,8.5]].map(p=>`<circle cx="${p[0]}" cy="${p[1]}" r="${p[2]}" fill="${t.b}"/>`+SK(`M${p[0]-4} ${p[1]-4} Q${p[0]-6} ${p[1]} ${p[0]-3} ${p[1]+4}`,t.h,1.3,' opacity=".6"')).join(''));
 case'crown':return capF(t,58)+crownBraid(t)+MH(PA('M25 54 Q14 70 21 88 Q14 98 22 106 Q30 98 29 88 Q34 74 30 58Z',t.b)+SK('M24 64 Q18 80 24 96',t.h,1.2,' opacity=".55"'));
 case'clip':return capF(t,52)+wispF(t)+`<g transform="translate(73 21) rotate(34)"><rect x="-15" y="-6.5" width="30" height="13" rx="6.5" fill="#f1e2c8" stroke="#cdb78f" stroke-width="1.1"/><path d="M-11 -6 V-9.4 M-7 -6 V-9.8 M-3 -6 V-10 M1 -6 V-10 M5 -6 V-9.8 M9 -6 V-9.4" stroke="#cdb78f" stroke-width="1.8" stroke-linecap="round"/><path d="M-11 -2.4 H11" stroke="#fff" stroke-width="1.2" opacity=".7" stroke-linecap="round"/></g>`;
 case'bubble':return capF(t,52)+wispF(t);
 default:return capF(t,62)+wavyLockF(t)}}

/* ---------- hats and glasses ---------- */
function hatSVG(h,a){
 if(h==='cap')return `<path d="M23 38 Q22 8 50 8 Q78 8 77 38Z" fill="#d9dce4"/><path d="M50 8 L50 36 M36 12 Q34 24 31 36 M64 12 Q66 24 69 36" stroke="#b6bac6" stroke-width="1.2" fill="none"/><path d="M20 38 Q50 30 80 38 Q86 47 50 48 Q14 47 20 38Z" fill="#8f96a6"/><path d="M42 24 L48 17 L54 24 L58 19 L62 26Z" fill="#fff" opacity=".75"/><circle cx="50" cy="8" r="2.4" fill="#b6bac6"/>`;
 if(h==='fjhcap')return `<path d="M23 38 Q22 8 50 8 Q78 8 77 38Z" fill="#0b7a3b"/><path d="M50 8 L50 14 M36 12 Q34 24 31 36 M64 12 Q66 24 69 36" stroke="#075d2d" stroke-width="1.2" fill="none"/><path d="M20 38 Q50 30 80 38 Q86 47 50 48 Q14 47 20 38Z" fill="#075d2d"/><text x="50" y="30" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="12" fill="#f7f7fa">FJH</text><circle cx="50" cy="8" r="2.4" fill="#075d2d"/>`;
 if(h==='beanie')return `<path d="M22 40 Q20 6 50 6 Q80 6 78 40Z" fill="#f3ead9"/><path d="M34 8 L36 38 M46 6 L46 38 M58 6 L56 38 M68 10 L66 38" stroke="#e0d3bb" stroke-width="2" fill="none"/><rect x="19" y="32" width="62" height="12" rx="6" fill="#ece0c8"/><path d="M26 36 H74 M26 40 H74" stroke="#d8c9ac" stroke-width="1"/><g fill="#fffaf0">${[0,1,2,3,4,5,6,7].map(i=>`<ellipse cx="${(50+Math.cos(i*.785)*7).toFixed(1)}" cy="${(2+Math.sin(i*.785)*7).toFixed(1)}" rx="4.4" ry="3" transform="rotate(${i*45} ${(50+Math.cos(i*.785)*7).toFixed(1)} ${(2+Math.sin(i*.785)*7).toFixed(1)})"/>`).join('')}<circle cx="50" cy="2" r="6"/></g>`;
 if(h==='bow')return bowSVG(60,15,'#0b7a3b','#f7f7fa',1.2,-12);
 if(h==='headband')return `<path d="M24 44 Q50 4 76 44" stroke="${a}" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M28 38 Q50 8 72 38" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".45"/>`;
 if(h==='husky')return `<path d="M24 44 Q50 4 76 44" stroke="#6b7280" stroke-width="4.5" fill="none" stroke-linecap="round"/>${MH('<path d="M26 28 Q24 4 33 1 Q42 2 47 15Z" fill="#9aa0a6"/><path d="M30 22 Q29 9 34 6 Q39 8 42 15Z" fill="#f7f7fa"/>')}`;
 if(h==='crown')return `<path d="M30 30 L31 8 L41 20 L50 3 L59 20 L69 8 L70 30Z" fill="#ffd54a" stroke="#d9a200" stroke-width="1.6" stroke-linejoin="round"/><circle cx="50" cy="22" r="3" fill="#e5383b"/><circle cx="37" cy="24" r="1.8" fill="#fff"/><circle cx="63" cy="24" r="1.8" fill="#fff"/>`;
 return ''}
function glassesSVG(g){
 if(g==='round')return `<g fill="#ffffff2a" stroke="#4a3a66" stroke-width="1.8"><circle cx="38.5" cy="56" r="8.6"/><circle cx="61.5" cy="56" r="8.6"/><path d="M47 55 Q50 53 53 55"/><path d="M30 55 L25 53 M70 55 L75 53"/></g>`;
 if(g==='square')return `<g fill="#ffffff2a" stroke="#2a2833" stroke-width="1.8"><rect x="29" y="48.5" width="19" height="14" rx="4"/><rect x="52" y="48.5" width="19" height="14" rx="4"/><path d="M48 54 H52 M29 53 L25 52 M71 53 L75 52"/></g>`;
 if(g==='shades')return `<g><rect x="29" y="49" width="20" height="13" rx="5.5" fill="#1d1b26"/><rect x="51" y="49" width="20" height="13" rx="5.5" fill="#1d1b26"/><path d="M49 52 Q50 50.5 51 52" stroke="#1d1b26" stroke-width="2" fill="none"/><path d="M32 52 L38 51 M54 52 L60 51" stroke="#fff" stroke-width="1.4" opacity=".4" stroke-linecap="round"/></g>`;
 if(g==='heart')return `<g fill="#ff8fc1" stroke="#c2255c" stroke-width="1.3" fill-opacity=".85"><path d="M38.5 64 L29 55 Q27 47 34 48 Q38 49 38.5 52 Q39 49 43 48 Q50 47 48 55Z"/><path d="M61.5 64 L52 55 Q50 47 57 48 Q61 49 61.5 52 Q62 49 66 48 Q73 47 71 55Z"/></g>`;
 return ''}

/* ---------- face ---------- */
function faceParts(av,skin,hc,ec){
 const lash='#1d1a22',ex=av.extras||[],eye=(x,d)=>`<ellipse cx="${x}" cy="56.4" rx="5.7" ry="6.4" fill="#fff"/><ellipse cx="${x}" cy="57" rx="4.7" ry="5.6" fill="${ec}"/><ellipse cx="${x}" cy="53.6" rx="4.7" ry="2.8" fill="${dk(ec,.4)}" opacity=".55"/><ellipse cx="${x}" cy="57.2" rx="2.5" ry="3.2" fill="#1d1a22"/><ellipse cx="${x}" cy="60" rx="3.2" ry="1.7" fill="#fff" opacity=".22"/><circle cx="${x-1.7}" cy="54.6" r="2" fill="#fff"/><circle cx="${x+1.8}" cy="59.4" r=".9" fill="#fff"/><path d="M${x-6.3} 56.8 Q${x-4.2} 49.6 ${x+.5} 49.4 Q${x+5} 49.8 ${x+6.3} 56" stroke="${lash}" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M${x+d*6.2} 55.2 Q${x+d*8.6} 53.6 ${x+d*9.6} 50.8 M${x+d*4.2} 50.4 L${x+d*5.8} 47.6" stroke="${lash}" stroke-width="1.5" fill="none" stroke-linecap="round"/>`,
  sd=dk(skin,.1),fr=dk(skin,.3),brow=dk(hc,.15);
 return `<circle cx="26" cy="57" r="4.4" fill="${skin}"/><circle cx="74" cy="57" r="4.4" fill="${skin}"/><path d="M26.5 49 Q26.5 26.5 50 26.5 Q73.5 26.5 73.5 49 Q73.5 61 67.5 70 Q60 80 50 80.5 Q40 80 32.5 70 Q26.5 61 26.5 49Z" fill="${skin}"/>
 <path d="M34 72 Q42 80 50 80.5 Q58 80 66 72 Q58 77 50 77 Q42 77 34 72Z" fill="${sd}" opacity=".35"/>
 <ellipse cx="31.5" cy="66" rx="6" ry="3.4" fill="#ff7fa8" opacity=".48"/><ellipse cx="68.5" cy="66" rx="6" ry="3.4" fill="#ff7fa8" opacity=".48"/>
 ${ex.includes('freckles')?`<g fill="${fr}" opacity=".7">${[[41,64],[44,66.4],[39,67],[46.6,63.6],[59,64],[56,66.4],[61,67],[53.4,63.6],[34,63],[66,63],[36,68],[64,68],[48,67]].map(p=>`<circle cx="${p[0]}" cy="${p[1]}" r=".62"/>`).join('')}</g>`:''}
 ${av.outfit==='gameday'?`<path d="M32 62 L38 62 M32 64.4 L38 64.4 M62 62 L68 62 M62 64.4 L68 64.4" stroke="#0b7a3b" stroke-width="1.2" stroke-linecap="round" opacity=".85"/>`:''}
 ${hairFront(av.hairStyle,hc,av.hat)}
 ${eye(38.5,-1)}${eye(61.5,1)}
 <path d="M32 45.4 Q37.6 40.6 44.6 43.4 M55.4 43.4 Q62.4 40.6 68 45.4" stroke="${brow}" stroke-width="1.8" fill="none" stroke-linecap="round" opacity=".9"/>
 <path d="M48.6 63.6 Q50 65.2 51.6 63.8" stroke="${fr}" stroke-width="1.3" fill="none" stroke-linecap="round" opacity=".8"/>
 <path d="M43.6 69 Q46.8 67.2 50 68.6 Q53.2 67.2 56.4 69 Q50 76.6 43.6 69Z" fill="#ff5c8a"/><path d="M44.6 69.6 Q50 71.4 55.4 69.6" stroke="#c63a68" stroke-width=".8" fill="none" opacity=".7"/><ellipse cx="51.6" cy="72.6" rx="2.4" ry=".9" fill="#fff" opacity=".75"/><path d="M42.4 68.2 Q41.4 69.6 42.6 70.6 M57.6 68.2 Q58.6 69.6 57.4 70.6" stroke="${fr}" stroke-width=".9" fill="none" stroke-linecap="round" opacity=".55"/>
 ${ex.includes('hoops')?MH(`<circle cx="24.2" cy="66" r="4" fill="none" stroke="#e8b83a" stroke-width="1.5"/><path d="M21 63 Q20 66 22 68.5" stroke="#fff3b0" stroke-width=".9" fill="none" opacity=".8"/>`):''}
 ${glassesSVG(av.glasses)}${hatSVG(av.hat,TOPC[av.top]||'#b79cf2')}`}
const neckSVG=skin=>`<path d="M42.5 66 L42.5 98 Q50 106 57.5 98 L57.5 66Z" fill="${skin}"/><path d="M42.5 68 Q50 80 57.5 68 L57.5 80 Q50 90 42.5 80Z" fill="${dk(skin,.14)}" opacity=".55"/>`;

/* ---------- bodies (full-figure canvas 120 x 290) ---------- */
const FW='#f7f7fa',FG='#0b7a3b',FG2='#075d2d',FGY='#b9bcc6',FBK='#2a2833',FDN='#a6bddb',FDN2='#7f9cc2';
const ARM=[[37,91],[29,124],[28,155]],lerp=(p,q,t)=>[p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t];
const sleeveP=f=>[ARM[0],ARM[1],lerp(ARM[1],ARM[2],f)];
const sneak=(f,s,st)=>MR(`<path d="M39 258 L57 258 Q58 270 62 277 Q64 286 54 286 L32 286 Q25 284 30 275 Q38 272 39 258Z" fill="${f}"/><path d="M28 281 L62 281 L62 285 Q62 288 58 288 L32 288 Q26 288 28 281Z" fill="${s}"/><path d="M42 268 Q48 274 56 272" stroke="${st||'#c3c8d4'}" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M44 260 L52 262 M43 264 L53 266" stroke="#d5d8e0" stroke-width="1" opacity=".8"/>`);
const legSk=skin=>MR(PA('M38 128 L38 148 Q36 205 44 262 L55 262 Q57 205 60 160 L60 128Z',skin)+SK('M45 200 Q47 230 50 258',dk(skin,.1),1,' opacity=".4"'));
const legTight=c=>MR(PA('M38 128 L38 148 Q35 205 43 262 L56 262 Q58 205 60 160 L60 128Z',c)+SK('M44 162 Q42 205 47 254',lite(c,.18),1.4,' opacity=".5"'));
const legWide=(c,c2)=>MR(PA('M37 128 L37 146 Q31 205 26 266 L58 266 Q58 205 60 164 L60 128Z',c)+SK('M40 170 Q38 215 36 262 M50 176 Q50 220 52 262',c2,1.1,' opacity=".6"')+PA('M26 258 L58 258 L58 266 L26 266Z',c2,' opacity=".55"'));
const legJog=(c,c2)=>MR(PA('M37 128 L37 146 Q31 200 35 252 L59 252 Q58 205 60 164 L60 128Z',c)+SK('M42 170 Q40 215 41 250',c2,1.1,' opacity=".5"')+PA('M34 246 L59 246 L59 256 L34 256Z',c2));
const handP=(x,y,skin)=>`<circle cx="${x}" cy="${y}" r="5.2" fill="${skin}"/>`;
function armsP(skin,col,w,f,cuff,pts){const A=pts||ARM,S=pts?[A[0],A[1],lerp(A[1],A[2],f)]:sleeveP(f);
 return MR(LB(A,8.4,skin)+handP(A[2][0],A[2][1]+3,skin)+(col?LB(S,w,col)+(cuff?LB([lerp(A[1],A[2],f-.14),lerp(A[1],A[2],f)],w+1.6,cuff):'')+SK(`M${S[0][0]+2} ${S[0][1]+6} Q${S[1][0]+2} ${S[1][1]-6} ${S[1][0]+3} ${S[1][1]+4}`,lite(col,.2),1.3,' opacity=".5"'):''))}
const pom=(x,y,r)=>{let s='';[[.7,14,.5,.19,0],[.45,12,.42,.18,11]].forEach(([rd,n,L,W,off],ring)=>{for(let i=0;i<n;i++){const a=(i*360/n+off)*Math.PI/180,px=x+Math.cos(a)*r*rd,py=y+Math.sin(a)*r*rd;s+=`<ellipse cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" rx="${(r*L).toFixed(1)}" ry="${(r*W).toFixed(1)}" transform="rotate(${(a*180/Math.PI).toFixed(1)} ${px.toFixed(1)} ${py.toFixed(1)})" fill="${i%3===(ring?1:0)?'#9aa0a6':(i+ring)%2?FG:FW}"/>`}});return s+`<circle cx="${x}" cy="${y}" r="${(r*.3).toFixed(1)}" fill="${FG}"/><circle cx="${x}" cy="${y}" r="${(r*.13).toFixed(1)}" fill="${FW}"/>`};
const hoodTop=(col,sk2,str)=>{const d=dk(col,.1);return PA('M34 89 Q44 82 60 82 Q76 82 86 89 Q91 114 89 144 Q90 154 87 160 L33 160 Q30 154 31 144 Q29 114 34 89Z',col)+PA('M32 152 Q60 156 88 152 L87 160 L33 160Z',d)+PA('M42 85 Q60 105 78 85 Q70 77 60 78 Q50 77 42 85Z',d)+PA('M50 84 Q60 96 70 84Z',sk2)+(str===false?'':LB([[54,93],[53,112]],1.5,'#fff')+LB([[66,93],[67,112]],1.5,'#fff')+`<circle cx="53" cy="113" r="1.5" fill="#fff"/><circle cx="67" cy="113" r="1.5" fill="#fff"/>`)+PA('M41 132 Q60 126 79 132 L83 154 L37 154Z',dk(col,.05),` stroke="${dk(col,.16)}" stroke-width="1"`)+SK('M60 128 L60 154',dk(col,.12),1,' opacity=".6"')};
function outfitParts(o,top,skin){
 const T=TOPC[top]||TOPC.cream,Td=dk(T,.12),sk2=dk(skin,.14),BK=FBK;
 switch(o){
 case'cheer':return legSk(skin)+MR(PA('M43 236 L56 236 L56 262 L44 262Z',FW)+LB([[43.5,241],[56,241]],1.8,FG))+sneak(FW,'#dfe1e8')
  +PA('M38 140 L82 140 L92 190 L28 190Z',FG)+SK('M46 142 L40 189 M54 142 L51 189 M66 142 L69 189 M74 142 L80 189',FG2,1.2,' opacity=".7"')+PA('M28.6 181 L91.4 181 L92 190 L28 190Z',FW)+LB([[28.7,185.5],[91.3,185.5]],1.6,FG)
  +'\u0001'
  +armsP(skin,null,0,0,null,[[38,92],[28,124],[22,151]])
  +PA('M40 88 Q46 84 53 84 L57 95 Q60 99 63 95 L67 84 Q74 84 80 88 Q84 106 80 124 L81 146 L39 146 L40 124 Q36 106 40 88Z',FG)
  +PA('M53 84 L60 102 L67 84Z',skin)+LB([[51,86],[60,106],[69,86]],2,FW)+LB([[47,94],[60,114],[73,94]],1.6,FGY)
  +`<text x="60" y="133" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="12" fill="${FW}">FJH</text>`+PA('M39 142 L81 142 L81 146 L39 146Z',FW)
  +MR(pom(19,160,17));
 case'athleisure':return legTight(BK)+sneak(FW,'#d9dbe3')
  +'\u0001'
  +PA('M43 86 Q60 92 77 86 L78 148 L42 148Z',T)+SK('M52 86 Q60 96 68 86',dk(T,.16),1.4)
  +MR(PA('M36 88 Q44 83 52 83 L54 149 L36 151 Q34 120 36 88Z','#2f3039')+SK('M52 86 L54 148',lite('#2f3039',.3),1.2,' opacity=".6"'))
  +PA('M44 83 Q60 98 76 83 Q68 77 60 78 Q52 77 44 83Z','#23242c')
  +armsP(skin,'#2f3039',13.5,1,lite('#2f3039',.12))
  +`<path d="M45 80 Q60 100 75 80" stroke="${FW}" stroke-width="3.6" fill="none" stroke-linecap="round"/><rect x="40" y="82" width="8.5" height="13" rx="4" fill="${FW}"/><rect x="71.5" y="82" width="8.5" height="13" rx="4" fill="${FW}"/><rect x="42" y="85" width="4.5" height="7" rx="2" fill="#d2d6e0"/><rect x="73.5" y="85" width="4.5" height="7" rx="2" fill="#d2d6e0"/>`;
 case'school':return `<rect x="21" y="98" width="20" height="50" rx="9" fill="#d3bf9c"/><rect x="79" y="98" width="20" height="50" rx="9" fill="#d3bf9c"/>`+sneak(FW,'#d9dbe3')+legWide(FDN,FDN2)
  +PA('M34 197 L48 202 L47 211 L33 206Z','#e6eef8')+SK('M36 199 L46 208 M38 197 L44 210',FDN2,.9,' opacity=".7"')
  +PA('M36 142 L84 142 L84 156 L36 156Z','#8ea9cb')
  +'\u0001'
  +PA('M34 89 Q44 82 60 82 Q76 82 86 89 Q91 114 89 144 Q90 154 87 160 L33 160 Q30 154 31 144 Q29 114 34 89Z',FG)+PA('M32 152 Q60 156 88 152 L87 160 L33 160Z',FG2)+PA('M46 83 Q60 96 74 83 Q68 77 60 78 Q52 77 46 83Z',FG2)+PA('M52 84 Q60 92 68 84Z',sk2)
  +`<text x="60" y="121" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="17" fill="${FW}">FJH</text>`
  +MR(LB([[45,86],[42,134]],4.6,'#c9b48a')+`<rect x="38.8" y="126" width="6.4" height="5" rx="1.5" fill="#a8946f"/>`)
  +armsP(skin,FG,14.5,1,FG2,[[37,91],[26,124],[36,150]]);
 case'gameday':return legTight(BK)+sneak(FW,'#d9dbe3')
  +'\u0001'
  +PA('M34 89 Q44 82 60 82 Q76 82 86 89 Q91 112 88 150 L32 150 Q29 112 34 89Z',FW)+SK('M36 150 Q34 118 36 96 M84 150 Q86 118 84 96',FGY,1.2,' opacity=".6"')
  +armsP(skin,FW,15,.0,null,[[37,91],[29,124],[28,155]])
  +MR(LB([[22,119.5],[37,123.5]],2.4,FG)+LB([[22.4,123.6],[37.4,127.6]],2.4,FG))
  +LB([[49,83],[60,98],[71,83]],4.2,FG)+PA('M52 84 L60 94 L68 84Z',sk2)
  +`<text x="60" y="112" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="12" fill="${FG}">FJH</text><text x="60" y="135" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="23" fill="${FG}">14</text>`
  +PA('M33 140 Q60 152 87 140 L87 156 Q60 168 33 156Z',FGY)+SK('M33 148 Q60 160 87 148',dk(FGY,.15),1,' opacity=".6"')+LB([[40,154],[33,186]],7.5,FGY)+LB([[48,157],[47,184]],7.5,mix(FGY,'#888a96',.25))+`<circle cx="44" cy="153" r="5" fill="#a3a6b3"/>`+'';
 case'cozy':return legJog(T,Td)+MR(`<ellipse cx="44" cy="271" rx="16" ry="9.5" fill="#a87348"/><path d="M30 268 Q34 262 44 262 Q54 262 58 268 Q52 266 44 266 Q36 266 30 268Z" fill="#e8d2b0"/>${SK('M33 275 Q44 281 56 275',dk('#a87348',.2),1.2)}`)
  +'\u0001'
  +hoodTop(T,sk2)+armsP(skin,T,15,1,dk(T,.1))
  +`<rect x="19" y="144" width="13" height="30" rx="4" fill="${FW}"/><rect x="18" y="140" width="15" height="6" rx="2.5" fill="#8f96a6"/><rect x="19" y="154" width="13" height="8" fill="#d8dbe4"/><path d="M33 150 Q40 152 34 164" stroke="#8f96a6" stroke-width="2" fill="none"/>`+'';
 case'street':return sneak(FW,'#d9dbe3')+MR(PA('M36 128 L36 140 Q30 205 26 266 L58 266 Q58 205 60 168 L60 128Z','#a9c0dc')+SK('M42 170 Q40 215 38 262',FDN2,1.1,' opacity=".6"')+PA('M26 258 L58 258 L58 266 L26 266Z',FDN2,' opacity=".5"')+`<rect x="29" y="188" width="12" height="16" rx="2" fill="#98b0cf" stroke="${FDN2}" stroke-width="1"/><path d="M29 194 H41" stroke="${FDN2}" stroke-width="1"/>`)
  +PA('M38 128 L82 128 L82 140 L38 140Z','#a9c0dc')+LB([[40,138],[80,138]],1.2,FDN2)
  +'\u0001'
  +PA('M40 88 Q46 84 54 84 Q60 90 66 84 Q74 84 80 88 Q84 100 80 118 L80 126 L40 126 Q36 100 40 88Z','#2f3039')+PA('M42 126 L78 126 L78 132 L42 132Z',skin)+PA('M42 126 L78 126 L77 129 L43 129Z',sk2,' opacity=".5"')
  +armsP(skin,'#2f3039',9.4,1,null)
  +PA('M37 86 Q60 79 83 86 Q86 104 82 124 L38 124 Q34 104 37 86Z','#f6efe2')+SK('M37 98 Q60 102 83 98 M36 110 Q60 114 84 110',dk('#f6efe2',.12),1.3,' opacity=".9"')+SK('M60 90 L60 124',dk('#f6efe2',.16),1.2)
  +PA('M47 84 Q60 78 73 84 L73 91 Q60 96 47 91Z','#ece3d0')+PA('M52 84 Q60 90 68 84Z',sk2)+MR(LB([[37,91],[30,112]],13,'#f6efe2')+SK('M30 100 H42',dk('#f6efe2',.12),1.2));
 case'dressy':return legSk(skin)+MR(PA('M40 206 L57 206 L58 262 Q61 270 61 279 Q61 288 52 288 L31 288 Q26 286 30 277 Q38 271 40 262Z','#7b4a2c')+SK('M41 214 L56 214 M44 214 Q45 245 44 262',lite('#7b4a2c',.2),1.2,' opacity=".6"'))
  +PA('M37 138 L83 138 L90 176 L30 176Z','#93b3d9')+SK('M31 176 L30 180 M36 176 L35 181 M42 176 L42 180 M48 176 L47 181 M54 176 L54 180 M60 176 L60 181 M66 176 L67 180 M72 176 L73 181 M78 176 L78 180 M84 176 L85 181 M89 176 L90 180','#e9f1fa',1.2)+SK('M60 140 V174',dk('#93b3d9',.12),1)
  +'\u0001'
  +PA('M36 89 Q46 82 60 82 Q74 82 84 89 Q88 108 85 138 Q86 146 83 150 L37 150 Q34 146 35 138 Q32 108 36 89Z',T)+PA('M35 142 L85 142 L84 150 L36 150Z',Td)
  +SK('M45 100 Q44 125 46 142 M53 98 Q52 125 53 142 M67 98 Q68 125 67 142 M75 100 Q76 125 74 142',dk(T,.12),1.3,' opacity=".7"')+PA('M46 83 Q60 94 74 83 Q68 77 60 78 Q52 77 46 83Z',Td)+PA('M52 84 Q60 92 68 84Z',sk2)
  +armsP(skin,T,13.5,1,Td)
  +LB([[80,86],[58,118],[40,150]],2.6,'#5c3a21')+`<rect x="27" y="146" width="22" height="17" rx="4" fill="#7b4a2c"/><path d="M27 150 Q38 158 49 150" stroke="#5c3a21" stroke-width="1.3" fill="none"/><circle cx="38" cy="156" r="2" fill="#e8b83a"/>`
  +`<path d="M52 84 Q60 98 68 84" stroke="#e8b83a" stroke-width="1" fill="none"/><circle cx="60" cy="98" r="1.8" fill="#e8b83a"/>`;
 case'outdoors':return `<rect x="21" y="98" width="20" height="50" rx="9" fill="#2f3039"/><rect x="79" y="98" width="20" height="50" rx="9" fill="#2f3039"/>`+legJog('#3a3942','#2a2933')
  +MR(`<path d="M31 262 L58 262 Q60 272 62 278 Q64 286 54 286 L32 286 Q26 284 30 276Z" fill="#8a5a34"/><path d="M28 281 L62 281 L62 286 Q62 288 58 288 L32 288 Q26 288 28 281Z" fill="#3a3942"/>${SK('M42 262 L54 264 M41 267 L53 269',lite('#8a5a34',.3),1.3)}`)
  +MR(`<rect x="30" y="196" width="12" height="16" rx="2" fill="#2e2d35" stroke="#24232a" stroke-width="1"/>`)
  +'\u0001'
  +PA('M34 89 Q44 82 60 82 Q76 82 86 89 Q91 114 89 144 Q90 154 87 160 L33 160 Q30 154 31 144 Q29 114 34 89Z','#5a6e4b')+PA('M32 152 Q60 156 88 152 L87 160 L33 160Z','#4a5b3e')
  +PA('M42 85 Q60 103 78 85 Q70 77 60 78 Q50 77 42 85Z','#4a5b3e')+PA('M50 84 Q60 96 70 84Z','#f3f3f3')+SK('M60 90 L60 158','#3f4e34',1.3)+`<rect x="41" y="112" width="15" height="11" rx="2" fill="#53663f" stroke="#3f4e34" stroke-width="1"/><rect x="64" y="112" width="15" height="11" rx="2" fill="#53663f" stroke="#3f4e34" stroke-width="1"/><path d="M41 140 Q60 134 79 140" stroke="#3f4e34" stroke-width="1" fill="none"/>`
  +armsP(skin,'#5a6e4b',15,1,'#3f4e34')+MR(LB([[45,86],[42,126]],4.4,'#2f3039')+`<rect x="40" y="119" width="5.4" height="5" rx="1.5" fill="#55565f"/>`);
 case'holiday':return legTight(BK)+MR(`<path d="M31 256 L58 256 Q60 268 62 276 Q63 286 54 286 L32 286 Q26 284 30 274Z" fill="#c89a64"/><path d="M30 256 Q44 252 58 256 L58 264 Q44 260 30 264Z" fill="#f1e4cf"/>${SK('M36 272 Q46 280 56 274',dk('#c89a64',.2),1.2)}`)
  +'\u0001'
  +PA('M34 89 Q44 82 60 82 Q76 82 86 89 Q91 114 89 144 Q90 154 87 160 L33 160 Q30 154 31 144 Q29 114 34 89Z',T)+PA('M32 152 Q60 156 88 152 L87 160 L33 160Z',Td)
  +`<path d="M32 152 L88 152" stroke="${FG}" stroke-width="4.4" stroke-dasharray="3 2.6"/><path d="M34 130 L86 130" stroke="${FG}" stroke-width="2" stroke-dasharray="1.6 2.4" opacity=".7"/>`+SK('M44 100 Q43 125 45 146 M76 100 Q77 125 75 146',Td,1.4,' opacity=".6"')
  +armsP(skin,T,15,1,Td)+MR(`<path d="M20.5 138 L33.5 142" stroke="${FG}" stroke-width="3.6" stroke-dasharray="2.4 2.2"/>`)
  +`<path d="M43 84 Q60 99 77 84 L80 93 Q60 110 40 93Z" fill="${FG}"/><path d="M46 88 L58 99 M52 86 L64 100 M58 85 L70 98 M44 95 L56 106 M54 97 L68 108" stroke="${FW}" stroke-width="1.3" opacity=".65"/><path d="M64 98 L77 96 L80 142 L68 144Z" fill="${FG}"/><path d="M66 106 L78 104 M67 116 L79 114 M68 126 L79 124 M70 98 L73 143 M75 97 L77 141" stroke="${FW}" stroke-width="1.2" opacity=".6"/><path d="M68 144 L80 142 L80 148 L69 150Z" fill="${FW}" opacity=".5"/>`
  +`<rect x="18" y="140" width="13" height="19" rx="2.5" fill="${FW}"/><rect x="18" y="148" width="13" height="7" fill="#9a6b44"/><rect x="17" y="137" width="15" height="4" rx="2" fill="#f1e4cf"/><path d="M24 133 Q22 129 25 126" stroke="#fff" stroke-width="1.2" fill="none" opacity=".7"/>`;
 default:/* casual */return legTight(BK)+sneak(FW,'#d9dbe3')
  +'\u0001'
  +hoodTop(T,sk2)+armsP(skin,T,15,1,Td)
  +LB([[82,86],[58,120],[40,148]],2.6,'#3a3946')+`<rect x="27" y="146" width="24" height="18" rx="4" fill="#3a3946"/><path d="M27 150 Q39 159 51 150" stroke="#23222b" stroke-width="1.3" fill="none"/><rect x="36" y="154" width="6" height="4" rx="1" fill="#c9b27a"/>`}}

function outfitSVG(o,top,skin){const p=outfitParts(o,top,skin).split('\u0001');
 return `<g transform="translate(0 20.2) scale(1 .93)">${p[0]}</g><g transform="translate(0 -15.1) scale(1 1.18)">${p[1]||''}</g>`}
const HT='translate(22 9) scale(.76)',FULLVB='0 0 120 290';
function charBody(av,mode){
 av=fixAv(av);
 const skin=SKIN[av.skin]||SKIN.s2,hc=HAIRC[av.hairColor]||HAIRC.brown,ec=EYEC[av.eyes]||EYEC.brown;
 if(mode==='head')return `${hairBack(av.hairStyle,hc,av.hat)}${neckSVG(skin)}${faceParts(av,skin,hc,ec)}`;
 return `<ellipse cx="60" cy="287" rx="36" ry="3.2" fill="#3b2a66" opacity=".16"/><g transform="${HT}">${hairBack(av.hairStyle,hc,av.hat)}${neckSVG(skin)}</g>${outfitSVG(av.outfit,av.top,skin)}<g transform="${HT}">${faceParts(av,skin,hc,ec)}</g>`}
const avatarSVG=(av,vb,cls)=>`<svg class="${cls||'avsvg'}" viewBox="${vb||FULLVB}" role="img" aria-label="Your character" xmlns="http://www.w3.org/2000/svg">${charBody(av)}</svg>`;
let _cp=0;
function carSVG(av,cls){
 const m=MODELS[av.car]||MODELS.hatch,col=CARC[av.carColor]||CARC.red,up=av.up||[],id='cp'+(++_cp),
  ws0=m.ci+13,ws1=107-m.ci,wsT=m.ct+4,wsB=m.by-2,wsW=ws1-ws0,wsH=wsB-wsT;
 let aw=wsH*56/66,ah=wsH;if(aw>wsW*.82){aw=wsW*.82;ah=aw*66/56}
 const ax=60-aw/2,ay=wsB-ah+1,y0=100-m.wh-2,gy=m.by+m.bh;
 const rims=up.includes('rims')?'#ffc61a':'#8a93a3';
 return `<svg class="${cls||'carsvg'}" viewBox="0 0 120 100" role="img" aria-label="Your car" xmlns="http://www.w3.org/2000/svg">
 ${up.includes('glow')?`<ellipse cx="60" cy="94" rx="56" ry="8" fill="#22d3ee" opacity=".55"/><ellipse cx="60" cy="94" rx="40" ry="5" fill="#a5f3fc" opacity=".7"/>`:''}
 ${up.includes('spoiler')?`<rect x="30" y="${m.ct+2}" width="5" height="12" fill="#14161b"/><rect x="85" y="${m.ct+2}" width="5" height="12" fill="#14161b"/><rect x="18" y="${m.ct-4}" width="84" height="6" rx="3" fill="#14161b"/>`:''}
 <rect x="3" y="${y0}" width="17" height="${m.wh}" rx="5" fill="#14161b"/><rect x="100" y="${y0}" width="17" height="${m.wh}" rx="5" fill="#14161b"/><rect x="7" y="${y0+4}" width="5" height="${m.wh-8}" rx="2" fill="${rims}"/><rect x="108" y="${y0+4}" width="5" height="${m.wh-8}" rx="2" fill="${rims}"/>
 <path d="M${m.ci} ${m.by+2} L${m.ci+8} ${m.ct} Q60 ${m.ct-6} ${112-m.ci} ${m.ct} L${120-m.ci} ${m.by+2}Z" fill="${col}"/>
 <rect x="10" y="${m.by}" width="100" height="${m.bh}" rx="20" fill="${col}"/><path d="M22 ${m.by+6} Q40 ${m.by+2} 56 ${m.by+4}" stroke="#fff" stroke-width="3" stroke-linecap="round" fill="none" opacity=".45"/>
 <path d="M${ws0-6} ${wsB} L${ws0} ${wsT} Q60 ${wsT-5} ${ws1} ${wsT} L${ws1+6} ${wsB}Z" fill="#d6ecff"/>
 <clipPath id="${id}"><path d="M${ws0-6} ${wsB} L${ws0} ${wsT} Q60 ${wsT-5} ${ws1} ${wsT} L${ws1+6} ${wsB}Z"/></clipPath>
 <g clip-path="url(#${id})"><svg x="${ax.toFixed(1)}" y="${ay.toFixed(1)}" width="${aw.toFixed(1)}" height="${ah.toFixed(1)}" viewBox="22 6 56 66">${charBody(Object.assign({},av,{hat:av.hat}),'head')}</svg><path d="M${ws0} ${wsT} L${ws0+22} ${wsT} L${ws0+4} ${wsB}Z" fill="#fff" opacity=".18"/></g>
 <path d="M${ws0-6} ${wsB} L${ws0} ${wsT} Q60 ${wsT-5} ${ws1} ${wsT} L${ws1+6} ${wsB}Z" fill="none" stroke="#0007" stroke-width="2.4"/>
 ${up.includes('stripes')?`<rect x="48" y="${m.by}" width="7" height="${m.bh-6}" fill="#f3f4f6" opacity=".92"/><rect x="65" y="${m.by}" width="7" height="${m.bh-6}" fill="#f3f4f6" opacity=".92"/>`:''}
 ${[26,94].map((x,i)=>{const d=i?1:-1;return `<circle cx="${x}" cy="${m.by+13}" r="8.4" fill="#fffbe6" stroke="#14161b" stroke-width="2"/><circle cx="${x}" cy="${m.by+13}" r="4.6" fill="#ffe27a"/><circle cx="${x-1.8}" cy="${m.by+10.5}" r="2" fill="#fff"/><path d="M${x+d*7.2} ${m.by+8} L${x+d*11.6} ${m.by+3.4} M${x+d*4.6} ${m.by+5.4} L${x+d*7.4} ${m.by-0.2} M${x+d*8.8} ${m.by+11} L${x+d*13.4} ${m.by+8.6}" stroke="#14161b" stroke-width="2.2" stroke-linecap="round"/>`}).join('')}<ellipse cx="14" cy="${m.by+27}" rx="5.5" ry="3" fill="#fff" opacity=".35"/><ellipse cx="106" cy="${m.by+27}" rx="5.5" ry="3" fill="#fff" opacity=".35"/>
 <path d="M60 ${m.ct-2} l-12 -9 l0 14z M60 ${m.ct-2} l12 -9 l0 14z" fill="#ff8fc1" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/><circle cx="60" cy="${m.ct-2}" r="3.4" fill="#ffd1e6"/>
 <path d="M8 ${m.by-6} l2 -5 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2z" fill="#fff" opacity=".9"/><path d="M108 ${m.by-14} l1.6 -4 l1.6 4 l4 1.6 l-4 1.6 l-1.6 4 l-1.6 -4 l-4 -1.6z" fill="#ffe27a"/>
 <rect x="42" y="${gy-19}" width="36" height="12" rx="4" fill="#fff" stroke="#14161b" stroke-width="1.6"/><text x="60" y="${gy-10}" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="8" fill="#e83e8c">FJH</text><path d="M46 ${gy-13} q1.5 -2 3 0 q-1.5 3 -3 0z" fill="#ff7fa8" opacity="0"/>
 <rect x="16" y="${gy-7}" width="88" height="6" rx="3" fill="#14161b" opacity=".4"/></svg>`}

/* ---------- state helpers ---------- */
const OUTHAT={cheer:'bow',gameday:'fjhcap',outdoors:'cap',holiday:'beanie'};
/* picking an outfit also puts on its signature headwear, and takes it off again when you change outfit */
const outfitHat=(av,id)=>{const h=av.hat;return (h==='none'||h===OUTHAT[av.outfit])?(OUTHAT[id]||'none'):h};
const SHIRT={cheer:'#0b7a3b',school:'#0b7a3b',gameday:'#f7f7fa',athleisure:'#2f3039',street:'#2f3039',outdoors:'#5a6e4b'};
function syncPlayer(){const a=AV_();PLAYER=Object.assign(PLAYER,{color:CARC[a.carColor]||PLAYER.color,skin:SKIN[a.skin],hair:HAIRC[a.hairColor],shirt:SHIRT[a.outfit]||TOPC[a.top]})}
function ensureAvatar(){if(!S.avatar){S.avatar=Object.assign({},DEFAV);S.own=S.own||{};if(!(S.coins>0))S.coins=50}return S.avatar}
if(S.avatar&&typeof S.avatar==='object')S.avatar=fixAv(S.avatar);
const tryAv=()=>Object.assign({},AV_(),ui.gx&&ui.gx.t||{});
const ownedAll=av=>CATS.every(c=>c.multi?(av[c.key]||[]).every(id=>owns(c.key,id)):owns(c.key,av[c.key]));
const priceOf=av=>CATS.reduce((a,c)=>a+(c.multi?(av[c.key]||[]).filter(id=>!owns(c.key,id)).reduce((s,id)=>s+((itemOf(c.key,id)||{}).p||0),0):(owns(c.key,av[c.key])?0:((itemOf(c.key,av[c.key])||{}).p||0))),0);

/* ---------- garage ---------- */
const HEADVB={hairStyle:'16 2 88 106'};
const GRP=g=>CATS.filter(c=>g==='char'?isChar(c.key):!isChar(c.key));
function tile(c,it,av){
 const chr=isChar(c.key),sel=c.multi?(av[c.key]||[]).includes(it.id):av[c.key]===it.id,own=owns(c.key,it.id);
 let pv='';
 if(c.kind==='swatch')pv=`<i class="swatch" style="background:${it.c}"></i>`;
 else if(c.kind==='head')pv=avatarSVG(Object.assign({},av,{[c.key]:c.multi?[it.id]:it.id}),HEADVB[c.key]||'32 4 56 68','tpv');
 else if(c.kind==='body')pv=avatarSVG(Object.assign({},av,{[c.key]:it.id,hat:outfitHat(av,it.id)}),FULLVB,'tpv tall');
 else{const nv=c.multi?(av[c.key]||[]).includes(it.id)?(av[c.key]||[]).filter(x=>x!==it.id):[...(av[c.key]||[]),it.id]:it.id;pv=carSVG(Object.assign({},av,{[c.key]:c.multi?[it.id]:nv}),'tpv')}
 const sub=chr?(c.multi?(sel?'On':'Off'):(sel?'Wearing':'')):(own?(sel?'Wearing':'Owned'):'🪙 '+it.p);
 return `<button class="gt ${sel?'sel':''} ${own?'':'lk'}" data-act="gpick" data-k="${c.key}" data-v="${it.id}" aria-pressed="${sel}" aria-label="${esc(it.n)}${own?'':', '+it.p+' coins'}"><span class="gpv">${pv}</span><b>${esc(it.n)}</b><small>${sub||'&nbsp;'}</small></button>`}
function garageView(onb){
 ui.gx=ui.gx||{c:'hairStyle',t:{}};if(!catOf(ui.gx.c))ui.gx.c='hairStyle';
 const av=tryAv(),c=catOf(ui.gx.c),grp=isChar(c.key)?'char':'car',cost=priceOf(av),dirty=Object.keys(ui.gx.t).length>0,coins=S.coins||0;
 const bar=dirty?`<div class="gbar"><div class="muted">${cost?`Costs 🪙 ${cost}${cost>coins?`. You need ${cost-coins} more. Study runs and games both earn coins.`:''}`:'Your items'}</div><div class="row" style="gap:8px"><button class="btn small line" data-act="gundo" style="flex:1">Undo</button><button class="btn small primary" data-act="gsave" style="flex:2" ${cost>coins?'disabled style="opacity:.45"':''}>${cost?'Buy and wear':'Wear it'}</button></div></div>`:'';
 return `${onb?'':'<h2>Garage</h2>'}<div class="gseg" role="tablist" aria-label="What to change"><button role="tab" aria-selected="${grp==='char'}" class="${grp==='char'?'on':''}" data-act="ggrp" data-v="char">Look</button><button role="tab" aria-selected="${grp==='car'}" class="${grp==='car'?'on':''}" data-act="ggrp" data-v="car">Car</button>${grp==='char'?'<button class="gsur" data-act="gsurprise">Surprise me</button>':'<span class="gfree muted">Coins buy cars</span>'}</div><div class="gstick"><div class="gprev"><div class="gp1">${avatarSVG(av,FULLVB,'avbig')}</div><div class="gp2">${carSVG(av,'carbig')}<span class="gname">${esc(S.avatar&&S.avatar.name||'')}</span></div></div>
 <div class="gchips" role="tablist">${GRP(grp).map(x=>`<button role="tab" aria-selected="${x.key===c.key}" class="gc ${x.key===c.key?'on':''}" data-act="gcat" data-v="${x.key}">${x.label}</button>`).join('')}</div></div>
 <div class="ggrid ${c.kind==='swatch'?'sw':''} ${c.kind==='body'?'bd':''}">${c.items.map(it=>tile(c,it,av)).join('')}</div>${bar}`}
const garageTab=()=>garageView(false);
const pickOf=a=>a[Math.floor(Math.random()*a.length)];
Object.assign(acts,{
 gcat:v=>{ui.gx=ui.gx||{c:v,t:{}};ui.gx.c=v;render()},
 ggrp:v=>{ui.gx=ui.gx||{c:'hairStyle',t:{}};ui.gx.c=GRP(v)[0].key;render()},
 gsurprise:()=>{const a=ensureAvatar(),cur=AV_(),fit=pickOf(catOf('outfit').items.map(i=>i.id));
  Object.assign(S.avatar,cur,{hairStyle:pickOf(catOf('hairStyle').items.map(i=>i.id)),hairColor:pickOf(Object.keys(HAIRC)),outfit:fit,hat:outfitHat(cur,fit),top:pickOf(Object.keys(TOPC))});
  syncPlayer();save();render()},
 gundo:()=>{ui.gx.t={};render()},
 gsave:()=>{const av=tryAv(),cost=priceOf(av);if(cost>(S.coins||0)){toast('Not enough coins yet. Study runs and games both earn coins.');return}
  S.coins-=cost;S.own=S.own||{};CATS.forEach(c=>{if(isChar(c.key))return;(c.multi?av[c.key]:[av[c.key]]).forEach(id=>{S.own[c.key+':'+id]=1})});
  S.avatar=Object.assign({},S.avatar,av,{name:S.avatar.name});ui.gx.t={};syncPlayer();save();toast(cost?'Bought. Looking good.':'Saved');render()}
});
/* tile clicks carry two data attributes, so handle them in the global click flow */
document.addEventListener('click',e=>{const b=e.target.closest('[data-act="gpick"]');if(!b)return;e.stopPropagation();
 const k=b.dataset.k,id=b.dataset.v,c=catOf(k);ui.gx=ui.gx||{c:k,t:{}};const cur=AV_();
 if(isChar(k)){/* character looks are free, so they apply at once */
  ensureAvatar();S.avatar=Object.assign({},S.avatar,cur);
  if(c.multi){const base=(cur[k]||[]).slice(),i=base.indexOf(id);i>=0?base.splice(i,1):base.push(id);S.avatar[k]=base}
  else{S.avatar[k]=id;if(k==='outfit')S.avatar.hat=outfitHat(cur,id)}
  syncPlayer();save();render();return}
 if(c.multi){const base=ui.gx.t[k]||(cur[k]||[]).slice();const i=base.indexOf(id);i>=0?base.splice(i,1):base.push(id);ui.gx.t[k]=base;
  if(JSON.stringify(base.slice().sort())===JSON.stringify((cur[k]||[]).slice().sort()))delete ui.gx.t[k]}
 else{if(cur[k]===id)delete ui.gx.t[k];else ui.gx.t[k]=id}
 render()},true);

/* ---------- onboarding ---------- */
function obView(){const o=ui.ob;
 if(o.step===0)return `<div class="ob"><div class="obc"><div class="obic">🚘</div><h2>Welcome to Permit Quest</h2><p class="muted">Learn the rules of the road, play games, and build your own driver and car.</p><label class="lab" for="obn">What should we call you?</label><input id="obn" class="inp" maxlength="20" autocomplete="given-name" autocapitalize="words" enterkeyhint="done" placeholder="First name" value="${esc(S.avatar&&S.avatar.name||'')}"><button class="btn primary" data-act="obname" style="margin-top:14px">Next</button></div></div>`;
 if(o.step===1)return `<div class="ob2"><div class="obtop"><b>Build your driver</b><span class="muted">Every look is free. You start with 🪙 ${S.coins||0} for car upgrades.</span></div>${garageView(true)}${ui.gx&&Object.keys(ui.gx.t).length?'':'<div class="foot ob-foot"><button class="btn primary" data-act="obdone">Looks good</button><div class="muted" style="text-align:center;margin-top:6px">You can change this any time in the Garage</div></div>'}</div>`;
 return `<div class="ob"><div class="obc"><div class="carbox">${carSVG(AV_(),'carbig')}</div><h2>${esc(S.avatar.name||'Driver')}, see where you start</h2><p class="muted">Take a quick pretest. There are no stars and no pressure. It shows which topics to study first.</p><button class="btn primary" data-act="pretest">Take the pretest</button><button class="btn line" data-act="obskip" style="margin-top:10px">Skip for now</button></div></div>`}
Object.assign(acts,{
 obname:()=>{const v=($('#obn').value||'').trim().slice(0,20);if(!v){toast('Type a name to continue.');return}ensureAvatar();S.avatar.name=v;S.name=v;save();ui.ob={step:1};ui.gx={c:'hairStyle',t:{}};render();window.scrollTo(0,0)},
 obdone:()=>{ui.ob={step:2};ui.gx=null;syncPlayer();save();render();window.scrollTo(0,0)},
 obskip:()=>{ui.ob=null;S.pre=S.pre||{skipped:true};save();render()},
 pretest:()=>{ui.ob=null;startPretest()}
});

/* ---------- pretest ---------- */
function startPretest(){
 const per=CHAPTERS.map(c=>shuffle(ALL.filter(q=>q.ch===c.id))[0]),used=new Set(per.map(q=>q.id)),extra=shuffle(ALL.filter(q=>!used.has(q.id))).slice(0,4);
 startRun({mode:'pre',title:'Pretest',pool:ALL,qs:shuffle(per.concat(extra))})}
function preResult(x){const pct=Math.round(x.correct/x.total*100),by=CHAPTERS.map(c=>({c,v:(S.pre&&S.pre.by&&S.pre.by[c.id])||[0,0]})).filter(r=>r.v[1]>0).sort((a,b)=>a.v[0]/a.v[1]-b.v[0]/b.v[1]);
 return `<div style="max-width:560px;margin:0 auto;padding:calc(28px + env(safe-area-inset-top)) 16px calc(32px + env(safe-area-inset-bottom))"><div class="center"><p class="eyebrow">Your starting point</p><div class="big pop">${pct}%</div><h2 style="margin-top:10px">${pct>=80?'You already know a lot':pct>=50?'A solid start':'A fresh start. Let us build it up.'}</h2><p class="muted">${x.correct} of ${x.total} right. Here is where to start.</p><div class="gain"><span>+${x.xpGain} XP</span><span>🪙 ${x.coins}</span></div></div>
 <div style="margin:14px 0"><button class="btn primary" data-act="stop" data-v="${CHAPTERS[0].id}">Start learning</button><button class="btn line" data-act="home" style="margin-top:10px">Back to town</button></div>
 <div class="card"><h3>Where to focus</h3>${by.map(r=>{const p=Math.round(r.v[0]/r.v[1]*100);return `<div class="prerow"><span>${r.c.icon} ${esc(r.c.name)}</span><span class="track"><b style="width:${p}%"></b></span><small>${r.v[0]}/${r.v[1]}</small></div>`}).join('')}</div></div>`}
const pretestCard=()=>{const p=S.pre&&S.pre.n?S.pre:null;
 return `<div class="card"><h3>Pretest</h3><p class="muted" style="margin:0 0 12px">${p?`Your starting score was ${Math.round(p.s/p.n*100)}% (${p.s} of ${p.n}). Retake it to see how far you have come.`:'A mixed set of questions to see where you start. No stars, no pressure.'}</p><button class="btn small ghost" data-act="pretest">${p?'Retake the pretest':'Take the pretest'}</button></div>`};
const testTab=()=>examTab()+pretestCard()+reviewTab();

/* ---------- reminder opt out ---------- */
Object.assign(acts,{remindoff:()=>{S.remind=false;save();toast('Reminders are off. Turn them back on in Me.');render()},remindon:()=>{S.remind=true;save();toast('Reminders are on.');render()}});
const remindCard=()=>`<div class="card"><h3>Reminders</h3><p class="muted" style="margin:0 0 10px">${S.remind===false?'Off. You will not see a nudge when you have been away.':'If you are away for 2 days, Town shows a welcome back note. It stays in the app.'}</p><button class="btn small ${S.remind===false?'primary':'line'}" data-act="${S.remind===false?'remindon':'remindoff'}">${S.remind===false?'Turn reminders on':'Turn reminders off'}</button></div>`;

/* ---------- the drive ---------- */
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
function parkCar(){
 const road=document.querySelector('.road');if(!road)return;const stops=road.querySelectorAll('.stop');if(!stops.length)return;
 let car=road.querySelector('.rcar');if(!car){car=document.createElement('div');car.className='rcar';car.setAttribute('aria-hidden','true');road.appendChild(car)}
 car.innerHTML=carSVG(AV_(),'rcsvg');
 const y=i=>stops[i].offsetTop+stops[i].offsetHeight/2-car.offsetHeight/2;
 const nx=nextStop(),idx=nx?CHAPTERS.indexOf(nx):0;
 if(S.at==null||S.at>=stops.length){S.at=idx;save()}
 const d=ui.drive;
 if(d&&d.to>d.from&&!reduced()){
  ui.drive=null;car.style.transform=`translateY(${y(d.from)}px)`;
  const scrollTo=Math.max(0,stops[d.from].getBoundingClientRect().top+window.scrollY-220);window.scrollTo(0,scrollTo);
  const a=car.animate([{transform:`translateY(${y(d.from)}px)`},{transform:`translateY(${y(d.to)}px)`}],{duration:Math.min(2600,700+(d.to-d.from)*650),delay:350,easing:'cubic-bezier(.45,.05,.3,1)',fill:'forwards'});
  car.classList.add('driving');
  const follow=()=>{if(!car.isConnected||a.playState==='finished')return;const r=car.getBoundingClientRect();if(r.bottom>innerHeight-130||r.top<140)window.scrollBy(0,r.top+r.height/2-innerHeight/2>0?6:-6);requestAnimationFrame(follow)};requestAnimationFrame(follow);
  a.onfinish=()=>{car.classList.remove('driving');car.style.transform=`translateY(${y(d.to)}px)`;S.at=d.to;save();stops[d.to].classList.add('arrive');setTimeout(()=>stops[d.to]&&stops[d.to].classList.remove('arrive'),900)};
 }else{ui.drive=null;car.style.transform=`translateY(${y(S.at)}px)`;if(d&&d.to>d.from){S.at=d.to;save();car.style.transform=`translateY(${y(S.at)}px)`}}
}
window.addEventListener('resize',()=>{if(!ui.run&&!ui.lesson&&!ui.result&&ui.tab==='road')parkCar()});

/* hook into the app */
const _render=render;
render=function(){_render();{const g=document.querySelector('.gchips .gc.on');if(g){const r=g.parentElement;r.scrollLeft=Math.max(0,g.offsetLeft-r.clientWidth/2+g.offsetWidth/2)}}if(!ui.run&&!ui.lesson&&!ui.result&&!ui.notes&&!ui.ob&&ui.tab==='road')parkCar()};
if(!S.avatar&&!S.runs&&!ui.ob)ui.ob={step:0};
else if(!S.avatar&&S.runs)ui.ob={step:0};
syncPlayer();
render();
