const GW=360,GH=560;
const ENG={};
function mulberry(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const C={asphalt:'#1b1f27',paint:'#ffc61a',sign:'#0b6e4f',red:'#e5383b',blue:'#2f80ed',green:'#19a974',purple:'#9b5de5',orange:'#ff8a4c'};
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
function sky(c,t){const g=c.createLinearGradient(0,0,0,GH);g.addColorStop(0,'#232859');g.addColorStop(.55,'#b4527a');g.addColorStop(1,'#ff8a4c');c.fillStyle=g;c.fillRect(0,0,GW,GH);
 c.fillStyle='#1b1f27';c.beginPath();c.moveTo(0,GH-60);const m=[[0,40],[40,70],[90,38],[150,78],[210,44],[270,74],[320,46],[360,60]];m.forEach(p=>c.lineTo(p[0],GH-60-p[1]-0));c.lineTo(GW,GH-60);c.fill()}
/* level tables: 10 levels per game */
const LV={
 flappy:{gap:[200,190,180,170,160,152,146,140,134,128],speed:[110,115,120,130,140,150,160,170,180,190],goal:[6,8,10,12,14,16,18,20,22,25],wob:[0,0,0,0,12,20,28,34,38,42]},
 dash:{lanes:[3,3,4,4,5,5,6,6,7,7],speed:[45,52,55,62,68,76,82,90,98,106],gap:[3.2,3,2.9,2.7,2.6,2.4,2.3,2.2,2.1,2.0]},
 stack:{goal:[4,6,8,10,12,14,16,18,20,24],ms:[900,820,740,660,580,500,430,360,300,250],junk:[0,0,0,0,0,2,3,4,5,6]},
 match:{types:[4,4,4,5,5,5,5,6,6,6],moves:[20,22,20,24,24,24,24,26,26,26],
  goal:[['collect',0,10],['score',700],['collect',1,14],['cones',4],['collect',2,16],['score',1400],['cones',6],['collect',3,16],['cones',7],['collect',0,20]]},
 bubble:{colors:[3,3,4,4,4,5,5,5,6,6],rows:[4,5,5,6,6,7,7,7,8,8],drop:[0,0,12,11,10,10,10,9,9,8]}
};
const GAMES=[
 {id:'flappy',name:'Flappy Car',icon:'🚗',tag:'Tap to hop through the gaps',how:L=>'Tap to hop your car. Get through '+LV.flappy.goal[L-1]+' barriers. You have 3 hearts.'},
 {id:'dash',name:'Crosswalk Dash',icon:'🚸',tag:'Cross the road, dodge traffic',how:L=>'Swipe or use the arrows to cross '+(LV.dash.lanes[L-1]+(L>=8?1:0))+' lanes'+(L>=8?'. Never cross when the train lights flash.':'.')+' 3 hearts.'},
 {id:'stack',name:'Highway Stack',icon:'🧱',tag:'Stack cars, clear traffic',how:L=>'Fit the falling cars together. Clear '+LV.stack.goal[L-1]+' rows.'+(LV.stack.junk[L-1]?' Some rows start full.':'')+' 3 hearts.'},
 {id:'match',name:'Sign Match',icon:'🛑',tag:'Match road signs',how:L=>{const g=LV.match.goal[L-1];return (g[0]==='collect'?'Match '+g[2]+' '+['stop','yield','school','speed limit'][g[1]]+' signs':g[0]==='score'?'Score '+g[1]+' points':'Clear all '+g[1]+' cones by matching next to them')+' in '+LV.match.moves[L-1]+' moves.'}},
 {id:'bubble',name:'Pop the Traffic',icon:'🫧',tag:'Aim, shoot, match 3',how:L=>'Drag to aim, let go to shoot. Match 3 or more to pop. Clear the board. 3 hearts.'}
];

ENG.flappy=function(L,seed){
 const i=L-1,P=LV.flappy,gap=P.gap[i],sp=P.speed[i],goal=P.goal[i],wob=P.wob[i],PW=56,ROAD=GH-60;
 const rng=mulberry((seed||0)+L*977+5);
 const s={kind:'flappy',L,W:GW,H:GH,hearts:3,status:'play',goal,passed:0,started:false,t:0,inv:0,car:{x:92,y:GH/2-20,vy:0},obs:[],controls:[],gap,PW,
  hud(){return 'Barriers passed '+s.passed+' of '+goal},
  act(a){if(a==='tap'&&s.status==='play'){s.started=true;s.car.vy=-330}},
  pointer(t){if(t==='down')s.act('tap')},
  cy(o){return o.base+wob*Math.sin(s.t*1.6+o.ph)},
  hit(){if(s.inv>0)return;s.hearts--;s.inv=1.3;const o=s.obs.find(o=>o.x+PW>s.car.x-16);s.car.y=o?s.cy(o):GH/2-20;s.car.vy=0;if(s.hearts<=0)s.status='lose'},
  update(dt){if(s.status!=='play')return;dt=Math.min(dt,.04);
   if(!s.started){s.car.y=GH/2-20+Math.sin(performance_now()/260)*6;return}
   s.t+=dt;s.inv-=dt;const car=s.car;car.vy+=1100*dt;car.y+=car.vy*dt;
   const last=s.obs[s.obs.length-1];
   if(!last||last.x<GW-sp*1.75){const lo=64+gap/2+wob,hi=ROAD-30-gap/2-wob;s.obs.push({x:GW+10,base:lo+rng()*(hi-lo),ph:rng()*6.28,p:0})}
   for(const o of s.obs){o.x-=sp*dt;
    if(o.x<car.x+16&&o.x+PW>car.x-16){const c=s.cy(o);if(car.y-10<c-gap/2||car.y+10>c+gap/2)s.hit()}
    if(!o.p&&o.x+PW<car.x-16){o.p=1;s.passed++;if(s.passed>=goal)s.status='win'}}
   s.obs=s.obs.filter(o=>o.x>-PW-10);
   if(car.y<14){car.y=14;car.vy=0}
   if(car.y>ROAD-12)s.hit(),car.y=Math.min(car.y,ROAD-12)},
  draw(c){sky(c);
   const stripe=(x,y,w,h)=>{c.save();c.beginPath();c.rect(x,y,w,h);c.clip();c.fillStyle='#fff';c.fillRect(x,y,w,h);c.fillStyle=C.orange;for(let k=-h;k<w+h;k+=28){c.beginPath();c.moveTo(x+k,y+h);c.lineTo(x+k+14,y+h);c.lineTo(x+k+14+h,y);c.lineTo(x+k+h,y);c.fill()}c.restore()};
   for(const o of s.obs){const cc=s.cy(o);stripe(o.x,-4,PW,cc-gap/2+4);stripe(o.x,cc+gap/2,PW,ROAD-(cc+gap/2));c.fillStyle='#1b1f27';rr(c,o.x-5,cc-gap/2-14,PW+10,14,4);c.fill();rr(c,o.x-5,cc+gap/2,PW+10,14,4);c.fill()}
   c.fillStyle='#1b1f27';c.fillRect(0,ROAD,GW,60);c.fillStyle=C.paint;for(let x=-((s.t*sp)%60);x<GW;x+=60)c.fillRect(x,ROAD+30,30,4);
   if(s.inv>0&&Math.floor(s.inv*10)%2)c.globalAlpha=.35;drawCar(c,s.car.x,s.car.y,50,{tilt:clamp(s.car.vy/900,-.4,.5)});c.globalAlpha=1;
   if(!s.started){c.fillStyle='#fff';c.font='700 20px -apple-system,system-ui,sans-serif';c.textAlign='center';c.fillText('Tap to hop',GW/2,GH/2+70)}}};
 return s};
function performance_now(){return typeof performance!=='undefined'?performance.now():Date.now()}

ENG.dash=function(L,seed){
 const i=L-1,P=LV.dash,lanes=P.lanes[i],rail=L>=8,cols=7,cell=GW/cols,rows=lanes+(rail?1:0)+2,oy=GH-rows*cell-6;
 const rng=mulberry((seed||0)+L*131+7),LEN=GW+200,minGap=P.gap[i]*cell;
 const railRow=rail?Math.ceil(rows/2):-1;
 const lane=[];
 for(let r=1;r<rows-1;r++){
  if(r===railRow){lane[r]={rail:true,dir:1,P:Math.max(4.2,6.6-(L-8)*.8),off:rng()*3,warn:1.6,dur:1.9};continue}
  const dir=r%2?1:-1,speed=P.speed[i]*(.75+rng()*.5),vs=[];
  let x=rng()*80;
  while(x<LEN-60){const truck=rng()<.3,w=(truck?1.9:1.15)*cell;vs.push({p:x,w,truck,col:['#e5383b','#2f80ed','#19a974','#9b5de5','#ffc61a','#ff8a4c','#e9ecef'][Math.floor(rng()*7)]});x+=w+minGap*(1+rng()*.5)}
  const used=x;lane[r]={dir,speed,vs,len:Math.max(LEN,used)}}
 const s={kind:'dash',L,W:GW,H:GH,hearts:3,status:'play',t:0,inv:0,col:3,row:0,hop:0,controls:[['◀','left'],['▲','up'],['▼','down'],['▶','right']],cell,rows,oy,
  hud(){return 'Lanes crossed '+Math.max(0,s.row-0)+' of '+(rows-1)},
  vx(ln,v,t){const d=ln.dir;let x=((v.p+d*ln.speed*t)%ln.len+ln.len)%ln.len-90;return x},
  train(ln,t){const u=(t+ln.off)%ln.P;return {warn:u<ln.warn,on:u>=ln.warn&&u<ln.warn+ln.dur,k:(u-ln.warn)/ln.dur}},
  trainX(k){const TL=9*cell;return -TL+k*(TL+GW)},
  hitAt(row,col,t){const ln=lane[row];if(!ln)return false;const px=(col+.5)*cell,h=.26*cell;
   if(ln.rail){const tr=s.train(ln,t);if(!tr.on)return false;const x=s.trainX(tr.k);return px+h>x&&px-h<x+9*cell}
   for(const v of ln.vs){const x=s.vx(ln,v,t);if(px+h>x&&px-h<x+v.w)return true}return false},
  safe(row,col,t0,t1){for(let t=t0;t<=t1;t+=.04)if(s.hitAt(row,col,t))return false;return true},
  act(a){if(s.status!=='play')return;let r=s.row,c=s.col;
   if(a==='up')r++;else if(a==='down')r--;else if(a==='left')c--;else if(a==='right')c++;else return;
   if(r<0||c<0||c>=cols||r>=rows)return;s.row=r;s.col=c;s.hop=.14;
   if(r===rows-1)s.status='win'},
  _p:null,
  pointer(t,x,y){if(t==='down')s._p={x,y};else if(t==='up'&&s._p){const dx=x-s._p.x,dy=y-s._p.y;s._p=null;
    if(Math.abs(dx)<14&&Math.abs(dy)<14)s.act('up');else if(Math.abs(dx)>Math.abs(dy))s.act(dx>0?'right':'left');else s.act(dy<0?'up':'down')}},
  update(dt){if(s.status!=='play')return;dt=Math.min(dt,.04);s.t+=dt;s.inv-=dt;s.hop=Math.max(0,s.hop-dt);
   if(s.inv<=0&&s.hitAt(s.row,s.col,s.t)){s.hearts--;s.inv=.9;s.row=0;s.col=3;if(s.hearts<=0)s.status='lose'}},
  draw(c){
   sky(c,s.t);
   for(let r=0;r<rows;r++){const y=oy+(rows-1-r)*cell,ln=lane[r];
    if(!ln){c.fillStyle=r===0?'#3d4a3c':'#cfd3da';c.fillRect(0,y,GW,cell);
     if(r===rows-1){c.fillStyle='#fff';for(let k=0;k<cols;k++)c.fillRect(k*cell+8,y+cell*.3,cell-16,cell*.4)}
     else{c.fillStyle='#4f6b4d';for(let k=0;k<cols;k++){c.beginPath();c.arc((k+.5)*cell,y+cell/2,5,0,6.3);c.fill()}}continue}
    if(ln.rail){c.fillStyle='#6b5f54';c.fillRect(0,y,GW,cell);c.fillStyle='#2b2724';c.fillRect(0,y+cell*.3,GW,4);c.fillRect(0,y+cell*.66,GW,4);
     for(let x=0;x<GW;x+=14){c.fillStyle='#43392f';c.fillRect(x,y+cell*.22,7,cell*.56)}
     const tr=s.train(ln,s.t);const flash=tr.warn&&Math.floor(s.t*6)%2;
     c.fillStyle='#fff';c.fillRect(6,y+2,6,cell-4);c.fillStyle=flash?C.red:'#5a1b1d';c.beginPath();c.arc(9,y+10,6,0,6.3);c.fill();c.beginPath();c.arc(9,y+cell-12,6,0,6.3);c.fill();
     if(tr.on){const x=s.trainX(tr.k);c.fillStyle='#394150';rr(c,x,y+4,9*cell,cell-8,8);c.fill();c.fillStyle=C.paint;c.fillRect(x+9*cell-30,y+cell*.3,24,cell*.4);c.fillStyle='#cfd6e6';for(let k=0;k<8;k++)c.fillRect(x+16+k*52,y+cell*.3,30,cell*.4)}
     if(tr.warn){c.fillStyle='#fff';c.font='800 13px -apple-system,system-ui,sans-serif';c.textAlign='center';c.fillText('TRAIN COMING',GW/2,y+cell*.62)}continue}
    c.fillStyle='#2a2e37';c.fillRect(0,y,GW,cell);c.fillStyle='#ffffff55';for(let x=0;x<GW;x+=34)c.fillRect(x,y+cell-2,18,2);
    for(const v of ln.vs){const x=s.vx(ln,v,s.t);c.fillStyle=v.col;rr(c,x,y+7,v.w,cell-14,8);c.fill();c.fillStyle='#d8ecff';const f=ln.dir>0?x+v.w-v.w*.3:x+4;c.fillRect(f,y+11,v.w*.26,cell-22);if(v.truck){c.fillStyle='#00000026';c.fillRect(ln.dir>0?x+4:x+v.w*.35,y+10,v.w*.6,cell-20)}
     c.fillStyle='#fff3b0';c.fillRect(ln.dir>0?x+v.w-4:x,y+12,4,5);c.fillRect(ln.dir>0?x+v.w-4:x,y+cell-17,4,5)}}
   const px=(s.col+.5)*cell,py=oy+(rows-1-s.row)*cell+cell/2-(s.hop>0?8:0);
   if(s.inv>0&&Math.floor(s.inv*10)%2)c.globalAlpha=.35;
   c.fillStyle='#00000040';c.beginPath();c.ellipse(px,py+14,12,5,0,0,6.3);c.fill();
   c.fillStyle=PLAYER.shirt||'#19a974';rr(c,px-9,py-4,18,20,6);c.fill();c.fillStyle=PLAYER.skin;c.beginPath();c.arc(px,py-10,9,0,6.3);c.fill();c.fillStyle=PLAYER.hair;c.beginPath();c.arc(px,py-12,9,3.2,6.2);c.fill();c.fillStyle='#fff';c.fillRect(px-9,py+10,18,4);
   c.globalAlpha=1}};
 return s};

ENG.stack=function(L,seed){
 const i=L-1,P=LV.stack,goal=P.goal[i],interval=P.ms[i]/1000,junk=P.junk[i],COLS=10,ROWS=18,CS=30,OX=8,OY=10;
 const rng=mulberry((seed||0)+L*313+11);
 const SH=[[[0,1],[1,1],[2,1],[3,1]],[[0,0],[1,0],[0,1],[1,1]],[[1,0],[0,1],[1,1],[2,1]],[[1,0],[2,0],[0,1],[1,1]],[[0,0],[1,0],[1,1],[2,1]],[[0,0],[0,1],[1,1],[2,1]],[[2,0],[0,1],[1,1],[2,1]]];
 const COL=['#2f80ed','#ffc61a','#9b5de5','#19a974','#e5383b','#ff8a4c','#18b5c9'];
 const s={kind:'stack',L,W:GW,H:GH,hearts:3,status:'play',goal,lines:0,board:[],acc:0,cur:null,next:null,over:0,
  controls:[['◀','left',1],['⟳','rotate'],['▶','right',1],['▼','down',1],['⤓','drop']],
  hud(){return 'Rows cleared '+s.lines+' of '+goal},
  fresh(){s.board=Array.from({length:ROWS},()=>Array(COLS).fill(0));
   for(let k=0;k<junk;k++){const r=ROWS-1-k,hole=Math.floor(rng()*COLS);for(let c=0;c<COLS;c++)if(c!==hole&&rng()<.85)s.board[r][c]=8}},
  mk(t){return{t,c:SH[t].map(p=>p.slice()),x:3,y:0}},
  bag:[],pull(){if(!s.bag.length){s.bag=[0,1,2,3,4,5,6];for(let k=6;k>0;k--){const j=Math.floor(rng()*(k+1));[s.bag[k],s.bag[j]]=[s.bag[j],s.bag[k]]}}return s.bag.pop()},
  fits(p,dx,dy,cells){cells=cells||p.c;for(const[a,b]of cells){const x=p.x+a+dx,y=p.y+b+dy;if(x<0||x>=COLS||y>=ROWS)return false;if(y>=0&&s.board[y][x])return false}return true},
  spawn(){s.cur=s.next?s.mk(s.next):s.mk(s.pull());s.next=s.pull();if(!s.fits(s.cur,0,0)){s.topout()}},
  topout(){s.hearts--;if(s.hearts<=0){s.status='lose';return}s.fresh();s.cur=s.mk(s.pull())},
  rot(p){let c=p.c.map(([x,y])=>[-y,x]);const mx=Math.min(...c.map(a=>a[0])),my=Math.min(...c.map(a=>a[1]));return c.map(([x,y])=>[x-mx,y-my])},
  act(a){if(s.status!=='play'||!s.cur)return;const p=s.cur;
   if(a==='left'&&s.fits(p,-1,0))p.x--;
   else if(a==='right'&&s.fits(p,1,0))p.x++;
   else if(a==='down'){if(s.fits(p,0,1))p.y++;else s.lock()}
   else if(a==='drop'){while(s.fits(p,0,1))p.y++;s.lock()}
   else if(a==='rotate'&&p.t!==1){const nc=s.rot(p);for(const k of [0,-1,1,-2,2]){if(s.fits(p,k,0,nc)){p.c=nc;p.x+=k;break}}}},
  lock(){const p=s.cur;for(const[a,b]of p.c){const x=p.x+a,y=p.y+b;if(y>=0)s.board[y][x]=p.t+1}
   let n=0;for(let r=ROWS-1;r>=0;r--){if(s.board[r].every(v=>v)){s.board.splice(r,1);s.board.unshift(Array(COLS).fill(0));n++;r++}}
   s.lines+=n;if(n)s.flash=.25;if(s.lines>=goal){s.status='win';return}s.acc=0;s.spawn()},
  pointer(t,x,y){if(t==='down')s._d={x,y};else if(t==='up'&&s._d){const dx=x-s._d.x,dy=y-s._d.y;s._d=null;if(Math.abs(dx)<12&&Math.abs(dy)<12)s.act('rotate');else if(Math.abs(dx)>Math.abs(dy)){const n=Math.min(4,Math.round(Math.abs(dx)/CS));for(let k=0;k<n;k++)s.act(dx>0?'right':'left')}else if(dy>30)s.act('drop')}},
  update(dt){if(s.status!=='play')return;dt=Math.min(dt,.05);s.flash=Math.max(0,(s.flash||0)-dt);s.acc+=dt;while(s.acc>=interval&&s.status==='play'){s.acc-=interval;if(s.fits(s.cur,0,1))s.cur.y++;else s.lock()}},
  draw(c){c.fillStyle='#14171d';c.fillRect(0,0,GW,GH);c.fillStyle='#1b1f27';rr(c,OX-4,OY-4,COLS*CS+8,ROWS*CS+8,10);c.fill();
   c.strokeStyle='#ffffff10';c.lineWidth=1;for(let x=1;x<COLS;x++){c.beginPath();c.moveTo(OX+x*CS,OY);c.lineTo(OX+x*CS,OY+ROWS*CS);c.stroke()}
   const cell=(x,y,t,a)=>{c.globalAlpha=a||1;const px=OX+x*CS,py=OY+y*CS;if(t===8){c.fillStyle='#4a505c';rr(c,px+1,py+1,CS-2,CS-2,5);c.fill();c.fillStyle='#ffc61a';c.fillRect(px+4,py+CS/2-1,CS-8,2)}
    else{c.fillStyle=COL[t-1];rr(c,px+1,py+1,CS-2,CS-2,7);c.fill();c.fillStyle='#ffffff55';rr(c,px+5,py+4,CS-10,9,4);c.fill();c.fillStyle='#00000040';c.beginPath();c.arc(px+8,py+CS-6,3,0,6.3);c.arc(px+CS-8,py+CS-6,3,0,6.3);c.fill()}c.globalAlpha=1};
   for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)if(s.board[y][x])cell(x,y,s.board[y][x]);
   if(s.cur){let g=0;while(s.fits(s.cur,0,g+1))g++;for(const[a,b]of s.cur.c){c.strokeStyle='#ffffff55';c.lineWidth=2;rr(c,OX+(s.cur.x+a)*CS+3,OY+(s.cur.y+b+g)*CS+3,CS-6,CS-6,5);c.stroke()}
    for(const[a,b]of s.cur.c)if(s.cur.y+b>=0)cell(s.cur.x+a,s.cur.y+b,s.cur.t+1)}
   if(s.flash){c.fillStyle='#ffc61a33';c.fillRect(OX,OY,COLS*CS,ROWS*CS)}
   c.fillStyle='#ffffffaa';c.font='700 11px -apple-system,system-ui,sans-serif';c.textAlign='center';c.fillText('NEXT',338,24);
   if(s.next!=null){for(const[a,b]of SH[s.next]){c.fillStyle=COL[s.next];rr(c,318+a*10,34+b*10,9,9,2);c.fill()}}}};
 s.fresh();s.spawn();return s};

ENG.match=function(L,seed){
 const i=L-1,P=LV.match,T=P.types[i],MV=P.moves[i],G=P.goal[i],N=7,CS=48,OX=12,OY=70;
 const rng=mulberry((seed||0)+L*557+3);
 const nc=G[0]==='cones'?G[1]:(L>=4?2+Math.floor(L/3):0);
 const s={kind:'match',L,W:GW,H:GH,hearts:3,status:'play',moves:MV,mv0:MV,score:0,got:[0,0,0,0,0,0],cones:nc,coneLeft:nc,g:[],mode:'idle',tm:0,sel:null,combo:0,idle:0,controls:[],goal:G,
  hud(){return G[0]==='collect'?'Collected '+Math.min(s.got[G[1]],G[2])+' of '+G[2]:G[0]==='score'?'Score '+s.score+' of '+G[1]:'Cones cleared '+(s.cones-s.coneLeft)+' of '+s.cones},
  tile(t){return{t,ox:0,oy:0,d:0}},
  rnd(){return s.tile(Math.floor(rng()*T))},
  matches(){const m=new Set(),g=s.g;
   for(let r=0;r<N;r++)for(let c=0;c<N;c++){const a=g[r][c];if(!a||a.t>5)continue;
    if(c<N-2&&g[r][c+1]&&g[r][c+2]&&g[r][c+1].t===a.t&&g[r][c+2].t===a.t){m.add(r*N+c);m.add(r*N+c+1);m.add(r*N+c+2)}
    if(r<N-2&&g[r+1][c]&&g[r+2][c]&&g[r+1][c].t===a.t&&g[r+2][c].t===a.t){m.add(r*N+c);m.add((r+1)*N+c);m.add((r+2)*N+c)}}
   return m},
  build(){do{s.g=Array.from({length:N},()=>Array.from({length:N},()=>s.rnd()));
    let k=0;while(k<nc){const r=Math.floor(rng()*N),c=Math.floor(rng()*N);if(s.g[r][c].t<6){s.g[r][c]=s.tile(9);k++}}
    for(let k=0;k<60&&s.matches().size;k++)for(const idx of s.matches()){const r=Math.floor(idx/N),c=idx%N;s.g[r][c]=s.rnd()}
   }while(s.matches().size||!s.hint())},
  hint(){for(let r=0;r<N;r++)for(let c=0;c<N;c++){for(const[dr,dc]of[[0,1],[1,0]]){const r2=r+dr,c2=c+dc;if(r2>=N||c2>=N)continue;const a=s.g[r][c],b=s.g[r2][c2];if(a.t>5||b.t>5)continue;
     s.g[r][c]=b;s.g[r2][c2]=a;const ok=s.matches().size>0;s.g[r][c]=a;s.g[r2][c2]=b;if(ok)return[[r,c],[r2,c2]]}}return null},
  swap(a,b){if(s.mode!=='idle'||s.status!=='play'||s.moves<=0)return false;const[r1,c1]=a,[r2,c2]=b;
   if(Math.abs(r1-r2)+Math.abs(c1-c2)!==1)return false;const A=s.g[r1][c1],B=s.g[r2][c2];if(A.t>5||B.t>5)return false;
   s.g[r1][c1]=B;s.g[r2][c2]=A;A.ox=(c1-c2)*CS;A.oy=(r1-r2)*CS;B.ox=(c2-c1)*CS;B.oy=(r2-r1)*CS;s.mode='swap';s.tm=.16;s.sw=[a,b];s.sel=null;s.idle=0;s.combo=0;return true},
  pointer(t,x,y){const c=Math.floor((x-OX)/CS),r=Math.floor((y-OY)/CS);const inb=r>=0&&r<N&&c>=0&&c<N;
   if(t==='down'){s.pd=inb?[r,c]:null;if(inb&&s.mode==='idle'){if(s.sel&&Math.abs(s.sel[0]-r)+Math.abs(s.sel[1]-c)===1){s.swap(s.sel,[r,c]);s.pd=null}else s.sel=[r,c]}}
   else if(t==='up'&&s.pd){const dx=x-(OX+s.pd[1]*CS+CS/2),dy=y-(OY+s.pd[0]*CS+CS/2);if(Math.hypot(dx,dy)>CS*.55){const to=Math.abs(dx)>Math.abs(dy)?[s.pd[0],s.pd[1]+(dx>0?1:-1)]:[s.pd[0]+(dy>0?1:-1),s.pd[1]];if(to[0]>=0&&to[0]<N&&to[1]>=0&&to[1]<N)s.swap(s.pd,to)}s.pd=null}},
  act(){},
  doClear(){const m=s.matches(),g=s.g;const rm=new Set(m);
   for(const idx of m){const r=Math.floor(idx/N),c=idx%N;for(const[dr,dc]of[[1,0],[-1,0],[0,1],[0,-1]]){const r2=r+dr,c2=c+dc;if(r2>=0&&r2<N&&c2>=0&&c2<N&&g[r2][c2].t===9)rm.add(r2*N+c2)}}
   s.combo++;let pts=0;for(const idx of rm){const r=Math.floor(idx/N),c=idx%N,t=g[r][c].t;if(t===9){s.coneLeft--;pts+=15}else{s.got[t]++;pts+=10}g[r][c].d=1}
   s.score+=Math.round(pts*(1+(s.combo-1)*.5));s.rm=rm;s.mode='clear';s.tm=.2},
  fall(){const g=s.g;for(let c=0;c<N;c++){const col=[];for(let r=N-1;r>=0;r--)if(g[r][c]&&!g[r][c].d)col.push([r,g[r][c]]);
   let w=N-1;for(const[r,t]of col){g[w][c]=t;t.oy+=(r-w)*CS;w--}
   for(let r=w;r>=0;r--){const t=s.rnd();t.oy=-(w+1)*CS;g[r][c]=t}}
   s.mode='fall'},
  settle(){const done=G[0]==='collect'?s.got[G[1]]>=G[2]:G[0]==='score'?s.score>=G[1]:s.coneLeft<=0;
   if(done){s.status='win';return}if(s.moves<=0){s.status='lose';return}
   if(!s.hint()){let k=0;do{for(let r=0;r<N;r++)for(let c=0;c<N;c++)if(s.g[r][c].t<6)s.g[r][c]=s.rnd();k++}while((s.matches().size||!s.hint())&&k<200)}
   s.mode='idle'},
  update(dt){if(s.status!=='play')return;dt=Math.min(dt,.05);
   for(const row of s.g)for(const t of row){if(!t)continue;if(s.mode==='fall'){const v=620*dt;t.oy=t.oy<0?Math.min(0,t.oy+v):t.oy;}else{const v=520*dt;t.ox=t.ox>0?Math.max(0,t.ox-v):Math.min(0,t.ox+v);t.oy=t.oy>0?Math.max(0,t.oy-v):Math.min(0,t.oy+v)}}
   if(s.mode==='idle'){s.idle+=dt;return}
   s.tm-=dt;
   if(s.mode==='swap'&&s.tm<=0){if(s.matches().size){s.moves--;s.doClear()}else{const[a,b]=s.sw,A=s.g[a[0]][a[1]],B=s.g[b[0]][b[1]];s.g[a[0]][a[1]]=B;s.g[b[0]][b[1]]=A;A.ox=(b[1]-a[1])*CS;A.oy=(b[0]-a[0])*CS;B.ox=(a[1]-b[1])*CS;B.oy=(a[0]-b[0])*CS;s.mode='back';s.tm=.16}}
   else if(s.mode==='back'&&s.tm<=0){s.mode='idle'}
   else if(s.mode==='clear'&&s.tm<=0){s.fall()}
   else if(s.mode==='fall'){let moving=false;for(const row of s.g)for(const t of row)if(t&&t.oy<0)moving=true;if(!moving){if(s.matches().size)s.doClear();else s.settle()}}},
  sign(c,t,x,y,z){c.save();c.translate(x,y);c.lineJoin='round';
   if(t===0){c.fillStyle='#fff';c.beginPath();for(let k=0;k<8;k++){const a=Math.PI/8+k*Math.PI/4;c.lineTo(Math.cos(a)*z,Math.sin(a)*z)}c.fill();c.fillStyle='#d62839';c.beginPath();for(let k=0;k<8;k++){const a=Math.PI/8+k*Math.PI/4;c.lineTo(Math.cos(a)*z*.88,Math.sin(a)*z*.88)}c.fill();c.fillStyle='#fff';c.font='800 '+Math.round(z*.5)+'px -apple-system,system-ui,sans-serif';c.textAlign='center';c.fillText('STOP',0,z*.18)}
   else if(t===1){c.fillStyle='#fff';c.beginPath();c.moveTo(-z,-z*.8);c.lineTo(z,-z*.8);c.lineTo(0,z*.95);c.closePath();c.fill();c.strokeStyle='#d62839';c.lineWidth=z*.2;c.stroke();}
   else if(t===2){c.fillStyle='#c8e51a';c.strokeStyle='#1b1f27';c.lineWidth=2.5;c.beginPath();c.moveTo(0,-z);c.lineTo(z*.9,-z*.35);c.lineTo(z*.9,z*.9);c.lineTo(-z*.9,z*.9);c.lineTo(-z*.9,-z*.35);c.closePath();c.fill();c.stroke();c.fillStyle='#1b1f27';[-.3,.3].forEach(k=>{c.beginPath();c.arc(z*k,-z*.12,z*.14,0,6.3);c.fill();c.fillRect(z*k-z*.07,z*.04,z*.14,z*.5)})}
   else if(t===3){c.fillStyle='#fff';c.strokeStyle='#1b1f27';c.lineWidth=2.5;rr(c,-z*.8,-z,z*1.6,z*2,6);c.fill();c.stroke();c.fillStyle='#1b1f27';c.font='800 '+Math.round(z*.36)+'px -apple-system,system-ui,sans-serif';c.textAlign='center';c.fillText('SPEED',0,-z*.45);c.fillText('LIMIT',0,-z*.1);c.font='800 '+Math.round(z*.68)+'px -apple-system,system-ui,sans-serif';c.fillText('25',0,z*.72)}
   else if(t===4){c.fillStyle='#ff8a1f';c.strokeStyle='#1b1f27';c.lineWidth=2.5;c.beginPath();c.moveTo(0,-z);c.lineTo(z,0);c.lineTo(0,z);c.lineTo(-z,0);c.closePath();c.fill();c.stroke();c.fillStyle='#1b1f27';c.fillRect(-z*.4,-z*.08,z*.8,z*.16)}
   else if(t===5){c.fillStyle='#ffd21f';c.strokeStyle='#1b1f27';c.lineWidth=2.5;c.beginPath();c.arc(0,0,z,0,6.3);c.fill();c.stroke();c.lineWidth=z*.2;c.lineCap='round';c.beginPath();c.moveTo(-z*.5,-z*.5);c.lineTo(z*.5,z*.5);c.moveTo(z*.5,-z*.5);c.lineTo(-z*.5,z*.5);c.stroke()}
   else if(t===9){c.fillStyle='#ff6a1f';c.beginPath();c.moveTo(0,-z*.9);c.lineTo(z*.7,z*.8);c.lineTo(-z*.7,z*.8);c.closePath();c.fill();c.fillStyle='#fff';c.beginPath();c.moveTo(-z*.28,-z*.1);c.lineTo(z*.28,-z*.1);c.lineTo(z*.4,z*.25);c.lineTo(-z*.4,z*.25);c.closePath();c.fill();c.fillStyle='#1b1f27';c.fillRect(-z*.9,z*.8,z*1.8,z*.2)}
   c.restore()},
  draw(c){c.fillStyle='#14171d';c.fillRect(0,0,GW,GH);const g=c.createLinearGradient(0,0,0,GH);g.addColorStop(0,'#232859');g.addColorStop(1,'#14171d');c.fillStyle=g;c.fillRect(0,0,GW,GH);
   c.fillStyle='#1b1f27';rr(c,OX-6,OY-6,N*CS+12,N*CS+12,14);c.fill();
   const hint=s.mode==='idle'&&s.idle>4?s.hint():null;
   for(let r=0;r<N;r++)for(let k=0;k<N;k++){c.fillStyle=(r+k)%2?'#262b36':'#2c313d';rr(c,OX+k*CS+1,OY+r*CS+1,CS-2,CS-2,8);c.fill()}
   if(s.sel){c.strokeStyle=C.paint;c.lineWidth=3;rr(c,OX+s.sel[1]*CS+2,OY+s.sel[0]*CS+2,CS-4,CS-4,9);c.stroke()}
   c.save();c.beginPath();c.rect(OX,OY,N*CS,N*CS);c.clip();
   for(let r=0;r<N;r++)for(let k=0;k<N;k++){const t=s.g[r][k];if(!t)continue;const x=OX+k*CS+CS/2+t.ox,y=OY+r*CS+CS/2+t.oy;
    let z=CS*.38;if(t.d){const q=clamp(s.tm/.2,0,1);c.globalAlpha=q;z*=Math.max(.15,q)}
    if(hint&&((hint[0][0]===r&&hint[0][1]===k)||(hint[1][0]===r&&hint[1][1]===k))){z*=1+Math.sin(performance_now()/120)*.07}
    s.sign(c,t.t,x,y,z);c.globalAlpha=1}
   c.restore();
   c.fillStyle='#fff';c.font='800 15px -apple-system,system-ui,sans-serif';c.textAlign='left';c.fillText('Moves left',OX,OY-24);c.font='800 30px -apple-system,system-ui,sans-serif';c.fillStyle=C.paint;c.fillText(String(s.moves),OX+98,OY-22);
   if(s.combo>1&&s.mode!=='idle'){c.fillStyle='#fff';c.textAlign='right';c.font='800 18px -apple-system,system-ui,sans-serif';c.fillText('Combo x'+s.combo,GW-OX,OY-22)}}};
 s.build();return s};

ENG.bubble=function(L,seed){
 const i=L-1,P=LV.bubble,NC=P.colors[i],R0=P.rows[i],K=P.drop[i],R=19,D=38,RH=33,MX=9,LIMIT=13,SY=GH-58;
 const rng=mulberry((seed||0)+L*811+19);
 const COL=['#e5383b','#ffc61a','#19a974','#2f80ed','#9b5de5','#eef1f6'];
 const s={kind:'bubble',L,W:GW,H:GH,hearts:3,status:'play',rows:[],shift:0,shots:0,ang:0,ball:null,col:0,next:0,fx:[],controls:[],
  hud(){let n=0;for(const r of s.rows)for(const v of r)if(v>=0)n++;return 'Bubbles left '+n},
  cols(r){return((r+s.shift)&1)?MX-1:MX},
  pos(r,c){return{x:9+R+c*D+(((r+s.shift)&1)?R:0),y:R+r*RH}},
  nb(r,c){const p=(r+s.shift)&1,o=[[r,c-1],[r,c+1]];if(p){o.push([r-1,c],[r-1,c+1],[r+1,c],[r+1,c+1])}else{o.push([r-1,c-1],[r-1,c],[r+1,c-1],[r+1,c])}
   return o.filter(([a,b])=>a>=0&&a<s.rows.length&&b>=0&&b<s.cols(a))},
  newRow(r){return Array.from({length:s.cols(r)},()=>-1)},
  build(){s.rows=[];s.shift=0;s.shots=0;for(let r=0;r<R0;r++){const row=s.newRow(r);let prev=-1;for(let c=0;c<row.length;c++){const v=(prev>=0&&rng()<.45)?prev:Math.floor(rng()*NC);row[c]=v;prev=v}s.rows.push(row)}
   while(s.rows.length<LIMIT+2)s.rows.push(s.newRow(s.rows.length));s.pick();s.pick()},
  present(){const a=new Set();for(const r of s.rows)for(const v of r)if(v>=0)a.add(v);return[...a]},
  pick(){const p=s.present();s.col=s.next;s.next=p.length?p[Math.floor(rng()*p.length)]:0;if(!p.includes(s.col)&&p.length)s.col=p[Math.floor(rng()*p.length)]},
  aimAt(x,y){let a=Math.atan2(x-GW/2,SY-y);s.ang=clamp(a,-1.35,1.35)},
  pointer(t,x,y){if(s.status!=='play')return;if(t==='down'||t==='move')s.aimAt(x,y);else if(t==='up'){s.aimAt(x,y);s.fire()}},
  act(){},
  fire(){if(s.ball||s.status!=='play')return;const sp=760;s.ball={x:GW/2,y:SY,dx:Math.sin(s.ang)*sp,dy:-Math.cos(s.ang)*sp,col:s.col}},
  snap(x,y){let best=null,bd=1e9;const r0=Math.round((y-R)/RH);for(let r=Math.max(0,r0-1);r<=Math.min(s.rows.length-1,r0+1);r++)for(let c=0;c<s.cols(r);c++){if(s.rows[r][c]>=0)continue;const p=s.pos(r,c),d=(p.x-x)**2+(p.y-y)**2;if(d<bd){bd=d;best=[r,c]}}return best},
  step(b,dt){const n=Math.ceil(Math.hypot(b.dx,b.dy)*dt/5);for(let k=0;k<n;k++){b.x+=b.dx*dt/n;b.y+=b.dy*dt/n;
    if(b.x<R){b.x=R;b.dx=-b.dx}else if(b.x>GW-R){b.x=GW-R;b.dx=-b.dx}
    if(b.y<=R)return true;
    for(let r=0;r<s.rows.length;r++){if(R+r*RH>b.y+D)break;for(let c=0;c<s.rows[r].length;c++)if(s.rows[r][c]>=0){const p=s.pos(r,c);if((p.x-b.x)**2+(p.y-b.y)**2<(D*.86)**2)return true}}}
   return false},
  place(r,c,col){s.rows[r][c]=col;const grp=[],seen=new Set([r*100+c]),q=[[r,c]];
   while(q.length){const[a,b]=q.pop();grp.push([a,b]);for(const[x,y]of s.nb(a,b)){const k=x*100+y;if(!seen.has(k)&&s.rows[x][y]===col){seen.add(k);q.push([x,y])}}}
   let popped=0;if(grp.length>=3){for(const[a,b]of grp){const p=s.pos(a,b);s.fx.push({x:p.x,y:p.y,vy:-120,vx:(rng()-.5)*140,col:s.rows[a][b],t:.5});s.rows[a][b]=-1;popped++}
    const conn=new Set(),q2=[];for(let c=0;c<s.cols(0);c++)if(s.rows[0][c]>=0){conn.add(c);q2.push([0,c])}
    while(q2.length){const[a,b]=q2.pop();for(const[x,y]of s.nb(a,b)){const k=x*100+y;if(!conn.has(k)&&s.rows[x][y]>=0){conn.add(k);q2.push([x,y])}}}
    for(let a=0;a<s.rows.length;a++)for(let b=0;b<s.rows[a].length;b++)if(s.rows[a][b]>=0&&!(a===0?conn.has(b):conn.has(a*100+b))){const p=s.pos(a,b);s.fx.push({x:p.x,y:p.y,vy:0,vx:(rng()-.5)*60,col:s.rows[a][b],t:.9,g:1});s.rows[a][b]=-1;popped++}}
   return popped},
  empty(){return s.rows.every(r=>r.every(v=>v<0))},
  after(popped){if(s.empty()){s.status='win';return}
   if(!popped){s.shots++;if(K&&s.shots%K===0){s.shift++;const nr=Array.from({length:s.cols(0)},()=>Math.floor(rng()*NC));s.rows.unshift(nr);s.rows.pop()}}
   for(let r=LIMIT;r<s.rows.length;r++)if(s.rows[r].some(v=>v>=0)){s.hearts--;if(s.hearts<=0){s.status='lose';return}s.build();return}
   s.pick()},
  update(dt){dt=Math.min(dt,.04);for(const f of s.fx){f.t-=dt;f.x+=f.vx*dt;f.y+=f.vy*dt;f.vy+=(f.g?1100:600)*dt}s.fx=s.fx.filter(f=>f.t>0);
   if(s.status!=='play'||!s.ball)return;
   if(s.step(s.ball,dt)){const b=s.ball;s.ball=null;const cell=s.snap(b.x,b.y);if(!cell){s.after(0);return}const p=s.place(cell[0],cell[1],b.col);s.after(p)}},
  preview(ang){const b={x:GW/2,y:SY,dx:Math.sin(ang)*760,dy:-Math.cos(ang)*760,col:s.col};let g=0;while(g<400&&!s.step(b,1/60))g++;const cell=s.snap(b.x,b.y);if(!cell)return null;
   const rows=s.rows.map(r=>r.slice());rows[cell[0]][cell[1]]=s.col;const seen=new Set([cell[0]*100+cell[1]]),q=[cell];let n=0;
   while(q.length){const[a,c]=q.pop();n++;for(const[x,y]of s.nb(a,c)){const k=x*100+y;if(!seen.has(k)&&rows[x][y]===s.col){seen.add(k);q.push([x,y])}}}
   return{cell,n}},
  draw(c){const g=c.createLinearGradient(0,0,0,GH);g.addColorStop(0,'#232859');g.addColorStop(.7,'#6b3f7f');g.addColorStop(1,'#1b1f27');c.fillStyle=g;c.fillRect(0,0,GW,GH);
   const bub=(x,y,col,a)=>{c.globalAlpha=a==null?1:a;c.fillStyle=COL[col];c.beginPath();c.arc(x,y,R-1.5,0,6.3);c.fill();c.fillStyle='#ffffff66';c.beginPath();c.arc(x-5,y-6,5,0,6.3);c.fill();c.strokeStyle=col===5?'#8b93a3':'#00000030';c.lineWidth=2;c.beginPath();c.arc(x,y,R-1.5,0,6.3);c.stroke();c.globalAlpha=1};
   for(let r=0;r<s.rows.length;r++)for(let k=0;k<s.rows[r].length;k++)if(s.rows[r][k]>=0){const p=s.pos(r,k);bub(p.x,p.y,s.rows[r][k])}
   const ly=R+LIMIT*RH-R;c.strokeStyle=C.red;c.setLineDash([8,6]);c.lineWidth=2;c.beginPath();c.moveTo(0,ly);c.lineTo(GW,ly);c.stroke();c.setLineDash([]);
   if(!s.ball&&s.status==='play'){c.fillStyle='#ffffffaa';let x=GW/2,y=SY,dx=Math.sin(s.ang),dy=-Math.cos(s.ang);for(let k=0;k<26;k++){x+=dx*16;y+=dy*16;if(x<R||x>GW-R){dx=-dx;x=clamp(x,R,GW-R)}if(y<R)break;c.beginPath();c.arc(x,y,2.4,0,6.3);c.fill()}}
   for(const f of s.fx)bub(f.x,f.y,f.col,clamp(f.t*2,0,1));
   if(s.ball)bub(s.ball.x,s.ball.y,s.ball.col);
   drawCar(c,GW/2,GH-22,70,{});c.save();c.translate(GW/2,SY);c.rotate(s.ang);c.fillStyle='#1b1f27';rr(c,-7,-34,14,30,5);c.fill();c.restore();
   if(!s.ball)bub(GW/2,SY,s.col);bub(GW/2+78,SY+12,s.next,.9);c.fillStyle='#fff';c.font='700 11px -apple-system,system-ui,sans-serif';c.textAlign='center';c.fillText('NEXT',GW/2+78,SY+42)}};
 s.build();return s};

/* ---------- games UI (runs after app.js) ---------- */
const gUnlocked=()=>totalStars()>=1;
const gStars=id=>(S.g&&S.g[id])||[];
const gLevelOpen=(id,L)=>L===1||(gStars(id)[L-2]||0)>0;
const gTotal=id=>gStars(id).reduce((a,b)=>a+(b||0),0);
function gamesTab(){
  const lock=!gUnlocked();
  return `<h2>Games</h2><div class="card coinbar"><span>🪙 <b>${S.coins||0}</b> coins</span><span class="muted">Win levels to earn more</span></div>
  ${lock?`<div class="card hl"><b>Games are locked</b><p class="muted" style="margin:4px 0 10px">Earn a star on any stop on the Road to unlock all five games.</p><button class="btn small ghost" data-act="tab" data-v="road">Go to the Road</button></div>`:''}
  ${GAMES.map(g=>{const done=gStars(g.id).filter(Boolean).length;return `<button class="card gcard ${lock?'off':''}" data-act="${lock?'glocked':'gsheet'}" data-v="${g.id}"><span class="gic">${g.icon}</span><span class="ginfo"><b>${g.name}</b><span class="muted">${g.tag}</span><span class="gprog"><i style="width:${done*10}%"></i></span><small class="muted">${done} of 10 levels · ${gTotal(g.id)} of 30 stars</small></span><span class="gplay">${lock?'🔒':'Play'}</span></button>`}).join('')}`}
function gsheetView(){const g=GAMES.find(x=>x.id===ui.gsheet),st=gStars(g.id);
  return `<div class="sheetbg" data-act="closesheet"><div class="sheet" role="dialog" aria-label="${g.name}" data-stop="1"><h2>${g.icon} ${g.name}</h2><p class="muted" style="margin:0 0 12px">${g.tag}. Pick a level.</p>
  <div class="lvgrid">${Array.from({length:10},(_,i)=>{const L=i+1,open=gLevelOpen(g.id,L),s=st[i]||0;return `<button class="lvb ${open?'':'off'} ${s?'done':''}" data-act="${open?'gplay':'glvlock'}" data-v="${g.id}:${L}"><b>${open?L:'🔒'}</b><span>${'★'.repeat(s)}${'☆'.repeat(3-s)}</span></button>`}).join('')}</div></div></div>`}
acts.gsheet=v=>{ui.gsheet=v;render()};
acts.glocked=()=>toast('Earn a star on any Road stop to unlock games.');
acts.glvlock=()=>toast('Beat the level before this one to unlock it.');
acts.gplay=v=>{const[id,L]=v.split(':');ui.gsheet=null;render();GP.open(id,+L,false)};
acts.bonus=()=>{const x=ui.result;if(!x||!x.bonus)return;const b=x.bonus;ui.result=null;ui.tab='road';render();GP.open(b.id,b.L,true)};

const GP={el:null,eng:null,id:null,L:0,raf:0,last:0,run:false,paused:false,cv:null,cx:null,sc:1,timers:[],
 open(id,L,bonus){GP.close(true);GP.id=id;GP.L=L;GP.bonus=bonus===undefined?GP.bonus:bonus;const g=GAMES.find(x=>x.id===id);
  const el=document.createElement('div');el.className='gov';el.innerHTML=`<div class="gtop"><button class="x" data-g="quit" aria-label="Quit game">✕</button><div class="gtitle"><b>${g.icon} ${g.name}</b><small>Level ${L} of 10</small></div><div class="ghearts" id="gh"></div></div><div class="ghud" id="ghud"></div><div class="gstage" id="gst"><canvas id="gcv"></canvas></div><div class="gctl" id="gctl"></div><div class="gmodal" id="gm"></div>`;
  document.body.appendChild(el);GP.el=el;document.documentElement.classList.add('ingame');
  GP.eng=ENG[id](L,Math.floor(Math.random()*1e6));GP.cv=el.querySelector('#gcv');GP.cx=GP.cv.getContext('2d');
  PLAYER=Object.assign(PLAYER,S.avatar?{color:S.avatar.carColor||PLAYER.color}:{});
  GP.fit();GP.controls();GP.hud();GP.intro(g);GP.bind();GP.run=false;GP.draw();
 },
 fit(){const st=GP.el.querySelector('#gst'),r=st.getBoundingClientRect(),k=Math.min(r.width/GW,r.height/GH),dpr=Math.min(2,window.devicePixelRatio||1);
  GP.cv.style.width=GW*k+'px';GP.cv.style.height=GH*k+'px';GP.cv.width=Math.round(GW*k*dpr);GP.cv.height=Math.round(GH*k*dpr);GP.sc=GP.cv.width/GW;GP.cx.setTransform(GP.sc,0,0,GP.sc,0,0)},
 draw(){if(GP.eng){GP.cx.clearRect(0,0,GW,GH);GP.eng.draw(GP.cx)}},
 controls(){const box=GP.el.querySelector('#gctl'),cs=GP.eng.controls||[];box.style.display=cs.length?'flex':'none';
  box.innerHTML=cs.map(c=>`<button class="gb" data-act2="${c[1]}" data-rep="${c[2]||0}" aria-label="${c[1]}">${c[0]}</button>`).join('');
  box.querySelectorAll('.gb').forEach(b=>{let iv=0;const fire=()=>{if(GP.run&&!GP.paused)GP.eng.act(b.dataset.act2)};
   b.addEventListener('pointerdown',e=>{e.preventDefault();fire();if(b.dataset.rep==='1'){clearInterval(iv);iv=setInterval(fire,110)}});
   ['pointerup','pointercancel','pointerleave'].forEach(t=>b.addEventListener(t,()=>clearInterval(iv)))})},
 hud(){const e=GP.eng;GP.el.querySelector('#gh').innerHTML=e.kind==='match'?'':Array.from({length:3},(_,i)=>`<span class="${i<e.hearts?'':'lost'}">♥</span>`).join('');
  GP.el.querySelector('#ghud').textContent=e.hud()},
 intro(g){const m=GP.el.querySelector('#gm');m.className='gmodal show';m.innerHTML=`<div class="gcardm"><div class="bigic">${g.icon}</div><h2>Level ${GP.L}</h2><p>${g.how(GP.L)}</p><button class="btn primary" data-g="start">Start</button></div>`},
 bind(){const el=GP.el,cv=GP.cv;
  const pt=(e,t)=>{if(!GP.run||GP.paused)return;const r=cv.getBoundingClientRect();GP.eng.pointer&&GP.eng.pointer(t,(e.clientX-r.left)/r.width*GW,(e.clientY-r.top)/r.height*GH)};
  cv.style.touchAction='none';
  cv.addEventListener('pointerdown',e=>{e.preventDefault();try{cv.setPointerCapture(e.pointerId)}catch(_){}pt(e,'down')});
  cv.addEventListener('pointermove',e=>{if(e.buttons||e.pointerType==='touch')pt(e,'move')});
  cv.addEventListener('pointerup',e=>pt(e,'up'));cv.addEventListener('pointercancel',e=>pt(e,'up'));
  el.addEventListener('click',e=>{const b=e.target.closest('[data-g]');if(!b)return;const a=b.dataset.g;
   if(a==='start')GP.start();else if(a==='quit')GP.close();else if(a==='retry')GP.open(GP.id,GP.L);else if(a==='next')GP.open(GP.id,GP.L+1);else if(a==='list'){GP.close();ui.tab='games';ui.gsheet=GP.idPrev||null;render()}});
  GP.onResize=()=>{GP.fit();GP.draw()};window.addEventListener('resize',GP.onResize);
  GP.onVis=()=>{GP.paused=document.hidden;GP.last=0};document.addEventListener('visibilitychange',GP.onVis);
  GP.onKey=e=>{if(!GP.run)return;const m={ArrowLeft:'left',ArrowRight:'right',ArrowUp:GP.id==='dash'?'up':'rotate',ArrowDown:'down',' ':GP.id==='flappy'?'tap':'drop'}[e.key];if(m){GP.eng.act(m);e.preventDefault()}};document.addEventListener('keydown',GP.onKey)},
 start(){GP.el.querySelector('#gm').className='gmodal';GP.run=true;GP.last=0;cancelAnimationFrame(GP.raf);GP.raf=requestAnimationFrame(GP.loop)},
 loop(t){const e=GP.eng;if(!e)return;const dt=GP.last?(t-GP.last)/1000:0;GP.last=t;
  if(!GP.paused){e.update(Math.min(dt,.05));GP.draw();const h=e.hearts+'|'+e.hud();if(h!==GP._h){GP._h=h;GP.hud()}}
  if(e.status!=='play'){GP.run=false;setTimeout(()=>GP.end(),450);return}
  GP.raf=requestAnimationFrame(GP.loop)},
 end(){if(!GP.eng)return;const e=GP.eng,win=e.status==='win',g=GAMES.find(x=>x.id===GP.id);let stars=0,coins=0;
  if(win){stars=e.kind==='match'?(e.moves/e.mv0>=.35?3:e.moves/e.mv0>=.15?2:1):Math.max(1,e.hearts);coins=5+GP.L+stars*3;
   S.g=S.g||{};const a=S.g[GP.id]=S.g[GP.id]||Array(10).fill(0);a[GP.L-1]=Math.max(a[GP.L-1]||0,stars);S.coins=(S.coins||0)+coins;save()}
  const m=GP.el.querySelector('#gm');m.className='gmodal show';
  m.innerHTML=win?`<div class="gcardm"><div class="stars3">${[1,2,3].map(i=>`<span class="${i<=stars?'on':''}">★</span>`).join('')}</div><h2>${GP.L===10?'Game mastered':'Level '+GP.L+' clear'}</h2><p class="gain"><span>🪙 +${coins}</span></p>${GP.bonus?'<button class="btn primary" data-g="quit">Back to the road</button><button class="btn line" data-g="retry" style="margin-top:10px">Play again</button>':`${GP.L<10?'<button class="btn primary" data-g="next">Next level</button>':''}<button class="btn ${GP.L<10?'ghost':'primary'}" data-g="retry" style="margin-top:10px">Play again</button><button class="btn line" data-g="quit" style="margin-top:10px">Back to games</button>`}</div>`
   :`<div class="gcardm"><div class="bigic">💥</div><h2>${e.kind==='match'?'Out of moves':'Out of hearts'}</h2><p>${e.hud()}. Give it another try, it gets easier.</p><button class="btn primary" data-g="retry">Try again</button><button class="btn line" data-g="quit" style="margin-top:10px">${GP.bonus?'Back to the road':'Back to games'}</button></div>`},
 close(silent){cancelAnimationFrame(GP.raf);GP.run=false;if(GP.el){GP.el.remove();GP.el=null}window.removeEventListener('resize',GP.onResize);document.removeEventListener('visibilitychange',GP.onVis);document.removeEventListener('keydown',GP.onKey);document.documentElement.classList.remove('ingame');GP.eng=null;if(!silent){ui.tab=GP.bonus?'road':'games';GP.bonus=false;render()}}};
