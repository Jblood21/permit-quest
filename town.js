'use strict';
/* Town: the Sims-like neighborhood that replaces the Road tab.
   Loads after avatar.js and cars.js. Overrides roadTab, parkCar and wraps finish and a few acts.
   State: S.gotCar (bool), S.carSeen (bool, first-car card shown), S.pos ('home'|'school'|'ch'), S.at (chapter index, existing).
   Hooks: window.townGo(chapterId,{start}), window.townGrantCar(), window.townFocus(). */
(function(){
var NS='http://www.w3.org/2000/svg',W=390,GAP=170,Y0=602;
var moving=false,G=null;
var rm=function(){return matchMedia('(prefers-reduced-motion: reduce)').matches};
var q$=function(s,r){return (r||document).querySelector(s)};

/* ---------- state ---------- */
function migrate(){
 var ch=false;
 if(S.pos===undefined){
  var any=totalStars()>0;
  S.pos=any?'ch':'home';
  if(any){S.gotCar=true;S.carSeen=true;S.own=S.own||{};S.own['car:clunker']=true;ch=true}
  if(S.at==null||S.at>=CHAPTERS.length){var nx=nextStop();S.at=nx?CHAPTERS.indexOf(nx):0;ch=true}
  ch=true}
 if(S.gotCar===undefined){S.gotCar=false;ch=true}
 if(S.gotCar&&S.carSeen===undefined){S.carSeen=true;ch=true}
 if(S.pos==='ch'&&(S.at==null||S.at>=CHAPTERS.length)){S.at=0;ch=true}
 if(ch)save()}
function grantCar(){
 if(S.gotCar)return;
 S.gotCar=true;S.carSeen=false;S.own=S.own||{};S.own['car:clunker']=true;
 S.avatar=S.avatar||{};S.avatar.car='clunker'; /* first car is always the clunker; anything already owned stays owned */
 save()}
window.townGrantCar=grantCar;
var _fin=finish;
finish=function(){var had=!!S.gotCar;_fin.apply(this,arguments);if(!had&&totalStars()>0)grantCar()};

/* ---------- geometry ---------- */
function geom(){
 var L=[{k:'home',rx:105,ry:470,bx:100,top:302},{k:'school',rx:285,ry:470,bx:290,top:302}];
 CHAPTERS.forEach(function(c,i){var ev=i%2===0,y=Y0+GAP*i;L.push({k:'ch',i:i,id:c.id,rx:ev?130:260,ry:y+8,bx:ev?325:65,top:y-118+(i===0?70:0)}) /* buildings sit wide of the road so a car never clips a corner; the first one drops below the school bend */});
 var last=L[L.length-1],fin={k:'fin',rx:195,ry:last.ry+150,bx:195,top:last.ry+60};
 var H=Math.round(fin.ry+110);
 var all=L.concat([fin]),segs=[];
 for(var j=1;j<all.length;j++)segs.push(seg(all[j-1],all[j]));
 return {L:L,fin:fin,all:all,segs:segs,H:H}}
function seg(a,b){var ym=(a.ry+b.ry)/2;return {a:a,b:b,p:[[a.rx,a.ry],[a.rx,ym],[b.rx,ym],[b.rx,b.ry]]}}
function bez(p,t){var u=1-t,a=u*u*u,b=3*u*u*t,c=3*u*t*t,d=t*t*t;return [a*p[0][0]+b*p[1][0]+c*p[2][0]+d*p[3][0],a*p[0][1]+b*p[1][1]+c*p[2][1]+d*p[3][1]]}
function route(a,b){
 var pts=[],lo=Math.min(a,b),hi=Math.max(a,b);
 for(var s=lo;s<hi;s++){var p=G.segs[s].p,n=26;for(var t=0;t<=n;t++){if(s>lo&&t===0)continue;pts.push(bez(p,t/n))}}
 if(a>b)pts.reverse();
 if(!pts.length)pts.push([G.all[a].rx,G.all[a].ry]);
 return pts}
function curLoc(){return S.pos==='school'?1:S.pos==='ch'?2+Math.min(S.at||0,CHAPTERS.length-1):0}

/* ---------- art ---------- */
var C={ink:'#3b2168',lav:'#e8dcf8',lav2:'#f4eefc',lav3:'#cdb8f0',pur:'#6b3fb0',purD:'#4f2c8a',pink:'#f7b8d6',pinkD:'#b3336e',grn:'#17674a',grnL:'#8fd0a5',paint:'#ffc61a',gry:'#aab2bf',wht:'#fff',sky:'#d6ecff',cream:'#fff7ee',asph:'#5b4a84'};
var SH='<ellipse cx="50" cy="79" rx="44" ry="5" fill="#3b216822"/>';
function win(x,y,w,h,f){return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="1.5" fill="'+(f||C.sky)+'" stroke="'+C.purD+'" stroke-width="1.2"/><path d="M'+(x+w/2)+' '+y+'v'+h+'M'+x+' '+(y+h/2)+'h'+w+'" stroke="'+C.purD+'" stroke-width=".8"/>'}
function door(x,y,w,h,f){return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+Math.min(w/2,4)+'" fill="'+(f||C.purD)+'"/><circle cx="'+(x+w-3)+'" cy="'+(y+h/2)+'" r="1.2" fill="'+C.paint+'"/>'}
function cols(xs,y,h){return xs.map(function(x){return '<rect x="'+x+'" y="'+y+'" width="5" height="'+h+'" fill="#fff" stroke="'+C.lav3+'" stroke-width=".8"/>'}).join('')}
function txt(x,y,s,sz,f,w){return '<text x="'+x+'" y="'+y+'" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="'+sz+'" fill="'+(f||C.purD)+'">'+s+'</text>'}
function carMini(x,y,col){return '<g transform="translate('+x+' '+y+')"><rect x="0" y="5" width="22" height="8" rx="3" fill="'+col+'"/><path d="M4 5 L7 0 H15 L18 5Z" fill="'+col+'"/><rect x="8" y="1.5" width="6" height="3.2" fill="#d6ecff"/><circle cx="5" cy="13" r="2.6" fill="#222"/><circle cx="17" cy="13" r="2.6" fill="#222"/></g>'}
var ART={
 permit:function(){return SH+'<path d="M5 38 L50 13 L95 38Z" fill="'+C.pur+'"/><rect x="10" y="38" width="80" height="40" rx="2" fill="#efe6fb"/>'+cols([16,30,65,79],42,34)+door(43,54,14,24)+'<rect x="31" y="22" width="38" height="12" rx="3" fill="#fff" stroke="'+C.purD+'" stroke-width="1.2"/>'+txt(50,32,'DMV',9.5)+'<rect x="88" y="6" width="1.6" height="36" fill="#8a6a4a"/><path d="M89.6 7 h9 v8 h-9z" fill="'+C.pink+'"/><rect x="6" y="76" width="88" height="3" rx="1.5" fill="'+C.lav3+'"/>'},
 tests:function(){return SH+'<rect x="12" y="36" width="76" height="42" rx="3" fill="#fff0f7"/><rect x="8" y="30" width="84" height="8" rx="2" fill="'+C.pinkD+'"/>'+win(18,46,14,14)+win(68,46,14,14)+door(43,52,14,26,C.pinkD)+'<rect x="36" y="3" width="28" height="33" rx="4" fill="'+C.lav3+'" stroke="'+C.purD+'" stroke-width="1.2"/><rect x="40" y="10" width="20" height="23" rx="1.5" fill="#fff"/><rect x="45" y="1" width="10" height="7" rx="2" fill="'+C.pur+'"/><path d="M43 16 l2 2 l4 -4 M43 23 l2 2 l4 -4 M43 30 l2 2 l4 -4" stroke="'+C.grn+'" stroke-width="1.5" fill="none" stroke-linecap="round"/><path d="M52 17h6M52 24h6M52 31h6" stroke="'+C.gry+'" stroke-width="1.5" stroke-linecap="round"/>'},
 ready:function(){return SH+'<rect x="10" y="40" width="80" height="38" rx="3" fill="#e4ecff"/><path d="M6 42 L50 24 L94 42Z" fill="#6f8fe8"/>'+win(16,50,16,14)+win(68,50,16,14)+door(43,52,14,26,C.purD)+'<rect x="20" y="4" width="60" height="22" rx="5" fill="#fff" stroke="'+C.purD+'" stroke-width="1.4"/>'+carMini(24,8,'#ff6fae')+txt(62,14,'DRIVING',6.5)+txt(62,22,'SCHOOL',6.5,C.pinkD)+'<rect x="48" y="26" width="4" height="8" fill="#8a6a4a"/>'},
 basic:function(){return SH+'<rect x="4" y="38" width="92" height="40" rx="6" fill="'+C.asph+'"/><path d="M14 44v28M30 44v28M46 44v28M62 44v28M78 44v28" stroke="#fff" stroke-width="1.6" opacity=".8"/>'+carMini(18,48,'#f7b8d6')+[[58,62],[70,50],[84,64]].map(function(p){return '<path d="M'+p[0]+' '+(p[1]+8)+' l4 -10 l4 10z" fill="#ff8a4c"/><rect x="'+(p[0]-1)+'" y="'+(p[1]+7)+'" width="10" height="2.4" rx="1" fill="#ffb27a"/><rect x="'+(p[0]+1.5)+'" y="'+(p[1]+3)+'" width="5" height="1.6" fill="#fff"/>'}).join('')+'<rect x="44" y="6" width="3" height="32" fill="#8a6a4a"/><rect x="36" y="2" width="19" height="19" rx="3" fill="#2f6bd6" stroke="#fff" stroke-width="1.4"/>'+txt(45.5,17,'P',13,'#fff')},
 signs:function(){var oct='M'+[[15,0],[29,0],[38,9],[38,23],[29,32],[15,32],[6,23],[6,9]].map(function(p){return p.join(' ')}).join(' L')+'Z';return SH+'<rect x="22" y="30" width="3.5" height="48" fill="#8a6a4a"/><g transform="translate(5 2) scale(.98)"><path d="'+oct+'" fill="#d62839" stroke="#fff" stroke-width="2"/>'+txt(22,20,'STOP',8.5,'#fff')+'</g><rect x="68" y="34" width="3.5" height="44" fill="#8a6a4a"/><path d="M70 6 L88 24 L70 42 L52 24Z" fill="'+C.paint+'" stroke="#14161b" stroke-width="1.6"/><path d="M62 28 L70 14 L78 28" stroke="#14161b" stroke-width="2.4" fill="none"/>'},
 signals:function(){return SH+'<rect x="4" y="60" width="92" height="18" rx="3" fill="'+C.asph+'"/><path d="M10 69h12M30 69h12M58 69h12M78 69h12" stroke="#fff" stroke-width="1.6"/><rect x="48.5" y="28" width="3.5" height="34" fill="#4a4a5c"/><rect x="38" y="2" width="24" height="34" rx="6" fill="#2a2440"/><circle cx="50" cy="11" r="5.2" fill="#e5384b"/><circle cx="50" cy="19" r="5.2" fill="#6b5a3a"/><circle cx="50" cy="27.5" r="5.2" fill="#4cd68a"/><circle cx="48.4" cy="25.8" r="1.6" fill="#fff" opacity=".7"/>'},
 rightway:function(){return SH+'<rect x="4" y="52" width="92" height="22" rx="3" fill="'+C.asph+'"/><rect x="38" y="30" width="24" height="48" fill="'+C.asph+'"/><path d="M10 63h22M68 63h22M50 34v14M50 58v16" stroke="#fff" stroke-width="1.6" stroke-dasharray="4 3"/>'+carMini(10,53,'#ff8a4c')+'<rect x="78" y="22" width="3" height="32" fill="#8a6a4a"/><path d="M68 4 H92 L80 24Z" fill="#fff" stroke="#d62839" stroke-width="3" stroke-linejoin="round"/>'},
 speed:function(){return SH+'<rect x="6" y="8" width="88" height="70" rx="8" fill="#3d2f6b"/><circle cx="76" cy="22" r="8" fill="#fff6c9"/><circle cx="80" cy="19" r="7" fill="#3d2f6b"/><circle cx="20" cy="18" r="1.2" fill="#fff"/><circle cx="34" cy="28" r="1" fill="#fff"/><circle cx="58" cy="14" r="1.2" fill="#fff"/><path d="M6 58 Q50 46 94 58 V70 a8 8 0 0 1 -8 8 H14 a8 8 0 0 1 -8 -8Z" fill="'+C.asph+'"/><path d="M30 62 L8 78 H52Z M70 62 L48 78 H92Z" fill="#ffe27a" opacity=".35"/><circle cx="30" cy="46" r="11" fill="#fff" stroke="#d62839" stroke-width="3.2"/>'+txt(30,50,'25',10,'#14161b')},
 freeway:function(){return SH+'<rect x="4" y="52" width="92" height="26" rx="3" fill="'+C.asph+'"/><path d="M4 65h92" stroke="#fff" stroke-width="1.6" stroke-dasharray="6 4"/><rect x="10" y="14" width="3" height="42" fill="#7b7b8c"/><rect x="87" y="14" width="3" height="42" fill="#7b7b8c"/><rect x="8" y="12" width="84" height="5" rx="2" fill="#9a9aae"/><rect x="26" y="16" width="48" height="24" rx="3" fill="'+C.grn+'" stroke="#fff" stroke-width="1.6"/>'+txt(50,26,'FREEWAY',6.5,'#fff')+'<path d="M40 33 h20 l-4 -4 m4 4 l-4 4" stroke="#fff" stroke-width="1.6" fill="none"/>'},
 alcohol:function(){return SH+'<rect x="12" y="38" width="76" height="40" rx="3" fill="#fff0f7"/><path d="M8 38 H92 L86 24 H14Z" fill="#fff"/><path d="M14 24h10l-1 14H8zM34 24h10l-1 14H28zM54 24h10l-1 14H48zM74 24h10l2 14H73z" fill="'+C.pink+'"/>'+win(18,46,20,16)+door(62,48,16,30,C.pur)+'<path d="M38 5 H62 L50 20Z" fill="#fff" stroke="'+C.purD+'" stroke-width="1.4" stroke-linejoin="round"/><rect x="49" y="20" width="2" height="5" fill="'+C.purD+'"/><circle cx="60" cy="6" r="4" fill="#9ae58c" stroke="'+C.grn+'" stroke-width="1"/><path d="M50 3 L56 -3" stroke="#d62839" stroke-width="1.4"/>'},
 conditions:function(){return SH+'<path d="M2 78 L2 36 L18 22 L30 40 L40 70 L40 78Z" fill="#9b86c9"/><path d="M98 78 V30 L82 12 L70 34 L60 70 V78Z" fill="#8a76bd"/><path d="M18 22 L11 33 L16 31 L20 36 L24 30 L30 40 L22 26Z" fill="#fff"/><path d="M82 12 L74 27 L79 25 L83 30 L88 24 L92 22Z" fill="#fff"/><path d="M40 78 Q36 64 52 58 Q66 52 56 40 Q52 34 56 28 L62 28 Q58 38 66 46 Q78 58 60 78Z" fill="#cbbbe8"/><path d="M50 78 Q48 66 58 60" stroke="#fff" stroke-width="1.4" stroke-dasharray="4 3" fill="none"/><g><ellipse cx="50" cy="14" rx="18" ry="9" fill="#e9e4f5"/><ellipse cx="40" cy="18" rx="11" ry="7" fill="#e9e4f5"/><ellipse cx="60" cy="18" rx="12" ry="7" fill="#e9e4f5"/></g><path d="M40 28 l-2 6 M50 30 l-2 6 M60 28 l-2 6" stroke="#5aa0e8" stroke-width="2" stroke-linecap="round"/><circle cx="48" cy="40" r="1.6" fill="#fff"/><circle cx="56" cy="46" r="1.6" fill="#fff"/>'},
 crash:function(){return SH+'<rect x="12" y="36" width="76" height="42" rx="3" fill="#fff"/><rect x="8" y="30" width="84" height="8" rx="2" fill="'+C.pur+'"/>'+win(18,46,14,14)+win(68,46,14,14)+door(43,52,14,26,C.pur)+'<path d="M50 2 L68 8 V20 Q68 31 50 36 Q32 31 32 20 V8Z" fill="#6f8fe8" stroke="'+C.purD+'" stroke-width="1.4"/><path d="M42 19 l6 6 l11 -11" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'},
 points:function(){return SH+'<path d="M32 26 Q50 2 68 26Z" fill="'+C.paint+'"/><rect x="49" y="2" width="2" height="6" fill="'+C.paintD+'"/><path d="M8 40 L50 22 L92 40Z" fill="#efe6fb" stroke="'+C.lav3+'" stroke-width="1.2"/><rect x="8" y="40" width="84" height="5" fill="#fff" stroke="'+C.lav3+'" stroke-width=".8"/>'+cols([14,28,42,53,67,81],45,29)+'<rect x="4" y="74" width="92" height="5" rx="1" fill="'+C.lav3+'"/><rect x="8" y="70" width="84" height="4" fill="#e1d4f6"/><path d="M50 27v8M44 29h12M44 29l-3 5h6zM56 29l-3 5h6z" stroke="'+C.purD+'" stroke-width="1" fill="none"/>'},
 share:function(){return SH+'<rect x="12" y="38" width="76" height="40" rx="3" fill="#e6f8ef"/><path d="M8 38 H92 L87 26 H13Z" fill="#fff"/><path d="M13 26h10l-1 12H8zM33 26h10l-1 12H28zM53 26h10l-1 12H48zM73 26h10l4 12H72z" fill="#35b88a"/>'+win(18,46,18,16)+door(60,48,16,30,C.grn)+'<g transform="translate(26 4)" stroke="'+C.purD+'" stroke-width="1.8" fill="none" stroke-linecap="round"><circle cx="6" cy="14" r="6"/><circle cx="36" cy="14" r="6"/><path d="M6 14 L16 3 H26 L36 14 M16 3 L21 14 L26 3 M21 14 L6 14"/><path d="M13 1 h7"/></g>'},
 rail:function(){return SH+'<rect x="2" y="56" width="96" height="3" fill="#8a7a9a"/><rect x="2" y="64" width="96" height="3" fill="#8a7a9a"/><path d="M8 54v14M20 54v14M32 54v14M44 54v14M56 54v14M68 54v14M80 54v14M92 54v14" stroke="#8a6a4a" stroke-width="2.4"/><rect x="2" y="70" width="96" height="9" rx="2" fill="'+C.asph+'"/><rect x="14" y="8" width="3" height="52" fill="#fff" stroke="#bbb" stroke-width=".6"/><g transform="translate(15.5 18)"><rect x="-14" y="-3" width="28" height="6" rx="1" fill="#fff" stroke="#14161b" stroke-width="1" transform="rotate(35)"/><rect x="-14" y="-3" width="28" height="6" rx="1" fill="#fff" stroke="#14161b" stroke-width="1" transform="rotate(-35)"/></g><circle cx="15.5" cy="38" r="3.4" fill="#e5384b"/><circle cx="15.5" cy="46" r="3.4" fill="#e5384b"/><g transform="translate(46 30)"><rect width="46" height="20" rx="4" fill="#e5384b"/><rect x="30" y="-8" width="14" height="12" rx="2" fill="#a3182d"/><rect x="4" y="4" width="10" height="7" rx="1" fill="#d6ecff"/><rect x="18" y="4" width="10" height="7" rx="1" fill="#d6ecff"/><circle cx="10" cy="22" r="4" fill="#2a2440"/><circle cx="36" cy="22" r="4" fill="#2a2440"/><rect x="2" y="-4" width="6" height="6" rx="1" fill="#2a2440"/></g>'},
 equip:function(){return SH+'<rect x="10" y="34" width="80" height="44" rx="3" fill="#eef0f6"/><rect x="6" y="28" width="88" height="8" rx="2" fill="'+C.gry+'"/><rect x="18" y="44" width="40" height="34" rx="2" fill="#cfd5e4" stroke="'+C.purD+'" stroke-width="1.2"/><path d="M18 52h40M18 60h40M18 68h40" stroke="'+C.purD+'" stroke-width="1"/>'+win(66,46,16,16)+'<circle cx="50" cy="12" r="12" fill="#fff" stroke="'+C.purD+'" stroke-width="1.4"/><path d="M44 18 L53 9 a4 4 0 1 1 3 3 L47 21Z" fill="'+C.pur+'"/>'}
};
C.paintD='#d9a200';
function fallbackArt(c){return SH+'<rect x="12" y="36" width="76" height="42" rx="3" fill="#fff0f7"/><path d="M8 36 H92 L86 22 H14Z" fill="'+C.pur+'"/><path d="M14 22h10l-1 14H8zM34 22h10l-1 14H28zM54 22h10l-1 14H48zM74 22h10l2 14H73z" fill="'+C.pink+'"/>'+win(18,46,16,16)+door(62,48,16,30)+'<circle cx="50" cy="9" r="11" fill="#fff" stroke="'+C.purD+'" stroke-width="1.4"/><text x="50" y="14" text-anchor="middle" font-size="13">'+esc(c.icon||'?')+'</text>'}
function homeArt(){return SH+'<rect x="62" y="12" width="9" height="20" fill="#c98aa8"/><path d="M10 42 L50 10 L90 42Z" fill="#8a63c9"/><rect x="18" y="42" width="64" height="36" rx="2" fill="#fff0f7"/><circle cx="50" cy="31" r="5.5" fill="#d6ecff" stroke="'+C.purD+'" stroke-width="1.2"/>'+win(24,50,14,14)+win(62,50,14,14)+door(44,52,13,26,C.pinkD)+'<path d="M24 66h14M62 66h14" stroke="#ff6fae" stroke-width="3" stroke-linecap="round"/><path d="M26 64q0 -3 2 -3t2 3M66 64q0 -3 2 -3t2 3" stroke="#ff8fc1" stroke-width="2" fill="none"/>'}
function schoolArt(){return SH+'<rect x="8" y="42" width="84" height="36" rx="2" fill="#e3e6ee"/><rect x="6" y="38" width="88" height="6" rx="1" fill="'+C.grn+'"/><rect x="38" y="16" width="24" height="62" rx="2" fill="#d2d8e4"/><path d="M34 18 L50 3 L66 18Z" fill="'+C.grn+'"/><circle cx="50" cy="26" r="6" fill="#fff" stroke="'+C.grn+'" stroke-width="1.6"/><path d="M50 22v4l3 2" stroke="'+C.grn+'" stroke-width="1.2" fill="none"/>'+win(14,50,12,12,'#cfe6ff')+win(30,50,6,12,'#cfe6ff')+win(64,50,6,12,'#cfe6ff')+win(74,50,12,12,'#cfe6ff')+door(43,56,14,22,C.grn)+'<rect x="29" y="38" width="42" height="9" rx="2" fill="#fff" stroke="'+C.grn+'" stroke-width="1.2"/>'+txt(50,45.5,'FJH',7.5,C.grn)+'<g fill="'+C.grn+'" opacity=".9"><circle cx="20" cy="70" r="2"/><circle cx="25" cy="68" r="1.6"/><circle cx="30" cy="70" r="2"/><ellipse cx="25" cy="74" rx="4" ry="3"/></g><rect x="90" y="4" width="1.6" height="38" fill="#8a6a4a"/><path d="M91.6 5 h8 v7 h-8z" fill="'+C.grn+'"/>'}

/* ---------- decor ---------- */
function mul(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;var t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
var TR=['#8fd0a5','#7cc496','#a6dcb5'],TR2=['#e9a5d0','#f5b9dc','#d9a0e8'];
function tree(x,y,s,r){var col=r()<.28?TR2[(r()*3)|0]:TR[(r()*3)|0];return '<g transform="translate('+x+' '+y+') scale('+s+')"><ellipse cx="0" cy="2" rx="12" ry="3.5" fill="#3b216822"/><rect x="-2" y="-12" width="4" height="14" rx="1.5" fill="#8a6a5a"/><circle cx="0" cy="-22" r="12" fill="'+col+'"/><circle cx="-8" cy="-15" r="8" fill="'+col+'"/><circle cx="8" cy="-15" r="8" fill="'+col+'"/><circle cx="-3" cy="-26" r="4" fill="#fff" opacity=".25"/></g>'}
function pine(x,y,s){return '<g transform="translate('+x+' '+y+') scale('+s+')"><ellipse cx="0" cy="2" rx="9" ry="3" fill="#3b216822"/><rect x="-1.6" y="-6" width="3.2" height="8" fill="#8a6a5a"/><path d="M0 -40 L11 -18 H-11Z M0 -30 L14 -8 H-14Z" fill="#6fbf8b"/><path d="M0 -40 L5 -30 H-5Z" fill="#fff"/></g>'}
function bush(x,y,s){return '<g transform="translate('+x+' '+y+') scale('+s+')"><ellipse cx="0" cy="1" rx="12" ry="3" fill="#3b216818"/><circle cx="-6" cy="-4" r="6.5" fill="#8fd0a5"/><circle cx="5" cy="-5" r="7.5" fill="#7cc496"/><circle cx="0" cy="-8" r="5" fill="#a6dcb5"/></g>'}
function flowers(x,y,r){var o='<g transform="translate('+x+' '+y+')">',cs=['#ff8fc1','#fff','#ffe27a','#c9a8f5'];for(var i=0;i<5;i++){var dx=(r()-.5)*22,dy=(r()-.5)*8;o+='<path d="M'+dx+' '+dy+'v5" stroke="#6fbf8b" stroke-width="1.2"/><circle cx="'+dx+'" cy="'+dy+'" r="2.4" fill="'+cs[(r()*4)|0]+'"/><circle cx="'+dx+'" cy="'+dy+'" r=".9" fill="#ffd54a"/>'}return o+'</g>'}
function cottage(x,y,r){var w=['#ffe3ef','#e6f8ef','#fff3d6','#e4ecff'][(r()*4)|0],rf=['#8a63c9','#d98ab3','#6f8fe8','#6fbf8b'][(r()*4)|0];return '<g transform="translate('+x+' '+y+') scale(.62)"><ellipse cx="0" cy="3" rx="30" ry="5" fill="#3b216822"/><rect x="-22" y="-26" width="44" height="28" rx="2" fill="'+w+'"/><path d="M-27 -26 L0 -48 L27 -26Z" fill="'+rf+'"/><rect x="-4" y="-16" width="9" height="18" rx="3" fill="#b3336e"/><rect x="-18" y="-20" width="9" height="9" rx="1" fill="#d6ecff"/><rect x="10" y="-20" width="9" height="9" rx="1" fill="#d6ecff"/></g>'}
function lamp(x,y){return '<g transform="translate('+x+' '+y+')"><rect x="-1" y="-24" width="2" height="24" fill="#6b5a8a"/><circle cx="0" cy="-26" r="4" fill="#ffe27a"/><circle cx="0" cy="-26" r="8" fill="#ffe27a" opacity=".3"/></g>'}
function pond(x,y,s){return '<g transform="translate('+x+' '+y+') scale('+s+')"><ellipse cx="0" cy="0" rx="30" ry="13" fill="#bfe0f5"/><ellipse cx="-6" cy="-2" rx="18" ry="6" fill="#d9eefb"/><ellipse cx="14" cy="3" rx="5" ry="2" fill="#8fd0a5"/></g>'}
function bench(x,y){return '<g transform="translate('+x+' '+y+')"><rect x="-10" y="-6" width="20" height="3.5" rx="1" fill="#b98a6a"/><rect x="-10" y="-11" width="20" height="3" rx="1" fill="#c99a7a"/><rect x="-8" y="-3" width="2" height="5" fill="#7a5a4a"/><rect x="6" y="-3" width="2" height="5" fill="#7a5a4a"/></g>'}

function mailboxSVG(){
 var nm=((S.avatar&&S.avatar.name)||S.name||'').trim(),nmU=esc(nm.toUpperCase().slice(0,10)||'HOME'),fs=nm.length>6?6.2:nm.length>4?7.4:9;
 return '<ellipse cx="14" cy="26" rx="14" ry="3" fill="#3b216822"/><rect x="12.5" y="10" width="3.2" height="16" fill="#8a6a4a"/><rect x="0" y="-2" width="30" height="14" rx="7" fill="#f7b8d6" stroke="#4f2c8a" stroke-width="1.4"/><text x="15" y="8" text-anchor="middle" style="font-family:var(--disp,Arial)" font-weight="900" font-size="'+fs+'" fill="#3b2168">'+nmU+'</text><rect x="26" y="-9" width="2.2" height="9" fill="#4f2c8a"/><path d="M28 -9 h7 v4.5 h-7z" fill="#e5384b"/>'}
/* ---------- map ---------- */
function bgSVG(g){
 var H=g.H,o='',r=mul(7);
 o+='<defs><linearGradient id="twsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfa6ea"/><stop offset=".55" stop-color="#e6cff3"/><stop offset="1" stop-color="#fde6ef"/></linearGradient><linearGradient id="twgr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e6f1de"/><stop offset=".06" stop-color="#e9def9"/><stop offset="1" stop-color="#e4d8f7"/></linearGradient></defs>';
 o+='<rect width="390" height="300" fill="url(#twsky)"/>';
 o+='<circle cx="318" cy="72" r="34" fill="#fff6c9" opacity=".35"/><circle cx="318" cy="72" r="20" fill="#fff6c9"/>';
 o+='<g class="twcl"><g class="twc1"><ellipse cx="70" cy="64" rx="30" ry="9" fill="#fff" opacity=".9"/><ellipse cx="88" cy="58" rx="18" ry="9" fill="#fff" opacity=".9"/><ellipse cx="54" cy="60" rx="14" ry="7" fill="#fff" opacity=".9"/></g><g class="twc2"><ellipse cx="220" cy="110" rx="26" ry="7" fill="#fff" opacity=".75"/><ellipse cx="236" cy="105" rx="14" ry="7" fill="#fff" opacity=".75"/></g></g>';
 o+='<path d="M0 250 L28 196 L52 224 L86 158 L124 214 L156 176 L196 224 L232 150 L268 208 L302 168 L340 218 L368 186 L390 212 V300 H0Z" fill="#b9a6dc"/>';
 [[86,158],[232,150],[28,196],[156,176],[302,168],[368,186]].forEach(function(p){o+='<path d="M'+p[0]+' '+p[1]+' L'+(p[0]-13)+' '+(p[1]+20)+' L'+(p[0]-6)+' '+(p[1]+16)+' L'+p[0]+' '+(p[1]+24)+' L'+(p[0]+7)+' '+(p[1]+16)+' L'+(p[0]+13)+' '+(p[1]+20)+'Z" fill="#fff"/>'});
 o+='<path d="M0 270 L40 232 L78 256 L120 224 L170 262 L214 230 L262 266 L306 236 L348 262 L390 238 V300 H0Z" fill="#cdbbea"/>';
 [[120,224],[214,230],[306,236],[40,232]].forEach(function(p){o+='<path d="M'+p[0]+' '+p[1]+' L'+(p[0]-9)+' '+(p[1]+13)+' L'+(p[0]-3)+' '+(p[1]+10)+' L'+p[0]+' '+(p[1]+16)+' L'+(p[0]+5)+' '+(p[1]+10)+' L'+(p[0]+9)+' '+(p[1]+13)+'Z" fill="#fff" opacity=".95"/>'});
 o+='<path d="M0 272 Q60 262 120 270 T250 268 T390 266 V'+H+' H0Z" fill="url(#twgr)"/>';
 o+='<g opacity=".75"><ellipse cx="60" cy="860" rx="90" ry="40" fill="#dff0e2"/><ellipse cx="340" cy="1500" rx="100" ry="46" fill="#dff0e2"/><ellipse cx="80" cy="2200" rx="110" ry="50" fill="#dff0e2"/><ellipse cx="330" cy="2800" rx="100" ry="46" fill="#dff0e2"/></g>';
 o+='<g fill="#d3c4f0">';for(var i=0;i<Math.round(H/22);i++){var tx=r()*380+5,ty=290+r()*(H-300);o+='<path d="M'+tx.toFixed(0)+' '+ty.toFixed(0)+'l1.5 -4l1.5 4zM'+(tx+4).toFixed(0)+' '+ty.toFixed(0)+'l1.5 -5l1.5 5z"/>'}o+='</g>';
 /* roads */
 var open=function(j){return j<=1||j===2||(j-2<CHAPTERS.length&&unlocked(j-2))||(j===G.all.length-1&&CHAPTERS.every(function(c){return stars(c.id)>=1}))};
 var segD=g.segs.map(function(s){return 'M'+s.p[0].join(' ')+' C'+s.p[1].join(' ')+' '+s.p[2].join(' ')+' '+s.p[3].join(' ')});
 o+='<g fill="none" stroke-linecap="round">';
 g.all.forEach(function(l,j){ if(l.k==='ch'||l.k==='home'||l.k==='school'){var by=l.ry;var fx=l.bx;o+='<path d="M'+l.rx+' '+by+' L'+fx+' '+by+'" stroke="#d9cdf1" stroke-width="12"/>'}});
 o+=segD.map(function(d){return '<path d="'+d+'" stroke="#cbbbe8" stroke-width="40"/>'}).join('');
 o+=segD.map(function(d,j){var op=open(j+1);return '<path d="'+d+'" stroke="'+(op?'#5b4a84':'#9d8ec2')+'" stroke-width="32"/>'}).join('');
 o+=segD.map(function(d,j){var op=open(j+1);return '<path d="'+d+'" stroke="#fff" stroke-width="2.4" stroke-dasharray="9 9" opacity="'+(op?.9:.55)+'"/>'}).join('');
 o+='</g>';
 /* decor */
 var pts=[];g.segs.forEach(function(s){for(var t=0;t<=1;t+=.05)pts.push(bez(s.p,t))});
 var boxes=g.all.filter(function(l){return l.k!=='fin'}).map(function(l){return [l.bx-62,l.top-8,l.bx+62,l.top+140]});
 boxes.push([140,370,215,425]);
 function free(x,y,m){for(var i=0;i<pts.length;i++){var dx=pts[i][0]-x,dy=pts[i][1]-y;if(dx*dx+dy*dy<m*m)return false}for(i=0;i<boxes.length;i++){var b=boxes[i];if(x>b[0]-12&&x<b[2]+12&&y>b[1]&&y<b[3]+16)return false}return true}
 var dec=[],rr=mul(21);
 for(var n=0;n<Math.round(H/9);n++){var x=12+rr()*366,y=300+rr()*(H-340),k=rr();
  var m=k<.5?40:30;if(!free(x,y,m))continue;
  var ok=true;for(var d=0;d<dec.length;d++){var ddx=dec[d][0]-x,ddy=dec[d][1]-y;if(ddx*ddx+ddy*ddy<26*26){ok=false;break}}if(!ok)continue;
  dec.push([x,y,k])}
 dec.sort(function(a,b){return a[1]-b[1]});
 dec.forEach(function(d,ix){var x=d[0],y=d[1],k=d[2],s=.8+((ix*37)%5)/10;
  if(k<.3)o+=tree(x.toFixed(0),y.toFixed(0),s,rr);else if(k<.45)o+=pine(x.toFixed(0),y.toFixed(0),s);else if(k<.6)o+=bush(x.toFixed(0),y.toFixed(0),s);else if(k<.75)o+=flowers(x.toFixed(0),y.toFixed(0),rr);else if(k<.85)o+=cottage(x.toFixed(0),y.toFixed(0),rr);else if(k<.87&&y>900)o+=pond(x.toFixed(0),y.toFixed(0),.9);else if(k<.94)o+=bench(x.toFixed(0),y.toFixed(0));else o+=bush(x.toFixed(0),y.toFixed(0),s)});
 g.segs.forEach(function(s,j){if(j>0&&j%2===0){var p=bez(s.p,.5);o+=lamp(p[0]+(p[0]<195?30:-30),p[1])}});
 /* mailbox with her name */
 var nm=((S.avatar&&S.avatar.name)||S.name||'').trim();
 o+='<g transform="translate(160 396)">'+mailboxSVG()+'</g>';
 /* finish arch */
 var f=g.fin;o+='<g transform="translate('+f.rx+' '+(f.ry-8)+')"><rect x="-44" y="-52" width="4" height="52" fill="#6b5a8a"/><rect x="40" y="-52" width="4" height="52" fill="#6b5a8a"/><rect x="-44" y="-62" width="88" height="16" rx="3" fill="#fff" stroke="#4f2c8a" stroke-width="1.6"/><path d="M-40 -62h8v8h-8zM-24 -62h8v8h-8zM-8 -62h8v8h-8zM8 -62h8v8h-8zM24 -62h8v8h-8zM-32 -54h8v8h-8zM-16 -54h8v8h-8zM0 -54h8v8h-8zM16 -54h8v8h-8zM32 -54h8v8h-8z" fill="#2a1a4a"/><text x="0" y="-70" text-anchor="middle" style="font-family:var(--disp,Arial)" font-weight="900" font-size="12" fill="#3b2168">The real test!</text></g>';
 /* title in the sky */
 o+='<text x="195" y="38" text-anchor="middle" style="font-family:var(--script,cursive)" font-size="25" font-weight="700" fill="#3b2168">'+esc(nm?nm+"'s Town":'Your Town')+'</text>';
 return o}

function starsHTML(n){return [1,2,3].map(function(i){return '<i class="'+(i<=n?'on':'')+'">★</i>'}).join('')}
/* Built-town cache: the map (SVG background + 21 buildings, ~125 KB of markup) only depends on the key below. While it is unchanged the
   built node is kept and put back in place of a tiny placeholder, so a tab switch costs no string build and no HTML parse. */
var TC={key:'',node:null,pend:''};
function townKey(){var nx=nextStop(),k=[((S.avatar&&S.avatar.name)||S.name||'').trim(),S.gotCar?1:0,S.pos==='school'?1:0,nx?nx.id:'-'];
 for(var i=0;i<CHAPTERS.length;i++)k.push((unlocked(i)?'u':'l')+stars(CHAPTERS[i].id));return k.join('|')}
function unph(){var ph=q$('.town-ph');if(!ph)return;var n=TC.node;if(n){ph.replaceWith(n);lastTown=null}}
function townHTML(){
 G=geom();var key=townKey();
 if(TC.node&&TC.key===key)return '<div class="town-ph" style="aspect-ratio:'+W+'/'+G.H+'"></div>';
 TC.pend=key;TC.node=null;
 var g=G,H=g.H,nx=nextStop(),nxi=nx?CHAPTERS.indexOf(nx):-1,out='';
 var bl=function(l){return 'left:'+(l.bx/W*100).toFixed(3)+'%;top:'+(l.top/H*100).toFixed(3)+'%'};
 var nm=((S.avatar&&S.avatar.name)||S.name||'').trim();
 /* home */
 var h=g.L[0],sc=g.L[1];
 out+='<button class="tl home" style="'+bl(h)+'" data-act="twhome" aria-label="'+esc(nm?nm+"'s house":'Your house')+'"><span class="art"><svg viewBox="0 0 100 84" aria-hidden="true">'+homeArt()+'</svg></span><span class="nm">'+esc(nm?nm+"'s house":'Home')+'</span></button>';
 var schoolNext=!S.gotCar&&S.pos!=='school';
 out+='<button class="tl school'+(schoolNext?' next':'')+'" style="'+bl(sc)+'" data-act="twschool" aria-label="FJH School"><span class="art"><svg viewBox="0 0 100 84" aria-hidden="true">'+schoolArt()+'</svg></span><span class="nm">FJH School</span></button>';
 CHAPTERS.forEach(function(c,i){
  var l=g.L[2+i],lk=!unlocked(i),s=stars(c.id),isNext=S.gotCar&&i===nxi&&!lk;
  var art=(ART[c.id]||function(){return fallbackArt(c)})(c);
  out+='<button class="tl ch '+(lk?'locked':s?'done':'open')+(isNext?' next':'')+'" data-i="'+i+'" style="'+bl(l)+'" data-act="'+(lk?'locked':'twgo')+'" data-v="'+esc(c.id)+'" aria-label="'+esc(c.name)+', '+(lk?'locked':s+' of 3 stars')+'"><span class="art"><svg viewBox="0 0 100 84" aria-hidden="true">'+art+'</svg>'+(lk?'<b class="lk" aria-hidden="true">🔒</b>':'')+'</span><span class="nm">'+esc(c.name)+'</span><span class="tws">'+starsHTML(s)+'</span></button>'});
 return '<div class="town" style="aspect-ratio:'+W+'/'+H+'"><svg class="twbg" viewBox="0 0 '+W+' '+H+'" aria-hidden="true" focusable="false">'+bgSVG(g)+'</svg>'+out+'<div class="tw-me" aria-hidden="true"></div></div>'}

/* ---------- town tab ---------- */
roadTab=function(){
 migrate();
 var m=nMastered(),pct=Math.round(m/ALL.length*100),nx=nextStop(),first=S.runs===0&&!S.gotCar,dd=S.daily===today(),last=S.exams[0];
 var ready=pct>=85&&last&&last.s/last.n>=PASS;
 var install=isIOS()&&!standalone()&&!S.hideInstall?'<div class="card hl"><b>Use it offline on your iPhone</b><p class="muted" style="margin:4px 0 10px">Open this page in Safari. Tap Share, then Add to Home Screen. After that it works with no internet.</p><button class="btn small ghost" data-act="hideinstall">Got it</button></div>':'';
 var away=S.last&&S.runs?Math.round((new Date(today()+'T00:00')-new Date(S.last+'T00:00'))/864e5):0;
 var back=away>=2&&S.remind!==false?'<div class="card hl">'+(window.xToneBack?window.xToneBack(away):'<b>Welcome back. Ready for a quick 5 question round?</b><p class="muted" style="margin:4px 0 10px">A 5 question Daily Drive is a quick way back in.</p>')+'<div class="row" style="gap:8px"><button class="btn small ghost" data-act="daily" style="flex:2">Start Daily Drive</button><button class="btn small line" data-act="remindoff" style="flex:1">Turn off</button></div></div>':'';
 var there=nx&&(S.gotCar?(S.pos==='ch'&&S.at===CHAPTERS.indexOf(nx)):S.pos==='school');
 var cta;
 if(!nx)cta='<div class="kicker">Town complete</div><h3>All stops at 3 stars</h3><button class="btn primary" data-act="exam">Take the mock exam</button>';
 else if(!S.gotCar)cta='<div class="kicker">'+(first?'Start here':'Up next')+'</div><h3>Get to FJH School</h3><p class="muted" style="margin:-6px 0 12px">Walk or bike there for your first stop: '+nx.icon+' '+esc(nx.name)+'. Get 5 of 10 right and you earn your first car.</p><button class="btn primary" data-act="stop" data-v="'+nx.id+'">'+(there?'Start the lesson':'Head to school')+'</button>';
 else cta='<div class="kicker">Up next</div><h3>'+nx.icon+' '+esc(nx.name)+'</h3><button class="btn primary" data-act="stop" data-v="'+nx.id+'">'+(there?'Start':'Drive there')+'</button>';
 return install+back+'<div class="card cta">'+cta+'</div>'
  +'<div class="twrow"><button class="card daily btn line" data-act="daily"><span class="ic">'+(dd?'✅':'☀️')+'</span><span><b>Daily Drive</b><span class="muted">'+(dd?'Done today':'5 questions, +30 XP')+'</span></span></button>'
  +'<div class="card twready" role="img" aria-label="Permit readiness '+pct+' percent"><b>Ready</b><strong>'+pct+'%</strong><div class="track"><b style="width:'+pct+'%"></b></div></div></div>'
  +(ready?'<p class="muted center" style="margin:2px 0 8px">You are ready to take the real test. Good luck.</p>':'')
  +townHTML()}

/* ---------- marker and travel ---------- */
function scale(){if(TW.iw===innerWidth&&TW.w)return TW.w/W;var t=q$('.town');if(!t)return 1;TW.iw=innerWidth;TW.w=t.clientWidth;return TW.w/W}
function bikeSVG(){return '<svg class="twbk" viewBox="0 0 70 40" aria-hidden="true"><g class="whl" style="transform-origin:12px 28px"><circle cx="12" cy="28" r="10" fill="none" stroke="#3b2168" stroke-width="2.4"/><path d="M12 19v18M3 28h18" stroke="#9d8ec2" stroke-width="1"/></g><g class="whl" style="transform-origin:58px 28px"><circle cx="58" cy="28" r="10" fill="none" stroke="#3b2168" stroke-width="2.4"/><path d="M58 19v18M49 28h18" stroke="#9d8ec2" stroke-width="1"/></g><path d="M12 28 L28 28 L36 12 L52 12 M28 28 L40 14 M52 12 L58 28 M36 12 L33 7 h-5 M52 12 l-1 -5 h6" stroke="#ff6fae" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="28" cy="28" r="3" fill="#3b2168"/></svg>'}
function setMarker(mode){
 var me=q$('.tw-me');if(!me)return null;
 var av=AV_();
 me.className='tw-me '+mode+(moving?' moving':'');
 if(mode==='car')me.innerHTML='<span class="bob">'+carSVG(av,'twcarsvg')+'</span>';
 else if(mode==='bike')me.innerHTML='<span class="twbikebox">'+avatarSVG(av,'0 0 120 170','twavbk')+bikeSVG()+'</span>';
 else me.innerHTML='<span class="bob">'+avatarSVG(av,null,'twavsvg')+'</span>';
 me.__sig=mode+'|'+JSON.stringify(av);
 return me}
/* pose: marker size and town width are read once per (marker art, viewport width) and cached, so placing the marker after a DOM write
   never forces a layout. The sizes are percentages of the town width and fixed viewBox ratios, so they only change with the width. */
var DIM={},TW={iw:0,w:0};
function dims(me){var s=scale(),k=(me.__sig||'')+'|'+TW.w;var d=DIM[k];if(!d){d=DIM[k]=[me.offsetWidth,me.offsetHeight]}return d}
function pose(me,x,y){var d=dims(me),w=d[0],h=d[1],s=scale();return 'translate('+(x*s-w/2).toFixed(1)+'px,'+(y*s-h*(me.classList.contains('car')?.62:.88)).toFixed(1)+'px)'}
function place(loc){var me=q$('.tw-me');if(!me||!G)return;var l=G.all[loc];me.style.transform=pose(me,l.rx,l.ry)}
function idleMode(){return S.gotCar?'car':'walk'}
function parkNow(){var me=q$('.tw-me');if(!me)return;var mode=idleMode();
 if(me.__sig===mode+'|'+JSON.stringify(AV_())&&!me.classList.contains('moving')){me.getAnimations&&me.getAnimations().forEach(function(a){a.onfinish=a.oncancel=null;a.cancel()})}else setMarker(mode);
 place(curLoc())}
var lastTown=null;
function focusMarker(instant){var me=q$('.tw-me');if(!me)return;var r=me.getBoundingClientRect();var y=r.top+scrollY+r.height/2-innerHeight*.42;scrollTo({top:Math.max(0,y),behavior:instant||rm()?'auto':'smooth'})}
window.townFocus=function(){focusMarker(true)};
function travel(a,b,mode){
 return new Promise(function(res){
  var me=q$('.tw-me');
  if(!me||!G||a===b||rm()){if(me){setMarker(idleMode());place(b);focusMarker(true)}res();return}
  moving=true;setMarker(mode);me.classList.add('moving');
  var pts=route(a,b),s=scale(),cum=[0],i,tot=0;
  for(i=1;i<pts.length;i++){tot+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);cum.push(tot)}
  var sp={walk:105,bike:170,car:280}[mode]||150,cap=2500;
  var dur=Math.min(cap,Math.max(1200,tot/sp*1000));
  var fr=pts.map(function(p,k){return {transform:pose(me,p[0],p[1]),offset:tot?cum[k]/tot:k/(pts.length-1)}});
  fr[0].offset=0;fr[fr.length-1].offset=1;
  focusMarker(true);
  if(mode==='car'&&window.sfx)setTimeout(function(){window.sfx('horn')},120);
  if(mode==='bike'&&window.sfx)setTimeout(function(){window.sfx('coin')},200);
  var anim=me.animate(fr,{duration:dur,delay:300,easing:'cubic-bezier(.45,.05,.4,1)',fill:'both'});
  var tgt=scrollY,raf=0;
  var follow=function(){if(!me.isConnected||anim.playState==='finished'||anim.playState==='idle')return;var r=me.getBoundingClientRect();var want=Math.max(0,r.top+scrollY+r.height/2-innerHeight*.45);tgt+=(want-tgt)*.14;scrollTo(0,tgt);raf=requestAnimationFrame(follow)};
  raf=requestAnimationFrame(follow);
  var done=function(){cancelAnimationFrame(raf);moving=false;var m2=q$('.tw-me');if(m2){setMarker(idleMode());place(b)}
   var tl=q$('.town .tl[data-v]'),el=G.all[b].k==='ch'&&q$('.town .tl[data-i="'+G.all[b].i+'"]');if(el){el.classList.add('arrive');setTimeout(function(){el&&el.classList.remove('arrive')},900)}
   res()};
  anim.onfinish=done;anim.oncancel=done})}

/* ---------- overlays ---------- */
function overlay(id,html,onbg){
 var o=document.getElementById(id);if(o)o.remove();
 o=document.createElement('div');o.id=id;o.className='twov';o.innerHTML=html;
 o.addEventListener('click',function(e){if(e.target===o&&onbg)onbg()});
 document.body.appendChild(o);var b=o.querySelector('button');if(b)b.focus({preventScroll:true});return o}
function closeOv(id){var o=document.getElementById(id);if(o)o.remove()}
function inTown(){return ui.tab==='road'&&!ui.sheet&&!ui.result&&!ui.notes&&!ui.lesson&&!ui.run&&!ui.ob&&!ui.gsheet}

var pend=null;
function skipIntro(){var x=S.x;return !!(x&&typeof x==='object'&&(x.skipIntros===true||(x.story&&(x.story.seen==='all'||x.story.all))))} /* test seeds only, no UI */
function pickMode(then,dest){
 if(skipIntro()){then('walk');return}
 pend=then;var home=dest==='home',ttl=home?'Heading home':'Getting to FJH School';
 overlay('twpick','<div class="twcard" role="dialog" aria-modal="true" aria-label="'+ttl+'"><h2>'+ttl+'</h2><p class="muted" style="margin:0 0 14px">You do not have a car yet. How are you getting '+(home?'home':'there today')+'?</p><div class="twmodes"><button class="twmode" data-act="twwalk"><span class="e">🚶</span><b>Walk</b><span class="muted">Slow and steady</span></button><button class="twmode" data-act="twbike"><span class="e">🚲</span><b>Bike</b><span class="muted">Quicker, with a bell</span></button></div><button class="btn line" data-act="twcancel" style="margin-top:12px">Not yet</button></div>',function(){closeOv('twpick');pend=null})}

function arrive(id,start){
 if(!inTown()&&!start)return;
 if(start){startStop(id)}else{ui.sheet=id;render()}}

function go(id,o){
 if(moving)return;o=o||{};
 var i=CHAPTERS.findIndex(function(c){return c.id===id});if(i<0)return;
 if(!unlocked(i)){acts.locked(id);return}
 migrate();
 if(!S.gotCar){
  /* walking era: the first stops are studied at FJH School */
  if(S.pos==='school'){arrive(id,o.start);return}
  var from0=curLoc0();pickMode(function(mode){S.pos='school';save();travel(from0,1,mode).then(function(){arrive(id,o.start)})});return}
 var to=2+i;
 if(S.pos==='ch'&&S.at===i){arrive(id,o.start);return}
 var from=curLoc();S.pos='ch';S.at=i;save();
 travel(from,to,'car').then(function(){arrive(id,o.start)})}
function homeSheet(){
 var n=streakNow();
 overlay('twhome','<div class="twcard twhomec" role="dialog" aria-modal="true" aria-label="Home sweet home"><div class="twmb" aria-hidden="true"><svg viewBox="-2 -12 40 42">'+mailboxSVG()+'</svg></div><h2>Home sweet home</h2><p class="twstreak">'+(n>0?'<b>🔥 '+n+' day streak</b><span class="muted"> Keep it going with a Daily Drive.</span>':'<span class="muted">No streak yet. A Daily Drive starts one.</span>')+'</p><button class="btn primary" data-act="twhgo">Head to school</button><button class="btn line" data-act="twcancel" style="margin-top:10px">Stay home</button></div>',function(){closeOv('twhome')})}
function goHome(){
 if(moving)return;migrate();
 var from=curLoc();
 if(from===0){homeSheet();return}
 var run=function(mode){S.pos='home';save();travel(from,0,mode).then(homeSheet)};
 if(S.gotCar)run('car');else pickMode(run,'home')}
function curLoc0(){return S.pos==='school'?1:0}
window.townGo=go;

function autoDrive(){
 var d=ui.drive;ui.drive=null;if(!d||!S.gotCar)return;
 var to=Math.min(d.to,CHAPTERS.length-1),from=curLoc();
 S.pos='ch';S.at=to;save();moving=true;
 travel(from,2+to,'car').then(function(){moving=false})}

function carCard(){
 var av=AV_();
 var conf=[];for(var i=0;i<16;i++)conf.push('<i style="left:'+(4+i*6)+'%;animation-delay:'+(i%5*.18)+'s;background:'+['#ff8fc1','#ffe27a','#c9a8f5','#8fd0a5','#6f8fe8'][i%5]+'"></i>');
 overlay('twcar','<div class="twcard twgift" role="dialog" aria-modal="true" aria-label="You earned your first car"><div class="twconf" aria-hidden="true">'+conf.join('')+'</div><p class="eyebrow">New wheels</p><h2>You earned your first car!</h2><div class="twcarbox">'+carSVG(av,'twcarbig')+'</div><p class="muted" style="margin:0 0 14px">It is a beat-up clunker, but it runs, and it is all yours. From now on you drive to every stop. Earn coins and upgrade it in the Garage.</p><button class="btn primary" data-act="twdrive">Take it for a drive</button><button class="btn line" data-act="twgarage" style="margin-top:10px">Open the Garage</button></div>');
 if(window.sfx){window.sfx('win');setTimeout(function(){window.sfx('horn')},600)}}
function dismissCar(){S.carSeen=true;save();closeOv('twcar')}

function schoolCard(){
 overlay('twsch','<div class="twcard" role="dialog" aria-modal="true" aria-label="FJH School"><h2>FJH School</h2><p class="muted" style="margin:0 0 14px">Go Huskies. Extra practice happens here.</p><button class="btn primary" data-act="twsdaily">☀️ Daily Drive</button><button class="btn ghost" data-act="twsreview" style="margin-top:10px">🔧 Fix my mistakes</button><button class="btn line" data-act="twcancel" style="margin-top:10px">Close</button></div>',function(){closeOv('twsch')})}

Object.assign(acts,{
 twgo:function(v){go(v,{start:false})},
 twhome:function(){goHome()},
 twhgo:function(){closeOv('twhome');if(!S.gotCar){acts.twschool();return}
  if(moving)return;migrate();var from=curLoc();if(from===1){schoolCard();return}
  S.pos='school';save();travel(from,1,'car').then(function(){schoolCard()})},
 twschool:function(){if(moving)return;if(!S.gotCar){var nx=nextStop();if(nx)go(nx.id,{start:false});return}schoolCard()},
 twwalk:function(){closeOv('twpick');var f=pend;pend=null;f&&f('walk')},
 twbike:function(){closeOv('twpick');var f=pend;pend=null;f&&f('bike')},
 twcancel:function(){closeOv('twpick');closeOv('twsch');closeOv('twhome');pend=null},
 twdrive:function(){dismissCar();if(ui.drive)autoDrive()},
 twgarage:function(){dismissCar();ui.drive=null;acts.tab('garage')},
 twsdaily:function(){closeOv('twsch');acts.daily()},
 twsreview:function(){closeOv('twsch');acts.review()}
});
var _stop=acts.stop;
acts.stop=function(v){if(inTown())go(v,{start:true});else _stop(v)};
var _tab=acts.tab;
acts.tab=function(v){_tab(v);if(v==='road')setTimeout(window.townFocus,0)};
var _home=acts.home;
acts.home=function(){_home();setTimeout(window.townFocus,0)};
document.addEventListener('keydown',function(e){if(e.key==='Escape'){if(document.getElementById('twcar'))acts.twdrive();else{closeOv('twpick');closeOv('twsch');closeOv('twhome');pend=null}}});

/* ---------- park (override avatar.js) ---------- */
parkCar=function(){
 unph();var tw=q$('.town');if(!tw)return;
 if(!TC.node&&TC.pend&&!q$('.town-ph')){TC.node=tw;TC.key=TC.pend}
 migrate();G=geom();
 if(moving)return;
 parkNow();
 if(tw!==lastTown){lastTown=tw;focusMarker(false);setTimeout(function(){if(q$('.town')===tw&&!moving&&!document.getElementById('twcar'))focusMarker(rm())},260)} /* first render of the Town tab (or a fresh one after results): bring the marker into view */
 if(S.gotCar&&!S.carSeen&&skipIntro()){S.carSeen=true;save()}
 if(S.gotCar&&!S.carSeen){setTimeout(function(){var ok=function(){return inTown()&&!document.getElementById('twcar')&&S.gotCar&&!S.carSeen};if(!ok())return;if(window.X&&X.modal)X.modal('twcar',carCard,{p:1,ok:ok});else carCard()},350);return}
 if(ui.drive){if(S.gotCar)setTimeout(autoDrive,200);else ui.drive=null}};
window.addEventListener('resize',function(){if(!moving&&q$('.town'))place(curLoc())});
migrate();
render();
})();
