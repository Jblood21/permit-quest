const GW=360,GH=560;
const ENG={};
function mulberry(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const C={asphalt:'#3b2168',paint:'#ffc61a',sign:'#17674a',red:'#e5383b',blue:'#2f80ed',green:'#19a974',purple:'#9b5de5',orange:'#ff6f9f'};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
let PLAYER={color:'#e5383b',skin:'#f1c27d',hair:'#3b2a20'};
function drawCar(c,x,y,w,o){o=Object.assign({},PLAYER,o||{});const h=w*.42;c.save();c.translate(x,y);if(o.tilt)c.rotate(o.tilt);
 c.fillStyle=o.color;rr(c,-w/2,-h*.1,w,h*.7,h*.22);c.fill();
 c.beginPath();c.moveTo(-w*.28,-h*.1);c.lineTo(-w*.16,-h*.62);c.lineTo(w*.18,-h*.62);c.lineTo(w*.32,-h*.1);c.closePath();c.fill();
 c.fillStyle='#d8ecff';c.beginPath();c.moveTo(-w*.22,-h*.14);c.lineTo(-w*.13,-h*.54);c.lineTo(w*.15,-h*.54);c.lineTo(w*.26,-h*.14);c.closePath();c.fill();
 c.fillStyle=o.skin;c.beginPath();c.arc(-w*.02,-h*.34,h*.17,0,6.3);c.fill();
 c.fillStyle=o.hair;c.beginPath();c.arc(-w*.02,-h*.38,h*.17,3.4,6.0);c.fill();
 [-.28,.28].forEach(k=>{c.fillStyle='#14161b';c.beginPath();c.arc(w*k,h*.6,h*.2,0,6.3);c.fill();c.fillStyle='#b8bfcc';c.beginPath();c.arc(w*k,h*.6,h*.08,0,6.3);c.fill()});
 c.fillStyle='#fff3b0';c.fillRect(w*.44,h*.05,w*.06,h*.14);c.restore()}
function sky(c,t){const g=c.createLinearGradient(0,0,0,GH);g.addColorStop(0,'#b9a2ea');g.addColorStop(.5,'#dcc4f3');g.addColorStop(1,'#fbd2e4');c.fillStyle=g;c.fillRect(0,0,GW,GH);
 c.fillStyle='rgba(255,255,255,.85)';[[40,60,3],[300,40,4],[200,110,2.5],[330,150,2.5],[90,170,2]].forEach(p=>{const r=p[2],x=p[0],y=p[1];c.beginPath();c.moveTo(x,y-r*2);c.quadraticCurveTo(x,y,x+r*2,y);c.quadraticCurveTo(x,y,x,y+r*2);c.quadraticCurveTo(x,y,x-r*2,y);c.quadraticCurveTo(x,y,x,y-r*2);c.fill()});
 const B=GH-60,m=[[0,40],[40,70],[90,38],[150,78],[210,44],[270,74],[320,46],[360,60]];
 c.fillStyle='#ab90dc';c.beginPath();c.moveTo(0,B);m.forEach(p=>c.lineTo(p[0],B-p[1]));c.lineTo(GW,B);c.fill();
 c.fillStyle='#fff';[[40,70],[150,78],[270,74]].forEach(p=>{const x=p[0],y=B-p[1];c.beginPath();c.moveTo(x,y);c.lineTo(x-14,y+16);c.lineTo(x-6,y+13);c.lineTo(x,y+19);c.lineTo(x+7,y+13);c.lineTo(x+15,y+16);c.closePath();c.fill()})}
/* level tables: 10 levels per game */
const LV={
 flappy:{gap:[200,190,180,178,175,174,174,174,167,164],speed:[110,115,120,124,128,130,130,131,137,140],goal:[6,8,10,12,13,14,15,16,17,18],wob:[0,0,0,0,6,8,10,12,14,16]},
 dash:{lanes:[3,3,4,4,5,5,5,6,6,7],speed:[45,52,55,68,66,71,74,74,78,80],gap:[3.2,3,2.9,2.8,2.7,2.65,2.6,2.6,2.55,2.5]},
 stack:{goal:[4,6,8,10,12,13,14,15,15,17],ms:[900,820,740,670,600,550,510,490,470,410],junk:[0,0,0,0,0,2,2,3,3,3]},
 match:{types:[4,4,4,5,5,5,5,6,6,6],moves:[22,22,20,24,23,23,21,21,28,32],cones:[0,0,0,4,0,0,5,0,5,0],ice:[[0,1],[0,1],[0,1],[0,1],[0,1],[9,1],[10,1],[7,1],[6,2],[5,2]],
  goals:[[['collect',0,30]],[['score',3000]],[['make',1,3]],[['cones'],['blast',14]],[['make',3,2],['collect',2,16]],[['ice'],['make',1,3]],[['cones'],['ice'],['blast',10]],[['collect',3,16],['ice']],[['cones'],['ice'],['make',3,1]],[['score',3100],['make',3,1],['ice']]]},
 bubble:{colors:[3,3,4,4,4,5,5,5,5,6],rows:[4,5,5,6,6,7,7,7,8,7],drop:[0,0,12,12,11,10,10,10,10,9]}
};
const GAMES=[
 {id:'flappy',name:'Flappy Car',icon:'🚗',tag:'Tap to hop through the gaps',how:L=>'Tap to hop your car. Get through '+LV.flappy.goal[L-1]+' barriers. You have 3 hearts.'},
 {id:'dash',name:'Crosswalk Dash',icon:'🚸',tag:'Cross the road, dodge traffic',how:L=>'Swipe or use the arrows to cross '+(LV.dash.lanes[L-1]+(L>=8?1:0))+' lanes and reach the far sidewalk. The counter shows '+(LV.dash.lanes[L-1]+(L>=8?1:0)+1)+' steps.'+(L>=8?' Never cross when the train lights flash.':'')+' 3 hearts.'},
 {id:'stack',name:'Highway Stack',icon:'🧱',tag:'Stack cars, clear traffic',how:L=>'Fit the falling cars together. Clear '+LV.stack.goal[L-1]+' rows.'+(LV.stack.junk[L-1]?' Some rows start full.':'')+' 3 hearts.'},
 {id:'match',name:'Sign Match',icon:'🛑',tag:'Match road signs',how:L=>ENG.matchHow(L)},
 {id:'bubble',name:'Pop the Traffic',icon:'🫧',tag:'Aim, shoot, match 3',how:L=>'Drag to aim, let go to shoot. Match 3 or more to pop. Clear the board. 3 hearts.'}
];

/* ---- shared helpers for flappy/dash/stack/bubble (gq_ prefix) ---- */
function gq_sfx(n){try{if(typeof window!=='undefined'&&window.sfx)window.sfx(n)}catch(e){}}
function gq_rm(){try{return typeof matchMedia!=='undefined'&&matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){return false}}
const GQ_INK='#3b2168';
function gq_heart(c,x,y,s){c.beginPath();c.moveTo(x,y+s*.9);c.bezierCurveTo(x-s*1.5,y-s*.1,x-s*.7,y-s*1.1,x,y-s*.4);c.bezierCurveTo(x+s*.7,y-s*1.1,x+s*1.5,y-s*.1,x,y+s*.9);c.fill()}
function gq_star4(c,x,y,r){c.beginPath();c.moveTo(x,y-r);c.quadraticCurveTo(x,y,x+r,y);c.quadraticCurveTo(x,y,x,y+r);c.quadraticCurveTo(x,y,x-r,y);c.quadraticCurveTo(x,y,x,y-r);c.fill()}
function gq_coin(c,x,y,r,t){const k=Math.abs(Math.cos(t*4)),w=Math.max(.18,k)*r;c.fillStyle='#e0a100';c.beginPath();c.ellipse(x,y,w,r,0,0,6.3);c.fill();c.fillStyle='#ffd23f';c.beginPath();c.ellipse(x,y,Math.max(.1,w-1.5),r-1.5,0,0,6.3);c.fill();if(k>.45){c.fillStyle='#fff3b0';c.fillRect(x-1,y-r*.5,2,r)}}
function gq_cloud(c,x,y,s,a){c.fillStyle='rgba(255,255,255,'+a+')';c.beginPath();c.arc(x,y,10*s,0,6.3);c.arc(x+12*s,y-5*s,13*s,0,6.3);c.arc(x+27*s,y,10*s,0,6.3);c.fill();c.fillRect(x,y,27*s,10*s*.9)}
/* ridge with integer harmonics of width 360 so it scrolls seamlessly */
function gq_ridge(c,base,scroll,amp,col,ph,snow){
 const h=x=>{const u=((x+scroll)/360)*6.2832;return amp*(.55+.28*Math.sin(u+ph)+.17*Math.sin(u*2+ph*2.3)+.1*Math.sin(u*3+ph*.7))};
 c.fillStyle=col;c.beginPath();c.moveTo(0,base);for(let x=0;x<=GW;x+=6)c.lineTo(x,base-h(x));c.lineTo(GW,base);c.closePath();c.fill();
 if(snow){c.fillStyle='rgba(255,255,255,.92)';for(let x=6;x<GW-6;x+=6){const a=h(x-6),b=h(x),d=h(x+6);if(b>a&&b>=d&&b>amp*.78){c.beginPath();c.moveTo(x-16,base-h(x-16));c.lineTo(x,base-b);c.lineTo(x+16,base-h(x+16));c.lineTo(x+10,base-h(x+10)+7);c.lineTo(x+3,base-b+11);c.lineTo(x-4,base-h(x-4)+8);c.lineTo(x-10,base-h(x-10)+6);c.closePath();c.fill()}}}}
function gq_pines(c,base,scroll,col,n,sz){for(let i=0;i<n;i++){const x=((i*(360/n)+(i*37%23)-scroll)%360+360)%360,s=sz*(.8+((i*53)%7)/17),y=base;c.fillStyle=col;for(let k=0;k<3;k++){const w=s*(1-k*.22),yy=y-k*s*.55;c.beginPath();c.moveTo(x,yy-s*.9);c.lineTo(x+w*.5,yy);c.lineTo(x-w*.5,yy);c.fill()}
 c.fillStyle='rgba(255,255,255,.75)';c.beginPath();c.moveTo(x,y-s*.9-s*1.1+s*.9);c.lineTo(x+s*.12,y-s*1.7+s*.35);c.lineTo(x-s*.12,y-s*1.7+s*.35);c.fill()}}
function gq_fx(){const rm=gq_rm(),P=[],T=[];
 const f={rm,shk:0,P,T,
  add(p){if(P.length<240)P.push(p)},
  burst(x,y,n,o){o=o||{};n=rm?Math.ceil(n*.3):n;const cols=o.cols||['#fff'];for(let i=0;i<n;i++){const a=o.a!=null?o.a+(Math.random()-.5)*(o.spread||6.28):Math.random()*6.28,sp=(o.sp||120)*(.35+Math.random()*.8);const life=(o.life||.6)*(.6+Math.random()*.6);
   f.add({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-(o.up||0),g:o.g==null?300:o.g,life,max:life,r:(o.r||3)*(.6+Math.random()*.8),col:cols[i%cols.length],k:o.k||'dot',rot:Math.random()*6,vr:(Math.random()-.5)*8,grow:o.grow||0})}},
  text(x,y,s,col,size){T.push({x,y,s,col:col||'#fff',size:size||15,t:.9,max:.9})},
  shake(a){if(!rm)f.shk=Math.max(f.shk,a)},
  update(dt){for(const p of P){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=p.g*dt;p.rot+=p.vr*dt;p.r+=p.grow*dt}for(let i=P.length-1;i>=0;i--)if(P[i].life<=0)P.splice(i,1);
   for(const t of T){t.t-=dt;t.y-=34*dt}for(let i=T.length-1;i>=0;i--)if(T[i].t<=0)T.splice(i,1);f.shk=Math.max(0,f.shk-dt*30)},
  begin(c){c.save();if(f.shk>.3&&!rm)c.translate((Math.random()-.5)*f.shk,(Math.random()-.5)*f.shk)},
  end(c){c.restore()},
  draw(c){for(const p of P){const a=Math.max(0,Math.min(1,p.life/p.max*1.4));c.globalAlpha=a;c.fillStyle=p.col;
    if(p.k==='star')gq_star4(c,p.x,p.y,p.r*1.8);else if(p.k==='heart')gq_heart(c,p.x,p.y,p.r*.9);
    else if(p.k==='ring'){c.strokeStyle=p.col;c.lineWidth=2;c.beginPath();c.arc(p.x,p.y,Math.max(1,p.r),0,6.3);c.stroke()}
    else{c.beginPath();c.arc(p.x,p.y,Math.max(.5,p.r),0,6.3);c.fill()}}
   c.globalAlpha=1;c.textAlign='center';for(const t of T){c.globalAlpha=Math.min(1,t.t/t.max*2);c.font='800 '+t.size+'px -apple-system,system-ui,sans-serif';c.lineWidth=4;c.strokeStyle=GQ_INK;c.strokeText(t.s,t.x,t.y);c.fillStyle=t.col;c.fillText(t.s,t.x,t.y)}c.globalAlpha=1}};
 return f}

/* ======================= Flappy Car ======================= */
ENG.flappy=function(L,seed){
 const i=L-1,P=LV.flappy,gap=P.gap[i],sp0=P.speed[i],goal=P.goal[i],wob=P.wob[i],PW=56,ROAD=GH-60;
 const rng=mulberry((seed||0)+L*977+5),fx=gq_fx();
 /* mix of barrier kinds per level: [fixed, moving, narrow, double] weights */
 const MIX=[[1,0,0,0],[1,0,0,0],[1,0,.15,0],[.75,0,.25,0],[.55,.2,.25,0],[.5,.25,.25,0],[.52,.25,.15,.08],[.46,.25,.17,.12],[.35,.25,.24,.16],[.3,.25,.25,.2]][i];
 const spacing=[2,1.95,1.9,1.9,1.88,1.85,1.82,1.8,1.78,1.75][i]; /* seconds between barriers */
 const maxStep=[110,120,130,135,140,140,140,140,140,140][i];
 const s={kind:'flappy',L,W:GW,H:GH,hearts:3,status:'play',goal,passed:0,started:false,t:0,inv:0,car:{x:92,y:GH/2-20,vy:0,tilt:0},obs:[],coins:[],got:0,controls:[],gap,PW,fx,dist:0,
  hud(){return 'Barriers passed '+s.passed+' of '+goal},
  speed(){return sp0*(1+.22*Math.min(1,s.passed/goal))},
  act(a){if(a==='tap'&&s.status==='play'){s.started=true;s.car.vy=-320;s.flap=.18;
    fx.burst(s.car.x-22,s.car.y+8,4,{cols:['#fff','#ffd6ec'],sp:60,a:3.3,spread:1.2,r:2.4,life:.4,g:80,k:'star'})}},
  pointer(t){if(t==='down')s.act('tap')},
  /* gap list for an obstacle at the current time: [[top,bottom],...] */
  gapsOf(o){const g=s.gapH(o);if(o.kind==='double'){const c=o.base+wob*.4*Math.sin(s.t*1.6+o.ph),h=g*.82,d=o.sep;return[[c-d-h/2,c-d+h/2],[c+d-h/2,c+d+h/2]]}
   const c=o.kind==='moving'?o.base+Math.max(wob,18)*Math.sin(s.t*1.8+o.ph):o.base;return[[c-g/2,c+g/2]]},
  gapH(o){if(o.kind==='narrow'){const d=o.x-s.car.x,k=clamp((d-70)/190,0,1);return gap*(1+.75*k)}return gap},
  cy(o){const g=s.gapsOf(o);return o.kind==='double'?(g[0][0]+g[0][1]+g[1][0]+g[1][1])/4:(g[0][0]+g[0][1])/2},
  hit(){if(s.inv>0)return;const y0=s.car.y;s.hearts--;s.inv=1.3;fx.shake(9);gq_sfx('hit');fx.burst(s.car.x,s.car.y,16,{cols:['#ff7eb6','#ffd166','#fff'],sp:190,r:3,k:'star'});
   const o=s.obs.find(o=>o.x+PW>s.car.x-16);if(o){const g=s.gapsOf(o);let best=g[0];for(const q of g)if(Math.abs((q[0]+q[1])/2-s.car.y)<Math.abs((best[0]+best[1])/2-s.car.y))best=q;s.car.y=(best[0]+best[1])/2}else s.car.y=GH/2-20;s.car.vy=0;s.car.dy=Math.max(-170,Math.min(170,y0-s.car.y));if(s.hearts<=0)s.status='lose'},
  spawn(){const last=s.obs[s.obs.length-1];const r=rng();let k='fixed',a=MIX[0];if(r>=a){k='moving';a+=MIX[1];if(r>=a){k='narrow';a+=MIX[2];if(r>=a)k='double'}}
   const dbl=k==='double',sep=dbl?gap*.55+14:0,m=Math.max(wob,18)*(k==='moving'?1:0)+sep+(dbl?gap*.05:0);
   const lo=64+gap/2+m,hi=ROAD-30-gap/2-m;let base=lo+rng()*(hi-lo);
   if(last){const pb=last.base;base=clamp(base,pb-maxStep,pb+maxStep);base=clamp(base,lo,hi)}
   const o={x:GW+10,base,ph:rng()*6.28,p:0,kind:k,sep};s.obs.push(o);
   if(rng()<.55){const n=3,cc=s.cy(o);for(let q=0;q<n;q++)s.coins.push({x:o.x+PW/2+(q-1)*34-17,y:(k==='double'?o.base:cc)-Math.sin(q/(n-1)*3.14)*18+10,t:0})}},
  update(dt){fx.update(dt);if(s.status!=='play')return;dt=Math.min(dt,.04);s.flap=Math.max(0,(s.flap||0)-dt);
   const car=s.car;if(car.dy)car.dy=Math.abs(car.dy)<.5?0:car.dy*Math.max(0,1-dt*11);car.tilt+=(clamp(car.vy/800,-.4,.55)-car.tilt)*Math.min(1,dt*12);
   if(!s.started){car.y=GH/2-20+Math.sin(performance_now()/260)*6;return}
   s.t+=dt;s.inv-=dt;const sp=s.speed();s.dist+=sp*dt;car.vy=Math.min(560,car.vy+1100*dt);car.y+=car.vy*dt;
   if(!fx.rm||Math.random()<.3)if(Math.random()<dt*38)fx.add({x:car.x-26,y:car.y+8,vx:-sp*.5-20,vy:(Math.random()-.5)*20-10,g:-30,life:.5,max:.5,r:2.5,col:Math.random()<.5?'#fff':'#ffd6ec',k:'dot',rot:0,vr:0,grow:7});
   const last=s.obs[s.obs.length-1];if(!last||last.x<GW-sp*spacing)s.spawn();
   for(const o of s.obs){o.x-=sp*dt;
    if(o.x<car.x+16&&o.x+PW>car.x-16){let ok=false;for(const g of s.gapsOf(o))if(car.y-10>=g[0]&&car.y+10<=g[1])ok=true;if(!ok)s.hit()}
    if(!o.p&&o.x+PW<car.x-16){o.p=1;s.passed++;gq_sfx('tick');fx.text(car.x+10,car.y-26,s.passed+'/'+goal,'#fff',13);if(s.passed>=goal){s.status='win';fx.burst(car.x,car.y,24,{cols:['#ffd166','#ff7eb6','#fff'],sp:220,k:'star'})}}}
   for(const k of s.coins){k.x-=sp*dt;k.t+=dt;if(!k.d&&Math.abs(k.x-car.x)<20&&Math.abs(k.y-car.y)<22){k.d=1;s.got++;gq_sfx('coin');fx.burst(k.x,k.y,6,{cols:['#ffd23f','#fff'],sp:90,k:'star',r:2.4,life:.4})}}
   s.obs=s.obs.filter(o=>o.x>-PW-10);s.coins=s.coins.filter(k=>k.x>-20&&!k.d);
   if(car.y<14){car.y=14;car.vy=0}
   if(car.y>ROAD-12){s.hit();car.y=Math.min(car.y,ROAD-12)}},
  draw(c){fx.begin(c);sky(c,s.t);const d=s.dist||0;
   gq_cloud(c,((150-d*.04)%480+480)%480-60,70,1,.7);gq_cloud(c,((330-d*.03)%480+480)%480-60,120,.8,.55);
   gq_ridge(c,ROAD-6,d*.08,150,'#cdb9ee',.5,true);gq_ridge(c,ROAD-4,d*.16,105,'#b79de2',2.1,true);gq_pines(c,ROAD+2,d*.3,'#8a6cc4',9,30);gq_ridge(c,ROAD,d*.5,36,'#9d83d3',4,false);
   for(let q=0;q<14;q++){const x=((q*97-d*.2)%420+420)%420-30,y=(q*53%260)+30+Math.sin(s.t*2+q)*4;c.fillStyle='rgba(255,255,255,'+(.35+.3*Math.sin(s.t*3+q))+')';gq_star4(c,x,y,2.2)}
   const gradFor=tn=>{let m=GQ_GR.get(c);if(!m){m={};GQ_GR.set(c,m)}const k=tn[0]+tn[1];if(!m[k]){const g=c.createLinearGradient(0,0,PW,0);g.addColorStop(0,tn[0]);g.addColorStop(.45,'#fff');g.addColorStop(1,tn[1]);m[k]=g}return m[k]};
   const bar=(x,y,w,h,top,tint)=>{if(h<=0)return;c.save();c.beginPath();c.rect(x,y,w,h);c.clip();c.translate(x,0);c.fillStyle=gradFor(tint);c.fillRect(0,y,w,h);c.translate(-x,0);c.fillStyle=tint[2];c.beginPath();for(let k=-h;k<w+h;k+=26){c.moveTo(x+k,y+h);c.lineTo(x+k+13,y+h);c.lineTo(x+k+13+h,y);c.lineTo(x+k+h,y);c.closePath()}c.fill();
    c.fillStyle='rgba(255,255,255,.35)';c.fillRect(x+6,y,6,h);c.restore()};
   const TINT={fixed:['#ffb3d4','#ff8fbd','#ff6f9f'],moving:['#d7c4ff','#a98af0','#9b5de5'],narrow:['#ffe1a8','#ffc15e','#ff9f43'],double:['#b8eedd','#74d9b3','#19a974']};
   for(const o of s.obs){const g=s.gapsOf(o),tn=TINT[o.kind];let prev=-4;for(const q of g){bar(o.x,prev,PW,q[0]-prev,0,tn);c.fillStyle=GQ_INK;rr(c,o.x-5,q[0]-12,PW+10,12,5);c.fill();c.fillStyle='rgba(255,255,255,.28)';rr(c,o.x-3,q[0]-11,PW+6,3,2);c.fill();prev=q[1];
     c.fillStyle=GQ_INK;rr(c,o.x-5,q[1],PW+10,12,5);c.fill();c.fillStyle='rgba(255,255,255,.28)';rr(c,o.x-3,q[1]+1,PW+6,3,2);c.fill();prev=q[1]+12}
    const lastG=g[g.length-1];bar(o.x,lastG[1]+12,PW,ROAD-(lastG[1]+12),0,tn);
    if(o.kind==='moving'){c.fillStyle='#fff';const cc=(g[0][0]+g[0][1])/2;c.beginPath();c.moveTo(o.x+PW/2,cc-8);c.lineTo(o.x+PW/2+7,cc-1);c.lineTo(o.x+PW/2-7,cc-1);c.fill();c.beginPath();c.moveTo(o.x+PW/2,cc+8);c.lineTo(o.x+PW/2+7,cc+1);c.lineTo(o.x+PW/2-7,cc+1);c.fill()}}
   for(const k of s.coins)gq_coin(c,k.x,k.y,8,k.t+k.x*.02);
   c.fillStyle='#3b2168';c.fillRect(0,ROAD,GW,60);c.fillStyle='#4d2d85';c.fillRect(0,ROAD,GW,5);c.fillStyle=C.paint;for(let x=-((d)%60);x<GW;x+=60)c.fillRect(x,ROAD+32,30,4);
   if(s.inv>0&&Math.floor(s.inv*10)%2)c.globalAlpha=.35;
   c.fillStyle='rgba(59,33,104,.18)';c.beginPath();c.ellipse(s.car.x,ROAD+4,26*Math.max(.4,1-(ROAD-s.car.y)/500),5,0,0,6.3);c.fill();
   drawCar(c,s.car.x,s.car.y+(s.car.dy||0),50,{tilt:s.car.tilt});c.globalAlpha=1;fx.draw(c);
   c.fillStyle='rgba(255,255,255,.7)';rr(c,6,6,Math.max(48,40+String(s.got).length*9),32,16);c.fill();c.fillStyle='#ffd23f';c.beginPath();c.arc(22,22,8,0,6.3);c.fill();c.fillStyle=GQ_INK;c.font='800 14px -apple-system,system-ui,sans-serif';c.textAlign='left';c.fillText(String(s.got),36,27);
   if(!s.started){c.fillStyle=GQ_INK;c.font='700 20px -apple-system,system-ui,sans-serif';c.textAlign='center';c.fillText('Tap to hop',GW/2,GH/2+70)}
   fx.end(c)}};
 return s};
const GQ_GR=new WeakMap();
function performance_now(){return typeof performance!=='undefined'?performance.now():Date.now()}

/* ======================= Crosswalk Dash ======================= */
/* vehicle kinds: width in cells, speed multiplier, honks */
const GQ_VEH={compact:{w:1.05,sp:1,h:1},sport:{w:1.1,sp:1.12,h:1},bus:{w:2.2,sp:.8,h:1},truck:{w:2.1,sp:.9,h:1},school:{w:2.4,sp:.7,h:1},moto:{w:.62,sp:1.25,h:1},bike:{w:.6,sp:.55,h:1}};
function gq_veh(c,k,x,y,w,h,dir,col,t,flash){c.save();c.translate(x+w/2,y+h/2);if(dir<0)c.scale(-1,1);const hw=w/2,hh=h/2;
 c.fillStyle='rgba(59,33,104,.28)';c.beginPath();c.ellipse(0,hh-1,hw*.95,hh*.28,0,0,6.3);c.fill();
 const wheel=(wx)=>{c.fillStyle='#2a1747';c.beginPath();c.arc(wx,hh-3,h*.17,0,6.3);c.fill();c.fillStyle='#d9d2ea';c.beginPath();c.arc(wx,hh-3,h*.07,0,6.3);c.fill()};
 const gloss=(x0,y0,w0)=>{c.fillStyle='rgba(255,255,255,.4)';rr(c,x0,y0,w0,2.5,1.2);c.fill()};
 const lights=()=>{c.fillStyle='#fff6b8';c.fillRect(hw-3,-hh*.12,4,5);c.fillStyle='#ff6f9f';c.fillRect(-hw-1,-hh*.12,3,5)};
 if(k==='bike'){c.strokeStyle='#3b2168';c.lineWidth=2;[-hw*.55,hw*.55].forEach(wx=>{c.beginPath();c.arc(wx,hh*.45,hh*.32,0,6.3);c.stroke()});c.beginPath();c.moveTo(-hw*.55,hh*.45);c.lineTo(0,-hh*.05);c.lineTo(hw*.55,hh*.45);c.moveTo(0,-hh*.05);c.lineTo(hw*.35,-hh*.15);c.stroke();
  c.fillStyle=col;rr(c,-hw*.35,-hh*.7,hw*.5,hh*.65,3);c.fill();c.fillStyle='#f1c27d';c.beginPath();c.arc(-hw*.05+1,-hh*.88,hh*.2,0,6.3);c.fill();c.fillStyle='#ff6f9f';c.beginPath();c.arc(-hw*.05+1,-hh*.95,hh*.2,3.3,6.1);c.fill();c.restore();return}
 if(k==='moto'){c.fillStyle=col;rr(c,-hw*.7,-hh*.1,hw*1.4,hh*.55,5);c.fill();wheel(-hw*.55);wheel(hw*.55);c.fillStyle='#3b2168';rr(c,-hw*.35,-hh*.7,hw*.7,hh*.62,4);c.fill();c.fillStyle='#ffd23f';c.beginPath();c.arc(0,-hh*.85,hh*.22,0,6.3);c.fill();lights();c.restore();return}
 if(k==='bus'||k==='school'){const body=k==='school'?'#ffcf33':col;c.fillStyle=body;rr(c,-hw,-hh*.75,w,hh*1.6,6);c.fill();gloss(-hw+5,-hh*.7,w-10);
  c.fillStyle='#cfe7ff';for(let q=0;q<(k==='school'?5:4);q++){const n=k==='school'?5:4,ww=(w-26)/n-3;rr(c,-hw+6+q*((w-26)/n),-hh*.5,ww,hh*.5,2.5);c.fill()}rr(c,hw-17,-hh*.5,12,hh*.65,3);c.fill();
  if(k==='school'){c.fillStyle='#2a1747';c.fillRect(-hw+2,hh*.2,w-4,3);c.fillStyle=flash?'#ff3d5a':'#8a2a3a';c.beginPath();c.arc(-hw+9,-hh*.8,3,0,6.3);c.fill();c.beginPath();c.arc(hw-9,-hh*.8,3,0,6.3);c.fill()}
  wheel(-hw*.55);wheel(hw*.55);lights();c.restore();return}
 if(k==='truck'){c.fillStyle='#fdf4ff';rr(c,-hw,-hh*.85,w*.64,hh*1.7,5);c.fill();c.fillStyle='rgba(155,93,229,.35)';c.fillRect(-hw+6,-hh*.45,w*.64-12,hh*.5);gloss(-hw+5,-hh*.8,w*.64-10);
  c.fillStyle=col;rr(c,-hw+w*.66,-hh*.55,w*.34,hh*1.4,5);c.fill();c.fillStyle='#cfe7ff';rr(c,hw-14,-hh*.38,10,hh*.5,2);c.fill();wheel(-hw*.55);wheel(-hw*.1);wheel(hw*.62);lights();c.restore();return}
 /* compact & sport */
 c.fillStyle=col;rr(c,-hw,-hh*.15,w,hh*1.0,hh*.3);c.fill();
 c.beginPath();if(k==='sport'){c.moveTo(-hw*.45,-hh*.15);c.lineTo(-hw*.1,-hh*.62);c.lineTo(hw*.2,-hh*.62);c.lineTo(hw*.55,-hh*.15)}else{c.moveTo(-hw*.6,-hh*.15);c.lineTo(-hw*.35,-hh*.68);c.lineTo(hw*.3,-hh*.68);c.lineTo(hw*.65,-hh*.15)}c.closePath();c.fill();
 c.fillStyle='#d8ecff';c.beginPath();if(k==='sport'){c.moveTo(-hw*.36,-hh*.18);c.lineTo(-hw*.08,-hh*.53);c.lineTo(hw*.16,-hh*.53);c.lineTo(hw*.44,-hh*.18)}else{c.moveTo(-hw*.5,-hh*.18);c.lineTo(-hw*.3,-hh*.58);c.lineTo(hw*.24,-hh*.58);c.lineTo(hw*.53,-hh*.18)}c.closePath();c.fill();
 gloss(-hw*.7,-hh*.1,w*.8);wheel(-hw*.55);wheel(hw*.55);lights();c.restore()}
function gq_walker(c,px,py,sc,t,moving){const b=moving?Math.sin(t*22)*1.5:0;c.save();c.translate(px,py);c.scale(sc,sc);
 c.fillStyle='rgba(59,33,104,.25)';c.beginPath();c.ellipse(0,15,11,4,0,0,6.3);c.fill();
 c.fillStyle='#3b2168';rr(c,-6,8+b,5,7,2);c.fill();rr(c,1,8-b,5,7,2);c.fill();
 c.fillStyle=PLAYER.shirt||'#ff7eb6';rr(c,-9,-4,18,16,6);c.fill();c.fillStyle='rgba(255,255,255,.35)';rr(c,-6,-2,5,8,2.5);c.fill();
 c.fillStyle=PLAYER.hair;c.beginPath();c.arc(0,-11,10.5,0,6.3);c.fill();c.beginPath();c.moveTo(-10,-9);c.lineTo(-11,5);c.lineTo(-6,2);c.fill();c.beginPath();c.moveTo(10,-9);c.lineTo(11,5);c.lineTo(6,2);c.fill();
 c.fillStyle=PLAYER.skin;c.beginPath();c.arc(0,-9,8.6,0,6.3);c.fill();c.fillStyle=PLAYER.hair;c.beginPath();c.arc(0,-13,9,3.3,6.1);c.fill();
 c.fillStyle='#3b2168';c.fillRect(-4,-9,2,2.6);c.fillRect(2,-9,2,2.6);c.fillStyle='#ff7eb6';c.beginPath();c.arc(-6,-6,1.8,0,6.3);c.arc(6,-6,1.8,0,6.3);c.fill();
 c.fillStyle='#ff7eb6';gq_heart(c,9,-19,2.6);c.restore()}

ENG.dash=function(L,seed){
 const i=L-1,P=LV.dash,lanes=P.lanes[i],rail=L>=8,cols=7,cell=GW/cols,rows=lanes+(rail?1:0)+2,oy=GH-rows*cell-6;
 const rng=mulberry((seed||0)+L*131+7),minGap=(P.gap[i]+.5+(L>=9?.25:0))*cell,fx=gq_fx();
 const railRow=rail?Math.ceil(rows/2):-1;
 /* vehicle kinds unlocked as levels rise */
 const POOL=[['compact','bike'],['compact','bike','bus'],['compact','bus','truck','bike'],['compact','bus','truck','school','bike'],['compact','sport','truck','school','bike','moto'],['compact','sport','bus','school','moto','bike'],['compact','sport','truck','school','moto'],['compact','sport','truck','school','moto'],['compact','sport','bus','moto','truck'],['sport','compact','moto','truck','school']][i];
 const burstP=[0,0,0,0,.15,.2,.25,.3,.35,.4][i],burstA=[0,0,0,0,.2,.25,.3,.3,.35,.35][i];
 const mixDir=L>=4,MAXW=2.5*cell+20,LEN=GW+2*MAXW+40;
 const lane=[];const COLS=['#ff7eb6','#6aa8ff','#5ad6a4','#b48cff','#ffb36b','#ff8f8f','#7fd6ee'];
 let prevDir=-1;
 for(let r=1;r<rows-1;r++){
  if(r===railRow){const n=L>=10?2:1;lane[r]={rail:true,P:L>=10?7.4:Math.max(4.4,6.8-(L-8)*.9),off:rng()*3,warn:1.6,dur:1.9,n};continue}
  let dir=r%2?1:-1;if(mixDir&&rng()<.35)dir=prevDir;prevDir=dir;
  let kind=POOL[Math.floor(rng()*POOL.length)];if(r===1&&L>=4)kind=POOL[Math.floor(rng()*POOL.length)];
  const vk=GQ_VEH[kind],speed=P.speed[i]*vk.sp*(.85+rng()*.3),vs=[];
  const burst=rng()<burstP&&kind!=='bike'?{b:burstA*(.7+rng()*.6),T:3.2+rng()*2.4,ph:rng()*6.28}:null;
  let x=rng()*80;
  while(x<LEN-MAXW-20){const w=vk.w*cell*(kind==='compact'||kind==='sport'?(.95+rng()*.15):1);vs.push({p:x,w,col:kind==='bike'||kind==='moto'||kind==='compact'||kind==='sport'||kind==='truck'||kind==='bus'?COLS[Math.floor(rng()*COLS.length)]:'#ffcf33',honk:0});x+=w+minGap*(1+rng()*.45)*(kind==='moto'||kind==='bike'?.8:1)}
  lane[r]={dir,kind,speed,vs,len:Math.max(LEN,x),burst}}
 /* collectables */
 const pick=[];for(let r=1;r<rows-1;r++)if(r!==railRow)pick.push(r);
 const items=[];for(const r of pick){if(rng()<.55)items.push({row:r,col:Math.floor(rng()*cols),k:'coin',got:0})}
 if(L>=3){const r=pick[Math.floor(rng()*pick.length)],cc=Math.floor(rng()*cols);if(!items.some(q=>q.row===r&&q.col===cc))items.push({row:r,col:cc,k:'heart',got:0})}
 const s={kind:'dash',L,W:GW,H:GH,hearts:3,status:'play',t:0,inv:0,col:3,row:0,hop:0,vx:3,vr:0,got:0,controls:[['◀','left'],['▲','up'],['▼','down'],['▶','right']],cell,rows,oy,fx,lane,
  hud(){const T=rows-2;return 'Lanes crossed '+Math.max(0,Math.min(T,s.row-1))+' of '+T},
  dist(ln,t){const b=ln.burst;if(!b)return ln.speed*t;const k=6.2832/b.T;return ln.speed*(t*(1+b.b*.5)-b.b*(Math.sin(k*t+2*b.ph)-Math.sin(2*b.ph))/(2*k))},
  spd(ln,t){const b=ln.burst;return b?ln.speed*(1+b.b*Math.sin(3.1416*t/b.T+b.ph)**2):ln.speed},
  vxp(ln,v,t){const d=ln.dir;return(((v.p+d*s.dist(ln,t))%ln.len)+ln.len)%ln.len-MAXW},
  train(ln,t,k){const P=ln.P,u=((t+ln.off+(k||0)*P/ln.n)%P+P)%P;return{warn:u<ln.warn,on:u>=ln.warn&&u<ln.warn+ln.dur,k:(u-ln.warn)/ln.dur,dir:(k||0)%2?-1:1}},
  trainX(tr){const TL=9*cell,k=tr.dir>0?tr.k:1-tr.k;return-TL+k*(TL+GW)},
  warnAny(ln,t){for(let k=0;k<ln.n;k++)if(s.train(ln,t,k).warn)return true;return false},
  hitAt(row,col,t){const ln=lane[row];if(!ln)return false;const px=(col+.5)*cell,h=.26*cell;
   if(ln.rail){for(let k=0;k<ln.n;k++){const tr=s.train(ln,t,k);if(!tr.on)continue;const x=s.trainX(tr);if(px+h>x&&px-h<x+9*cell)return true}return false}
   for(const v of ln.vs){const x=s.vxp(ln,v,t);if(px+h>x&&px-h<x+v.w)return true}return false},
  safe(row,col,t0,t1){for(let t=t0;t<=t1;t+=.04)if(s.hitAt(row,col,t))return false;return true},
  act(a){if(s.status!=='play')return;let r=s.row,c=s.col;
   if(a==='up')r++;else if(a==='down')r--;else if(a==='left')c--;else if(a==='right')c++;else return;
   if(r<0||c<0||c>=cols||r>=rows)return;s.row=r;s.col=c;s.hop=.14;gq_sfx('tick');
   for(const it of items)if(!it.got&&it.row===r&&it.col===c){it.got=1;const p=(c+.5)*cell,q=oy+(rows-1-r)*cell+cell/2;
    if(it.k==='coin'){s.got++;gq_sfx('coin');fx.burst(p,q,8,{cols:['#ffd23f','#fff'],sp:110,k:'star',r:2.4,life:.5})}
    else{if(s.hearts<3)s.hearts++;gq_sfx('ok');fx.text(p,q-20,s.hearts>=3?'+heart':'+1 heart','#ff7eb6',14);fx.burst(p,q,10,{cols:['#ff7eb6','#fff'],sp:100,k:'heart',r:3,life:.7,g:-40})}}
   if(r===rows-1){s.status='win';fx.burst((c+.5)*cell,oy+cell/2,26,{cols:['#ff7eb6','#ffd166','#fff','#b48cff'],sp:230,k:'star',r:3})}},
  _p:null,
  pointer(t,x,y){if(t==='down')s._p={x,y};else if(t==='up'&&s._p){const dx=x-s._p.x,dy=y-s._p.y;s._p=null;
    if(Math.abs(dx)<14&&Math.abs(dy)<14)s.act('up');else if(Math.abs(dx)>Math.abs(dy))s.act(dx>0?'right':'left');else s.act(dy<0?'up':'down')}},
  update(dt){fx.update(dt);if(s.status!=='play')return;dt=Math.min(dt,.04);s.t+=dt;s.inv-=dt;s.hop=Math.max(0,s.hop-dt);if(s.gh>0)s.gh-=dt;
   s.vx+=(s.col-s.vx)*Math.min(1,dt*22);s.vr+=(s.row-s.vr)*Math.min(1,dt*22);
   /* honking and train bells */
   const px=(s.col+.5)*cell;const ln=lane[s.row];
   if(ln&&!ln.rail){s.hk=(s.hk||0)-dt;if(s.hk<=0&&ln.kind!=='bike'){for(const v of ln.vs){const x=s.vxp(ln,v,s.t),front=ln.dir>0?x+v.w:x,d=(px-front)*ln.dir;if(d>0&&d<cell*1.6&&Math.abs(px-(x+v.w/2))<cell*2.4){v.honk=.7;s.hk=2.2;gq_sfx('horn');break}}}}
   for(let r=1;r<rows-1;r++){const l=lane[r];if(!l)continue;if(l.rail){const w=s.warnAny(l,s.t);if(w&&!l.w){gq_sfx('bad')}l.w=w;continue}for(const v of l.vs)if(v.honk>0)v.honk-=dt}
   if(s.inv<=0&&s.hitAt(s.row,s.col,s.t)){s.hearts--;s.inv=.9;s.gh=.42;s.ghx=(s.vx+.5)*cell;s.ghy=oy+(rows-1-s.vr)*cell+cell/2;gq_sfx('crash');fx.shake(8);fx.burst((s.col+.5)*cell,oy+(rows-1-s.row)*cell+cell/2,14,{cols:['#ff7eb6','#ffd166','#fff'],sp:170,k:'star',r:3});s.row=0;s.col=3;s.vx=3;s.vr=0;if(s.hearts<=0)s.status='lose'}},
  draw(c){fx.begin(c);sky(c,s.t);const t=s.t;
   gq_ridge(c,oy+4,0,Math.min(200,oy-10),'#cdb9ee',.7,true);gq_ridge(c,oy+4,0,Math.min(130,oy*.6),'#b79de2',2.4,true);
   c.fillStyle='#b79de2';c.fillRect(0,oy,GW,GH-oy);
   for(let r=0;r<rows;r++){const y=oy+(rows-1-r)*cell,ln=lane[r];
    if(!ln){const goal=r===rows-1;c.fillStyle=goal?'#fbe4f2':'#e4d8f5';c.fillRect(0,y,GW,cell);
     if(goal){for(let k=0;k<cols*2;k++)for(let q=0;q<2;q++){c.fillStyle=(k+q)%2?'#ffffff':'#ff9ec8';c.fillRect(k*cell/2,y+q*cell/2,cell/2,cell/2)}c.fillStyle=GQ_INK;c.font='800 12px -apple-system,system-ui,sans-serif';c.textAlign='center';c.fillStyle='rgba(255,255,255,.9)';rr(c,GW/2-40,y+cell/2-10,80,20,10);c.fill();c.fillStyle=GQ_INK;c.fillText('FINISH',GW/2,y+cell/2+4)}
     else{gq_pines(c,y+cell-6,0,'#8a6cc4',7,18);c.fillStyle='rgba(255,255,255,.7)';for(let k=0;k<5;k++){c.beginPath();c.ellipse(((k*83+30)%GW),y+cell-8,12,4,0,0,6.3);c.fill()}}continue}
    if(ln.rail){c.fillStyle='#7d6a95';c.fillRect(0,y,GW,cell);c.fillStyle='#5a4672';c.fillRect(0,y+cell*.3,GW,4);c.fillRect(0,y+cell*.66,GW,4);
     for(let x=0;x<GW;x+=14){c.fillStyle='#6a557f';c.fillRect(x,y+cell*.22,7,cell*.56)}
     const w=s.warnAny(ln,t),fl=w&&Math.floor(t*6)%2;
     if(w){c.fillStyle='#ff6f9f';c.fillRect(0,y+cell*.5-2,GW,4);c.fillStyle='#fff';for(let x=6;x<GW;x+=26)c.fillRect(x,y+cell*.5-2,12,4)}
     for(let k=0;k<ln.n;k++){const tr=s.train(ln,t,k);if(tr.on){const x=s.trainX(tr),tl=9*cell;c.fillStyle='#fff';rr(c,x,y+4,tl,cell-8,8);c.fill();c.fillStyle='#b48cff';c.fillRect(x+4,y+cell*.6,tl-8,5);c.fillStyle='#6aa8ff';for(let q=0;q<8;q++){rr(c,x+16+q*52,y+cell*.22,30,cell*.3,4);c.fill()}
      c.fillStyle='#ff7eb6';const nx=tr.dir>0?x+tl-34:x+4;rr(c,nx,y+cell*.2,30,cell*.4,6);c.fill();c.fillStyle='rgba(59,33,104,.2)';c.fillRect(x,y+cell-8,tl,4)}}
     [8,GW-14].forEach((bx,q)=>{c.fillStyle='#fff';c.fillRect(bx,y+2,6,cell-4);c.fillStyle=fl?C.red:'#6a2b45';c.beginPath();c.arc(bx+3,y+10,6,0,6.3);c.fill();c.fillStyle=fl?'#6a2b45':(w?C.red:'#6a2b45');c.beginPath();c.arc(bx+3,y+cell-12,6,0,6.3);c.fill();if(fl){c.fillStyle='rgba(229,56,59,.25)';c.beginPath();c.arc(bx+3,y+10,12,0,6.3);c.fill()}});
     if(w){c.fillStyle='rgba(255,255,255,.95)';rr(c,GW/2-62,y+cell/2-11,124,22,11);c.fill();c.fillStyle=C.red;c.font='800 12px -apple-system,system-ui,sans-serif';c.textAlign='center';c.fillText('TRAIN COMING',GW/2,y+cell/2+4)}continue}
    const bike=ln.kind==='bike';c.fillStyle=bike?'#6fb89c':'#4a2b7d';c.fillRect(0,y,GW,cell);c.fillStyle='rgba(255,255,255,.1)';c.fillRect(0,y,GW,3);
    c.fillStyle=bike?'rgba(255,255,255,.6)':'rgba(255,230,160,.65)';for(let x=-((((t*ln.dir*10)%34)+34)%34);x<GW;x+=34)c.fillRect(x,y+cell-2,18,2);
    if(bike){c.fillStyle='rgba(255,255,255,.35)';c.font='700 11px -apple-system,system-ui,sans-serif';c.textAlign='left';c.fillText('BIKE LANE',6,y+12)}
    for(const it of items){if(it.got||it.row!==r)continue;const x=(it.col+.5)*cell,iy=y+cell/2+Math.sin(t*4+it.col)*2;
     if(it.k==='coin')gq_coin(c,x,iy,8,t+it.col);else{c.fillStyle='#ff4f93';gq_heart(c,x,iy,8+Math.sin(t*6)*1.2);c.fillStyle='rgba(255,255,255,.6)';c.beginPath();c.arc(x-4,iy-5,2,0,6.3);c.fill()}}
    for(const v of ln.vs){const x=s.vxp(ln,v,t);if(x>GW+5||x+v.w<-5)continue;const vh=ln.kind==='bike'||ln.kind==='moto'?cell-16:cell-12;gq_veh(c,ln.kind,x,y+(cell-vh)/2,v.w,vh,ln.dir,v.col,t,Math.floor(t*5)%2);
     if(v.honk>0){c.fillStyle='#fff';rr(c,x+v.w/2-16,y-8,32,15,7);c.fill();c.fillStyle=GQ_INK;c.font='800 10px -apple-system,system-ui,sans-serif';c.textAlign='center';c.fillText('BEEP',x+v.w/2,y+3)}}
    if(ln.burst&&s.spd(ln,t)>ln.speed*(1+ln.burst.b*.6)){c.fillStyle='rgba(255,255,255,.5)';for(let q=0;q<3;q++)c.fillRect((((t*300*ln.dir+q*120)%GW)+GW)%GW,y+8+q*14,22,2)}}
   const px=(s.vx+.5)*cell,py=oy+(rows-1-s.vr)*cell+cell/2-(s.hop>0?8*Math.sin(s.hop/.14*3.14):0);
   if(s.gh>0){const k=1-s.gh/.42;c.save();c.globalAlpha=Math.max(0,1-k);c.translate(s.ghx,s.ghy-k*30);c.rotate(k*(gq_rm()?0:3.4));gq_walker(c,0,0,1,t,false);c.restore();c.globalAlpha=1}
   if(s.inv>0&&Math.floor(s.inv*10)%2)c.globalAlpha=.35;gq_walker(c,px,py,1,t,s.hop>0);c.globalAlpha=1;
   fx.draw(c);c.fillStyle='#ffd23f';c.beginPath();c.arc(20,18,8,0,6.3);c.fill();c.fillStyle=GQ_INK;c.font='800 14px -apple-system,system-ui,sans-serif';c.textAlign='left';c.fillText(String(s.got),34,23);
   fx.end(c)}};
 return s};

/* ======================= Highway Stack ======================= */
ENG.stack=function(L,seed){
 const i=L-1,P=LV.stack,goal=P.goal[i],base=P.ms[i]/1000,junk=P.junk[i],COLS=10,ROWS=18,CS=28,OX=8,OY=40;
 const garbEvery=[0,0,0,0,0,0,14,13,12,12][i]; /* pieces between rising garbage rows */
 const rng=mulberry((seed||0)+L*313+11),fx=gq_fx();
 const SH=[[[0,1],[1,1],[2,1],[3,1]],[[0,0],[1,0],[0,1],[1,1]],[[1,0],[0,1],[1,1],[2,1]],[[1,0],[2,0],[0,1],[1,1]],[[0,0],[1,0],[1,1],[2,1]],[[0,0],[0,1],[1,1],[2,1]],[[2,0],[0,1],[1,1],[2,1]]];
 const COL=['#6ec6ff','#ffd166','#b48cff','#5fd4a8','#ff7e8b','#ffb36b','#ff8fd0'],DK=['#3d8fd6','#d9a52a','#8460d6','#2fa57c','#d9505f','#d9863a','#d95fa8'];
 const NAMES=['','','DOUBLE!','TRIPLE!','TRAFFIC JAM!'];
 const s={kind:'stack',L,W:GW,H:GH,hearts:3,status:'play',goal,lines:0,board:[],off:[],acc:0,cur:null,next:null,next2:null,pieces:0,fx,t:0,rows:[],
  controls:[['◀','left',1],['⟳','rotate'],['▶','right',1],['▼','down',1],['⤓','drop']],
  hud(){return 'Rows cleared '+s.lines+' of '+goal},
  interval(){return base*(1-(L>=10?.18:.28)*Math.min(1,s.lines/goal))},
  junkRow(hole){const r=Array(COLS).fill(8);r[hole]=0;return r},
  fresh(){s.board=Array.from({length:ROWS},()=>Array(COLS).fill(0));s.off=Array(ROWS).fill(0);
   for(let k=0;k<junk;k++){const r=ROWS-1-k,hole=Math.floor(rng()*COLS);for(let c=0;c<COLS;c++)if(c!==hole&&rng()<.88)s.board[r][c]=8}},
  mk(t){return{t,c:SH[t].map(p=>p.slice()),x:t===0?3:3,y:0}},
  bag:[],pull(){if(!s.bag.length){s.bag=[0,1,2,3,4,5,6];for(let k=6;k>0;k--){const j=Math.floor(rng()*(k+1));[s.bag[k],s.bag[j]]=[s.bag[j],s.bag[k]]}}return s.bag.pop()},
  fits(p,dx,dy,cells){cells=cells||p.c;for(const[a,b]of cells){const x=p.x+a+dx,y=p.y+b+dy;if(x<0||x>=COLS||y>=ROWS)return false;if(y>=0&&s.board[y][x])return false}return true},
  spawn(){s.cur=s.next!=null?s.mk(s.next):s.mk(s.pull());s.next=s.next2!=null?s.next2:s.pull();s.next2=s.pull();s.pieces++;
   if(garbEvery&&s.pieces%garbEvery===0&&s.pieces>1)s.garbage();
   if(!s.fits(s.cur,0,0)){s.topout()}},
  garbage(){const row=s.junkRow(Math.floor(rng()*COLS));s.board.shift();s.board.push(row);s.off.shift();s.off.push(CS);fx.shake(5);gq_sfx('hit');fx.text(OX+COLS*CS/2,OY+ROWS*CS-30,'JUNK ROW!','#fff',14);
   if(s.cur)while(!s.fits(s.cur,0,0)&&s.cur.y>-3)s.cur.y--},
  topout(){s.hearts--;fx.shake(10);gq_sfx('crash');fx.burst(OX+COLS*CS/2,OY+40,24,{cols:['#ff7eb6','#ffd166','#fff'],sp:200,k:'star'});if(s.hearts<=0){s.status='lose';return}s.fresh();s.cur=s.mk(s.pull());s.acc=0},
  rot(p){let c=p.c.map(([x,y])=>[-y,x]);const mx=Math.min(...c.map(a=>a[0])),my=Math.min(...c.map(a=>a[1]));return c.map(([x,y])=>[x-mx,y-my])},
  act(a){if(s.status!=='play'||!s.cur)return;const p=s.cur;
   if(a==='left'&&s.fits(p,-1,0))p.x--;
   else if(a==='right'&&s.fits(p,1,0))p.x++;
   else if(a==='down'){if(s.fits(p,0,1))p.y++;else s.lock()}
   else if(a==='drop'){let n=0;while(s.fits(p,0,1)){p.y++;n++}
    if(n&&!fx.rm)for(const[cx,cy]of p.c)for(let k=0;k<2;k++)fx.add({x:OX+(p.x+cx+.5)*CS,y:OY+(p.y+cy-1-Math.random()*n*.6)*CS,vx:0,vy:60,g:0,life:.25,max:.25,r:2.2,col:'#fff',k:'dot',rot:0,vr:0,grow:0});s.lock(n>2?3:1)}
   else if(a==='rotate'&&p.t!==1){const nc=s.rot(p);for(const k of [0,-1,1,-2,2]){if(s.fits(p,k,0,nc)){p.c=nc;p.x+=k;break}}}},
  lock(sh){const p=s.cur;for(const[a,b]of p.c){const x=p.x+a,y=p.y+b;if(y>=0)s.board[y][x]=p.t+1}if(sh)fx.shake(sh);
   const full=[];for(let r=0;r<ROWS;r++)if(s.board[r].every(v=>v))full.push(r);
   if(full.length){const n=full.length;
    for(const r of full){s.rows.push({y:r,cells:s.board[r].slice(),t:.35});for(let c=0;c<COLS;c++)if(!fx.rm||c%3===0)fx.burst(OX+(c+.5)*CS,OY+(r+.5)*CS,n>=3?3:2,{cols:[COL[s.board[r][c]-1]||'#fff','#fff','#ffe3f1'],sp:150+n*30,k:Math.random()<.4?'heart':'star',r:3,life:.7,up:60})}
    const nb=[],no=[];const fs=new Set(full);let below=0;for(let r=ROWS-1;r>=0;r--){if(fs.has(r)){below++;continue}nb.unshift(s.board[r]);no.unshift(s.off[r]-below*CS)}
    for(let k=0;k<n;k++){nb.unshift(Array(COLS).fill(0));no.unshift(0)}s.board=nb;s.off=no;
    s.lines+=n;fx.shake(Math.min(8,3+n*2));gq_sfx(n>=3?'win':'ok');fx.text(OX+COLS*CS/2,OY+full[0]*CS,NAMES[Math.min(4,n)]||'+1 row','#ffd166',n>1?20:15);
    fx.burst(OX+COLS*CS/2,OY+full[0]*CS,Math.min(3,n),{cols:['#fff','#ffd166','#ff7eb6'],sp:50,k:'ring',r:6,grow:70,life:.45,g:0});
    if(s.lines>=goal){s.status='win';return}}
   else gq_sfx('tick');
   s.acc=0;s.spawn()},
  pointer(t,x,y){if(t==='down')s._d={x,y};else if(t==='up'&&s._d){const dx=x-s._d.x,dy=y-s._d.y;s._d=null;if(Math.abs(dx)<12&&Math.abs(dy)<12)s.act('rotate');else if(Math.abs(dx)>Math.abs(dy)){const n=Math.min(4,Math.round(Math.abs(dx)/CS));for(let k=0;k<n;k++)s.act(dx>0?'right':'left')}else if(dy>30)s.act('drop')}},
  update(dt){fx.update(dt);for(const r of s.rows)r.t-=dt;s.rows=s.rows.filter(r=>r.t>0);dt=Math.min(dt,.05);s.t+=dt;
   for(let r=0;r<ROWS;r++)if(s.off[r])s.off[r]=Math.abs(s.off[r])<.5?0:s.off[r]*Math.max(0,1-dt*14);
   if(s.status!=='play'||!s.cur)return;const iv=s.interval();s.acc+=dt;while(s.acc>=iv&&s.status==='play'){s.acc-=iv;if(s.fits(s.cur,0,1))s.cur.y++;else{s.lock();if(s.status!=='play'||!s.cur)break}}},
  draw(c){fx.begin(c);sky(c,s.t);c.fillStyle='rgba(255,255,255,.42)';rr(c,OX-5,OY-5,COLS*CS+10,ROWS*CS+10,12);c.fill();c.fillStyle='rgba(247,240,255,.82)';rr(c,OX-2,OY-2,COLS*CS+4,ROWS*CS+4,9);c.fill();
   c.strokeStyle='rgba(59,33,104,.09)';c.lineWidth=1;for(let x=1;x<COLS;x++){c.beginPath();c.moveTo(OX+x*CS,OY);c.lineTo(OX+x*CS,OY+ROWS*CS);c.stroke()}for(let y=1;y<ROWS;y++){c.beginPath();c.moveTo(OX,OY+y*CS);c.lineTo(OX+COLS*CS,OY+y*CS);c.stroke()}
   const cell=(x,y,t,a,oy)=>{c.globalAlpha=a||1;const px=OX+x*CS,py=OY+y*CS+(oy||0);
    if(t===8){c.fillStyle='#8d82ad';rr(c,px+1,py+1,CS-2,CS-2,6);c.fill();c.fillStyle='#a79cc6';rr(c,px+3,py+2,CS-6,5,3);c.fill();c.fillStyle='#ffe28a';c.fillRect(px+5,py+CS/2,CS-10,2.5);c.fillStyle='rgba(59,33,104,.25)';c.fillRect(px+3,py+CS-6,CS-6,3)}
    else{const k=t-1;c.fillStyle=DK[k];rr(c,px+1,py+2,CS-2,CS-2,8);c.fill();c.fillStyle=COL[k];rr(c,px+1,py+1,CS-2,CS-4,8);c.fill();
     c.fillStyle='rgba(255,255,255,.55)';rr(c,px+5,py+3,CS-10,5,2.5);c.fill();c.fillStyle='#e9f5ff';rr(c,px+6,py+9,CS-12,7,3);c.fill();c.fillStyle='rgba(59,33,104,.35)';c.fillRect(px+3,py+CS-9,3,5);c.fillRect(px+CS-6,py+CS-9,3,5);c.fillStyle='#fff6b8';c.fillRect(px+4,py+CS-5,4,2);c.fillRect(px+CS-8,py+CS-5,4,2)}
    c.globalAlpha=1};
   for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)if(s.board[y][x])cell(x,y,s.board[y][x],1,s.off[y]);
   if(s.cur){let g=0;while(s.fits(s.cur,0,g+1))g++;for(const[a,b]of s.cur.c){const k=s.cur.t;c.fillStyle=COL[k];c.globalAlpha=.4;rr(c,OX+(s.cur.x+a)*CS+2,OY+(s.cur.y+b+g)*CS+2,CS-4,CS-4,7);c.fill();c.globalAlpha=1;c.strokeStyle='rgba(59,33,104,.55)';c.lineWidth=2;rr(c,OX+(s.cur.x+a)*CS+3,OY+(s.cur.y+b+g)*CS+3,CS-6,CS-6,6);c.stroke()}
    const so=(!fx.rm&&s.status==='play'&&s.fits(s.cur,0,1))?Math.min(.98,s.acc/s.interval())*CS:0;for(const[a,b]of s.cur.c)if(s.cur.y+b>=0)cell(s.cur.x+a,s.cur.y+b,s.cur.t+1,1,so)}
   for(const r of s.rows){const a=r.t/.35;r.cells.forEach((v,x)=>{if(v)cell(x,r.y,v,Math.min(1,a*1.3),-(1-a)*8)})}
   for(const r of s.rows){const a=r.t/.35;c.fillStyle='rgba(255,255,255,'+Math.min(.9,a*1.2)+')';c.fillRect(OX,OY+r.y*CS,COLS*CS,CS);c.fillStyle='rgba(255,126,182,'+a*.5+')';c.fillRect(OX,OY+r.y*CS+CS*(1-a)/2,COLS*CS,CS*a)}
   /* top bar: goal progress */
   const bw=GW-16;c.fillStyle='rgba(255,255,255,.55)';rr(c,8,10,bw,16,8);c.fill();const pr=clamp(s.lines/goal,0,1);if(pr>0){const g=c.createLinearGradient(8,0,8+bw,0);g.addColorStop(0,'#ff9ec8');g.addColorStop(1,'#b48cff');c.fillStyle=g;rr(c,8,10,Math.max(16,bw*pr),16,8);c.fill()}
   c.fillStyle=GQ_INK;c.font='800 11px -apple-system,system-ui,sans-serif';c.textAlign='center';c.fillText(s.lines+' / '+goal+' ROWS',GW/2,22);
   /* side panel */
   const sx=OX+COLS*CS+10;c.fillStyle='rgba(255,255,255,.55)';rr(c,sx,OY,GW-sx-6,128,12);c.fill();c.fillStyle=GQ_INK;c.font='800 10px -apple-system,system-ui,sans-serif';c.textAlign='center';c.fillText('NEXT',sx+(GW-sx-6)/2,OY+15);
   [s.next,s.next2].forEach((n,q)=>{if(n==null)return;const sc=q?7:10,ox=sx+(GW-sx-6)/2-(Math.max(...SH[n].map(p=>p[0]))+1)*sc/2,oy=OY+26+q*48;c.globalAlpha=q?.6:1;for(const[a,b]of SH[n]){c.fillStyle=COL[n];rr(c,ox+a*sc,oy+b*sc,sc-1,sc-1,2.5);c.fill()}c.globalAlpha=1});
   if(garbEvery){const left=garbEvery-(s.pieces%garbEvery);c.fillStyle='rgba(255,255,255,.55)';rr(c,sx,OY+136,GW-sx-6,44,12);c.fill();c.fillStyle=left<=2?'#d9304f':GQ_INK;c.font='800 9px -apple-system,system-ui,sans-serif';c.fillText('JUNK ROW',sx+(GW-sx-6)/2,OY+151);c.font='800 15px -apple-system,system-ui,sans-serif';c.fillText('in '+left,sx+(GW-sx-6)/2,OY+170)}
   fx.draw(c);fx.end(c)}};
 s.fresh();s.spawn();return s};

ENG.matchHow=L=>{const P=LV.match,i=L-1,nm=['stop','yield','school','speed limit','warning','railroad'];
 const t=P.goals[i].map(g=>g[0]==='collect'?'match '+g[2]+' '+nm[g[1]]+' signs':g[0]==='score'?'score '+g[1]+' points':g[0]==='cones'?'clear all '+P.cones[i]+' cones by matching next to them':g[0]==='ice'?'break all the ice by clearing signs on it':g[0]==='blast'?'clear '+g[1]+' signs with blasts':g[1]===1?'make '+g[2]+' striped piece'+(g[2]>1?'s (match 4 in a row)':' (match 4 in a row)'):g[1]===3?'make '+g[2]+' bomb (match an L or T of 5)':'make '+g[2]+' rainbow car ball (match 5 in a line)');
 const tip=L===3?' Tap a striped piece into a match and it blasts its whole line.':L===5?' Bombs blast 3 by 3, twice.':L===6?' Ice breaks when you clear the sign on it.':'';
 return 'Goal: '+t.join(', and ')+', in '+P.moves[i]+' moves.'+tip};
ENG.match=function(L,seed){
 const i=L-1,P=LV.match,T=P.types[i],MV=P.moves[i],GL=P.goals[i],NC=P.cones[i]||0,IC=P.ice[i]||[0,1],N=7,CS=48,OX=12,OY=70,D4=[[1,0],[-1,0],[0,1],[0,-1]];
 const rng=mulberry((seed||0)+L*557+3);
 const RM=typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
 const NAMES=['Stop','Yield','School','Speed','Warning','Railroad'],PCOL=['#d62839','#e86a77','#c8e51a','#ffffff','#ff8a1f','#ffd21f','#fff'],RB=['#d62839','#2f80ed','#19a974','#9b5de5','#ff6f9f','#ffc61a'];
 const CT=['Nice!','Sweet!','Radical!','Unreal!','Smooth!'],MK={1:'Striped!',3:'Bomb!',4:'Rainbow car!'},BIG=['Road closed!','Overkill. Love it.','Traffic? What traffic.','Kaboom, safely.'];
 const at=k=>s.g[(k/N)|0][k%N];
 const prog=g=>g[0]==='collect'?[Math.min(s.got[g[1]],g[2]),g[2]]:g[0]==='score'?[Math.min(s.score,g[1]),g[1]]:g[0]==='cones'?[s.cones-s.coneLeft,s.cones]:g[0]==='make'?[Math.min(s.made[g[1]],g[2]),g[2]]:g[0]==='blast'?[Math.min(s.blast,g[1]),g[1]]:[s.iceN-s.iceLeft,s.iceN];
 const lbl=g=>g[0]==='collect'?NAMES[g[1]]:g[0]==='make'?({1:'Striped',3:'Bombs',4:'Rainbow'})[g[1]]:({score:'Score',cones:'Cones',blast:'Blasted',ice:'Ice'})[g[0]];
 const snd=n=>{try{if(typeof window!=='undefined'&&typeof window.sfx==='function')window.sfx(n)}catch(e){}};
 const s={kind:'match',L,W:GW,H:GH,hearts:3,status:'play',moves:MV,mv0:MV,score:0,got:[0,0,0,0,0,0],made:{1:0,3:0,4:0},blast:0,cones:NC,coneLeft:NC,iceN:0,iceLeft:0,g:[],ice:[],mode:'idle',tm:0,sel:null,combo:0,idle:0,controls:[],goal:GL[0],goals:GL,T:0,parts:[],txt:[],beams:[],sq:[],shake:0,after:[],log:[],hintMv:null,pd:null,sw:null,shuffles:0,
  hud(){return GL.map(g=>{const p=prog(g);return lbl(g)+' '+p[0]+'/'+p[1]}).join(' · ')},
  done(){return GL.every(g=>{const p=prog(g);return p[0]>=p[1]})},
  tile(t,sp){return{t,sp:sp||0,ox:0,oy:0,d:0,vy:0,f:0,sq:0,pp:0,ph:rng()*6.28}},
  rnd(){return s.tile(Math.floor(rng()*T))},
  runs(){const g=s.g,R=[];
   for(let r=0;r<N;r++){let c=0;while(c<N){const a=g[r][c];if(!a||a.t>5){c++;continue}let e=c+1;while(e<N&&g[r][e]&&g[r][e].t===a.t)e++;if(e-c>=3)R.push({d:'h',t:a.t,cells:Array.from({length:e-c},(_,k)=>r*N+c+k)});c=e}}
   for(let c=0;c<N;c++){let r=0;while(r<N){const a=g[r][c];if(!a||a.t>5){r++;continue}let e=r+1;while(e<N&&g[e][c]&&g[e][c].t===a.t)e++;if(e-r>=3)R.push({d:'v',t:a.t,cells:Array.from({length:e-r},(_,k)=>(r+k)*N+c)});r=e}}
   return R},
  matches(){const m=new Set();for(const r of s.runs())for(const k of r.cells)m.add(k);return m},
  /* match groups -> cells to clear + special pieces to create */
  planMatch(pref){const R=s.runs();if(!R.length)return null;const gs=[],pr=pref||[];
   for(const r of R){const hit=gs.filter(q=>q.t===r.t&&r.cells.some(k=>q.set.has(k)));let q;
    if(hit.length){q=hit[0];for(const o of hit.slice(1)){o.runs.forEach(x=>q.runs.push(x));o.set.forEach(x=>q.set.add(x));gs.splice(gs.indexOf(o),1)}}else{q={t:r.t,set:new Set(),runs:[]};gs.push(q)}
    q.runs.push(r);r.cells.forEach(k=>q.set.add(k))}
   const init=[],created=[];
   const pick=(cells,d)=>{const ok=cells.filter(k=>!at(k).sp);if(!ok.length)return -1;const p=ok.find(k=>pr.includes(k));return p!==undefined?p:(ok.includes(d)?d:ok[0])};
   for(const q of gs){q.set.forEach(k=>init.push(k));
    const long=q.runs.reduce((a,b)=>b.cells.length>a.cells.length?b:a),H=q.runs.filter(x=>x.d==='h'),V=q.runs.filter(x=>x.d==='v');
    if(long.cells.length>=5){const p=pick(long.cells,long.cells[long.cells.length>>1]);if(p>=0)created.push({idx:p,sp:4,t:q.t})}
    else if(H.length&&V.length){const x=[...q.set].filter(k=>H.some(h=>h.cells.includes(k))&&V.some(v=>v.cells.includes(k)));const p=pick(x,x[0]);if(p>=0)created.push({idx:p,sp:3,t:q.t})}
    else if(long.cells.length===4){const p=pick(long.cells,long.cells[1]);if(p>=0)created.push({idx:p,sp:long.d==='h'?1:2,t:q.t})}}
   return{init,created}},
  common(){const n=[0,0,0,0,0,0];for(const row of s.g)for(const t of row)if(t.t<=5)n[t.t]++;let b=0;for(let k=1;k<6;k++)if(n[k]>n[b])b=k;return b},
  eff(k,t,ctx){const r=(k/N)|0,c=k%N,o=[],B=ctx.beams;
   if(t.sp===1){for(let x=0;x<N;x++)o.push(r*N+x);B.push({k:'row',r,w:1})}
   else if(t.sp===2){for(let x=0;x<N;x++)o.push(x*N+c);B.push({k:'col',c,w:1})}
   else if(t.sp===3){for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const r2=r+a,c2=c+b;if(r2>=0&&r2<N&&c2>=0&&c2<N)o.push(r2*N+c2)}B.push({k:'ring',r,c,rad:1});ctx.after.push(k)}
   else if(t.sp===4){const col=ctx.col&&ctx.col.has(k)?ctx.col.get(k):s.common();for(let x=0;x<N*N;x++)if(at(x).t===col)o.push(x);B.push({k:'zap',from:k,to:o.slice()})}
   return o},
  chain(init,protect,ctx){const set=new Set(),q=[],via=new Set();ctx.act=ctx.act||new Set();ctx.beams=ctx.beams||[];ctx.after=ctx.after||[];
   const add=(k,v)=>{if(set.has(k)||protect.has(k))return;set.add(k);if(v)via.add(k);const t=at(k);if(t.sp&&!ctx.act.has(k))q.push(k)};
   init.forEach(k=>add(k,0));
   while(q.length){const k=q.shift();if(ctx.act.has(k))continue;ctx.act.add(k);for(const j of s.eff(k,at(k),ctx))add(j,1)}
   for(const k of [...set]){const r=(k/N)|0,c=k%N;for(const[a,b]of D4){const r2=r+a,c2=c+b;if(r2>=0&&r2<N&&c2>=0&&c2<N&&s.g[r2][c2].t===9)add(r2*N+c2,0)}}
   ctx.set=set;ctx.via=via;return ctx},
  /* special + special swap combos. a,b are board indexes AFTER the swap */
  comboPlan(a,b){const X=at(a),Y=at(b),ctx={act:new Set([a,b]),beams:[],after:[],col:new Map()},init=[];const br=Math.floor(b/N),bc=b%N,B=ctx.beams;
   const rows=(w)=>{for(let r=br-w;r<=br+w;r++)for(let c=0;c<N;c++)if(r>=0&&r<N)init.push(r*N+c);B.push({k:'row',r:br,w:w*2+1})},cols=(w)=>{for(let c=bc-w;c<=bc+w;c++)for(let r=0;r<N;r++)if(c>=0&&c<N)init.push(r*N+c);B.push({k:'col',c:bc,w:w*2+1})};
   ctx.kind='combo';
   if(X.sp===4||Y.sp===4){const bomb=X.sp===4?a:b,o=X.sp===4?b:a,O=at(o);ctx.act=new Set([bomb]);
    if(O.sp===4){for(let k=0;k<N*N;k++)init.push(k);B.push({k:'all'});ctx.kind='all'}
    else{const col=O.t,to=[];for(let k=0;k<N*N;k++){const t=at(k);if(t.t===col){to.push(k);if(O.sp&&!t.sp)t.sp=O.sp===3?3:(rng()<.5?1:2);init.push(k)}}init.push(bomb);B.push({k:'zap',from:bomb,to});ctx.kind=O.sp?'convert':'color'}}
   else if(X.sp===3&&Y.sp===3){for(let r=br-2;r<=br+2;r++)for(let c=bc-2;c<=bc+2;c++)if(r>=0&&r<N&&c>=0&&c<N)init.push(r*N+c);B.push({k:'ring',r:br,c:bc,rad:2});ctx.kind='bb'}
   else if(X.sp===3||Y.sp===3){rows(1);cols(1);ctx.kind='bl'}
   else{rows(0);cols(0);ctx.kind='ll'}
   return{ctx,init}},
  go(ctx,init,created){s.chain(init,new Set(created.map(q=>q.idx)),ctx);s.commit(ctx,created)},
  burst(r,c,t){const x=OX+c*CS+CS/2,y=OY+r*CS+CS/2,col=t==='ice'?'#bfe6ff':PCOL[t.t]||'#fff',n=RM?0:(t==='ice'?3:5);
   for(let k=0;k<n&&s.parts.length<260;k++){const a=rng()*6.28,v=60+rng()*140;s.parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-70,life:.5+rng()*.3,max:.8,col,sz:2+rng()*3,star:0})}},
  stars(x,y,n){if(RM)n=Math.min(n,2);for(let k=0;k<n&&s.parts.length<300;k++){const a=rng()*6.28,v=80+rng()*160;s.parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-90,life:.7+rng()*.4,max:1.1,col:k%2?'#ffc61a':'#fff',sz:4+rng()*3,star:1})}},
  say(txt,x,y,col,sz){s.txt.push({s:txt,x:clamp(x,70,GW-70),y,life:1.1,max:1.1,col:col||'#fff',sz:sz||22})},
  commit(ctx,created){s.combo++;let pts=0;const via=[...(ctx.kind&&ctx.kind!=='match'?ctx.set:ctx.via)].filter(k=>at(k).t!==9).length;
   ctx.set.forEach(k=>{const r=(k/N)|0,c=k%N,t=s.g[r][c];if(t.t===9){s.coneLeft--;pts+=15}else if(t.t<=5){s.got[t.t]++;pts+=10}else pts+=20;if(t.sp)pts+=30;
    if(s.ice[r][c]>0){s.ice[r][c]--;pts+=15;if(!s.ice[r][c])s.iceLeft--;s.burst(r,c,'ice')}
    t.d=1;s.burst(r,c,t)});
   for(const q of created){const r=(q.idx/N)|0,c=q.idx%N,t=s.g[r][c];if(t.t<=5)s.got[t.t]++;t.sp=q.sp;if(q.sp===4)t.t=6;t.pp=RM?0:.4;s.made[q.sp===2?1:q.sp]++;pts+=40;s.stars(OX+c*CS+CS/2,OY+r*CS+CS/2,6);s.say(MK[q.sp===2?1:q.sp],OX+c*CS+CS/2,OY+r*CS-4,'#ffc61a',20);s.snd(.1,'ok')}
   s.blast+=via;s.beams.push(...ctx.beams.map(b=>Object.assign({tm:.4,max:.4},b)));s.after.push(...ctx.after);
   s.score+=Math.round(pts*(1+(s.combo-1)*.5));
   s.log.push({n:ctx.set.size,via,kind:ctx.kind||'match',created:created.map(q=>({idx:q.idx,sp:q.sp})),set:[...ctx.set]});
   if(s.combo>=2)s.say(CT[Math.min(s.combo-2,CT.length-1)],GW/2,OY+N*CS/2-46,'#fff',24);
   if(via>=7||ctx.kind==='all'){s.say(BIG[(s.log.length+s.score)%BIG.length],GW/2,OY+N*CS/2+26,'#ffc61a',22)}
   if(!RM&&ctx.beams.length)s.shake=Math.min(9,2+via*.4+(ctx.kind&&ctx.kind!=='match'?3:0));
   const k=Math.min(4,s.combo+(ctx.beams.length?1:0));for(let j=0;j<k;j++)s.snd(j*.07,'coin');if(ctx.beams.length)s.snd(0,'hit');
   s.hintMv=null;s.mode='clear';s.tm=ctx.beams.length?.3:.22},
  snd(d,n){s.sq.push([d,n])},
  fall(){const g=s.g;for(let c=0;c<N;c++){const col=[];for(let r=N-1;r>=0;r--)if(!g[r][c].d)col.push([r,g[r][c]]);
   let w=N-1;for(const[r,t]of col){g[w][c]=t;if(r!==w){t.oy+=(r-w)*CS;t.f=1;t.vy=0}w--}
   for(let r=w;r>=0;r--){const t=s.rnd();t.oy=-(w+1)*CS;t.f=1;g[r][c]=t}}
   s.mode='fall'},
  valid(){const o=[],g=s.g;for(let r=0;r<N;r++)for(let c=0;c<N;c++)for(const[dr,dc]of[[0,1],[1,0]]){const r2=r+dr,c2=c+dc;if(r2>=N||c2>=N)continue;const A=g[r][c],B=g[r2][c2];if(A.t>6||B.t>6)continue;
    if(A.sp===4||B.sp===4||(A.sp&&B.sp)){o.push([[r,c],[r2,c2]]);continue}
    g[r][c]=B;g[r2][c2]=A;const ok=s.runs().length>0;g[r][c]=A;g[r2][c2]=B;if(ok)o.push([[r,c],[r2,c2]])}return o},
  hint(){const v=s.valid();return v.find(p=>s.g[p[0][0]][p[0][1]].sp||s.g[p[1][0]][p[1][1]].sp)||v[0]||null},
  build(){do{s.g=Array.from({length:N},()=>Array.from({length:N},()=>s.rnd()));s.ice=Array.from({length:N},()=>Array(N).fill(0));
    let k=0;while(k<NC){const r=Math.floor(rng()*N),c=Math.floor(rng()*N);if(s.g[r][c].t<6){s.g[r][c]=s.tile(9);k++}}
    k=0;while(k<IC[0]){const r=1+Math.floor(rng()*(N-2)),c=1+Math.floor(rng()*(N-2));if(s.g[r][c].t<6&&!s.ice[r][c]){s.ice[r][c]=IC[1];k++}}
    s.iceN=s.iceLeft=IC[0];
    for(let k=0;k<80&&s.runs().length;k++)for(const idx of s.matches()){const r=Math.floor(idx/N),c=idx%N;s.g[r][c]=s.rnd()}
   }while(s.runs().length||!s.valid().length)},
  shuffle(){const cells=[];for(let r=0;r<N;r++)for(let c=0;c<N;c++){const t=s.g[r][c];if(t.t<=5&&!t.sp)cells.push([r,c])}
   let k=0;do{const ts=cells.map(([r,c])=>s.g[r][c]);for(let j=ts.length-1;j>0;j--){const m=Math.floor(rng()*(j+1));[ts[j],ts[m]]=[ts[m],ts[j]]}
    cells.forEach(([r,c],j)=>{s.g[r][c]=ts[j]});k++;
    if(k>150&&(s.runs().length||!s.valid().length))cells.forEach(([r,c])=>{s.g[r][c]=s.rnd()})}while((s.runs().length||!s.valid().length)&&k<600);
   for(const[r,c]of cells){const t=s.g[r][c];t.pp=RM?0:.35;t.ox=t.oy=0}
   s.shuffles++;s.say('No moves. Shuffling!',GW/2,OY+N*CS/2,'#fff',22)},
  swap(a,b){if(s.mode!=='idle'||s.status!=='play'||s.moves<=0)return false;const[r1,c1]=a,[r2,c2]=b;
   if(Math.abs(r1-r2)+Math.abs(c1-c2)!==1)return false;const A=s.g[r1][c1],B=s.g[r2][c2];if(A.t>6||B.t>6)return false;
   s.g[r1][c1]=B;s.g[r2][c2]=A;A.ox=(c1-c2)*CS;A.oy=(r1-r2)*CS;B.ox=(c2-c1)*CS;B.oy=(r2-r1)*CS;s.mode='swap';s.tm=.15;s.sw=[a,b];s.sel=null;s.idle=0;s.combo=0;s.hintMv=null;return true},
  resolveSwap(){const[a,b]=s.sw,ai=a[0]*N+a[1],bi=b[0]*N+b[1],X=s.g[a[0]][a[1]],Y=s.g[b[0]][b[1]];
   if(X.sp===4||Y.sp===4||(X.sp&&Y.sp)){s.moves--;const p=s.comboPlan(ai,bi);s.go(p.ctx,p.init,[]);return}
   const p=s.planMatch([ai,bi]);
   if(p){s.moves--;s.go({act:new Set(),beams:[],after:[],col:new Map()},p.init,p.created)}
   else{const A=s.g[a[0]][a[1]],B=s.g[b[0]][b[1]];s.g[a[0]][a[1]]=B;s.g[b[0]][b[1]]=A;A.ox=(b[1]-a[1])*CS;A.oy=(b[0]-a[0])*CS;B.ox=(a[1]-b[1])*CS;B.oy=(a[0]-b[0])*CS;s.mode='back';s.tm=.15}},
  afterBlast(){const list=s.after;s.after=[];const init=[];for(const k of list){const r=(k/N)|0,c=k%N;for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const r2=r+a,c2=c+b;if(r2>=0&&r2<N&&c2>=0&&c2<N)init.push(r2*N+c2)}}
   const ctx={act:new Set(),beams:list.map(k=>({k:'ring',r:(k/N)|0,c:k%N,rad:1})),after:[],col:new Map(),kind:'after'};s.go(ctx,init,[])},
  settle(){if(s.done()){s.mode='cele';s.tm=.7;s.combo=0;if(!RM)for(let k=0;k<5;k++)s.stars(OX+rng()*N*CS,OY+rng()*N*CS,6);else s.stars(GW/2,GH/2,2);s.say('Level clear!',GW/2,OY+N*CS/2,'#ffc61a',30);s.snd(0,'win');return}
   if(s.moves<=0){s.status='lose';return}
   if(!s.valid().length)s.shuffle();
   s.mode='idle';s.idle=0;s.hintMv=null},
  pointer(t,x,y){const c=Math.floor((x-OX)/CS),r=Math.floor((y-OY)/CS);const inb=r>=0&&r<N&&c>=0&&c<N;
   if(t==='down'){s.pd=inb?[r,c]:null;if(inb&&s.mode==='idle'){if(s.sel&&Math.abs(s.sel[0]-r)+Math.abs(s.sel[1]-c)===1){s.swap(s.sel,[r,c]);s.pd=null}else if(s.sel&&s.sel[0]===r&&s.sel[1]===c)s.sel=null;else s.sel=[r,c]}}
   else if(t==='up'&&s.pd){const dx=x-(OX+s.pd[1]*CS+CS/2),dy=y-(OY+s.pd[0]*CS+CS/2);if(Math.hypot(dx,dy)>CS*.55){const to=Math.abs(dx)>Math.abs(dy)?[s.pd[0],s.pd[1]+(dx>0?1:-1)]:[s.pd[0]+(dy>0?1:-1),s.pd[1]];if(to[0]>=0&&to[0]<N&&to[1]>=0&&to[1]<N)s.swap(s.pd,to)}s.pd=null}},
  act(a){if(a==='hint'&&s.mode==='idle')s.idle=6},
  update(dt){if(s.status!=='play')return;dt=Math.min(dt,.05);s.T+=dt;
   const k=Math.min(1,dt*15);
   for(const row of s.g)for(const t of row){if(t.f){t.vy+=2600*dt;t.oy+=t.vy*dt;if(t.oy>=0){t.oy=0;if(t.vy>260&&!RM)t.sq=.24;t.vy=0;t.f=0}}
    else{t.ox-=t.ox*k;t.oy-=t.oy*k;if(Math.abs(t.ox)<.4)t.ox=0;if(Math.abs(t.oy)<.4)t.oy=0}
    if(t.sq>0)t.sq=Math.max(0,t.sq-dt);if(t.pp>0)t.pp=Math.max(0,t.pp-dt)}
   for(const p of s.parts){p.vy+=520*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt}s.parts=s.parts.filter(p=>p.life>0);
   for(const p of s.txt)p.life-=dt;s.txt=s.txt.filter(p=>p.life>0);
   for(const b of s.beams)b.tm-=dt;s.beams=s.beams.filter(b=>b.tm>0);
   s.shake=Math.max(0,s.shake-dt*18);
   for(const q of s.sq)q[0]-=dt;{const due=s.sq.filter(q=>q[0]<=0);s.sq=s.sq.filter(q=>q[0]>0);for(const q of due)snd(q[1])}
   if(s.mode==='idle'){s.idle+=dt;return}
   s.tm-=dt;
   if(s.mode==='swap'){if(s.tm<=0)s.resolveSwap()}
   else if(s.mode==='back'){if(s.tm<=0){s.mode='idle';s.idle=0}}
   else if(s.mode==='clear'){if(s.tm<=0)s.fall()}
   else if(s.mode==='fall'){let mv=false;for(const row of s.g)for(const t of row)if(t.f||t.oy<0)mv=true;
    if(!mv){if(s.after.length)s.afterBlast();else{const p=s.planMatch([]);if(p)s.go({act:new Set(),beams:[],after:[],col:new Map()},p.init,p.created);else s.settle()}}}
   else if(s.mode==='cele'){if(s.tm<=0)s.status='win'}},
  /* ---------- art ---------- */
  sign(c,t,x,y,z){c.save();c.translate(x,y);c.lineJoin='round';
   if(t===0){c.fillStyle='#fff';c.beginPath();for(let k=0;k<8;k++){const a=Math.PI/8+k*Math.PI/4;c.lineTo(Math.cos(a)*z,Math.sin(a)*z)}c.fill();c.fillStyle='#d62839';c.beginPath();for(let k=0;k<8;k++){const a=Math.PI/8+k*Math.PI/4;c.lineTo(Math.cos(a)*z*.88,Math.sin(a)*z*.88)}c.fill();c.fillStyle='#fff';c.font='800 '+Math.round(z*.5)+'px -apple-system,system-ui,sans-serif';c.textAlign='center';c.fillText('STOP',0,z*.18)}
   else if(t===1){c.fillStyle='#fff';c.beginPath();c.moveTo(-z,-z*.8);c.lineTo(z,-z*.8);c.lineTo(0,z*.95);c.closePath();c.fill();c.strokeStyle='#d62839';c.lineWidth=z*.2;c.stroke();}
   else if(t===2){c.fillStyle='#c8e51a';c.strokeStyle='#1b1f27';c.lineWidth=2.5;c.beginPath();c.moveTo(0,-z);c.lineTo(z*.9,-z*.35);c.lineTo(z*.9,z*.9);c.lineTo(-z*.9,z*.9);c.lineTo(-z*.9,-z*.35);c.closePath();c.fill();c.stroke();c.fillStyle='#1b1f27';[-.3,.3].forEach(k=>{c.beginPath();c.arc(z*k,-z*.12,z*.14,0,6.3);c.fill();c.fillRect(z*k-z*.07,z*.04,z*.14,z*.5)})}
   else if(t===3){c.fillStyle='#fff';c.strokeStyle='#1b1f27';c.lineWidth=2.5;rr(c,-z*.8,-z,z*1.6,z*2,6);c.fill();c.stroke();c.fillStyle='#1b1f27';c.font='800 '+Math.round(z*.36)+'px -apple-system,system-ui,sans-serif';c.textAlign='center';c.fillText('SPEED',0,-z*.45);c.fillText('LIMIT',0,-z*.1);c.font='800 '+Math.round(z*.68)+'px -apple-system,system-ui,sans-serif';c.fillText('25',0,z*.72)}
   else if(t===4){c.fillStyle='#ff8a1f';c.strokeStyle='#1b1f27';c.lineWidth=2.5;c.beginPath();c.moveTo(0,-z);c.lineTo(z,0);c.lineTo(0,z);c.lineTo(-z,0);c.closePath();c.fill();c.stroke();c.fillStyle='#1b1f27';c.fillRect(-z*.4,-z*.08,z*.8,z*.16)}
   else if(t===5){c.fillStyle='#ffd21f';c.strokeStyle='#1b1f27';c.lineWidth=2.5;c.beginPath();c.arc(0,0,z,0,6.3);c.fill();c.stroke();c.lineWidth=z*.2;c.lineCap='round';c.beginPath();c.moveTo(-z*.5,-z*.5);c.lineTo(z*.5,z*.5);c.moveTo(z*.5,-z*.5);c.lineTo(-z*.5,z*.5);c.stroke()}
   else if(t===9){c.fillStyle='#ff6a1f';c.beginPath();c.moveTo(0,-z*.9);c.lineTo(z*.7,z*.8);c.lineTo(-z*.7,z*.8);c.closePath();c.fill();c.fillStyle='#fff';c.beginPath();c.moveTo(-z*.28,-z*.1);c.lineTo(z*.28,-z*.1);c.lineTo(z*.4,z*.25);c.lineTo(-z*.4,z*.25);c.closePath();c.fill();c.fillStyle='#1b1f27';c.fillRect(-z*.9,z*.8,z*1.8,z*.2)}
   c.restore()},
  star4(c,x,y,r){c.beginPath();c.moveTo(x,y-r);c.quadraticCurveTo(x,y,x+r,y);c.quadraticCurveTo(x,y,x,y+r);c.quadraticCurveTo(x,y,x-r,y);c.quadraticCurveTo(x,y,x,y-r);c.fill()},
  arrow(c,z){const L=z*1.35,h=z*.42;c.lineCap='round';c.lineJoin='round';
   for(const[w,col]of[[z*.55,'#3b2168'],[z*.26,'#fff']]){c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.moveTo(-L,0);c.lineTo(L,0);c.moveTo(-L+h,-h);c.lineTo(-L,0);c.lineTo(-L+h,h);c.moveTo(L-h,-h);c.lineTo(L,0);c.lineTo(L-h,h);c.stroke()}},
  mark(c,t,z){const p=.5+.5*Math.sin(s.T*5+t.ph);
   if(t.sp===1||t.sp===2){c.save();if(t.sp===2)c.rotate(Math.PI/2);s.arrow(c,z);c.restore()}
   else if(t.sp===3){c.lineWidth=6;c.strokeStyle='#3b2168';c.beginPath();c.arc(0,0,z*1.22,0,6.3);c.stroke();c.lineWidth=3.5;c.strokeStyle='rgba(255,159,28,'+(.6+.4*p)+')';c.beginPath();c.arc(0,0,z*(1.22+.06*p),0,6.3);c.stroke();c.lineWidth=1.5;c.strokeStyle='#fff';c.beginPath();c.arc(0,0,z*1.22,0,6.3);c.stroke();
    c.fillStyle='#fff';for(let k=0;k<4;k++){const a=(RM?0:s.T*2.2)+k*Math.PI/2;c.beginPath();c.arc(Math.cos(a)*z*1.22,Math.sin(a)*z*1.22,2.2,0,6.3);c.fill()}}
   c.fillStyle='rgba(255,255,255,'+(.5+.5*p)+')';s.star4(c,z*.85,-z*.85,3+3*p)},
  ball(c,z,ph){const R=z*1.15,rot=RM?0:s.T*.9+ph;c.save();for(let k=0;k<6;k++){c.fillStyle=RB[k];c.beginPath();c.moveTo(0,0);c.arc(0,0,R,rot+k*Math.PI/3,rot+(k+1)*Math.PI/3);c.closePath();c.fill()}
   c.strokeStyle='#fff';c.lineWidth=2.5;c.beginPath();c.arc(0,0,R,0,6.3);c.stroke();c.fillStyle='#f4eefc';c.beginPath();c.arc(0,0,R*.64,0,6.3);c.fill();
   drawCar(c,0,z*.2,z*1.25,{color:'#e5383b',skin:'#f1c27d',hair:'#3b2a20'});c.fillStyle='rgba(255,255,255,.6)';c.beginPath();c.arc(-R*.45,-R*.55,R*.14,0,6.3);c.fill();
   const p=.5+.5*Math.sin(s.T*5+ph);c.fillStyle='rgba(255,255,255,'+(.5+.5*p)+')';s.star4(c,R*.8,-R*.8,3+3*p);c.restore()},
  drawTile(c,t,x,y,z,hint){let sx=1,sy=1;if(t.sq>0){const w=Math.sin(t.sq/.24*Math.PI);sx=1+.22*w;sy=1-.22*w}
   if(t.pp>0){const w=Math.sin(t.pp/.4*Math.PI);sx*=1+.5*w;sy*=1+.5*w}if(hint&&!RM){const q=1+Math.sin(s.T*10)*.08;sx*=q;sy*=q}
   c.save();c.translate(x,y+z*(1-sy));c.scale(sx,sy);
   if(t.sp){const p=.5+.5*Math.sin(s.T*5+t.ph),col=t.sp===3?'255,159,28':t.sp===4?'255,255,255':'255,236,140';let m=GQ_GR.get(c);if(!m){m={};GQ_GR.set(c,m)}let g=m[col];if(!g){g=m[col]=c.createRadialGradient(0,0,.4,0,0,1.8);g.addColorStop(0,'rgba('+col+',1)');g.addColorStop(1,'rgba('+col+',0)')}const ga=c.globalAlpha;c.save();c.scale(z,z);c.globalAlpha=ga*(.55+.25*p);c.fillStyle=g;c.beginPath();c.arc(0,0,1.8,0,6.3);c.fill();c.restore()}
   if(t.sp===4)s.ball(c,z,t.ph);else{s.sign(c,t.t,0,0,z);if(t.sp)s.mark(c,t,z)}
   c.restore()},
  draw(c){const g=c.createLinearGradient(0,0,0,GH);g.addColorStop(0,'#b9a2ea');g.addColorStop(.5,'#dcc4f3');g.addColorStop(1,'#fbd2e4');c.fillStyle=g;c.fillRect(0,0,GW,GH);
   c.save();if(s.shake>.2&&!RM)c.translate((Math.random()-.5)*s.shake,(Math.random()-.5)*s.shake);
   c.fillStyle='#6b3fb0';rr(c,OX-6,OY-6,N*CS+12,N*CS+12,14);c.fill();
   const hint=s.mode==='idle'&&s.idle>5?(s.hintMv=s.hintMv||s.hint()):null;
   for(let r=0;r<N;r++)for(let k=0;k<N;k++){c.fillStyle=(r+k)%2?'#e0d2f6':'#ece3fa';rr(c,OX+k*CS+1,OY+r*CS+1,CS-2,CS-2,8);c.fill();
    const ic=s.ice[r][k];if(ic>0){c.fillStyle=ic>1?'#8fd0f5':'#bfe6ff';rr(c,OX+k*CS+1,OY+r*CS+1,CS-2,CS-2,8);c.fill();c.strokeStyle='#fff';c.lineWidth=ic>1?3.5:2;rr(c,OX+k*CS+3,OY+r*CS+3,CS-6,CS-6,7);c.stroke()}}
   if(s.sel){c.strokeStyle='#3b2168';c.lineWidth=3.5;rr(c,OX+s.sel[1]*CS+2,OY+s.sel[0]*CS+2,CS-4,CS-4,9);c.stroke();c.strokeStyle='#fff';c.lineWidth=1.5;rr(c,OX+s.sel[1]*CS+4,OY+s.sel[0]*CS+4,CS-8,CS-8,7);c.stroke()}
   if(hint){c.strokeStyle='rgba(255,198,26,'+(.6+.4*Math.sin(s.T*8))+')';c.lineWidth=3.5;for(const h of hint){rr(c,OX+h[1]*CS+2,OY+h[0]*CS+2,CS-4,CS-4,9);c.stroke()}}
   c.save();c.beginPath();c.rect(OX,OY,N*CS,N*CS);c.clip();
   for(let r=0;r<N;r++)for(let k=0;k<N;k++){const t=s.g[r][k];if(!t)continue;const x=OX+k*CS+CS/2+t.ox,y=OY+r*CS+CS/2+t.oy;
    let z=CS*.38;if(t.d){const q=clamp(s.tm/.22,0,1);c.globalAlpha=q;z*=Math.max(.15,q)}
    s.drawTile(c,t,x,y,z,hint&&((hint[0][0]===r&&hint[0][1]===k)||(hint[1][0]===r&&hint[1][1]===k)));c.globalAlpha=1;
    const ic=s.ice[r][k];if(ic>0){c.fillStyle='rgba(200,235,255,'+(ic>1?.38:.2)+')';rr(c,OX+k*CS+1,OY+r*CS+1,CS-2,CS-2,8);c.fill();c.strokeStyle='rgba(255,255,255,.85)';c.lineWidth=1.5;c.beginPath();c.moveTo(OX+k*CS+8,OY+r*CS+12);c.lineTo(OX+k*CS+20,OY+r*CS+6);c.stroke();if(ic>1){c.beginPath();c.moveTo(OX+k*CS+30,OY+r*CS+42);c.lineTo(OX+k*CS+40,OY+r*CS+34);c.stroke()}}}
   for(const b of s.beams){const q=clamp(b.tm/b.max,0,1),cx=b=>OX+(b%N)*CS+CS/2,cy=b=>OY+Math.floor(b/N)*CS+CS/2;
    if(b.k==='row'){c.fillStyle='rgba(255,255,255,'+(.85*q)+')';c.fillRect(OX,OY+b.r*CS+CS/2-CS*b.w/2*q-2,N*CS,CS*b.w*q+4);c.fillStyle='rgba(255,198,26,'+(.6*q)+')';c.fillRect(OX,OY+b.r*CS+CS/2-CS*b.w/2,N*CS,CS*b.w)}
    else if(b.k==='col'){c.fillStyle='rgba(255,255,255,'+(.85*q)+')';c.fillRect(OX+b.c*CS+CS/2-CS*b.w/2*q-2,OY,CS*b.w*q+4,N*CS);c.fillStyle='rgba(255,198,26,'+(.6*q)+')';c.fillRect(OX+b.c*CS+CS/2-CS*b.w/2,OY,CS*b.w,N*CS)}
    else if(b.k==='ring'){const x=OX+b.c*CS+CS/2,y=OY+b.r*CS+CS/2,R=CS*(b.rad+.5)*(1.2-q*.5);c.strokeStyle='rgba(255,159,28,'+q+')';c.lineWidth=8*q+2;c.beginPath();c.arc(x,y,R,0,6.3);c.stroke();c.fillStyle='rgba(255,255,255,'+(.5*q)+')';c.beginPath();c.arc(x,y,R,0,6.3);c.fill()}
    else if(b.k==='zap'){c.strokeStyle='rgba(255,255,255,'+q+')';c.lineWidth=2.5;for(const t of b.to){c.beginPath();c.moveTo(cx(b.from),cy(b.from));c.lineTo(cx(t),cy(t));c.stroke()}}
    else if(b.k==='all'){if(!RM){c.fillStyle='rgba(255,255,255,'+(.8*q)+')';c.fillRect(OX,OY,N*CS,N*CS)}}}
   c.restore();
   for(const p of s.parts){c.globalAlpha=clamp(p.life/p.max*1.5,0,1);c.fillStyle=p.col;if(p.star)s.star4(c,p.x,p.y,p.sz*1.4);else c.fillRect(p.x-p.sz/2,p.y-p.sz/2,p.sz,p.sz)}c.globalAlpha=1;
   c.restore();
   c.fillStyle='#3b2168';c.font='800 15px -apple-system,system-ui,sans-serif';c.textAlign='left';c.fillText('Moves left',OX,OY-24);c.font='800 30px -apple-system,system-ui,sans-serif';c.fillStyle='#6b3fb0';c.fillText(String(s.moves),OX+98,OY-22);
   c.textAlign='right';c.font='800 15px -apple-system,system-ui,sans-serif';c.fillStyle='#3b2168';c.fillText('Score '+s.score,GW-OX,OY-40);
   if(s.combo>1&&s.mode!=='idle'){c.font='800 18px -apple-system,system-ui,sans-serif';c.fillStyle='#b3336e';c.fillText('Combo x'+s.combo,GW-OX,OY-18)}
   c.textAlign='center';c.lineJoin='round';for(const p of s.txt){const q=p.life/p.max,e=1-q,sc=e<.15?.6+e/.15*.6:1.2-Math.min(.2,(e-.15)*.5);c.save();c.globalAlpha=clamp(q*2.2,0,1);c.translate(p.x,p.y-(RM?0:e*34));c.scale(sc,sc);c.font='800 '+p.sz+'px -apple-system,system-ui,sans-serif';c.lineWidth=5;c.strokeStyle='#3b2168';c.strokeText(p.s,0,0);c.fillStyle=p.col;c.fillText(p.s,0,0);c.restore()}
   c.globalAlpha=1}};
 s.build();return s};

/* ======================= Pop the Traffic (bubble shooter) ======================= */
ENG.bubble=function(L,seed){
 const i=L-1,P=LV.bubble,NC=P.colors[i],R0=P.rows[i],K=P.drop[i],R=19,D=38,RH=33,MX=9,LIMIT=13,SY=GH-58;
 const TIMER=[0,0,0,0,0,26,25,24,22,21][i];       /* seconds between ceiling drops (L6+) */
 const SPECIAL=[0,0,0,.11,.12,.13,.14,.15,.16,.17][i]; /* chance a shot is bomb/rainbow (L4+) */
 const rng=mulberry((seed||0)+L*811+19),fx=gq_fx();
 const COL=['#ff7eb6','#ffd166','#5ad6a4','#6aa8ff','#b48cff','#f4f1ff'],RIM=['#d94f8c','#d9a52a','#2fa57c','#3d7fd6','#8460d6','#a89fc9'];
 const BOMB=10,RAIN=11;
 const s={kind:'bubble',L,W:GW,H:GH,hearts:3,status:'play',rows:[],shift:0,shots:0,ang:0,angV:0,ball:null,col:0,next:0,fx:[],controls:[],fxs:fx,t:0,timer:TIMER,total:0,combo:0,pops:[],gen:0,
  hud(){let n=0;for(const r of s.rows)for(const v of r)if(v>=0)n++;return 'Bubbles left '+n},
  cols(r){return((r+s.shift)&1)?MX-1:MX},
  pos(r,c){return{x:9+R+c*D+(((r+s.shift)&1)?R:0),y:R+r*RH}},
  nb(r,c){const p=(r+s.shift)&1,o=[[r,c-1],[r,c+1]];if(p){o.push([r-1,c],[r-1,c+1],[r+1,c],[r+1,c+1])}else{o.push([r-1,c-1],[r-1,c],[r+1,c-1],[r+1,c])}
   return o.filter(([a,b])=>a>=0&&a<s.rows.length&&b>=0&&b<s.cols(a))},
  newRow(r){return Array.from({length:s.cols(r)},()=>-1)},
  build(){s.gen++;s.rows=[];s.shift=0;s.shots=0;s.timer=TIMER;for(let r=0;r<R0;r++){const row=s.newRow(r);let prev=-1;for(let c=0;c<row.length;c++){const v=(prev>=0&&rng()<.45)?prev:Math.floor(rng()*NC);row[c]=v;prev=v}s.rows.push(row)}
   while(s.rows.length<LIMIT+2)s.rows.push(s.newRow(s.rows.length));s.total=s.count();s.pick();s.pick()},
  count(){let n=0;for(const r of s.rows)for(const v of r)if(v>=0)n++;return n},
  present(){const a=new Set();for(const r of s.rows)for(const v of r)if(v>=0)a.add(v);return[...a]},
  pick(){const p=s.present();s.col=s.next;s.next=p.length?p[Math.floor(rng()*p.length)]:0;
   if(s.col<BOMB&&!p.includes(s.col)&&p.length)s.col=p[Math.floor(rng()*p.length)];
   if(SPECIAL&&rng()<SPECIAL)s.next=rng()<.5?BOMB:RAIN},
  aimAt(x,y){let a=Math.atan2(x-GW/2,SY-y);s.ang=clamp(a,-1.35,1.35)},
  pointer(t,x,y){if(s.status!=='play')return;if(t==='down'||t==='move')s.aimAt(x,y);else if(t==='up'){s.aimAt(x,y);s.fire()}},
  act(){},
  fire(){if(s.ball||s.status!=='play')return;const sp=760;s.ball={x:GW/2,y:SY,dx:Math.sin(s.ang)*sp,dy:-Math.cos(s.ang)*sp,col:s.col,tr:[]};gq_sfx('tick')},
  snap(x,y){let best=null,bd=1e9;const r0=Math.round((y-R)/RH);for(let r=Math.max(0,r0-1);r<=Math.min(s.rows.length-1,r0+1);r++)for(let c=0;c<s.cols(r);c++){if(s.rows[r][c]>=0)continue;const p=s.pos(r,c),d=(p.x-x)**2+(p.y-y)**2;if(d<bd){bd=d;best=[r,c]}}return best},
  step(b,dt){const n=Math.ceil(Math.hypot(b.dx,b.dy)*dt/5);for(let k=0;k<n;k++){b.x+=b.dx*dt/n;b.y+=b.dy*dt/n;
    if(b.x<R){b.x=R;b.dx=-b.dx;b.bn=(b.bn||0)+1}else if(b.x>GW-R){b.x=GW-R;b.dx=-b.dx;b.bn=(b.bn||0)+1}
    if(b.y<=R)return true;
    for(let r=0;r<s.rows.length;r++){if(R+r*RH>b.y+D)break;for(let c=0;c<s.rows[r].length;c++)if(s.rows[r][c]>=0){const p=s.pos(r,c);if((p.x-b.x)**2+(p.y-b.y)**2<(D*.86)**2)return true}}}
   return false},
  popAt(a,b,delay){const p=s.pos(a,b),v=s.rows[a][b];s.fx.push({x:p.x,y:p.y,vy:-60,vx:0,col:v,t:.32,pop:1,d:delay||0});
   fx.burst(p.x,p.y,5,{cols:[COL[v]||'#fff','#fff'],sp:140,k:Math.random()<.35?'heart':'star',r:2.8,life:.55,g:240});s.rows[a][b]=-1},
  flood(r,c,col,wild){const grp=[],seen=new Set([r*100+c]),q=[[r,c]];
   while(q.length){const[a,b]=q.pop();grp.push([a,b]);for(const[x,y]of s.nb(a,b)){const k=x*100+y;if(!seen.has(k)&&s.rows[x][y]===col){seen.add(k);q.push([x,y])}}}return grp},
  orphans(){const conn=new Set(),q2=[];for(let c=0;c<s.cols(0);c++)if(s.rows[0][c]>=0){conn.add(c);q2.push([0,c])}
   while(q2.length){const[a,b]=q2.pop();for(const[x,y]of s.nb(a,b)){const k=x*100+y;if(!conn.has(k)&&s.rows[x][y]>=0){conn.add(k);q2.push([x,y])}}}
   let n=0;for(let a=0;a<s.rows.length;a++)for(let b=0;b<s.rows[a].length;b++)if(s.rows[a][b]>=0&&!(a===0?conn.has(b):conn.has(a*100+b))){const p=s.pos(a,b);s.fx.push({x:p.x,y:p.y,vy:0,vx:(rng()-.5)*60,col:s.rows[a][b],t:.9,g:1,spin:(rng()-.5)*6});s.rows[a][b]=-1;n++}return n},
  place(r,c,col){let popped=0,grp=[];
   if(col===BOMB){const p0=s.pos(r,c);s.rows[r][c]=0;s.rows[r][c]=-1;fx.shake(8);gq_sfx('crash');fx.burst(p0.x,p0.y,22,{cols:['#ffd166','#ff7e8b','#fff'],sp:260,r:4,k:'star'});fx.burst(p0.x,p0.y,3,{cols:['#fff'],sp:0,k:'ring',r:8,grow:200,life:.4,g:0});
    for(let a=0;a<s.rows.length;a++)for(let b=0;b<s.rows[a].length;b++)if(s.rows[a][b]>=0){const p=s.pos(a,b);if((p.x-p0.x)**2+(p.y-p0.y)**2<(D*1.8)**2){s.popAt(a,b,0);popped++}}
    popped+=s.orphans();return popped}
   if(col===RAIN){const cnt={};for(const[x,y]of s.nb(r,c)){const v=s.rows[x][y];if(v>=0)cnt[v]=(cnt[v]||0)+1}let best=-1,bn=0;for(const k in cnt)if(cnt[k]>bn){bn=cnt[k];best=+k}
    if(best<0){const p=s.present();best=p.length?p[Math.floor(rng()*p.length)]:0}col=best;gq_sfx('ok');fx.text(s.pos(r,c).x,s.pos(r,c).y-18,'RAINBOW!','#fff',14)}
   s.rows[r][c]=col;grp=s.flood(r,c,col);
   if(grp.length>=3){let d=0;for(const[a,b]of grp){s.popAt(a,b,d);d+=Math.min(.04,.45/grp.length);popped++}const o=s.orphans();popped+=o;gq_sfx(popped>5?'win':'ok');
    const p=s.pos(r,c);fx.text(p.x,p.y-14,popped>=6?'+'+popped+' CHAIN!':'+'+popped,popped>=6?'#ffd166':'#fff',popped>=6?18:14);if(popped>=6)fx.shake(3)}
   else{const p=s.pos(r,c);fx.burst(p.x,p.y,3,{cols:['#fff'],sp:40,r:2,life:.3,g:0})}
   return popped},
  empty(){return s.rows.every(r=>r.every(v=>v<0))},
  dropRow(){s.shift++;const nr=Array.from({length:s.cols(0)},()=>Math.floor(rng()*NC));s.rows.unshift(nr);s.rows.pop();s.slide=-RH;fx.shake(3);gq_sfx('bad');s.timer=TIMER},
  after(popped){if(s.empty()){s.status='win';fx.burst(GW/2,GH/2,34,{cols:['#ff7eb6','#ffd166','#fff','#b48cff'],sp:260,k:'star',r:3});return}
   if(!popped){s.shots++;if(K&&s.shots%K===0)s.dropRow()}
   for(let r=LIMIT;r<s.rows.length;r++)if(s.rows[r].some(v=>v>=0)){s.hearts--;fx.shake(10);gq_sfx('lose');if(s.hearts<=0){s.status='lose';return}s.build();s.slide=-170;s.land=null;return}
   s.pick()},
  update(dt){fx.update(dt);s.t+=dt;dt=Math.min(dt,.04);for(const f of s.fx){if(f.d>0){f.d-=dt;continue}f.t-=dt;f.x+=f.vx*dt;f.y+=f.vy*dt;f.vy+=(f.g?1100:300)*dt}s.fx=s.fx.filter(f=>f.t>0);
   if(s.slide)s.slide=Math.abs(s.slide)<.5?0:s.slide*Math.max(0,1-dt*12);if(s.land){s.land.x*=Math.max(0,1-dt*16);s.land.y*=Math.max(0,1-dt*16);if(Math.abs(s.land.x)+Math.abs(s.land.y)<.4)s.land=null}
   s.angV+=(s.ang-s.angV)*Math.min(1,dt*30);
   if(s.status!=='play')return;
   if(TIMER&&!s.ball){s.timer-=dt;if(s.timer<=0){s.dropRow();for(let r=LIMIT;r<s.rows.length;r++)if(s.rows[r].some(v=>v>=0)){s.hearts--;fx.shake(10);gq_sfx('lose');if(s.hearts<=0){s.status='lose';return}s.build();s.slide=-170;s.land=null;return}}}
   if(!s.ball)return;
   const b=s.ball;if(b.tr.length<10||s.t%.02<dt)b.tr.push([b.x,b.y]);if(b.tr.length>10)b.tr.shift();
   if(s.step(b,dt)){s.ball=null;const cell=s.snap(b.x,b.y);if(!cell){s.after(0);return}const pp=s.pos(cell[0],cell[1]);s.land={r:cell[0],c:cell[1],x:clamp(b.x-pp.x,-14,14),y:clamp(b.y-pp.y,-14,14)};const p=s.place(cell[0],cell[1],b.col);s.after(p)}},
  preview(ang){const b={x:GW/2,y:SY,dx:Math.sin(ang)*760,dy:-Math.cos(ang)*760,col:s.col};let g=0;while(g<400&&!s.step(b,1/60))g++;const cell=s.snap(b.x,b.y);if(!cell)return null;
   if(s.col===BOMB){return{cell,n:3,bomb:1}}
   const rows=s.rows.map(r=>r.slice());let col=s.col;if(col===RAIN){const cnt={};for(const[x,y]of s.nb(cell[0],cell[1])){const v=rows[x][y];if(v>=0)cnt[v]=(cnt[v]||0)+1}let bn=0;col=0;for(const k in cnt)if(cnt[k]>bn){bn=cnt[k];col=+k}}
   rows[cell[0]][cell[1]]=col;const seen=new Set([cell[0]*100+cell[1]]),q=[cell];let n=0;
   while(q.length){const[a,c]=q.pop();n++;for(const[x,y]of s.nb(a,c)){const k=x*100+y;if(!seen.has(k)&&rows[x][y]===col){seen.add(k);q.push([x,y])}}}
   return{cell,n}},
  draw(c){fx.begin(c);sky(c,s.t);const t=s.t;
   gq_ridge(c,GH-40,0,120,'rgba(205,185,238,.8)',.9,true);gq_ridge(c,GH-30,0,70,'rgba(183,157,226,.9)',2.7,true);
   c.fillStyle='rgba(154,128,208,.55)';c.fillRect(0,GH-34,GW,34);
   const glyph=(x,y,k,col)=>{c.fillStyle=col;if(k===0)gq_heart(c,x,y-1,4);else if(k===1)gq_star4(c,x,y,6);else if(k===2){c.beginPath();c.moveTo(x,y-5);c.lineTo(x+5,y);c.lineTo(x,y+5);c.lineTo(x-5,y);c.fill()}else if(k===3){c.beginPath();c.arc(x,y,3.6,0,6.3);c.fill()}else if(k===4){c.beginPath();c.moveTo(x,y-5);c.lineTo(x+5,y+4);c.lineTo(x-5,y+4);c.fill()}else{c.fillRect(x-3.5,y-3.5,7,7)}};
   const bub=(x,y,col,a,sc)=>{sc=sc||1;c.globalAlpha=a==null?1:a;const r=(R-1.5)*sc;
    if(col===BOMB){c.fillStyle='#3b2168';c.beginPath();c.arc(x,y,r,0,6.3);c.fill();c.fillStyle='rgba(255,255,255,.3)';c.beginPath();c.arc(x-5,y-6,5,0,6.3);c.fill();c.strokeStyle='#ffd166';c.lineWidth=3;c.beginPath();c.moveTo(x+4,y-r+1);c.quadraticCurveTo(x+9,y-r-5,x+13,y-r-2);c.stroke();c.fillStyle='#ff7e8b';gq_star4(c,x+13,y-r-2,5+Math.sin(t*20)*1.5);c.fillStyle='#fff';c.font='800 11px -apple-system,system-ui,sans-serif';c.textAlign='center';c.fillText('BOOM',x,y+4);c.globalAlpha=1;return}
    if(col===RAIN){const g=c.createConicGradient?c.createConicGradient(t*3,x,y):null;if(g){COL.forEach((q,k)=>g.addColorStop(k/COL.length,q));g.addColorStop(1,COL[0]);c.fillStyle=g}else c.fillStyle='#ff9ec8';c.beginPath();c.arc(x,y,r,0,6.3);c.fill();c.fillStyle='rgba(255,255,255,.55)';c.beginPath();c.arc(x-5,y-6,5,0,6.3);c.fill();c.strokeStyle='#fff';c.lineWidth=2;c.beginPath();c.arc(x,y,r,0,6.3);c.stroke();c.fillStyle='#fff';gq_star4(c,x+5,y+4,5);c.globalAlpha=1;return}
    c.fillStyle='rgba(59,33,104,.16)';c.beginPath();c.ellipse(x+1,y+r*.9,r*.8,r*.3,0,0,6.3);c.fill();
    c.fillStyle=RIM[col];c.beginPath();c.arc(x,y,r,0,6.3);c.fill();c.fillStyle=COL[col];c.beginPath();c.arc(x-.8,y-1.2,r-2.4,0,6.3);c.fill();
    glyph(x+1,y+2,col,'rgba(255,255,255,.62)');
    c.fillStyle='rgba(255,255,255,.75)';c.beginPath();c.ellipse(x-r*.38,y-r*.42,r*.32,r*.19,-.7,0,6.3);c.fill();c.globalAlpha=1};
   const slide=s.slide||0;
   for(let r=0;r<s.rows.length;r++)for(let k=0;k<s.rows[r].length;k++)if(s.rows[r][k]>=0){const p=s.pos(r,k),ld=s.land&&s.land.r===r&&s.land.c===k?s.land:null;bub(p.x+(ld?ld.x:0),p.y+slide+(ld?ld.y:0),s.rows[r][k])}
   /* danger line */
   let lowest=-1;for(let r=0;r<s.rows.length;r++)if(s.rows[r].some(v=>v>=0))lowest=r;const near=lowest>=LIMIT-2,ly=R+LIMIT*RH-R;
   c.strokeStyle=near?'rgba(229,56,59,'+(.6+.4*Math.sin(t*8))+')':'rgba(255,255,255,.65)';c.setLineDash([8,6]);c.lineWidth=2;c.beginPath();c.moveTo(0,ly);c.lineTo(GW,ly);c.stroke();c.setLineDash([]);
   /* ceiling timer: 1.5px tall so it ends where the top bubble row begins (cy=R, radius R-1.5), no overlap */
   if(TIMER){const k=clamp(s.timer/TIMER,0,1),TB=1.5;c.fillStyle='rgba(255,255,255,.4)';c.fillRect(0,0,GW,TB);c.fillStyle=k<.25?'#e5383b':'#ff7eb6';c.fillRect(0,0,GW*k,TB)}
   /* aim guide with bounce preview */
   if(!s.ball&&s.status==='play'){const a=s.angV,bk=s.gen+'|'+s.shift+'|'+s.count(),gk=a.toFixed(4)+'|'+slide.toFixed(1)+'|'+bk,lead=(t*60)%14;
    if(s._gk!==gk){s._gk=gk;const pts=[];let x=GW/2,y=SY,dx=Math.sin(a),dy=-Math.cos(a),dist=0,bn=0;
     for(let k=0;k<300;k++){x+=dx*3;y+=dy*3;dist+=3;if(x<R||x>GW-R){dx=-dx;x=clamp(x,R,GW-R);bn++}if(y<R)break;let hit=false;for(let r=0;r<s.rows.length&&!hit;r++){if(R+r*RH>y+D)break;for(let q=0;q<s.rows[r].length;q++)if(s.rows[r][q]>=0){const p=s.pos(r,q);if((p.x-x)**2+(p.y-(y-slide))**2<(D*.86)**2){hit=true;break}}}
      if(hit)break;pts.push({x,y,d:dist,b:bn})}s._pts=pts}
    for(const q of s._pts)if(q.d>36&&(q.d+lead)%14<3){c.fillStyle='rgba(255,255,255,'+clamp(1-q.d/900,.25,.95)+')';c.beginPath();c.arc(q.x,q.y,q.b?2.8:2.4,0,6.3);c.fill()}
    const pk=s.ang.toFixed(4)+'|'+s.col+'|'+bk;if(s._pk!==pk){s._pk=pk;s._pv=s.preview(s.ang)}const pv=s._pv;if(pv){const p=s.pos(pv.cell[0],pv.cell[1]);c.globalAlpha=.4+.15*Math.sin(t*8);c.strokeStyle=s.col===BOMB?'#ffd166':'#fff';c.lineWidth=2.5;c.setLineDash([4,3]);c.beginPath();c.arc(p.x,p.y+slide,R-3,0,6.3);c.stroke();c.setLineDash([]);if(pv.n>=3&&s.col!==BOMB){c.fillStyle='#fff';c.font='800 11px -apple-system,system-ui,sans-serif';c.textAlign='center';c.fillText('POP',p.x,p.y+slide+4)}c.globalAlpha=1}}
   for(const f of s.fx){if(f.d>0)continue;if(f.pop){const k=1-f.t/.32;bub(f.x,f.y,f.col,Math.max(0,1-k),1+k*.5)}else bub(f.x,f.y,f.col,clamp(f.t*2,0,1))}
   if(s.ball){for(let q=0;q<s.ball.tr.length;q++){c.fillStyle=s.ball.col<6?COL[s.ball.col]:'#fff';c.globalAlpha=q/s.ball.tr.length*.35;c.beginPath();c.arc(s.ball.tr[q][0],s.ball.tr[q][1],R*.5*q/s.ball.tr.length+3,0,6.3);c.fill()}c.globalAlpha=1;bub(s.ball.x,s.ball.y,s.ball.col)}
   /* shooter: car with cannon on the roof */
   drawCar(c,GW/2,GH-20,74,{});c.fillStyle='#6b3fb0';rr(c,GW/2-12,SY+4,24,GH-35-SY-4,6);c.fill();c.fillStyle=GQ_INK;c.beginPath();c.arc(GW/2,SY,13,0,6.3);c.fill();c.fillStyle='#b48cff';c.beginPath();c.arc(GW/2-3,SY-3,4,0,6.3);c.fill();c.save();c.translate(GW/2,SY);c.rotate(s.angV);c.fillStyle='#3b2168';rr(c,-8,-36,16,34,6);c.fill();c.fillStyle='#b48cff';rr(c,-6,-34,5,28,3);c.fill();c.restore();
   if(!s.ball)bub(GW/2,SY,s.col);
   c.fillStyle='rgba(255,255,255,.6)';rr(c,GW/2+54,SY-18,48,52,12);c.fill();c.fillStyle=GQ_INK;c.font='800 9px -apple-system,system-ui,sans-serif';c.textAlign='center';c.fillText('NEXT',GW/2+78,SY-6);bub(GW/2+78,SY+14,s.next,1,.78);
   fx.draw(c);fx.end(c)}};
 s.build();return s};

/* ---------- games UI (runs after app.js) ---------- */
const gUnlocked=()=>totalStars()>=1;
const gStars=id=>(S.g&&S.g[id])||[];
const gLevelOpen=(id,L)=>L===1||(gStars(id)[L-2]||0)>0;
const gTotal=id=>gStars(id).reduce((a,b)=>a+(b||0),0);
function gamesTab(){
  const lock=!gUnlocked();
  return `<h2>Games</h2><div class="card coinbar"><span>🪙 <b>${S.coins||0}</b> coins</span><span class="muted">Games and study runs earn coins</span></div>
  ${lock?`<div class="card hl"><b>Five games are waiting</b><p class="muted" style="margin:4px 0 10px">Earn 1 star: 5 of 10 right on any stop in Town. Then all five games open.</p><button class="btn small ghost" data-act="tab" data-v="road">Go to Town</button></div>`:''}
  ${GAMES.map(g=>{const done=gStars(g.id).filter(Boolean).length;return `<button class="card gcard ${lock?'off':''}" data-act="${lock?'glocked':'gsheet'}" data-v="${g.id}"><span class="gic">${g.icon}</span><span class="ginfo"><b>${g.name}</b><span class="muted">${g.tag}</span><span class="gprog"><i style="width:${done*10}%"></i></span><small class="muted">${done} of 10 levels · ${gTotal(g.id)} of 30 stars</small></span><span class="gplay">${lock?'🔒':'Play'}</span></button>`}).join('')}`}
function gsheetView(){const g=GAMES.find(x=>x.id===ui.gsheet),st=gStars(g.id);
  return `<div class="sheetbg" data-act="closesheet"><div class="sheet" role="dialog" aria-label="${g.name}" data-stop="1"><h2>${g.icon} ${g.name}</h2><p class="muted" style="margin:0 0 12px">${g.tag}. Pick a level.</p>
  <div class="lvgrid">${Array.from({length:10},(_,i)=>{const L=i+1,open=gLevelOpen(g.id,L),s=st[i]||0;return `<button class="lvb ${open?'':'off'} ${s?'done':''}" data-act="${open?'gplay':'glvlock'}" data-v="${g.id}:${L}"><b>${open?L:'🔒'}</b><span>${'★'.repeat(s)}${'☆'.repeat(3-s)}</span></button>`}).join('')}</div></div></div>`}
acts.gsheet=v=>{ui.gsheet=v;render()};
acts.glocked=()=>toast('Earn 1 star: 5 of 10 right on any Town stop to open the games.');
acts.glvlock=()=>toast('Beat the level before this one to unlock it.');
acts.gplay=v=>{const[id,L]=v.split(':');ui.gsheet=null;render();GP.open(id,+L,false)};
acts.bonus=()=>IX.launch();

const GP={el:null,eng:null,id:null,L:0,raf:0,last:0,run:false,paused:false,cv:null,cx:null,sc:1,timers:[],
 open(id,L,bonus){GP.close(true);GP.id=id;GP.L=L;GP.bonus=bonus===undefined?GP.bonus:bonus;const g=GAMES.find(x=>x.id===id);
  const el=document.createElement('div');el.className='gov';el.innerHTML=`<div class="gtop"><button class="x" data-g="quit" aria-label="Quit game">✕</button><div class="gtitle"><b>${g.icon} ${g.name}</b><small>Level ${L} of 10</small></div><div class="ghearts" id="gh"></div></div><div class="ghud" id="ghud"></div><div class="gstage" id="gst"><canvas id="gcv"></canvas></div><div class="gctl" id="gctl"></div><div class="gmodal" id="gm"></div>`;
  document.body.appendChild(el);GP.el=el;document.documentElement.classList.add('ingame');
  GP.eng=ENG[id](L,Math.floor(Math.random()*1e6));GP.cv=el.querySelector('#gcv');GP.cx=GP.cv.getContext('2d');
  PLAYER=Object.assign(PLAYER,S.avatar?{color:(typeof CARC!=='undefined'&&CARC[S.avatar.carColor])||PLAYER.color||'#e5383b'}:{});
  GP.fit();GP.controls();GP.hud();GP.intro(g);GP.bind();GP.run=false;GP.draw();
 },
 fit(){const st=GP.el.querySelector('#gst'),r=st.getBoundingClientRect(),k=Math.min(r.width/GW,r.height/GH),dpr=Math.min(2,window.devicePixelRatio||1);
  GP.cv.style.width=GW*k+'px';GP.cv.style.height=GH*k+'px';GP.cv.width=Math.round(GW*k*dpr);GP.cv.height=Math.round(GH*k*dpr);GP.sc=GP.cv.width/GW;GP.cx.setTransform(GP.sc,0,0,GP.sc,0,0)},
 draw(){if(GP.eng){GP.cx.clearRect(0,0,GW,GH);GP.eng.draw(GP.cx)}},
 controls(){const box=GP.el.querySelector('#gctl'),cs=GP.eng.controls||[];box.style.display=cs.length?'flex':'none';
  box.innerHTML=cs.map(c=>{const lb=(HOW.LBL[GP.id]&&HOW.LBL[GP.id][c[1]])||c[1];return `<button class="gb" data-act2="${c[1]}" data-rep="${c[2]||0}" aria-label="${lb}" title="${lb}">${c[0]}</button>`}).join('');
  box.querySelectorAll('.gb').forEach(b=>{let iv=0;const fire=()=>{if(GP.run&&!GP.paused)GP.eng.act(b.dataset.act2)};
   b.addEventListener('pointerdown',e=>{e.preventDefault();fire();if(b.dataset.rep==='1'){clearInterval(iv);iv=setInterval(fire,110)}});
   ['pointerup','pointercancel','pointerleave'].forEach(t=>b.addEventListener(t,()=>clearInterval(iv)))})},
 hud(){const e=GP.eng;GP.el.querySelector('#gh').innerHTML=e.kind==='match'?'':Array.from({length:3},(_,i)=>`<span class="${i<e.hearts?'':'lost'}">♥</span>`).join('');
  GP.el.querySelector('#ghud').textContent=e.hud()},
 intro(g){if(HOW.need(g.id)){HOW.show(g,()=>{if(GP.bonus&&GP.bgo)GP.bgo();else GP.intro(g)});return}const m=GP.el.querySelector('#gm');m.className='gmodal show';m.innerHTML=`<div class="gcardm"><div class="bigic">${g.icon}</div><h2>Level ${GP.L}</h2><p>${g.how(GP.L)}</p><button class="btn primary" data-g="start">Start</button></div>`},
 bind(){const el=GP.el,cv=GP.cv;
  const pt=(e,t)=>{if(!GP.run||GP.paused)return;const r=cv.getBoundingClientRect();GP.eng.pointer&&GP.eng.pointer(t,(e.clientX-r.left)/r.width*GW,(e.clientY-r.top)/r.height*GH)};
  cv.style.touchAction='none';
  cv.addEventListener('pointerdown',e=>{e.preventDefault();try{cv.setPointerCapture(e.pointerId)}catch(_){}pt(e,'down')});
  cv.addEventListener('pointermove',e=>{if(e.buttons||e.pointerType==='touch')pt(e,'move')});
  cv.addEventListener('pointerup',e=>pt(e,'up'));cv.addEventListener('pointercancel',e=>pt(e,'up'));
  el.addEventListener('click',e=>{const b=e.target.closest('[data-g]');if(!b)return;const a=b.dataset.g;
   if(a==='start')GP.start();else if(a==='resume')GP.unpause();else if(a==='quit'){if(b.classList.contains('x')&&GP.run&&GP.eng&&GP.eng.status==='play'&&!GP.paused)GP.askQuit();else GP.close()}else if(a==='keep')GP.keepOn();else if(a==='leave')GP.close();else if(a==='htnext')HOW.next();else if(a==='htskip')HOW.finish();else if(a==='retry')GP.open(GP.id,GP.L);else if(a==='next')GP.open(GP.id,GP.L+1);else if(a==='easier')GP.open(GP.id,Math.max(1,GP.L-1));else if(a==='list'){GP.close();ui.tab='games';ui.gsheet=GP.idPrev||null;render()}});
  GP.onResize=()=>{GP.fit();GP.draw()};window.addEventListener('resize',GP.onResize);
  GP.onVis=()=>{if(document.hidden){if(GP.run&&GP.eng&&GP.eng.status==='play'&&!GP.paused)GP.pause()}GP.last=0};document.addEventListener('visibilitychange',GP.onVis);
  GP.onKey=e=>{if(!GP.run)return;const m={ArrowLeft:'left',ArrowRight:'right',ArrowUp:GP.id==='dash'?'up':'rotate',ArrowDown:'down',' ':GP.id==='flappy'?'tap':'drop'}[e.key];if(m){GP.eng.act(m);e.preventDefault()}};document.addEventListener('keydown',GP.onKey)},
 pause(){GP.paused=true;if(!GP.el||GP.el.querySelector('.gpause'))return;const d=document.createElement('div');d.className='gpause';d.setAttribute('role','dialog');d.setAttribute('aria-label','Paused');d.innerHTML='<div class="gcardm"><div class="bigic">⏸️</div><h2>Paused</h2><p>Your game waited for you.</p><button class="btn primary" data-g="resume">Resume</button></div>';GP.el.appendChild(d)},
 unpause(){const d=GP.el&&GP.el.querySelector('.gpause');if(d)d.remove();GP.paused=false;GP.last=0},
 askQuit(){GP.paused=true;const m=GP.el.querySelector('#gm');m.className='gmodal show';m.innerHTML='<div class="gcardm" role="alertdialog" aria-label="Leave this round?"><h2>Leave this round?</h2><p>Your progress in this round will be lost.</p><button class="btn primary" data-g="keep">Keep playing</button><button class="btn line" data-g="leave" style="margin-top:10px">Leave</button></div>'},
 keepOn(){GP.paused=false;GP.last=0;const m=GP.el&&GP.el.querySelector('#gm');if(m){m.className='gmodal';m.innerHTML=''}},
 start(){GP.el.querySelector('#gm').className='gmodal';GP.bt=0;GP.h0=null;GP.run=true;GP.last=0;cancelAnimationFrame(GP.raf);GP.raf=requestAnimationFrame(GP.loop)},
 loop(t){const e=GP.eng;if(!e)return;const dt=GP.last?(t-GP.last)/1000:0;GP.last=t;
  if(!GP.paused){e.update(Math.min(dt,.05));if(GP.bonus)GP.bonusTick(e,Math.min(dt,.05));GP.draw();const h=e.hearts+'|'+e.hud();if(h!==GP._h){GP._h=h;GP.hud()}}
  if(e.status!=='play'){GP.run=false;setTimeout(()=>{if(GP.eng===e)GP.end()},450);return}
  GP.raf=requestAnimationFrame(GP.loop)},
 bonusTick(e,dt){GP.bt=(GP.bt||0)+dt;const cap=GP.cap||30,h=e.hud();if(GP.h0==null)GP.h0=h;
  const bar=GP.el&&GP.el.querySelector('.gtimer i');if(bar)bar.style.width=Math.min(100,GP.bt/cap*100)+'%';
  if(GP.bt>=cap&&e.status==='play'&&h!==GP.h0)e.status='win'},
 end(){if(!GP.eng)return;const e=GP.eng,win=e.status==='win',g=GAMES.find(x=>x.id===GP.id);let stars=0,coins=0;
  if(win){stars=e.kind==='match'?(e.moves/e.mv0>=.35?3:e.moves/e.mv0>=.15?2:1):Math.max(1,e.hearts);coins=window.xGameCoins?window.xGameCoins(GP.L,stars):5+GP.L+stars*3;
   S.g=S.g||{};const a=S.g[GP.id]=S.g[GP.id]||Array(10).fill(0);a[GP.L-1]=Math.max(a[GP.L-1]||0,stars);S.coins=(S.coins||0)+coins;save()}
  const m=GP.el.querySelector('#gm');m.className='gmodal show';{const hd=GP.el.querySelector('#ghud');if(hd)hd.style.visibility='hidden'}
  m.innerHTML=win?`<div class="gcardm">${fxStage(true)}<div class="stars3">${[1,2,3].map(i=>`<span class="${i<=stars?'on':''}">★</span>`).join('')}</div><h2>${fxGameWin(GP.L,stars)}</h2><p class="gain"><span>🪙 +${coins}</span></p>${window.xGameNote||''}${GP.bonus?'<button class="btn primary" data-g="quit">Back to town</button><button class="btn line" data-g="retry" style="margin-top:10px">Play again</button>':`${GP.L<10?'<button class="btn primary" data-g="next">Next level</button>':''}<button class="btn ${GP.L<10?'ghost':'primary'}" data-g="retry" style="margin-top:10px">Play again</button><button class="btn line" data-g="quit" style="margin-top:10px">Back to games</button>`}</div>`
   :`<div class="gcardm">${fxStage(false)}<h2>${e.kind==='match'?'Out of moves. Try a new plan.':fxGameLose()}</h2><p>${e.hud()}. Give it another try. You only need one clean run.</p><button class="btn primary" data-g="retry">Try again</button>${window.xToneEasier?xToneEasier(GP.id,GP.L):''}<button class="btn line" data-g="quit" style="margin-top:10px">${GP.bonus?'Back to town':'Back to games'}</button></div>`},
 close(silent){cancelAnimationFrame(GP.raf);GP.run=false;if(GP.el){GP.el.remove();GP.el=null}window.removeEventListener('resize',GP.onResize);document.removeEventListener('visibilitychange',GP.onVis);document.removeEventListener('keydown',GP.onKey);document.documentElement.classList.remove('ingame');GP.eng=null;if(!silent){ui.tab=GP.bonus?'road':'games';GP.bonus=false;render()}}};

/* ---------- intermission: auto bonus round between levels ---------- */
const IX={timer:0,el:null,res:null,n:0,
 sync(){const x=ui.result;
  if(!x||!x.bonus||GP.el){if(IX.el||IX.timer)IX.cancel();return}
  if(S.autoGame===false||x.ixDone||x.mode!=='stop')return;
  if(IX.res===x&&(IX.timer||IX.el)){const sl=document.getElementById('ixslot');if(IX.el&&sl&&!IX.el.isConnected)sl.appendChild(IX.el);return}
  IX.cancel();IX.res=x;IX.arm()},
 /* the countdown starts only once the reward cards have been on screen 5 s (clock restarts while a modal is open), or 1.5 s after the player taps, drags or scrolls (taps on a modal and scripted scrolls do not count) */
 arm(){const t0=Date.now(),mo=()=>!!(window.X&&X.modalOpen&&X.modalOpen());let t1=0,lm=0;const ev=['pointerdown','touchmove','wheel','keydown'],hit=()=>{const n=Date.now();if(mo()){lm=n;return}if(n-t0>1200&&n-lm>1500)t1=n};
  ev.forEach(e=>window.addEventListener(e,hit,{capture:true,passive:true}));IX.unarm=()=>{ev.forEach(e=>window.removeEventListener(e,hit,{capture:true}));IX.unarm=null};
  let t00=t0;IX.timer=setInterval(()=>{const n=Date.now();if(document.hidden||mo()){t00=n;t1=0;lm=n;return}
   if(n-t00>=5000||(t1&&n-t1>=1500)){clearInterval(IX.timer);IX.timer=0;IX.show()}},250)},
 show(){if(IX.unarm)IX.unarm();IX.timer=0;const x=ui.result;if(!x||x!==IX.res||!x.bonus||GP.el)return;
  const el=document.createElement('div');el.className='ixcd';el.setAttribute('role','status');el.setAttribute('aria-live','polite');
  el.innerHTML=`<span class="ixn" id="ixn">3</span><span class="ixt"><b>Bonus round in <i id="ixs">3</i></b><small>${x.bonus.icon} ${esc(x.bonus.name)}. A quick one.</small></span><span class="ixbt"><button class="ixskip" data-ix="skip" aria-label="Skip the bonus game">Skip</button><button class="ixlater" data-ix="later" aria-label="Not now, no bonus game this time">Not now</button></span>`;
  el.addEventListener('click',e=>{if(e.target.closest('[data-ix=skip],[data-ix=later]')){e.stopPropagation();IX.skip()}});
  const slot=document.getElementById('ixslot');if(!slot)return;slot.appendChild(el);IX.el=el;IX.n=3;sfx&&sfx('tick');
  try{el.scrollIntoView({block:'nearest',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})}catch(_){}
  IX.timer=setInterval(()=>{IX.n--;if(IX.n<=0){clearInterval(IX.timer);IX.timer=0;IX.launch();return}
   const a=document.getElementById('ixn'),b=document.getElementById('ixs');if(a)a.textContent=IX.n;if(b)b.textContent=IX.n;sfx('tick')},1000)},
 cancel(done){if(IX.unarm)IX.unarm();clearTimeout(IX.timer);clearInterval(IX.timer);IX.timer=0;if(IX.el){const sl=IX.el.parentNode;IX.el.remove();IX.el=null;if(done&&sl&&sl.id==='ixslot')sl.remove()}if(done&&IX.res)IX.res.ixDone=1;if(!done&&!ui.result)IX.res=null},
 skip(){IX.cancel(true)},
 launch(){const x=ui.result;if(!x||!x.bonus)return;const b=x.bonus;IX.cancel(true);
  if(S.gotCar&&!S.carSeen){/* first car card must be seen before any game starts */IX.def={b,x,drv:ui.drive};ui.drive=null;ui.result=null;ui.tab='road';render();return}
  GP.resSave=x;GP.drv=ui.drive;ui.drive=null;ui.result=null;ui.tab='road';render();GP.open(b.id,b.L,true)},
 skipGame(){const x=GP.resSave,d=GP.drv;GP.close(true);GP.bonus=false;GP.resSave=null;GP.drv=null;ui.drive=d;
  if(x){x.bonus=null;ui.result=x}else ui.tab='road';render();window.scrollTo(0,0)}};
window.IX=IX;
const _gOpen=GP.open,_gClose=GP.close;
GP.open=function(){const r=_gOpen.apply(this,arguments);
 if(GP.bonus&&GP.el){GP.bt=0;GP.h0=null;const top=GP.el.querySelector('.gtop');
  const b=document.createElement('button');b.className='gskip';b.dataset.gskip='1';b.setAttribute('aria-label','Skip the bonus game');b.textContent='Skip';
  b.addEventListener('click',e=>{e.stopPropagation();IX.skipGame()});top.appendChild(b);
  const t=document.createElement('div');t.className='gtimer';t.setAttribute('aria-hidden','true');t.innerHTML='<i></i>';top.after(t);
  /* bonus rounds skip the intro modal: start now, show a one line goal hint for 2 s */
  const g=GAMES.find(x=>x.id===GP.id),el0=GP.el;
  GP.bgo=()=>{if(GP.el!==el0)return;const hint=document.createElement('div');hint.className='ghint';hint.setAttribute('role','status');
   hint.textContent=g.tag;GP.el.appendChild(hint);
   const hm=GP.el.querySelector('#gm');if(hm){hm.className='gmodal';hm.innerHTML=''}GP.start();
   setTimeout(()=>{hint.remove()},2000)};
  if(!HOW.on)GP.bgo()}
 return r};
GP.close=function(silent){HOW.on=0;HOW.g=null;HOW.done=null;if(!silent&&GP.bonus){if(GP.drv){ui.drive=GP.drv}GP.drv=null;GP.resSave=null}return _gClose.apply(this,arguments)};
const _rr=window.render;window.render=function(){const r=_rr.apply(this,arguments);try{IX.sync()}catch(e){}return r};
acts.autogame=()=>{S.autoGame=S.autoGame===false;save();render()};
acts.plan=v=>{S.studyPlan={when:v,ts:Date.now()};save();document.querySelectorAll('.ixplan [data-v]').forEach(b=>{const on=b.dataset.v===v;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on)});
 const m=document.getElementById('ixpm');if(m)m.textContent='Locked in: '+({tonight:'tonight',tomorrow:'tomorrow',weekend:'this weekend'}[v])+'. Nice plan.';toast('Study plan saved')};
/* hooks used by app.js */
window.ixResult=(x,nx,good)=>{let h='';
 if(x.bonus&&S.autoGame!==false&&x.mode==='stop'&&!x.ixDone)h+='<div class="ixslot" id="ixslot"></div>';
 if(x.mode==='stop'&&good){
  if(nx&&nx.id!==x.chapter)h+=`<div class="ixnext"><small>Next up</small><b>${nx.icon} ${esc(nx.name)}</b></div>`;
  const w=S.studyPlan&&S.studyPlan.when;
  h+=`<div class="ixplan"><p>When will you study next? <small>(optional)</small></p><div class="ixchips">${[['tonight','Tonight'],['tomorrow','Tomorrow'],['weekend','This weekend']].map(c=>`<button class="chip2 ${w===c[0]?'on':''}" data-act="plan" data-v="${c[0]}" aria-pressed="${w===c[0]}">${c[1]}</button>`).join('')}</div><small id="ixpm" class="muted"></small></div>`}
 return h};
window.ixSetting=()=>`<div class="card"><h3>Bonus games</h3><button class="ixtog" data-act="autogame" role="switch" aria-checked="${S.autoGame!==false}"><span>Bonus games between levels</span><i class="${S.autoGame!==false?'on':''}"></i></button><p class="muted" style="margin:8px 0 0">A short game pops up after you pass a stop. You can always skip it.</p></div>`;

/* ---------- first-time how-to card: once per game, 2 steps (first bonus round or first play) ---------- */
const HOW={on:0,step:0,g:null,done:null,
 LBL:{stack:{left:'Move left',right:'Move right',rotate:'Turn the car',down:'Fall faster',drop:'Drop now'},dash:{left:'Step left',right:'Step right',up:'Step forward',down:'Step back'}},
 box(){S.x=(S.x&&typeof S.x==='object')?S.x:{};S.x.howto=S.x.howto&&typeof S.x.howto==='object'?S.x.howto:{};return S.x.howto},
 need(id){const h=HOW.box();return !(h.all||h[id])},
 FIG:{
  flappy:'<span class="hf hf-flappy" aria-hidden="true"><i class="hfa"></i><i class="hfb"></i><b>🚗</b><u>👆</u></span>',
  dash:'<span class="hf hf-dash" aria-hidden="true"><b>🚸</b><i>⬆️</i><em>🚗</em></span>',
  stack:'<span class="hf hf-stack" aria-hidden="true"><b>🚗</b><i></i><i></i></span>',
  match:'<span class="hf hf-match" aria-hidden="true"><b>🛑</b><b>⚠️</b><b>🛑</b><b>🛑</b></span>',
  bubble:'<span class="hf hf-bubble" aria-hidden="true"><b>🫧</b><i>🫧🫧🫧</i></span>'},
 ONE:{flappy:'Tap anywhere to hop your car up through the gaps between barriers.',dash:'Swipe or tap an arrow to step one square, and cross the road without getting hit.',stack:'Cars fall from the top: slide and turn them so they fit together into full rows.',match:'Swap two neighbouring signs so that 3 or more of the same kind line up.',bubble:'Drag to aim, let go to shoot, and match 3 or more bubbles of the same colour.'},
 two(g,L){const lv=LV;
  if(g==='flappy')return `<p>Goal: pass ${lv.flappy.goal[L-1]} barriers. The top line counts them. A crash costs a heart and you have 3.</p>`;
  if(g==='dash')return `<p>Goal: cross all ${lv.dash.lanes[L-1]+(L>=8?1:0)} lanes to the far side. The top line counts lanes crossed. A hit costs a heart and you have 3.</p>`;
  if(g==='stack')return `<p>Goal: clear ${lv.stack.goal[L-1]} rows. The five buttons:</p><ul class="hflg"><li><b>◀ ▶</b> slide left or right</li><li><b>⟳</b> turn the car</li><li><b>▼</b> fall faster</li><li><b>⤓</b> drop it now</li></ul>`;
  if(g==='match')return `<p>The goals sit at the top. They read like a score:</p><ul class="hflg"><li><b>Striped 0/3</b> make 3 striped pieces (match 4 in a row)</li><li><b>Bombs</b> match an L or T of 5</li><li><b>Ice</b> clear the sign on top of it</li><li><b>Blasted</b> signs cleared by special pieces</li></ul>`;
  return `<p>Goal: pop every bubble. The top line counts the bubbles left. If rows get pushed down to the bottom line, you lose a heart. You have 3.</p>`},
 show(g,done){HOW.on=1;HOW.g=g;HOW.done=done;HOW.step=0;HOW.draw()},
 draw(){const g=HOW.g,m=GP.el&&GP.el.querySelector('#gm');if(!m)return;const first=HOW.step===0;
  m.className='gmodal show';m.innerHTML=`<div class="gcardm ghow" role="dialog" aria-label="How to play ${g.name}"><p class="ghs">How to play, step ${HOW.step+1} of 2</p><h2>${g.icon} ${g.name}</h2>${first?`${HOW.FIG[g.id]}<p>${HOW.ONE[g.id]}</p>`:HOW.two(g.id,GP.L)}<button class="btn primary" data-g="htnext">${first?'Next':'Got it'}</button><button class="btn line" data-g="htskip" style="margin-top:10px">Skip</button></div>`},
 next(){if(HOW.step===0){HOW.step=1;HOW.draw()}else HOW.finish()},
 finish(){if(!HOW.g)return;HOW.box()[HOW.g.id]=1;save();const d=HOW.done;HOW.on=0;HOW.g=null;HOW.done=null;if(d)d()}};
