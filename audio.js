/* Original generated PCM files: synth_audio.py. Media playback avoids suspended
   WebAudio graphs and works with mobile playback-mode audio sessions. */
(() => {
  'use strict';
  const A=window.NANLAN_DATA?.assets||{},names=['click','blocked','door','water','repair','gather','rest','success','test','step'];
  let enabled=true,volume=.75,started=false,scene='gate',night=false,playing=false,error='',lastClick=-Infinity,lastStep=0;
  let ambience,effect,ambientKind='',generation=0;
  const $=id=>document.getElementById(id);
  try{enabled=localStorage.getItem('nanlan_sound')!=='off';const v=Number(localStorage.getItem('nanlan_volume'));if(localStorage.getItem('nanlan_volume')!==null&&Number.isFinite(v))volume=Math.max(.1,Math.min(1,v));}catch(_){}
  function source(name){return A['audio_'+name]||'assets/audio/'+name+'.wav';}
  function status(){
    const text=!enabled?'声音已关闭':error?'声音未启动 · 点击试听重试':playing?'声音已启动':'点击开启声音';
    for(const id of ['sound','startSound'])if($(id)){$(id).textContent=text;$(id).setAttribute('aria-pressed',String(enabled&&playing));}
    if($('audioToggle'))$('audioToggle').textContent=enabled&&playing?'关闭声音':'开启声音';
    if($('audioStatus'))$('audioStatus').textContent=error||(!enabled?'声音已关闭，设置会保留。':playing?'环境音正在播放。试听会播放两声清楚的提示音。':'请点击「开启声音」或「试听音效」，允许本页播放声音。');
    if($('audioVolumeValue'))$('audioVolumeValue').textContent=Math.round(volume*100)+'%';
  }
  function init(){
    if(ambience)return;
    try{if(navigator.audioSession)navigator.audioSession.type='playback';}catch(_){}
    ambience=new Audio();ambience.loop=true;ambience.preload='auto';
    effect=new Audio();effect.preload='auto';
    ambience.id='ambientAudio';effect.id='effectAudio';ambience.hidden=true;effect.hidden=true;document.body.append(ambience,effect);
    ambience.volume=volume*.55;effect.volume=volume;
    ambience.addEventListener('playing',()=>{playing=enabled&&!ambience.paused;error='';status();});
    ambience.addEventListener('error',()=>{playing=false;error='环境音未能加载，请点击试听重试。';status();});
    effect.addEventListener('error',()=>{error='音效未能加载，请重新打开页面后试听。';status();});
  }
  function kind(){return ['bed','hall','study','store','pharmacy','generalStore','teahouse'].includes(scene)?'room':['coast','tidalflat'].includes(scene)?'sea':night?'night':'day';}
  async function environment(){
    if(!enabled||!started||document.hidden)return false;init();
    const desired=kind(),token=++generation;
    if(ambientKind!==desired){ambientKind=desired;ambience.src=source('ambient-'+desired);}
    try{await ambience.play();if(token!==generation||!enabled)return false;playing=true;error='';status();return true;}
    catch(e){if(token!==generation||!enabled)return false;playing=false;error=e.name==='NotAllowedError'?'浏览器暂停了声音，请点击「开启声音」或「试听音效」。':'环境音未能播放，请点击试听重试。';status();return false;}
  }
  async function play(name='click'){
    if(!enabled||!started||document.hidden||!names.includes(name))return false;init();
    if(name==='click'){const now=Date.now();if(now-lastClick<70)return false;lastClick=now;}
    effect.pause();effect.src=source(name);effect.volume=name==='step'?volume*.35:volume;
    try{await effect.play();return true;}catch(e){if(e.name!=='AbortError'){error='音效暂未播放，请点击「试听音效」重新启动。';status();}return false;}
  }
  async function unlock(){if(!enabled)return false;started=true;init();return environment();}
  async function enable(test=false){enabled=true;started=true;try{localStorage.setItem('nanlan_sound','on');}catch(_){}init();const sound=play(test?'test':'click');const bg=environment();await Promise.all([sound,bg]);status();}
  async function toggle(){
    if(!enabled||!playing){await enable();return;}
    enabled=false;generation++;playing=false;error='';ambience?.pause();effect?.pause();try{localStorage.setItem('nanlan_sound','off');}catch(_){}status();
  }
  function setEnvironment(next,isNight,walking){const before=kind();scene=next;night=isNight;if(before!==kind()&&started)void environment();if(walking&&effect?.paused&&Date.now()-lastStep>380){lastStep=Date.now();void play('step');}}
  function openPanel(){const panel=$('audioPanel');panel.hidden=false;status();$('audioTest').focus();}
  // Keep the gesture synchronous: the old pointerdown handler could unlock audio
  // and then the same button's click would immediately mute it.
  document.addEventListener('click',event=>{
    const b=event.target.closest?.('button');if(!b||b.disabled||['sound','startSound','audioTest','audioToggle','audioClose'].includes(b.id))return;
    if(enabled){if(!started||!playing)void unlock();void play('click');}
  },true);
  document.addEventListener('keydown',e=>{if(enabled&&!started&&['Enter',' ','w','a','s','d','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)){void unlock();void play('click');}},{capture:true});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){generation++;ambience?.pause();effect?.pause();playing=false;status();}else if(started&&enabled)void environment();});
  window.addEventListener('pagehide',()=>{generation++;ambience?.pause();effect?.pause();playing=false;});
  window.addEventListener('pageshow',()=>{if(started&&enabled)void environment();});
  for(const id of ['sound','startSound'])if($(id))$(id).onclick=openPanel;
  $('audioClose').onclick=()=>{$('audioPanel').hidden=true;};
  $('audioToggle').onclick=toggle;
  $('audioTest').onclick=()=>enable(true);
  $('audioVolume').value=Math.round(volume*100);
  $('audioVolume').oninput=e=>{volume=Number(e.target.value)/100;if(ambience)ambience.volume=volume*.55;if(effect)effect.volume=volume;try{localStorage.setItem('nanlan_volume',String(volume));}catch(_){}status();};
  window.NanlanAudio={play,setEnvironment,toggle,unlock};status();
})();
