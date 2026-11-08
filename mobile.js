/* On phones, keep the view clear and open information only when requested. */
(()=>{'use strict';
const media=matchMedia('(max-width:700px), (max-width:1200px) and (max-height:600px)'),L=(zh,en)=>window.NanlanI18n?.language==='en'?en:zh;
let looking=false,resume=false;
const status=document.createElement('button'),tools=document.createElement('button'),view=document.createElement('button');
status.id='mobileStatus';tools.id='mobileTools';view.id='mobileOverview';
for(const b of [status,tools,view]){b.type='button';b.className='mobile-control';b.setAttribute('data-no-localize','');$('hud').append(b);}
const viewArt='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5M4 15l5-5 4 4 3-3 4 4"/><circle cx="15" cy="7" r="1"/></svg>';
function refresh(){if(!started)return;const s=state(),date=window.NanlanClimate.at(s),c=N.clock(s),hh=String(Math.floor(c.minute/60)).padStart(2,'0'),mm=String(c.minute%60).padStart(2,'0'),time=(window.NanlanI18n?.language==='en'?date.en+' '+date.day:date.zh+' '+date.day+'日')+' · '+hh+':'+mm;
 status.replaceChildren();for(const text of [time,L('体力 ','Energy ')+Math.floor(s.stamina),s.coins+L('文',' coins')]){const span=document.createElement('span');span.textContent=text;status.append(span);}status.setAttribute('aria-label',L('日期与状态：','Date and status: ')+time+' · '+L('体力 ','Energy ')+Math.floor(s.stamina)+' · '+s.coins+L('文，点开日历',' coins. Open calendar'));
 const selected=toolDefs.find(d=>d[0]===s.selected)||toolDefs[0];tools.innerHTML=toolbarArt(selected[0]);tools.setAttribute('aria-label',L('选择工具，当前：','Choose tool. Current: ')+(window.NanlanI18n?.t?window.NanlanI18n.t(selected[1]):selected[1]));tools.title=L('选择工具','Choose Tool');
 view.innerHTML=viewArt+(looking?'<span>'+L('返回','Return')+'</span>':'');view.setAttribute('aria-label',looking?L('回到人物','Return to Player'):L('看完整场景','View Full Scene'));view.setAttribute('aria-pressed',String(looking));view.title=looking?L('回到人物','Return to Player'):L('看全景','Full Scene');
 $('hud').classList.toggle('mobile-overview',looking);if(media.matches){$('tasks').classList.add('collapsed');$('taskToggle').setAttribute('aria-expanded','false');}
}
status.onclick=()=>{if(active)showTime();};
tools.onclick=()=>{if(!active||transitioning)return;const s=state();activity(L('随身工具','Tools at Hand'),L('选好后收起，回到眼前的场景。','Choose a tool and return to the scene.'),'mobile-tools');for(const [i,[id,label,note]]of toolDefs.entries()){const available=!((i<5||id==='axe')&&!s.tools[id]),b=button(label+(s.selected===id?' ✓':''),()=>{closeDialog();selectTool(i);refresh();},'mobile-tool-'+id);b.disabled=!available;b.setAttribute('aria-pressed',String(s.selected===id));const art=document.createElement('span');art.className='mobile-tool-art';art.innerHTML=toolbarArt(id);b.prepend(art);if(!available)b.title=L('尚未获得，可到仓房查看','Not acquired. Check the storehouse.');} $('dialog').classList.add('mobile-tools-sheet');};
function closeOverview(){if(!looking)return;looking=false;overviewCamera=false;cameraOverviewUntil=0;keys={};path=[];moving=false;active=resume&&started&&!transitioning&&!document.hidden&&$('dialog').hidden&&$('worldMap').hidden&&$('gallery').hidden&&!window.NanlanSettings?.isOpen();refresh();}
view.onclick=()=>{if(looking){closeOverview();return;}if(!active||transitioning)return;resume=active;looking=true;active=false;keys={};path=[];moving=false;cancelNavigation();overviewCamera=true;cameraOverviewUntil=0;refresh();};
const taskClick=$('taskToggle').onclick;$('taskToggle').onclick=()=>{if(media.matches){if(active)showQuest();}else taskClick();};
media.addEventListener('change',()=>{closeOverview();refresh();});
window.addEventListener('keydown',e=>{if(!looking)return;if(e.key==='Tab'||e.target===view&&['Enter',' '].includes(e.key))return;e.preventDefault();e.stopImmediatePropagation();if(e.key==='Escape')closeOverview();},true);
let safe=null;
function measure(){if(!media.matches){safe=null;return;}const a=$('actions').getBoundingClientRect(),t=$('tasks').getBoundingClientRect(),r=$('hud').getBoundingClientRect(),left=Math.max(10,status.getBoundingClientRect().left-r.left),right=Math.max(10,r.right-view.getBoundingClientRect().right);safe={left,top:Math.max(54,t.bottom-r.top+8),width:Math.max(1,r.width-left-right),bottom:Math.min(r.height-58,a.top-r.top-8)};}
window.addEventListener('resize',()=>{keys={};path=[];moving=false;measure();});
const oldRefresh=refresh;function measuredRefresh(){oldRefresh();measure();}
window.NanlanMobile={refresh:measuredRefresh,compact:()=>media.matches,isOverview:()=>looking,safeFrame:()=>safe};measuredRefresh();
})();

