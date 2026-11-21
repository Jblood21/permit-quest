'use strict';
/* Permit Quest: offline Utah permit practice. All data lives on this device. */
const KEY='permitquest-v1';
const LEVELS=[0,100,250,500,900,1400,2000,2800];
const RANKS=['Parking Lot Rookie','Neighborhood Cruiser','Lane Keeper','Merge Master','Highway Hero','Road Boss','Permit Legend','Permit Legend'];
const EXAM_N=50,PASS=0.8;
const ALL=CHAPTERS.flatMap(c=>c.qs.map(q=>Object.assign({ch:c.id},q)));
const BYID=new Map(ALL.map(q=>[q.id,q]));
const CH=new Map(CHAPTERS.map(c=>[c.id,c]));
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const dstr=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const today=()=>dstr(new Date());
const yest=()=>{const d=new Date();d.setDate(d.getDate()-1);return dstr(d)};

/* ---------- state ---------- */
const fresh=()=>({v:1,xp:0,streak:0,best:0,last:'',q:{},stars:{},exams:[],badges:{},daily:'',runs:0,perfect:0,combo:0,hideInstall:false,seenOffline:false});
let S=fresh();
try{const v=JSON.parse(localStorage.getItem(KEY)||'null');if(v&&typeof v==='object'&&v.q)S=Object.assign(fresh(),v)}catch(e){}
let saveWarned=false;
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){if(!saveWarned){saveWarned=true;toast('This device would not save your progress. Make a backup code in Me.')}}}
let ui={tab:'road',sheet:null,notes:null,run:null,result:null,offline:false};

/* ---------- helpers ---------- */
const st=id=>S.q[id]||[0,0,0];
const mastered=id=>st(id)[0]>=3;
const isWeak=id=>{const a=st(id);return a[2]>0&&a[0]<=2};
const nMastered=()=>ALL.filter(q=>mastered(q.id)).length;
const levelOf=xp=>{let i=0;LEVELS.forEach((v,k)=>{if(xp>=v)i=k});return i};
const streakNow=()=>(S.last===today()||S.last===yest())?S.streak:0;
const totalStars=()=>Object.values(S.stars).reduce((a,b)=>a+b,0);
const stars=id=>S.stars[id]||0;
const unlocked=i=>i===0||stars(CHAPTERS[i-1].id)>=1;
function priority(q){const a=st(q.id),n=a[1]+a[2];let w=n===0?2:[3,2.5,1.5,.8,.3][a[0]];if(a[2]>0&&a[0]<=1)w+=.5;return w+Math.random()}
const pick=(pool,n)=>pool.map(q=>[priority(q),q]).sort((a,b)=>b[0]-a[0]).slice(0,n).map(x=>x[1]);
function nextStop(){for(let i=0;i<CHAPTERS.length;i++)if(unlocked(i)&&stars(CHAPTERS[i].id)===0)return CHAPTERS[i];
  let best=null;for(let i=0;i<CHAPTERS.length;i++){const c=CHAPTERS[i];if(unlocked(i)&&stars(c.id)<3&&(!best||stars(c.id)<stars(best.id)))best=c}return best}
function tick(){const t=today();if(S.last===t)return;S.streak=S.last===yest()?S.streak+1:1;S.last=t;S.best=Math.max(S.best,S.streak)}
function toast(msg){const o=$('.toast');if(o)o.remove();const d=document.createElement('div');d.className='toast';d.setAttribute('role','status');d.textContent=msg;document.body.appendChild(d);setTimeout(()=>d.remove(),2800)}
const starStr=n=>[1,2,3].map(i=>`<span class="${i<=n?'on':''}">★</span>`).join('');
const visHTML=q=>q.vis&&VIS[q.vis]?`<div class="vis">${VIS[q.vis]}</div>`:'';

const BADGES=[
 {id:'first',e:'🚗',n:'First Drive',d:'Finish your first run',t:()=>S.runs>=1},
 {id:'perfect',e:'💯',n:'Perfect Run',d:'Get every question right on the first try',t:()=>S.perfect>=1},
 {id:'combo',e:'⚡',n:'Combo Driver',d:'Get 10 in a row',t:()=>S.combo>=10},
 {id:'streak3',e:'🔥',n:'On Fire',d:'Practice 3 days in a row',t:()=>S.best>=3},
 {id:'streak7',e:'🗓️',n:'Week Warrior',d:'Practice 7 days in a row',t:()=>S.best>=7},
 {id:'signs',e:'🛑',n:'Sign Master',d:'3 stars on Road Signs',t:()=>stars('signs')>=3},
 {id:'sober',e:'🚫',n:'Clear Head',d:'3 stars on Alcohol & Drugs',t:()=>stars('alcohol')>=3},
 {id:'stars10',e:'⭐',n:'Star Collector',d:'Earn 10 stars',t:()=>totalStars()>=10},
 {id:'road',e:'🗺️',n:'Whole Road',d:'Earn a star on every stop',t:()=>CHAPTERS.every(c=>stars(c.id)>=1)},
 {id:'m50',e:'🧠',n:'50 Mastered',d:'Master 50 questions',t:()=>nMastered()>=50},
 {id:'m150',e:'🎓',n:'150 Mastered',d:'Master 150 questions',t:()=>nMastered()>=150},
 {id:'boss',e:'🏁',n:'Boss Beaten',d:'Pass a mock exam (80%+)',t:()=>S.exams.some(e=>e.s/e.n>=PASS)}
];

/* ---------- runs ---------- */
function startRun(o){
  const pool=o.pool;if(!pool.length){toast('Nothing to practice here yet.');return}
  const qs=o.mode==='exam'?shuffle(pool).slice(0,EXAM_N):pick(pool,o.n);
  ui.run={mode:o.mode,title:o.title,chapter:o.chapter||null,queue:qs.map(q=>({q,retry:false})),i:0,first:{},picks:{},combo:0,best:0,xp:0,ok:0,locked:false,sel:null,opts:null};
  ui.sheet=null;ui.result=null;ui.notes=null;newItem();render();window.scrollTo(0,0)}
const startStop=id=>{const c=CH.get(id);startRun({mode:'stop',title:c.name,chapter:id,pool:ALL.filter(q=>q.ch===id),n:10})};
const startDaily=()=>{if(S.daily===today()){toast('Daily Drive is done. Come back tomorrow.');return}startRun({mode:'daily',title:'Daily Drive',pool:ALL,n:5})};
const startReview=()=>{const w=ALL.filter(q=>isWeak(q.id));startRun({mode:'review',title:'Fix My Mistakes',pool:w.length?w:ALL,n:10})};
const startExam=()=>startRun({mode:'exam',title:'Mock Exam',pool:ALL});
function newItem(){const r=ui.run,q=r.queue[r.i].q;r.opts=shuffle(q.o);r.locked=false;r.sel=null;const p=r.picks[q.id];if(r.mode==='exam'&&p!==undefined)r.sel=r.opts.indexOf(p)}
function srs(id,ok){const a=(S.q[id]||[0,0,0]).slice();a[0]=ok?Math.min(4,a[0]+1):0;ok?a[1]++:a[2]++;S.q[id]=a}
function answer(i){
  const r=ui.run;if(!r||r.locked)return;const item=r.queue[r.i],q=item.q,pick=r.opts[i],ok=pick===q.a;
  if(r.mode==='exam'){r.sel=i;r.picks[q.id]=chosen;render();return}
  r.locked=true;r.sel=i;r.last={ok,gain:0};tick();
  if(!item.retry){srs(q.id,ok);r.first[q.id]=ok;
    if(ok){r.combo++;r.best=Math.max(r.best,r.combo);r.ok++;const g=5+(r.combo>=6?4:r.combo>=3?2:0);r.xp+=g;r.last.gain=g}
    else{r.combo=0;r.xp+=1;r.last.gain=1;r.queue.push({q,retry:true})}
  }else if(ok){r.xp+=2;r.last.gain=2}
  S.combo=Math.max(S.combo,r.best);save();render()}
function next(){const r=ui.run;r.i++;if(r.i>=r.queue.length){finish();return}newItem();render();const b=$('.runbody');if(b)b.scrollTop=0}
function finish(){
  const r=ui.run,lvBefore=levelOf(S.xp),ids=Object.keys(r.first);let correct,total,pass=null,xpGain,stg=0;
  if(r.mode==='exam'){tick();r.queue.forEach(({q})=>{const ok=r.picks[q.id]===q.a;r.first[q.id]=ok;srs(q.id,ok)});
    total=r.queue.length;correct=r.queue.filter(({q})=>r.first[q.id]).length;pass=correct/total>=PASS;xpGain=correct*2+(pass?100:0);
    S.exams.unshift({t:Date.now(),s:correct,n:total});S.exams=S.exams.slice(0,30)}
  else{total=ids.length;correct=ids.filter(k=>r.first[k]).length;xpGain=r.xp+15;
    const pct=correct/total;stg=pct>=.9?3:pct>=.7?2:pct>=.5?1:0;
    if(r.chapter){if(stg>stars(r.chapter))S.stars[r.chapter]=stg;xpGain+=stg*10}
    if(r.mode==='daily'&&S.daily!==today()){S.daily=today();xpGain+=30}
    if(correct===total&&total>=5)S.perfect++}
  S.xp+=xpGain;S.runs++;
  const newB=BADGES.filter(b=>!S.badges[b.id]&&b.t());newB.forEach(b=>S.badges[b.id]=Date.now());save();
  const wrong=ids.filter(k=>!r.first[k]).map(k=>BYID.get(k));
  ui.result={mode:r.mode,title:r.title,chapter:r.chapter,correct,total,pass,xpGain,stars:stg,best:r.best,wrong,newB,lvUp:levelOf(S.xp)>lvBefore,lv:levelOf(S.xp)};
  ui.run=null;render();window.scrollTo(0,0)}

/* ---------- views ---------- */
function header(){const xp=S.xp,i=levelOf(xp),lo=LEVELS[i],hi=LEVELS[i+1]||lo,pct=hi>lo?(xp-lo)/(hi-lo)*100:100;
  return `<header class="top"><div class="toprow"><button class="logo" data-act="tab" data-v="road" aria-label="Permit Quest home"><i>🚘</i><span>Permit Quest</span></button><div class="chips"><span class="chip" aria-label="${streakNow()} day streak">🔥 ${streakNow()}</span><span class="chip" aria-label="${xp} XP">⭐ ${xp}</span></div></div>
  <div class="lvl"><small><span>Level ${i+1} · ${RANKS[i]}</span><span>${hi>lo?(hi-xp)+' XP to next':'Max level'}</span></small><div class="bar"><b style="width:${pct}%"></b></div></div></header>`}
function tabs(){const t=[['road','🗺️','Road'],['exam','🏁','Exam'],['review','🎯','Review'],['me','🏅','Me']];
  return `<nav class="tabs" aria-label="Main"><div>${t.map(x=>`<button class="tab ${ui.tab===x[0]?'on':''}" data-act="tab" data-v="${x[0]}" aria-current="${ui.tab===x[0]}"><span>${x[1]}</span>${x[2]}</button>`).join('')}</div></nav>`}
const isIOS=()=>/iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
const standalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
function roadTab(){
  const m=nMastered(),pct=Math.round(m/ALL.length*100),nx=nextStop(),first=S.runs===0,dd=S.daily===today(),last=S.exams[0];
  const ready=pct>=85&&last&&last.s/last.n>=PASS;
  const install=isIOS()&&!standalone()&&!S.hideInstall?`<div class="card hl"><b>Use it offline on your iPhone</b><p class="muted" style="margin:4px 0 10px">Open this page in Safari. Tap Share, then Add to Home Screen. After that it works with no internet.</p><button class="btn small ghost" data-act="hideinstall">Got it</button></div>`:'';
  return `${install}<div class="card cta">${nx?`<div class="kicker">${first?'Start here':'Up next'}</div><h3>${first?'Your first drive: ':''}${nx.icon} ${esc(nx.name)}</h3><button class="btn primary" data-act="stop" data-v="${nx.id}">${first?'Start driving':'Continue'}</button>`:`<div class="kicker">Road complete</div><h3>All stops at 3 stars</h3><button class="btn primary" data-act="exam">Take the mock exam</button>`}</div>
  <button class="card daily btn line" style="width:100%;margin:10px 0" data-act="daily"><span class="ic">${dd?'✅':'☀️'}</span><span><b>Daily Drive</b><span class="muted">${dd?'Done today. Back tomorrow.':'5 quick questions · +30 bonus XP'}</span></span></button>
  <div class="card"><div class="ready"><b>Permit readiness</b><strong>${pct}%</strong></div><div class="track"><b style="width:${pct}%"></b></div><div class="muted">${ready?'You are ready to take the real test. Good luck.':m+' of '+ALL.length+' questions mastered. Reach 85% and pass a mock exam to be ready.'}</div></div>
  <h2>The road</h2><div class="road">${CHAPTERS.map((c,i)=>{const lk=!unlocked(i),s=stars(c.id),mm=ALL.filter(q=>q.ch===c.id&&mastered(q.id)).length,n=c.qs.length;
    return `<button class="stop ${lk?'locked':s?'done':'open'}" data-act="${lk?'locked':'sheet'}" data-v="${c.id}"><span class="node">${lk?'🔒':c.icon}</span><span class="info"><b>${esc(c.name)}</b><span class="muted">${mm}/${n} mastered</span></span><span class="stars">${starStr(s)}</span></button>`}).join('')}</div>`}
function examTab(){const h=S.exams.slice(0,5);
  return `<h2>Mock exam</h2><div class="card"><p style="margin:0 0 10px">${EXAM_N} mixed questions. No answers shown until the end. You need ${Math.round(PASS*100)}% to pass, the same pass mark as the real written test.</p><p class="muted" style="margin:0 0 14px">The real test's question count is set by the Driver License Division. This is practice for the format.</p><button class="btn primary" data-act="exam">Start mock exam</button></div>
  <div class="card"><h3>Recent results</h3>${h.length?h.map(e=>{const p=Math.round(e.s/e.n*100),ok=e.s/e.n>=PASS;return `<div class="row" style="padding:8px 0;border-bottom:1px solid var(--edge)"><span class="muted" style="flex:2">${new Date(e.t).toLocaleDateString(undefined,{month:'short',day:'numeric'})}</span><b style="flex:1">${e.s}/${e.n}</b><span style="flex:1;text-align:right;font-weight:800;color:${ok?'var(--green)':'var(--red)'}">${p}% ${ok?'Pass':'Retry'}</span></div>`}).join(''):'<p class="muted" style="margin:6px 0 0">No exams yet. Take one after a few stops.</p>'}</div>`}
function reviewTab(){const w=ALL.filter(q=>isWeak(q.id));
  return `<h2>Fix my mistakes</h2><div class="card"><div class="ready"><b>Weak spots</b><strong>${w.length}</strong></div><p class="muted" style="margin:6px 0 14px">${w.length?'Questions you missed stay here until you get them right again. Short, focused rounds.':'Nothing to fix right now. Practice a few stops and anything you miss will show up here.'}</p><button class="btn primary" data-act="review">${w.length?'Practice weak spots':'Practice a mixed set'}</button></div>
  ${w.length?`<div class="card"><h3>Topics with weak spots</h3>${CHAPTERS.map(c=>[c,w.filter(q=>q.ch===c.id).length]).filter(x=>x[1]).sort((a,b)=>b[1]-a[1]).map(([c,n])=>`<div class="row" style="padding:8px 0;border-bottom:1px solid var(--edge)"><span style="flex:3">${c.icon} ${esc(c.name)}</span><b style="flex:1;text-align:right">${n}</b></div>`).join('')}</div>`:''}`}
function meTab(){const m=nMastered(),i=levelOf(S.xp);
  const code=()=>btoa(unescape(encodeURIComponent(JSON.stringify(S))));
  return `<h2>Me</h2><div class="card"><div class="stat3" style="margin-top:0"><div><b>${S.xp}</b><small>XP</small></div><div><b>${streakNow()}</b><small>Day streak</small></div><div><b>${S.best}</b><small>Best streak</small></div><div><b>${m}</b><small>Mastered</small></div><div><b>${totalStars()}</b><small>Stars</small></div><div><b>${S.runs}</b><small>Runs</small></div></div><p class="muted" style="margin:0">Level ${i+1}: ${RANKS[i]}</p></div>
  <div class="card"><h3>Badges</h3>${BADGES.map(b=>`<div class="badge ${S.badges[b.id]?'':'off'}"><span class="e">${b.e}</span><span><b>${b.n}</b><span class="muted">${b.d}</span></span></div>`).join('')}</div>
  <div class="card"><h3>Offline</h3><p class="muted" style="margin:0">${ui.offline?'✅ Offline ready. You can use Permit Quest with no internet.':location.protocol==='file:'?'Open the hosted web address to turn on offline mode.':'Getting ready for offline use. Keep this page open a moment.'}</p></div>
  <div class="card"><h3>Back up your progress</h3><p class="muted" style="margin:0 0 10px">Your progress is saved on this phone. A backup code lets you move it to a new phone or restore it.</p><textarea class="code" id="code" aria-label="Backup code" autocapitalize="off" autocorrect="off" spellcheck="false"></textarea><div class="row" style="margin-top:10px"><button class="btn small ghost" data-act="copy">Copy code</button><button class="btn small ghost" data-act="restore">Restore from code</button></div><p class="muted" style="margin:10px 0 0">To restore, paste a code into the box above, then tap Restore.</p></div>
  <div class="card"><h3>About the questions</h3><p class="muted" style="margin:0">Practice questions written from the 2026 Utah Driver Handbook (dld.utah.gov). They are not the official test. The handbook is the final word, so read it too.</p></div>
  <button class="btn danger small" data-act="reset">Reset all progress</button><div id="codeval" hidden>${code()}</div>`}
function sheetView(){const c=CH.get(ui.sheet),qs=ALL.filter(q=>q.ch===c.id),mm=qs.filter(q=>mastered(q.id)).length,seen=qs.filter(q=>st(q.id)[1]+st(q.id)[2]>0).length;
  return `<div class="sheetbg" data-act="closesheet"><div class="sheet" role="dialog" aria-label="${esc(c.name)}" data-stop="1"><div class="row" style="align-items:flex-start"><div style="flex:3"><h2>${c.icon} ${esc(c.name)}</h2><div class="stars">${starStr(stars(c.id))}</div></div></div><div class="stat3"><div><b>${qs.length}</b><small>Questions</small></div><div><b>${seen}</b><small>Tried</small></div><div><b>${mm}</b><small>Mastered</small></div></div><button class="btn primary" data-act="stop" data-v="${c.id}">Start ${Math.min(10,qs.length)} questions</button><button class="btn ghost" data-act="notes" data-v="${c.id}">Study notes</button></div></div>`}
function shell(){const body=ui.tab==='road'?roadTab():ui.tab==='exam'?examTab():ui.tab==='review'?reviewTab():meTab();
  return header()+`<main>${body}</main>`+tabs()+(ui.sheet?sheetView():'')}
function runView(){const r=ui.run,item=r.queue[r.i],q=item.q,ex=r.mode==='exam';
  const pct=Math.round(r.i/r.queue.length*100)+(r.locked?Math.round(100/r.queue.length):0);
  const opts=r.opts.map((o,i)=>{let cls='';if(ex){if(r.sel===i)cls='sel'}else if(r.locked){if(o===q.a)cls='ok';else if(i===r.sel)cls='bad';else cls='dim'}
    return `<button class="opt ${cls}" data-act="ans" data-v="${i}" ${r.locked?'aria-disabled="true"':''}><span class="k">${'ABCD'[i]}</span><span>${esc(o)}</span></button>`}).join('');
  let foot='';
  if(ex){const last=r.i===r.queue.length-1;foot=`<div class="foot"><button class="btn primary" data-act="next" ${r.sel===null?'disabled style="opacity:.4"':''}>${last?'Finish exam':'Next'}</button></div>`}
  else if(r.locked){const ok=r.last.ok;foot=`<div class="fb ${ok?'ok':'bad'}" aria-live="polite"><h3><span>${ok?['Correct','Nice','Yes','Right on'][r.i%4]:'Not quite'}</span><span class="xp">+${r.last.gain} XP</span></h3><p>${ok?'':'The answer is: <b>'+esc(q.a)+'</b>. '}${esc(q.why)}</p><button class="btn primary" data-act="next">${r.i===r.queue.length-1?'See results':'Continue'}</button></div>`}
  return `<div class="run"><div class="runtop"><button class="x" data-act="quit" aria-label="Quit">✕</button><div class="prog"><b style="width:${pct}%"></b></div><div class="combo ${r.combo>=3?'hot':''}">${ex?(r.i+1)+'/'+r.queue.length:'🔥 '+r.combo}</div></div>
  <div class="runbody"><div class="qtag">${esc(ex?'Mock exam':CH.get(q.ch).name)}${item.retry?'<span class="retry">Try again</span>':''}</div>${visHTML(q)}<div class="q">${esc(q.q)}</div>${opts}</div>${foot}</div>`}
function resultView(){const x=ui.result,pct=Math.round(x.correct/x.total*100),ex=x.mode==='exam',nx=nextStop();
  const head=ex?`<div class="big pop" style="color:${x.pass?'var(--green)':'var(--red)'}">${pct}%</div><h2 style="margin-top:10px">${x.pass?'You passed!':'Not yet. Keep practicing.'}</h2><p class="muted">${x.correct} of ${x.total} correct. You need ${Math.round(PASS*100)}% to pass.</p>`
    :`<div class="star3">${x.mode==='stop'?[1,2,3].map(i=>`<span class="${i<=x.stars?'on':''}">★</span>`).join(''):(pct>=90?'🏆':pct>=60?'👍':'💪')}</div><div class="big" style="margin-top:8px">${pct}%</div><h2 style="margin-top:10px">${pct>=90?'Excellent drive':pct>=70?'Good drive':'Keep going'}</h2><p class="muted">${x.correct} of ${x.total} right on the first try.</p>`;
  const chips=`<div class="gain"><span>+${x.xpGain} XP</span>${x.best>=3?`<span>⚡ Best combo ${x.best}</span>`:''}${x.lvUp?`<span>🎉 Level ${x.lv+1}: ${RANKS[x.lv]}</span>`:''}</div>`;
  const nb=x.newB.length?`<div class="card hl center"><b>New badge${x.newB.length>1?'s':''}</b>${x.newB.map(b=>`<div style="margin-top:6px"><span style="font-size:26px">${b.e}</span> <b>${b.n}</b></div>`).join('')}</div>`:'';
  const wr=x.wrong.length?`<div class="card"><h3>${x.wrong.length} to review</h3>${x.wrong.map(q=>`<div class="wrong"><b>${esc(q.q)}</b><br><span>${esc(q.a)}</span><br><small>${esc(q.why)}</small></div>`).join('')}</div>`:'';
  const primary=ex&&!x.pass?`<button class="btn primary" data-act="review">Practice weak spots</button>`:(!ex&&nx&&x.mode!=='review'&&x.mode!=='daily'?`<button class="btn primary" data-act="stop" data-v="${nx.id}">Keep going: ${esc(nx.name)}</button>`:`<button class="btn primary" data-act="home">Back to the road</button>`);
  const sec=primary.includes('data-act="home"')?'':`<button class="btn line" data-act="home" style="margin-top:10px">Back to the road</button>`;
  return `<div style="max-width:560px;margin:0 auto;padding:calc(28px + env(safe-area-inset-top)) 16px calc(32px + env(safe-area-inset-bottom))"><div class="center"><p class="eyebrow">${esc(x.title)}</p>${head}${chips}</div>${nb}${wr}<div style="margin-top:14px">${primary}${sec}</div></div>`}
function notesView(){const c=CH.get(ui.notes);
  return `<div class="top"><div class="toprow"><button class="x" data-act="closenotes" aria-label="Back" style="color:#fff">←</button><b style="flex:1">${c.icon} ${esc(c.name)}</b></div></div><main><p class="muted" style="margin-top:0">Key facts for this stop. Read them, then start a run.</p><div class="card">${c.qs.map(q=>`<div class="note">${visHTML(q)}<small>${esc(q.q)}</small><b>${esc(q.a)}</b><span class="muted">${esc(q.why)}</span></div>`).join('')}</div><button class="btn primary" data-act="stop" data-v="${c.id}">Start ${Math.min(10,c.qs.length)} questions</button><p class="muted center">${esc(c.src)}</p></main>`}
function render(){const a=$('#app');a.innerHTML=ui.run?runView():ui.result?resultView():ui.notes?notesView():shell();
  if(!ui.run&&!ui.result&&!ui.notes&&ui.tab==='me'){const t=$('#code'),v=$('#codeval');if(t&&v)t.value=v.textContent}}

/* ---------- events ---------- */
const acts={
  tab:v=>{ui.tab=v;ui.sheet=null;render();window.scrollTo(0,0)},
  stop:v=>startStop(v),daily:()=>startDaily(),exam:()=>startExam(),review:()=>startReview(),
  sheet:v=>{ui.sheet=v;render()},closesheet:()=>{ui.sheet=null;render()},
  locked:v=>{const i=CHAPTERS.findIndex(c=>c.id===v);toast('Earn a star on '+CHAPTERS[i-1].name+' to unlock this stop.')},
  notes:v=>{ui.notes=v;ui.sheet=null;render();window.scrollTo(0,0)},closenotes:()=>{ui.notes=null;render()},
  ans:v=>answer(+v),next:()=>next(),
  quit:()=>{const r=ui.run;if(r.i>0&&!confirm('Leave this run? Your answers so far are saved, but you will not get stars or the finish bonus.'))return;ui.run=null;render()},
  home:()=>{ui.result=null;ui.tab='road';render();window.scrollTo(0,0)},
  hideinstall:()=>{S.hideInstall=true;save();render()},
  copy:async()=>{const t=$('#code'),mine=$('#codeval').textContent;t.value=mine;t.select();try{await navigator.clipboard.writeText(mine);toast('Backup code copied')}catch(e){try{document.execCommand('copy');toast('Backup code copied')}catch(_){toast('Press and hold the code to copy it')}}},
  restore:()=>{const t=$('#code'),raw=t.value.trim();if(!raw||raw===$('#codeval').textContent){toast('Paste a backup code into the box first.');return}
    try{const o=JSON.parse(decodeURIComponent(escape(atob(raw))));if(!o||typeof o!=='object'||!o.q||typeof o.xp!=='number')throw 0;
      if(!confirm('Replace the progress on this phone with the progress in this code?'))return;
      S=Object.assign(fresh(),o);save();toast('Progress restored');render()}catch(e){toast('That code did not work. Paste the whole code and try again.')}},
  reset:()=>{if(confirm('Erase all progress on this phone? This cannot be undone.')){S=fresh();save();toast('Progress reset');render()}}
};
document.addEventListener('click',e=>{
  const bg=e.target.closest('.sheetbg');if(bg&&!e.target.closest('[data-stop]')){acts.closesheet();return}
  const b=e.target.closest('[data-act]');if(!b||b.disabled)return;const f=acts[b.dataset.act];if(f)f(b.dataset.v)});
document.addEventListener('keydown',e=>{const r=ui.run;if(!r)return;const k={a:0,b:1,c:2,d:3}[e.key.toLowerCase()];if(k!==undefined&&!r.locked)answer(k);else if(e.key==='Enter'&&(r.locked||(r.mode==='exam'&&r.sel!==null)))next()});

/* ---------- offline ---------- */
if('serviceWorker' in navigator&&location.protocol.startsWith('http')){
  window.addEventListener('load',()=>{
    navigator.serviceWorker.register('sw.js').catch(()=>{});
    navigator.serviceWorker.ready.then(async()=>{try{const hit=await caches.match('questions.js');if(hit){ui.offline=true;if(!S.seenOffline){S.seenOffline=true;save();toast('Offline ready. Works without internet now.')}if(!ui.run&&!ui.result&&ui.tab==='me')render()}}catch(e){}});
  });
}
if(navigator.storage&&navigator.storage.persist)navigator.storage.persist().catch(()=>{});
render();
