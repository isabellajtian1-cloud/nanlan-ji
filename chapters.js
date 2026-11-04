/* Chapter gateways show the same conditions used by the story models. */
(()=>{'use strict';const en=()=>window.NanlanI18n?.language==='en',L=(a,b)=>en()?b:a;
function show(number){
 const s=state(),entries=N.chapterEntries(s),next=entries.find(e=>!e.started);
 const chosen=entries.find(e=>e.number===number)||next||entries.at(-1);
 activity(L('接下来的日子 · 篇章入口','Days Ahead · Chapter Entrances'),L('每一卷从实际生活里的一个地点开始。条件满足后可沿路前往；开卷不收额外费用。','Each chapter begins at a place in daily life. Once ready, follow the route there. Beginning a chapter has no extra fee.'),'chapter-entry');dialogObject=null;
 for(const item of entries.filter(e=>e.number<=Math.max(chosen.number,next?.number||6))){
  const b=document.createElement('button');b.textContent=(en()?'Volume ':'第')+item.number+(en()?' · ':'卷 · ')+(en()?item.en:item.title)+' · '+(item.complete?L('已完成','Complete'):item.started?L('进行中','In progress'):item.ready?L('可开启','Available'):L('尚待前面的日子','Not yet available'));b.className='secondary';b.onclick=()=>show(item.number);$('panelExtra').append(b);
 }
 const heading=document.createElement('p');heading.textContent=(en()?chosen.en:chosen.title);$('panelExtra').append(heading);
 for(const [ready,zh,english]of chosen.requirements){const p=document.createElement('p');p.textContent=(ready?'✓ ':'○ ')+(en()?english:zh);$('panelExtra').append(p);}
 if(chosen.recordIssue){const p=document.createElement('p');p.textContent=L('前卷已完成，但第三卷手记有不一致记录，已保留原存档。请先从行囊导出进度，便于核对；不会重置任务或库存。','The previous chapter is complete, but the Road Book has inconsistent records. Your save is preserved. Export it from the satchel for review; tasks and stock are not reset.');$('panelExtra').append(p);}
 if(chosen.number===2){navButton(L('查看南街开卷与筹备方案','Read the South Street Preparation Plan'),()=>window.NanlanV2.entry(),'chapter-two-details');}
 else if(chosen.ready){const sc=en()?window.NanlanI18n.t(world[chosen.scene].name):world[chosen.scene].name;
  navButton(L('前往','Go to ')+sc+' · '+L('开启这一卷','Begin this chapter'),()=>{closeDialog(true);startNavigation(chosen.scene,chosen.object);},'chapter-enter-'+chosen.number);
 }else if(chosen.started&&!chosen.complete){navButton(L('继续眼前这件事','Continue the Current Activity'),()=>{const to=nextObjective();closeDialog(true);chooseTaskRoute(to);},'chapter-resume');}
 else if(!chosen.complete&&!chosen.recordIssue)navButton(L('先办完当前事项','Finish the Current Activity First'),()=>{const to=nextObjective();closeDialog(true);chooseTaskRoute(to);},'chapter-prerequisite');
 if(s.flags.voyageComplete)navButton(L('六篇番外 · 查看邀约与回忆','Six Epilogues · Invitations and Memories'),()=>window.NanlanVoyageUI.extras(),'chapter-extras');
 navButton(L('回到场景','Return to the Scene'),()=>closeDialog(true),'chapter-close');
}
function next(s=state()){return N.chapterEntries(s).find(e=>!e.started&&e.ready)||null;}
window.NanlanChapters={show,next};
const dictionary=window.NANLAN_EN||(window.NANLAN_EN={});
Object.assign(dictionary,{'岁末家宴已完成，请到正厅读南街铺讯，开启第二卷后再进县城。':'The year-end feast is complete. Read the South Street notice in the hall to begin Volume II before visiting town.','请先完成第一卷并分享岁末家宴，再到正厅与家人读南街铺讯。':'Complete Volume I and share the year-end feast, then read the South Street notice with your family in the hall.'});
window.NanlanI18n?.configure(dictionary);
})();