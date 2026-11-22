window.__PQ_VER="75183218";

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


/* ---- x_a11y.js ---- */
try{
/* Accessibility layer (A11Y package). Everything here wraps or observes; nothing edits another file's markup source.
   - one persistent aria-live region (window.pqSay)
   - after render(): focus goes to the new primary heading or question, or comes back to the control she was on
   - the stop sheet, level sheet and reset dialogs are real dialogs (modal, focus moves in and is trapped, Escape closes, focus returns)
   - the floating tab bar and sticky header never cover a focused control (scroll padding follows their real height)
   - small things: Enter on the name field, readable toasts, option and progress semantics, backup code size note */
(function(){
'use strict';
var $=function(s,r){return(r||document).querySelector(s)};
var $$=function(s,r){return[].slice.call((r||document).querySelectorAll(s))};
var appEl=function(){return document.getElementById('app')};

/* ---------- live region ---------- */
var live=document.createElement('div');live.id='pq-live';live.className='pq-sr';
live.setAttribute('role','status');live.setAttribute('aria-live','polite');live.setAttribute('aria-atomic','true');
document.body.appendChild(live);
var lastSay='',sayT=0;
function say(msg){
  msg=String(msg||'').replace(/\s+/g,' ').trim();if(!msg)return;
  if(msg===lastSay)msg+=' ';lastSay=msg;
  clearTimeout(sayT);live.textContent='';sayT=setTimeout(function(){live.textContent=msg},80)}
window.pqSay=say;

/* ---------- focus bookkeeping ---------- */
function sig(el){
  var app=appEl();if(!el||el===document.body||!el.getAttribute)return null;
  var d=el.dataset||{};
  return{id:el.id||'',act:d.act||'',v:d.v==null?'':d.v,k:d.k==null?'':d.k,tdd:el.hasAttribute('data-tddate'),inApp:!!(app&&app.contains(el))}}
function find(g){
  if(!g)return null;var app=appEl(),sel;
  if(g.id)sel='#'+g.id;
  else if(g.act)sel='[data-act="'+g.act+'"]'+(g.v!==''?'[data-v="'+String(g.v).replace(/"/g,'\\"')+'"]':'')+(g.k!==''?'[data-k="'+g.k+'"]':'');
  else if(g.tdd)sel='input[data-tddate]';
  else return null;
  try{return(g.inApp&&app?app:document).querySelector(sel)}catch(e){return null}}
function focusEl(el){
  if(!el)return false;
  if(!el.matches('button,input,textarea,select,a[href],[tabindex]'))el.setAttribute('tabindex','-1');
  else if(!el.hasAttribute('tabindex')&&el.matches('h1,h2,h3,.q,.qtag'))el.setAttribute('tabindex','-1');
  try{el.focus({preventScroll:true})}catch(e){return false}
  return document.activeElement===el}
function inDialog(el){return !!(el&&el.closest&&el.closest('[role=dialog],[role=alertdialog]'))}

/* ---------- dialogs ---------- */
function bodyDialogs(){var app=appEl();return $$('[role=dialog],[role=alertdialog]').filter(function(d){return !(app&&app.contains(d))&&d.getClientRects().length>0})}
function sheetEl(){var app=appEl();return app&&$('.sheet[role=dialog],.sheet[role=alertdialog]',app)}
function topDialog(){var b=bodyDialogs();return b.length?b[b.length-1]:sheetEl()}
function tabbables(d){
  return $$('button,[href],input,textarea,select,[tabindex]',d).filter(function(e){
    return !e.disabled&&e.getAttribute('tabindex')!=='-1'&&e.getAttribute('aria-hidden')!=='true'&&(e.offsetWidth||e.offsetHeight||e.getClientRects().length)})}
var opener=null,openerEl=null;
function remember(el){var b=el&&el.closest&&el.closest('[data-act],button,input,textarea,a');if(!b||inDialog(b))return;openerEl=b;opener=sig(b)}
document.addEventListener('click',function(e){remember(e.target)},true);
document.addEventListener('focusin',function(e){if(!inDialog(e.target)&&e.target!==document.body)remember(e.target)},true);
function returnFocus(){
  var t=(openerEl&&openerEl.isConnected&&openerEl)||find(opener);
  if(t&&focusEl(t))return true;
  return focusEl($('h1.pq-h1'))}
function setInert(on){
  var app=appEl();if(!app)return;
  $$('header.top,main,nav.tabs',app).forEach(function(e){if(on){e.setAttribute('inert','');e.setAttribute('aria-hidden','true')}else{e.removeAttribute('inert');e.removeAttribute('aria-hidden')}})}
function enterDialog(d){
  if(!d||d.contains(document.activeElement))return;
  d.setAttribute('aria-modal','true');
  var t=d.querySelector('[data-act="rscancel"],[autofocus]');
  if(t)focusEl(t);else{d.setAttribute('tabindex','-1');focusEl(d)}}
/* dialogs added to <body> by other files: make sure they are modal and have focus inside */
new MutationObserver(function(muts){
  var added=false,removed=false;
  muts.forEach(function(m){if(m.addedNodes.length)added=true;if(m.removedNodes.length)removed=true});
  if(added){var d=bodyDialogs().pop();if(d){d.setAttribute('aria-modal','true');if(!d.contains(document.activeElement))enterDialog(d)}}
  if(removed&&!topDialog()&&(!document.activeElement||document.activeElement===document.body)&&opener)returnFocus()
}).observe(document.body,{childList:true});

document.addEventListener('keydown',function(e){
  var d=topDialog();
  if(e.key==='Escape'&&d){
    if(e.defaultPrevented)return;
    if(bodyDialogs().length){if(d.getAttribute('role')==='alertdialog'&&acts.rscancel){e.preventDefault();acts.rscancel()}return}
    e.preventDefault();if(d.matches('[role=alertdialog]')&&acts.rscancel)acts.rscancel();else acts.closesheet();return}
  if(e.key!=='Tab'||!d||d.closest('.tdov'))return;
  var f=tabbables(d),a=f[0],z=f[f.length-1],cur=document.activeElement;
  if(!f.length){e.preventDefault();d.setAttribute('tabindex','-1');d.focus();return}
  if(!d.contains(cur)){e.preventDefault();(e.shiftKey?z:a).focus();return}
  if(e.shiftKey&&(cur===a||cur===d)){e.preventDefault();z.focus()}
  else if(!e.shiftKey&&cur===z){e.preventDefault();a.focus()}},true);

/* ---------- screen identity: what counts as "a new screen" for focus ---------- */
function screenKey(){
  if(ui.run){var r=ui.run;if(r.phase)return'review|'+r.phase;var it=r.queue[r.i];return'run|'+r.i+'|'+r.queue.length+'|'+(it?it.q.id+(it.retry?'r':''):'')+'|'+(r.locked&&!isT(r.mode)?1:0)}
  if(ui.ob)return'ob|'+ui.ob.step;
  if(ui.lesson)return'lesson|'+ui.lesson.ch+'|'+ui.lesson.i;
  if(ui.result)return'result';
  if(ui.notes)return'notes|'+ui.notes;
  return'tab|'+ui.tab}
var TABN={road:'Town',games:'Games',garage:'Garage',exam:'Test',me:'Me'};
function decorate(app){
  var main=$('main',app);
  if(main&&!$('h1.pq-h1',main)){var h=document.createElement('h1');h.className='pq-sr pq-h1';h.setAttribute('tabindex','-1');h.textContent=TABN[ui.tab]||'Permit Quest';main.insertBefore(h,main.firstChild)}
  var r=ui.run;
  if(r&&!r.phase){
    var q=$('.runbody .q',app),vis=$('.runbody .vis svg',app);
    if(q&&vis){vis.id='pq-vis';q.setAttribute('aria-describedby','pq-vis')}
    var ex=isT(r.mode);
    $$('.runbody .opt',app).forEach(function(o){
      if(ex)o.setAttribute('aria-pressed',o.classList.contains('sel')?'true':'false');
      else if(r.locked&&!o.querySelector('.pq-sr')){var t=o.classList.contains('ok')?' Correct answer.':o.classList.contains('bad')?' Your answer. Not correct.':'';
        if(t){var s=document.createElement('span');s.className='pq-sr';s.textContent=t;o.appendChild(s)}}});
    var fb=$('.fb',app);if(fb)fb.removeAttribute('aria-live');
    var pr=$('.prog',app);if(pr&&!pr.getAttribute('role')){var b=pr.firstElementChild,w=b?parseInt(b.style.width,10)||0:0;
      pr.setAttribute('role','progressbar');pr.setAttribute('aria-label','Progress');pr.setAttribute('aria-valuemin','0');pr.setAttribute('aria-valuemax','100');pr.setAttribute('aria-valuenow',String(w))}}
  var sh=sheetEl();if(sh)sh.setAttribute('aria-modal','true');
  sizeBars()}
/* the real heights of the sticky header and the floating tab bar, for scroll padding */
function sizeBars(){
  var h=$('header.top'),t=$('nav.tabs'),root=document.documentElement.style;
  var g=$('.gstick');                                  /* the Garage keeps a preview pinned under the header */
  if(h&&!h.closest('[inert]'))root.setProperty('--pq-top',Math.round(h.getBoundingClientRect().height+(g&&getComputedStyle(g).position==='sticky'?g.getBoundingClientRect().height:0))+'px');
  else if(!h)root.removeProperty('--pq-top');
  if(t)root.setProperty('--pq-bot',Math.round(t.getBoundingClientRect().height)+'px');else root.removeProperty('--pq-bot')}

function target(k){
  var r=ui.run;
  if(ui.run){
    if(r.phase)return{el:$('.runbody .q'),say:''};
    if(r.locked&&!isT(r.mode)){var fb=$('.fb h3'),p=$('.fb p');return{el:fb,say:p?p.textContent:''}}
    return{el:$('.runbody .q'),say:'Question '+(r.i+1)+' of '+r.queue.length+(r.queue[r.i]&&r.queue[r.i].retry?', try again':'')}}
  if(ui.ob)return{el:$('#app h2')||$('#app h1')};
  if(ui.lesson){var L=ui.lesson;return{el:$('.runbody .qtag'),say:'Page '+(L.i+1)+' of '+(L.pg?L.pg.length:4)}}
  if(ui.result)return{el:$('.res h2')||$('#app h2')||$('#app h3')};
  if(ui.notes)return{el:$('#app .top b')||$('#app h2')};
  return{el:$('h1.pq-h1')}}

var lastKey=screenKey(),prevSheet=false,cap=null,pend=false,lastSel=null;
function post(){
  pend=false;var c=cap;cap=null;var app=appEl();if(!app)return;
  decorate(app);
  var sh=sheetEl(),k=screenKey(),outside=bodyDialogs().length>0;
  if(sh){
    setInert(true);
    if(!prevSheet&&!outside&&!sh.contains(document.activeElement))enterDialog(sh);
    prevSheet=true;lastKey=k;return}
  setInert(false);
  if(prevSheet){prevSheet=false;
    if(k===lastKey&&!outside){lastKey=k;if(!returnFocus())focusEl($('h1.pq-h1'));return}}
  /* exam and pretest answers re-render the same question: keep her on the option and say what happened */
  if(ui.run&&!ui.run.phase&&isT(ui.run.mode)&&ui.run.sel!=null){
    var sk=ui.run.i+'|'+ui.run.sel;if(sk!==lastSel){lastSel=sk;say('Selected '+'ABCD'[ui.run.sel])}}else lastSel=null;
  if(k!==lastKey){
    lastKey=k;
    var a=document.activeElement;
    if(outside||(a&&a!==document.body&&inDialog(a)))return;       /* a dialog owns focus right now */
    var t=target(k);if(t.el&&focusEl(t.el)&&t.say)say(t.say);
    else if(t.say)say(t.say);
    return}
  /* same screen, the control she was on is gone: put her back on it */
  var cur=document.activeElement;
  if(c&&(!cur||cur===document.body||!cur.isConnected)){
    var again=find(c);if(!again||!focusEl(again))focusEl($('h1.pq-h1'))}}
X.wrap('render',function(prev){return function(){
  if(!pend){pend=true;var a=document.activeElement;cap=a&&appEl()&&appEl().contains(a)?sig(a):null}
  var r=prev.apply(this,arguments);Promise.resolve().then(post);return r}});
window.addEventListener('resize',function(){sizeBars()});
if('ResizeObserver' in window){try{new ResizeObserver(sizeBars).observe(document.body)}catch(e){}}

/* ---------- small things ---------- */
/* Enter or the iOS Done key on the name field */
document.addEventListener('keydown',function(e){
  var t=e.target;if(e.key==='Enter'&&t&&t.id==='obn'){e.preventDefault();if(acts.obname)acts.obname()}});
/* toasts: 6 seconds or more, and a tap dismisses them (the app's own timer is 2.8 s) */
X.wrap('toast',function(prev){return function(msg){
  prev.apply(this,arguments);
  var o=$('.toast');if(!o)return;
  var d=o.cloneNode(true);o.remove();document.body.appendChild(d);
  var ms=Math.min(12000,Math.max(6000,String(msg||'').length*90));
  var t=setTimeout(function(){d.remove()},ms);
  d.addEventListener('click',function(){clearTimeout(t);d.remove()});d.setAttribute('role','status')}});
/* backup code: how big it is, and a Copy button label that says what it does */
X.after(function(){
  var c=$('#code');if(!c||$('.pq-codesize'))return;
  var n=($('#codeval')||{}).textContent;n=n?n.length:0;if(!n)return;n=Math.max(100,Math.round(n/100)*100);       /* the code changes by a few characters as other parts save, so round it */
  var p=document.createElement('p');p.className='muted pq-codesize';
  p.textContent='This code is about '+n.toLocaleString()+' characters and grows as you answer more questions. Use Copy, then paste it into a message or note. Do not retype it.';
  c.after(p);
  var b=$('[data-act="copy"]');if(b&&/^Copy code$/.test(b.textContent))b.textContent='Copy'});
})();

}catch(e){X.err("x_a11y",e)}

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

/* ---- x_econ.js ---- */
try{
/* X econ: study rewards that scale with accuracy, replay and daily soft cap, XP level curve (10 levels),
   backup code sanitizing and first-screen restore. Hooks only (X.wrap / X.after / acts.*); app.js is not edited.
   State: S.x.econ = {d,sd,sc,xp,cc,gn,sr:{stopId:n}} (resets each local day). Pure formulas are exported as window.xEcon for qa/econ_sim.js.
   Knobs: SOFT (study coins per day at full rate), REP_FREE (full pays per 3-star stop per day), REP (replay and over-cap multiplier), GATE_FREE. */
(function(){
var SOFT=130,REP_FREE=2,REP=.25,GATE_FREE=2,GATE=.25,PART=6,MINXP=5,LOWRUNS=3;

/* ---------- levels: 10 levels, level 8 at about 3 weeks of normal play (about 250 XP a day) ---------- */
var LV=[0,200,500,1000,1750,2650,3900,5500,7400,9800];
var RK=['Parking Lot Rookie','Neighborhood Cruiser','Lane Keeper','Merge Master','Highway Hero','Road Boss','Right-of-Way Royalty','Permit Legend','Road Trip Champion','Test Day Titan'];
try{LEVELS.length=0;LV.forEach(function(v){LEVELS.push(v)});RANKS.length=0;RK.forEach(function(v){RANKS.push(v)})}catch(e){X.err('econ.levels',e)}

/* ---------- pure formulas ---------- */
var P={SOFT:SOFT,REP_FREE:REP_FREE,REP:REP,GATE_FREE:GATE_FREE,GATE:GATE,LV:LV.slice(),RK:RK.slice()};
/* XP (and coins, coins=floor(XP/5)) for a stop, daily or review run. cx = XP from first-try correct answers only */
P.runXP=function(o){
 var total=Math.max(1,o.total|0),acc=Math.max(0,Math.min(1,o.correct/total));
 var stg=acc>=.9?3:acc>=.7?2:acc>=.5?1:0;
 var pre=(o.cx|0)+PART+(o.chapter?stg*14:0)+Math.round(20*acc)+(o.dailyFirst?Math.round(40*acc):0)+(o.review?Math.round(10*acc):0);
 var ramp=Math.min(1,acc/.5);ramp*=ramp;
 return Math.max(MINXP,Math.round(pre*ramp))};
/* multipliers: rep = already 3-starred stop completed REP_FREE times today, room = study coins left under SOFT (null for review) */
P.scale=function(T,o){
 var t=T;
 if(o.low)t=MINXP;
 if(o.rep)t=Math.max(MINXP,Math.round(t*REP));
 if(o.room!=null){var c=Math.floor(t/5);if(c>o.room){var eff=o.room+Math.round((c-o.room)*REP);t=Math.max(MINXP,Math.round(t*Math.max(eff,1)/Math.max(c,1)))}}
 return t};
/* game win coins: raw 2+ceil(L/3)+stars; gated = this is game number GATE_FREE+1 or later today and no study run (half right or better) today */
P.gameRaw=function(L,stars){return 2+Math.ceil(L/3)+stars};
P.gameAmt=function(raw,gated){return gated?Math.max(1,Math.floor(raw*GATE)):raw};

/* ---------- daily counters ---------- */
function ci(v,max){if(typeof v==='string'&&/^\s*[+-]?\d+(\.\d+)?\s*$/.test(v))v=+v;if(typeof v!=='number'||!isFinite(v))return 0;v=Math.floor(v);return v<0?0:v>max?max:v}
function EC(){
 var x=S.x&&typeof S.x==='object'?S.x:(S.x={});
 var e=x.econ&&typeof x.econ==='object'?x.econ:(x.econ={}),d=today();
 if(e.d!==d){e.d=d;e.sd=0;e.sc=0;e.xp=0;e.cc=0;e.gn=0;e.lc=0;e.sr={}}
 e.sd=e.sd?1:0;e.sc=ci(e.sc,1e6);e.xp=ci(e.xp,1e6);e.cc=ci(e.cc,1e6);e.gn=ci(e.gn,1e4);e.lc=ci(e.lc,1e4);
 if(!e.sr||typeof e.sr!=='object'||Array.isArray(e.sr))e.sr={};
 return e}
window.xEconDay=EC;
window.xEcon=P;P.SOFTCOINS=SOFT;
if(typeof module!=='undefined'&&module.exports)module.exports=P;

/* track XP from first-try correct answers only: no XP per wrong answer, none for retry answers */
X.wrap('answer',function(prev){return function(i){
 var r=ui.run,retry=false,live=false;
 try{if(r&&!r.locked&&!isT(r.mode)&&r.queue&&r.queue[r.i]){live=true;retry=!!r.queue[r.i].retry}}catch(e){}
 var out=prev.apply(this,arguments);
 try{if(live&&!retry&&r.last&&r.last.ok)r.cx=(r.cx|0)+(r.last.gain|0)}catch(e){X.err('econ.answer',e)}
 return out}});

/* set r.xp before the original finish() so its XP, level-up and coin math (coins = floor(XP/5)) are all consistent */
X.wrap('finish',function(prev){return function(){
 var r=ui.run,info=null;
 try{if(r&&r.first&&!isT(r.mode)){
   var ids=Object.keys(r.first),total=ids.length,correct=ids.filter(function(k){return r.first[k]}).length;
   if(total){
    var e=EC(),acc=correct/total,stg=acc>=.9?3:acc>=.7?2:acc>=.5?1:0;
    var dailyFirst=r.mode==='daily'&&S.daily!==today();
    var T=P.runXP({total:total,correct:correct,cx:r.cx|0,chapter:r.chapter,dailyFirst:dailyFirst,review:r.mode==='review'});
    var rep=false,room=null;
    if(r.mode==='stop'&&r.chapter){var n=e.sr[r.chapter]|0;rep=(S.stars[r.chapter]||0)>=3&&n>=REP_FREE}
    if(r.mode!=='review')room=Math.max(0,SOFT-e.sc);
    var low=acc<.5&&(e.lc|0)>=LOWRUNS;
    var T2=P.scale(T,{rep:rep,room:room,low:low});
    info={mode:r.mode,chapter:r.chapter,acc:acc,rep:rep,lowrun:acc<.5,capped:T2<T&&!rep,review:r.mode==='review'};
    /* original: xpGain = r.xp + 15 + (chapter? stars*10) + (first daily? 30) */
    r.xp=T2-15-(r.chapter?stg*10:0)-(dailyFirst?30:0)}}
  else if(r&&isT(r.mode)){info={mode:r.mode,exam:true}}}catch(err){X.err('econ.finish.pre',err)}
 var out=prev.apply(this,arguments);
 try{var x=ui.result;if(info&&x){
   var e2=EC(),ok=info.exam?(x.total?x.correct/x.total>=.5:false):info.acc>=.5;
   if(ok)e2.sd=1;
   if(info.lowrun)e2.lc=(e2.lc|0)+1;
   e2.xp+=x.xpGain|0;e2.cc+=x.coins|0;
   if(!info.exam&&!info.review)e2.sc+=x.coins|0;
   if(info.mode==='stop'&&info.chapter)e2.sr[info.chapter]=(e2.sr[info.chapter]|0)+1;
   x.econ={rep:!!info.rep,capped:!!info.capped,review:!!info.review,low:!info.exam&&info.acc<.5};
   save();
   if(ui.result===x){try{X.run()}catch(_){}}}}catch(err){X.err('econ.finish.post',err)}
 return out}});

/* ---------- daily progress line on the result screen ---------- */
X.after(function(){
 try{var x=ui.result;if(!x||!x.econ)return;var g=document.querySelector('.res .gain');if(!g)return;
  var old=document.querySelector('.res .xtoday');if(old)old.remove();
  var e=EC(),m=[];
  m.push('Today so far: '+e.xp+' XP and '+e.cc+' coins from studying.');
  if(x.econ.low)m.push('You earned a little for trying. Get half right or better to unlock stars and bigger rewards.');
  else if(x.econ.rep)m.push('You already 3-starred this stop, so replays pay less after 2 a day. Fix my mistakes always pays full.');
  else if(x.econ.capped)m.push('Study coins are past today\'s soft limit ('+SOFT+'), so the rest pay a quarter. Fix my mistakes still pays full.');
  var p=document.createElement('p');p.className='muted xtoday';p.textContent=m.join(' ');g.after(p)}catch(err){X.err('econ.after',err)}});

/* =====================================================================================
   Backup code: prefix, sanitizing, first-screen restore
   ===================================================================================== */
var PFX='PQ1:',MAXLEN=3000000;
var BAD=/^(__proto__|constructor|prototype)$/;
function dc(v,d){
 if(v===null||v===undefined)return null;
 var t=typeof v;
 if(t==='number')return isFinite(v)?Math.max(0,Math.min(1e13,v)):0;
 if(t==='string')return v.slice(0,300);
 if(t==='boolean')return v;
 if(Array.isArray(v))return d>5?[]:v.slice(0,500).map(function(i){return dc(i,d+1)});
 if(t==='object'){var o={};if(d>6)return o;var n=0;for(var k in v){if(!Object.prototype.hasOwnProperty.call(v,k)||BAD.test(k))continue;if(++n>600)break;o[k]=dc(v[k],d+1)}return o}
 return null}
function isObj(v){return v&&typeof v==='object'&&!Array.isArray(v)}
function dateOk(s){return typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)?s:''}
function mapInts(src,keys,max){var o={};if(!isObj(src))return o;Object.keys(src).forEach(function(k){if(BAD.test(k))return;if(keys&&!keys(k))return;var n=ci(src[k],max);if(n>0)o[k]=n});return o}
window.xSanitizeState=function(o){
 if(!isObj(o))throw new Error('shape');
 if(o.v!==undefined&&o.v!==1&&o.v!=='1')throw new Error('version');
 if(!isObj(o.q))throw new Error('shape');
 if(!(typeof o.xp==='number'||typeof o.xp==='string'))throw new Error('shape');
 var out=dc(o,0);
 out.v=1;
 out.xp=ci(o.xp,99999);out.coins=ci(o.coins,99999);out.streak=ci(o.streak,3650);out.best=Math.max(out.streak,ci(o.best,3650));
 out.runs=ci(o.runs,99999);out.perfect=ci(o.perfect,9999);out.combo=ci(o.combo,999);
 out.last=dateOk(o.last);out.daily=dateOk(o.daily);
 var t=today();if(out.last>t)out.last=t;if(out.daily>t)out.daily=t;
 out.name=typeof o.name==='string'?o.name.slice(0,20):'';
 /* known ids only */
 var qid={};try{ALL.forEach(function(q){qid[q.id]=1})}catch(e){}
 var chid={};try{CHAPTERS.forEach(function(c){chid[c.id]=1})}catch(e){}
 out.q={};if(isObj(o.q))Object.keys(o.q).forEach(function(k){if(BAD.test(k)||(Object.keys(qid).length&&!qid[k]))return;var a=o.q[k];if(!Array.isArray(a))return;out.q[k]=[ci(a[0],4),ci(a[1],9999),ci(a[2],9999)]});
 out.stars={};if(isObj(o.stars))Object.keys(o.stars).forEach(function(k){if(BAD.test(k)||(Object.keys(chid).length&&!chid[k]))return;var n=ci(o.stars[k],3);if(n)out.stars[k]=n});
 out.exams=[];if(Array.isArray(o.exams))o.exams.slice(0,30).forEach(function(e){if(!isObj(e))return;var n=Math.max(1,ci(e.n,300)),s=Math.min(n,ci(e.s,300));out.exams.push({t:ci(e.t,1e13),s:s,n:n})});
 out.badges=mapInts(o.badges,null,1e13);
 out.own={};if(isObj(o.own))Object.keys(o.own).slice(0,600).forEach(function(k){if(!BAD.test(k)&&o.own[k])out.own[k.slice(0,60)]=true});
 out.g={};if(isObj(o.g))Object.keys(o.g).slice(0,20).forEach(function(k){if(BAD.test(k)||!Array.isArray(o.g[k]))return;out.g[k]=o.g[k].slice(0,10).map(function(n){return ci(n,3)})});
 var nCh=0;try{nCh=CHAPTERS.length}catch(e){}
 out.at=o.at==null?null:ci(o.at,nCh||99);
 out.hideInstall=!!o.hideInstall;out.seenOffline=!!o.seenOffline;out.remind=o.remind!==false;
 if(out.avatar!==null&&!isObj(out.avatar))out.avatar=null;
 if(out.pre!==null&&!isObj(out.pre))out.pre=null;
 if(out.pre){if('s' in out.pre)out.pre.s=ci(out.pre.s,500);if('n' in out.pre)out.pre.n=ci(out.pre.n,500);if('t' in out.pre)out.pre.t=ci(out.pre.t,1e13)}
 /* S.x: other agents' state. Counters are non-negative integers, known shapes are re-checked */
 if(out.x!==undefined){
  if(!isObj(out.x))out.x={};
  var x=out.x,sx=isObj(o.x)?o.x:{};
  if(isObj(x.engage)){var en=x.engage;en.shields=ci(sx.engage&&sx.engage.shields,2);en.mc=ci(sx.engage&&sx.engage.mc,9999);en.used=ci(sx.engage&&sx.engage.used,9999);
   en.ms=Array.isArray(sx.engage&&sx.engage.ms)?sx.engage.ms.slice(0,10).map(function(n){return ci(n,9999)}).filter(Boolean):[];
   en.m=mapInts(sx.engage&&sx.engage.m,function(k){return !Object.keys(qid).length||qid[k]},3);
   var gd=isObj(sx.engage&&sx.engage.gd)?sx.engage.gd:{};en.gd={d:dateOk(gd.d),c:ci(gd.c,9999)}}
  if(isObj(x.econ)){var se=isObj(sx.econ)?sx.econ:{};x.econ={d:dateOk(se.d),sd:se.sd?1:0,lc:ci(se.lc,999),sc:ci(se.sc,9999),xp:ci(se.xp,99999),cc:ci(se.cc,9999),gn:ci(se.gn,999),sr:mapInts(se.sr,null,99)}}
  if(isObj(x.story)){var ss=isObj(sx.story)?sx.story:{};x.story.chests=ci(ss.chests,99999);x.story.st=mapInts(ss.st,function(k){return !Object.keys(chid).length||chid[k]},1e13)}}
 return out};
window.xParseBackup=function(raw){
 if(typeof raw!=='string')throw new Error('empty');
 var s=raw.replace(/[\s"'“”‘’`<>\[\] ​﻿]/g,'');
 if(!s)throw new Error('empty');
 var m=/^([A-Za-z0-9]{1,8}):/.exec(s);
 if(m){if(m[1].toUpperCase()!=='PQ1')throw new Error('prefix');s=s.slice(m[0].length)}
 if(s.length>MAXLEN)throw new Error('big');
 s=s.replace(/-/g,'+').replace(/_/g,'/');
 if(/[^A-Za-z0-9+\/=]/.test(s))throw new Error('chars');
 s=s.replace(/=+$/,'');while(s.length%4)s+='=';
 var o;try{o=JSON.parse(decodeURIComponent(escape(atob(s))))}catch(e){throw new Error('decode')}
 return window.xSanitizeState(o)};
function msg(e){var k=e&&e.message;
 if(k==='empty')return 'Paste a backup code into the box first.';
 if(k==='prefix')return 'That code is not from Permit Quest, or it came from a newer version. Copy the code again from the Me tab.';
 if(k==='version')return 'That backup is from a different version of Permit Quest, so it cannot be restored here.';
 return 'That code did not work. Paste the whole code and try again.'}
window.xRestoreMsg=msg;

var codeBox=function(){return document.querySelector('#obcode')||document.querySelector('#code')};
function doRestore(){
 var t=codeBox();if(!t)return;
 var raw=t.value,mine=document.querySelector('#codeval');
 if(!/\S/.test(raw||'')||(mine&&raw.trim()===mine.textContent)){toast('Paste a backup code into the box first.');return}
 var o;try{o=window.xParseBackup(raw)}catch(e){toast(msg(e));return}
 var first=!!document.querySelector('#obcode');
 if(!first&&!confirm('Replace the progress on this phone with the progress in this code?'))return;
 S=Object.assign(fresh(),o);save();
 ui.ob=null;ui.rs=0;ui.run=null;ui.lesson=null;ui.result=null;if(first)ui.tab='road';
 try{if(typeof syncPlayer==='function')syncPlayer()}catch(e){}
 toast('Progress restored');render();window.scrollTo(0,0)}
acts.restore=doRestore;
acts.xobrestore=function(){ui.xobr=!ui.xobr;render();setTimeout(function(){var t=document.querySelector('#obcode');if(t)try{t.focus()}catch(e){}},50)};

/* the code on screen and the code that Copy puts on the clipboard carry the PQ1: prefix */
X.after(function(){
 try{var v=document.querySelector('#codeval');
  if(v&&v.textContent&&v.textContent.indexOf(PFX)!==0){v.textContent=PFX+v.textContent;var t=document.querySelector('#code');if(t&&t.value&&t.value.indexOf(PFX)!==0&&t.value.length>20&&t.value===v.textContent.slice(PFX.length))t.value=v.textContent}}catch(e){X.err('econ.code',e)}});

/* restore on the very first screen (before a name is typed) */
X.after(function(){
 try{if(!ui.ob||ui.ob.step!==0)return;var c=document.querySelector('.ob .obc');if(!c||c.querySelector('.xob-r'))return;
  var w=document.createElement('div');w.className='xob-r';
  var open=!!ui.xobr;
  w.innerHTML=open
   ?'<label class="lab" for="obcode">Paste your backup code</label><textarea id="obcode" class="code" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="Backup code"></textarea><div class="row" style="margin-top:8px"><button class="btn small primary" data-act="restore">Restore</button><button class="btn small ghost" data-act="xobrestore">Cancel</button></div>'
   :'<button class="btn small ghost" data-act="xobrestore" style="margin-top:10px">I have a backup code</button>';
  c.appendChild(w)}catch(e){X.err('econ.ob',e)}});
})();

}catch(e){X.err("x_econ",e)}

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
 var ec=window.xEconDay?window.xEconDay():{sd:1,gn:0},P=window.xEcon;
 var n=ec.gn|0;ec.gn=n+1;
 /* games after the first 2 of a day pay a quarter unless a study run (half right or better) was done today. Bonus rounds follow a passed stop, so they are always unlocked. */
 var gated=!!P&&n>=P.GATE_FREE&&!ec.sd&&!(typeof GP!=='undefined'&&GP.bonus);
 var raw=P?P.gameAmt(P.gameRaw(L,stars),gated):2+Math.ceil(L/3)+stars;
 var full=Math.max(0,Math.min(raw,CAP-e.gd.c)),rest=raw-full,coins=full+Math.round(rest*AFTER);
 if(coins<1)coins=1;e.gd.c+=full;
 var note='';
 if(gated)note+='<p class="muted xcapnote">Finish a stop or Daily Drive (half right or better) to unlock full game coins today.</p>';
 if(rest>0)note+='<p class="muted xcapnote">Daily game coin limit reached. Games pay a quarter until tomorrow.</p>';
 window.xGameNote=note;save();
 return coins};
function capLine(){var e=E(),c=e.gd.d===today()?e.gd.c:0,p=Math.min(100,Math.round(c/CAP*100));
 var ec=window.xEconDay?window.xEconDay():null,P=window.xEcon,S0=P?P.SOFTCOINS:130,sc=ec?Math.min(ec.sc,S0):0,sp=Math.min(100,Math.round(sc/S0*100));
 var gate=ec&&!ec.sd&&ec.gn>=2;
 var g='<div class="xcap" role="group" aria-label="Game coins today"><div class="xcaph"><span>Game coins today</span><b>'+Math.min(c,CAP)+' of '+CAP+'</b></div><div class="xcapb" aria-hidden="true"><i style="width:'+p+'%"></i></div><small class="muted">'+(c>=CAP?'Limit reached. Games pay a quarter until tomorrow.':gate?'Games pay a quarter until you finish a stop or Daily Drive (half right or better).':'The first 2 games a day always pay full. Study first and the rest do too.')+'</small></div>';
 var s=ec?'<div class="xcap" role="group" aria-label="Study today"><div class="xcaph"><span>Study today</span><b>'+ec.xp+' XP, '+ec.cc+' coins</b></div><div class="xcapb" aria-hidden="true"><i style="width:'+sp+'%"></i></div><small class="muted">'+(sc>=S0?'Past the soft limit. Replays pay a quarter. Fix my mistakes still pays full.':'Study coins pay full up to '+S0+' a day.')+'</small></div>':'';
 return g+s}
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
X.wrap('acts.twdrive',function(prev){return function(){/* first car: the drive to the stop comes first; the deferred bonus round is dropped */if(window.IX&&IX.def){if(IX.def.drv&&!ui.drive)ui.drive=IX.def.drv;IX.def=null}return prev.apply(this,arguments)}});
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
  if(ui.tab==='games'&&!ui.run&&!ui.result){var cb=$q('main .coinbar');if(cb&&!$q('.xcap')){var w=document.createElement('div');w.innerHTML=capLine();var n=w.lastChild;while(n){cb.after(n);n=w.lastChild}}}
  if(ui.result&&ui.result.mc>0){var g=$q('.res .gain');if(g&&!$q('.xmc',g)){var sp=document.createElement('span');sp.className='xmc';sp.textContent='🧠 +'+ui.result.mc+' mastery';g.appendChild(sp)}}
 }catch(err){X.err('engage.after',err)}});
try{render()}catch(e){X.err('engage.render',e)}
})();

}catch(e){X.err("x_engage",e)}

/* ---- x_flow.js ---- */
try{
/* x_flow: run flow safety. Input guard against double taps, run/result/onboarding persistence with a resume card,
   missed list for the pretest result, render fallback. Reads/writes: localStorage keys permitquest-run, permitquest-res, S.ob. */
var GUARD=700,RUNKEY='permitquest-run',RESKEY='permitquest-res',DAY=24*36e5,RESMAX=30*6e4;
var $q=function(s,r){return (r||document).querySelector(s)};
function lsGet(k){try{return JSON.parse(localStorage.getItem(k)||'null')}catch(e){return null}}
function lsSet(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function lsDel(k){try{localStorage.removeItem(k)}catch(e){}}

/* ---------- 1. input guard: the second tap of a double tap must not hit what appeared under the first ---------- */
var t0={sheet:0,game:0},sheetSig='';
if(window.PQ_GUARD_MS===undefined)window.PQ_GUARD_MS=GUARD;
document.addEventListener('click',function(e){
  var now=Date.now(),g=window.PQ_GUARD_MS,t=e.target,block=false;
  if(!t||!t.closest)return;
  if(ui.result&&ui.resultAt&&now-ui.resultAt<g&&t.closest('#app'))block=true;
  else if(t.closest('.sheetbg')&&!t.closest('[data-stop],.sheet')&&now-t0.sheet<g)block=true;
  else if(now-t0.game<g&&t.closest('#app'))block=true;
  if(block){e.stopImmediatePropagation();e.preventDefault()}
},true);
X.wrap('GP.close',function(prev){return function(){t0.game=Date.now();return prev.apply(this,arguments)}});

/* ---------- 2. in-progress run: save on every answer, offer Resume on Town and Test ---------- */
function snap(){
  var r=ui.run;if(!r||!r.queue||!r.queue.length)return null;
  var o={};Object.keys(r).forEach(function(k){if(k==='queue'||k==='missed')return;try{var v=r[k];JSON.stringify(v);if(typeof v!=='function')o[k]=v}catch(e){}});
  o.queue=r.queue.map(function(x){return [x.q.id,x.retry?1:0,x.tries||0]});
  o.missed=(r.missed||[]).map(function(q){return q.id});
  return {v:1,t:Date.now(),r:o}}
function answered(r){return r.locked||r.i>0||r.phase||(r.picks&&Object.keys(r.picks).length>0)}
function saveRun(){try{var r=ui.run;if(!r){return}if(!answered(r))return;var s=snap();if(s)lsSet(RUNKEY,s)}catch(e){X.err('flow.save',e)}}
function readRun(){var s=lsGet(RUNKEY);if(!s||!s.r||!Array.isArray(s.r.queue)||Date.now()-s.t>DAY||Date.now()<s.t-6e4){if(s)lsDel(RUNKEY);return null}
  var ok=s.r.queue.filter(function(x){return BYID.has(x[0])});if(!ok.length){lsDel(RUNKEY);return null}return s}
X.wrap('answer',function(prev){return function(){var o=prev.apply(this,arguments);saveRun();return o}});
X.wrap('next',function(prev){return function(){var o=prev.apply(this,arguments);if(ui.run)saveRun();return o}});
X.wrap('finish',function(prev){return function(){var o=prev.apply(this,arguments);lsDel(RUNKEY);return o}});
X.wrap('acts.retrygo',function(prev){return function(){var o=prev.apply(this,arguments);saveRun();return o}});
X.wrap('acts.quit',function(prev){return function(){var had=ui.run,o=prev.apply(this,arguments);if(had&&!ui.run)lsDel(RUNKEY);return o}});
X.wrap('acts.rsgo',function(prev){return function(){lsDel(RUNKEY);lsDel(RESKEY);return prev.apply(this,arguments)}});
function label(r){return r.mode==='exam'?'Mock exam':r.mode==='pre'?'Pretest':r.mode==='daily'?'Daily Drive':r.mode==='review'?(r.title||'Fix my mistakes'):(r.title||'your quiz')}
acts.resumerun=function(){
  var s=readRun();if(!s){toast('That run is no longer saved.');render();return}
  var o=s.r,q=o.queue.filter(function(x){return BYID.has(x[0])});
  var r=Object.assign({},o);
  r.queue=q.map(function(x){var it={q:BYID.get(x[0]),retry:!!x[1]};if(x[2])it.tries=x[2];return it});
  r.missed=(o.missed||[]).filter(function(id){return BYID.has(id)}).map(function(id){return BYID.get(id)});
  if(r.i>=r.queue.length)r.i=r.queue.length-1;if(r.i<0)r.i=0;
  r.first=r.first||{};r.picks=r.picks||{};
  ui.run=r;ui.sheet=null;ui.gsheet=null;ui.result=null;ui.notes=null;ui.lesson=null;
  var q0=r.queue[r.i].q,same=Array.isArray(o.opts)&&o.opts.length===q0.o.length&&q0.o.every(function(x){return o.opts.indexOf(x)>=0});
  if(r.phase!=='review'){
    if(!same){newItem()}
    else if(isT(r.mode)){var p=r.picks[q0.id];r.sel=p!==undefined?r.opts.indexOf(p):null;r.locked=false}
    if(!isT(r.mode)&&!same){r.locked=false;r.sel=null}}
  render();window.scrollTo(0,0)};
acts.resumedrop=function(){lsDel(RUNKEY);render()};
X.after(function(){
  var m=$q('#app main');
  if(!m||ui.run||ui.result||ui.lesson||ui.notes||ui.ob||(ui.tab!=='road'&&ui.tab!=='exam')){return}
  var old=$q('.flow-resume',m),s=readRun();
  if(!s){if(old)old.remove();return}
  if(old)return;
  var r=s.r,n=r.queue.length,i=Math.min(n,(r.i||0)+(r.locked?1:0)),d=document.createElement('div');
  d.className='card hl flow-resume';
  d.innerHTML='<b>Resume where you left off</b><p class="muted">'+esc(label(r))+', '+i+' of '+n+' answered. Your answers so far are saved.</p><div class="row" style="gap:8px"><button class="btn small primary" data-act="resumerun" style="flex:2">Resume</button><button class="btn small line" data-act="resumedrop" style="flex:1">Start fresh</button></div>';
  m.insertBefore(d,m.firstChild)});

/* ---------- 3. result survives a reload; the story texts, level up and missed list come back with it ---------- */
function saveRes(){
  var x=ui.result;if(!x||ui.run)return;
  var o={};Object.keys(x).forEach(function(k){if(k==='wrong'||k==='newB'||k==='bonus'||k.charAt(0)==='_'||typeof x[k]==='function')return;try{JSON.stringify(x[k]);o[k]=x[k]}catch(e){}});
  o.wrong=(x.wrong||[]).map(function(q){return q.id});o.newB=(x.newB||[]).map(function(b){return b.id});
  o.xsf=(x._xs&&x._xs.fresh)||x._xsf?1:0;
  lsSet(RESKEY,{v:1,t:x._t||(x._t=Date.now()),x:o})}
var booted=false;
X.after(function(){if(ui.result&&!ui.run)saveRes();else if(!ui.result&&booted&&lsGet(RESKEY))lsDel(RESKEY)});
function restoreRes(){
  var s=lsGet(RESKEY);if(!s||!s.x)return;
  if(Date.now()-s.t>RESMAX||ui.run||ui.ob||ui.result){lsDel(RESKEY);return}
  var o=s.x;if(typeof o.correct!=='number'||!o.total){lsDel(RESKEY);return}
  var x=Object.assign({},o);
  x.wrong=(o.wrong||[]).filter(function(id){return BYID.has(id)}).map(function(id){return BYID.get(id)});
  x.newB=(o.newB||[]).map(function(id){return BADGES.find(function(b){return b.id===id})}).filter(Boolean);
  x.bonus=null;x._xsf=o.xsf?1:0;x._t=s.t;
  ui.result=x;ui.resultAt=Date.now();ui.tab='road';render()}

/* ---------- 4. pretest result lists its misses too (its view lives in avatar.js) ---------- */
X.after(function(){
  var x=ui.result;if(!x||x.mode!=='pre'||$q('.flow-miss'))return;
  var h=missCard(x);if(!h)return;var root=$q('#app > div');if(!root)return;
  var w=document.createElement('div');w.innerHTML=h;root.appendChild(w.firstChild)});

/* ---------- 5. onboarding step survives a reload ---------- */
function obSave(){S.ob=ui.ob&&ui.ob.step?{step:ui.ob.step}:null;save()}
['obname','obdone','obskip','pretest'].forEach(function(n){X.wrap('acts.'+n,function(prev){return function(){var o=prev.apply(this,arguments);if(n==='obname'||n==='obdone')obSave();else{S.ob=null;save()}return o}})});
function restoreOb(){if(S.ob&&S.ob.step>=1&&!S.pre&&!S.runs&&!ui.ob&&!ui.run&&!ui.result){ui.ob={step:Math.min(2,S.ob.step)};if(ui.ob.step===1)ui.gx={c:'hairStyle',t:{}};render()}}
/* boot restores run after every script has loaded, so all render hooks see the screen */
setTimeout(function(){try{restoreOb();restoreRes()}catch(e){X.err('flow.boot',e)}booted=true},60);

/* ---------- 6. sheet timestamps for the guard; render never leaves a blank screen ---------- */
X.after(function(){var sig=(ui.sheet||'')+'|'+(ui.gsheet||'');if(sig!=='|'&&sig!==sheetSig)t0.sheet=Date.now();sheetSig=sig==='|'?'':sig});
var inFall=false;
X.wrap('render',function(prev){return function(){
  try{return prev.apply(this,arguments)}catch(e){
    X.err('render',e);if(inFall)throw e;inFall=true;
    try{ui.run=null;ui.lesson=null;ui.result=null;ui.notes=null;ui.sheet=null;ui.gsheet=null;ui.tab='road';var r=prev.apply(this,arguments);toast('Something went wrong, so we took you back to Town.');return r}
    finally{inFall=false}}}});

}catch(e){X.err("x_flow",e)}

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
  scrapTitle:'Road trip scrapbook',scrapSub:'{n} of {t} stickers. Clear a stop to collect its sticker.',scrapAll:'All {t} collected. Season complete.',
  scrapLocked:'Clear this stop to collect its sticker.',close:'Close',
  finaleTitle:'State Finals',finaleGo:'Start State Finals',finaleBack:'Not yet',
  epiEyebrow:'Season complete',epiGo:'Open the scrapbook',epiBack:'Back to town',epiStat:'{n} of {t} stickers collected',
  qTitle:'Today\'s quests',qHint:'Finish all 3 to open a chest. Right answers and wins count.',qReady:'All 3 done. Your chest is ready.',qOpen:'Open your chest',
  qClaimed:'Chest opened. New quests tomorrow.',qDone:'Quest done: {t}',qAll:'All 3 quests done. Your chest is waiting in Town.',
  chestTitle:'Quest chest',chestCoins:'{n} coins',chestFree:'Free: {name}',chestFind:'Find it in the Garage.',chestNice:'Nice',
  chestBonus:'Every cheap decal is yours already, so here is a bonus.'
 },
 quests:{
  ans:{t:'Get 10 answers right',n:10},
  game:{t:'Win one game',n:1},
  fix:{t:'Fix 3 mistakes',n:3},
  daily:{t:'Finish a Daily Drive',n:1},
  stop:{t:'Finish a stop quiz',n:1}
 },
 chest:{coins:15,bonusCoins:30},
 alias:{brin:['Bree','Bri'],tess:['Tessa','Tez'],king:['Coach Bell','Coach Reed']},
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

/* ---------- name collision: one lookup, STORY.alias. A player named like a cast member gets that cast member renamed everywhere ---------- */
var ORIG=JSON.parse(JSON.stringify(STORY)),aliasKey='';
var NAMES=[['brin','Brinley'],['tess','Tess'],['king','Coach King']];
function aliasFor(){
 var n=String((S.avatar&&S.avatar.name)||S.name||'').trim().toLowerCase().replace(/\s+/g,' ');
 if(!n)return '';var hit=[];
 NAMES.forEach(function(p){if(n===p[1].toLowerCase()||(p[0]==='king'&&n==='king'))hit.push(p[0])});
 return hit.join(',')}
function mapStr(t,pick){
 NAMES.forEach(function(p){var to=pick[p[0]];if(to)t=t.replace(new RegExp('\\b'+p[1]+'\\b','g'),to)});return t}
function walkA(o,c,pick){
 if(typeof o==='string')return mapStr(o,pick);
 if(Array.isArray(o)){for(var i=0;i<o.length;i++)c[i]=walkA(o[i],c[i],pick);return c}
 if(o&&typeof o==='object'){for(var k in o)c[k]=walkA(o[k],c[k],pick);return c}
 return o}
function applyAlias(){
 var k=aliasFor();if(k===aliasKey)return;aliasKey=k;
 var pick={},pn=String((S.avatar&&S.avatar.name)||S.name||'').trim().toLowerCase();
 k.split(',').forEach(function(w){if(!w)return;var l=STORY.alias[w];pick[w]=l[0].toLowerCase()===pn?l[1]:l[0]});
 ['cast','ch','finale','ui'].forEach(function(f){walkA(ORIG[f],STORY[f],pick)})}
window.xStoryAlias=function(){applyAlias();return aliasKey};
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
function beat(id){applyAlias();return STORY.ch[id]}
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
 applyAlias();var prev='',o='';
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
  var id=x.chapter,fresh=!(id in s.st)||!!x._xsf;
  if(!(id in s.st)){s.st[id]=Date.now();save()}
  var lines=s.seen.post[id]?null:beat(id).post;
  /* the texts count as seen only once the card has been on screen (see X.after below), so a reload or a fast tap does not eat them */
  o={kind:'stop',id:id,fresh:fresh,lines:lines,first:true,done:lines?function(){s.seen.post[id]=1;save()}:null}
 }else if(x.mode==='exam'){
  if(x.pass){
   if(!allClear()&&!s.seen.early){o={kind:'exam',lines:STORY.finale.early,first:true,done:function(){s.seen.early=1;save()}}}
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
 if(o.done&&!o.cm){o.cm=1;setTimeout(function(){if(c.isConnected)o.done()},800)}
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
 return '<div class="card xs-scrap" id="xs-scrap"><h3>'+esc(STORY.ui.scrapTitle)+'</h3><p class="muted" style="margin:0 0 10px">'+esc(fmt(n>=ORDER.length?STORY.ui.scrapAll:STORY.ui.scrapSub,{n:n,t:ORDER.length}))+'</p><div class="xs-grid">'
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
 try{if(pre&&r.locked&&r.last){if(!pre.retry&&r.last.ok)qinc('ans',1);if(!pre.retry&&pre.weak&&r.last.ok)qinc('fix',1)}}catch(e){X.err('story.answer',e)}
 return out}});
X.wrap('finish',function(prev){return function(){
 var r=ui.run,info=null;
 try{if(r){var t=isT(r.mode);info={mode:r.mode,n:r.queue.length,t:t,weak:t?r.queue.filter(function(x){return isWeak(x.q.id)}).map(function(x){return x.q.id}):[]}}}catch(e){}
 var out=prev.apply(this,arguments);
 try{if(info){
  if(info.t){var okc=r.first?Object.keys(r.first).filter(function(k){return r.first[k]}).length:0;if(info.n&&okc/info.n>=.6)qinc('ans',okc);var f=0;info.weak.forEach(function(id){if(r.first&&r.first[id])f++});qinc('fix',f)}
  var rs=ui.result,good=rs&&rs.total&&rs.correct/rs.total>=.5;
  if(info.mode==='daily'&&good)qinc('daily',1);
  if(info.mode==='stop'&&good)qinc('stop',1)}}catch(e){X.err('story.finish',e)}
 return out}});
X.wrap('GP.end',function(prev){return function(){
 var had=!!(typeof GP!=='undefined'&&GP.eng&&GP.eng.status==='win');
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
     a=[mastery level 0..4, times right, times wrong]; age=days since last answered (null if unknown).
     A question she has never seen has no point score here (unseen:true); readiness() fills it from how she did
     on the topic, with a wide uncertainty band, so unseen questions never drag the estimate down by themselves. */
  var LVP=[.5,.84,.93,.96,.98];                /* chance on test day by mastery level (level 2 = right twice in a row) */
  function qp(a,age){
    var lv=Math.max(0,Math.min(4,a[0]|0)),r=a[1]|0,w=a[2]|0,n=r+w;
    if(n===0)return{p:.55,u:.3,unseen:true};
    var p=LVP[lv]-.1*(w/n);
    if(age!=null&&age>7&&p>.5){var f=Math.min(.35,(age-7)/80);p=.5+(p-.5)*(1-f)}
    p=Math.max(.2,Math.min(.98,p));
    var u=n>=4?.05:n>=2?.08:.12;
    if(age!=null&&age>14)u+=.04;
    return{p:p,u:u}}
  /* Chance on a question she has not seen yet, from her right and wrong counts on that topic (rc,wc) and overall (rg,wg).
     Beta(3,2) start (a typical 60 percent), a little borrowed from other topics (capped, so one topic never vouches for the rest). u shrinks as coverage (0..1) grows. */
  function unseenP(rc,wc,rg,wg,cov){
    var R=rc+Math.min(1.5,.02*rg),W=wc+Math.min(1.5,.02*wg),p=(3+R)/(5+R+W),n=R+W;
    var u=Math.max(.1,.3*(1-cov)+.14*Math.exp(-n/12));
    return{p:Math.max(.3,Math.min(.95,p)),u:u}}
  /* Simulate blueprint mocks. chs=[{id,ps:[{p,u}]}]. Deterministic for a given seed.
     Range = 10th to 90th percentile of simulated scores. Each simulated exam shifts every chapter by a shared
     uncertainty draw, so little data gives a wide range and lots of data a narrow one. */
  function predict(chs,bp,seed,sims){
    var R=rng(seed),tot=0,pre=[],s,i,j,m;
    chs.forEach(function(c){var k=Math.min(bp[c.id]||0,c.ps.length);if(!k)return;var um=0;c.ps.forEach(function(x){um+=x.u});pre.push({ps:c.ps,k:k,um:um/c.ps.length});tot+=k});
    if(!tot)return null;
    var sc=[],sum=0,pass=0,gu=0,gw=0;pre.forEach(function(c){gu+=c.um*c.k;gw+=c.k});gu=gu/gw;
    for(s=0;s<sims;s++){var hit=0,gs=(R()*2-1)*gu*.6;
      for(i=0;i<pre.length;i++){var c=pre[i],len=c.ps.length,a=[];for(j=0;j<len;j++)a[j]=j;
        var shift=(R()*2-1)*c.um*.8;
        for(m=0;m<c.k;m++){var r=m+Math.floor(R()*(len-m)),t=a[m];a[m]=a[r];a[r]=t;
          var x=c.ps[a[m]],p=x.p+shift*.7+gs*.6+(R()*2-1)*x.u*.3;p=p<.05?.05:p>.98?.98:p;if(R()<p)hit++}}
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
  return{BP:BP,INT:INT,hs:hs,rng:rng,dnum:dnum,qp:qp,unseenP:unseenP,predict:predict,pickExam:pickExam}
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
  var chs=[],info={},answered=0,rg=0,wg=0,per={};
  CHAPTERS.forEach(function(c){var rc=0,wc=0,na=0,seen=[];
    c.qs.forEach(function(q){var i=qinfo(q),a=i.a;if(a[1]+a[2]>0){na++;answered++;rc+=a[1];wc+=a[2]}seen.push(i.x)});
    rg+=rc;wg+=wc;per[c.id]={rc:rc,wc:wc,na:na,xs:seen,n:c.qs.length}});
  CHAPTERS.forEach(function(c){var d=per[c.id],ps=[],sp=0,cov=d.na/d.n,un=TDM.unseenP(d.rc,d.wc,rg-d.rc,wg-d.wc,cov);
    d.xs.forEach(function(x){var y=x.unseen?un:x;ps.push(y);sp+=y.p});
    chs.push({id:c.id,ps:ps});info[c.id]={na:d.na,total:d.n,p:sp/d.n}});
  if(answered<30)return{ok:false,answered:answered,info:info};
  var r=TDM.predict(chs,TDM.BP,20260101,1000);
  return{ok:true,answered:answered,total:ALL.length,info:info,lo:Math.round(r.lo),hi:Math.round(r.hi),mean:Math.round(r.mean)}}
function weakest(info,n){
  var ids=CHAPTERS.map(function(c){return c.id}).filter(function(id){return info[id].na>0});
  ids.sort(function(a,b){return info[a].p-info[b].p});return ids.slice(0,n)}
function bpw(id){var m=0,k;for(k in TDM.BP)if(TDM.BP[k]>m)m=TDM.BP[k];return(TDM.BP[id]||1)/m}
/* weakness first, weighted by how much the real test uses the topic; due ones get a nudge; a little noise so rounds differ */
function rankPick(pool,n){
  return pool.map(function(q){var i=qinfo(q);return[(1-i.x.p)*(.6+.8*bpw(q.ch))+(isDue(q)?.15:0)+Math.random()*.25,q]})
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
function fixRun(n){
  n=typeof n==='number'?n:10;
  var due=dueList(),weak=ALL.filter(function(q){return isWeak(q.id)});
  var pool=due.length?due:weak;
  if(!pool.length){drill(weakestId());return}
  startRun({mode:'review',title:due.length?'Due for review':'Fix My Mistakes',pool:pool,qs:rankPick(pool,n)})}
function cramN(){var m=T().mins||10;return m>=15?12:m>=10?10:8}
function cramRun(n){
  n=typeof n==='number'?n:cramN();
  var pool=ALL.filter(function(q){return isWeak(q.id)||isDue(q)});
  if(pool.length<n)pool=ALL;
  startRun({mode:'review',title:'Cram round',pool:pool,qs:rankPick(pool,n)})}
/* The most-tested topic she has covered least. Used by the cram plan so stops are not taken in map order. */
function coverId(){
  var r=readiness(),best=null,bs=-1;
  CHAPTERS.forEach(function(c){var i=r.info[c.id],cov=i.na/i.total,sc=bpw(c.id)*(1-.85*cov)*(1.15-(i.na?i.p:.5)*.5);if(sc>bs){bs=sc;best=c.id}});
  return best}
function coverRun(id){
  id=id||coverId();var c=CH.get(id);if(!c)return;
  var pool=ALL.filter(function(q){return q.ch===id});
  var fresh=pool.filter(function(q){var a=st(q.id);return a[1]+a[2]===0}),rest=pool.filter(function(q){var a=st(q.id);return a[1]+a[2]>0});
  var qs=rankPick(fresh,10);if(qs.length<10)qs=qs.concat(rankPick(rest,10-qs.length));
  startRun({mode:'review',title:'Cover: '+c.name,pool:pool,qs:qs})}
window.xReadiness=readiness;

/* ---------- plan ---------- */
/* About 24 seconds a question (10 questions, about 4 min). Each task carries its own minutes so the plan adds up to the minutes she chose. */
function mockDoneRecently(){var t=T(),n=NOW(),k;for(k in t.log){var d=n-TDM.dnum(k);if(d>=0&&d<=3&&t.log[k].mock)return true}return false}
function planTasks(){
  var t=T(),m=t.mins||10,dl=daysLeft(),e=t.log[today()]||{},nx=nextStop(),out=[],dd=S.daily===today();
  var daily={k:'daily',label:'Daily Drive',sub:'5 questions, about 2 min',min:2,done:dd,act:'daily'};
  if(dl===0){
    out.push({k:'cram',label:'Light round',sub:'8 questions, about 3 min',min:3,done:(e.cram||0)>=1,act:'tdcram',v:'8'});out.push(daily);return out}
  if(dl!=null&&dl>0&&dl<=7){
    out.push(daily);
    if(dl<=2&&(!mockDoneRecently()||e.mock)){
      out.push({k:'mock',label:'One mock exam',sub:'50 questions, about 20 min. Once in the last 3 days.',min:20,done:(e.mock||0)>=1,act:'exam'});return out}
    var cid=coverId(),cc=CH.get(cid);
    if(m>=10)out.push({k:'cover',label:'Most-tested topic: '+cc.icon+' '+cc.name,sub:'10 questions, about 4 min',min:4,done:(e.cover||0)>=1,act:'tdcover',v:cid});
    out.push({k:'cram',label:'Weak spots round',sub:(m>=15?12:m>=10?10:8)+' questions, about '+(m>=15?5:m>=10?4:3)+' min',min:m>=15?5:m>=10?4:3,done:(e.cram||0)>=1,act:'tdcram',v:String(m>=15?12:m>=10?10:8)});
    if(m>=15)out.push({k:'fix',label:dueList().length?'Review what is due':'Fix mistakes round',sub:'10 questions, about 4 min',min:4,done:(e.fix||0)>=1,act:'tdfix',v:'10'});
    return out}
  out.push(daily);
  if(m>=10){
    if(nx)out.push({k:'stop',label:'1 stop: '+nx.icon+' '+nx.name,sub:'Lesson and quiz, about 7 min',min:7,done:(e.stop||0)>=1,act:'stop',v:nx.id});
    else out.push({k:'weak',label:'Drill your weakest topic',sub:'10 questions, about 4 min',min:4,done:(e.drill||0)>=1,act:'tdweak'})}
  if(m>=15)out.push({k:'fix',label:dueList().length?'Review what is due':'Fix mistakes round',sub:'15 questions, about 6 min',min:6,done:(e.fix||0)>=1,act:'tdfix',v:'15'});
  if(m<10)out.push({k:'fix',label:dueList().length?'Review what is due':'Quick review',sub:'7 questions, about 3 min',min:3,done:(e.fix||0)>=1,act:'tdfix',v:'7'});
  return out}
function paceLine(){
  var dl=daysLeft(),left=CHAPTERS.filter(function(c){return stars(c.id)<1}).length;
  if(!left)return'Every stop has a star. Now it is about keeping answers fresh.';
  if(dl==null||dl<0)return left+' stop'+(left>1?'s':'')+' still waiting for a first star.';
  if(dl<=7)return'Your plan starts with the most-tested topics you have covered least, then your weak spots.';
  if(left<=dl)return left+' stop'+(left>1?'s':'')+' left for a first star. One a day fits before test day.';
  if(left>dl*2)return left+' stops are still waiting for a first star. You do not need every star by test day. Start with your weakest topics.';
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
  var mins=' about '+tasks.reduce(function(a,x){return a+x.min},0)+' min';
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
  var tw=window.xToneReady?window.xToneReady(r):null,msg=r.lo>=80?'Looking strong. Keep answers fresh with the Daily Drive.':r.hi<80?'Room to grow. Your weakest topics below are the fastest way up.':'Close to the line. A few weak topics could tip it either way.';
  return'<section class="card tdready"><h3>Predicted score</h3><p class="tdbig">'+r.lo+' to '+r.hi+'%</p><p class="tdsub">'+(tw?esc(tw.sub):'Estimated mock exam score.')+'</p>'+bandBar(r)+'<p>'+msg+'</p><p class="muted">'+(tw?esc(tw.note):'An estimate, not a promise.')+'</p></section>'}
function weakCard(r){
  if(!r.ok)return'';var w=weakest(r.info,99).sort(function(a,b){return(r.info[a].na<5)-(r.info[b].na<5)}).slice(0,3);if(!w.length)return'';
  return'<section class="card tdweak"><h3>Weakest 3 topics</h3>'+w.map(function(id){var c=CH.get(id),i=r.info[id];
    return'<button class="tdwrow" data-act="tddrill" data-v="'+id+'" aria-label="Drill '+esc(c.name)+(i.na<5?', not tried yet':', about '+Math.round(i.p*100)+' percent, '+i.na+' of '+i.total+' tried')+'"><span class="tdwic" aria-hidden="true">'+c.icon+'</span><span class="tdtx"><b>'+esc(c.name)+'</b><span class="muted">'+(i.na<5?'Not tried yet. Try 5 questions.':'About '+Math.round(i.p*100)+'% · tried '+i.na+' of '+i.total)+'</span></span><span class="tdgo">Drill</span></button>'}).join('')+'</section>'}
function dueCard(){var n=dueList().length;
  return n?'<section class="card tddue"><h3>Due for review</h3><p class="muted">'+n+' question'+(n>1?'s are':' is')+' ready to look at again. Reviewing at spaced days makes answers stick.</p><button class="btn small ghost" data-act="tdfix">Review '+Math.min(10,n)+' now</button></section>':''}
function cramCard(){var dl=daysLeft();
  if(dl==null)return'';
  if(dl<0)return'<section class="card tdcram off"><h3>Cram mode</h3><p class="muted">Your test date has passed. If it moved, set the new day in your plan and cram mode will open again.</p></section>';
  if(dl>7)return'<section class="card tdcram off"><h3>Cram mode</h3><p class="muted">Opens in the last 7 days before your test. Short rounds of your weakest and most-tested questions.</p></section>';
  return'<section class="card tdcram"><h3>Cram mode</h3><p class="muted">'+(dl===0?'Test day. One short round, then rest.':dl+' day'+(dl>1?'s':'')+' to go. Short rounds of your weakest and most-tested questions.')+'</p><button class="btn primary" data-act="tdcram">Start a cram round</button></section>'}

/* ---------- injection (after every render) ---------- */
function clear(root,cls){var o=root.querySelectorAll(cls);for(var i=0;i<o.length;i++)o[i].remove()}
function town(m){
  var row=q$('.twrow',m),r=readiness(),t=T();
  /* replace the old 85 percent mastered readiness */
  var rd=q$('.twready',m);
  if(rd){rd.setAttribute('aria-label',r.ok?'Predicted score '+r.lo+' to '+r.hi+' percent':'Predicted score: not enough data yet');
    rd.innerHTML=r.ok?'<b>Predicted</b><strong>'+r.lo+'-'+r.hi+'%</strong><span class="muted tdmini">'+esc(window.xToneReady?window.xToneReady(r).chip:'Early estimate')+'</span>':'<b>Predicted</b><strong class="tdsmall">Not enough data yet</strong><div class="track"><b style="width:'+Math.round(r.answered/30*100)+'%"></b></div>'}
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
    if(mode==='stop')e.stop=(e.stop||0)+1;else if(mode==='daily')e.daily=1;else if(mode==='review'){e.drill=(e.drill||0)+1;var ti=String(r.title||'');if(/^Cram/.test(ti)||/^Light/.test(ti))e.cram=(e.cram||0)+1;else if(/^Cover/.test(ti))e.cover=(e.cover||0)+1;else if(/^(Due|Fix)/.test(ti))e.fix=(e.fix||0)+1}else if(mode==='exam')e.mock=(e.mock||0)+1;
    var keep=NOW()-14;Object.keys(t.log).forEach(function(k){if(TDM.dnum(k)<keep)delete t.log[k]});save()}}catch(x){X.err('testday.finish',x)}
  return res}});

/* ---------- actions ---------- */
function rf(sel){setTimeout(function(){
  var e=q$(sel);
  /* the chip she tapped can leave with its step: land on the next question of the wizard instead of on body */
  if(!e){var g=q$('.tdsetup .tdq');if(g){g.setAttribute('tabindex','-1');e=g}}
  if(!e)e=q$('.tdcard .tdhead [data-act]')||q$('.tdsetup h3');
  if(e){if(!e.matches('button,input,a,[tabindex]'))e.setAttribute('tabindex','-1');e.focus({preventScroll:true})}},0)}
function change(fn,focus){fn();save();render();if(focus)rf(focus)}
Object.assign(acts,{
  exam:function(){startRun({mode:'exam',title:'Mock Exam',pool:ALL,qs:blueprintExam()})},
  tddate:function(v){var n={w1:5,w2:14,m1:30}[v];if(!n)return;
    change(function(){var t=T();t.date=addDays(n);t.dsrc=v;t.ns=false},'[data-act="tddate"][data-v="'+v+'"]');
    toast('Test day set for '+fmtDate(T().date)+'. Change it any time.')},
  tdns:function(){change(function(){var t=T();t.ns=true;t.date='';t.dsrc='ns'},'[data-act="tdns"]')},
  tdmin:function(v){change(function(){T().mins=+v},'[data-act="tdmin"][data-v="'+v+'"]')},
  tdwhen:function(v){change(function(){var t=T();t.when=String(v);t.wskip=false},'[data-act="tdwhen"][data-v="'+v+'"]')},
  tdwskip:function(){change(function(){T().wskip=true},'.tdcard .tdhead [data-act]')},
  tdsnooze:function(){change(function(){T().snooze=today()},'main h1')},
  tdedit:function(){ui.tdEdit=true;render();rf('.tdsetup [data-act],.tdcard [data-act]')},
  tddone:function(){ui.tdEdit=false;var t=T();if(!t.mins)t.mins=10;if(!t.when)t.wskip=true;save();render()},
  tddrill:function(v){drill(v)},
  tdweak:function(){drill(weakestId())},
  tdfix:function(v){fixRun(v?+v:undefined)},
  tdcover:function(v){coverRun(v||undefined)},
  tdcram:function(v){cramRun(v?+v:undefined)}
});
document.addEventListener('change',function(e){
  var el=e.target;if(!el||!el.matches)return;
  if(el.matches('input[data-tddate]')){var v=el.value;if(!validDate(v))return;
    change(function(){var t=T();t.date=v;t.dsrc='pick';t.ns=false});toast('Test day set for '+fmtDate(v)+'.')}
  else if(el.matches('input[data-tdwhen]')){var s=el.value.replace(/[<>&"']/g,'').trim().slice(0,24);if(!s)return;
    change(function(){var t=T();t.when=s;t.wskip=false})}
});

/* ---------- the day changes while the app is open ---------- */
/* "Test day is tomorrow" must turn into "today" at midnight, and again when the app comes back from the background. */
var lastDay=today();
function dayCheck(){var d=today();if(d===lastDay)return;
  if(ui.run||ui.lesson||ui.result||ui.ob||ui.notes||ui.sheet||X.modalOpen())return;lastDay=d;render()}
function armMidnight(){var n=new Date(),ms=new Date(n.getFullYear(),n.getMonth(),n.getDate()+1,0,0,1)-n;
  setTimeout(function(){dayCheck();armMidnight()},Math.max(1000,Math.min(ms+300,2147000000)))}
armMidnight();
document.addEventListener('visibilitychange',function(){if(!document.hidden)dayCheck()});
window.addEventListener('pageshow',dayCheck);window.addEventListener('focus',dayCheck);
window.xDayCheck=dayCheck;
})();

}catch(e){X.err("x_testday",e)}

/* ---- x_tone.js ---- */
try{
/* X tone: kind, plain voice for low scores and lapses. Wording and small hooks only.
   - fail scenes on result screens are gentle (pit stop, flat tire, detour), never a crash with a burst
   - score tiers pick the scene; stars are explained on the stop sheet and result
   - streak lapse: one kind message on the next open, Welcome back card text that tells the truth
   - game loss: "Try an easier level" after two losses in a row at a level above 1
   - predicted score wording (numbers come from x_testday.js)
   State: S.x.tone only. */
(function(){
var SOFT=[2,3,4,5,9];
function ST(){var x=S.x&&typeof S.x==='object'?S.x:(S.x={});return x.tone&&typeof x.tone==='object'?x.tone:(x.tone={})}
function dayDiff(a,b){return Math.round((new Date(b+'T00:00')-new Date(a+'T00:00'))/864e5)}
function rnd(n){return Math.floor(Math.random()*n)}

/* ---------- scenes: gentle for low scores, light for first stars ---------- */
var LIGHT_STOP=[['zoom','🏁','Star earned. The road is open.'],['hop','⭐','Over the speed bump. Star earned.'],['sunset','🌅','A good lap. Star earned.'],['highfive','🚙','Car high-five. Star earned.']];
var LIGHT_RUN=[['zoom','🏁','Nice lap. Keep rolling.'],['hop','⭐','Over the speed bump. Keep rolling.'],['sunset','🌅','A good lap. Keep going.'],['highfive','🚙','Car high-five. Nice work.']];
function softScene(){
 var P=window.fxPools;if(!P)return null;
 var j=SOFT[rnd(SOFT.length)],k=P.FAIL[j],v=k[1][rnd(3)];
 return{good:false,kind:k[0],prop:v[0],cap:v[1],n:j+1}}
function lightScene(mode){
 var a=(mode==='stop'?LIGHT_STOP:LIGHT_RUN)[rnd(4)];
 return{good:true,kind:a[0],prop:a[1],cap:a[2],n:0}}
X.wrap('window.fxStage',function(prev){return function(good,holder){
 var res=holder&&holder.mode&&holder.total,pct=res?Math.round(holder.correct/holder.total*100):null;
 if(res){
  if(holder.mode!=='exam'&&holder.mode!=='stop')good=pct>=60;
  if(!holder.scene){
   if(!good){var s=softScene();if(s)holder.scene=s}
   else if(holder.mode!=='exam'&&pct<70)holder.scene=lightScene(holder.mode)}}
 var h=prev.call(this,good,holder);
 if(res&&!good){h=h.replace('class="fxs ','class="fxs fxsoft ').replace('<span class="fxb">💥</span>','<span class="fxb">🔧</span>')}
 return h}});

/* ---------- stars: say the rule where the player is ---------- */
var STAR_LEGEND='Stars: 5 of 10 right earns 1 star, 7 earns 2, 9 earns 3.';
function need(p,total){return Math.ceil(p*total-1e-9)}
function starNote(x){
 var t=x.total||10,c=x.correct||0,n1=need(.5,t),n2=need(.7,t),n3=need(.9,t),st=x.stars|0,m;
 if(st===0){var more=n1-c;
  m='A star needs '+n1+' of '+t+' right. You got '+c+', so '+(more>1?more+' more right':'1 more right')+' earns your first one.'}
 else if(st===1)m='1 star earned. '+n2+' of '+t+' right earns 2 stars.';
 else if(st===2)m='2 stars. '+n3+' of '+t+' right earns 3 stars.';
 else m='3 stars. That is the top mark.';
 var btn=st===0&&x.chapter?'<button class="btn small line" data-act="notes" data-v="'+esc(x.chapter)+'" style="margin-top:8px">Read the study notes</button>':'';
 return'<div class="tonestars center" style="margin:10px 0"><p style="margin:0"><b>'+esc(m)+'</b></p><p class="muted" style="margin:4px 0 0;font-size:13px">'+esc(STAR_LEGEND)+'</p>'+btn+'</div>'}
X.wrap('ixResult',function(prev){return function(x){
 var h=prev.apply(this,arguments);
 try{if(x&&x.mode==='stop')h=starNote(x)+h}catch(e){X.err('tone.star',e)}
 return h}});
X.wrap('sheetView',function(prev){return function(){
 var h=prev.apply(this,arguments),k='<button class="btn primary" data-act="stop"';
 var i=h.indexOf(k);
 return i<0?h:h.slice(0,i)+'<p class="muted tonestarlg" style="margin:0 0 10px">'+esc(STAR_LEGEND)+'</p>'+h.slice(i)}});

/* ---------- streak lapse ---------- */
function shieldCount(){var e=S.x&&S.x.engage;return e?(e.shields|0):0}
function shieldLine(){return shieldCount()>0?'Your Streak Shield covers one missed day, and this break was longer.':'You earn your first Streak Shield at day 7. It covers one missed day.'}
function lapseNow(){
 if(!S.last||!S.runs||S.last===today())return 0;
 if(dayDiff(S.last,today())<2||streakNow()>0)return 0;
 return(S.streak|0)>=2?S.streak|0:0}
function detect(){
 var n=lapseNow(),t=ST();
 if(n&&(!t.lost||t.lost.d!==S.last)){t.lost={n:n,d:S.last,shown:0};try{save()}catch(e){}}
 if(t.lost&&S.last===today()&&t.lost.d!==S.last&&t.lost.cleared!==1){t.lost.cleared=1}
 return t.lost&&!t.lost.cleared?t.lost:null}
function lostMsg(n){return'Your '+n+' day streak took a break. Day 1 starts today, and a Daily Drive keeps it going.'}
window.xToneLostMsg=lostMsg;
window.xToneBack=function(away){
 var l=null;try{l=detect()}catch(e){}
 var head='<b>Welcome back. Ready for a quick 5 question round?</b>',p='<p class="muted" style="margin:4px 0 10px">';
 if(l&&l.n>=2){var best=(S.best|0)>l.n?' Your best is '+S.best+' days.':'';
  return head+p+esc(lostMsg(l.n))+best+' '+esc(shieldLine())+'</p>'}
 if(streakNow()>0)return head+p+'A 5 question Daily Drive keeps your streak going and your answers fresh.</p>';
 return head+p+'A 5 question Daily Drive is a quick way back in. It starts a new streak.</p>'};
X.after(function(){
 var l=detect();
 if(l&&!l.shown&&l.n>=2){l.shown=1;try{save()}catch(e){}
  if(typeof toast==='function')toast(lostMsg(l.n))}});

try{if(detect()&&!ui.run&&!ui.lesson)render()}catch(e){X.err('tone.lapse',e)}

/* ---------- game loss: offer an easier level after two losses in a row ---------- */
var lose={};
X.wrap('GP.end',function(prev){return function(){
 try{var e=GP.eng;if(e){var k=GP.id+':'+GP.L;if(e.status==='win')delete lose[k];else lose[k]=(lose[k]|0)+1}}catch(err){X.err('tone.lose',err)}
 return prev.apply(this,arguments)}});
window.xToneEasier=function(id,L){
 if(!(L>1)||(lose[id+':'+L]|0)<2)return'';
 return'<button class="btn ghost" data-g="easier" style="margin-top:10px">Try an easier level (level '+(L-1)+')</button>'};

/* ---------- predicted score wording ---------- */
window.xToneReady=function(r){
 var t=ST(),h=t.h&&typeof t.h==='object'?t.h:(t.h={}),d=today(),trend=0,keys,i;
 if(r&&r.ok&&h[d]!==r.mean){h[d]=r.mean;keys=Object.keys(h).sort();while(keys.length>21)delete h[keys.shift()];try{save()}catch(e){}}
 if(r&&r.ok){keys=Object.keys(h).sort();
  for(i=0;i<keys.length;i++){var g=dayDiff(keys[i],d);if(g>=1&&g<=7){trend=r.mean-h[keys[i]];break}}}
 var early=r.answered<60,up=trend>=3;
 return{
  sub:(early?'Early estimate of your mock exam score, based on '+r.answered+' answers.':'Estimated mock exam score, based on '+r.answered+' answers.')+(up?' Up '+trend+' points this week.':''),
  note:'The real test passes at 80%. Most people need a few rounds to get there, and this number moves up as you practice. It is a guide, not a promise.',
  chip:up?'Up '+trend+' this week':(early?'Early guess, '+r.answered+' answers':'Based on '+r.answered+' answers')}};
})();

}catch(e){X.err("x_tone",e)}

try{X.boot()}catch(e){}
