'use strict';
/* Avatar, car, garage store, onboarding, pretest and the drive between stops. Loaded after app.js and games.js. */
const SKIN={s1:'#f9d9bd',s2:'#f1c27d',s3:'#d9a066',s4:'#b97a4b',s5:'#8d5524',s6:'#5c3a21'};
const HAIRC={black:'#1d1a1a',brown:'#5a3a22',blonde:'#e0b45a',auburn:'#8a3b24',red:'#c2410c',grey:'#a8a8b3',pink:'#ff6fae',blue:'#3b82f6',green:'#22c55e',purple:'#8b5cf6'};
const EYEC={brown:'#6b3f1d',blue:'#3b82f6',green:'#3f9b5e',hazel:'#a1742f',grey:'#7b8794',violet:'#8b5cf6'};
const TOPC={blue:'#2f80ed',red:'#e5383b',green:'#19a974',yellow:'#ffc61a',purple:'#9b5de5',orange:'#ff8a4c',white:'#f3f4f6',black:'#2b2f3a'};
const CARC={red:'#e5383b',blue:'#2f80ed',white:'#f3f4f6',black:'#2b2f3a',yellow:'#ffc61a',green:'#19a974',silver:'#aab2bf',orange:'#ff8a4c',pink:'#ff6fae',gold:'#d9a520'};
const MODELS={hatch:{by:48,bh:38,ct:12,ci:26,wh:28},sedan:{by:54,bh:32,ct:20,ci:24,wh:26},suv:{by:42,bh:46,ct:6,ci:20,wh:32},truck:{by:40,bh:50,ct:8,ci:22,wh:34},sport:{by:60,bh:26,ct:30,ci:32,wh:22}};
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
const sw=(map,p0,paid)=>Object.keys(map).map(k=>({id:k,n:cap(k),c:map[k],p:paid.includes(k)?p0:0}));
/* categories: key is the field on the avatar. kind picks the preview crop. */
const CATS=[
 {key:'hairStyle',label:'Hair',kind:'head',items:[{id:'short',n:'Short',p:0},{id:'long',n:'Long',p:0},{id:'ponytail',n:'Ponytail',p:0},{id:'bun',n:'Bun',p:30},{id:'curly',n:'Curly',p:30},{id:'bob',n:'Bob',p:30},{id:'buzz',n:'Buzz',p:30}]},
 {key:'hairColor',label:'Hair color',kind:'swatch',items:sw(HAIRC,40,['pink','blue','green','purple'])},
 {key:'skin',label:'Skin',kind:'swatch',items:Object.keys(SKIN).map((k,i)=>({id:k,n:'Tone '+(i+1),c:SKIN[k],p:0}))},
 {key:'eyes',label:'Eyes',kind:'swatch',items:sw(EYEC,0,[])},
 {key:'glasses',label:'Glasses',kind:'head',items:[{id:'none',n:'None',p:0},{id:'round',n:'Round',p:25},{id:'square',n:'Square',p:25},{id:'shades',n:'Shades',p:40},{id:'heart',n:'Hearts',p:60}]},
 {key:'hat',label:'Hats',kind:'head',items:[{id:'none',n:'None',p:0},{id:'cap',n:'Cap',p:30},{id:'beanie',n:'Beanie',p:30},{id:'bow',n:'Big bow',p:30},{id:'headband',n:'Headband',p:25},{id:'crown',n:'Crown',p:150}]},
 {key:'outfit',label:'Clothes',kind:'body',items:[{id:'tee',n:'Tee and jeans',p:0},{id:'hoodie',n:'Hoodie',p:60},{id:'polo',n:'Polo',p:50},{id:'dress',n:'Sundress',p:70},{id:'varsity',n:'Varsity jacket',p:90},{id:'fjh',n:'FJH cheer',p:40},{id:'racing',n:'Race suit',p:150}]},
 {key:'top',label:'Top color',kind:'swatch',items:sw(TOPC,0,[])},
 {key:'car',label:'Car',kind:'car',items:[{id:'hatch',n:'Hatchback',p:0},{id:'sedan',n:'Sedan',p:100},{id:'suv',n:'SUV',p:160},{id:'truck',n:'Truck',p:200},{id:'sport',n:'Sports car',p:300}]},
 {key:'carColor',label:'Car color',kind:'swatch',items:sw(CARC,40,['pink','gold'])},
 {key:'up',label:'Upgrades',kind:'car',multi:true,items:[{id:'stripes',n:'Racing stripes',p:50},{id:'rims',n:'Gold rims',p:70},{id:'spoiler',n:'Spoiler',p:60},{id:'glow',n:'Underglow',p:90}]}
];
const DEFAV={name:'',skin:'s2',hairStyle:'short',hairColor:'brown',eyes:'brown',glasses:'none',hat:'none',outfit:'tee',top:'blue',car:'hatch',carColor:'red',up:[]};
const catOf=k=>CATS.find(c=>c.key===k);
const itemOf=(k,id)=>catOf(k).items.find(i=>i.id===id);
const owns=(k,id)=>{const it=itemOf(k,id);return !it||it.p===0||!!(S.own&&S.own[k+':'+id])};
const AV_=()=>Object.assign({},DEFAV,S.avatar||{});

/* ---------- character drawing ---------- */
function hairBack(st,c){
 if(st==='long')return `<path d="M24 46 Q14 98 30 114 L70 114 Q86 98 76 46Z" fill="${c}"/>`;
 if(st==='bob')return `<path d="M23 46 Q17 82 32 88 L68 88 Q83 82 77 46Z" fill="${c}"/>`;
 if(st==='ponytail')return `<path d="M70 34 Q98 38 92 84 Q82 60 68 50Z" fill="${c}"/><rect x="66" y="34" width="8" height="9" rx="3" fill="#ff6fae"/>`;
 if(st==='bun')return `<circle cx="50" cy="15" r="12" fill="${c}"/><rect x="42" y="22" width="16" height="5" rx="2" fill="#ff6fae"/>`;
 return ''}
function hairFront(st,c){
 if(st==='buzz')return `<path d="M26 44 Q26 24 50 23 Q74 24 74 44 Q70 32 50 31 Q30 32 26 44Z" fill="${c}" opacity=".85"/>`;
 if(st==='curly')return [[32,32],[42,25],[54,24],[65,30],[27,43],[73,43],[50,30]].map(p=>`<circle cx="${p[0]}" cy="${p[1]}" r="10" fill="${c}"/>`).join('');
 return `<path d="M24 50 Q20 18 50 17 Q80 18 76 50 Q73 34 62 31 Q50 40 38 31 Q27 34 24 50Z" fill="${c}"/>`}
function hatSVG(h,a){
 if(h==='cap')return `<path d="M23 38 Q25 11 51 11 Q77 13 77 38Z" fill="#e5383b"/><path d="M68 36 Q94 36 96 43 Q80 46 68 42Z" fill="#b82a2d"/><circle cx="51" cy="12" r="3" fill="#b82a2d"/>`;
 if(h==='beanie')return `<path d="M23 38 Q22 8 50 8 Q78 8 77 38Z" fill="#9b5de5"/><rect x="21" y="32" width="58" height="9" rx="4" fill="#7c3fc7"/><circle cx="50" cy="6" r="6" fill="#fff"/>`;
 if(h==='bow')return `<path d="M62 22 L86 8 L86 36Z" fill="#0b7a3b"/><path d="M62 22 L38 8 L38 36Z" fill="#0b7a3b"/><circle cx="62" cy="22" r="6" fill="#9aa0a6"/>`;
 if(h==='headband')return `<path d="M25 40 Q50 14 75 40" stroke="${a}" stroke-width="7" fill="none" stroke-linecap="round"/>`;
 if(h==='crown')return `<path d="M30 30 L32 8 L42 20 L50 4 L58 20 L68 8 L70 30Z" fill="#ffc61a" stroke="#d9a200" stroke-width="2"/><circle cx="50" cy="22" r="3" fill="#e5383b"/>`;
 return ''}
function glassesSVG(g){
 if(g==='round')return `<g fill="#ffffff22" stroke="#14161b" stroke-width="2"><circle cx="40" cy="54" r="8.5"/><circle cx="60" cy="54" r="8.5"/><path d="M48.5 54 H51.5"/></g>`;
 if(g==='square')return `<g fill="#ffffff22" stroke="#14161b" stroke-width="2"><rect x="31" y="47" width="17" height="14" rx="3"/><rect x="52" y="47" width="17" height="14" rx="3"/><path d="M48 53 H52"/></g>`;
 if(g==='shades')return `<g fill="#14161b"><rect x="30" y="47" width="19" height="13" rx="5"/><rect x="51" y="47" width="19" height="13" rx="5"/><rect x="48" y="50" width="4" height="3"/></g>`;
 if(g==='heart')return `<g fill="#ff6fae" stroke="#c2255c" stroke-width="1.5"><path d="M40 62 L31 53 Q30 46 36 47 Q40 48 40 51 Q40 48 44 47 Q50 46 49 53Z"/><path d="M60 62 L51 53 Q50 46 56 47 Q60 48 60 51 Q60 48 64 47 Q70 46 69 53Z"/></g>`;
 return ''}
function legsJeans(col){return `<rect x="28" y="134" width="20" height="30" fill="${col}"/><rect x="52" y="134" width="20" height="30" fill="${col}"/><path d="M50 136 V164" stroke="#0003" stroke-width="1.5"/><ellipse cx="38" cy="167" rx="12" ry="5" fill="#f3f4f6"/><ellipse cx="62" cy="167" rx="12" ry="5" fill="#f3f4f6"/>`}
function outfitSVG(o,top,skin){
 const T=TOPC[top]||TOPC.blue,torso=(f)=>`<path d="M16 138 Q16 92 50 90 Q84 92 84 138Z" fill="${f}"/>`,
  arm=(f,len)=>`<rect x="8" y="94" width="14" height="${len}" rx="7" fill="${f}"/><rect x="78" y="94" width="14" height="${len}" rx="7" fill="${f}"/>`,
  hands=`<circle cx="15" cy="138" r="6" fill="${skin}"/><circle cx="85" cy="138" r="6" fill="${skin}"/>`;
 if(o==='fjh')return `<rect x="30" y="148" width="14" height="14" fill="${skin}"/><rect x="56" y="148" width="14" height="14" fill="${skin}"/><rect x="30" y="158" width="14" height="8" fill="#f3f4f6"/><rect x="56" y="158" width="14" height="8" fill="#f3f4f6"/><ellipse cx="37" cy="168" rx="11" ry="4.5" fill="#f3f4f6"/><ellipse cx="63" cy="168" rx="11" ry="4.5" fill="#f3f4f6"/>
  <path d="M20 128 L80 128 L87 154 L13 154Z" fill="#9aa0a6"/><path d="M13 154 L87 154 L87 150 L14 150Z" fill="#0b7a3b"/><path d="M34 128 L30 154 M44 128 L42 154 M56 128 L58 154 M66 128 L70 154" stroke="#0003" stroke-width="1.2"/>
  ${arm('#0b7a3b',20)}<rect x="8" y="114" width="14" height="22" rx="7" fill="${skin}"/><rect x="78" y="114" width="14" height="22" rx="7" fill="${skin}"/>
  <path d="M17 134 Q17 92 50 90 Q83 92 83 134Z" fill="#0b7a3b"/><path d="M17 134 Q17 100 27 94 L35 134Z" fill="#9aa0a6"/><path d="M83 134 Q83 100 73 94 L65 134Z" fill="#9aa0a6"/>
  <text x="50" y="118" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="17" fill="#f3f4f6" stroke="#0b7a3b" stroke-width=".6">FJH</text>
  <circle cx="14" cy="138" r="9" fill="#0b7a3b"/><circle cx="14" cy="138" r="5" fill="#9aa0a6"/><circle cx="86" cy="138" r="9" fill="#9aa0a6"/><circle cx="86" cy="138" r="5" fill="#0b7a3b"/>`;
 if(o==='dress')return `<rect x="32" y="148" width="12" height="18" fill="${skin}"/><rect x="56" y="148" width="12" height="18" fill="${skin}"/><ellipse cx="38" cy="168" rx="10" ry="4" fill="#d9a520"/><ellipse cx="62" cy="168" rx="10" ry="4" fill="#d9a520"/>
  ${arm(skin,42)}<path d="M26 96 Q50 90 74 96 L78 114 L22 114Z" fill="#ffd166"/><path d="M24 112 L76 112 L90 152 L10 152Z" fill="#ffd166"/><circle cx="30" cy="130" r="2.5" fill="#fff8"/><circle cx="50" cy="142" r="2.5" fill="#fff8"/><circle cx="70" cy="128" r="2.5" fill="#fff8"/><path d="M34 98 V90 M66 98 V90" stroke="#ffd166" stroke-width="4"/>${hands}`;
 if(o==='racing')return `<rect x="28" y="134" width="20" height="30" fill="#e5383b"/><rect x="52" y="134" width="20" height="30" fill="#e5383b"/><rect x="26" y="156" width="24" height="12" rx="4" fill="#14161b"/><rect x="50" y="156" width="24" height="12" rx="4" fill="#14161b"/>
  ${arm('#e5383b',42)}${torso('#e5383b')}<rect x="47" y="92" width="6" height="46" fill="#f3f4f6"/><rect x="28" y="128" width="44" height="6" fill="#14161b"/><circle cx="15" cy="138" r="6" fill="#14161b"/><circle cx="85" cy="138" r="6" fill="#14161b"/>`;
 if(o==='varsity')return legsJeans('#3b5b9d')+arm('#0b7a3b',42)+torso('#c9ced6')+`<path d="M16 138 L84 138 L84 130 L16 130Z" fill="#0b7a3b"/><path d="M38 92 Q50 104 62 92 L62 98 Q50 108 38 98Z" fill="#0b7a3b"/><text x="36" y="118" font-family="Arial Black,Arial" font-weight="900" font-size="15" fill="#0b7a3b">F</text><path d="M50 98 V130" stroke="#0004" stroke-width="1.5"/>${hands}`;
 if(o==='polo')return `<rect x="28" y="134" width="20" height="30" fill="#c9b48a"/><rect x="52" y="134" width="20" height="30" fill="#c9b48a"/><path d="M50 136 V164" stroke="#0003" stroke-width="1.5"/><ellipse cx="38" cy="167" rx="12" ry="5" fill="#6b4f3a"/><ellipse cx="62" cy="167" rx="12" ry="5" fill="#6b4f3a"/>${arm(skin,40)}<rect x="8" y="94" width="14" height="18" rx="7" fill="#7dc4e4"/><rect x="78" y="94" width="14" height="18" rx="7" fill="#7dc4e4"/>${torso('#7dc4e4')}<path d="M38 91 L50 104 L62 91 L58 88 L50 96 L42 88Z" fill="#fff"/><rect x="49" y="100" width="2" height="16" fill="#fff"/>${hands}`;
 if(o==='hoodie')return legsJeans('#3b5b9d')+arm(T,42)+torso(T)+`<path d="M34 92 Q50 112 66 92 Q50 100 34 92Z" fill="#0004"/><rect x="32" y="116" width="36" height="16" rx="7" fill="#0003"/><path d="M44 96 V110 M56 96 V110" stroke="#fff" stroke-width="2"/>${hands}`;
 return legsJeans('#3b5b9d')+arm(skin,42)+`<rect x="8" y="94" width="14" height="18" rx="7" fill="${T}"/><rect x="78" y="94" width="14" height="18" rx="7" fill="${T}"/>`+torso(T)+`<path d="M40 91 Q50 100 60 91" stroke="#0003" stroke-width="2" fill="none"/>`+hands}
function faceParts(av,skin,hc,ec){
 const dark=hc;
 return `<circle cx="25.5" cy="57" r="4.8" fill="${skin}"/><circle cx="74.5" cy="57" r="4.8" fill="${skin}"/><ellipse cx="50" cy="53" rx="25.5" ry="25" fill="${skin}"/>
 <ellipse cx="30.5" cy="67" rx="6.5" ry="4" fill="#ff7aa2" opacity=".5"/><ellipse cx="69.5" cy="67" rx="6.5" ry="4" fill="#ff7aa2" opacity=".5"/>
 ${hairFront(av.hairStyle,hc)}
 <g><ellipse cx="38.5" cy="56" rx="6" ry="7" fill="#fff"/><ellipse cx="61.5" cy="56" rx="6" ry="7" fill="#fff"/><ellipse cx="38.5" cy="57" rx="4.9" ry="5.7" fill="${ec}"/><ellipse cx="61.5" cy="57" rx="4.9" ry="5.7" fill="${ec}"/><ellipse cx="38.5" cy="57.4" rx="2.7" ry="3.2" fill="#14161b"/><ellipse cx="61.5" cy="57.4" rx="2.7" ry="3.2" fill="#14161b"/><circle cx="36.6" cy="54.2" r="2.1" fill="#fff"/><circle cx="59.6" cy="54.2" r="2.1" fill="#fff"/><circle cx="40.6" cy="60" r="1" fill="#fff"/><circle cx="63.6" cy="60" r="1" fill="#fff"/></g>
 <path d="M31.5 50 Q33 47.5 36 47.2 M68.5 50 Q67 47.5 64 47.2" stroke="#14161b" stroke-width="1.8" fill="none" stroke-linecap="round"/>
 <path d="M34 46.5 Q38.5 44 43 46.5 M57 46.5 Q61.5 44 66 46.5" stroke="${dark}" stroke-width="1.8" fill="none" stroke-linecap="round" opacity=".8"/>
 <circle cx="50" cy="64" r="1.1" fill="#0003"/><path d="M45 69 Q50 77 55 69Z" fill="#b83a5c" stroke="#b83a5c" stroke-width="1.2" stroke-linejoin="round"/><ellipse cx="50" cy="72.6" rx="2.6" ry="1.5" fill="#ff8fa8"/>
 ${glassesSVG(av.glasses)}${hatSVG(av.hat,av.top?TOPC[av.top]:'#2f80ed')}`}
const HT='translate(0 28) translate(50 52) scale(1.34) translate(-50 -52)',BT='translate(50 172) scale(.74 .68) translate(-50 -172)';
function charBody(av,mode){
 const skin=SKIN[av.skin]||SKIN.s2,hc=HAIRC[av.hairColor]||HAIRC.brown,ec=EYEC[av.eyes]||EYEC.brown;
 if(mode==='head')return `${hairBack(av.hairStyle,hc)}${faceParts(av,skin,hc,ec)}`;
 return `<g transform="${HT}">${hairBack(av.hairStyle,hc)}</g><g transform="${BT}">${outfitSVG(av.outfit,av.top,skin)}</g><g transform="${HT}">${faceParts(av,skin,hc,ec)}</g>`}
const avatarSVG=(av,vb,cls)=>`<svg class="${cls||'avsvg'}" viewBox="${vb||'0 0 100 172'}" role="img" aria-label="Your character" xmlns="http://www.w3.org/2000/svg">${charBody(av)}</svg>`;
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
 <circle cx="26" cy="${m.by+13}" r="8.5" fill="#fff" stroke="#14161b" stroke-width="2"/><circle cx="94" cy="${m.by+13}" r="8.5" fill="#fff" stroke="#14161b" stroke-width="2"/><circle cx="27.5" cy="${m.by+14.5}" r="4.4" fill="#14161b"/><circle cx="95.5" cy="${m.by+14.5}" r="4.4" fill="#14161b"/><circle cx="25.5" cy="${m.by+11}" r="1.8" fill="#fff"/><circle cx="93.5" cy="${m.by+11}" r="1.8" fill="#fff"/><ellipse cx="16" cy="${m.by+27}" rx="6" ry="3.4" fill="#ff7aa2" opacity=".55"/><ellipse cx="104" cy="${m.by+27}" rx="6" ry="3.4" fill="#ff7aa2" opacity=".55"/>
 <path d="M48 ${gy-16} Q60 ${gy-4} 72 ${gy-16}" stroke="#14161b" stroke-width="3.4" fill="none" stroke-linecap="round"/>
 <rect x="16" y="${gy-7}" width="88" height="6" rx="3" fill="#14161b" opacity=".4"/></svg>`}

/* ---------- state helpers ---------- */
function syncPlayer(){const a=AV_();PLAYER=Object.assign(PLAYER,{color:CARC[a.carColor]||PLAYER.color,skin:SKIN[a.skin],hair:HAIRC[a.hairColor],shirt:a.outfit==='fjh'?'#0b7a3b':a.outfit==='racing'?'#e5383b':TOPC[a.top]})}
function ensureAvatar(){if(!S.avatar){S.avatar=Object.assign({},DEFAV);S.own=S.own||{};if(!(S.coins>0))S.coins=50}return S.avatar}
const tryAv=()=>Object.assign({},AV_(),ui.gx&&ui.gx.t||{});
const ownedAll=av=>CATS.every(c=>c.multi?(av[c.key]||[]).every(id=>owns(c.key,id)):owns(c.key,av[c.key]));
const priceOf=av=>CATS.reduce((a,c)=>a+(c.multi?(av[c.key]||[]).filter(id=>!owns(c.key,id)).reduce((s,id)=>s+itemOf(c.key,id).p,0):(owns(c.key,av[c.key])?0:itemOf(c.key,av[c.key]).p)),0);

/* ---------- garage ---------- */
function tile(c,it,av){
 const sel=c.multi?(av[c.key]||[]).includes(it.id):av[c.key]===it.id,own=owns(c.key,it.id);
 let pv='';
 if(c.kind==='swatch')pv=`<i class="swatch" style="background:${it.c}"></i>`;
 else if(c.kind==='head')pv=avatarSVG(Object.assign({},av,{[c.key]:it.id}),'-2 8 104 104','tpv');
 else if(c.kind==='body')pv=avatarSVG(Object.assign({},av,{[c.key]:it.id,hat:'none'}),'0 8 100 164','tpv tall');
 else{const nv=c.multi?(av[c.key]||[]).includes(it.id)?(av[c.key]||[]).filter(x=>x!==it.id):[...(av[c.key]||[]),it.id]:it.id;pv=carSVG(Object.assign({},av,{[c.key]:c.multi?[it.id]:nv}),'tpv')}
 return `<button class="gt ${sel?'sel':''} ${own?'':'lk'}" data-act="gpick" data-k="${c.key}" data-v="${it.id}" aria-pressed="${sel}" aria-label="${esc(it.n)}${own?'':', '+it.p+' coins'}"><span class="gpv">${pv}</span><b>${esc(it.n)}</b><small>${own?(sel?'Wearing':'Owned'):'🪙 '+it.p}</small></button>`}
function garageView(onb){
 ui.gx=ui.gx||{c:'hairStyle',t:{}};const av=tryAv(),c=catOf(ui.gx.c),cost=priceOf(av),dirty=Object.keys(ui.gx.t).length>0,coins=S.coins||0;
 const bar=dirty?`<div class="gbar"><div class="muted">${cost?`Costs 🪙 ${cost}${cost>coins?`. You need ${cost-coins} more. Win games to earn them.`:''}`:'Your items'}</div><div class="row" style="gap:8px"><button class="btn small line" data-act="gundo" style="flex:1">Undo</button><button class="btn small primary" data-act="gsave" style="flex:2" ${cost>coins?'disabled style="opacity:.45"':''}>${cost?'Buy and wear':'Wear it'}</button></div></div>`:'';
 return `${onb?'':'<h2>Garage</h2>'}<div class="gprev"><div class="gp1">${avatarSVG(av,'0 8 100 164','avbig')}</div><div class="gp2">${carSVG(av,'carbig')}<span class="gname">${esc(S.avatar&&S.avatar.name||'')}</span></div></div>
 <div class="gchips" role="tablist">${CATS.map(x=>`<button role="tab" aria-selected="${x.key===c.key}" class="gc ${x.key===c.key?'on':''}" data-act="gcat" data-v="${x.key}">${x.label}</button>`).join('')}</div>
 <div class="ggrid ${c.kind==='swatch'?'sw':''}">${c.items.map(it=>tile(c,it,av)).join('')}</div>${bar}`}
const garageTab=()=>garageView(false);
Object.assign(acts,{
 gcat:v=>{ui.gx=ui.gx||{c:v,t:{}};ui.gx.c=v;render()},
 gundo:()=>{ui.gx.t={};render()},
 gsave:()=>{const av=tryAv(),cost=priceOf(av);if(cost>(S.coins||0)){toast('Not enough coins yet. Win games to earn more.');return}
  S.coins-=cost;S.own=S.own||{};CATS.forEach(c=>{(c.multi?av[c.key]:[av[c.key]]).forEach(id=>{S.own[c.key+':'+id]=1})});
  S.avatar=Object.assign({},S.avatar,av,{name:S.avatar.name});ui.gx.t={};syncPlayer();save();toast(cost?'Bought. Looking good.':'Saved');render()}
});
/* tile clicks carry two data attributes, so handle them in the global click flow */
document.addEventListener('click',e=>{const b=e.target.closest('[data-act="gpick"]');if(!b)return;e.stopPropagation();
 const k=b.dataset.k,id=b.dataset.v,c=catOf(k);ui.gx=ui.gx||{c:k,t:{}};const cur=AV_();
 if(c.multi){const base=ui.gx.t[k]||(cur[k]||[]).slice();const i=base.indexOf(id);i>=0?base.splice(i,1):base.push(id);ui.gx.t[k]=base;
  if(JSON.stringify(base.slice().sort())===JSON.stringify((cur[k]||[]).slice().sort()))delete ui.gx.t[k]}
 else{if(cur[k]===id)delete ui.gx.t[k];else ui.gx.t[k]=id}
 render()},true);

/* ---------- onboarding ---------- */
function obView(){const o=ui.ob;
 if(o.step===0)return `<div class="ob"><div class="obc"><div class="obic">🚘</div><h2>Welcome to Permit Quest</h2><p class="muted">Learn the rules of the road, play games, and build your own driver and car.</p><label class="lab" for="obn">What should we call you?</label><input id="obn" class="inp" maxlength="20" autocomplete="given-name" autocapitalize="words" enterkeyhint="done" placeholder="First name" value="${esc(S.avatar&&S.avatar.name||'')}"><button class="btn primary" data-act="obname" style="margin-top:14px">Next</button></div></div>`;
 if(o.step===1)return `<div class="ob2"><div class="obtop"><b>Build your driver</b><span class="muted">You start with 🪙 ${S.coins||0} to spend</span></div>${garageView(true)}${ui.gx&&Object.keys(ui.gx.t).length?'':'<div class="foot ob-foot"><button class="btn primary" data-act="obdone">Looks good</button><div class="muted" style="text-align:center;margin-top:6px">You can change this any time in the Garage</div></div>'}</div>`;
 return `<div class="ob"><div class="obc"><div class="carbox">${carSVG(AV_(),'carbig')}</div><h2>${esc(S.avatar.name||'Driver')}, see where you start</h2><p class="muted">Take a quick 20 question pretest. There are no stars and no pressure. It shows which topics to study first.</p><button class="btn primary" data-act="pretest">Take the pretest</button><button class="btn line" data-act="obskip" style="margin-top:10px">Skip for now</button></div></div>`}
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
 return `<div style="max-width:560px;margin:0 auto;padding:calc(28px + env(safe-area-inset-top)) 16px calc(32px + env(safe-area-inset-bottom))"><div class="center"><p class="eyebrow">Your starting point</p><div class="big pop">${pct}%</div><h2 style="margin-top:10px">${pct>=80?'You already know a lot':pct>=50?'A solid start':'A fresh start. Let us build it up.'}</h2><p class="muted">${x.correct} of ${x.total} right. The real test needs 80%.</p><div class="gain"><span>+${x.xpGain} XP</span><span>🪙 ${x.coins}</span></div></div>
 <div style="margin:14px 0"><button class="btn primary" data-act="stop" data-v="${CHAPTERS[0].id}">Start learning</button><button class="btn line" data-act="home" style="margin-top:10px">Back to the road</button></div>
 <div class="card"><h3>Where to focus</h3>${by.map(r=>{const p=Math.round(r.v[0]/r.v[1]*100);return `<div class="prerow"><span>${r.c.icon} ${esc(r.c.name)}</span><span class="track"><b style="width:${p}%"></b></span><small>${r.v[0]}/${r.v[1]}</small></div>`}).join('')}</div></div>`}
const pretestCard=()=>{const p=S.pre&&S.pre.n?S.pre:null;
 return `<div class="card"><h3>Pretest</h3><p class="muted" style="margin:0 0 12px">${p?`Your starting score was ${Math.round(p.s/p.n*100)}% (${p.s} of ${p.n}). Retake it to see how far you have come.`:'20 mixed questions to see where you start. No stars, no pressure.'}</p><button class="btn small ghost" data-act="pretest">${p?'Retake the pretest':'Take the pretest'}</button></div>`};
const testTab=()=>examTab()+pretestCard()+reviewTab();

/* ---------- reminder opt out ---------- */
Object.assign(acts,{remindoff:()=>{S.remind=false;save();toast('Reminders are off. Turn them back on in Me.');render()},remindon:()=>{S.remind=true;save();toast('Reminders are on.');render()}});
const remindCard=()=>`<div class="card"><h3>Reminders</h3><p class="muted" style="margin:0 0 10px">${S.remind===false?'Off. You will not see a nudge when you have been away.':'If you are away for 2 days, the Road shows a welcome back note. It stays in the app.'}</p><button class="btn small ${S.remind===false?'primary':'line'}" data-act="${S.remind===false?'remindon':'remindoff'}">${S.remind===false?'Turn reminders on':'Turn reminders off'}</button></div>`;

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
render=function(){_render();if(!ui.run&&!ui.lesson&&!ui.result&&!ui.notes&&!ui.ob&&ui.tab==='road')parkCar()};
if(!S.avatar&&!S.runs&&!ui.ob)ui.ob={step:0};
else if(!S.avatar&&S.runs)ui.ob={step:0};
syncPlayer();
render();
