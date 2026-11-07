/* Chapter names are presentation only; no save fields, quest flags or clock changes. */
(()=>{'use strict';
const cn=['','一','二','三','四','五','六'],roman=['','I','II','III','IV','V','VI'];
const en=()=>window.NanlanI18n?.language==='en',L=(a,b)=>en()?b:a;
const titles=[null,['初抵南澜','Arrival in Nanlan'],['南街灯起','South Street Lights'],['山海成行','Roads between Hills and Sea'],['海天帆影','Sails beneath Open Skies'],['岁序长青','Enduring Seasons'],['春潮有信','Letters on the Spring Tide']];
const summaries=[null,
 ['从旧宅门前开始，与家人一起安顿，在邻里的往来中认识南澜。','Settle into the old house with your family, and come to know Nanlan through its neighbors.'],
 ['将家中的手艺带到南街，在买卖与守约中，慢慢经营一间自己的铺子。','Bring your household crafts to South Street and build a shop through honest trade and promises kept.'],
 ['沿山路与河埠走远一些，也学会把同行者与家中的事安排妥当。','Travel farther along the hills and waterways, making room for your companions and those at home.'],
 ['在更远的泊岸与更多人的委托之间，照看货物、承诺与归途。','Tend to goods, promises and the journey home as distant harbors bring new work.'],
 ['看岁时更替，与家人分担手边的劳作，为下一季留出余地。','Share the work of the changing seasons, leaving room for those you love and for the year ahead.'],
 ['随春潮走一程，记得远方的见闻，也记得回家后的日常。','Follow the spring tide, bringing distant discoveries back into everyday life at home.']];
function describe(s){
 const f=s?.flags||{},q=N.current(s),n=q?.startsWith('V6_')||f.voyageStarted||f.voyageComplete?6:q?.startsWith('S5_')||q?.startsWith('V5_')||f.season5Started||f.volume5Started?5:f.volume4Started?4:f.volume3Started?3:f.volume2Started?2:1;
 const legacy=n===5&&q?.startsWith('V5_');
 return {number:n,title:legacy?['清水归渠','Clear Water, Homeward']:titles[n],complete:n===1?!!f.volumeComplete:n===5?(legacy?!!f.volume5Complete:!!f.season5Complete):n===6?!!f.voyageComplete:!!f['volume'+n+'Complete']};
}
function label(info){return L('第'+cn[info.number]+'卷','Volume '+roman[info.number])+' · '+info.title[en()?1:0];}
let last=null,pending=null,flashTimer=0,rawBefore,languageBefore;
function safeToShow(){return !document.hidden&&$('dialog').hidden&&$('worldMap').hidden&&$('gallery').hidden&&!window.NanlanOpening?.running();}
function flash(info){
 const box=$('volumeIntertitle');box.replaceChildren();
 const small=document.createElement('small'),title=document.createElement('strong');
 small.textContent=L('第'+cn[info.number]+'卷','Volume '+roman[info.number]);title.textContent=info.title[en()?1:0];box.append(small,title);
 box.hidden=false;box.classList.remove('ink-arrival');void box.offsetWidth;box.classList.add('ink-arrival');
 clearTimeout(flashTimer);flashTimer=setTimeout(()=>{box.hidden=true;},3400);
}
function saveLabel(){
 const language=en()?'en':'zh';
 if(rawBefore===storedRaw&&languageBefore===language)return;
 rawBefore=storedRaw;languageBefore=language;if(!storedRaw)return;
 try{const s=JSON.parse(storedRaw),info=describe(s),day=N.clock(s).day,button=$('continueGame');
 const summary=$('saveSummary');if(summary){summary.hidden=false;const c=N.clock(s);summary.textContent=L('存档时辰：','Saved time: ')+NanlanClimate.label(s,en())+' · '+String(c.hour).padStart(2,'0')+':'+String(c.minute%60).padStart(2,'0');}
 button.dataset.noLocalize='';button.textContent=L('继续旅程 · 第'+cn[info.number]+'卷','Continue · Volume '+roman[info.number]);
 }catch{/* The existing title screen handles unreadable saves. */}
}
function refresh(s=state(),live=started){
 const info=describe(s),mark=$('chapterMark');const value=label(info);
 if(mark.textContent!==value)mark.textContent=value;
 mark.setAttribute('aria-label',value+' · '+L('查看六卷与番外入口','Open All Volumes and Epilogues'));
 saveLabel();
 if(!live){last=null;pending=null;$('volumeIntertitle').hidden=true;return;}
 if(last!==info.number){last=info.number;pending=info;}
 if(!safeToShow()){$('volumeIntertitle').hidden=true;return;}
 if(pending)queueMicrotask(()=>{if(pending&&started&&safeToShow()){flash(pending);pending=null;}});
}
function show(){
 const s=state(),info=describe(s),q=N.current(s);
 activity(L('篇章行记','The Chapter Journal'),L('此刻行至：','Your place in the story: ')+label(info),'chapter-journal');dialogObject=null;
 const list=document.createElement('div');list.className='chapter-leaves';list.dataset.noLocalize='';
 for(const item of window.NanlanChapterCatalog.entries(s)){
  const row=document.createElement('article'),head=document.createElement('h3'),tag=document.createElement('small'),text=document.createElement('p'),link=document.createElement('button');
  head.textContent=window.NanlanChapterCatalog.heading(item,en());
  tag.textContent=({locked:L('未解封','Sealed'),ready:L('可开启','Available'),current:L('正在经历','In progress'),complete:L('已完成','Complete')})[item.status];
  text.textContent=L('已完成 ','Completed ')+item.progress.done+' / '+item.progress.total+L(item.number==='extras'?' 篇番外':' 段主线',item.number==='extras'?' epilogues':' story entries');
  link.textContent=L('查看条件与去处','View Conditions & Starting Place');link.onclick=()=>window.NanlanChapters.show(item.number);
  row.append(head,tag,text,link);list.append(row);
 }
 $('panelExtra').append(list);
 navButton(L('查看全部六卷与番外入口','View All Volumes and Epilogues'),()=>window.NanlanChapters.show(),'journal-all-chapters');
 window.NanlanMemoryBook?.link(show);
 window.NanlanEndings?.history();
 if(q)navButton(L('翻到眼前的记事 · ','Open the current entry · ')+(en()?window.NanlanI18n.t(N.titles[q]):N.titles[q]),showQuest,'chapter-current-entry');
 else navButton(L('看看接下来的日子','See What Comes Next'),()=>window.NanlanChapters.show(),'chapter-next-entry');
 navButton(L('合上行记，回到此间','Close the Journal'),()=>closeDialog(true),'chapter-journal-close');
}
$('chapterMark').dataset.noLocalize='';$('volumeIntertitle').dataset.noLocalize='';
$('chapterMark').onclick=()=>window.NanlanChapters.show();
window.NanlanChapterMark={describe,label,refresh,show};
refresh();
document.addEventListener('nanlanlanguagechange',()=>refresh());
})();
