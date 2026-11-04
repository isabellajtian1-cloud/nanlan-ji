/* Quiet personal stories, offered beside existing dialogue rather than in the task list. */
(()=>{'use strict';
const B=window.NanlanBonds,L=(zh,en)=>window.NanlanI18n?.language==='en'?en:zh,T=p=>p[window.NanlanI18n?.language==='en'?1:0];
function visit(o){
 const role=NanlanConversations.roles[o.id],offer=B.offered(state(),role);if(!offer)return;
 const name=NanlanConversations.cast[role].name;
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
function npc(o){
 const role=NanlanConversations.roles[o.id];if(!B.roles.includes(role))return;
 const offer=B.offered(state(),role);
 if(offer)navButton(T(offer.title)+' · '+L('一起坐一刻','Spend a moment together'),()=>visit(o),'bond-open');
}
window.NanlanBondUI={npc,visit};
})();
