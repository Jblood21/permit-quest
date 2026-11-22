'use strict';
/* Vehicle art and catalog. Loaded after avatar.js. Overrides carSVG, CARC, MODELS and the car, carColor and up entries of CATS.
   16 original vehicles, front view, viewBox 0 -8 120 108, tires sit on y=97. Ids: clunker (start car, free) then the 15 below. */
(function(){
var INK='#2a1a4a',GR='#0b7a3b',GY='#aab2bf';
var f=function(n){return +(+n).toFixed(1)};
function mixc(a,b,t){var p=function(h){return[1,3,5].map(function(i){return parseInt(h.slice(i,i+2),16)})},x=p(a),y=p(b);return '#'+x.map(function(v,i){return Math.round(v+(y[i]-v)*t).toString(16).padStart(2,'0')}).join('')}
function lum(h){var x=[1,3,5].map(function(i){return parseInt(h.slice(i,i+2),16)});return .299*x[0]+.587*x[1]+.114*x[2]}

/* ---------- colors ---------- */
var COLS=[['fjh','FJH','#0b7a3b'],['lavender','Lavender','#b9a2f0'],['pink','Pink','#ff6fae'],['mint','Mint','#9fd3b4'],['white','White','#f3f4f6'],['cream','Cream','#f1e6c8'],['silver','Silver','#aab2bf'],['grey','Grey','#7c8494'],['black','Black','#2b2f3a'],['red','Red','#e5383b'],['orange','Orange','#ff8a4c'],['yellow','Yellow','#ffc61a'],['gold','Gold','#d9a520'],['green','Green','#19a974'],['teal','Teal','#1fb5a8'],['blue','Blue','#2f80ed'],['purple','Purple','#8b5cf6'],['rust','Rust','#b4673c'],['holo','Holo','#cdb8ff']];
var HOLOCSS='linear-gradient(135deg,#ffc2ec,#b9e6ff 35%,#d4c1ff 62%,#c2ffe3)';
COLS.forEach(function(c){CARC[c[0]]=c[2]});

/* ---------- drawing helpers ---------- */
var both=function(fn){return fn(-1)+fn(1)};
var X=function(d,k){return f(60+d*k)};
var poly=function(d,pts,attr){return '<path d="M'+pts.map(function(p){return X(d,p[0])+' '+f(p[1])}).join(' L')+'Z" '+attr+'/>'};
var heart=function(x,y,s,fill,st){return '<path d="M'+f(x)+' '+f(y+s*.9)+' C'+f(x-s*1.7)+' '+f(y-s*.1)+' '+f(x-s*.9)+' '+f(y-s*1.2)+' '+f(x)+' '+f(y-s*.35)+' C'+f(x+s*.9)+' '+f(y-s*1.2)+' '+f(x+s*1.7)+' '+f(y-s*.1)+' '+f(x)+' '+f(y+s*.9)+'Z" fill="'+fill+'"'+(st?' stroke="'+st+'" stroke-width="1"':'')+'/>'};
var lash=function(x,y,r,d){return '<path d="M'+f(x+d*r*.85)+' '+f(y-r*.45)+' l'+f(d*r*.6)+' '+f(-r*.5)+' M'+f(x+d*r*.55)+' '+f(y-r*.85)+' l'+f(d*r*.35)+' '+f(-r*.65)+' M'+f(x+d*r)+' '+f(y+r*.1)+' l'+f(d*r*.75)+' '+f(-r*.15)+'" stroke="'+INK+'" stroke-width="1.9" stroke-linecap="round" fill="none"/>'};
var lamp=function(x,y,r,d,la,rim,glow){return '<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+(rim||'#fffbe6')+'" stroke="'+INK+'" stroke-width="1.8"/><circle cx="'+x+'" cy="'+y+'" r="'+f(r*.58)+'" fill="'+(glow||'#ffe27a')+'"/><circle cx="'+f(x-r*.22)+'" cy="'+f(y-r*.3)+'" r="'+f(r*.25)+'" fill="#fff"/>'+(la?lash(x,y,r,d):'')};
var bar=function(m,fill,x0,x1,h){h=h||9;return '<rect x="'+x0+'" y="'+(m.by+m.bh-h)+'" width="'+(x1-x0)+'" height="'+h+'" rx="'+f(h/2.2)+'" fill="'+fill+'" stroke="'+INK+'" stroke-opacity=".4" stroke-width="1"/>'};
var chromeBar=function(m,x0,x1,h){h=h||7;var y=m.by+m.bh-h;return '<rect x="'+x0+'" y="'+y+'" width="'+(x1-x0)+'" height="'+h+'" rx="3" fill="#dfe3ee" stroke="'+INK+'" stroke-opacity=".5" stroke-width="1"/><rect x="'+(x0+4)+'" y="'+(y+1.2)+'" width="'+(x1-x0-8)+'" height="1.8" rx=".9" fill="#fff"/>'};
var chromeRing=function(x,y,r){return '<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="#e9ecf5" stroke="'+INK+'" stroke-width="1.6"/>'};

/* ---------- vehicle table ---------- */
var M={};
function def(id,o){o.id=id;M[id]=Object.assign({bx:10,br:14,ti:6,dm:4,wt:4,tw:17,tx:3,wh:26,ci:22,ct:16},o)}

def('clunker',{n:'Beat-Up Clunker',p:0,by:50,bh:36,br:11,ct:17,ci:22,ti:8,dm:3,wt:6,wh:26,wob:1,sp:12,rimL:'#c3c8d4',rimR:'#a0592f',
 roof:function(m,c){var y=m.ct;return '<g transform="rotate(-4 80 '+(y+2)+')"><rect x="68" y="'+(y-1.5)+'" width="24" height="8" rx="1.5" fill="#9aa1ae" stroke="'+INK+'" stroke-opacity=".55" stroke-width="1"/><path d="M71 '+(y-1)+' v7 M76 '+(y-1)+' v7 M81 '+(y-1)+' v7 M86 '+(y-1)+' v7" stroke="#5b6270" stroke-width=".9" stroke-dasharray="1.6 1.4"/></g>'},
 a:function(m,c){var by=m.by,bh=m.bh;
  return '<path d="M84 '+(by+2)+' h22 q4 0 4 5 v21 h-26z" fill="#6fb1a6" stroke="'+INK+'" stroke-opacity=".5" stroke-width="1.2"/><circle cx="88" cy="'+(by+6)+'" r="1" fill="#2a4a45"/><circle cx="106" cy="'+(by+6)+'" r="1" fill="#2a4a45"/><circle cx="88" cy="'+(by+24)+'" r="1" fill="#2a4a45"/>'
  +'<ellipse cx="34" cy="'+(by+22)+'" rx="7" ry="3.6" fill="#8b4a2b" opacity=".7"/><ellipse cx="102" cy="'+(by+bh-5)+'" rx="5" ry="3" fill="#8b4a2b" opacity=".75"/><ellipse cx="18" cy="'+(by+7)+'" rx="4" ry="2.6" fill="#8b4a2b" opacity=".65"/><circle cx="14" cy="'+(by+bh-10)+'" r="2" fill="#6e3a22" opacity=".7"/><circle cx="76" cy="'+(by+bh-9)+'" r="1.6" fill="#6e3a22" opacity=".7"/>'
  +'<path d="M44 '+(by+3)+' q8 -2 14 1 q-2 6 -9 6 q-6 -1 -5 -7z" fill="#000" opacity=".16"/><path d="M45 '+(by+4)+' q6 -1.5 11 .6" stroke="#fff" stroke-width="1.2" stroke-linecap="round" fill="none" opacity=".55"/>'},
 b:function(m,c){var by=m.by,bh=m.bh;
  return lamp(27,by+13,8,-1,false)+lamp(94,by+13,8,1,false,'#e6ddb8','#c9ba73')+'<path d="M96 '+(by+7)+' l-3 5 l3 2 l-3 6 M93 '+(by+12)+' l-5 1" stroke="'+INK+'" stroke-width="1.1" fill="none" stroke-linecap="round"/>'
  +'<rect x="45" y="'+(by+14)+'" width="30" height="12" rx="3" fill="#3b2f55" stroke="'+INK+'" stroke-opacity=".5" stroke-width="1"/><path d="M48 '+(by+18)+' h24 M48 '+(by+22)+' h24" stroke="#8f84ad" stroke-width="1.4"/>'
  +'<path d="M12 '+(by+bh-8)+' h96 v7 q0 2 -2 2 h-60 l-6 3 h-26 q-2 0 -2 -2z" fill="#6c657e" stroke="'+INK+'" stroke-opacity=".5" stroke-width="1"/><path d="M108 '+(by+bh-8)+' l2 6 l-8 1" fill="#8a4a2a" opacity=".8"/>'},
 fx:function(m,c){var by=m.by;return '<g class="cq-smoke" fill="#e7e1f2" stroke="#b9b0cc" stroke-width=".8"><circle cx="17" cy="'+(by-6)+'" r="4.6" style="animation-delay:0s"/><circle cx="14" cy="'+(by-15)+'" r="3.6" style="animation-delay:.7s"/><circle cx="18" cy="'+(by-23)+'" r="2.8" style="animation-delay:1.4s"/></g>'}});

def('compact',{n:'Cute Compact',p:70,by:50,bh:36,br:22,bx:14,ct:20,ci:25,ti:10,dm:9,wt:5,wh:24,tw:16,tx:6,sk:1,
 b:function(m,c){var by=m.by,bh=m.bh;
  return lamp(29,by+13,9.5,-1,true)+lamp(91,by+13,9.5,1,true)+'<ellipse cx="60" cy="'+(by+19)+'" rx="12" ry="5.5" fill="#3b2f55" stroke="'+INK+'" stroke-opacity=".5" stroke-width="1"/><path d="M52 '+(by+18)+' Q60 '+(by+25)+' 68 '+(by+18)+'" stroke="#ffd1e6" stroke-width="1.8" fill="none" stroke-linecap="round"/>'+heart(60,by+8,3.6,'#ff8fc1','#fff')+'<rect x="26" y="'+(by+bh-8)+'" width="68" height="8" rx="4" fill="#efe9ff" stroke="'+INK+'" stroke-opacity=".4" stroke-width="1"/>'}});

def('mini',{n:'City Mini',p:120,by:48,bh:38,br:12,ct:19,ci:18,ti:6,dm:3,wt:4,wh:26,cabFill:'#2b2f3a',
 a:function(m,c){return '<rect x="16" y="'+(m.by-6)+'" width="8" height="6" rx="3" fill="'+c.col+'" stroke="'+INK+'" stroke-opacity=".5" stroke-width="1"/><rect x="96" y="'+(m.by-6)+'" width="8" height="6" rx="3" fill="'+c.col+'" stroke="'+INK+'" stroke-opacity=".5" stroke-width="1"/>'},
 b:function(m,c){var by=m.by,bh=m.bh;
  return chromeRing(27,by+15,11)+lamp(27,by+15,8.6,-1,false)+chromeRing(93,by+15,11)+lamp(93,by+15,8.6,1,false)
  +'<path d="M49 '+(by+5)+' H71 L81 '+(by+13)+' V'+(by+24)+' L71 '+(by+31)+' H49 L39 '+(by+24)+' V'+(by+13)+'Z" fill="#23202e" stroke="#dfe3ee" stroke-width="2.4" stroke-linejoin="round"/><path d="M43 '+(by+18)+' H77 M43 '+(by+23)+' H77" stroke="#6b6585" stroke-width="1.4"/><path d="M60 '+(by+7)+' V'+(by+29)+'" stroke="#6b6585" stroke-width="1.2"/>'
  +'<rect x="14" y="'+(by+bh-8)+'" width="92" height="8" rx="4" fill="#2b2f3a" stroke="'+INK+'" stroke-opacity=".5" stroke-width="1"/><circle cx="26" cy="'+(by+bh-4)+'" r="2.2" fill="#ffe27a"/><circle cx="94" cy="'+(by+bh-4)+'" r="2.2" fill="#ffe27a"/>'}});

def('beetle',{n:'Retro Beetle',p:170,by:50,bh:36,br:20,bx:14,ct:12,ci:18,tw:17,tx:3,wh:26,cabD:'M18 52 C18 26 36 12 60 12 C84 12 102 26 102 52Z',
 wsd:{d:'M26 49 C27 31 40 20 60 20 C80 20 93 31 94 49Z',x0:36,x1:84,t:20,b:49},
 a:function(m,c){var by=m.by,s='fill="'+c.col+'" stroke="'+INK+'" stroke-opacity=".4" stroke-width="1.2"';return '<ellipse cx="22" cy="'+(by+17)+'" rx="15" ry="18" '+s+'/><ellipse cx="98" cy="'+(by+17)+'" rx="15" ry="18" '+s+'/><ellipse cx="22" cy="'+(by+17)+'" rx="15" ry="18" fill="url(#'+c.u+'s)"/><ellipse cx="98" cy="'+(by+17)+'" rx="15" ry="18" fill="url(#'+c.u+'s)"/><path d="M50 '+(by+1)+' Q60 '+(by-1)+' 70 '+(by+1)+' V'+(by+14)+' Q60 '+(by+16)+' 50 '+(by+14)+'Z" fill="#fff" opacity=".18"/>'},
 b:function(m,c){var by=m.by,bh=m.bh;
  return lamp(22,by+8,9,-1,true)+lamp(98,by+8,9,1,true)+heart(60,by+9,4,'#ffd1e6','#fff')+'<path d="M12 '+(by+bh-7)+' Q60 '+(by+bh+3)+' 108 '+(by+bh-7)+'" stroke="'+INK+'" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M12 '+(by+bh-7)+' Q60 '+(by+bh+3)+' 108 '+(by+bh-7)+'" stroke="#dfe3ee" stroke-width="4.4" fill="none" stroke-linecap="round"/><path d="M26 '+(by+bh-5)+' Q60 '+(by+bh+1)+' 94 '+(by+bh-5)+'" stroke="#fff" stroke-width="1.2" fill="none" opacity=".8"/>'}});

def('crossover',{n:'Crossover',p:230,by:47,bh:40,br:14,ct:15,ci:19,ti:12,dm:4,wt:4,wh:28,
 roof:function(m,c){return both(function(d){return '<rect x="'+(d<0?25:85)+'" y="'+(m.ct-3)+'" width="10" height="3" rx="1.5" fill="#3a3050"/>'})+'<path d="M30 '+(m.ct-2)+' H90" stroke="#3a3050" stroke-width="1.4" opacity=".0"/>'},
 b:function(m,c){var by=m.by,bh=m.bh;
  return both(function(d){return poly(d,[[47,by+5],[17,by+8],[16,by+15],[20,by+19],[45,by+17],[48,by+12]],'fill="#eef6ff" stroke="'+INK+'" stroke-width="1.6" stroke-linejoin="round"')+'<path d="M'+X(d,43)+' '+(by+13)+' L'+X(d,22)+' '+(by+12)+'" stroke="#58c7f5" stroke-width="2.2" stroke-linecap="round"/>'})
  +'<path d="M43 '+(by+7)+' H77 L72 '+(by+22)+' H48Z" fill="#26203a" stroke="#c9cfdc" stroke-width="1.6" stroke-linejoin="round"/><path d="M46 '+(by+13)+' H74" stroke="#c9cfdc" stroke-width="1.6"/><circle cx="60" cy="'+(by+16.5)+'" r="3" fill="#c9cfdc"/>'
  +'<path d="M26 '+(by+26)+' H94 L88 '+(by+bh-1)+' H32Z" fill="#26203a" stroke="'+INK+'" stroke-opacity=".6" stroke-width="1"/><path d="M34 '+(by+30)+' H86 M36 '+(by+34)+' H84" stroke="#4a4266" stroke-width="1.6"/>'+bar(m,'#c9cfdc',12,108,6)}});

def('jeep',{n:'Trail Jeep',p:300,by:44,bh:42,br:7,bx:8,ct:11,ci:17,ti:2,dm:1,wt:4,wh:34,tw:19,tx:1,rimC:'#8a93a3',
 roof:function(m,c){var y=m.ct;return '<rect x="22" y="'+(y-6)+'" width="76" height="3" rx="1.5" fill="#3a3050"/>'+[28,60,92].map(function(x){return '<rect x="'+(x-1.5)+'" y="'+(y-6)+'" width="3" height="7" fill="#3a3050"/>'}).join('')+'<path d="M40 '+(y-6)+' v-2 M80 '+(y-6)+' v-2" stroke="#3a3050" stroke-width="1.5"/>'},
 a:function(m,c){var by=m.by;return both(function(d){return '<rect x="'+(d<0?8:76)+'" y="'+(by+2)+'" width="36" height="28" rx="9" fill="#3a3050" opacity=".9"/>'})},
 b:function(m,c){var by=m.by,bh=m.bh;
  return both(function(d){return '<circle cx="'+X(d,35)+'" cy="'+(by+15)+'" r="11" fill="#1d1830"/>'+lamp(X(d,35),by+15,8.3,d,false)})
  +'<rect x="40" y="'+(by+4)+'" width="40" height="26" rx="6" fill="#26203a" stroke="#cfd5e3" stroke-width="1.8"/><path d="M45 '+(by+10)+' H75 M45 '+(by+16)+' H75 M45 '+(by+22)+' H75" stroke="#6b6585" stroke-width="2.2" stroke-linecap="round"/>'+heart(60,by+17,3,'#ff8fc1')
  +bar(m,'#2b2740',8,112,12)+'<circle cx="30" cy="'+(by+bh-6)+'" r="2.4" fill="#ffc61a"/><circle cx="90" cy="'+(by+bh-6)+'" r="2.4" fill="#ffc61a"/>'}});

def('pickup',{n:'Pickup',p:380,by:42,bh:44,br:8,bx:9,ct:14,ci:27,ti:5,dm:2,wt:4,wh:34,tw:19,tx:1,sp:8,
 pre:function(m,c){var by=m.by;return both(function(d){return '<rect x="'+(d<0?11:99)+'" y="'+(by-9)+'" width="10" height="14" rx="3" fill="'+c.col+'" stroke="'+INK+'" stroke-opacity=".45" stroke-width="1.2"/><rect x="'+(d<0?11:99)+'" y="'+(by-9)+'" width="10" height="14" rx="3" fill="#000" opacity=".16"/>'})},
 b:function(m,c){var by=m.by,bh=m.bh;
  return both(function(d){return '<rect x="'+(d<0?12:76)+'" y="'+(by+8)+'" width="32" height="13" rx="3.5" fill="#26203a" stroke="'+INK+'" stroke-width="1.2"/><rect x="'+(d<0?15:79)+'" y="'+(by+10)+'" width="26" height="9" rx="2.5" fill="#fffbe6"/><rect x="'+(d<0?18:82)+'" y="'+(by+12)+'" width="20" height="5" rx="2" fill="#ffe27a"/>'+'<circle cx="'+X(d,40)+'" cy="'+(by+30)+'" r="3" fill="#fffbe6" stroke="'+INK+'" stroke-width="1.2"/>'})
  +'<rect x="40" y="'+(by+4)+'" width="40" height="26" rx="4" fill="#dfe3ee" stroke="'+INK+'" stroke-width="1.6"/><path d="M42 '+(by+11)+' H78 M42 '+(by+17)+' H78 M42 '+(by+23)+' H78" stroke="#8a93a8" stroke-width="3"/><circle cx="60" cy="'+(by+17)+'" r="4.6" fill="'+c.col+'" stroke="'+INK+'" stroke-width="1.4"/>'
  +chromeBar(m,10,110,10)}});

def('van',{n:'Retro Van',p:460,by:46,bh:42,br:14,bx:8,ct:15,ci:10,ti:3,dm:2,wt:4,wh:26,cabFill:'#f3ecd2',sp:12,split:1,
 roof:function(m,c){var y=m.ct;return '<rect x="22" y="'+(y-3.5)+'" width="76" height="2.6" rx="1.3" fill="#8a93a3"/>'+[30,90].map(function(x){return '<rect x="'+(x-1.4)+'" y="'+(y-3.5)+'" width="2.8" height="4" fill="#8a93a3"/>'}).join('')+'<g><ellipse cx="60" cy="'+(y-7)+'" rx="40" ry="4.4" fill="#ffd3e8" stroke="'+INK+'" stroke-width="1.4"/><path d="M24 '+(y-7)+' H96" stroke="#0b7a3b" stroke-width="2" opacity=".85"/><ellipse cx="46" cy="'+(y-8.4)+'" rx="14" ry="1" fill="#fff" opacity=".7"/></g>'},
 a:function(m,c){var by=m.by;return '<path d="M9 '+(by+1)+' L60 '+(by+26)+' L111 '+(by+1)+' L111 '+(by-1)+' L9 '+(by-1)+'Z" fill="#f3ecd2" stroke="'+INK+'" stroke-opacity=".35" stroke-width="1.2" stroke-linejoin="round"/><path d="M9 '+(by+1)+' L60 '+(by+26)+' L111 '+(by+1)+'" stroke="#fff" stroke-width="2" fill="none" opacity=".5"/>'},
 b:function(m,c){var by=m.by,bh=m.bh;
  return lamp(23,by+26,8.4,-1,true)+lamp(97,by+26,8.4,1,true)+chromeRing(60,by+15,8)+heart(60,by+16,4.6,'#ff4f93')+'<path d="M52 '+(by+27)+' H68" stroke="#fff" stroke-width="1" opacity="0"/>'
  +chromeBar(m,10,110,8)}});

def('suv',{n:'Adventure SUV',p:550,by:40,bh:47,br:12,bx:10,ct:10,ci:15,ti:7,dm:3,wt:4,wh:32,tw:18,tx:2,
 roof:function(m,c){var y=m.ct;return '<rect x="30" y="'+(y-10)+'" width="60" height="8" rx="4" fill="#3a3050" stroke="'+INK+'" stroke-width="1"/><path d="M36 '+(y-8)+' H84" stroke="#fff" stroke-width="1.4" opacity=".28" stroke-linecap="round"/>'+both(function(d){return '<rect x="'+(d<0?28:88)+'" y="'+(y-3)+'" width="4" height="4" fill="#3a3050"/>'})+'<rect x="24" y="'+(y-2)+'" width="72" height="2.4" rx="1.2" fill="#3a3050"/>'},
 b:function(m,c){var by=m.by,bh=m.bh;
  return both(function(d){return poly(d,[[48,by+6],[16,by+9],[15,by+17],[19,by+21],[44,by+17],[49,by+13]],'fill="#eef6ff" stroke="'+INK+'" stroke-width="1.6" stroke-linejoin="round"')+'<path d="M'+X(d,44)+' '+(by+14)+' L'+X(d,21)+' '+(by+13.5)+'" stroke="#58c7f5" stroke-width="2.2" stroke-linecap="round"/><circle cx="'+X(d,36)+'" cy="'+(by+30)+'" r="3.4" fill="#fffbe6" stroke="'+INK+'" stroke-width="1.2"/>'})
  +'<path d="M42 '+(by+6)+' H78 L74 '+(by+24)+' H46Z" fill="#26203a" stroke="#c9cfdc" stroke-width="1.6" stroke-linejoin="round"/><path d="M45 '+(by+11)+' H75 M46 '+(by+16)+' H74 M47 '+(by+21)+' H73" stroke="#6b6585" stroke-width="1.8"/>'
  +'<path d="M30 '+(by+bh-9)+' H90 L86 '+(by+bh)+' H34Z" fill="#aab2bf" stroke="'+INK+'" stroke-opacity=".6" stroke-width="1"/>'+bar(m,'#2b2740',10,110,7)}});

def('buggy',{n:'Dune Buggy',p:650,by:58,bh:30,br:12,bx:26,ct:10,ci:30,wt:4,wh:40,tw:23,tx:0,sp:16,open:1,knob:1,py:null,hh:30,
 cage:1,rimC:'#d9c8f5',
 pre:function(m,c){return '<rect x="38" y="46" width="44" height="14" rx="5" fill="#5b3f86"/>'},
 post:function(m,c){var by=m.by;
  return '<path d="M32 '+(by+1)+' L38 16 Q60 9 82 16 L88 '+(by+1)+'" stroke="#2a2540" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M33 '+(by-2)+' L38.4 17 Q60 10.5 81.6 17 L87 '+(by-2)+'" stroke="#8d7fc0" stroke-width="1.2" fill="none" opacity=".7"/><path d="M60 11 V24" stroke="#2a2540" stroke-width="3"/>'
  +'<rect x="35" y="5" width="50" height="6" rx="3" fill="#2a2540"/>'+[42,53,67,78].map(function(x){return '<circle cx="'+x+'" cy="5" r="3.6" fill="#fffbe6" stroke="'+INK+'" stroke-width="1.2"/><circle cx="'+x+'" cy="5" r="1.7" fill="#ffe27a"/>'}).join('')
  +'<path d="M40 '+(by-8)+' H80 L84 '+(by-2)+' H36Z" fill="#dff1ff" opacity=".4" stroke="#fff" stroke-width="1.2"/>'},
 b:function(m,c){var by=m.by,bh=m.bh;
  return both(function(d){return lamp(X(d,22),by+12,7.4,d,true)})+'<rect x="44" y="'+(by+6)+'" width="32" height="14" rx="4" fill="#26203a" stroke="'+INK+'" stroke-opacity=".6" stroke-width="1"/><path d="M48 '+(by+10)+' H72 M48 '+(by+15)+' H72" stroke="#6b6585" stroke-width="1.6"/>'
  +'<path d="M28 '+(by+bh-5)+' H92" stroke="#2a2540" stroke-width="4.5" stroke-linecap="round"/><path d="M28 '+(by+bh-5)+' H92" stroke="#c9bfe6" stroke-width="1.4" stroke-linecap="round"/>'}});

def('classic',{n:'Classic',p:760,by:54,bh:34,br:12,bx:8,ct:25,ci:25,ti:13,dm:6,wt:5,wh:26,
 a:function(m,c){var by=m.by;return '<path d="M30 '+(by+1)+' Q60 '+(by-3)+' 90 '+(by+1)+'" stroke="#fff" stroke-width="2" fill="none" opacity=".4"/><path d="M42 '+(by+2)+' H78 L74 '+(by+8)+' H46Z" fill="#000" opacity=".22"/>'},
 b:function(m,c){var by=m.by,bh=m.bh;
  return both(function(d){return chromeRing(X(d,40),by+14,9.4)+lamp(X(d,40),by+14,7,d,false)})
  +'<rect x="34" y="'+(by+8)+'" width="52" height="15" rx="3" fill="#2b2740" stroke="#dfe3ee" stroke-width="2"/><path d="M40 '+(by+9)+' V'+(by+22)+' M46 '+(by+9)+' V'+(by+22)+' M52 '+(by+9)+' V'+(by+22)+' M68 '+(by+9)+' V'+(by+22)+' M74 '+(by+9)+' V'+(by+22)+' M80 '+(by+9)+' V'+(by+22)+'" stroke="#8f95aa" stroke-width="1.4"/>'+heart(60,by+16,3.4,'#ff8fc1','#fff')
  +chromeBar(m,6,114,7)+'<rect x="22" y="'+(by+bh-9)+'" width="5" height="9" rx="2.5" fill="#dfe3ee" stroke="'+INK+'" stroke-opacity=".5"/><rect x="93" y="'+(by+bh-9)+'" width="5" height="9" rx="2.5" fill="#dfe3ee" stroke="'+INK+'" stroke-opacity=".5"/>'}});

def('convertible',{n:'Convertible',p:880,by:56,bh:30,br:16,bx:10,ct:38,wh:26,open:1,hh:33,sp:36,dy:-3,
 wsd:{d:'M18 57 L26 51 L94 51 L102 57Z',x0:28,x1:92,t:51,b:57},
 pre:function(m,c){return '<path d="M32 58 V24 Q32 14 44 14 H76 Q88 14 88 24 V58Z" fill="#f4a0cf" stroke="'+INK+'" stroke-opacity=".5" stroke-width="1.2"/><path d="M38 22 Q60 17 82 22" stroke="#fff" stroke-width="1.6" fill="none" opacity=".35" stroke-linecap="round"/>'},
 post:function(m,c){return '<path d="M18 57 L26 51 L94 51 L102 57Z" fill="#dff1ff" opacity=".5" stroke="#eee9fa" stroke-width="3" stroke-linejoin="round"/>'},
 b:function(m,c){var by=m.by,bh=m.bh;
  return lamp(25,by+12,8.4,-1,true)+lamp(95,by+12,8.4,1,true)+'<ellipse cx="60" cy="'+(by+16)+'" rx="12" ry="5.6" fill="#3b2f55" stroke="#dfe3ee" stroke-width="1.8"/><path d="M52 '+(by+15)+' Q60 '+(by+21)+' 68 '+(by+15)+'" stroke="#ffd1e6" stroke-width="1.6" fill="none" stroke-linecap="round"/>'
  +'<rect x="26" y="'+(by+bh-8)+'" width="68" height="8" rx="4" fill="#efe9ff" stroke="'+INK+'" stroke-opacity=".4" stroke-width="1"/>'}});

def('coupe',{dk:1.3,n:'Sporty Coupe',p:1000,by:58,bh:30,br:14,bx:6,ct:35,ci:28,ti:16,dm:3,wt:3,wh:24,tw:20,tx:0,
 a:function(m,c){var by=m.by;return both(function(d){return poly(d,[[20,by+1],[9,by+1],[13,by+9],[24,by+8]],'fill="#000" opacity=".25"')})},
 b:function(m,c){var by=m.by,bh=m.bh;
  return both(function(d){return poly(d,[[53,by+5],[19,by+3],[13,by+9],[17,by+13],[48,by+12]],'fill="#eef6ff" stroke="'+INK+'" stroke-width="1.6" stroke-linejoin="round"')+'<path d="M'+X(d,45)+' '+(by+9)+' L'+X(d,20)+' '+(by+8)+'" stroke="#58c7f5" stroke-width="2.2" stroke-linecap="round"/><path d="M'+X(d,55)+' '+(by+1)+' l'+(d*4)+' -3" stroke="'+INK+'" stroke-width="1.8" stroke-linecap="round"/>'})
  +'<path d="M34 '+(by+14)+' H86 L80 '+(by+bh-5)+' H40Z" fill="#26203a" stroke="#c9cfdc" stroke-width="1.6" stroke-linejoin="round"/><path d="M38 '+(by+18)+' H82 M39 '+(by+22)+' H81" stroke="#5b5478" stroke-width="1.6"/>'+heart(60,by+7,2.6,'#ff8fc1')
  +'<rect x="12" y="'+(by+bh-4)+'" width="96" height="4" rx="2" fill="#2b2740"/>'}});

def('electric',{n:'Electric',p:1150,by:53,bh:34,br:18,bx:10,ct:22,ci:23,ti:14,dm:8,wt:4,wh:26,tx:4,rimC:'#e4daff',flat:1,
 b:function(m,c){var by=m.by,bh=m.bh;
  return both(function(d){return '<path d="M'+X(d,48)+' '+(by+8)+' Q'+X(d,33)+' '+(by+2)+' '+X(d,15)+' '+(by+7)+'" stroke="#58c7f5" stroke-width="5" fill="none" stroke-linecap="round" opacity=".35"/><path d="M'+X(d,48)+' '+(by+8)+' Q'+X(d,33)+' '+(by+2)+' '+X(d,15)+' '+(by+7)+'" stroke="#fff" stroke-width="2.8" fill="none" stroke-linecap="round"/><path d="M'+X(d,40)+' '+(by+7)+' Q'+X(d,30)+' '+(by+4.4)+' '+X(d,20)+' '+(by+7)+'" stroke="#58c7f5" stroke-width="1.4" fill="none" stroke-linecap="round"/>'})
  +'<path d="M44 '+(by+8)+' H76" stroke="#d9c8ff" stroke-width="2.4" stroke-linecap="round"/><circle cx="60" cy="'+(by+15)+'" r="5.4" fill="#fff" stroke="'+INK+'" stroke-opacity=".5" stroke-width="1.2"/><path d="M61 '+(by+11.6)+' L57.6 '+(by+15.6)+' H60.4 L59 '+(by+18.6)+' L63 '+(by+14)+' H60.2Z" fill="#8b5cf6"/>'
  +'<path d="M36 '+(by+bh-10)+' H84" stroke="#3b2f55" stroke-width="3.4" stroke-linecap="round" opacity=".85"/><path d="M26 '+(by+bh-3)+' H94" stroke="'+INK+'" stroke-opacity=".5" stroke-width="2.4" stroke-linecap="round"/>'}});

def('offroader',{n:'Off-Roader',p:1300,by:41,bh:46,br:8,bx:8,ct:11,ci:15,ti:3,dm:1,wt:4,wh:38,tw:20,tx:0,knob:1,sp:8,rimC:'#8a93a3',
 roof:function(m,c){var y=m.ct;return '<rect x="22" y="'+(y-3)+'" width="76" height="2.6" rx="1.3" fill="#3a3050"/><rect x="30" y="'+(y-11)+'" width="60" height="7" rx="3.5" fill="#26203a" stroke="'+INK+'" stroke-width="1"/>'+[38,50,62,74,82].slice(0,4).map(function(x,i){return '<circle cx="'+(x+4+i*0)+'" cy="'+(y-7.5)+'" r="2.6" fill="#ffe27a" stroke="'+INK+'" stroke-width=".8"/>'}).join('')},
 a:function(m,c){var by=m.by;return both(function(d){return '<rect x="'+(d<0?8:74)+'" y="'+(by+2)+'" width="38" height="30" rx="9" fill="#2b2740" opacity=".92"/>'})+'<path d="M46 '+(by+3)+' H60 M60 '+(by+3)+' H74" stroke="#000" opacity="0"/><path d="M40 '+(by+2)+' l6 5 M80 '+(by+2)+' l-6 5" stroke="#2b2740" stroke-width="2.4" stroke-linecap="round" opacity=".7"/>'},
 b:function(m,c){var by=m.by,bh=m.bh;
  return both(function(d){return '<circle cx="'+X(d,36)+'" cy="'+(by+16)+'" r="12.4" fill="#1d1830"/><circle cx="'+X(d,36)+'" cy="'+(by+16)+'" r="10.6" fill="none" stroke="#7fe3ff" stroke-width="2.4" opacity=".95"/>'+lamp(X(d,36),by+16,7.4,d,false,'#fffbe6','#fff2a8')})
  +'<rect x="44" y="'+(by+7)+'" width="32" height="22" rx="4" fill="#26203a" stroke="#8a93a8" stroke-width="1.6"/><path d="M47 '+(by+14)+' H73 M47 '+(by+19)+' H73 M47 '+(by+24)+' H73" stroke="#5b5478" stroke-width="1.6"/><rect x="47" y="'+(by+9)+'" width="26" height="2.6" rx="1.3" fill="#ffd36b"/>'
  +bar(m,'#2b2740',8,112,13)+'<path d="M22 '+(by+bh-13)+' V'+(by+bh-20)+' H98 V'+(by+bh-13)+'" stroke="#aab2bf" stroke-width="2.4" fill="none" stroke-linejoin="round"/><circle cx="30" cy="'+(by+bh-5)+'" r="2.4" fill="#ffc61a"/><circle cx="90" cy="'+(by+bh-5)+'" r="2.4" fill="#ffc61a"/>'}});

def('dream',{dk:1.3,n:'Dream Sportscar',p:1500,by:64,bh:24,br:12,bx:6,ct:41,ci:30,ti:17,dm:2,wt:3,wh:21,tw:21,tx:0,holo:1,sp:34,rimC:'#fff0ff',
 a:function(m,c){var by=m.by;return both(function(d){return poly(d,[[26,by+1],[14,by+1],[18,by+8],[28,by+7]],'fill="#fff" opacity=".28"')})},
 b:function(m,c){var by=m.by,bh=m.bh;
  return both(function(d){return poly(d,[[54,by+4],[20,by+2],[13,by+7],[18,by+11],[50,by+10]],'fill="#f2fbff" stroke="'+INK+'" stroke-width="1.6" stroke-linejoin="round"')+'<path d="M'+X(d,47)+' '+(by+7.4)+' L'+X(d,22)+' '+(by+6.6)+'" stroke="#ff9bd8" stroke-width="2.4" stroke-linecap="round"/><path d="M'+X(d,56)+' '+(by+1)+' l'+(d*4)+' -3.6 M'+X(d,50)+' '+(by-.2)+' l'+(d*3)+' -3" stroke="'+INK+'" stroke-width="1.8" stroke-linecap="round"/>'})
  +'<path d="M30 '+(by+12)+' H90 L84 '+(by+bh-4)+' H36Z" fill="#1d1830" stroke="#fff" stroke-opacity=".8" stroke-width="1.4" stroke-linejoin="round"/><path d="M38 '+(by+16)+' H82" stroke="#ff7fc4" stroke-width="1.8" stroke-linecap="round" opacity=".9"/>'+heart(60,by+7,2.8,'#fff',INK)
  +'<rect x="12" y="'+(by+bh-3)+'" width="96" height="4" rx="2" fill="#2b2740"/>'},
 fx:function(m,c){var s=function(x,y,r){return '<path d="M'+x+' '+(y-r)+' l'+f(r*.3)+' '+f(r*.7)+' l'+f(r*.7)+' '+f(r*.3)+' l'+f(-r*.7)+' '+f(r*.3)+' l'+f(-r*.3)+' '+f(r*.7)+' l'+f(-r*.3)+' '+f(-r*.7)+' l'+f(-r*.7)+' '+f(-r*.3)+' l'+f(r*.7)+' '+f(-r*.3)+'z" fill="#fff"/>'};return '<g opacity=".95">'+s(10,36,5)+s(110,48,4)+s(100,30,3)+'</g>'}});

var ORDER=['clunker','compact','mini','beetle','crossover','jeep','pickup','van','suv','buggy','classic','convertible','coupe','electric','offroader','dream'];

/* ---------- decals ---------- */
var DECALS=[['stripes','Stripes',50],['paw','Husky paw',25],['fjh','FJH badge',30],['hearts','Hearts',25],['stars','Stars',25],['mountain','Mountain',35],['checker','Checkers',40],['bow','Roof bow',30],['flame','Flames',45],['flowers','Flowers',35],['rims','Gold rims',70],['spoiler','Spoiler',60],['glow','Underglow',90]];
function star(x,y,r,fill){var p=[];for(var i=0;i<10;i++){var a=-Math.PI/2+i*Math.PI/5,rr=i%2?r*.46:r;p.push(f(x+Math.cos(a)*rr)+' '+f(y+Math.sin(a)*rr))}return '<path d="M'+p.join(' L')+'Z" fill="'+fill+'" stroke="#fff" stroke-width=".9" stroke-linejoin="round"/>'}
function decals(m,up,col,u,big){
 var by=m.by,bh=m.bh,k=big?1.7:1,o='',has=function(x){return up.indexOf(x)>=0},
  S={H:[60,by+4.5],P:[40,by+4.5],Q:[80,by+4.5],BL:[17,by+bh-14],BR:[103,by+bh-14],ML:[37,by+bh-13],MR:[83,by+bh-13],FL:[15,by+bh-8],FR:[105,by+bh-8]};
 if(big)S={H:[60,by+bh*.3],P:[44,by+bh*.34],Q:[76,by+bh*.34],BL:[30,by+bh*.62],BR:[90,by+bh*.62],ML:[46,by+bh*.55],MR:[74,by+bh*.55],FL:[24,by+bh*.6],FR:[96,by+bh*.6]};
 var g=function(p,s,inner){return '<g transform="translate('+f(p[0])+' '+f(p[1])+') scale('+f(s*k)+')">'+inner+'</g>'};
 if(has('checker')){var cy=big?by+bh*.62:by+bh-15,cs=big?4.4:3,sq='';for(var r=0;r<2;r++)for(var i=0;i<(big?14:20);i++){var n=big?14:20;sq+='<rect x="'+f(60-n*cs/2+i*cs)+'" y="'+f(cy+r*cs)+'" width="'+cs+'" height="'+cs+'" fill="'+((i+r)%2?'#fff':'#23202e')+'"/>'}o+=sq+'<rect x="'+f(60-(big?14:20)*cs/2)+'" y="'+cy+'" width="'+f((big?14:20)*cs)+'" height="'+cs*2+'" fill="none" stroke="#fff" stroke-width=".8"/>'}
 if(has('paw')){var paw='<g fill="'+GR+'" stroke="#fff" stroke-width=".9"><ellipse cx="0" cy="2" rx="3.7" ry="3.1"/><circle cx="-4.2" cy="-1.8" r="1.7"/><circle cx="-1.5" cy="-4.2" r="1.8"/><circle cx="1.5" cy="-4.2" r="1.8"/><circle cx="4.2" cy="-1.8" r="1.7"/></g>';o+=g(S.P,1,paw)+g(S.Q,1,paw)}
 if(has('fjh'))o+=g(S.H,1,'<rect x="-13" y="-4.4" width="26" height="8.8" rx="4.4" fill="'+GR+'" stroke="#fff" stroke-width="1"/><text x="0" y="2.4" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="6.6" fill="#fff">FJH</text>');
 if(has('hearts')){var h=function(){return heart(0,0,3.8,'#ff4f93','#fff')};o+=g(S.BL,1,h())+g(S.BR,1,h())+g([S.BL[0]+(big?9:6),S.BL[1]+(big?9:4)],.7,h())}
 if(has('stars'))o+=g(S.ML,1,star(0,0,5,'#ffd34d'))+g(S.MR,1,star(0,0,5,'#ffd34d'))+g([S.MR[0]+(big?9:6),S.MR[1]-(big?9:5)],.6,star(0,0,5,'#fff'));
 if(has('mountain')){var mt='<circle cx="0" cy="0" r="7" fill="#c9b8f0" stroke="#fff" stroke-width="1"/><path d="M-5 4 L-1 -3.6 L1.4 .4 L3 -1.6 L6 4Z" fill="'+GR+'"/><path d="M-1 -3.6 L-2.8 -.6 L-1 -1.4 L.4 -.6Z" fill="#fff"/>';o+=g(S.FL,1,mt)+g(S.FR,1,mt)}
 if(has('flame')){var fl=function(d){return '<g transform="scale('+d+' 1)"><path d="M-1 7 C-7 5 -7 -1 -2 -6 C-2 -3 0 -3 1 -6 C6 -2 7 3 4 6 C2 8 0 8 -1 7Z" fill="#ff6a1f" stroke="#fff" stroke-width=".8"/><path d="M0 6 C-3 4 -2 1 0 -1 C1 1 3 2 2.4 4.6 C2 6 1 6 0 6Z" fill="#ffd23f"/></g>'};o+=g(S.FL,1.1,fl(1))+g(S.FR,1.1,fl(-1))+g([S.FL[0]+(big?12:9),S.FL[1]+3],.8,fl(1))+g([S.FR[0]-(big?12:9),S.FR[1]+3],.8,fl(-1))}
 if(has('flowers')){var fw=function(){var p='';for(var i=0;i<5;i++){var a=i*Math.PI*2/5;p+='<circle cx="'+f(Math.cos(a)*2.6)+'" cy="'+f(Math.sin(a)*2.6)+'" r="2.1" fill="#ffb3d9" stroke="#fff" stroke-width=".6"/>'}return p+'<circle r="1.7" fill="#ffd34d"/>'};o+=g(S.P,1,fw())+g(S.Q,1,fw())+g(S.ML,.8,fw())+g(S.MR,.8,fw())}
 if(has('bow')){var by2=(m.bowy!=null?m.bowy:m.ct-6);o+=g([60,big?by+bh*.3:by2],big?1:1.05,'<path d="M0 0 l-11 -8 l0 13z M0 0 l11 -8 l0 13z" fill="#ff8fc1" stroke="#fff" stroke-width="1.3" stroke-linejoin="round"/><circle r="3.2" fill="#ffd1e6" stroke="#fff" stroke-width=".8"/>')}
 return o}

/* ---------- main renderer ---------- */
var _cq=0;
carSVG=function(av,cls){
 av=av||{};cls=cls||'carsvg';
 var id=M[av.car]?av.car:'clunker',m=M[id],up=Array.isArray(av.up)?av.up:[],u='cq'+(++_cq),cc=av.carColor,base=CARC[cc]||CARC.fjh,
  holo=!!m.holo||cc==='holo',paint=base,big=/\btpv\b/.test(cls)&&up.length===1&&['rims','glow','spoiler'].indexOf(up[0])<0;
 if(id==='clunker')paint=mixc(base,'#a99878',.45);
 if(holo)paint='url(#'+u+'h)';
 var hb=cc==='holo'?'#ffffff':base,hs=cc==='holo'?0:.78;
 var by=m.by,bh=m.bh,gy=by+bh,bw=120-2*m.bx,c={col:paint,u:u},tl=m.ci+m.ti,tr=120-tl,cb=by+2,ct=m.ct;
 var cabD=m.cabD||('M'+m.ci+' '+cb+' L'+tl+' '+(ct+2)+' Q'+tl+' '+ct+' '+(tl+3)+' '+ct+' Q60 '+f(ct-m.dm-1)+' '+(tr-3)+' '+ct+' Q'+tr+' '+ct+' '+tr+' '+(ct+2)+' L'+(120-m.ci)+' '+cb+'Z');
 var ws=m.wsd||(function(){var t=ct+m.wt,b=by-1,tlx=tl+4,trx=tr-4,blx=m.ci+5,brx=115-m.ci;return{d:'M'+blx+' '+b+' L'+tlx+' '+t+' Q60 '+f(t-m.dm)+' '+trx+' '+t+' L'+brx+' '+b+'Z',x0:tlx,x1:trx,t:t,b:b}})();
 /* driver */
 var ah,aw,ax,ay,wsW=ws.x1-ws.x0,wsH=ws.b-ws.t;
 if(m.open){ah=m.hh;aw=ah*56/66}else{ah=wsH*(m.dk||1.1);aw=ah*56/66;if(aw>wsW*.9){aw=wsW*.9;ah=aw*66/56}}
 ax=60-aw/2;ay=ws.b-ah+(m.dy!=null?m.dy:(m.open?4:1.5));
 var drv='<svg x="'+f(ax)+'" y="'+f(ay)+'" width="'+f(aw)+'" height="'+f(ah)+'" viewBox="22 6 56 66">'+charBody(av,'head')+'</svg>';
 var rimC=up.indexOf('rims')>=0?'#ffc61a':(m.rimC||'#a9b0c4'),gold=up.indexOf('rims')>=0;
 var stripeC=lum(base)>185&&!holo?GR:'#f3f4f6';
 /* defs */
 var defs='<defs><linearGradient id="'+u+'s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".42"/><stop offset=".42" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#1a0f33" stop-opacity=".22"/></linearGradient>'
  +'<linearGradient id="'+u+'g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eaf5ff"/><stop offset="1" stop-color="#a9c8ef"/></linearGradient>'
  +(holo?'<linearGradient id="'+u+'h" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="'+mixc(hb,'#ff9fd8',1-hs)+'"/><stop offset=".3" stop-color="'+mixc(hb,'#9fe6ff',1-hs)+'"/><stop offset=".62" stop-color="'+mixc(hb,'#d6b8ff',1-hs)+'"/><stop offset="1" stop-color="'+mixc(hb,'#b9ffe0',1-hs)+'"/></linearGradient>':'')
  +'<clipPath id="'+u+'w"><path d="'+ws.d+'"/></clipPath><clipPath id="'+u+'k"><path d="'+cabD+'"/></clipPath><clipPath id="'+u+'b"><rect x="'+m.bx+'" y="'+by+'" width="'+bw+'" height="'+bh+'" rx="'+m.br+'"/></clipPath></defs>';
 var line='stroke="'+INK+'" stroke-opacity=".42" stroke-width="1.3" stroke-linejoin="round"';
 var vb=big?'8 '+(by-30)+' 104 '+(bh+40):'0 -8 120 108';
 var o='<svg class="'+cls+'" viewBox="'+vb+'" role="img" aria-label="Your car, '+m.n+'" xmlns="http://www.w3.org/2000/svg">'+defs;
 if(up.indexOf('glow')>=0)o+='<ellipse cx="60" cy="96" rx="59" ry="7.5" fill="#22d3ee" opacity=".5"/><ellipse cx="60" cy="96.5" rx="43" ry="4.2" fill="#a5f3fc" opacity=".8"/><ellipse cx="60" cy="97" rx="24" ry="2.4" fill="#fff" opacity=".7"/>';
 o+='<ellipse cx="60" cy="97.4" rx="'+(m.dm>8?52:54)+'" ry="3.3" fill="'+INK+'" opacity=".26"/>';
 if(m.wob)o+='<g class="cq-wob">';
 if(up.indexOf('spoiler')>=0){var sp=m.sp!=null?m.sp:ct-3;o+='<rect x="27" y="'+sp+'" width="5" height="14" fill="#1d1830"/><rect x="88" y="'+sp+'" width="5" height="14" fill="#1d1830"/><rect x="14" y="'+(sp-6)+'" width="92" height="7" rx="3.5" fill="#2b2640" stroke="'+INK+'" stroke-width="1"/><rect x="18" y="'+(sp-4.6)+'" width="84" height="1.8" rx=".9" fill="#fff" opacity=".35"/><rect x="14" y="'+(sp-6)+'" width="7" height="7" rx="3" fill="'+(holo?hb:base)+'"/><rect x="99" y="'+(sp-6)+'" width="7" height="7" rx="3" fill="'+(holo?hb:base)+'"/>'}
 /* wheels */
 [m.tx,120-m.tx-m.tw].forEach(function(x,i){var y=97-m.wh,tw=m.tw,wh=m.wh,rc=(i?m.rimR:m.rimL)||rimC;if(gold)rc='#ffc61a';
  o+='<rect x="'+x+'" y="'+y+'" width="'+tw+'" height="'+wh+'" rx="'+f(Math.min(7,tw/2.3))+'" fill="#1d1830"/>';
  if(m.knob){for(var j=0;j<Math.floor(wh/6);j++)o+='<path d="M'+(x+1)+' '+(y+3+j*6)+' h3.2 M'+(x+tw-4.2)+' '+(y+3+j*6)+' h3.2" stroke="#4a4266" stroke-width="2" stroke-linecap="round"/>'}
  o+='<rect x="'+f(x+tw*.27)+'" y="'+f(y+wh*.2)+'" width="'+f(tw*.46)+'" height="'+f(wh*.6)+'" rx="2.6" fill="'+rc+'" stroke="'+(gold?'#b9860a':'#0006')+'" stroke-width="1"/><rect x="'+f(x+tw*.35)+'" y="'+f(y+wh*.28)+'" width="'+f(tw*.12)+'" height="'+f(wh*.3)+'" rx="1" fill="#fff" opacity="'+(gold?.8:.5)+'"/>'});
 if(m.pre)o+=m.pre(m,c);
 /* cabin */
 if(!m.open){o+='<path d="'+cabD+'" fill="'+(m.cabFill||paint)+'" '+line+'/>';
  o+='<g clip-path="url(#'+u+'k)">'+(m.cabFill?'':'')+'<path d="'+cabD+'" fill="url(#'+u+'s)"/>'+(up.indexOf('stripes')>=0?'<rect x="49" y="-8" width="6" height="'+(cb+8)+'" fill="'+stripeC+'" opacity=".95"/><rect x="65" y="-8" width="6" height="'+(cb+8)+'" fill="'+stripeC+'" opacity=".95"/>':'')+'</g>'}
 if(m.roof)o+=m.roof(m,c);
 /* glass and driver */
 if(!m.open){o+='<path d="'+ws.d+'" fill="url(#'+u+'g)"/>'+(m.split?'<path d="M60 '+ws.t+' V'+ws.b+'" stroke="#fff" stroke-width="3"/>':'')+'<g clip-path="url(#'+u+'w)">'+drv+'<path d="M'+(ws.x0)+' '+ws.t+' L'+(ws.x0+22)+' '+ws.t+' L'+(ws.x0+2)+' '+ws.b+'Z" fill="#fff" opacity=".2"/></g><path d="'+ws.d+'" fill="none" stroke="'+INK+'" stroke-opacity=".6" stroke-width="2.2" stroke-linejoin="round"/>'}
 else o+=drv;
 if(m.post)o+=m.post(m,c);
 /* body */
 o+='<rect x="'+m.bx+'" y="'+by+'" width="'+bw+'" height="'+bh+'" rx="'+m.br+'" fill="'+paint+'" '+line+'/>';
 if(m.a)o+=m.a(m,c);
 o+='<rect x="'+m.bx+'" y="'+by+'" width="'+bw+'" height="'+bh+'" rx="'+m.br+'" fill="url(#'+u+'s)"/><path d="M'+(m.bx+12)+' '+(by+5)+' Q'+(m.bx+28)+' '+(by+1.5)+' '+(m.bx+44)+' '+(by+3)+'" stroke="#fff" stroke-width="2.8" stroke-linecap="round" fill="none" opacity=".5"/>';
 if(id==='clunker')o+='<g clip-path="url(#'+u+'b)"><path d="M0 '+(by+8)+' L50 '+by+' L60 '+by+' L10 '+(by+14)+'Z" fill="#fff" opacity=".18"/></g>';
 if(up.indexOf('stripes')>=0)o+='<g clip-path="url(#'+u+'b)"><rect x="49" y="'+by+'" width="6" height="'+(bh-9)+'" fill="'+stripeC+'" opacity=".95"/><rect x="65" y="'+by+'" width="6" height="'+(bh-9)+'" fill="'+stripeC+'" opacity=".95"/></g>';
 if(!big)o+=decals(m,up,paint,u,big);
 o+=m.b(m,c);
 if(big)o+=decals(m,up,paint,u,big);
 /* plate */
 var py=m.py!=null?m.py:gy-17;
 o+='<rect x="46" y="'+py+'" width="28" height="10" rx="2.6" fill="#fff" stroke="#8a93a3" stroke-width="1.4"/><text x="60" y="'+f(py+7.6)+'" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="7" fill="'+GR+'">FJH</text>';
 if(m.fx)o+=m.fx(m,c);
 if(m.wob)o+='</g>';
 return o+'</svg>'};

/* ---------- catalog ---------- */
var PRICE={};ORDER.forEach(function(k,i){PRICE[k]=M[k].p});
var carCat=CATS.find(function(x){return x.key==='car'}),colCat=CATS.find(function(x){return x.key==='carColor'}),upCat=CATS.find(function(x){return x.key==='up'});
carCat.items=ORDER.map(function(k){return{id:k,n:M[k].n,p:M[k].p}});
colCat.items=COLS.map(function(c){return{id:c[0],n:c[1],c:c[0]==='holo'?HOLOCSS:c[2],p:c[0]==='holo'?60:0}});
upCat.items=DECALS.map(function(d){return{id:d[0],n:d[1],p:d[2]}});
ORDER.forEach(function(k){MODELS[k]={by:M[k].by,bh:M[k].bh,ct:M[k].ct,ci:M[k].ci,wh:M[k].wh}});
DEFAV.car='clunker';DEFAV.carColor='rust';DEFAV.up=[];

/* ---------- old save migration ---------- */
var OLD={hatch:'compact',sedan:'classic',suv:'suv',truck:'pickup',sport:'coupe'};
function migrate(){var ch=false;
 if(typeof S!=='object'||!S)return false;
 if(S.own)Object.keys(S.own).forEach(function(k){var mm=/^car:(.+)$/.exec(k);if(mm&&OLD[mm[1]]&&mm[1]!=='hatch'&&OLD[mm[1]]!==mm[1]&&!S.own['car:'+OLD[mm[1]]]){S.own['car:'+OLD[mm[1]]]=1;ch=true}});
 var a=S.avatar;
 if(a){
  if(OLD[a.car]&&OLD[a.car]!==a.car){S.own=S.own||{};S.own['car:'+OLD[a.car]]=1;a.car=OLD[a.car];ch=true}
  else if(a.car&&!M[a.car]){a.car='clunker';ch=true}
  if(a.carColor&&!CARC[a.carColor]){a.carColor='fjh';ch=true}}
 return ch}
try{if(migrate()&&typeof save==='function')save()}catch(e){}
try{syncPlayer();render()}catch(e){}
window.VEH={M:M,order:ORDER,decals:DECALS.map(function(d){return d[0]}),start:'clunker'};
})();
