'use strict';
/* fx3d.js: CSS 3D + motion layer for Permit Quest. Loaded after fx.js. No assets, no network.
   Wraps window.render and enhances the DOM it produced. Everything is transform/opacity (WAAPI, CSS 3D, one canvas 2D confetti).
   Honors prefers-reduced-motion (static) and low-power devices (lighter effects). Any failure here must never break the app. */
(function(){
var D=document,R=D.documentElement,$=function(s,r){return (r||D).querySelector(s)},$$=function(s,r){return Array.prototype.slice.call((r||D).querySelectorAll(s))};
var mqRM=matchMedia('(prefers-reduced-motion: reduce)');
var lite=false;
try{lite=(navigator.hardwareConcurrency||8)<=4||(navigator.deviceMemory||4)<=2||!!(navigator.connection&&navigator.connection.saveData)||sessionStorage.getItem('pq-fx3-lite')==='1'}catch(e){}
function rm(){return mqRM.matches}
function flags(){R.classList.toggle('fx3-rm',rm());R.classList.toggle('fx3-lite',lite)}
flags();
(mqRM.addEventListener?mqRM.addEventListener('change',function(){flags();try{render()}catch(e){}}):mqRM.addListener(flags));
var EASE='cubic-bezier(.2,.9,.25,1)',SPRING='cubic-bezier(.2,1.6,.4,1)';
var hasTr=window.CSS&&CSS.supports&&CSS.supports('translate','1px');
function anim(el,kf,o){if(!el||!el.animate)return null;try{return el.animate(kf,o)}catch(e){return null}}
function clamp(v,a,b){return v<a?a:v>b?b:v}

/* ---------- adaptive guard: if frames get slow during an effect, drop to lite for the session ---------- */
var slow=0,seen=0;
function guard(dt){if(lite||dt>200)return;seen++;if(dt>38)slow++;if(seen>=30){if(slow/seen>.3){lite=true;try{sessionStorage.setItem('pq-fx3-lite','1')}catch(e){}flags()}seen=0;slow=0}}

/* ---------- device tilt (gyro) ---------- */
var tilt={x:0,y:0,tx:0,ty:0,on:false,g0:null,b0:null};
function onOri(e){if(e.gamma==null||e.beta==null)return;if(tilt.g0===null){tilt.g0=e.gamma;tilt.b0=e.beta}
 tilt.g0+=(e.gamma-tilt.g0)*.004;tilt.b0+=(e.beta-tilt.b0)*.004; /* slow recenter so the resting pose is neutral */
 tilt.tx=clamp((e.gamma-tilt.g0)/22,-1,1);tilt.ty=clamp((e.beta-tilt.b0)/22,-1,1);tilt.on=true;kick()}
function gyroOn(){if(tilt.listening)return;tilt.listening=true;window.addEventListener('deviceorientation',onOri,{passive:true})}
var needPerm=typeof DeviceOrientationEvent!=='undefined'&&typeof DeviceOrientationEvent.requestPermission==='function';
var gyroState='';try{gyroState=localStorage.getItem('pq-fx3-gyro')||''}catch(e){}
if(typeof DeviceOrientationEvent!=='undefined'&&!lite&&(!needPerm||gyroState==='yes')){gyroOn()}
function askGyro(){DeviceOrientationEvent.requestPermission().then(function(r){try{localStorage.setItem('pq-fx3-gyro',r==='granted'?'yes':'no')}catch(e){}if(r==='granted')gyroOn();var b=$('.fx3-tilt');if(b)b.remove()}).catch(function(){var b=$('.fx3-tilt');if(b)b.remove()})}

/* ---------- one shared rAF loop: springs for scenes, lean for town ---------- */
var scenes=[],raf=0,townLean=null,last=0;
function kick(){if(!raf)raf=requestAnimationFrame(frame)}
function frame(t){raf=0;var dt=last?Math.min(48,t-last):16;last=t;var busy=false;guard(dt);
 for(var i=scenes.length-1;i>=0;i--){var s=scenes[i];if(!s.el.isConnected){scenes.splice(i,1);continue}
  var ty=s.drag?s.ty:(tilt.on?tilt.tx*s.gy:0),tp=s.drag?s.tp:(tilt.on?-tilt.ty*s.gp:0);
  var k=s.drag?.34:.12;s.vy+=(ty-s.yaw)*k*dt/16;s.vp+=(tp-s.pitch)*k*dt/16;s.vy*=s.drag?.55:.78;s.vp*=s.drag?.55:.78;s.yaw+=s.vy;s.pitch+=s.vp;
  s.el.style.transform='rotateY('+s.yaw.toFixed(2)+'deg) rotateX('+s.pitch.toFixed(2)+'deg)';
  if(s.drag||tilt.on||Math.abs(s.yaw-ty)>.05||Math.abs(s.vy)>.02||Math.abs(s.pitch-tp)>.05||Math.abs(s.vp)>.02)busy=true;else{s.yaw=ty;s.pitch=tp;s.vy=s.vp=0;s.el.style.transform=''}}
 if(townLean&&townLean()){busy=true}
 if(busy)raf=requestAnimationFrame(frame);else last=0}

/* Build a pseudo-3D object: the real SVG in front, N darkened clones behind it on translateZ. */
function slices(svg,n,step,kind){
 var obj=D.createElement('div');obj.className='fx3-obj '+kind;svg.parentNode.insertBefore(obj,svg);
 for(var i=n;i>=1;i--){var c=svg.cloneNode(true);c.setAttribute('class','fx3-sv');c.setAttribute('aria-hidden','true');c.removeAttribute('role');
  var w=D.createElement('div');w.className='fx3-slice';w.style.transform='translateZ('+(-i*step).toFixed(1)+'px)';w.style.filter='brightness('+(.5+.05*i).toFixed(2)+')';w.appendChild(c);obj.appendChild(w)}
 obj.appendChild(svg);return obj}
function addShadow(obj){var s=D.createElement('i');s.className='fx3-sh';obj.insertBefore(s,obj.firstChild)}
function maskUrl(svg){try{var x=svg.outerHTML;if(x.indexOf('xmlns=')<0)x=x.replace('<svg','<svg xmlns="http://www.w3.org/2000/svg"');return 'url("data:image/svg+xml;charset=utf-8,'+encodeURIComponent(x)+'")'}catch(e){return ''}}
function glint(obj,svg){if(lite)return null;var g=D.createElement('i');g.className='fx3-glint';var u=maskUrl(svg);if(!u)return null;g.style.webkitMaskImage=u;g.style.maskImage=u;obj.appendChild(g);return g}
function hash(s){var h=5381;for(var i=0;i<s.length;i++)h=(h*33^s.charCodeAt(i))|0;return h}
function drag(host,sc){
 var id=null,x0=0,y0=0,yaw0=0,pit0=0;
 host.addEventListener('pointerdown',function(e){if(e.target.closest('button,a'))return;id=e.pointerId;x0=e.clientX;y0=e.clientY;yaw0=sc.yaw;pit0=sc.pitch;sc.drag=true;sc.ty=sc.yaw;sc.tp=sc.pitch;host.classList.add('drag');try{host.setPointerCapture(id)}catch(_){}kick()});
 host.addEventListener('pointermove',function(e){if(e.pointerId!==id)return;var dx=e.clientX-x0,dy=e.clientY-y0,r=yaw0+dx*.5;
  sc.ty=clamp(Math.abs(r)>42?Math.sign(r)*(42+(Math.abs(r)-42)*.25):r,-46,46);sc.tp=clamp(pit0-dy*.12,-9,9);kick()});
 var up=function(e){if(e.pointerId!==id)return;id=null;sc.drag=false;host.classList.remove('drag');kick()};
 host.addEventListener('pointerup',up);host.addEventListener('pointercancel',up)}

/* ---------- Garage: 3D turntable diorama ---------- */
var gKey={car:null,av:null},gWas=false,keep=null,keepRef=null,gCache={av:null,car:null};
function garage(){
 if(keepRef)keep={yaw:keepRef.yaw,pitch:keepRef.pitch};
 var host=$('.gprev');if(!host){gWas=false;return}
 var p1=$('.gp1',host),p2=$('.gp2',host),sv1=p1&&$('svg.avbig',p1),sv2=p2&&$('svg.carbig',p2);if(!sv1||!sv2)return;
 var nm=$('.gname',p2);if(nm){nm.classList.add('fx3-name');host.classList.add('fx3-flat');host.appendChild(nm)} /* flat label, same layout in every mode */
 if(rm())return;
 var kCar=hash(sv2.outerHTML),kAv=hash(sv1.outerHTML),first=!gWas;gWas=true;
 host.classList.add('fx3-stage');
 var sway=D.createElement('div');sway.className='fx3-sway';var scene=D.createElement('div');scene.className='fx3-scene';sway.appendChild(scene);
 host.insertBefore(sway,p1);scene.appendChild(p1);scene.appendChild(p2);

 var oA,oC,gl,cA=gCache.av,cC=gCache.car,lt=lite?1:0;
 if(cA&&cA.k===kAv&&cA.lt===lt){sv1.replaceWith(cA.o);oA=cA.o}else{oA=slices(sv1,lite?1:2,4.5,'av');addShadow(oA);gCache.av={k:kAv,lt:lt,o:oA}}
 if(cC&&cC.k===kCar&&cC.lt===lt){sv2.replaceWith(cC.o);oC=cC.o;gl=cC.g}else{oC=slices(sv2,lite?2:4,5.5,'car');addShadow(oC);gl=glint(oC,sv2);gCache.car={k:kCar,lt:lt,o:oC,g:gl}}
 var sc={el:scene,yaw:0,pitch:0,vy:0,vp:0,ty:0,tp:0,drag:false,gy:16,gp:6};
 scenes=scenes.filter(function(s){return s.el.isConnected});scenes.push(sc);if(keep){sc.yaw=sc.ty=keep.yaw;sc.pitch=sc.tp=keep.pitch}keepRef=sc;
 drag(host,sc);
 if(first){var h=D.createElement('div');h.className='fx3-hint';h.textContent='Drag to spin';host.appendChild(h);if(needPerm&&gyroState!=='yes'&&gyroState!=='no'&&!lite){var b=D.createElement('button');b.className='fx3-tilt';b.type='button';b.textContent='Tilt phone';b.addEventListener('click',function(e){e.stopPropagation();askGyro()});host.appendChild(b)}}
 var ring=D.createElement('i');ring.className='fx3-ring';host.insertBefore(ring,sway);
 if(first){ /* entrance: the turntable swings in with a spring */
  anim(scene,[{transform:'rotateY(-70deg) scale(.82)',opacity:0},{transform:'rotateY(9deg) scale(1.03)',opacity:1,offset:.62},{transform:'rotateY(0) scale(1)',opacity:1}],{duration:900,easing:EASE});
  if(gl)setTimeout(function(){gl.classList.add('go')},700);
  if(!lite)setTimeout(function(){if(scene.isConnected&&!sc.drag&&!tilt.on){sc.ty=-9;kick();setTimeout(function(){if(!sc.drag){sc.ty=0;kick()}},650)}},1300)}
 else{
  if(gKey.car!==null&&kCar!==gKey.car){ /* car swap: flip + zoom, floor ripple, glint */
   anim(oC,[{transform:'rotateY(-115deg) scale(.6) translateY(12px)',opacity:0},{transform:'rotateY(10deg) scale(1.08)',opacity:1,offset:.6},{transform:'none',opacity:1}],{duration:620,easing:SPRING});
   ring.classList.add('go');if(gl)setTimeout(function(){gl.classList.add('go')},380)}
  if(gKey.av!==null&&kAv!==gKey.av){anim(oA,[{transform:'scale(1,1)'},{transform:'scale(1.045,.94)',offset:.25},{transform:'scale(.98,1.04)',offset:.55},{transform:'scale(1,1)'}],{duration:480,easing:'ease-out'})}}
 gKey.car=kCar;gKey.av=kAv;
 if(gl)gl.addEventListener('animationend',function(){gl.classList.remove('go')});
 kick()}

/* ---------- Town: standees that lean with tilt/scroll, reveal on first view, spring lift on unlock ---------- */
var revealed={},townSet=[];
function unlockedIds(){var o=[];try{CHAPTERS.forEach(function(c,i){if(unlocked(i))o.push(c.id)})}catch(e){}return o}
function town(){
 var tw=$('.town');if(!tw||rm())return;
 var tls=$$('.tl',tw);townSet=[];
 tls.forEach(function(tl){var art=$('.art',tl),sv=art&&$('svg',art);if(!sv)return;var key=tl.dataset.v||tl.className;
  if(!lite){sv.classList.add('fx3-lean')}townSet.push({tl:tl,sv:sv,art:art,key:key,vis:true,cy:0})});
 /* unlock lift: compare against ids already seen on this device */
 var cur=unlockedIds(),seenIds=null;try{seenIds=JSON.parse(localStorage.getItem('pq-fx3-unl')||'null')}catch(e){}
 if(!seenIds){try{localStorage.setItem('pq-fx3-unl',JSON.stringify(cur))}catch(e){}}
 else{var fresh=cur.filter(function(id){return seenIds.indexOf(id)<0});
  if(fresh.length){try{localStorage.setItem('pq-fx3-unl',JSON.stringify(cur))}catch(e){}
   fresh.forEach(function(id,n){var it=townSet.filter(function(x){return x.key===id})[0];if(it){revealed[id]=1;setTimeout(function(){lift(it)},500+n*250)}})}}
 /* first-view reveal (once per session per building) */
 if('IntersectionObserver' in window&&!lite){
  var io=new IntersectionObserver(function(es){es.forEach(function(en){var it=townSet.filter(function(x){return x.tl===en.target})[0];if(!it)return;it.vis=en.isIntersecting;
   if(en.isIntersecting&&!revealed[it.key]){revealed[it.key]=1;pop(it)}});kick()},{rootMargin:'40px'});
  townSet.forEach(function(x){io.observe(x.tl)})}
 var measure=function(){var sy=scrollY;townSet.forEach(function(x){var r=x.tl.getBoundingClientRect();x.mid=r.top+sy+r.height*.5})};
 requestAnimationFrame(function(){try{measure();kick()}catch(e){}});if(!town.rz){town.rz=1;addEventListener('resize',function(){if(townSet.length){try{measure()}catch(e){}}})}
 townLean=function(){
  var vh=innerHeight,sy=scrollY,any=false,tx=tilt.on?tilt.tx:0,ty=tilt.on?tilt.ty:0;
  for(var i=0;i<townSet.length;i++){var x=townSet[i];if(!x.sv.isConnected||x.mid==null)continue;if(!x.vis&&x.set)continue;
   var c=(x.mid-sy-vh*.5)/vh; /* -.5 top .. .5 bottom */
   var rx=clamp(-c*16,-8,8)+ty*-4,ry=tx*10,k=rx.toFixed(1)+'|'+ry.toFixed(1);
   if(x.k!==k){x.k=k;x.sv.style.transform='perspective(520px) rotateX('+rx.toFixed(1)+'deg) rotateY('+ry.toFixed(1)+'deg)'}x.set=true;if(tilt.on)any=true}
  return any||scrolling};
 if(!lite)kick()}
var scrolling=false,sT=0;
addEventListener('scroll',function(){if(!townSet.length||lite||rm())return;scrolling=true;clearTimeout(sT);sT=setTimeout(function(){scrolling=false;kick()},120);kick()},{passive:true});
function pop(it){anim(it.art,[{transform:'translateY(18px) scale(.86)',opacity:.0},{transform:'translateY(-4px) scale(1.04)',opacity:1,offset:.6},{transform:'none',opacity:1}],{duration:520,easing:EASE})}
function lift(it){
 if(!it.tl.isConnected)return;var tl=it.tl;
 var d=D.createElement('i');d.className='fx3-lift-dust';tl.appendChild(d);d.classList.add('go');setTimeout(function(){d.remove()},900);
 var lk=D.createElement('span');lk.className='fx3-lockfly';lk.textContent='🔒';tl.appendChild(lk);
 anim(lk,[{transform:'translate(0,0) rotate(0)',opacity:1},{transform:'translate(18px,-40px) rotate(40deg)',opacity:1,offset:.4},{transform:'translate(30px,40px) rotate(110deg)',opacity:0}],{duration:800,easing:'ease-in'}).onfinish=function(){lk.remove()};
 for(var i=0;i<5;i++){(function(i){var s=D.createElement('i');s.className='fx3-spark';tl.appendChild(s);var a=-Math.PI/2+(i-2)*.6,dx=Math.cos(a)*(40+i*4),dy=Math.sin(a)*(44+i*3)+6;
  var an=anim(s,[{transform:'translate(0,0) scale(.2)',opacity:1},{transform:'translate('+dx+'px,'+dy+'px) scale(1.2) rotate(90deg)',opacity:1,offset:.5},{transform:'translate('+dx*1.1+'px,'+(dy+16)+'px) scale(.2)',opacity:0}],{duration:760,delay:i*40,easing:'ease-out'});if(an)an.onfinish=function(){s.remove()};else s.remove()})(i)}
 anim(it.art,[{transform:'translateY(46px) scale(.55,.4)',opacity:0},{transform:'translateY(-14px) scale(1.1,1.16)',opacity:1,offset:.5},{transform:'translateY(2px) scale(.97,.95)',offset:.75},{transform:'none',opacity:1}],{duration:820,easing:EASE});
 if(window.sfx)try{window.sfx('tick')}catch(e){}}

/* ---------- press depth + glass tilt ---------- */
var PRESS='.btn,.opt,.gt,.daily,.twmode,.stop,.card.cta,.twready,.coinp,.gsur,.gc';
var GLASS='.card.cta,.twready,.twrow .card,.card.hl';
function glass(){$$(GLASS).forEach(function(el){if(el.classList.contains('fx3-glass'))return;el.classList.add('fx3-glass');var g=D.createElement('i');g.className='fx3-gl';g.setAttribute('aria-hidden','true');el.appendChild(g)})}
var dn=null,pend=null;
function setPress(el,e){var r=el.getBoundingClientRect(),px=clamp((e.clientX-r.left)/r.width,0,1),py=clamp((e.clientY-r.top)/r.height,0,1),big=r.width>240||r.height>150,m=big?2.6:6;
 el.style.setProperty('--ry',((px-.5)*2*m).toFixed(2)+'deg');el.style.setProperty('--rx',(-(py-.5)*2*m*.8).toFixed(2)+'deg');el.style.setProperty('--gx',(px*100).toFixed(0)+'%');el.style.setProperty('--gy',(py*100).toFixed(0)+'%')}
D.addEventListener('pointerdown',function(e){if(rm()||!e.target.closest)return;var el=e.target.closest(PRESS);if(!el||el.disabled||el.getAttribute('aria-disabled')==='true')return;
 release();el.classList.add('fx3-p','fx3-dn');setPress(el,e);dn=el;rT=setTimeout(release,3500)},{passive:true,capture:true});
D.addEventListener('pointermove',function(e){if(!dn||!dn.classList.contains('fx3-glass'))return;pend=e;if(!pend.__q){pend.__q=1;requestAnimationFrame(function(){if(dn&&pend)setPress(dn,pend);pend=null})}},{passive:true});
function release(){clearTimeout(rT);if(!dn)return;var el=dn;dn=null;el.classList.remove('fx3-dn')}
var rT=0;
addEventListener('blur',release);D.addEventListener('visibilitychange',release);D.addEventListener('pointerup',release,{passive:true,capture:true});D.addEventListener('pointercancel',release,{passive:true,capture:true});

/* ---------- confetti with depth (one canvas, 2D) ---------- */
function confetti(o){
 if(rm())return;o=o||{};var n=o.n||(lite?26:72),cv=D.createElement('canvas');cv.className='fx3-conf';cv.setAttribute('aria-hidden','true');
 var dpr=Math.min(devicePixelRatio||1,lite?1:1.5),W=innerWidth,H=innerHeight;cv.width=W*dpr;cv.height=H*dpr;D.body.appendChild(cv);
 var c=cv.getContext('2d'),pal=['#ff8fc1','#ffe27a','#c9a8f5','#8fd0a5','#6f8fe8','#ffffff','#ffb703'],ps=[],ox=o.x==null?W/2:o.x,oy=o.y==null?H*.42:o.y;
 for(var i=0;i<n;i++){var z=.55+Math.random()*1.1,a=-Math.PI/2+(Math.random()-.5)*(o.spread||2.6),sp=(7+Math.random()*9)*z;
  ps.push({x:ox,y:oy,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,z:z,r:Math.random()*6.3,vr:(Math.random()-.5)*.35,f:Math.random()*6.3,vf:.12+Math.random()*.2,c:pal[i%pal.length],w:(6+Math.random()*6)*z,h:(3+Math.random()*4)*z,dot:Math.random()<.25})}
 ps.sort(function(a,b){return a.z-b.z});
 var t0=0,life=lite?1900:2800;
 function step(t){if(!cv.isConnected)return;if(!t0)t0=t;var el=t-t0;
  c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,W,H);
  for(var i=0;i<ps.length;i++){var p=ps[i];p.vy+=.34*p.z;p.vx*=.985;p.vy*=.985;p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;p.f+=p.vf;
   var al=el>life-600?Math.max(0,(life-el)/600):1;if(al<=0)continue;
   c.globalAlpha=al*(.55+.45*Math.min(1,p.z));c.fillStyle=p.c;c.save();c.translate(p.x,p.y);c.rotate(p.r);c.scale(1,Math.cos(p.f));
   if(p.dot){c.beginPath();c.arc(0,0,p.h,0,6.3);c.fill()}else c.fillRect(-p.w/2,-p.h/2,p.w,p.h);c.restore()}
  if(el<life)requestAnimationFrame(step);else cv.remove()}
 requestAnimationFrame(step)}

/* ---------- coin / level up ---------- */
function coinHTML(txt,back){var e='';for(var i=-3;i<=3;i++)e+='<i style="transform:translateZ('+(i*2)+'px)"></i>';return '<div class="fx3-coinw"><div class="fx3-coin">'+e+'<b class="front">'+txt+'</b><b class="back">'+back+'</b></div></div>'}
function levelUp(lv,rank){
 if($('.fx3-ov'))return;var ov=D.createElement('div');ov.className='fx3-ov';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');ov.setAttribute('aria-label','Level up');
 ov.innerHTML='<p class="eyebrow">Level up</p>'+coinHTML(lv,'★')+'<div class="fx3-coinsh" aria-hidden="true"></div><h2>'+esc(rank)+'</h2><p>You reached level '+lv+'. Keep driving.</p><button class="btn primary" type="button">Nice</button>';
 D.body.appendChild(ov);var btn=$('button',ov),coin=$('.fx3-coin',ov),sh=$('.fx3-coinsh',ov);
 function close(){ov.classList.remove('in');setTimeout(function(){ov.remove()},260);D.removeEventListener('keydown',key)}
 function key(e){if(e.key==='Escape'||e.key==='Enter')close()}
 btn.addEventListener('click',close);D.addEventListener('keydown',key);
 requestAnimationFrame(function(){ov.classList.add('in');btn.focus({preventScroll:true})});
 if(rm()){return}
 var a=anim(coin,[{transform:'translateY(-220px) rotateY(0deg) rotateX(18deg) scale(.5)',opacity:0},{transform:'translateY(18px) rotateY(900deg) rotateX(10deg) scale(1.12)',opacity:1,offset:.55},{transform:'translateY(-10px) rotateY(1080deg) rotateX(0) scale(1)',offset:.8},{transform:'translateY(0) rotateY(1080deg) rotateX(0) scale(1)',opacity:1}],{duration:1500,easing:'cubic-bezier(.25,.8,.3,1)',fill:'forwards'});
 anim(sh,[{transform:'scale(.2)',opacity:0},{transform:'scale(1.05)',opacity:1,offset:.55},{transform:'scale(1)',opacity:1}],{duration:1500,easing:EASE,fill:'forwards'});
 setTimeout(function(){confetti({n:lite?30:90,y:innerHeight*.4})},650);
 if(window.sfx)setTimeout(function(){try{window.sfx('win')}catch(e){}},500);
 if(a&&!lite)a.onfinish=function(){anim(coin,[{transform:'translateY(0) rotateY(1080deg)'},{transform:'translateY(-6px) rotateY(1092deg) rotateX(3deg)'},{transform:'translateY(0) rotateY(1080deg)'}],{duration:2600,iterations:Infinity,easing:'ease-in-out'})}}

/* ---------- result screen ---------- */
var doneRes=typeof WeakSet!=='undefined'?new WeakSet():null;
function result(){
 var x=ui.result;if(!x||(doneRes&&doneRes.has(x)))return;if(doneRes)doneRes.add(x);if(rm())return;
 var st=$$('.star3 .on');st.forEach(function(s,i){s.style.animation='none';s.style.opacity='0';
  var an=anim(s,[{transform:'perspective(500px) rotateY(0deg) scale(.3)',opacity:0},{transform:'perspective(500px) rotateY(540deg) scale(1.55) translateY(-8px)',opacity:1,offset:.62},{transform:'perspective(500px) rotateY(720deg) scale(1)',opacity:1}],{duration:760,delay:260+i*260,easing:'cubic-bezier(.2,.8,.3,1)',fill:'both'});
  if(!an){s.style.opacity='1';return}an.onfinish=function(){s.style.opacity='1';s.style.animation='';an.cancel()};
  setTimeout(function(){if(window.sfx)try{window.sfx('tick')}catch(e){}},260+i*260+520)});
 var big=$('.big');if(big&&/^\d+%$/.test(big.textContent.trim())){var tgt=parseInt(big.textContent,10);count(big,0,tgt,950,'%',200)}
 $$('.gain span').forEach(function(c,i){anim(c,[{transform:'translateY(14px) scale(.8)',opacity:0},{transform:'translateY(-3px) scale(1.06)',opacity:1,offset:.65},{transform:'none',opacity:1}],{duration:460,delay:650+i*110,easing:EASE,fill:'backwards'})});
 var cheer=x.mode==='exam'?x.pass:(x.mode==='stop'&&x.stars===3);if(cheer)setTimeout(function(){confetti({n:lite?24:60,y:innerHeight*.3})},900);
 if(x.lvUp)setTimeout(function(){if(ui.result!==x)return;var go=function(){levelUp(x.lv+1,RANKS[x.lv])};if(window.X&&X.modal)X.modal('lvup',go,{p:2,ok:function(){return ui.result===x}});else go()},cheer?2200:1500)}

/* ---------- number ticker / gauge / flame ---------- */
var lastH=null,lastTab=null;
function count(el,a,b,ms,suf,delay,set){var t0=0,ease=function(t){return 1-Math.pow(1-t,3)};suf=suf||'';set=set||function(v){el.textContent=v+suf};set(a);
 function s(t){if(!el.isConnected)return;if(!t0)t0=t;var k=clamp((t-t0)/ms,0,1);set(Math.round(a+(b-a)*ease(k)));if(k<1)requestAnimationFrame(s)}
 setTimeout(function(){requestAnimationFrame(s)},delay||0)}
function header(){
 var top=$('.top');if(!top)return;var xp=S.xp,coins=S.coins||0,A=141.4,i=levelOf(xp),lo=LEVELS[i],hi=LEVELS[i+1]||lo,pct=hi>lo?(xp-lo)/(hi-lo):1,streak=streakNow();
 var fl=$('.chip',top);if(fl&&/🔥/.test(fl.textContent)&&!$('.fx3-fl',fl)&&!rm()){fl.innerHTML=fl.innerHTML.replace('🔥','<span class="fx3-fl" aria-hidden="true">🔥</span>');
  if(streak<=0){var f=$('.fx3-fl',fl);f.style.animation='none';f.style.opacity='.55'}}
 var L=lastH;lastH={xp:xp,coins:coins,streak:streak,lv:i,pct:pct};if(!L||rm())return;
 var odo=$('.odo',top),ds=odo&&$$('i',odo);
 if(xp>L.xp&&ds){var n=ds.length;count(odo,L.xp,xp,900,'',300,function(v){var q=String(v).padStart(n,'0');for(var k=0;k<n;k++)if(ds[k].textContent!==q[k])ds[k].textContent=q[k]});
  anim(odo,[{transform:'scale(1)'},{transform:'scale(1.12)',offset:.3},{transform:'scale(1)'}],{duration:620,delay:300,easing:SPRING})}
 var cp=$('.coinp',top);if(cp&&coins!==L.coins){var m=/^(\D*)\d+/.exec(cp.textContent),pre=m?m[1]:'';count(cp,L.coins,coins,800,'',300,function(v){cp.textContent=pre+v});anim(cp,[{transform:'scale(1)'},{transform:'scale(1.12)',offset:.3},{transform:'scale(1)'}],{duration:620,delay:300,easing:SPRING})}
 var gf=$('.gf',top);if(gf&&(pct!==L.pct||i!==L.lv)){var from=(i>L.lv?0:L.pct)*A,to=pct*A;
  if(i>L.lv)anim(gf,[{strokeDasharray:(L.pct*A)+' 188.5'},{strokeDasharray:A+' 188.5'}],{duration:500,delay:300,easing:'ease-out'});
  anim(gf,[{strokeDasharray:from.toFixed(1)+' 188.5'},{strokeDasharray:to.toFixed(1)+' 188.5'}],{duration:800,delay:i>L.lv?800:300,easing:EASE,fill:'backwards'})}
 if(streak>L.streak){var f2=$('.fx3-fl',top);if(f2)f2.classList.add('big')}}

/* ---------- first car moment: turntable + confetti ---------- */
function carMoment(ov){
 if(rm())return;var box=$('.twcarbox',ov),sv=box&&$('svg',box);if(!sv)return;
 box.classList.add('fx3-carstage');var scene=D.createElement('div');scene.style.cssText='transform-style:preserve-3d;transform-origin:50% 90%';sv.parentNode.insertBefore(scene,sv);scene.appendChild(sv);
 var obj=slices(sv,lite?2:7,3.6,'car');obj.style.maxWidth='none';addShadow(obj);scene.appendChild(obj);
 var sc={el:scene,yaw:0,pitch:0,vy:0,vp:0,ty:0,tp:0,drag:false,gy:14,gp:5};scenes.push(sc);drag(box,sc);box.style.touchAction='pan-y';
 var a=anim(scene,[{transform:'rotateY(-420deg) scale(.5) translateY(30px)',opacity:0},{transform:'rotateY(20deg) scale(1.1)',opacity:1,offset:.7},{transform:'rotateY(0) scale(1)',opacity:1}],{duration:1500,easing:'cubic-bezier(.2,.8,.3,1)'});
 setTimeout(function(){confetti({n:lite?26:80,y:innerHeight*.46})},500);kick()}
if('MutationObserver' in window)new MutationObserver(function(ms){ms.forEach(function(m){m.addedNodes.forEach(function(n){if(n.id==='twcar'&&n.nodeType===1)try{carMoment(n)}catch(e){}})})}).observe(D.body,{childList:true});

/* ---------- tab transitions ---------- */
var ORDER=['road','games','garage','exam','me'];
var tabSwitch=false;
if(typeof acts!=='undefined'&&acts.tab){var _tab=acts.tab;
 acts.tab=function(v){
  var from=ui.tab;if(v===from||rm()||lite||ui.run||ui.result||ui.lesson||ui.notes||ui.ob){return _tab.apply(this,arguments)}
  var dir=ORDER.indexOf(v)>=ORDER.indexOf(from)?1:-1,self=this,args=arguments;tabSwitch=true;
  if(D.startViewTransition){R.style.setProperty('--fx3d',dir);R.classList.add('fx3-vt-on');
   try{var t=D.startViewTransition(function(){_tab.apply(self,args)});var done=function(){R.classList.remove('fx3-vt-on')};t.finished.then(done,done);return}catch(e){R.classList.remove('fx3-vt-on')}}
  _tab.apply(this,args)}}
function enterFallback(){ /* no View Transitions: simple depth fade on main */
 if(!tabSwitch)return;tabSwitch=false;if(R.classList.contains('fx3-vt-on'))return;var m=$('main');if(m)anim(m,[{opacity:0,transform:'translateY(12px) scale(.985)'},{opacity:1,transform:'none'}],{duration:280,easing:EASE})}

/* ---------- render hook ---------- */
var T={n:0,sum:0,max:0};
function enhance(){var t0=performance.now();enhance0();var d=performance.now()-t0;T.n++;T.sum+=d;if(d>T.max)T.max=d}
function enhance0(){flags();
 if(!(typeof ui!=='undefined'&&typeof S!=='undefined'))return;
 if(!$('.gprev'))gWas=false;
 if(!$('.town')){townSet=[];townLean=null}
 [header,garage,town,glass,result,enterFallback].forEach(function(f){try{f()}catch(e){if(window.console)console.warn('fx3d',f.name,e)}})}
var _r=window.render;
window.render=function(){var o=_r.apply(this,arguments);enhance();return o};
try{enhance()}catch(e){}
window.fx3d={confetti:confetti,levelUp:levelUp,state:function(){return{lite:lite,rm:rm(),scenes:scenes.length}},timing:T,resetTiming:function(){T.n=T.sum=T.max=0},setLite:function(v){lite=!!v;flags()}};
})();
