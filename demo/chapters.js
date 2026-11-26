/* Every chapter is discoverable; entering still follows the saved story's real gates. */
(()=>{'use strict';
const C=window.NanlanChapterCatalog,en=()=>window.NanlanI18n?.language==='en',L=(a,b)=>en()?b:a;
let cachedRaw,cachedState,invalidSave=false,selected=null;
function context(){
 if(started)return {s:state(),saved:true,invalid:false};
 if(cachedRaw!==storedRaw||!cachedState){cachedRaw=storedRaw;invalidSave=false;cachedState=N.initial(gender);
  if(storedRaw)try{const check=new N.Engine({setItem(){}},world);cachedState=check.load(storedRaw);}catch{invalidSave=true;}
 }
 return {s:cachedState,saved:!!storedRaw&&!invalidSave,invalid:invalidSave};
}
function title(item){return C.heading(item,en());}
function status(item,ctx){
 if(item.number===1&&!ctx.saved)return L('可启程','Begin here');
 return ({complete:L('已完成','Complete'),current:L('正在经历','In progress'),ready:L('可开启','Available'),locked:L('未解封','Sealed')})[item.status];
}
function card(item,ctx,chosen){
 const b=document.createElement('button');b.type='button';b.className='chapter-card';b.dataset.chapter=String(item.number);b.dataset.status=item.status;
 b.setAttribute('aria-label',title(item)+(item.status==='locked'?'':' · '+status(item,ctx)));
 if(chosen!==undefined)b.setAttribute('aria-pressed',String(item.number===chosen));
 const name=document.createElement('strong'),tag=document.createElement('span');name.textContent=title(item);tag.textContent=status(item,ctx);b.append(name);if(item.status!=='locked')b.append(tag);const progress=document.createElement('small');progress.className='chapter-progress';progress.textContent=L('已完成 ','Completed ')+item.progress.done+' / '+item.progress.total+L(item.number==='extras'?' 篇番外':' 段主线',item.number==='extras'?' epilogues':' story entries');b.append(progress);
 b.onclick=()=>show(item.number);return b;
}
function refreshTitle(){
 window.NanlanDemo?.labels();
}
function route(number){
 const item=C.entries(state()).find(e=>e.number===number);if(!item)return;
 if(number==='extras'){if(item.ready)window.NanlanVoyageUI.extras();else show(number);return;}
 if(item.ready&&!item.started){closeDialog(true);startNavigation(item.scene,item.object);return;}
 if(item.started&&!item.complete){const to=nextObjective();closeDialog(true);chooseTaskRoute(to);return;}
 show(number);
}
async function resume(number,go){
 closeDialog(true);
 if(!storedRaw){await beginGame();return;}
 await $('continueGame').onclick();
 if(started){if(go)route(number);else show(number);}
}
function show(){
 if(started){ showQuest();return; }
 showStartGuide();
}

function next(s=state()){return N.chapterEntries(s).find(e=>!e.started&&e.ready)||null;}
window.NanlanChapters={show,next,refreshTitle};
$('chaptersOpen').onclick=()=>show();
refreshTitle();
document.addEventListener('nanlanlanguagechange',()=>{refreshTitle();if(!$('dialog').hidden&&dialogKind==='chapter-entry')show(selected);});
const dictionary=window.NANLAN_EN||(window.NANLAN_EN={});
Object.assign(dictionary,{'六卷与番外':'Six Volumes & Epilogues','篇章一览':'The Whole Journey','一路相续':'A Journey Resumed','岁末家宴已完成，请到正厅读南街铺讯，开启第二卷后再进县城。':'The year-end feast is complete. Read the South Street notice in the hall to begin Volume II before visiting town.','请先完成第一卷并分享岁末家宴，再到正厅与家人读南街铺讯。':'Complete Volume I and share the year-end feast, then read the South Street notice with your family in the hall.'});
Object.assign(dictionary,{'待开放':'Not yet open','等待开放':'Not yet open','已开放':'Open','查找地点或卷数':'Search places or volumes','搜索地点或卷数，如：新河埠、第三卷、灶台':'Search a place or volume: Wharf, Volume III, Stove','全部地点与卷数清单':'All places and opening volumes'});
Object.assign(dictionary,{'家人与行李':'Family and Luggage','新春家议 · 第二卷':'New Year Family Discussion · Volume II','门侧的旧牌竹箱':'Bamboo Chest beside the Door','湾口望帆处':'Sail Lookout at the Bay','岁序簿 · 家人与伙伴':'Book of Seasons · Family and Companions','春潮来信与旅途册':'Spring-tide Letter and Travel Book','闲日邀约 · 六篇番外':'Days Together · Six Epilogues'});
window.NanlanI18n?.configure(dictionary);
})();
