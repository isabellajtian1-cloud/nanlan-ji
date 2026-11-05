/* Closing films and voluntary chapter handovers. Presentation reads state; it never writes it. */
(()=>{'use strict';
const en=()=>window.NanlanI18n?.language==='en',P=a=>a[en()?1:0],L=(a,b)=>en()?b:a;
const cn=['','一','二','三','四','五','六'],roman=['','I','II','III','IV','V','VI'];
const specs=[
 {key:'1',number:1,flag:'volumeComplete',last:()=>N.ORDER.at(-1),title:['初抵南澜','Arrival in Nanlan']},
 {key:'2',number:2,flag:'volume2Complete',last:()=>N.V2_ORDER.at(-1),title:['南街灯起','South Street Lights']},
 {key:'3',number:3,flag:'volume3Complete',last:()=>N.V3_ORDER.at(-1),title:['山海成行','Roads between Hills and Sea']},
 {key:'4',number:4,flag:'volume4Complete',last:()=>N.V4_ORDER.at(-1),title:['海天帆影','Sails beneath Open Skies']},
 {key:'5',number:5,flag:'season5Complete',last:()=>N.SEASON5_ORDER.at(-1),title:['岁序长青','Enduring Seasons']},
 {key:'5-old',number:5,flag:'volume5Complete',last:()=>N.V5_ORDER.at(-1),title:['清水归渠','Clear Water, Homeward']},
 {key:'6',number:6,flag:'voyageComplete',last:()=>N.V6_ORDER.at(-1),title:['春潮有信','Letters on the Spring Tide']}
];
const completed=(s=state())=>specs.filter(v=>s.flags[v.flag]&&N.done(s,v.last()));
const volume=v=>L('第'+cn[v.number]+'卷','Volume '+roman[v.number]);
let previous=[],wasLive=false,pending=null,offered=new Set();
function refresh(s=state(),live=started){
 const list=completed(s),keys=list.map(v=>v.key);
 if(!live){previous=keys;wasLive=false;pending=null;return;}
 if(!wasLive){
  wasLive=true;previous=keys;
  if(!N.current(s)){
   const info=window.NanlanChapterMark.describe(s),v=list.findLast(x=>x.number===info.number);
   if(v&&!offered.has(v.key))pending={key:v.key,offer:true};
  }
 }else{
  const added=list.filter(v=>!previous.includes(v.key));previous=keys;
  if(added.length)pending={key:added.at(-1).key,offer:false};
 }
 if(!pending||document.hidden||window.NanlanOpening?.running()||transitioning)return;
 const v=specs.find(x=>x.key===pending.key);if(!v||!keys.includes(v.key)){pending=null;return;}
 if(!$('dialog').hidden){
  if(dialogKind!=='meal'&&!$('choices').querySelector('[data-ending-watch]')){
   const b=navButton(L('这一卷已写完 · 观看收卷绘景','This Chapter Is Complete · Watch the Closing'),()=>play(v.key),'ending-watch');
   b.dataset.endingWatch=v.key;
  }
  return;
 }
 const queued=pending;pending=null;offered.add(v.key);
 queueMicrotask(()=>{if(window.NanlanOpening?.running()){pending=queued;return;}queued.offer?choices(v.key):play(v.key);});
}
function frames(v,s=state()){
 const rows=window.NANLAN_ENDING_SCENES[v.key]||window.NANLAN_ENDING_SCENES[v.number];
 return rows.map(r=>({duration:9000,asset:r[0]==='$meal'?(s.gender==='male'?'familyMealMale':'familyMealFemale'):r[0],environment:r[0]==='$meal'?'hall':r[0]==='backHallReady'?'backHall':r[0],roles:r[5]?[r[5]]:[],title:[r[1],r[2]],line:[r[3],r[4]]}));
}
function play(key){
 const v=specs.find(x=>x.key===String(key));if(!v||!completed().some(x=>x.key===v.key))return false;
 if(window.NanlanOpening?.running())return false;
 if(!window.NanlanOpening?.play){choices(v.key);notice(L('收卷演出暂未载入，可稍后从篇章行记重看。','The closing player has not loaded. You can replay it later from the chapter journal.'),true);return false;}
 pending=null;offered.add(v.key);closeDialog(true);dialogObject=null;
 return window.NanlanOpening.play({shots:frames(v),title:[volumeZh(v)+' · 收卷',volumeEn(v)+' · A Chapter Closed'],skip:['略过演出，选择去向','Skip to Choices'],last:['收好这一卷 · 选择去向','Close This Chapter · Choose What Comes Next']},()=>choices(v.key));
}
const volumeZh=v=>'第'+cn[v.number]+'卷',volumeEn=v=>'Volume '+roman[v.number];
function choiceInfo(key,s=state()){
 const v=specs.find(x=>x.key===String(key));
 const entry=v&&v.number<6?N.chapterEntries(s).find(e=>e.number===v.number+1):null;
 return {volume:v,next:entry,canBegin:!!entry?.ready&&!entry.started,final:v?.number===6};
}
function beginNext(key){
 const {next:e}=choiceInfo(key);if(!e)return;
 if(e.started){closeDialog(true);chooseTaskRoute(nextObjective());return;}
 if(!e.ready){choices(key);return;}
 const o=world[e.scene]?.objects.find(x=>x.id===e.object);
 closeDialog(true);
 if(state().scene===e.scene&&o&&nearObject(o)){
  if(e.number===2)window.NanlanV2.entry();else void interact(o);
 }else startNavigation(e.scene,e.object);
}
function choices(key){
 const v=specs.find(x=>x.key===String(key));if(!v||!completed().some(x=>x.key===v.key))return;
 pending=null;offered.add(v.key);
 const info=choiceInfo(key);
 activity(volume(v)+' · '+P(v.title)+' · '+L('卷已毕','Complete'),
 L('这一卷的故事已经写下。田畦、铺子与相识的人仍在，去留由你决定。','This chapter has been written. Your garden, shop and the people you know remain. What follows is yours to choose.'),'volume-finished');
 dialogObject=null;
 navButton(L('留在此间，继续过日子','Stay Here and Continue Daily Life'),()=>{closeDialog(true);notice(L('日常仍在。想续下一卷时，可点时辰旁的卷签。','Life continues. Open the chapter label by the clock whenever you wish to begin the next chapter.'));},'ending-stay');
 if(info.final){
  navButton(L('翻开闲日邀约 · 六篇番外','Open the Invitations · Six Epilogues'),()=>window.NanlanVoyageUI.extras(),'ending-extras');
 }else if(info.next){
  const e=info.next,name=en()?e.en:e.title;
  if(e.started)navButton(L('接着已开启的旅程','Continue the Journey Already Begun'),()=>beginNext(key),'ending-resume-next');
  else if(e.ready){
   navButton(L('开启下一卷 · ','Begin the Next Volume · ')+name,()=>beginNext(key),'ending-next');
   const note=document.createElement('p');note.className='ending-note';note.textContent=L('将前往这一卷开始的地点，与你熟悉的人接续故事。原有物资、家园与进度都会保留。','You will go to the place where the next chapter begins and continue its opening conversation. Your belongings, home and progress remain.');$('panelExtra').append(note);
  }else{
   const note=document.createElement('p');note.className='ending-note';note.textContent=L('下一卷还等着这些事：','Before the next chapter: ')+e.requirements.filter(([ok])=>!ok).map(r=>r[en()?2:1]).join(en()?'; ':'；');$('panelExtra').append(note);
   navButton(L('查看开启条件与去处','View the Conditions and Starting Place'),()=>window.NanlanChapters.show(e.number),'ending-next-conditions');
  }
 }
 navButton(L('回看这一卷的收卷绘景','Replay This Chapter’s Closing'),()=>play(v.key),'ending-replay');
 const note=document.createElement('p');note.className='ending-note';note.textContent=L('收卷绘景与回看不会推进时辰、扣除物资或再次结算奖励。','Watching or replaying the closing does not advance time, spend materials or grant rewards again.');$('panelExtra').append(note);
}
function history(){
 for(const v of completed()){
  navButton(L('回看','Recall ')+volume(v)+' · '+P(v.title)+' · '+L('收卷绘景','Closing'),()=>play(v.key),'ending-history-'+v.key);
 }
 const info=window.NanlanChapterMark.describe(state()),v=completed().findLast(x=>x.number===info.number);
 if(v)navButton(L('这一卷之后 · 继续生活或接续篇章','After This Chapter · Daily Life or the Road Ahead'),()=>choices(v.key),'ending-current-choice');
}
window.NanlanEndings={refresh,completed,frames,play,choices,choiceInfo,history};
refresh();
})();