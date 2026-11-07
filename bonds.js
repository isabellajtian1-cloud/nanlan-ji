/* Quiet personal stories, offered beside existing dialogue rather than in the task list. */
(()=>{'use strict';
const B=window.NanlanBonds,L=(zh,en)=>window.NanlanI18n?.language==='en'?en:zh,T=p=>p[window.NanlanI18n?.language==='en'?1:0];
function visit(o){
 const role=B.roleOf(o),offer=B.offered(state(),role);if(!offer)return;
 const name=B.name(role,window.NanlanI18n?.language==='en');
 activity(name+' · '+T(offer.title),T(offer.intro),'bond-visit');dialogObject=o;
 const note=document.createElement('p');note.className='production-note';
 note.textContent=L('一起坐一刻 · 经过 10 游戏分钟。今日忙的话，改日再来也无妨。','Sit together · 10 game minutes. If today is busy, another day will do.');
 if(role==='mother'&&offer.index===1)note.textContent+=L(' 两人分一份热饭，需行囊中热饭 ×1。',' Share one warm meal from your bag.');
 $('panelExtra').append(note);
 offer.choices.forEach((choice,i)=>{
  const b=button(T(choice),async()=>{
   const r=await perform('bondVisit',{object:o.id,role,index:offer.index,choice:i},()=>{
    activity(name+' · '+T(offer.title),T(offer.replies[i]),'bond-memory');dialogObject=o;
    navButton(L('把这一刻记在心里，回到场景','Keep this moment and return'),()=>closeDialog(),'bond-return');
   });return r;
  },'bond-choice-'+i);
  if(role==='mother'&&offer.index===1&&N.available(state(),'hotMeal')<1)b.disabled=true;
  if(state().worldTick%1440+10>1320)b.disabled=true;
 });
 if(role==='mother'&&offer.index===1&&N.available(state(),'hotMeal')<1){const p=document.createElement('p');p.textContent=L('先在灶边做一份热饭，再来一起吃。','Prepare a warm meal at the stove, then come back to share it.');$('panelExtra').append(p);}
 if(state().worldTick%1440+10>1320){const p=document.createElement('p');p.textContent=L('夜已深，明日再来慢慢说。','It is late. Come back tomorrow with time to spare.');$('panelExtra').append(p);}
 navButton(L('今日先忙，改日再坐','Another day, when there is time'),()=>closeDialog(),'bond-later');
}
function personal(o){
 const role=B.roleOf(o),s=state(),c=B.extra[role];if(!c)return;
 activity(B.name(role,window.NanlanI18n?.language==='en')+' · '+L('近况','A moment together'),B.greeting(s,role,window.NanlanI18n?.language==='en')||L('对方把手里的事放稳，留出一会儿听你说话。','They set their work safely aside and make time to listen.'),'bond-talk');dialogObject=o;
 if(B.canTalk(s,role)){
  const i=B.familiarity(s,role);
  button(T(c.topics[i]),()=>perform('bondTalk',{object:o.id,role},()=>{
   activity(B.name(role,window.NanlanI18n?.language==='en')+' · '+L('回应','A reply'),T(c.replies[i]),'bond-reply');dialogObject=o;
   const offer=B.offered(state(),role);if(offer)navButton(T(offer.title),()=>visit(o),'bond-open');
   navButton(L('改日再聊，回到场景','Until another day'),()=>closeDialog(),'bond-talk-return');
  }),'bond-talk-ask');
 }else{
  const p=document.createElement('p');p.className='production-note';p.textContent=L('今日的话已记在心里。有新的心事时，还会慢慢告诉你。','Today’s words are remembered. Other stories will come in time.');$('panelExtra').append(p);
 }
 const offer=B.offered(s,role);if(offer)navButton(T(offer.title),()=>visit(o),'bond-personal-event');
 navButton(L('回到场景','Return to the scene'),()=>closeDialog(),'bond-personal-return');
}
function npc(o){
 const role=B.roleOf(o);if(!B.roles.includes(role)||$('choices').querySelector('[data-action="bond-open"],[data-action="bond-personal"]'))return;
 if(B.extra[role])navButton(L('说说心事 · ','Personal stories · ')+B.name(role,window.NanlanI18n?.language==='en'),()=>personal(o),'bond-personal');
 const offer=B.offered(state(),role);
 if(offer)navButton(T(offer.title)+' · '+L('一起坐一刻','Spend a moment together'),()=>visit(o),'bond-open');
}
window.NanlanBondUI={npc,visit,personal};
})();
