/* A single settings drawer. Preferences never change story or save identifiers. */
(()=>{'use strict';
const panel=$('settingsPanel'),trigger=$('settingsOpen'),audio=$('audioPanel');
let returnFocus=null,resumePlay=false;
// Reuse the audio controls and their existing listeners in the drawer.
$('settingsAudio').append(audio);audio.removeAttribute('role');audio.removeAttribute('aria-label');
$('audioClose').hidden=true;
const isOpen=()=>!panel.hidden;
function sync(){
  $('settingsReadSize').setAttribute('aria-pressed',String(document.documentElement.classList.contains('large-read')));
  $('settingsScreenMode').hidden=!document.fullscreenEnabled;
  $('settingsScreenMode').setAttribute('aria-pressed',String(!!document.fullscreenElement));
  $('settingsGameOptions').hidden=!started;$('cameraView').hidden=!started;
}
function open(section){
  if(transitioning||window.NanlanOpening?.running())return;
  if(!isOpen()){
    returnFocus=document.activeElement;resumePlay=active;
    active=false;keys={};path=[];moving=false;
    cancelNavigation();panel.hidden=false;trigger.setAttribute('aria-expanded','true');
    $('settingsStatus').textContent='';
  }
  sync();audio.hidden=!$('settingsAudio').open;
  if(section==='audio'){$('settingsAudio').open=true;audio.hidden=false;$('audioToggle').focus();}
  else $('settingsClose').focus();
}
function close(restoreFocus=true){
  if(!isOpen())return;
  panel.hidden=true;audio.hidden=true;trigger.setAttribute('aria-expanded','false');
  keys={};path=[];moving=false;
  active=resumePlay&&started&&!transitioning&&!document.hidden&&$('dialog').hidden&&$('worldMap').hidden&&$('gallery').hidden&&!window.NanlanOpening?.running();
  if(restoreFocus&&returnFocus?.isConnected)returnFocus.focus({preventScroll:true});
}
trigger.onclick=()=>isOpen()?close():open();
$('settingsClose').onclick=()=>close();
panel.addEventListener('click',e=>{if(e.target===panel)close();});
$('settingsAudio').addEventListener('toggle',()=>{audio.hidden=!isOpen()||!$('settingsAudio').open;});
$('settingsReadSize').onclick=()=>{toggleReadingSize();sync();};
$('settingsScreenMode').onclick=toggleGameScreen;
document.addEventListener('fullscreenchange',sync);
// Close before opening another game panel, so its focus and pause state are retained.
for(const id of ['helpOpen','peopleOpen','galleryOpen','estateOpen'])$(id).addEventListener('click',()=>close(),true);
$('save').addEventListener('click',()=>{$('settingsStatus').textContent=$('saveState').textContent;});
window.addEventListener('keydown',e=>{
  if(!isOpen())return;
  e.stopImmediatePropagation();
  if(e.key==='Escape'){e.preventDefault();close();return;}
  if(e.key!=='Tab')return;
  const controls=[...panel.querySelectorAll('button:not(:disabled),input,summary')].filter(el=>el.getClientRects().length);
  const first=controls[0],last=controls.at(-1);
  if(!controls.length)return;
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
},true);
const dictionary=window.NANLAN_EN;
Object.assign(dictionary,{
  '设置与记录':'Settings & Journal','关闭设置':'Close settings','显示与语言':'Display & language',
  '试听与说明':'Preview & sound notes','言起有应':'Conversation & Comfort',
  '六卷与番外开发试玩':'Six-volume development preview with epilogues',
  '声音与音量':'Sound & volume','行旅与记录':'Journey & journal','更多记录':'More journals',
  '大字号':'Large text','全屏显示':'Full screen','舆图':'Map','互动':'Interact','行囊':'Satchel',
  '舆图 · M':'Map · M','行囊 · B':'Satchel · B',
  '打开舆图（M）':'Open map (M)','查看附近可互动的人与物':'Find nearby people and objects',
  '打开行囊（B）':'Open satchel (B)','设置':'Settings'
});
window.NanlanI18n?.configure(dictionary);
window.NanlanSettings={open,close,isOpen};
})();
