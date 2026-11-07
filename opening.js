/* Illustrated arrival. Presentation only: no quest flags, inventory or clock writes. */
(()=>{'use strict';
const openingShots=[
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
   "长路终于在一扇旧院门前停下。官兵取出文书和钥匙，等一家人走近。\n父亲望了望屋瓦：「箱笼先别全搬。先看看，哪里能让大家安顿。」",
   "At last, the long road ended before an old courtyard gate. The escort took out the papers and the key and waited for the family.\nFather looked up at the roof. “Leave the trunks for now. Let us see where everyone can settle.”"
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
 },
 {
  "duration": 7000,
  "image": "opening-homecoming-v663.webp",
  "asset": "gate",
  "environment": "gate",
  "roles": [],
  "detail": true,
  "title": ["门里响了两下","Two Knocks Behind the Gate"],
  "line": [
   "你正要往前，门板后忽然笃、笃两响。\n母亲按住装着干铺盖的箱笼：「再下雨前，得给一家人找个能落脚的地方。」",
   "As you step forward, two knocks sound from behind the gate.\nMother steadies the trunk with the dry bedding. “We need somewhere to settle before the rain comes again.”"
  ]
 }
];
let shots=openingShots,filmTitle=['明代 · 从京城到南澜','Ming China · From the Capital to Nanlan'],skipLabel=['跳过并开始','Skip and Play'],lastLabel=['走近家人 · 空格','Join Your Family · Space'];
let host=null,index=0,elapsed=0,playing=true,running=false,frame=0,last=0,lastAdvance=-Infinity,onFinish=null,focusBefore=null,wasActive=false,oldInert=false,imagePending=false,imageFailed=false,paintToken=0,artTimer=0,artCleanup=null,lastSeconds=-1;
const en=()=>window.NanlanI18n?.language==='en',P=p=>p[en()?1:0];
let total=shots.reduce((n,s)=>n+s.duration,0);
function build(){
 if(host)return;
 host=document.createElement('section');host.id='openingFilm';host.hidden=true;host.setAttribute('role','dialog');host.setAttribute('aria-modal','true');host.setAttribute('aria-labelledby','openingTitle');host.dataset.noLocalize='';
 host.innerHTML='<div class="opening-shell"><div class="opening-top"><p id="openingKicker"></p><button type="button" id="openingSkip"></button></div><figure class="opening-landscape"><div class="opening-shade"></div></figure><div class="opening-caption"><div class="opening-portraits" aria-hidden="true"></div><div class="opening-copy"><h2 id="openingTitle"></h2><p id="openingLine" aria-live="polite"></p></div></div><div class="opening-controls"><small id="openingHint"></small><div><button type="button" id="openingAuto" aria-pressed="true"></button><button type="button" id="openingRetry" hidden></button><button type="button" id="openingNext"></button></div></div><div class="opening-progress" aria-hidden="true"><span></span></div></div>';
 document.body.append(host);

 host.querySelector('#openingSkip').onclick=finish;
 host.querySelector('#openingNext').onclick=advance;
 host.querySelector('#openingRetry').onclick=()=>paint(true);
 host.querySelector('#openingAuto').onclick=()=>{playing=!playing;last=0;labels();};
}
function labels(){
 host.querySelector('#openingKicker').textContent=P(filmTitle)+' · '+(index+1)+' / '+shots.length;
 host.querySelector('#openingSkip').textContent=P(skipLabel);
 host.querySelector('#openingAuto').textContent=playing?P(['自动播放 开','Autoplay On']):P(['自动播放 暂停','Autoplay Paused']);
 host.querySelector('#openingAuto').setAttribute('aria-pressed',String(playing));
 host.querySelector('#openingNext').disabled=false;
 host.querySelector('#openingRetry').hidden=!imageFailed;host.querySelector('#openingRetry').textContent=P(['重试本页绘景','Retry This Artwork']);
 host.querySelector('#openingNext').textContent=index===shots.length-1?P(lastLabel):P(['继续 · 空格','Continue · Space']);
 lastSeconds=-1;countdown();
}
function countdown(){
 const seconds=Math.max(0,Math.ceil((shots[index].duration-elapsed)/1000));if(seconds===lastSeconds)return;lastSeconds=seconds;
 host.querySelector('#openingHint').textContent=(playing?P(['本页还剩 '+seconds+' 秒','Next page in '+seconds+'s']):P(['自动播放已暂停','Autoplay paused']))+' · '+P(['可随时点继续 / 按空格','Continue / Space at any time']);
}
function paint(retry=false){
 if(artCleanup)artCleanup();clearTimeout(artTimer);
 const s=shots[index],A=window.NANLAN_DATA.assets,token=++paintToken;host.dataset.shot=String(index);
 host.classList.toggle('opening-detail',s.detail===true);
 imagePending=true;imageFailed=false;
 const img=document.createElement('img');img.alt=P(s.title);img.draggable=false;img.hidden=true;
 const shade=document.createElement('div');shade.className='opening-shade';
 const status=document.createElement('p');status.className='opening-loading';status.setAttribute('role','status');status.textContent=P(['绘景载入中，文字已就绪，可继续阅读。','Artwork is loading. The story is ready; you can continue.']);
 host.querySelector('.opening-landscape').replaceChildren(img,shade,status);
 img.onload=()=>{if(token!==paintToken||!running)return;clearTimeout(artTimer);imagePending=false;imageFailed=false;img.hidden=false;status.hidden=true;labels();};
 const failed=()=>{if(token!==paintToken||!running)return;clearTimeout(artTimer);imagePending=false;imageFailed=true;status.textContent=P(['本页绘景暂未载入。可继续阅读，也可重试绘景。','The artwork is unavailable. Continue reading or retry the illustration.']);labels();};
 img.onerror=failed;artTimer=setTimeout(failed,6000);artCleanup=()=>{img.onload=img.onerror=null;};
 img.src=(s.image||A[s.asset]||A.gate)+'?v=6917'+(retry?'&retry='+Date.now():'');
 const next=shots[index+1];if(next){const preload=new Image();preload.src=(next.image||A[next.asset]||A.gate)+'?v=6917';}
 const cast=host.querySelector('.opening-portraits');cast.replaceChildren();cast.style.animation='none';void cast.offsetWidth;cast.style.animation='';
 for(const role of s.roles){const portrait=document.createElement('img');portrait.src=A['npc_'+role];portrait.alt='';portrait.draggable=false;portrait.onerror=()=>{portrait.hidden=true;};cast.append(portrait);}
 host.querySelector('#openingTitle').textContent=P(s.title);host.querySelector('#openingLine').textContent=P(s.line);labels();
}
function update(t){
 if(!running)return;
 const delta=last?Math.max(0,Math.min(100,t-last)):0;last=t;
 if(playing&&!document.hidden)elapsed+=delta;countdown();
 const prior=shots.slice(0,index).reduce((n,s)=>n+s.duration,0);
 host.querySelector('.opening-progress span').style.width=((prior+Math.min(elapsed,shots[index].duration))/total*100)+'%';
 if(elapsed>=shots[index].duration){if(index===shots.length-1){finish();return;}index++;elapsed=0;paint();}
 frame=requestAnimationFrame(update);
}
function advance(){
 if(!running||performance.now()-lastAdvance<250)return;
 lastAdvance=performance.now();
 // Artwork never blocks reading or advances a different page when its request completes.
 if(index===shots.length-1){finish();return;}index++;elapsed=0;last=0;paint();
}
function finish(){
 if(!running)return;running=false;paintToken++;clearTimeout(artTimer);if(artCleanup)artCleanup();cancelAnimationFrame(frame);
 host.hidden=true;const wrap=document.getElementById('wrap');if(wrap)wrap.inert=oldInert;
 window.NanlanAudio?.setDialogue(false);active=wasActive;keys={};path=[];moving=false;
 const done=onFinish;onFinish=null;
 if(focusBefore?.isConnected)focusBefore.focus({preventScroll:true});
 if(done)done();
}
function start(done,options={}){
 if(running)return false;
 shots=options.shots||openingShots;total=shots.reduce((n,s)=>n+s.duration,0);
 filmTitle=options.title||['明代 · 从京城到南澜','Ming China · From the Capital to Nanlan'];skipLabel=options.skip||['跳过并开始','Skip and Play'];lastLabel=options.last||['走近家人 · 空格','Join Your Family · Space'];build();
 index=0;elapsed=0;last=0;lastAdvance=-Infinity;playing=true;onFinish=done||null;focusBefore=document.activeElement;wasActive=active;
 active=false;keys={};path=[];moving=false;window.NanlanDesktop?.discard();
 const wrap=document.getElementById('wrap');oldInert=!!wrap?.inert;if(wrap)wrap.inert=true;
 running=true;host.hidden=false;paint();host.querySelector('#openingNext').focus();window.NanlanAudio?.setDialogue(false);void window.NanlanAudio?.unlock();
 frame=requestAnimationFrame(update);return true;
}
window.addEventListener('keydown',e=>{
 if(!running||e.ctrlKey||e.metaKey||e.altKey)return;
 if(e.key==='Tab'){const controls=[...host.querySelectorAll('button')].filter(b=>!b.disabled),i=controls.indexOf(document.activeElement),next=e.shiftKey?(i<=0?controls.length-1:i-1):(i+1)%controls.length;e.preventDefault();e.stopImmediatePropagation();controls[next].focus();return;}
 e.preventDefault();e.stopImmediatePropagation();if(e.repeat)return;
 if(e.key==='Escape')finish();else if(e.key===' '||e.key==='Enter'){
  if(document.activeElement?.id==='openingAuto')host.querySelector('#openingAuto').click();
  else if(document.activeElement?.id==='openingSkip')finish();else if(document.activeElement?.id==='openingRetry')paint(true);else advance();
 }
},true);
window.addEventListener('keyup',e=>{if(running){e.preventDefault();e.stopImmediatePropagation();}},true);
document.addEventListener('visibilitychange',()=>{if(running)last=0;});
window.NanlanOpening={start,finish,replay:()=>start(null,{
 skip:['返回标题页','Return to Title'],last:['返回标题页 · 空格','Return to Title · Space']
}),running:()=>running,environment:()=>running?shots[index].environment:null,duration:openingShots.reduce((n,s)=>n+s.duration,0),shots:openingShots,play:(options,done)=>start(done,options)};
const dictionary=window.NANLAN_EN||(window.NANLAN_EN={});
Object.assign(dictionary,{
 '回看开场':'Replay Opening','回看完整开场故事':'Watch the Full Opening Story',
 '门内有声':'A Sound Behind the Gate',
 '雨刚停，门里响了两下。':'The rain has just stopped. Two knocks sound from behind the gate.',
 '一家人的干铺盖还在箱里。这扇门后，有没有一处地方能让大家睡下？':'The family’s dry bedding is still in the trunk. Is there anywhere behind this gate where everyone can sleep?',
 '启程 · 去门前帮家人':'Begin · Help Your Family at the Gate',
 '风掀起东厢房一角破窗纸。原来，门里那几声响是窗扇在拍窗框。':'The wind lifts torn paper in the east wing. The knocks were a loose shutter striking its frame.'
});
window.NanlanI18n?.configure(dictionary);
})();
