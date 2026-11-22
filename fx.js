/* Permit Quest FX: synth music + sound effects, 30 pass scenes, 30 fail scenes, snarky feedback words. No audio files, works offline. */
(function(){
/* ---------- feedback words ---------- */
const OKW=['Correct','Nailed it','Smooth','Yes, driver','Green light','Spot on','Textbook','Boom','Clean','Good call','Right lane','Locked in','Sharp','That\'s the one'];
const BADW=['Not quite','Almost there','Not this time','Close one','Brakes!','Missed it','Detour','Tricky one','Check the why','Next time','Good to learn now','Wrong exit','Pump the brakes','Almost'];
const SUPW=['Tough one. Read the why, then you\'ve got it.','Tricky stretch. The why below helps.','Stay with it. This one sticks next time.'];
window.fxWord=(ok,i)=>{const p=ok?OKW:(typeof ui!=='undefined'&&ui.run&&ui.run.mm>=2?SUPW:BADW);return p[((i||0)*5+(S.runs||0)*3+(ok?1:2))%p.length]};
const HEAD=[[90,['Suspiciously good driving','Sharp driving','Cruise control earned']],[80,['Strong round. Nice and legal.','Solid. Blinker used.','Clean enough to brag']],[60,['Good practice lap','Steady progress. Keep it up.','Getting smoother every round']],[40,['Halfway there. Keep rolling.','A decent warm-up lap','Building speed. Go again.']],[0,['This one is tricky. Let\'s go over it.','Fresh start. You can do this.','Not a star yet. A quick read of the notes helps.']]];
window.fxHead=pct=>{const g=HEAD.find(h=>pct>=h[0])[1];return g[(S.runs||0)%g.length]};
window.fxIcon=pct=>pct>=90?'🏆':pct>=80?'🌟':pct>=60?'👍':pct>=40?'💪':'🌱';
const GWIN=['Level clear. Smooth.','Nailed it, no notes','That was clean','Easy. You made it look easy','Pit crew would be proud','Fast hands, calm brain','That was basically a victory lap','Coins incoming. You earned them','Smooth like fresh asphalt','Cheer captain energy, driver edition','Husky pride. Level clear.','Green flag all the way','Steady hands, clean run','Studying AND gaming. Multitasker.'];
const GLOSE=['Close one. Go again.','That one got away. Try again.','Plot twist: gravity won this round.','Even pros restart. Try again.','Pit stop. Go again.','Warm-up lap done. Go again.','Close call. Reset and go.','Tough level. You can beat it.','Round over. Ready for another?','Small bump. Back on the road.'];
let lastLose=-1;
const GW3=['Perfect run. Three stars.','Flawless. Smooth like fresh asphalt.','Three stars. Cheer captain energy, driver edition.','Husky pride. Perfect run.'],GW2=['Clean win. One more clean run for 3 stars.','Level clear. Two stars in the bank.','Steady hands, good run. 3 stars is close.','Green flag. Go for the third star next.'],GW1=['Level clear. Every win counts.','You made it through. Go again for more stars.','Level clear. Coins earned.','Made it. Smoother next time, if you want more stars.'];
window.fxGameWin=(L,stars)=>{const k=(L+(S.runs||0))%4;if(stars===3)return L===10?'Game mastered. Legend.':GW3[k];if(stars===2)return GW2[k];if(stars===1)return L===10?'Level 10 cleared. Come back for more stars.':GW1[k];return L===10?'Game mastered. Legend.':GWIN[(L+(S.runs||0))%GWIN.length]};
window.fxGameLose=()=>{let k;do{k=Math.floor(Math.random()*GLOSE.length)}while(k===lastLose);lastLose=k;return GLOSE[k]};

/* ---------- scenes: 10 motions x 3 props = 30 each ---------- */
const PASS=[
 ['zoom',[['🏁','Smooth. Parents will be impressed.'],['🍕','Zero mailboxes harmed. Pizza earned.'],['🎤','Every sign obeyed. Nice.']]],
 ['wheelie',[['✨','Technically illegal. Aesthetically correct.'],['🔥','Front wheels up. Speed limit still down.'],['😎','Please only do this on screen.']]],
 ['donut',[['💨','Parking lot energy. Digital parking lot.'],['🌀','Dizzy, but legally correct.'],['🎡','Spin to win. Not on real roads.']]],
 ['hop',[['🎉','Speed bump? Barely noticed.'],['🐸','Bouncy. Suspension: unbothered.'],['⭐','Nice hops. Suspension holds.']]],
 ['sunset',[['🌅','Riding into the sunset. Blinker on.'],['🌄','Golden hour, golden score.'],['🌇','See you at the DMV, driver.']]],
 ['drift',[['💨','Farmington drift. Fully signaled.'],['🧊','Smooth as fresh ice at the rink.'],['😮‍💨','Fast, furious, and 25 in the school zone.']]],
 ['nitro',[['🔥','Nitro! Still 25 by the school though.'],['🚀','Gone before the quiz even ended.'],['⚡','Turbo unlocked by pure facts.']]],
 ['lap',[['👋','Victory lap. Wave to the crowd.'],['🍟','Lap done. Drive-thru is calling.'],['🏆','Winners idle in the parking lot.']]],
 ['launch',[['🎆','Great jump. Not for Main Street.'],['🛹','Skate park, but a car.'],['🎬','Stunt double sold separately.']]],
 ['highfive',[['🚙','Car high-five. Mirrors in sync.'],['🚓','Even the cop honked. Respect.'],['🛻','Beep beep! Fellow drivers approve.']]]
];
const FAIL=[
 ['bump',[['📬','Mailbox says hi. No damage.'],['🚧','Cone says hi. No harm done.'],['🗑️','Trash can: unmoved. Car: fine.']]],
 ['spin',[['🌀','Spun out. Easy to fix.'],['😵‍💫','Whoops. Reset and go.'],['🎢','Wrong exit. The next one is right.']]],
 ['flat',[['🛞','Flat tire. Pulled over safely.'],['💨','Pssshhh. Slow leak. Easy patch.'],['🪛','Spare tire coming up.']]],
 ['steam',[['☁️','Engine is warming up.'],['🌫️','Pit stop. Hood up, back soon.'],['🫠','Check engine. Peek at the notes.']]],
 ['stall',[['🐢','Slow and steady. Smooth comes next.'],['🐌','Stalled out. Restart and go.'],['⏳','Engine needs a minute.']]],
 ['reverse',[['↩️','Detour ahead. Backing up a bit.'],['🔙','Reverse is for parking.'],['⏪','Fresh start, same car.']]],
 ['lift',[['🛸','Abducted. Aliens love Utah roads.'],['🎈','Lifted by balloons. Unclear why.'],['🦅','Eagle borrowed your car. It is back now.']]],
 ['pothole',[['🕳️','Utah roads 1, suspension 0.'],['🪨','Pothole on the route. Detour time.'],['🦴','Say hi to the center of the earth.']]],
 ['cone',[['🚧','Orange cone, still standing.'],['🏐','Cone launched into orbit.'],['🔶','That cone is fine. Just dizzy.']]],
 ['critter',[['🦌','A deer had right of way. Respect.'],['🐔','Chicken crossed. You braked. Good call.'],['🐿️','Squirrel 1, brakes working.']]]
];
window.fxPools={PASS:PASS,FAIL:FAIL};
function pick(good){S.fx=S.fx||{};const k=good?'p':'f';
 if(S.fx[k]==null)S.fx[k]=Math.floor(Math.random()*30);
 const i=S.fx[k]%30;S.fx[k]=(i+1)%30;save();
 const L=good?PASS:FAIL,kind=L[i%10],v=kind[1][Math.floor(i/10)%3];
 return{good,kind:kind[0],prop:v[0],cap:v[1],n:i+1}}
window.fxStage=(good,holder)=>{let s=holder&&holder.scene;if(!s){s=pick(good);
  if(holder&&holder.mode==='stop'){/* smart touch: failed stop = fender bender, passed stop = car drives off */
   const L=good?PASS:FAIL,ks=good?[0,6,4,7]:[0,0,0],j=ks[Math.floor(Math.random()*ks.length)],v=L[j][1][Math.floor(Math.random()*3)];s=Object.assign({},s,{kind:L[j][0],prop:v[0],cap:v[1]})}
  if(holder)holder.scene=s}
 const car=typeof carSVG==='function'?carSVG(AV_(),'fxcar'):'🚘';
 return `<div class="fxs k-${s.kind} ${good?'fxp-ok':'fxp-bad'}" role="img" aria-label="${esc(s.cap)}" data-fx="${good?1:0}"><span class="fxsun"></span><span class="fxp">${s.prop}</span><div class="fxc">${car}</div><span class="fxb">${good?'✨':'💥'}</span><i class="fxroad"></i></div><p class="fxcap">${esc(s.cap)}</p>`};

/* ---------- audio ---------- */
let AC=null,master=null,musG=null,sfxG=null,timer=0,track='road',step=0,nextT=0;
const mode=()=>(S.snd|0); // 0 all on, 1 sfx only, 2 off
const mOn=()=>mode()===0,sOn=()=>mode()<2;
function ctx(){if(AC)return AC;const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;
 try{AC=new C();master=AC.createGain();master.gain.value=.9;master.connect(AC.destination);
  musG=AC.createGain();musG.gain.value=.16;musG.connect(master);sfxG=AC.createGain();sfxG.gain.value=.5;sfxG.connect(master)}catch(e){AC=null}return AC}
const hz=m=>440*Math.pow(2,(m-69)/12);
function tone(t,f,d,type,v,dest,slide){const o=AC.createOscillator(),g=AC.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(20,slide),t+d);
 g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(dest);o.start(t);o.stop(t+d+.02)}
function noise(t,d,v,dest,hp){const n=Math.floor(AC.sampleRate*d),b=AC.createBuffer(1,n,AC.sampleRate),a=b.getChannelData(0);for(let i=0;i<n;i++)a[i]=Math.random()*2-1;
 const s=AC.createBufferSource();s.buffer=b;const f=AC.createBiquadFilter();f.type='highpass';f.frequency.value=hp||4000;const g=AC.createGain();g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);s.connect(f);f.connect(g);g.connect(dest);s.start(t)}
const SFX={
 tick:t=>tone(t,900,.04,'square',.08,sfxG),
 ok:t=>{tone(t,660,.1,'triangle',.5,sfxG);tone(t+.08,990,.18,'triangle',.5,sfxG)},
 bad:t=>{tone(t,220,.22,'sawtooth',.3,sfxG,150);tone(t+.1,160,.25,'sawtooth',.3,sfxG,110)},
 coin:t=>{tone(t,1320,.08,'square',.2,sfxG);tone(t+.07,1760,.16,'square',.2,sfxG)},
 hit:t=>{noise(t,.18,.5,sfxG,800);tone(t,120,.2,'sine',.6,sfxG,50)},
 win:t=>{[523,659,784,1047,1319].forEach((f,i)=>tone(t+i*.1,f,.22,'square',.22,sfxG))},
 lose:t=>{[[294,0],[277,.28],[262,.56],[196,.84]].forEach(a=>tone(t+a[1],a[0],.32,'sawtooth',.28,sfxG,a[0]*.93))},
 horn:t=>{tone(t,392,.35,'square',.16,sfxG);tone(t,494,.35,'square',.16,sfxG)},
 crash:t=>{noise(t,.35,.7,sfxG,500);tone(t,90,.35,'sine',.8,sfxG,40)},
 skid:t=>noise(t,.5,.25,sfxG,2500)
};
window.sfx=n=>{if(!sOn()||!ctx())return;try{if(AC.state==='suspended')AC.resume();SFX[n](AC.currentTime+.01)}catch(e){}};
/* music */
const CH=[[57,60,64],[53,57,60],[48,52,55],[55,59,62]],BASS=[45,41,36,43];
const LEAD=[0,2,1,2,0,2,1,2,0,1,2,1,0,2,1,0];
function sched(){if(!AC||!mOn()||document.hidden)return;const bpm=track==='game'?132:94,sp=60/bpm/4;
 if(nextT<AC.currentTime)nextT=AC.currentTime+.05;
 while(nextT<AC.currentTime+.18){const bar=Math.floor(step/16)%4,s=step%16,c=CH[bar],t=nextT;
  if(s%4===0)tone(t,hz(BASS[bar]),track==='game'?.22:.5,'triangle',.9,musG);
  if(track==='game'){if(s%4===0){tone(t,150,.12,'sine',.8,musG,45)}if(s%2===1)noise(t,.04,.18,musG,7000);tone(t,hz(c[LEAD[s]]+12),.12,'square',.28,musG)}
  else{if(s%2===0)tone(t,hz(c[LEAD[s]]+12),.3,'triangle',.4,musG);if(s===8)noise(t,.05,.1,musG,6000)}
  step++;nextT+=sp}}
function startMusic(){if(!mOn()||!ctx())return;if(AC.state==='suspended')AC.resume();if(!timer){nextT=0;timer=setInterval(sched,40)}}
function stopMusic(){clearInterval(timer);timer=0}
window.fxTrack=n=>{track=n;step=0;nextT=0};
const sndLbl=()=>mode()===2?'Sound off, tap to unmute':mode()===1?'Sound effects on, tap to mute':'Sound on, tap to mute';
window.sndBtn=()=>{const m=mode();return `<button class="chip snd" data-act="snd" aria-label="${sndLbl()}" aria-pressed="${m<2}">${['🎵','🔔','🔇'][m]}</button>`};
const cycle=()=>{S.snd=mode()<2?2:0;save();if(mOn())startMusic();else stopMusic();sfx('tick')};
acts.snd=()=>{cycle();render()};
function gate(){if(mOn())startMusic()}
['pointerdown','keydown','touchend'].forEach(e=>document.addEventListener(e,gate,{passive:true}));
document.addEventListener('visibilitychange',()=>{if(!AC)return;if(document.hidden){AC.suspend();}else if(mOn()){AC.resume()}});
/* tap tick */
document.addEventListener('pointerdown',e=>{if(e.target.closest&&e.target.closest('.btn,.chip,.tab,[data-act]'))sfx('tick')},{passive:true});

/* ---------- scene stingers ---------- */
function stinger(root){const q=(root||document).querySelectorAll('.fxs:not(.said)');q.forEach(el=>{el.classList.add('said');const g=el.dataset.fx==='1',k=(el.className.match(/k-(\w+)/)||[])[1];
 if(g){sfx('win');setTimeout(()=>sfx('horn'),500)}else if(el.classList.contains('fxsoft')){setTimeout(()=>sfx('bad'),600)}else{setTimeout(()=>{sfx(k==='critter'||k==='reverse'?'skid':'crash')},k==='lift'||k==='steam'||k==='stall'?100:700);setTimeout(()=>sfx('lose'),900)}})}
const _r=window.render;window.render=function(){_r();const o=document.getElementById('rsm');if(o)o.remove();
 if(ui.rs){const d=document.createElement('div');d.id='rsm';d.className='sheetbg rsbg';d.innerHTML=ui.rs===1?
 `<div class="sheet rs" role="alertdialog" aria-label="Reset all progress" data-stop="1"><h2>Reset everything?</h2><p class="muted">This puts the app back to a brand new start on this phone.</p><button class="btn primary" data-act="rscancel">Keep my progress</button><button class="btn line" data-act="rs2" style="margin-top:10px">Continue to reset</button></div>`:
 `<div class="sheet rs" role="alertdialog" aria-label="Final warning" data-stop="1"><div class="rsw">⚠️</div><h2>Final warning</h2><p><b>All progress, coins and awards will be lost and cannot be undone.</b> Your avatar, car and garage items go too.</p><button class="btn primary" data-act="rscancel">No, keep everything</button><button class="btn danger" data-act="rsgo" style="margin-top:10px">Yes, erase everything</button></div>`;
 document.body.appendChild(d)}stinger()};
/* quiz answer sounds */
const _a=window.answer;window.answer=function(i){_a.apply(this,arguments);const r=ui.run;if(r&&r.last&&r.locked!==false&&!isT(r.mode)){sfx(r.last.ok?'ok':'bad')}};
/* game hooks */
const _o=GP.open,_c=GP.close,_e=GP.end,_h=GP.hud;let lastH=null;
GP.open=function(){fxTrack('game');lastH=null;const r=_o.apply(this,arguments);try{const t=GP.el.querySelector('.gtop');const b=document.createElement('button');b.className='x';b.id='gsnd';b.style.color='#fff';b.textContent=['🎵','🔔','🔇'][mode()];b.setAttribute('aria-label',sndLbl());b.onclick=()=>{cycle();b.textContent=['🎵','🔔','🔇'][mode()];b.setAttribute('aria-label',sndLbl())};t.appendChild(b)}catch(e){}return r};
GP.close=function(){fxTrack('road');return _c.apply(this,arguments)};
GP.hud=function(){const e=GP.eng;if(e&&typeof e.hearts==='number'){if(lastH!==null&&e.hearts<lastH)sfx('hit');lastH=e.hearts}return _h.apply(this,arguments)};
GP.end=function(){_e.apply(this,arguments);if(GP.el)stinger(GP.el)};
try{render()}catch(e){}
})();
