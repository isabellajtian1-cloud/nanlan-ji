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
 const version=document.querySelector('.version-note'),release=version.textContent.match(/V[\d.]+/)?.[0]||'';
 document.title=L('南澜记 '+release+' · 行止有记','Nanlan Chronicles '+release+' · Journeys Remembered');
 version.textContent=L(release+' · 行止有记 · 六卷与番外开发试玩',release+' · Journeys Remembered · Six-volume development preview with epilogues');
 const host=$('startChapterList');if(!host)return;const ctx=context();host.replaceChildren();
 for(const item of C.entries(ctx.s))host.append(card(item,ctx));
 $('startChapterNote').textContent=ctx.invalid?L('存档暂时无法读取；这里只展示篇章目录，原数据保留。','The save cannot be read. This is a chapter preview; your data is preserved.'):L('按旅程依次开启 · 点卷名查看条件与去处','Unlock in story order · Select a volume for its conditions and starting place');
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
function show(number){
 if(transitioning||window.NanlanOpening?.running())return;
 if(!$('worldMap').hidden)closeMap();
 const ctx=context(),all=C.entries(ctx.s);
 const chosen=all.find(e=>e.number===number)||all.find(e=>e.status==='ready')||all.find(e=>e.status==='current')||all.at(-1);
 selected=chosen.number;
 activity(L('六卷与番外 · 篇章入口','Six Volumes & Epilogues'),L('每一卷都在这里。选择卷名查看开启条件，再沿旅程接续故事。','Every volume is listed here. Select one to see its conditions and continue along the story.'),'chapter-entry');dialogObject=null;
 const browser=document.createElement('div');browser.className='chapter-browser';browser.dataset.noLocalize='';
 const list=document.createElement('nav');list.className='chapter-list';list.setAttribute('aria-label',L('选择篇章','Select a chapter'));
 for(const item of all)list.append(card(item,ctx,chosen.number));
 const detail=document.createElement('section');detail.className='chapter-detail';detail.setAttribute('aria-label',L('篇章详情','Chapter details'));
 const head=document.createElement('h3'),tag=document.createElement('span'),summary=document.createElement('p');
 head.textContent=title(chosen);tag.className='chapter-status';tag.textContent=status(chosen,ctx);summary.textContent=chosen.status==='locked'?L('这一卷尚未解封，卷名与经历将在开启后写入。下方保留开启条件和入口。','This volume is sealed. Its title and story will be written in when it opens; its conditions and entrance remain below.'):chosen.description[en()?1:0];detail.append(tag,head,summary);
 const place=world[chosen.scene],obj=place.objects.find(o=>o.id===chosen.object),where=document.createElement('p');where.className='chapter-start-place';
 where.textContent=L('开篇地点：','Starting place: ')+(en()?window.NanlanI18n.t(place.name):place.name)+(obj?' · '+(en()?window.NanlanI18n.t(obj.label):obj.label):'');detail.append(where);
 const requirements=document.createElement('ul');requirements.className='chapter-requirements';
 if(!chosen.requirements.length){const li=document.createElement('li');li.textContent=L('从门前交接开始，无需解锁前置篇章。','Begin at the gate; no earlier chapter is required.');requirements.append(li);}
 for(const [ready,zh,english]of chosen.requirements){const li=document.createElement('li');li.textContent=(ready?'✓ ':'○ ')+(en()?english:zh);requirements.append(li);}
 detail.append(requirements);
 if(chosen.number==='extras'){
  const extra=N.voyage.get(ctx.s)?.extra,grid=document.createElement('div');grid.className='epilogue-directory';
  N.voyage.bonus.forEach((b,id)=>{const row=document.createElement('p'),name=document.createElement('strong'),stateLabel=document.createElement('small');name.textContent=chosen.status==='locked'?L('番外 '+(id+1)+' · 未解封','Epilogue '+(id+1)+' · Sealed'):b.title[en()?1:0];stateLabel.textContent=extra?.done?.[id]?L('已完成 · 可重看','Complete · Recall available'):extra?.active?.id===id?(extra.active.paused?L('已暂缓 · 可续上','Paused · Resume available'):L('邀约进行中','Invitation in progress')):chosen.ready?L('可邀约','Available'):L('第六卷主线完成后开启','After Volume VI');row.append(name,stateLabel);grid.append(row);});detail.append(grid);
 }
 if(chosen.recordIssue||ctx.invalid){const note=document.createElement('p');note.className='chapter-warning';note.textContent=L('存档中有需要核对的记录。原进度已保留，请先从行囊备份进度；这里不会重置任务或物资。','Some save records need review. Your progress is preserved; back it up from the satchel. No tasks or belongings are reset here.');detail.append(note);}
 browser.append(list,detail);$('panelExtra').append(browser);
 if(!started){
  if(!ctx.invalid){const go=chosen.ready||chosen.started&&!chosen.complete;
   navButton(!ctx.saved?L('从第一卷启程','Begin Volume I'):go?(chosen.number==='extras'?L('继续存档 · 打开番外邀约','Continue Save · Open Epilogues'):chosen.ready?L('继续存档 · 前往本卷入口','Continue Save · Go to This Entrance'):L('继续当前旅程','Continue Your Journey')):L('继续存档 · 查看篇章入口','Continue Save · View Entrances'),()=>resume(chosen.number,go),'chapter-title-continue');}
 }else{
  if(chosen.number==='extras'&&chosen.ready)navButton(L('打开六篇番外 · 邀约与回忆','Open Six Epilogues · Invitations & Memories'),()=>route('extras'),'chapter-extras');
  else if(chosen.ready&&!chosen.started)navButton(L('沿路前往 · 开启','Follow the Route · Begin ')+C.label(chosen.number,en()),()=>route(chosen.number),'chapter-enter-'+chosen.number);
  else if(chosen.started&&!chosen.complete)navButton(L('继续眼前任务','Continue the Current Quest'),()=>route(chosen.number),'chapter-resume');
  else if(!chosen.complete&&!chosen.recordIssue)navButton(L('先完成当前旅程','Continue the Current Journey First'),()=>{const to=nextObjective();closeDialog(true);chooseTaskRoute(to);},'chapter-prerequisite');
  if(chosen.number===2)navButton(L('查看南街筹备方案','Read the South Street Preparation Plan'),()=>window.NanlanV2.entry(),'chapter-two-details');
  navButton(L('篇章行记与已完成的回忆','Chapter Journal & Completed Memories'),()=>window.NanlanChapterMark.show(),'chapter-journal');
 }
 navButton(started?L('合上卷册，回到场景','Close and Return'):L('返回标题屏','Return to Title'),()=>closeDialog(true),'chapter-close');
 $('dialog').querySelector('.sheet').scrollTop=0;
}
function next(s=state()){return N.chapterEntries(s).find(e=>!e.started&&e.ready)||null;}
window.NanlanChapters={show,next,refreshTitle};
$('chaptersOpen').onclick=()=>show();
refreshTitle();
document.addEventListener('nanlanlanguagechange',()=>{refreshTitle();if(!$('dialog').hidden&&dialogKind==='chapter-entry')show(selected);});
const dictionary=window.NANLAN_EN||(window.NANLAN_EN={});
Object.assign(dictionary,{'六卷与番外':'Six Volumes & Epilogues','篇章一览':'The Whole Journey','行止有记':'Journeys Remembered','岁末家宴已完成，请到正厅读南街铺讯，开启第二卷后再进县城。':'The year-end feast is complete. Read the South Street notice in the hall to begin Volume II before visiting town.','请先完成第一卷并分享岁末家宴，再到正厅与家人读南街铺讯。':'Complete Volume I and share the year-end feast, then read the South Street notice with your family in the hall.'});
Object.assign(dictionary,{'待开放':'Not yet open','等待开放':'Not yet open','已开放':'Open','查找地点或卷数':'Search places or volumes','搜索地点或卷数，如：新河埠、第三卷、灶台':'Search a place or volume: Wharf, Volume III, Stove','全部地点与卷数清单':'All places and opening volumes'});
Object.assign(dictionary,{'家人与行李':'Family and Luggage','新春家议 · 第二卷':'New Year Family Discussion · Volume II','门侧的旧牌竹箱':'Bamboo Chest beside the Door','湾口望帆处':'Sail Lookout at the Bay','岁序簿 · 家人与伙伴':'Book of Seasons · Family and Companions','春潮来信与旅途册':'Spring-tide Letter and Travel Book','闲日邀约 · 六篇番外':'Days Together · Six Epilogues'});
window.NanlanI18n?.configure(dictionary);
})();
