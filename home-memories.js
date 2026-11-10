/* Read-only illustrations of actual household milestones, including migrated saves. */
(()=>{'use strict';
const L=(zh,en)=>window.NanlanI18n?.language==='en'?en:zh;
const entries=[
 {name:'岁末灯火',en:'Year-end lanterns',scene:'yard',before:'yard',after:'yard',done:s=>s.flags.festivalLamps,note:'两盏纸灯亲手挂稳、点亮，晚归时檐下多了一点暖光。',open:()=>window.NanlanLanternWork.show()},
 {name:'窗格与漏雨',en:'Windows and leaks',scene:'bed',before:'bedDamage',after:'bed',done:s=>s.flags.windowPatched&&s.flags.leakPatched,note:'窗格补稳、漏雨处修好，卧房才有了安稳。'},
 {name:'窗下旧页',en:'Old pages by the window',scene:'study',before:'study-desk-v6922.webp',after:'study-desk-v6922.webp',done:s=>s.flags.pagesDried,note:'两页由程婉许可晾晒；原簿的归属没有改变。'},
 {name:'第一张摊布',en:'The first market cloth',scene:'market',before:'market-cloth-v6922.webp',after:'market-cloth-v6922.webp',done:s=>s.flags.firstSale,note:'摆上自己做的货，完成第一笔真实买卖，留下凭单。'},
 {name:'正厅通道',en:'The hall passage',scene:'hall',before:'hallBefore',after:'hallAfter',done:s=>s.flags.hallwayCleared,note:'竹篓、铺盖与矮凳各归其处，中间留给家人与邻里。'},
 {name:'离地的仓房货物',en:'Storehouse goods raised safely',scene:'store',before:'storeBefore',after:'storeAfter',done:s=>s.flags.cratesRaised,note:'木箱、布袋与竹篮分别架高，留出通风和走动的空隙。'},
 {name:'一家人的热饭',en:'A warm family meal',scene:'hall',before:'hall',after:'$meal',done:s=>s.flags.firstMealShared||N.done(s,'M04'),note:'饭菜实做实用，热饭端到家人眼前。'},
 {name:'自己的菜圃药圃',en:'Your vegetable and herb beds',scene:'yard',before:'yard',after:'yard',done:s=>s.flags.fullGarden,note:'六块田各自播种、生长与采收，收成和留种会留在行囊里。'},
 {name:'南街的铺号',en:'Your South Street shop',scene:'generalStore',before:'generalStore',after:'generalStore',done:s=>s.flags.v2Sign||s.flags.volume2Complete,note:'从筹备到开铺，货架、账目与客人的来往都按实数记下。'}
];
function source(key){return DATA.assets[key==='$meal'?(state().gender==='male'?'familyMealMale':'familyMealFemale'):key]||key;}
function show(index=null){
 const s=state();if(index===null){activity(L('家宅留影 · 日子留下的变化','Home Memories · The Changes You Made'),L('这里记的是已经办妥的事。可以回看，不推进时辰，也不再领一次回报。','These are things you have actually completed. Looking back advances no time and grants no repeated reward.'),'player-records');const grid=document.createElement('div');grid.className='home-memory-grid';$('panelExtra').append(grid);entries.forEach((r,i)=>{const b=document.createElement('button');b.className='home-memory-card';const done=r.done(s);b.innerHTML='<img alt="" src="'+source(done?r.after:r.before)+'"><strong>'+L(r.name,r.en)+'</strong><small>'+L(done?'已留下的变化':'还在慢慢置办',done?'A change you made':'Still to come')+'</small>';b.onclick=()=>done&&r.open?r.open():show(i);grid.append(b);});return;}
 const r=entries[index],done=r.done(s);activity(L(r.name,r.en),L(done?r.note:'这件事还没有办妥。沿当前任务慢慢来，完成后会在这里留下。',done?'This milestone is recorded in your journey.':'This milestone is still ahead. It will remain here when completed.'),'player-records');let before=!done;const fig=document.createElement('figure'),img=document.createElement('img'),caption=document.createElement('figcaption');fig.className='home-memory-view';img.src=source(before?r.before:r.after);img.alt=L(r.name,r.en);caption.textContent=L(before?'早先的样子':'如今留下的变化',before?'Before':'The change you made');fig.append(img,caption);$('panelExtra').append(fig);
 if(done&&r.before!==r.after)navButton(L('对照整理前后','Compare before and after'),()=>{before=!before;img.src=source(before?r.before:r.after);caption.textContent=L(before?'早先的样子':'如今留下的变化',before?'Before':'The change you made');},'home-compare');
 navButton(L('回到家宅留影','Back to home memories'),()=>show(),'home-back');
}
function vignette(kind){if(!/^(v4-story|v4-result|season-story|season-result|voyage-story|voyage-extra-story)$/.test(kind))return;const s=state(),w=world[s.scene];if(!w)return;const details=document.createElement('details');details.className='scene-vignette';const summary=document.createElement('summary'),small=document.createElement('img'),full=document.createElement('img'),label=document.createElement('span');small.src=full.src=DATA.assets[w.asset];small.alt='';full.alt=w.name;label.textContent=L(w.name+' · 看看眼前的景物',w.name+' · Look around');summary.append(small,label);details.append(summary,full);$('panelExtra').append(details);}
const b=document.createElement('button');b.id='homeMemories';b.type='button';b.textContent=L('家宅留影','Home memories');b.onclick=()=>{window.NanlanSettings?.close();show();};$('settingsGameOptions').querySelector('.settings-grid').append(b);window.NanlanHomeMemories={show,vignette};
})();
