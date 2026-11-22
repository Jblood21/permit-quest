window.__PQ_VER="e5e7263b";

/* ---- x_00core.js ---- */
/* X core: the seam every src/x_*.js file builds on. Bundled first, unwrapped. Other x files run in their own
   try/catch block (let/const stay private; export through window or X).
   X.ver              build hash (same as the service worker cache suffix)
   X.err(name,e)      record + console.error a failure; list in X.errors
   X.wrap(path,mk)    replace a global function or method: X.wrap('finish',prev=>function(){...;return prev.apply(this,arguments)})
                      path may be 'render' or 'acts.stop'; works for let/const globals too
   X.after(fn)        run fn() after every render() (new DOM is in place). Keep fn idempotent and never call render() in it.
   X.modalOpen()      true while any known overlay is on screen (story card, chest, share card, level-up, town cards, reset dialog)
   X.modal(key,open,o) one modal at a time: runs open() now when nothing is open, otherwise queues it (dedupe by key, lower o.p first,
                      default 5; o.ok() false drops a stale entry; o.ttl ms, default 20000). open() must create its overlay synchronously. */
(function(){
  var X=window.X=window.X||{};
  X.ver=window.__PQ_VER||'dev';
  X.errors=X.errors||[];
  X.err=function(name,e){
    X.errors.push({n:name,m:String(e&&e.message||e),t:Date.now()});
    try{console.error('[x] '+name+': '+(e&&e.stack||e))}catch(_){}
  };
  var OK=/^[A-Za-z_$][\w$]*(\.[A-Za-z_$][\w$]*)*$/;
  X.wrap=function(path,mk){
    if(!OK.test(path)){X.err('wrap','bad path '+path);return false}
    var prev;
    try{prev=(0,eval)(path)}catch(e){X.err('wrap','unknown '+path);return false}
    if(typeof prev!=='function'){X.err('wrap',path+' is not a function');return false}
    var next=mk(prev);
    if(typeof next!=='function'){X.err('wrap',path+': wrapper did not return a function');return false}
    X._v=next;(0,eval)(path+'=X._v');X._v=null;return true;
  };
  var hooks=[],busy=false,armed=false;
  X.run=function(){
    if(busy)return;busy=true;
    try{for(var i=0;i<hooks.length;i++){try{hooks[i]()}catch(e){X.err('after',e)}}}finally{busy=false}
  };
  X.after=function(fn){
    hooks.push(fn);
    if(!armed){armed=true;X.wrap('render',function(prev){return function(){var r=prev.apply(this,arguments);X.run();return r}})}
  };
  X.boot=function(){setTimeout(X.run,0)};
  var MSEL='#xs-ov,.tdov,.fx3-ov,#twcar,#twpick,#twhome,#twsch,#rsm',mq=[],mt=0;
  X.modalOpen=function(){try{return !!document.querySelector(MSEL)}catch(e){return false}};
  function safe(f){try{return f()!==false}catch(e){return false}}
  function pump(){
    if(mt)return;
    mt=setInterval(function(){
      var now=Date.now();mq=mq.filter(function(m){return now-m.t<m.ttl&&(!m.ok||safe(m.ok))});
      if(!mq.length){clearInterval(mt);mt=0;return}
      if(X.modalOpen())return;
      var m=mq.shift();try{m.fn()}catch(e){X.err('modal '+m.k,e)}
    },200)}
  X.modal=function(key,fn,o){
    o=o||{};
    if(!mq.length&&!X.modalOpen()){try{fn()}catch(e){X.err('modal '+key,e)}return true}
    mq=mq.filter(function(m){return m.k!==key});
    mq.push({k:key,fn:fn,ok:o.ok,p:o.p==null?5:o.p,ttl:o.ttl||20000,t:Date.now()});
    mq.sort(function(a,b){return a.p-b.p||a.t-b.t});
    pump();return false};
})();


/* ---- x_daily.js ---- */
try{
/* Daily Drive share card (Wordle style, offline, no backend).
   Daily Drive = 3 shared questions (same for everyone on a date, ranked by hash of date + question id)
   + 2 personal weak ones. After finishing: emoji grid, streak, copy text, Web Share, 9:16 PNG via canvas.
   State: S.x.testday.dd = {date,day,grid:[1|0],streak}, showName, hideMiss. Once-per-day rule and +30 XP stay in app.js finish(). */
(function(){
'use strict';
var EPOCH='2026-11-01';          /* Day 1 */
var URLTXT='permit-quest.onrender.com';
function T(){S.x=S.x||{};var t=S.x.testday=S.x.testday||{};if(t.hideMiss===undefined)t.hideMiss=true;if(!t.log)t.log={};if(!t.seen)t.seen={};return t}
function dn(s){var p=s.split('-');return Math.round(Date.UTC(+p[0],+p[1]-1,+p[2])/864e5)}
function dayNo(d){return dn(d)-dn(EPOCH)+1}
function hs(s){var h=2166136261;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function q$(s,r){return(r||document).querySelector(s)}
/* deterministic: depends only on the date string and question ids, so every player gets the same 3 */
function sharedFor(d){
  var order=ALL.map(function(q){return[hs(d+'|'+q.id),q]}).sort(function(a,b){return a[0]-b[0]}).map(function(x){return x[1]});
  var out=[],used={};
  for(var i=0;i<order.length&&out.length<3;i++){var q=order[i];if(used[q.ch])continue;used[q.ch]=1;out.push(q)}
  return out}
window.pqSharedFor=sharedFor;
function personal(excl){
  var ex={};excl.forEach(function(q){ex[q.id]=1});
  var weak=ALL.filter(function(q){return !ex[q.id]&&isWeak(q.id)});
  var out=pick(weak,2);
  if(out.length<2){var rest=ALL.filter(function(q){return !ex[q.id]&&out.indexOf(q)<0});out=out.concat(pick(rest,2-out.length))}
  return out}
function startDailyShared(){
  if(S.daily===today()){toast('Daily Drive is done. Come back tomorrow.');return}
  var sh=sharedFor(today()),qs=sh.concat(personal(sh));
  startRun({mode:'daily',title:'Daily Drive',pool:ALL,qs:qs});
  if(ui.run){ui.run.sharedIds=sh.map(function(q){return q.id});render()}}

/* ---------- record the result ---------- */
X.wrap('finish',function(prev){return function(){
  var r=ui.run,ids=r&&r.mode==='daily'&&r.sharedIds,grid=ids&&ids.map(function(id){return r.first[id]?1:0});
  /* record before prev(): prev renders the result screen, and the share card hook needs dd in place */
  try{if(grid){var t=T();if(!t.dd||t.dd.date!==today()){t.dd={date:today(),day:dayNo(today()),grid:grid,streak:streakNow()};save()}}}catch(e){X.err('daily.finish',e)}
  return prev.apply(this,arguments)}});

/* ---------- share text and card ---------- */
function ddToday(){var d=T().dd;return d&&d.date===today()?d:null}
function nameOf(){return((S.avatar&&S.avatar.name)||S.name||'').trim().slice(0,20)}
function gridStr(d){var t=T();return d.grid.map(function(g){return g?'🟩':(t.hideMiss?'⬜':'🟥')}).join('')}
function shareText(d){
  var t=T(),nm=t.showName&&nameOf();
  return(nm?nm+' on ':'')+'Permit Quest Day '+d.day+'  '+gridStr(d)+'  streak '+d.streak+' 🔥  '+URLTXT}
function gridLabel(d){return'Shared questions: '+d.grid.map(function(g,i){return(i+1)+' '+(g?'right':(T().hideMiss?'not shown':'missed'))}).join(', ')}
function tog(act,on,label){return'<button class="tdtog" role="switch" aria-checked="'+on+'" data-act="'+act+'"><span>'+label+'</span><i></i></button>'}
function cardBody(d){
  var ok=d.grid.reduce(function(a,b){return a+b},0);
  return'<div class="tdgrid" role="img" aria-label="'+esc(gridLabel(d))+'">'+esc(gridStr(d))+'</div>'
   +'<p class="tdscore">'+ok+' of 3 shared questions right · streak '+d.streak+' 🔥</p>'
   +'<p class="tdtxt2" data-tdtext>'+esc(shareText(d))+'</p>'
   +'<div class="tdbtns"><button class="btn small primary" data-act="tdcopy">Copy text</button><button class="btn small ghost" data-act="tdshare">Share</button></div>'
   +'<button class="btn small line" data-act="tdimg">Make story image</button>'
   +tog('tdname',!!T().showName,'Add my name'+(nameOf()?' ('+esc(nameOf())+')':''))
   +tog('tdhide',!!T().hideMiss,'Hide my misses')}
function shareCard(d){return'<section class="card tdshare" aria-label="Share your Daily Drive"><h3>Share today\'s drive</h3><p class="muted">Everyone gets the same 3 questions today. Only what you pick below is shared.</p><div class="tdsbody">'+cardBody(d)+'</div></section>'}
function refresh(){var d=ddToday();if(!d)return;
  var b=q$('.tdsbody');if(b){var f=document.activeElement&&document.activeElement.getAttribute&&document.activeElement.getAttribute('data-act');
    b.innerHTML=cardBody(d);if(f){var e=q$('.tdsbody [data-act="'+f+'"]');if(e)e.focus({preventScroll:true})}}
  var o=q$('.tdov');if(o)drawPreview(d)}

/* ---------- canvas 9:16 image ---------- */
function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
function makeCanvas(d){
  var W=1080,H=1920,cv=document.createElement('canvas');cv.width=W;cv.height=H;var c=cv.getContext('2d'),t=T();
  var F='system-ui,-apple-system,"Segoe UI",Roboto,sans-serif';
  var g=c.createLinearGradient(0,0,W,H);g.addColorStop(0,'#efe6fb');g.addColorStop(.55,'#cdb8f0');g.addColorStop(1,'#f7b8d6');c.fillStyle=g;c.fillRect(0,0,W,H);
  c.fillStyle='rgba(255,255,255,.35)';c.beginPath();c.arc(930,200,260,0,7);c.fill();c.beginPath();c.arc(120,1700,320,0,7);c.fill();
  c.shadowColor='rgba(59,33,104,.25)';c.shadowBlur=60;c.shadowOffsetY=24;c.fillStyle='#fff';rr(c,90,430,900,1010,70);c.fill();
  c.shadowColor='transparent';c.textAlign='center';c.fillStyle='#3b2168';
  c.font='800 92px '+F;c.fillText('Permit Quest',540,590);
  c.fillStyle='#6b3fb0';c.font='700 64px '+F;c.fillText('Day '+d.day,540,680);
  var s=210,gap=45,x0=540-(3*s+2*gap)/2,y=770;
  d.grid.forEach(function(v,i){var x=x0+i*(s+gap),hide=!v&&t.hideMiss;
    c.fillStyle=v?'#17674a':hide?'#cdb8f0':'#c81e2d';rr(c,x,y,s,s,44);c.fill();
    c.strokeStyle='#fff';c.lineWidth=22;c.lineCap='round';c.lineJoin='round';c.beginPath();
    if(v){c.moveTo(x+55,y+110);c.lineTo(x+92,y+147);c.lineTo(x+158,y+68)}
    else if(!hide){c.moveTo(x+65,y+65);c.lineTo(x+145,y+145);c.moveTo(x+145,y+65);c.lineTo(x+65,y+145)}
    c.stroke()});
  var ok=d.grid.reduce(function(a,b){return a+b},0);
  c.fillStyle='#3b2168';c.font='800 78px '+F;c.fillText(ok+' of 3',540,1100);
  c.fillStyle='#5f4f86';c.font='600 48px '+F;c.fillText('shared questions today',540,1165);
  c.fillStyle='#3b2168';c.font='800 84px '+F;c.fillText('🔥 streak '+d.streak,540,1300);
  var nm=t.showName&&nameOf();if(nm){c.fillStyle='#6b3fb0';c.font='700 56px '+F;c.fillText(nm,540,1385)}
  c.fillStyle='#3b2168';c.font='700 46px '+F;c.fillText(URLTXT,540,1600);
  c.fillStyle='#5f4f86';c.font='500 38px '+F;c.fillText('Practice for the Utah written permit test',540,1660);
  return cv}
function toBlob(cv){return new Promise(function(res){try{cv.toBlob(function(b){res(b)},'image/png')}catch(e){res(null)}})}

/* ---------- overlay with the image ---------- */
var openerEl=null,urlNow=null;
function drawPreview(d){
  var box=q$('.tdov .tdpv');if(!box)return;
  var cv=makeCanvas(d);toBlob(cv).then(function(b){
    if(!b||!q$('.tdov'))return;if(urlNow)URL.revokeObjectURL(urlNow);urlNow=URL.createObjectURL(b);
    box.innerHTML='';var im=new Image();im.src=urlNow;im.alt='Your Daily Drive story image: '+gridLabel(d)+', streak '+d.streak;box.appendChild(im);box._blob=b})}
function closeOv(){var o=q$('.tdov');if(o)o.remove();if(urlNow){URL.revokeObjectURL(urlNow);urlNow=null}
  document.removeEventListener('keydown',ovKey,true);if(openerEl&&openerEl.focus&&document.contains(openerEl))openerEl.focus();openerEl=null}
function ovKey(e){var o=q$('.tdov');if(!o)return;
  if(e.key==='Escape'){e.preventDefault();closeOv();return}
  if(e.key==='Tab'){var f=[].slice.call(o.querySelectorAll('button,input')).filter(function(x){return !x.disabled});if(!f.length)return;
    var a=f[0],z=f[f.length-1];if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}}}
function openOv(){
  var d=ddToday();if(!d)return;closeOv();openerEl=document.activeElement;
  var o=document.createElement('div');o.className='tdov';o.setAttribute('role','dialog');o.setAttribute('aria-modal','true');o.setAttribute('aria-label','Story image');
  o.innerHTML='<div class="tdpanel"><div class="tdpv" aria-live="polite"><p class="muted">Making your image...</p></div>'
   +'<div class="tdbtns"><button class="btn small primary" data-act="tdshareimg">Share image</button><button class="btn small ghost" data-act="tdsave">Save image</button></div>'
   +tog('tdname',!!T().showName,'Add my name')+tog('tdhide',!!T().hideMiss,'Hide my misses')
   +'<button class="btn small line" data-act="tdclose">Close</button></div>';
  document.body.appendChild(o);document.addEventListener('keydown',ovKey,true);drawPreview(d);
  var b=q$('.tdclose,[data-act="tdclose"]',o);if(b)b.focus()}

/* ---------- actions ---------- */
function copyText(txt){
  if(navigator.clipboard&&navigator.clipboard.writeText)return navigator.clipboard.writeText(txt);
  return new Promise(function(res,rej){try{var a=document.createElement('textarea');a.value=txt;a.setAttribute('readonly','');a.style.cssText='position:fixed;left:-9999px;top:0;font-size:16px';document.body.appendChild(a);a.select();var ok=document.execCommand('copy');a.remove();ok?res():rej()}catch(e){rej(e)}})}
function toggle(k){var t=T();t[k]=!t[k];save();refresh();
  var on=document.querySelectorAll('.tdtog');for(var i=0;i<on.length;i++){var a=on[i].getAttribute('data-act'),v=a==='tdname'?t.showName:t.hideMiss;on[i].setAttribute('aria-checked',!!v)}}
Object.assign(acts,{
  daily:startDailyShared,
  tdcopy:function(){var d=ddToday();if(!d)return;copyText(shareText(d)).then(function(){toast('Copied. Paste it in a message.')},function(){toast('Press and hold the text to copy it')})},
  tdshare:function(){var d=ddToday();if(!d)return;var txt=shareText(d);
    if(navigator.share){navigator.share({title:'Permit Quest',text:txt}).catch(function(e){if(e&&e.name==='AbortError')return;acts.tdcopy()})}
    else acts.tdcopy()},
  tdimg:openOv,tdclose:closeOv,
  tdname:function(){toggle('showName')},tdhide:function(){toggle('hideMiss')},
  tdshareimg:function(){var d=ddToday(),b=q$('.tdov .tdpv');if(!d||!b||!b._blob){toast('One moment, the image is still being made.');return}
    var f;try{f=new File([b._blob],'permit-quest-day-'+d.day+'.png',{type:'image/png'})}catch(e){f=null}
    if(f&&navigator.canShare&&navigator.canShare({files:[f]})){navigator.share({files:[f],title:'Permit Quest'}).catch(function(e){if(!e||e.name!=='AbortError')toast('Press and hold the picture to save it')})}
    else toast('Sharing pictures is not available here. Use Save image, or press and hold the picture.')},
  tdsave:function(){var d=ddToday(),b=q$('.tdov .tdpv');if(!d||!b||!b._blob){toast('One moment, the image is still being made.');return}
    var u=URL.createObjectURL(b._blob),a=document.createElement('a');a.href=u;a.download='permit-quest-day-'+d.day+'.png';document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u)},4000);toast('Image saved')}
});

/* ---------- DOM hooks ---------- */
X.after(function(){
  var app=q$('#app');if(!app)return;
  /* run tags */
  if(ui.run&&ui.run.mode==='daily'&&ui.run.sharedIds&&!ui.run.phase){
    var item=ui.run.queue[ui.run.i],tag=q$('.qtag',app);
    if(item&&tag&&!q$('.tdtag',tag)){var k=ui.run.sharedIds.indexOf(item.q.id),s=document.createElement('span');s.className='tdtag';
      s.textContent=k>=0?'Shared question '+(k+1)+' of 3':'Picked for you';tag.appendChild(s)}}
  /* result */
  var d=ddToday();
  if(ui.result&&ui.result.mode==='daily'&&d){var res=q$('.res',app);
    if(res&&!q$('.tdshare',res)){var w=document.createElement('div');w.innerHTML=shareCard(d);var ft=q$('.resfoot',res);res.insertBefore(w.firstChild,ft||null)}}
  /* town */
  var m=q$('main');
  if(m&&!ui.run&&!ui.result&&!ui.lesson&&!ui.notes&&!ui.ob&&ui.tab==='road'){
    var o=m.querySelectorAll('.tdsharebar');for(var i=0;i<o.length;i++)o[i].remove();
    var row=q$('.twrow',m);
    if(d&&row){var b=document.createElement('div');b.className='tdsharebar';b.innerHTML='<button class="btn small line" data-act="tdimg">Share today\'s Daily card</button>';row.after(b)}}
});
})();

}catch(e){X.err("x_daily",e)}

/* ---- x_engage.js ---- */
try{
/* X engage: streak shield and milestones, coin economy (daily game cap, mastery coins, bonus level ceiling),
   first-car vs bonus-game ordering, supportive feedback after misses. State: S.x.engage only. */
(function(){
var CAP=60,AFTER=.25,MS=[[3,10,0],[7,20,1],[14,40,1],[30,80,0]],MAXSH=2;
function E(){var x=S.x&&typeof S.x==='object'?S.x:(S.x={});var e=x.engage&&typeof x.engage==='object'?x.engage:(x.engage={});
 e.shields=Math.max(0,Math.min(MAXSH,e.shields|0));if(!Array.isArray(e.ms))e.ms=[];if(!e.m||typeof e.m!=='object')e.m={};
 if(!e.gd||typeof e.gd!=='object')e.gd={d:'',c:0};e.gd.c=+e.gd.c||0;return e}
var dayDiff=function(a,b){return Math.round((new Date(b+'T00:00')-new Date(a+'T00:00'))/864e5)};
var reduced=function(){try{return matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){return false}};
var $q=function(s,r){return(r||document).querySelector(s)};

/* ---------- streak shield ---------- */
window.xShieldCover=function(){var e=E();return(S.last&&e.shields>0&&S.streak>0&&dayDiff(S.last,today())===2)?S.streak:0};
function banner(title,sub){
 var o=$q('.xmile');if(o)o.remove();
 var d=document.createElement('div');d.className='xmile';d.setAttribute('role','status');d.setAttribute('aria-live','polite');
 d.innerHTML='<b>'+esc(title)+'</b><span>'+esc(sub)+'</span>';
 d.addEventListener('click',function(){d.remove()});document.body.appendChild(d);
 setTimeout(function(){if(d.isConnected)d.remove()},3800)}
X.wrap('tick',function(prev){return function(){
 var t=today();if(S.last===t)return prev.apply(this,arguments);
 var e=E(),used=false;
 if(S.last&&S.streak>0&&e.shields>0&&dayDiff(S.last,t)===2){e.shields--;e.used=(e.used|0)+1;S.last=yest();used=true}
 var r=prev.apply(this,arguments);
 try{
  if(S.streak<=1)e.ms=[];
  if(used)toast('Your shield saved your streak');
  for(var i=0;i<MS.length;i++){var m=MS[i];
   if(S.streak===m[0]&&e.ms.indexOf(m[0])<0){e.ms.push(m[0]);S.coins=(S.coins||0)+m[1];
    var sh=m[2]&&e.shields<MAXSH;if(sh)e.shields++;
    banner(m[0]+' day streak',(sh?'+'+m[1]+' coins and a Streak Shield':'+'+m[1]+' coins'));
    if(window.sfx)window.sfx('coin')}}
  save()}catch(err){X.err('engage.tick',err)}
 return r}});

/* ---------- economy ---------- */
window.xGameNote='';
window.xGameCoins=function(L,stars){
 var e=E(),d=today();if(e.gd.d!==d)e.gd={d:d,c:0};
 var raw=2+Math.ceil(L/3)+stars,full=Math.max(0,Math.min(raw,CAP-e.gd.c)),rest=raw-full,coins=full+Math.round(rest*AFTER);
 if(coins<1)coins=1;e.gd.c+=full;
 window.xGameNote=rest>0?'<p class="muted xcapnote">Daily game coin limit reached. Games pay a quarter until tomorrow.</p>':'';
 return coins};
function capLine(){var e=E(),c=e.gd.d===today()?e.gd.c:0,p=Math.min(100,Math.round(c/CAP*100));
 return '<div class="xcap" role="group" aria-label="Game coins today"><div class="xcaph"><span>Game coins today</span><b>'+Math.min(c,CAP)+' of '+CAP+'</b></div><div class="xcapb" aria-hidden="true"><i style="width:'+p+'%"></i></div><small class="muted">'+(c>=CAP?'Limit reached. Games pay a quarter until tomorrow. Studying always pays full.':'Study runs always pay full coins.')+'</small></div>'}
X.wrap('srs',function(prev){return function(id,ok){
 var a0=(S.q[id]||[0])[0],r=prev.apply(this,arguments);
 try{var e=E(),a1=(S.q[id]||[0])[0],m=e.m[id]|0,add=0;if(a0>=3)m|=1;if(a0>=4)m|=2;
  if(a1>=3&&!(m&1)){m|=1;add+=2}if(a1>=4&&!(m&2)){m|=2;add+=1}
  if(m)e.m[id]=m;if(add){S.coins=(S.coins||0)+add;e.mc=(e.mc|0)+add}}catch(err){X.err('engage.srs',err)}
 return r}});
X.wrap('startRun',function(prev){return function(){try{E().mc=0}catch(e){}return prev.apply(this,arguments)}});
X.wrap('finish',function(prev){return function(){
 var r=prev.apply(this,arguments);
 try{var e=E(),x=ui.result;
  if(x){x.mc=e.mc|0;
   if(x.bonus){var cap={match:3,dash:4}[x.bonus.id];
    if(cap&&x.bonus.L>cap){var L=cap,st=(typeof gStars==='function'?gStars(x.bonus.id):[]);
     for(var l=x.bonus.L;l>cap;l--){if((st[l-1]||0)>=3){L=l;break}}
     x.bonus.L=L}}}
  e.mc=0;save()}catch(err){X.err('engage.finish',err)}
 return r}});

/* ---------- supportive feedback: count misses in a row before the answer renders ---------- */
X.wrap('answer',function(prev){return function(i){
 try{var r=ui.run;if(r&&!r.locked&&!isT(r.mode)&&r.phase!=='review'){var q=r.queue[r.i].q;r.mm=(r.opts[i]===q.a)?0:(r.mm|0)+1}}catch(e){}
 return prev.apply(this,arguments)}});

/* ---------- first car card before bonus game ---------- */
window.xResumeBonus=function(){setTimeout(function(){var d=IX.def;IX.def=null;if(!d||GP.el)return;
 GP.resSave=d.x;GP.drv=d.drv;ui.result=null;ui.tab='road';render();GP.open(d.b.id,d.b.L,true)},450)};
/* bonus countdown waits while a modal (level-up, first car, story card, share card) is on screen */
X.wrap('IX.launch',function(prev){return function(){
 if(X.modalOpen()&&window.IX&&!IX.timer){IX.timer=setTimeout(function(){IX.timer=0;IX.launch()},500);return}
 return prev.apply(this,arguments)}});
X.wrap('acts.twdrive',function(prev){return function(){var r=prev.apply(this,arguments);if(window.IX&&IX.def)window.xResumeBonus();return r}});
X.wrap('acts.twgarage',function(prev){return function(){if(window.IX)IX.def=null;return prev.apply(this,arguments)}});
(function(){var held=false;
 if(!('MutationObserver' in window))return;
 new MutationObserver(function(ms){ms.forEach(function(m){
  m.addedNodes.forEach(function(n){if(n.id==='twcar'&&typeof GP!=='undefined'&&GP.el&&GP.run&&!GP.paused){GP.paused=true;held=true}});
  m.removedNodes.forEach(function(n){if(n.id==='twcar'&&held){held=false;if(typeof GP!=='undefined'&&GP.el){GP.paused=false;GP.last=0}}})})}).observe(document.body,{childList:true})})();

/* ---------- render hooks ---------- */
X.after(function(){
 try{
  var e=E(),n=e.shields;
  var chip=$q('.chips .chip[aria-label*="streak"]');
  if(chip&&n>0&&!$q('.xsh',chip)){chip.classList.add('xhas');var i=document.createElement('i');i.className='xsh';i.setAttribute('aria-hidden','true');i.textContent='🛡️'+(n>1?n:'');chip.appendChild(i);
   chip.setAttribute('aria-label',(chip.getAttribute('aria-label')||'')+', '+n+(n>1?' streak shields':' streak shield'))}
  if(ui.tab==='me'&&!ui.run&&!ui.result&&!ui.lesson&&!ui.notes&&!ui.ob){var s3=$q('main .stat3');
   if(s3&&!$q('.xshcard')){var host=s3.closest('.card'),c=document.createElement('div');c.className='card xshcard';
    var nx=e.shields>=MAXSH?'You are holding the most you can.':(S.streak<7&&!e.ms.includes(7)?'Reach a 7 day streak for your first one.':(!e.ms.includes(14)?'Reach a 14 day streak for another.':'Keep your streak going to earn more at 7 and 14 days.'));
    c.innerHTML='<h3>Streak Shield</h3><div class="xshrow"><span class="xshic" aria-hidden="true">🛡️</span><div><b>'+n+' of '+MAXSH+' held</b><span class="muted">Miss exactly one day and a shield keeps your streak alive. '+nx+'</span></div></div>';
    if(host)host.after(c)}}
  if(ui.tab==='games'&&!ui.run&&!ui.result){var cb=$q('main .coinbar');if(cb&&!$q('.xcap')){var w=document.createElement('div');w.innerHTML=capLine();cb.after(w.firstChild)}}
  if(ui.result&&ui.result.mc>0){var g=$q('.res .gain');if(g&&!$q('.xmc',g)){var sp=document.createElement('span');sp.className='xmc';sp.textContent='🧠 +'+ui.result.mc+' mastery';g.appendChild(sp)}}
 }catch(err){X.err('engage.after',err)}});
try{render()}catch(e){X.err('engage.render',e)}
})();

}catch(e){X.err("x_engage",e)}

/* ---- x_pwa.js ---- */
try{
/* PWA robustness: update-ready toast, storage quota warning, persist request, version card in Me. */
var pending=null,swVer=null,lastCheck=0,store={},bar=null;
function inRun(){return typeof ui!=='undefined'&&!!ui.run}
function applyUpdate(){
  if(inRun()&&!confirm('Refreshing now leaves your current run. Refresh anyway?'))return;
  var w=pending;if(!w)return;
  var done=false;navigator.serviceWorker.addEventListener('controllerchange',function(){if(done)return;done=true;location.reload()});
  w.postMessage({type:'SKIP_WAITING'});
  setTimeout(function(){if(!done)location.reload()},4000);
}
function showBar(){
  if(bar||!pending||inRun())return;
  bar=document.createElement('div');bar.className='pqup';bar.setAttribute('role','status');
  bar.innerHTML='<span>Update ready</span><button type="button" class="pqupgo">Refresh</button><button type="button" class="pqupx" aria-label="Dismiss">×</button>';
  bar.querySelector('.pqupgo').onclick=applyUpdate;
  bar.querySelector('.pqupx').onclick=function(){bar.remove();bar=null;pending&&(pending._dismissed=true)};
  document.body.appendChild(bar);
}
function updateReady(w){pending=w;showBar();refreshCard()}
function watch(reg){
  if(reg.waiting&&navigator.serviceWorker.controller)updateReady(reg.waiting);
  reg.addEventListener('updatefound',function(){var w=reg.installing;if(!w)return;
    w.addEventListener('statechange',function(){if(w.state==='installed'&&navigator.serviceWorker.controller)updateReady(w)})});
  function check(){var n=Date.now();if(n-lastCheck<600000)return;lastCheck=n;reg.update().catch(function(){})}
  document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible')check()});
  window.addEventListener('online',check);
}
if('serviceWorker' in navigator&&location.protocol.indexOf('http')===0){
  navigator.serviceWorker.addEventListener('message',function(e){if(e.data&&e.data.type==='VERSION'){swVer=e.data.v;refreshCard()}});
  navigator.serviceWorker.ready.then(function(reg){watch(reg);if(navigator.serviceWorker.controller)navigator.serviceWorker.controller.postMessage({type:'GET_VERSION'})}).catch(function(e){X.err('pwa',e)});
}
/* storage */
function mb(n){return n>=1e9?(n/1e9).toFixed(1)+' GB':(n/1e6).toFixed(n<1e7?1:0)+' MB'}
function checkStorage(){
  var s=navigator.storage;if(!s)return;
  if(s.persist)s.persist().then(function(ok){store.persisted=ok;refreshCard()}).catch(function(){});
  else if(s.persisted)s.persisted().then(function(ok){store.persisted=ok;refreshCard()});
  if(s.estimate)s.estimate().then(function(r){
    store.usage=r.usage||0;store.quota=r.quota||0;refreshCard();
    var low=store.quota&&(store.usage/store.quota>0.8||store.quota-store.usage<20e6);
    if(low&&!sessionStorage.getItem('pqquota')){sessionStorage.setItem('pqquota','1');
      if(typeof toast==='function')toast('Your phone is almost out of storage. Free some space so your progress keeps saving.')}
  }).catch(function(){});
}
window.addEventListener('load',function(){setTimeout(checkStorage,1500)});
/* Me card */
function cardHTML(){
  var l=['App version <b>'+X.ver+'</b>'];
  if(swVer&&swVer!=='pq-'+X.ver)l.push('Saved copy: '+swVer.replace(/^pq-/,''));
  if(store.quota)l.push('Storage used: '+mb(store.usage)+' of '+mb(store.quota));
  if(store.persisted===false)l.push('Your phone may clear this app\'s data if it runs low on space. Back up your progress.');
  var up=pending?'<button class="btn small primary" data-pqupdate="1" style="margin-top:10px">Update ready: Refresh</button>':'';
  return '<h3>App</h3><p class="muted" style="margin:0">'+l.join('<br>')+'</p>'+up;
}
function refreshCard(){var c=document.getElementById('pqapp');if(c){c.innerHTML=cardHTML();bind(c)}}
function bind(c){var b=c.querySelector('[data-pqupdate]');if(b)b.onclick=applyUpdate}
X.after(function(){
  showBar();
  if(typeof ui==='undefined'||ui.run||ui.lesson||ui.result||ui.notes||ui.ob||ui.tab!=='me'||document.getElementById('pqapp'))return;
  var rs=document.querySelector('[data-act="reset"]');if(!rs)return;
  var c=document.createElement('div');c.className='card';c.id='pqapp';c.innerHTML=cardHTML();rs.parentNode.insertBefore(c,rs);bind(c);
});
X.pwa={state:function(){return{pending:!!pending,swVer:swVer,store:store}},check:checkStorage};

}catch(e){X.err("x_pwa",e)}

/* ---- x_story.js ---- */
try{
/* ROAD TRIP SEASON: story layer. Texts cards before and after each stop, daily quests with a chest,
   chapter-clear stickers (road trip scrapbook in Me), finale and epilogue.
   All story text lives in the STORY object below. Edit words there, nothing else needs to change.
   Message format: ['who','text']. who is tess, brin, king or me. Tokens: {n} exam length, {pct} pass percent.
   State: S.x.story only = {seen:{pre:{id:1},post:{id:1},fin,early,epi},st:{id:timestamp},q:{d,ids,p,claimed},chests,bf}.
   Seams used: X.after (DOM injection), X.wrap(answer, finish, startRun, GP.end), acts.* assignment. */
var STORY={
 name:'Road Trip Season',
 crew:'Road Trip Crew',
 cast:{
  tess:{name:'Tess',role:'Best friend',ring:'#ff7fb0',
   av:{outfit:'street',hairStyle:'ponytail',hairColor:'blonde',skin:'s2',eyes:'blue',top:'yellow',extras:['freckles'],glasses:'none',hat:'none'}},
  brin:{name:'Brinley',role:'Friendly rival',ring:'#e8a317',
   av:{outfit:'cheer',hairStyle:'braids',hairColor:'auburn',skin:'s3',eyes:'hazel',top:'green',extras:['hoops'],glasses:'none',hat:'none'}},
  king:{name:'Coach King',role:'Cheer coach',ring:'#0b7a3b',
   av:{outfit:'school',hairStyle:'bun',hairColor:'grey',skin:'s3',eyes:'brown',top:'green',extras:[],glasses:'round',hat:'fjhcap'}},
  me:{name:'You',role:'',ring:'#6b3fb0'}
 },
 legs:['Pre-season','Regular season','Regionals','State week'],
 ui:{
  textsLabel:'Texts',skip:'Skip ahead',go:'Let us go',stopOf:'Stop {i} of {n}',
  stickerNew:'New sticker',stickerBook:'Open scrapbook',
  scrapTitle:'Road trip scrapbook',scrapSub:'{n} of {t} stickers. Clear a stop to collect its sticker.',
  scrapLocked:'Clear this stop to collect its sticker.',close:'Close',
  finaleTitle:'State Finals',finaleGo:'Start State Finals',finaleBack:'Not yet',
  epiEyebrow:'Season complete',epiGo:'Open the scrapbook',epiBack:'Back to town',epiStat:'{n} of {t} stickers collected',
  qTitle:'Today\'s quests',qHint:'Finish all 3 to open a chest.',qReady:'All 3 done. Your chest is ready.',qOpen:'Open your chest',
  qClaimed:'Chest opened. New quests tomorrow.',qDone:'Quest done: {t}',qAll:'All 3 quests done. Your chest is waiting in Town.',
  chestTitle:'Quest chest',chestCoins:'{n} coins',chestFree:'Free: {name}',chestFind:'Find it in the Garage.',chestNice:'Nice',
  chestBonus:'Every cheap decal is yours already, so here is a bonus.'
 },
 quests:{
  ans:{t:'Answer 10 questions',n:10},
  game:{t:'Play one game',n:1},
  fix:{t:'Fix 3 mistakes',n:3},
  daily:{t:'Finish a Daily Drive',n:1},
  stop:{t:'Finish a stop quiz',n:1}
 },
 chest:{coins:30,bonusCoins:60},
 ch:{
  permit:{leg:0,loc:'License office',
   pre:[['king','The State Finals trip is on the calendar. Goal: get your permit before we leave so you can start logging driving hours.'],['tess','I am studying too. I brought a pen and snacks. The pen is for the forms.'],['brin','I already have a folder with tabs. See you at the finish line.']],
   post:[['tess','Stop one done. The route officially has its first dot.'],['king','Good start. Keep the goal small and the habit daily.']]},
  tests:{leg:0,loc:'Kitchen table',
   pre:[['tess','My mom found a form with the wrong date on it. We are fixing it with a very calm pen.'],['me','Same here. Paperwork night.'],['king','Read before you sign. Paperwork is not exciting, but it gets you to the real thing.']],
   post:[['brin','Forms done, folder updated. I am not saying I am ahead. I am saying there are tabs.'],['tess','Paperwork: beaten. Next stop, the school lot.']]},
  ready:{leg:0,loc:'FJH parking lot',
   pre:[['king','Pre-game checklist before any drive: seat, mirrors, belt. Same order every time.'],['tess','I moved my seat so far forward I could hug the steering wheel. Is that a setting?'],['me','I will start with the checklist.']],
   post:[['tess','Seat set, mirrors set, belt on. I feel like a pilot. A slow one.'],['king','Go Huskies. Habits win games and keep drivers safe.']]},
  basic:{leg:0,loc:'Cone course',
   pre:[['brin','Coach set up cones in the lot after practice. It is basically tryouts for driving.'],['tess','I have never been so afraid of a small orange triangle.'],['king','Smooth beats fast. Hands steady, eyes up. Nail the basics before anything fancy.']],
   post:[['brin','Not one cone down. I will say it out loud once: that was smooth.'],['king','Everything after this builds on the basics. Good work.']]},
  signs:{leg:1,loc:'Main Street',
   pre:[['tess','I made road sign flashcards. My yield sign looks like a slice of pizza.'],['brin','Mine are laminated.'],['tess','Of course they are.']],
   post:[['king','Shapes and colors tell you a lot before you read a single word. Good eye.'],['tess','The pizza yield sign is my favorite now. I will not be taking questions.']]},
  signals:{leg:1,loc:'Busy intersection',
   pre:[['tess','Friday night traffic at the big intersection. Everybody is in a hurry and there is a lot of honking.'],['brin','Someone honked at a car that was waiting for the green. The car was right.'],['king','A horn does not change a light. Learn the signals and the markings and you will not have to guess.']],
   post:[['tess','I know what the yellow lines mean now. I feel powerful.'],['king','Enjoy it for five minutes. Then back to the road.']]},
  rightway:{leg:1,loc:'Four-way stop',
   pre:[['tess','Four-way stop debate. I said I go first because I was there first.'],['brin','That is not how it works. There is an order.'],['king','Right-of-way is a rule, not a race. Learn the order, and when in doubt, wait.']],
   post:[['tess','The order makes sense now. Sorry to the imaginary car I cut off in my head.'],['brin','Apology accepted on behalf of all imaginary cars.']]},
  speed:{leg:1,loc:'School zone',
   pre:[['king','School zone on the way home from the game. The sign means what it says, even when you are in a hurry.'],['tess','It is getting dark and I can see about four feet. Is that normal?'],['brin','That is what headlights are for. Use them.']],
   post:[['tess','We got home at a calm speed. No tickets, no drama.'],['king','Speed and sight go together. Good choices tonight.']]},
  freeway:{leg:1,loc:'Interstate on-ramp',
   pre:[['tess','First time on the interstate with the Wasatch out the window. I am the navigator and the snack supplier.'],['me','Navigator means no steering from the passenger seat.'],['king','Merging: match the flow of traffic, check your gap, then commit. Decide early and stay smooth.']],
   post:[['tess','The mountains look unreal from up here. I am proud of us for not screaming.'],['brin','Nice merge. I will deny I said that.']]},
  alcohol:{leg:1,loc:'The plan',serious:true,
   pre:[['king','Serious one, team. Before the trip, everyone has a plan to get home safe. Never ride with a driver who has been drinking or using drugs, and never drive after either.'],['king','For anyone under 21, the limit is none. If your plan falls through, call a parent or another adult you trust, any time, day or night. A ride home is always the right call.'],['tess','My plan is saved in my phone. I will send it to the group.']],
   post:[['king','Good. The plan gets made before the night, not during it. Thank you for taking this seriously.']]},
  conditions:{leg:1,loc:'Canyon road',
   pre:[['tess','First snow on the canyon road. Everyone in the van went quiet. Even Brinley.'],['brin','I was not quiet. I was concentrating.'],['king','Phones in the glovebox, eyes up, speed down. Weather and distractions both take attention. Give the road all of it.']],
   post:[['tess','I am holding your phone until we park. You are welcome.'],['king','Good habit to build now. It matters on every drive after this one.']]},
  crash:{leg:1,loc:'Parking lot',
   pre:[['tess','Nobody panic. Someone backed into the team van in the parking lot. Nobody is hurt.'],['king','Check on everyone first. Then move to safety if you can, call for help if you need it, and exchange the right information. In that order.'],['me','Order. I can do order.']],
   post:[['tess','Everyone stayed calm and polite. We swapped information and shook hands. Very grown up.'],['king','Calm is a skill. You practiced it today.']]},
  points:{leg:2,loc:'Brinley\'s kitchen',
   pre:[['brin','Rough day. My brother got a ticket and now my whole family is learning what points are.'],['tess','That is rough. Do you want a snack or a distraction? I have both.'],['king','Tickets and points follow a driver for a long time. Let us learn from this one. Thank you for sharing, Brinley.']],
   post:[['brin','Thanks for not making it weird. I am going to be the most careful driver on the planet.'],['king','Careful is a winning record.']]},
  share:{leg:2,loc:'Bike trail',
   pre:[['tess','I borrowed a bike and I am riding next to the road. Some cars give me lots of room. Some do not.'],['king','Bikes, walkers and runners all share the road and the trail. Give space, look twice, and expect the unexpected.'],['me','Noted. I will pass wide.']],
   post:[['tess','One driver gave me so much room that I almost waved with both hands. I kept one on the handlebars.'],['brin','Everyone is going somewhere. Share the road and everyone gets there.']]},
  rail:{leg:2,loc:'Train crossing',
   pre:[['tess','The gates came down and everyone stopped. A long train went by. We counted cars.'],['brin','I counted 62 and lost track. It was very peaceful.'],['king','A train cannot stop quickly or swerve. When the signals flash, you stop and wait. Never try to beat a train.']],
   post:[['tess','Patience is a skill and we have it now.'],['king','A short wait is always the right call.']]},
  equip:{leg:2,loc:'Team van check',
   pre:[['king','Pre-trip check on the team van. Lights, tires, horn, wipers, mirrors. We check before every trip, not after a problem.'],['tess','I volunteer to test the horn. For safety.'],['brin','I volunteer to read the checklist. It is a very good checklist.']],
   post:[['tess','Horn works. The whole parking lot confirmed it.'],['king','Working equipment is part of driving well. Nice checking.']]},
  moto:{leg:3,loc:'Scooter corner',
   pre:[['brin','My cousin just got a scooter and wanted to give me a ride. I said maybe after State.'],['tess','Small vehicles are hard to spot. I watched one disappear behind a truck today.'],['king','Look twice for motorcycles and scooters, and give them a full lane. They are small, but there is a person on every one.']],
   post:[['tess','I checked my mirrors, then checked again. Found a scooter. We both looked relieved.'],['king','Check, then check again. That habit is worth more than it looks.']]},
  towing:{leg:3,loc:'Gear trailer',
   pre:[['king','The gear trailer comes to State. A trailer changes how a vehicle turns, stops and backs up, so we plan ahead.'],['tess','I just learned reflective triangles exist. I thought they were a kind of snack.'],['brin','They go out when a vehicle has to stop where other drivers do not expect it.']],
   post:[['tess','We set up the triangles in the lot and took a team photo. They look better than they sound.'],['king','Know where the warning devices are before you need them.']]},
  health:{leg:3,loc:'Last checklist',
   pre:[['tess','Got my vision checked today. I read the whole chart and the sign across the street.'],['king','Last checklist before State: vision, rest, and a clear head. Driving needs all three.'],['me','Checking all three.']],
   post:[['brin','Last stop. Whatever happens at State, you ran a clean route.'],['king','Rest up. Next up: State Finals.']]}
 },
 finale:{
  loc:'State Finals',
  pre:[['king','State Finals. {n} questions, and {pct} percent is the pass mark, the same as the real written test. One question at a time.'],['tess','I believe in you. I also brought snacks.'],['brin','Whatever the score, you earned your spot here.']],
  early:[['king','Strong score. A few stops on the road are still open. Clear them and the season is complete.']],
  fail:[
   [['king','A tough round is information, not a verdict. Review the misses, then go again.'],['tess','I will be at the finish line either way. Snacks included.']],
   [['brin','Every squad has a rough run before the good one. Reset and go again.'],['king','Fix three things, then try again.']],
   [['tess','That was a hard one. You know more than you did at the license office.'],['king','Progress counts. Review, rest, repeat.']]
  ],
  epi:{
   title:'Road Trip Season',
   msgs:[['tess','We did it. The whole route, start to finish.'],['brin','I was going to say I won. It was a tie. I accept that.'],['king','You set a goal and did the work. Honest part: this was practice. The real written test is next, so read the handbook and book it when you are ready. After that, log your supervised hours.']]
  }
 }
};

var ORDER=CHAPTERS.map(function(c){return c.id});
var ST_VB='10 6 100 110';

/* ---------- state ---------- */
function ST(){
 var x=(S.x&&typeof S.x==='object')?S.x:(S.x={});
 var s=(x.story&&typeof x.story==='object')?x.story:(x.story={});
 if(s.seen==='all')s.all=1; /* test seed flag: no story cards (same as S.x.skipIntros=true) */
 if(!s.seen||typeof s.seen!=='object')s.seen={};
 if(!s.seen.pre)s.seen.pre={};if(!s.seen.post)s.seen.post={};
 if(!s.st||typeof s.st!=='object')s.st={};
 if(!s.q||typeof s.q!=='object')s.q={};
 s.chests=s.chests|0;
 return s}
function rm(){try{return matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){return false}}
function skipIntros(){return !!(S.x&&S.x.skipIntros===true)||!!ST().all}
function qs(sel,root){return(root||document).querySelector(sel)}
function sub(t){return String(t).replace('{n}',EXAM_N).replace('{pct}',Math.round(PASS*100))}
function fmt(t,o){return String(t).replace(/\{(\w+)\}/g,function(m,k){return o&&k in o?o[k]:m})}
function idx(id){return ORDER.indexOf(id)}
function beat(id){return STORY.ch[id]}
function nClear(){var s=ST();return ORDER.filter(function(id){return id in s.st}).length}
function allClear(){return nClear()===ORDER.length}
function examPassed(){return(S.exams||[]).some(function(e){return e.s/e.n>=PASS})}

/* one-time backfill: stops cleared before this feature existed get their sticker quietly */
function backfill(){
 var s=ST();if(s.bf)return;s.bf=1;
 ORDER.forEach(function(id){if(stars(id)>=1&&!(id in s.st)){s.st[id]=0;s.seen.post[id]=1}});
 save()}

/* ---------- portraits ---------- */
var faces={};
function face(who){
 if(faces[who])return faces[who];
 var c=STORY.cast[who],h='';
 try{
  if(who==='me'){h=avatarSVG(AV_(),ST_VB,'xs-svg')}
  else h=avatarSVG(c.av,ST_VB,'xs-svg');
  h=h.replace(/ role="img" aria-label="[^"]*"/,' aria-hidden="true"')
 }catch(e){h='<span class="xs-init">'+esc((c&&c.name||'?').charAt(0))+'</span>'}
 return who==='me'?h:(faces[who]=h)}
function av(who){return '<span class="xs-av" style="--ring:'+STORY.cast[who].ring+'" aria-hidden="true">'+face(who)+'</span>'}
function faceRow(list){return '<span class="xs-faces" aria-hidden="true">'+list.map(av).join('')+'</span>'}

/* ---------- thread markup ---------- */
function rowsHTML(msgs){
 var prev='',o='';
 msgs.forEach(function(m,i){
  var who=m[0],c=STORY.cast[who],me=who==='me',first=who!==prev;prev=who;
  o+='<div class="xs-row'+(me?' me':'')+(first?' first':'')+'" data-i="'+i+'"><span class="xs-sr">'+esc(c.name)+': </span>'
   +(me?'':'<span class="xs-avw">'+(first?av(who):'')+'</span>')
   +'<div class="xs-col">'+(first&&!me?'<span class="xs-who">'+esc(c.name)+'</span>':'')+'<div class="xs-b">'+esc(sub(m[1]))+'</div></div></div>'});
 return o}

/* ---------- texts card (overlay) ---------- */
var openOv=null;
function closeCard(){var o=document.getElementById('xs-ov');if(o){if(o._t)clearTimeout(o._t);if(o._k)document.removeEventListener('keydown',o._k);o.remove()}
 var f=openOv&&openOv.focus;openOv=null;if(f&&f.isConnected){try{f.focus({preventScroll:true})}catch(e){}}}
/* opts: msgs, eyebrow, title, sub, faces[], go, back, onGo, onBack, extra(html), serious */
function showCard(o){
 closeCard();
 var ov=document.createElement('div');ov.id='xs-ov';ov.className='xs-ov';
 var msgs=o.msgs||[];
 ov.innerHTML='<div class="xs-card'+(o.serious?' serious':'')+'" role="dialog" aria-modal="true" aria-label="'+esc(STORY.ui.textsLabel+': '+(o.title||STORY.crew))+'">'
  +'<div class="xs-hd">'+faceRow(o.faces||['tess','brin','king'])
  +'<div class="xs-ttl"><span class="xs-eyebrow">'+esc(o.eyebrow||STORY.ui.textsLabel)+'</span><b>'+esc(o.title||STORY.crew)+'</b>'+(o.sub?'<small>'+esc(o.sub)+'</small>':'')+'</div></div>'
  +'<div class="xs-thread" aria-live="polite">'+rowsHTML(msgs)+'</div>'
  +(o.extra?'<div class="xs-extra">'+o.extra+'</div>':'')
  +'<div class="xs-foot"><button type="button" class="btn primary xs-go"></button>'+(o.back?'<button type="button" class="btn line xs-back">'+esc(o.back)+'</button>':'')+'</div></div>';
 document.body.appendChild(ov);
 var rows=[].slice.call(ov.querySelectorAll('.xs-row')),go=qs('.xs-go',ov),thread=qs('.xs-thread',ov),done=false,i=0,typing=null;
 openOv={focus:document.activeElement};
 function label(){go.textContent=done?(o.go||STORY.ui.go):STORY.ui.skip}
 function showRow(r){r.classList.add('on');r.removeAttribute('aria-hidden');thread.scrollTop=thread.scrollHeight}
 function finishAll(){if(ov._t)clearTimeout(ov._t);if(typing){typing.remove();typing=null}rows.forEach(showRow);done=true;ov.classList.add('done');label()}
 function step(){
  if(!ov.isConnected)return;
  if(i>=rows.length){finishAll();return}
  var r=rows[i],who=msgs[i][0],me=who==='me';
  typing=document.createElement('div');typing.className='xs-row xs-typing on'+(me?' me':'');typing.setAttribute('aria-hidden','true');
  typing.innerHTML=(me?'':'<span class="xs-avw">'+av(who)+'</span>')+'<div class="xs-col"><div class="xs-b"><i></i><i></i><i></i></div></div>';
  thread.appendChild(typing);thread.scrollTop=thread.scrollHeight;
  ov._t=setTimeout(function(){if(!ov.isConnected)return;typing.remove();typing=null;showRow(r);i++;ov._t=setTimeout(step,260)},me?380:620)}
 rows.forEach(function(r){r.setAttribute('aria-hidden','true')});
 if(rm()||msgs.length===0){finishAll()}else{label();step()}
 go.onclick=function(){if(!done){finishAll();return}closeCard();if(o.onGo)o.onGo()};
 var back=qs('.xs-back',ov);if(back)back.onclick=function(){closeCard();if(o.onBack)o.onBack()};
 ov._k=function(e){if(e.key==='Escape'){e.stopPropagation();if(!done){finishAll();return}closeCard();if(o.onBack)o.onBack()}};
 document.addEventListener('keydown',ov._k);
 try{go.focus({preventScroll:true})}catch(e){}
 return ov}

/* ---------- before a stop: texts card over the lesson ---------- */
function preCard(id){
 var b=beat(id),s=ST();if(!b||s.seen.pre[id])return;
 if(skipIntros()){s.seen.pre[id]=1;save();return}
 var ok=function(){return !!ui.lesson&&ui.lesson.ch===id&&!ui.run&&!ui.result&&!ST().seen.pre[id]};
 X.modal('xs-pre-'+id,function(){
  if(!ok())return;s.seen.pre[id]=1;save();
  showCard({msgs:b.pre,eyebrow:fmt(STORY.ui.stopOf,{i:idx(id)+1,n:ORDER.length})+' · '+STORY.legs[b.leg],title:STORY.crew,sub:b.loc,serious:!!b.serious,go:STORY.ui.go})},{p:3,ok:ok})}
X.after(function(){
 if(!ui.lesson||ui.run||ui.result||ui.ob||document.getElementById('xs-ov'))return;
 var id=ui.lesson.ch;if(id&&beat(id)&&!ST().seen.pre[id])preCard(id)});

/* ---------- after a stop: reaction + sticker inline on the result screen ---------- */
function stampHTML(i,on,cls){
 var c=CHAPTERS[i],b=beat(c.id),rot=((i*37)%9)-4;
 return '<span class="xs-st leg'+b.leg+(on?' on':' off')+(cls?' '+cls:'')+'" style="--r:'+rot+'deg" aria-hidden="true"><i>'+(on?c.icon:'')+'</i><b>'+(i+1)+'</b></span>'}
function buildResult(x){
 var s=ST(),o={kind:null};
 if(x.mode==='stop'&&x.chapter&&beat(x.chapter)&&x.stars>=1){
  var id=x.chapter,fresh=!(id in s.st);
  if(fresh)s.st[id]=Date.now();
  var lines=s.seen.post[id]?null:beat(id).post;s.seen.post[id]=1;
  if(fresh||lines)save();
  o={kind:'stop',id:id,fresh:fresh,lines:lines,first:true}
 }else if(x.mode==='exam'){
  if(x.pass){
   if(!allClear()&&!s.seen.early){s.seen.early=1;save();o={kind:'exam',lines:STORY.finale.early,first:true}}
  }else{var f=STORY.finale.fail;o={kind:'exam',lines:f[(S.exams||[]).length%f.length],first:true}}
 }
 return o}
X.after(function(){
 var x=ui.result;if(!x||ui.run)return;
 if(!x._xs)x._xs=buildResult(x);
 var o=x._xs;if(!o.kind||(!o.lines&&!o.fresh))return;
 var host=qs('#app .res .resh');if(!host||qs('#app .xs-res'))return;
 var i=o.kind==='stop'?idx(o.id):-1,anim=o.first&&!rm();o.first=false;
 var c=document.createElement('div');c.className='card xs-res'+(anim?' anim':'');c.setAttribute('role','group');c.setAttribute('aria-label','Texts from the squad');
 c.innerHTML='<div class="xs-reshd">'+faceRow(['tess','brin','king'])+'<span class="xs-ttl"><span class="xs-eyebrow">'+esc(STORY.ui.textsLabel)+'</span><b>'+esc(STORY.crew)+'</b></span></div>'
  +(o.lines?'<div class="xs-thread xs-static">'+rowsHTML(o.lines).replace(/class="xs-row/g,'class="xs-row on')+'</div>':'')
  +(o.kind==='stop'?'<div class="xs-reward">'+stampHTML(i,true,o.fresh&&anim?'pop':'')+'<span class="xs-rt"><b>'+esc(o.fresh?STORY.ui.stickerNew:STORY.ui.scrapTitle)+'</b><span class="muted">'+esc(beat(o.id).loc)+' · '+nClear()+' of '+ORDER.length+'</span></span><button type="button" class="btn small ghost xs-book" data-act="xsbook">'+esc(STORY.ui.stickerBook)+'</button></div>':'');
 host.parentNode.insertBefore(c,host.nextSibling);
 if(anim)setTimeout(function(){if(c.isConnected&&window.scrollY<40){var r=c.getBoundingClientRect(),ft=qs('.resfoot'),lim=ft?ft.getBoundingClientRect().top:innerHeight,y=Math.min(r.top-90,r.bottom-lim+12);if(y>40)window.scrollBy({top:y,behavior:'smooth'})}},900)});

/* ---------- finale: texts before the mock exam, epilogue after ---------- */
X.wrap('startRun',function(prev){return function(o){
 var s=ST(),self=this,args=arguments;
 if(o&&o.mode==='exam'&&stars(ORDER[ORDER.length-1])>=1&&!s.seen.fin&&skipIntros()){s.seen.fin=1;save()}
 if(o&&o.mode==='exam'&&stars(ORDER[ORDER.length-1])>=1&&!s.seen.fin&&!X.modalOpen()){
  s.seen.fin=1;save();
  showCard({msgs:STORY.finale.pre,eyebrow:STORY.legs[3],title:STORY.ui.finaleTitle,sub:STORY.crew,go:STORY.ui.finaleGo,back:STORY.ui.finaleBack,onGo:function(){prev.apply(self,args)}});
  return}
 return prev.apply(this,arguments)}});
function epilogue(){
 var s=ST();if(s.epi)return;s.epi=1;save();if(skipIntros())return;
 var e=STORY.finale.epi,n=nClear();
 var stats='<div class="xs-epi"><div class="xs-epist">'+ORDER.map(function(id,i){return stampHTML(i,id in s.st)}).join('')+'</div><b>'+esc(fmt(STORY.ui.epiStat,{n:n,t:ORDER.length}))+'</b></div>';
 showCard({msgs:e.msgs,eyebrow:STORY.ui.epiEyebrow,title:e.title,sub:STORY.crew,faces:['tess','brin','king','me'],extra:stats,go:STORY.ui.epiGo,back:STORY.ui.epiBack,
  onGo:function(){ui.result=null;ui.tab='me';render();window.scrollTo(0,0);setTimeout(function(){var el=document.getElementById('xs-scrap');if(el)el.scrollIntoView({block:'start',behavior:rm()?'auto':'smooth'})},60)},
  onBack:function(){if(ui.result){ui.result=null;ui.tab='road';render();window.scrollTo(0,0)}}})}
X.after(function(){
 if(ui.run||ui.lesson||ui.ob||ui.notes||document.getElementById('xs-ov'))return;
 var s=ST();if(s.epi||!allClear()||!examPassed())return;
 var x=ui.result,go=function(){if(!ST().epi)epilogue()};
 if(x){if(x.mode!=='exam'||!x.pass)return;var held=x;setTimeout(function(){if(ui.result===held&&!document.getElementById('xs-ov'))X.modal('xs-epi',go,{p:3,ok:function(){return ui.result===held&&!ST().epi}})},rm()?200:1600)}
 else if(ui.tab==='road')X.modal('xs-epi',go,{p:3,ok:function(){return ui.tab==='road'&&!ui.result&&!ST().epi}})});

/* ---------- scrapbook (Me tab) ---------- */
function scrapHTML(){
 var s=ST(),n=nClear();
 return '<div class="card xs-scrap" id="xs-scrap"><h3>'+esc(STORY.ui.scrapTitle)+'</h3><p class="muted" style="margin:0 0 10px">'+esc(fmt(STORY.ui.scrapSub,{n:n,t:ORDER.length}))+'</p><div class="xs-grid">'
  +ORDER.map(function(id,i){var on=id in s.st,b=beat(id);
   return '<button type="button" class="xs-cell" data-act="xsst" data-v="'+id+'" aria-label="Sticker '+(i+1)+', '+esc(b.loc)+(on?', collected':', not collected yet')+'">'+stampHTML(i,on)+'<span class="xs-lbl">'+esc(b.loc)+'</span></button>'}).join('')+'</div></div>'}
X.after(function(){
 if(ui.tab!=='me'||ui.run||ui.lesson||ui.result||ui.ob||ui.notes)return;
 var m=qs('#app > main');if(!m||qs('.xs-scrap',m))return;
 var host=null;[].slice.call(m.querySelectorAll('.card > h3')).forEach(function(h){if(!host&&/^Badges$/.test(h.textContent.trim()))host=h.parentNode});
 var tmp=document.createElement('div');tmp.innerHTML=scrapHTML();var el=tmp.firstChild;
 if(host)host.parentNode.insertBefore(el,host);else{var hero=qs('.mehero',m);if(hero)hero.parentNode.insertBefore(el,hero.nextSibling);else m.appendChild(el)}});
acts.xsst=function(id){
 var s=ST(),b=beat(id);if(!b)return;
 if(!(id in s.st)){toast(STORY.ui.scrapLocked);return}
 var i=idx(id),c=CHAPTERS[i];
 showCard({msgs:b.post,eyebrow:fmt(STORY.ui.stopOf,{i:i+1,n:ORDER.length})+' · '+STORY.legs[b.leg],title:b.loc,sub:c.name,go:STORY.ui.close,
  extra:'<div class="xs-big">'+stampHTML(i,true)+'</div>'})};
acts.xsbook=function(){
 ui.result=null;ui.tab='me';render();window.scrollTo(0,0);
 setTimeout(function(){var el=document.getElementById('xs-scrap');if(el)el.scrollIntoView({block:'start',behavior:rm()?'auto':'smooth'})},60)};

/* ---------- daily quests + chest ---------- */
function qroll(){
 var s=ST(),q=s.q,t=today();
 if(q.d===t&&Array.isArray(q.ids))return q;
 var weak=0;for(var i=0;i<ALL.length;i++)if(isWeak(ALL[i].id))weak++;
 var ids=['ans','game',weak>=3?'fix':(S.daily!==t?'daily':'stop')];
 q=s.q={d:t,ids:ids,p:{ans:0,game:0,fix:0,daily:0,stop:0},claimed:0};save();return q}
function qdone(q){return q.ids.filter(function(k){return q.p[k]>=STORY.quests[k].n}).length}
function qinc(k,n){
 var q=qroll();if(q.ids.indexOf(k)<0||n<=0)return;
 var d=STORY.quests[k],was=q.p[k]|0;if(was>=d.n)return;
 q.p[k]=Math.min(d.n,was+n);save();
 if(q.p[k]>=d.n){toast(qdone(q)===3?STORY.ui.qAll:fmt(STORY.ui.qDone,{t:d.t}))}}
X.wrap('answer',function(prev){return function(i){
 var r=ui.run,pre=null;
 if(r&&!r.locked&&!r.phase&&!isT(r.mode)&&r.queue[r.i]){var it=r.queue[r.i];pre={retry:!!it.retry,weak:isWeak(it.q.id)}}
 var out=prev.apply(this,arguments);
 try{if(pre&&r.locked&&r.last){qinc('ans',1);if(!pre.retry&&pre.weak&&r.last.ok)qinc('fix',1)}}catch(e){X.err('story.answer',e)}
 return out}});
X.wrap('finish',function(prev){return function(){
 var r=ui.run,info=null;
 try{if(r){var t=isT(r.mode);info={mode:r.mode,n:r.queue.length,t:t,weak:t?r.queue.filter(function(x){return isWeak(x.q.id)}).map(function(x){return x.q.id}):[]}}}catch(e){}
 var out=prev.apply(this,arguments);
 try{if(info){
  if(info.t){qinc('ans',info.n);var f=0;info.weak.forEach(function(id){if(r.first&&r.first[id])f++});qinc('fix',f)}
  if(info.mode==='daily')qinc('daily',1);
  if(info.mode==='stop')qinc('stop',1)}}catch(e){X.err('story.finish',e)}
 return out}});
X.wrap('GP.end',function(prev){return function(){
 var had=!!(typeof GP!=='undefined'&&GP.eng);
 var out=prev.apply(this,arguments);
 if(had)try{qinc('game',1)}catch(e){X.err('story.game',e)}
 return out}});

function questHTML(){
 var q=qroll(),n=qdone(q),all=n===3;
 var rows=q.ids.map(function(k){var d=STORY.quests[k],p=Math.min(d.n,q.p[k]|0),ok=p>=d.n;
  return '<li class="xq-r'+(ok?' ok':'')+'"><span class="xq-c" aria-hidden="true">'+(ok?'<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>':'')+'</span>'
   +'<span class="xq-t">'+esc(d.t)+'<span class="sr-only">'+(ok?', done':'')+'</span></span><em>'+p+'/'+d.n+'</em><span class="xq-bar" aria-hidden="true"><b style="width:'+Math.round(p/d.n*100)+'%"></b></span></li>'}).join('');
 var foot=q.claimed?'<p class="muted xq-note">'+esc(STORY.ui.qClaimed)+'</p>':all?'<button type="button" class="btn primary xq-open" data-act="xqchest">'+chestSVG(true)+'<span>'+esc(STORY.ui.qOpen)+'</span></button>':'<p class="muted xq-note">'+esc(STORY.ui.qHint)+'</p>';
 return '<div class="card xq'+(all&&!q.claimed?' ready':'')+'" role="group" aria-label="'+esc(STORY.ui.qTitle)+'"><div class="xq-h"><b>'+esc(STORY.ui.qTitle)+'</b><span class="xq-n">'+n+'/3</span></div><ul class="xq-l">'+rows+'</ul>'+foot+'</div>'}
X.after(function(){
 if(ui.tab!=='road'||ui.run||ui.lesson||ui.result||ui.ob||ui.notes||ui.sheet)return;
 var m=qs('#app > main');if(!m||qs('.xq',m)||!S.avatar)return;
 var tmp=document.createElement('div');tmp.innerHTML=questHTML();var el=tmp.firstChild;
 var cta=qs('.card.cta',m);if(cta)cta.parentNode.insertBefore(el,cta.nextSibling);else m.insertBefore(el,m.firstChild)});

function chestSVG(small){
 return '<svg class="xc-svg'+(small?' small':'')+'" viewBox="0 0 120 100" aria-hidden="true"><g class="xc-body"><rect x="14" y="48" width="92" height="44" rx="8" fill="#8a5a34"/><rect x="14" y="62" width="92" height="6" fill="#6e4524"/><rect x="50" y="56" width="20" height="26" rx="4" fill="#ffc61a" stroke="#d9a200" stroke-width="2"/><circle cx="60" cy="68" r="3" fill="#6e4524"/><path d="M26 48v44M94 48v44" stroke="#ffc61a" stroke-width="5"/></g><g class="xc-lid"><path d="M14 48 Q14 20 60 20 Q106 20 106 48Z" fill="#a8693b"/><path d="M26 46 Q28 28 60 28" stroke="#c98a58" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M26 46v-18M94 46v-18" stroke="#ffc61a" stroke-width="5"/><rect x="14" y="44" width="92" height="7" rx="3" fill="#ffc61a"/></g></svg>'}
function pickReward(){
 var s=ST(),vo=(window.VEH&&VEH.decals)||[],own=function(k,id){return typeof owns==='function'?owns(k,id):!!(S.own&&S.own[k+':'+id])};
 var items=vo.map(function(id){return typeof itemOf==='function'?itemOf('up',id):null}).filter(function(it){return it&&!own('up',it.id)});
 var cheap=items.filter(function(it){return it.p<=45});
 if(cheap.length){var it=cheap[s.chests%cheap.length];return{k:'up',id:it.id,name:it.n}}
 if(!own('carColor','holo')){var c=typeof itemOf==='function'&&itemOf('carColor','holo');return{k:'carColor',id:'holo',name:(c&&c.n)||'Holo'}}
 if(items.length){var j=items[s.chests%items.length];return{k:'up',id:j.id,name:j.n}}
 return null}
function openChest(){
 var s=ST(),q=qroll();
 if(q.claimed||qdone(q)<3||document.getElementById('xs-ov'))return;
 var rw=pickReward(),coins=rw?STORY.chest.coins:STORY.chest.bonusCoins;
 q.claimed=1;s.chests++;
 S.coins=(S.coins||0)+coins;
 if(rw){S.own=S.own||{};S.own[rw.k+':'+rw.id]=1}
 save();
 var car='';try{var a=Object.assign({},AV_());if(rw){if(rw.k==='up')a.up=[rw.id];else a.carColor=rw.id}car=carSVG(a,'xc-car')}catch(e){}
 var ov=document.createElement('div');ov.id='xs-ov';ov.className='xs-ov xc-ov';
 ov.innerHTML='<div class="xs-card xc-card" role="dialog" aria-modal="true" aria-label="'+esc(STORY.ui.chestTitle)+'"><p class="xs-eyebrow">'+esc(STORY.ui.chestTitle)+'</p>'
  +'<div class="xc-stage'+(rm()?' open':'')+'">'+chestSVG(false)+'<div class="xc-glow" aria-hidden="true"></div></div>'
  +'<div class="xc-loot" aria-live="polite"><h2>+'+esc(fmt(STORY.ui.chestCoins,{n:coins}))+'</h2>'
  +(rw?'<div class="xc-free"><div class="xc-carbox">'+car+'</div><b>'+esc(fmt(STORY.ui.chestFree,{name:rw.name}))+'</b><span class="muted">'+esc(STORY.ui.chestFind)+'</span></div>':'<p class="muted">'+esc(STORY.ui.chestBonus)+'</p>')+'</div>'
  +'<button type="button" class="btn primary xc-ok" disabled>'+esc(STORY.ui.chestNice)+'</button></div>';
 document.body.appendChild(ov);
 var st=qs('.xc-stage',ov),ok=qs('.xc-ok',ov),prevF=document.activeElement;
 function reveal(){st.classList.add('open');ov.classList.add('shown');ok.disabled=false;try{ok.focus({preventScroll:true})}catch(e){}if(window.sfx){try{window.sfx('win')}catch(e){}}}
 function close(){document.removeEventListener('keydown',kd);ov.remove();render();if(prevF&&prevF.isConnected){try{prevF.focus({preventScroll:true})}catch(e){}}}
 function kd(e){if(e.key==='Escape'&&!ok.disabled)close()}
 document.addEventListener('keydown',kd);
 ok.onclick=close;
 if(rm()){ov.classList.add('shown');ok.disabled=false;try{ok.focus({preventScroll:true})}catch(e){}}
 else{st.classList.add('shake');setTimeout(function(){if(ov.isConnected)reveal()},1000)}
 render()}
acts.xqchest=function(){try{openChest()}catch(e){X.err('story.chest',e)}};

/* ---------- header chest chip: the Town auto-scrolls to the marker, so a ready daily chest needs a pointer that is always on screen ---------- */
X.after(function(){
 var row=qs('header.top .chips');if(!row||ui.run||ui.lesson||ui.result||ui.ob||ui.notes)return;
 var q=ST().q,ready=!!(q&&Array.isArray(q.ids)&&!q.claimed&&qdone(q)>=3)&&S.avatar,chip=qs('.xq-chip',row);
 if(!ready){if(chip)chip.remove();return}
 if(chip)return;
 chip=document.createElement('button');chip.type='button';chip.className='chip xq-chip';chip.setAttribute('data-act','xqchest');
 chip.setAttribute('aria-label',STORY.ui.qOpen);chip.innerHTML=chestSVG(true);row.insertBefore(chip,row.firstChild)});

/* ---------- boot ---------- */
try{backfill();qroll()}catch(e){X.err('story.boot',e)}
X.story={data:STORY,state:ST,quests:qroll,qinc:qinc,card:showCard,pre:preCard,epilogue:epilogue,openChest:openChest,reward:pickReward,count:nClear};

}catch(e){X.err("x_story",e)}

/* ---- x_testday.js ---- */
try{
/* Test day (WP6): exam date countdown, minutes-a-day plan, predicted-score readiness, blueprint mock exam,
   weakest-topic drills, due-today review, cram mode. State lives in S.x.testday only.
   Seams used: X.after (DOM injection after every render), X.wrap(srs, finish), acts.* assignment.
   The pure model block (between the PURE markers) has no DOM or app access and is unit-tested in node. */
(function(){
'use strict';
/*PURE-START*/
var TDM=(function(){
  /* Mock exam blueprint from audit/content_lint.md (sum 50). */
  var BP={permit:4,tests:2,ready:2,basic:4,signs:3,signals:3,rightway:3,speed:2,freeway:2,alcohol:3,conditions:4,crash:3,points:2,share:4,rail:2,equip:2,moto:2,towing:1,health:2};
  var INT=[1,1,3,7,14];                       /* Leitner-style days until a question is due, by mastery level 0..4 */
  function hs(s){var h=2166136261;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
  function rng(a){return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
  /* 'YYYY-MM-DD' to whole day number, UTC based so DST never shifts it */
  function dnum(s){var p=String(s).split('-');return Math.round(Date.UTC(+p[0],+p[1]-1,+p[2])/864e5)}
  /* One question: chance she gets it right on test day, and how unsure we are (u).
     a=[mastery level 0..4, times right, times wrong]; age=days since last answered (null if unknown). */
  function qp(a,age){
    var lv=Math.max(0,Math.min(4,a[0]|0)),r=a[1]|0,w=a[2]|0,n=r+w;
    if(n===0)return{p:.42,u:.22};
    var prior=[.45,.58,.72,.84,.92][lv],acc=(r+1)/(n+2),k=Math.min(n,6),p=(prior*3+acc*k)/(3+k);
    if(age!=null&&age>7&&p>.5){var f=Math.min(.35,(age-7)/80);p=.5+(p-.5)*(1-f)}
    var u=n>=6?.07:n>=3?.11:n===2?.16:.2;
    if(age!=null&&age>14)u+=.04;
    return{p:p,u:u}}
  /* Simulate blueprint mocks. chs=[{id,ps:[{p,u}]}]. Deterministic for a given seed.
     Range = 10th to 90th percentile of simulated scores. Each simulated exam shifts every chapter by a shared
     uncertainty draw, so little data gives a wide range and lots of data a narrow one. */
  function predict(chs,bp,seed,sims){
    var R=rng(seed),tot=0,pre=[],s,i,j,m;
    chs.forEach(function(c){var k=Math.min(bp[c.id]||0,c.ps.length);if(!k)return;var um=0;c.ps.forEach(function(x){um+=x.u});pre.push({ps:c.ps,k:k,um:um/c.ps.length});tot+=k});
    if(!tot)return null;
    var sc=[],sum=0,pass=0;
    for(s=0;s<sims;s++){var hit=0;
      for(i=0;i<pre.length;i++){var c=pre[i],len=c.ps.length,a=[];for(j=0;j<len;j++)a[j]=j;
        var shift=(R()*2-1)*c.um*.8;
        for(m=0;m<c.k;m++){var r=m+Math.floor(R()*(len-m)),t=a[m];a[m]=a[r];a[r]=t;
          var x=c.ps[a[m]],p=x.p+shift+(R()*2-1)*x.u*.3;p=p<.05?.05:p>.98?.98:p;if(R()<p)hit++}}
      var v=hit/tot*100;sc.push(v);sum+=v;if(v>=80)pass++}
    sc.sort(function(a,b){return a-b});
    return{mean:sum/sims,lo:sc[Math.floor(sims*.1)],hi:sc[Math.min(sims-1,Math.floor(sims*.9))],passChance:pass/sims,total:tot}}
  /* Blueprint exam. chs=[{id,cands:[{id,rank}]}] lower rank = preferred (fresh first). Returns ids, shuffled. */
  function pickExam(chs,bp,R){
    var out=[],left=[];
    function sorted(a){return a.map(function(c){return[c.rank+R()*.5,c]}).sort(function(x,y){return x[0]-y[0]}).map(function(x){return x[1]})}
    chs.forEach(function(c){var k=bp[c.id]||0,s=sorted(c.cands);out.push.apply(out,s.slice(0,k).map(function(x){return x.id}));left.push.apply(left,s.slice(k))});
    var N=0;for(var id in bp)N+=bp[id];
    if(out.length<N){sorted(left).slice(0,N-out.length).forEach(function(x){out.push(x.id)})}
    for(var i=out.length-1;i>0;i--){var j=Math.floor(R()*(i+1)),t=out[i];out[i]=out[j];out[j]=t}
    return out}
  return{BP:BP,INT:INT,hs:hs,rng:rng,dnum:dnum,qp:qp,predict:predict,pickExam:pickExam}
})();
/*PURE-END*/
window.TDM=TDM;

/* ---------- state ---------- */
function T(){S.x=S.x||{};var t=S.x.testday=S.x.testday||{};if(!t.log)t.log={};if(!t.seen)t.seen={};return t}
var NOW=function(){return TDM.dnum(today())};
var WHEN=['After school','Before bed','After dinner','On the bus','Weekend morning'];
var MINS=[5,10,15];
var CRAM_N=8;
function addDays(n){var d=new Date();d.setDate(d.getDate()+n);return dstr(d)}
function fmtDate(s){var p=s.split('-');return new Date(+p[0],+p[1]-1,+p[2]).toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'})}
function daysLeft(){var t=T();return t.date?TDM.dnum(t.date)-NOW():null}
function validDate(s){return /^\d{4}-\d\d-\d\d$/.test(s)&&!isNaN(new Date(s+'T00:00'))}
function q$(s,r){return(r||document).querySelector(s)}
function setupDone(){var t=T();return(t.date||t.ns)&&t.mins&&(t.when||t.wskip)}
function freshCount(){var n=0;ALL.forEach(function(q){var a=st(q.id);if(a[1]+a[2]>0)n++});return n}

/* ---------- model glue ---------- */
function qinfo(q){var a=st(q.id),sd=T().seen[q.id],age=sd!=null?NOW()-sd:null;return{a:a,age:age,x:TDM.qp(a,age)}}
function isDue(q){var a=st(q.id),n=a[1]+a[2];if(!n)return false;var sd=T().seen[q.id];
  if(sd==null)return a[0]<=2;return NOW()-sd>=TDM.INT[Math.min(4,a[0])]}
function dueList(){return ALL.filter(isDue)}
function readiness(){
  var chs=[],info={},answered=0;
  CHAPTERS.forEach(function(c){var ps=[],na=0,sp=0;
    c.qs.forEach(function(q){var i=qinfo(q);if(i.a[1]+i.a[2]>0){na++;answered++}ps.push(i.x);sp+=i.x.p});
    chs.push({id:c.id,ps:ps});info[c.id]={na:na,total:c.qs.length,p:sp/c.qs.length}});
  if(answered<30)return{ok:false,answered:answered,info:info};
  var r=TDM.predict(chs,TDM.BP,20260101,1000);
  return{ok:true,answered:answered,info:info,lo:Math.round(r.lo),hi:Math.round(r.hi),mean:Math.round(r.mean)}}
function weakest(info,n){
  var ids=CHAPTERS.map(function(c){return c.id}).filter(function(id){return info[id].na>0});
  ids.sort(function(a,b){return info[a].p-info[b].p});return ids.slice(0,n)}
function rankPick(pool,n){
  return pool.map(function(q){var i=qinfo(q);return[(1-i.x.p)+(isDue(q)?.15:0)+Math.random()*.25,q]})
    .sort(function(a,b){return b[0]-a[0]}).slice(0,n).map(function(x){return x[1]})}
function blueprintExam(){
  var t=T(),last={};(t.exam||[]).forEach(function(id){last[id]=1});
  var chs=CHAPTERS.map(function(c){return{id:c.id,cands:c.qs.map(function(q){var a=st(q.id);
    return{id:q.id,rank:(a[1]+a[2]>0?1:0)+(last[q.id]?1:0)}})}});
  var ids=TDM.pickExam(chs,TDM.BP,Math.random);
  t.exam=ids.concat((t.exam||[]).slice(0,50)).slice(0,100);save();
  return ids.map(function(id){return BYID.get(id)}).filter(Boolean)}

/* ---------- runs ---------- */
function drill(chId){var c=CH.get(chId);if(!c)return;
  var pool=ALL.filter(function(q){return q.ch===chId});
  startRun({mode:'review',title:'Drill: '+c.name,pool:pool,qs:rankPick(pool,10)})}
function weakestId(){var r=readiness(),w=weakest(r.info,1);return w[0]||CHAPTERS[0].id}
function fixRun(){
  var due=dueList(),weak=ALL.filter(function(q){return isWeak(q.id)});
  var pool=due.length?due:weak;
  if(!pool.length){drill(weakestId());return}
  startRun({mode:'review',title:due.length?'Due for review':'Fix My Mistakes',pool:pool,qs:rankPick(pool,10)})}
function cramRun(){
  var pool=ALL.filter(function(q){return isWeak(q.id)||isDue(q)});
  if(pool.length<CRAM_N)pool=ALL;
  startRun({mode:'review',title:'Cram round',pool:pool,qs:rankPick(pool,CRAM_N)})}

/* ---------- plan ---------- */
function planTasks(){
  var t=T(),m=t.mins||10,dl=daysLeft(),e=t.log[today()]||{},nx=nextStop(),out=[];
  if(dl!=null&&dl>=0&&dl<=3){
    out.push({k:'cram',label:'Cram round',sub:CRAM_N+' questions, your weakest and due ones',done:(e.drill||0)>=1,act:'tdcram'});
    out.push({k:'daily',label:'Daily Drive',sub:'5 questions, about 2 min',done:S.daily===today(),act:'daily'});
    return out}
  out.push({k:'daily',label:'Daily Drive',sub:'5 questions, about 2 min',done:S.daily===today(),act:'daily'});
  if(m>=10){
    if(nx)out.push({k:'stop',label:'1 stop: '+nx.icon+' '+nx.name,sub:'Lesson and quiz, about 6 min',done:(e.stop||0)>=1,act:'stop',v:nx.id});
    else out.push({k:'weak',label:'Drill your weakest topic',sub:'10 questions, about 4 min',done:(e.drill||0)>=1,act:'tdweak'})}
  if(m>=15)out.push({k:'fix',label:dueList().length?'Review what is due':'Fix mistakes round',sub:'10 questions, about 4 min',done:(e.drill||0)>=(m>=10?2:1),act:'tdfix'});
  return out}
function paceLine(){
  var dl=daysLeft(),left=CHAPTERS.filter(function(c){return stars(c.id)<1}).length;
  if(!left)return'Every stop has a star. Now it is about keeping answers fresh.';
  if(dl==null||dl<0)return left+' stop'+(left>1?'s':'')+' still waiting for a first star.';
  if(dl<=3)return'';
  if(left<=dl)return left+' stop'+(left>1?'s':'')+' left for a first star. One a day fits before test day.';
  if(left>dl*2)return left+' stops are still waiting for a first star. A star on every stop by test day is a stretch, so start with your weakest topics.';
  return left+' stops left for a first star and '+dl+' days to go. Two stops on some days would help. No pressure.'}

/* ---------- views ---------- */
function chip(act,v,label,on){return'<button class="tdc'+(on?' on':'')+'" data-act="'+act+'" data-v="'+esc(v)+'" aria-pressed="'+(!!on)+'">'+esc(label)+'</button>'}
function group(title,body,hint){return'<div class="tdg"><p class="tdq">'+title+'</p><div class="tdchips">'+body+'</div>'+(hint?'<p class="muted tdhint">'+hint+'</p>':'')+'</div>'}
function dateGroup(){var t=T(),src=t.dsrc;
  var body=chip('tddate','w1','This week',src==='w1')+chip('tddate','w2','2 weeks',src==='w2')+chip('tddate','m1','A month',src==='m1')
    +'<label class="tdpick'+(src==='pick'?' on':'')+'"><span>Pick the date</span><input type="date" data-tddate="1" min="'+today()+'" value="'+(t.date&&src==='pick'?t.date:'')+'" aria-label="Test date"></label>'
    +chip('tdns','ns','Not scheduled',t.ns);
  var hint=t.date?'Set for '+esc(fmtDate(t.date))+'. Pick the exact day if you know it.':'';
  return group('When is your permit test?',body,hint)}
function minsGroup(){var t=T();return group('How many minutes a day?',MINS.map(function(m){return chip('tdmin',m,m+' min',t.mins===m)}).join(''),'A plan, not a deadline. You can change it any time.')}
function whenGroup(){var t=T(),cur=t.when||'';
  var body=WHEN.map(function(w){return chip('tdwhen',w,w,cur===w)}).join('')
    +'<label class="tdpick tdtxt'+(cur&&WHEN.indexOf(cur)<0?' on':'')+'"><span>Other</span><input type="text" data-tdwhen="1" maxlength="24" value="'+(WHEN.indexOf(cur)<0?esc(cur):'')+'" aria-label="Another time and place" autocomplete="off" autocapitalize="sentences"></label>';
  return group('When and where will you do it?',body,'People who pick a time and place follow through more often.')}
function wizard(full){
  var t=T(),h='<section class="card tdcard tdsetup" aria-label="Test day plan"><h3>Plan for test day</h3>';
  if(full||!(t.date||t.ns))h+=dateGroup();
  if(full||((t.date||t.ns)&&!t.mins))h+=minsGroup();
  if(full||(t.mins&&!(t.when||t.wskip)))h+=whenGroup();
  if(full)h+='<button class="btn small ghost" data-act="tddone">Done</button>';
  else h+='<div class="tdfoot">'+(t.mins&&!(t.when||t.wskip)?'<button class="btn small line" data-act="tdwskip">Skip this</button>':'')+'<button class="btn small line" data-act="tdsnooze">Not now</button></div>';
  return h+'</section>'}
function chipHead(){
  var dl=daysLeft(),t=T();
  if(dl==null)return'<span class="tdchipx">Your daily plan</span>';
  var txt=dl>1?'Test day in '+dl+' days':dl===1?'Test day is tomorrow':dl===0?'Test day is today':'Test date passed';
  return'<span class="tdchipx'+(dl<0?' past':'')+'">'+txt+'</span><span class="muted tddate">'+esc(fmtDate(t.date))+'</span>'}
function planCard(){
  var t=T(),dl=daysLeft(),tasks=planTasks(),done=tasks.filter(function(x){return x.done}).length;
  var mins=dl!=null&&dl>=0&&dl<=3?'':(' about '+(t.mins||10)+' min');
  var h='<section class="card tdcard" aria-label="Test day plan"><div class="tdhead">'+chipHead()+'<button class="tdedit" data-act="tdedit" aria-label="Edit test date and plan">Edit</button></div>';
  if(dl!=null&&dl<0)h+='<p class="muted tdnote">Your test date has passed. If it moved, tap Edit and pick the new day.</p>';
  if(dl===0)h+='<p class="tdnote">You have put the work in. A light round, sleep, then go.</p>';
  h+='<p class="tdtitle"><b>Today</b>'+(mins?'<span class="muted">,'+mins+'</span>':'')+(t.when?'<span class="muted"> · '+esc(t.when)+'</span>':'')+'</p>';
  h+='<ul class="tdlist">'+tasks.map(function(x){return'<li><button class="tdrow'+(x.done?' done':'')+'" data-act="'+x.act+'"'+(x.v?' data-v="'+esc(x.v)+'"':'')+' aria-label="'+esc(x.label)+(x.done?', done today':'')+'"><span class="tdbox" aria-hidden="true">'+(x.done?'&#10003;':'')+'</span><span class="tdtx"><b>'+esc(x.label)+'</b><span class="muted">'+esc(x.sub)+'</span></span></button></li>'}).join('')+'</ul>';
  if(done===tasks.length)h+='<p class="tdnote">Plan done for today. Nice work.</p>';
  var pl=paceLine();if(pl)h+='<p class="muted tdnote">'+esc(pl)+'</p>';
  if(dl!=null&&dl>3&&dl<=7&&(t.mins||10)<15)h+='<p class="muted tdnote">With '+dl+' days left, 15 minutes a day would cover more. Your call.</p>';
  return h+'</section>'}
function bandBar(r){
  return'<div class="tdbar" aria-hidden="true"><i class="band" style="left:'+r.lo+'%;width:'+Math.max(2,r.hi-r.lo)+'%"></i><i class="pass" style="left:80%"></i></div><div class="tdscale" aria-hidden="true"><span>0</span><span style="left:80%">80 pass</span><span>100</span></div>'}
function readinessCard(r){
  if(!r.ok)return'<section class="card tdready"><h3>Predicted score</h3><p class="tdbig small">Not enough data yet</p><div class="track" role="progressbar" aria-label="Questions answered toward 30" aria-valuemin="0" aria-valuemax="30" aria-valuenow="'+r.answered+'"><b style="width:'+Math.round(r.answered/30*100)+'%"></b></div><p class="muted">Answer 30 different questions and a predicted score shows up here. You are at '+r.answered+'.</p></section>';
  var msg=r.lo>=80?'Looking strong. Keep answers fresh with the Daily Drive.':r.hi<80?'Not there yet. Your weakest topics below are the fastest way up.':'Close to the line. A few weak topics could tip it either way.';
  return'<section class="card tdready"><h3>Predicted score</h3><p class="tdbig">'+r.lo+' to '+r.hi+'%</p><p class="tdsub">on the mock. Pass is 80%.</p>'+bandBar(r)+'<p>'+msg+'</p><p class="muted">An estimate from '+r.answered+' answered questions, weighted by the real topic mix. It is not a promise, and the real test can differ.</p></section>'}
function weakCard(r){
  if(!r.ok)return'';var w=weakest(r.info,3);if(!w.length)return'';
  return'<section class="card tdweak"><h3>Weakest 3 topics</h3>'+w.map(function(id){var c=CH.get(id),i=r.info[id];
    return'<button class="tdwrow" data-act="tddrill" data-v="'+id+'" aria-label="Drill '+esc(c.name)+', about '+Math.round(i.p*100)+' percent, '+i.na+' of '+i.total+' tried"><span class="tdwic" aria-hidden="true">'+c.icon+'</span><span class="tdtx"><b>'+esc(c.name)+'</b><span class="muted">About '+Math.round(i.p*100)+'% · tried '+i.na+' of '+i.total+'</span></span><span class="tdgo">Drill</span></button>'}).join('')+'</section>'}
function dueCard(){var n=dueList().length;
  return n?'<section class="card tddue"><h3>Due for review</h3><p class="muted">'+n+' question'+(n>1?'s are':' is')+' ready to look at again. Reviewing at spaced days makes answers stick.</p><button class="btn small ghost" data-act="tdfix">Review '+Math.min(10,n)+' now</button></section>':''}
function cramCard(){var dl=daysLeft();
  if(dl==null)return'';
  if(dl<0||dl>3)return'<section class="card tdcram off"><h3>Cram mode</h3><p class="muted">Opens in the last 3 days before your test. Short rounds of your weakest and due questions.</p></section>';
  return'<section class="card tdcram"><h3>Cram mode</h3><p class="muted">'+(dl===0?'Test day. One short round, then rest.':dl+' day'+(dl>1?'s':'')+' to go. Short rounds of your weakest and due questions.')+'</p><button class="btn primary" data-act="tdcram">Start a cram round</button></section>'}

/* ---------- injection (after every render) ---------- */
function clear(root,cls){var o=root.querySelectorAll(cls);for(var i=0;i<o.length;i++)o[i].remove()}
function town(m){
  var row=q$('.twrow',m),r=readiness(),t=T();
  /* replace the old 85 percent mastered readiness */
  var rd=q$('.twready',m);
  if(rd){rd.setAttribute('aria-label',r.ok?'Predicted score '+r.lo+' to '+r.hi+' percent':'Predicted score: not enough data yet');
    rd.innerHTML=r.ok?'<b>Predicted</b><strong>'+r.lo+'-'+r.hi+'%</strong><span class="muted tdmini">Pass is 80%</span>':'<b>Predicted</b><strong class="tdsmall">Not enough data yet</strong><div class="track"><b style="width:'+Math.round(r.answered/30*100)+'%"></b></div>'}
  var ps=m.querySelectorAll('p.muted.center');for(var i=0;i<ps.length;i++)if(/ready to take the real test/.test(ps[i].textContent))ps[i].remove();
  clear(m,'.tdwrap');
  var html='';
  if(ui.tdEdit)html=wizard(true);
  else if(setupDone())html=planCard();
  else if(S.runs>=1&&t.snooze!==today())html=wizard(false);
  if(!html)return;
  var w=document.createElement('div');w.className='tdwrap';w.innerHTML=html;
  if(row)row.after(w);else m.insertBefore(w,m.firstChild)}
function testTab(m){
  clear(m,'.tdtest');var r=readiness(),t=T();
  var h=(t.date||t.ns?'':'')+readinessCard(r)+weakCard(r)+dueCard()+cramCard();
  var w=document.createElement('div');w.className='tdtest';w.innerHTML=h;
  var hero=q$('.card.hero',m);if(hero){hero.after(w);
    if(!q$('.tdmix',hero)){var p=document.createElement('p');p.className='muted tdmix';p.textContent='Questions follow the topic mix of the real handbook, and new ones come first.';var b=q$('.btn',hero);if(b)hero.insertBefore(p,b)}}
  else m.insertBefore(w,m.firstChild);
  if(daysLeft()!=null){var c=document.createElement('div');c.className='tdtest tdtop';c.innerHTML='<div class="card tdcard tdmini2"><div class="tdhead">'+chipHead()+'</div></div>';
    var h2=q$('h2',m);m.insertBefore(c,h2||m.firstChild)}}
function me(m){
  clear(m,'.tdme');var hero=q$('.card.mehero',m);if(!hero)return;
  var w=document.createElement('div');w.className='tdme';w.innerHTML=setupDone()&&!ui.tdEdit?planCard():wizard(true);
  hero.after(w)}
X.after(function(){
  var m=q$('main');if(!m||ui.run||ui.result||ui.lesson||ui.notes||ui.ob)return;
  if(ui.tab==='road')town(m);else if(ui.tab==='exam')testTab(m);else if(ui.tab==='me')me(m)});

/* ---------- state tracking ---------- */
X.wrap('srs',function(prev){return function(id){try{T().seen[id]=NOW()}catch(e){}return prev.apply(this,arguments)}});
X.wrap('finish',function(prev){return function(){
  var r=ui.run,mode=r&&r.mode,res=prev.apply(this,arguments);
  try{if(mode){var t=T(),d=today(),e=t.log[d]=t.log[d]||{};
    if(mode==='stop')e.stop=(e.stop||0)+1;else if(mode==='daily')e.daily=1;else if(mode==='review')e.drill=(e.drill||0)+1;else if(mode==='exam')e.mock=(e.mock||0)+1;
    var keep=NOW()-14;Object.keys(t.log).forEach(function(k){if(TDM.dnum(k)<keep)delete t.log[k]});save()}}catch(x){X.err('testday.finish',x)}
  return res}});

/* ---------- actions ---------- */
function rf(sel){setTimeout(function(){var e=q$(sel);if(e)e.focus({preventScroll:true})},0)}
function change(fn,focus){fn();save();render();if(focus)rf(focus)}
Object.assign(acts,{
  exam:function(){startRun({mode:'exam',title:'Mock Exam',pool:ALL,qs:blueprintExam()})},
  tddate:function(v){var n={w1:5,w2:14,m1:30}[v];if(!n)return;
    change(function(){var t=T();t.date=addDays(n);t.dsrc=v;t.ns=false},'[data-act="tddate"][data-v="'+v+'"]');
    toast('Test day set for '+fmtDate(T().date)+'. Change it any time.')},
  tdns:function(){change(function(){var t=T();t.ns=true;t.date='';t.dsrc='ns'},'[data-act="tdns"]')},
  tdmin:function(v){change(function(){T().mins=+v},'[data-act="tdmin"][data-v="'+v+'"]')},
  tdwhen:function(v){change(function(){var t=T();t.when=String(v);t.wskip=false},'[data-act="tdwhen"][data-v="'+v+'"]')},
  tdwskip:function(){change(function(){T().wskip=true})},
  tdsnooze:function(){change(function(){T().snooze=today()})},
  tdedit:function(){ui.tdEdit=true;render();rf('.tdsetup [data-act],.tdcard [data-act]')},
  tddone:function(){ui.tdEdit=false;var t=T();if(!t.mins)t.mins=10;if(!t.when)t.wskip=true;save();render()},
  tddrill:function(v){drill(v)},
  tdweak:function(){drill(weakestId())},
  tdfix:function(){fixRun()},
  tdcram:function(){cramRun()}
});
document.addEventListener('change',function(e){
  var el=e.target;if(!el||!el.matches)return;
  if(el.matches('input[data-tddate]')){var v=el.value;if(!validDate(v))return;
    change(function(){var t=T();t.date=v;t.dsrc='pick';t.ns=false});toast('Test day set for '+fmtDate(v)+'.')}
  else if(el.matches('input[data-tdwhen]')){var s=el.value.replace(/[<>&"']/g,'').trim().slice(0,24);if(!s)return;
    change(function(){var t=T();t.when=s;t.wskip=false})}
});
})();

}catch(e){X.err("x_testday",e)}

try{X.boot()}catch(e){}
