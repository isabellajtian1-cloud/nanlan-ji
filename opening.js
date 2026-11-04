/* Illustrated arrival. Presentation only: no quest flags, inventory or clock writes. */
(()=>{'use strict';
const shots=[
 {
  "duration": 11000,
  "image": "opening-capital-v662.webp",
  "asset": "study",
  "environment": "study",
  "roles": [],
  "title": [
   "京城 · 曾经的家",
   "The Capital · The Home You Knew"
  ],
  "line": [
   "京城的旧宅里，祖父案头的书还未收尽，母亲窗下的针线也只做到一半。\n一道迁往岭南的文书，让一家人开始收拾行装。",
   "In your family’s home in the Capital, books still lay on Grandfather’s desk. Mother’s embroidery stood unfinished by the window.\nThen came the order to leave for Lingnan."
  ]
 },
 {
  "duration": 9000,
  "image": "opening-departure-v663.webp",
  "asset": "oldTrail",
  "environment": "oldTrail",
  "roles": [],
  "title": [
   "辞京 · 把旧日留在身后",
   "Departure · Leaving the Capital Behind"
  ],
  "line": [
   "城门渐渐退到身后。你回望了一次，直到熟悉的屋瓦隐进晨雾。\n父亲扶稳车辕：「往后路远，咱们一家人一道走。」",
   "The city gate receded behind you. You looked back once, until the familiar rooftops faded into the morning mist.\nFather steadied the cart. “It is a long road ahead. We shall travel it together.”"
  ]
 },
 {
  "duration": 12000,
  "image": "opening-southbound-v662.webp",
  "asset": "oldTrail",
  "environment": "oldTrail",
  "roles": [],
  "title": [
   "南行 · 一路车声",
   "Southbound · The Turning Wheels"
  ],
  "line": [
   "马车载着箱笼、书卷，也载着一家人的牵挂。越往南，山色越青，雨声也越密。\n母亲替祖父掖好衣角：「到了地方，先让一家人吃上一顿热饭。」",
   "The cart carried trunks, books, and all your family’s worries. Farther south, the hills grew greener and the rain more frequent.\nMother tucked Grandfather’s robe around him. “When we arrive, a hot meal for everyone comes first.”"
  ]
 },
 {
  "duration": 11000,
  "asset": "gate",
  "environment": "gate",
  "roles": [
   "father",
   "guard"
  ],
  "title": [
   "南澜 · 长路停在门前",
   "Nanlan · Where the Road Ends"
  ],
  "line": [
   "长路终于在一扇旧院门前停下。官兵将文书与钥匙交到父亲手中。\n父亲望了望屋瓦：「箱笼先别全搬。先看看，哪里能让大家安顿。」",
   "At last, the long road ended before an old courtyard gate. The escort handed Father the papers and the key.\nFather looked up at the roof. “Leave the trunks for now. Let us see where everyone can settle.”"
  ]
 },
 {
  "duration": 10000,
  "asset": "gate",
  "environment": "gate",
  "roles": [],
  "title": [
   "从这里 · 再安一个家",
   "Here · A Home to Make Together"
  ],
  "line": [
   "祖父把一路护着的书抱稳：「先进去吧。屋子可以慢慢修，日子也能慢慢过。」\n门后的模样还不知道。先走近家人，一起看看这处新住处。",
   "Grandfather gathered the book he had kept safe along the road. “Let us go in. We can mend the house, and find our way, a little at a time.”\nYou have yet to see what lies beyond the gate. Join your family and discover your new home together."
  ],
  "image": "opening-homecoming-v663.webp"
 }
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
 host.querySelector('#openingKicker').textContent=P(['明代 · 从京城到南澜','Ming China · From the Capital to Nanlan'])+' · '+(index+1)+' / '+shots.length;
 host.querySelector('#openingSkip').textContent=P(['跳过并开始','Skip and Play']);
 host.querySelector('#openingAuto').textContent=playing?P(['自动播放 开','Autoplay On']):P(['自动播放 暂停','Autoplay Paused']);
 host.querySelector('#openingAuto').setAttribute('aria-pressed',String(playing));
 host.querySelector('#openingNext').textContent=index===shots.length-1?P(['走近家人 · 空格','Join Your Family · Space']):P(['继续 · 空格','Continue · Space']);
 host.querySelector('#openingHint').textContent=P(['空格 / Enter 继续 · Esc 跳过','Space / Enter to continue · Esc to skip']);
}
function paint(){
 const s=shots[index],A=window.NANLAN_DATA.assets;host.dataset.shot=String(index);
 const img=document.createElement('img');img.alt='';img.src=s.image||A[s.asset]||A.gate;img.draggable=false;img.onerror=()=>{img.onerror=null;img.src=A[s.asset]||A.gate;};
 const shade=document.createElement('div');shade.className='opening-shade';host.querySelector('.opening-landscape').replaceChildren(img,shade);
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