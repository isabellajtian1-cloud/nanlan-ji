/* Illustrated arrival. Presentation only: no quest flags, inventory or clock writes. */
(()=>{'use strict';
const shots=[
 {duration:10000,asset:'oldTrail',environment:'oldTrail',roles:[],title:['南行的尽头','At the End of the Southern Road'],line:['离京后的长路，终于走到了岭南。\n一家人的文书与行李仍在身边，熟悉的院门却留在了远处。','The long road from the Capital has brought your family to Lingnan.\nYour papers and belongings are still with you. The familiar gate is far behind.']},
 {duration:9000,asset:'gate',environment:'gate',roles:['father'],title:['父亲 · 旧宅门前','Father · Before the Old House'],line:['「到了。箱笼先别全搬。门锁、屋瓦和能落脚的地方，都要亲眼看过再说。」','“We have arrived. Leave the trunks for a moment. Let us first see the lock, the roof, and where we can settle.”']},
 {duration:10000,asset:'gate',environment:'gate',roles:['guard'],title:['官兵 · 文书交接','The Escort · The Handover'],line:['「李家迁居南澜，文书、行李在此交清。\n院门的钥匙也在这里。交接妥当，我等便返京。」','“The Li household is to settle in Nanlan. Here are your papers and belongings.\nThe gate key is here as well. Once the handover is complete, we return to the Capital.”']},
 {duration:9000,asset:'gate',environment:'gate',roles:['mother','grandfather'],title:['母亲 · 先让一家人安顿','Mother · A Place for Everyone'],line:['「路上的事，进屋再说。先扶你祖父坐下。」\n\n门还合着。新的日子，就从走近家人开始。','“We can speak of the road once we are inside. First, help your grandfather find a seat.”\n\nThe gate is still closed. Your new days begin beside your family.']}
];
let host=null,index=0,elapsed=0,playing=true,running=false,frame=0,last=0,lastAdvance=-Infinity,onFinish=null,focusBefore=null,wasActive=false,oldInert=false;
const en=()=>window.NanlanI18n?.language==='en',P=p=>p[en()?1:0];
const total=shots.reduce((n,s)=>n+s.duration,0);
function build(){
 if(host)return;
 host=document.createElement('section');host.id='openingFilm';host.hidden=true;host.setAttribute('role','dialog');host.setAttribute('aria-modal','true');host.setAttribute('aria-labelledby','openingTitle');host.dataset.noLocalize='';
 host.innerHTML='<div class="opening-shell"><div class="opening-top"><p id="openingKicker"></p><button type="button" id="openingSkip"></button></div><figure class="opening-landscape"><div class="opening-shade"></div></figure><div class="opening-caption"><div class="opening-portraits" aria-hidden="true"></div><div class="opening-copy"><h2 id="openingTitle"></h2><p id="openingLine" aria-live="polite"></p></div></div><div class="opening-controls"><small id="openingHint"></small><div><button type="button" id="openingAuto" aria-pressed="true"></button><button type="button" id="openingNext"></button></div></div><div class="opening-progress" aria-hidden="true"><span></span></div></div>';
 document.body.append(host);
 const backdrop=host.querySelector('.opening-landscape');backdrop.style.backgroundImage='url("'+window.NANLAN_DATA.assets.gate+'")';backdrop.style.backgroundSize='contain';backdrop.style.backgroundRepeat='no-repeat';backdrop.style.backgroundPosition='center';
 host.querySelector('#openingSkip').onclick=finish;
 host.querySelector('#openingNext').onclick=advance;
 host.querySelector('#openingAuto').onclick=()=>{playing=!playing;last=0;labels();};
}
function labels(){
 host.querySelector('#openingKicker').textContent=P(['明代 · 岭南 · 初到南澜','Ming China · Lingnan · Arrival in Nanlan']);
 host.querySelector('#openingSkip').textContent=P(['跳过并开始','Skip and Play']);
 host.querySelector('#openingAuto').textContent=playing?P(['自动播放 开','Autoplay On']):P(['自动播放 暂停','Autoplay Paused']);
 host.querySelector('#openingAuto').setAttribute('aria-pressed',String(playing));
 host.querySelector('#openingNext').textContent=index===shots.length-1?P(['走近家人 · 空格','Join Your Family · Space']):P(['继续 · 空格','Continue · Space']);
 host.querySelector('#openingHint').textContent=P(['空格 / Enter 继续 · Esc 跳过','Space / Enter to continue · Esc to skip']);
}
function paint(){
 const s=shots[index],A=window.NANLAN_DATA.assets;host.dataset.shot=String(index);
 const img=document.createElement('img');img.alt='';img.src=A[s.asset]||A.gate;img.draggable=false;img.onerror=()=>{img.onerror=null;img.src=A.gate;};
 host.querySelector('.opening-landscape').replaceChildren(img);
 const cast=host.querySelector('.opening-portraits');cast.replaceChildren();cast.style.animation='none';void cast.offsetWidth;cast.style.animation='';
 for(const role of s.roles){const portrait=document.createElement('img');portrait.src=A['npc_'+role];portrait.alt='';portrait.draggable=false;portrait.onerror=()=>{portrait.hidden=true;};cast.append(portrait);}
 host.querySelector('#openingTitle').textContent=P(s.title);host.querySelector('#openingLine').textContent=P(s.line);labels();
}
function update(t){
 if(!running)return;
 const delta=last?Math.max(0,Math.min(100,t-last)):0;last=t;
 if(playing&&!document.hidden)elapsed+=delta;
 const prior=shots.slice(0,index).reduce((n,s)=>n+s.duration,0);
 host.querySelector('.opening-progress span').style.width=((prior+Math.min(elapsed,shots[index].duration))/total*100)+'%';
 if(elapsed>=shots[index].duration){if(index===shots.length-1){finish();return;}index++;elapsed=0;paint();}
 frame=requestAnimationFrame(update);
}
function advance(){
 if(!running||performance.now()-lastAdvance<250)return;
 lastAdvance=performance.now();
 if(index===shots.length-1){finish();return;}index++;elapsed=0;last=0;paint();
}
function finish(){
 if(!running)return;running=false;cancelAnimationFrame(frame);
 host.hidden=true;const wrap=document.getElementById('wrap');if(wrap)wrap.inert=oldInert;
 window.NanlanAudio?.setDialogue(false);active=wasActive;keys={};path=[];moving=false;
 const done=onFinish;onFinish=null;
 if(focusBefore?.isConnected)focusBefore.focus({preventScroll:true});
 if(done)done();
}
function start(done){
 if(running)return false;build();
 index=0;elapsed=0;last=0;lastAdvance=-Infinity;playing=true;onFinish=done||null;focusBefore=document.activeElement;wasActive=active;
 active=false;keys={};path=[];moving=false;window.NanlanDesktop?.discard();
 const wrap=document.getElementById('wrap');oldInert=!!wrap?.inert;if(wrap)wrap.inert=true;
 running=true;host.hidden=false;paint();host.querySelector('#openingNext').focus();window.NanlanAudio?.setDialogue(false);void window.NanlanAudio?.unlock();
 frame=requestAnimationFrame(update);return true;
}
window.addEventListener('keydown',e=>{
 if(!running||e.ctrlKey||e.metaKey||e.altKey)return;
 if(e.key==='Tab'){const controls=[...host.querySelectorAll('button')],i=controls.indexOf(document.activeElement),next=e.shiftKey?(i<=0?controls.length-1:i-1):(i+1)%controls.length;e.preventDefault();e.stopImmediatePropagation();controls[next].focus();return;}
 e.preventDefault();e.stopImmediatePropagation();if(e.repeat)return;
 if(e.key==='Escape')finish();else if(e.key===' '||e.key==='Enter'){
  if(document.activeElement?.id==='openingAuto')host.querySelector('#openingAuto').click();
  else if(document.activeElement?.id==='openingSkip')finish();else advance();
 }
},true);
window.addEventListener('keyup',e=>{if(running){e.preventDefault();e.stopImmediatePropagation();}},true);
document.addEventListener('visibilitychange',()=>{if(running)last=0;});
window.NanlanOpening={start,finish,replay:()=>start(),running:()=>running,environment:()=>running?shots[index].environment:null,duration:total,shots};
const dictionary=window.NANLAN_EN||(window.NANLAN_EN={});dictionary['回看开场']='Replay Opening';window.NanlanI18n?.configure(dictionary);
})();