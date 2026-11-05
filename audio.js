/* Original score and soundscapes: compose_soundscape.py. No third-party recordings. */
(()=>{'use strict';
const A=window.NANLAN_DATA?.assets||{},$=id=>document.getElementById(id),names=['click','blocked','door','water','repair','gather','rest','success','test','step','sealWood','sealStone','riceSimmer','riceLid','riceRake','riceCrust'];
let enabled=true,volume=.75,started=false,scene='gate',night=false,playing=false,error='',lastClick=0,lastStep=0,dialogue=false;
const levels={music:.58,ambient:.28,effect:.46},tracks={home:'灯下归家',village:'榕荫小路',town:'南街开市',mountain:'青岚寻径',sea:'潮生远帆','home-night':'月过回廊','village-night':'榕月虫声','town-night':'灯市渐阑','mountain-night':'青岚宿云','sea-night':'月照潮痕'};
const layers={music:{players:[],active:0,key:'',ticket:0},ambient:{players:[],active:0,key:'',ticket:0}};let effect,effectGain=1,environmentTicket=0;
try{enabled=localStorage.getItem('nanlan_sound')!=='off';const v=localStorage.getItem('nanlan_volume');if(v!==null)volume=Math.max(0,Math.min(1,Number(v)||0));for(const k in levels){const v=localStorage.getItem('nanlan_'+k+'_volume');if(v!==null)levels[k]=Math.max(0,Math.min(1,Number(v)||0));}}catch(_){}
function profile(s=scene,n=night){const sea=['coast','tidalflat','wharf','anchorage'].includes(s),forest=['foothill','mountain','mountainside','summit','bambooGrove','oldTrail'].includes(s),room=['guild','backHall','bed','hall','study','store','pharmacy','generalStore','teahouse','workshop'].includes(s),town=['guild','qingxi','county','market','pharmacy','generalStore','teahouse','workshop'].includes(s),family=sea?'sea':forest?'mountain':town?'town':s==='village'?'village':'home';return {music:n?family+'-night':family,ambient:room?'room':n?(sea?'sea-night':forest?'forest-night':'night'):sea?'sea':s==='summit'||s==='mountainside'?'highland':s==='bambooGrove'?'bamboo':forest?'forest':town?'market':s==='village'?'village':'courtyard'};}
function status(){const text=!enabled?'声音已关闭':error?'声音未启动 · 点击试听重试':playing?'声音已启动':'点击开启声音';for(const id of ['sound','startSound'])if($(id)){$(id).textContent=text;$(id).setAttribute('aria-pressed',String(enabled&&playing));}if($('audioToggle'))$('audioToggle').textContent=enabled&&playing?'关闭声音':'开启声音';if($('audioStatus'))$('audioStatus').textContent=error||(!enabled?'声音已关闭。':playing?'正在播放《'+tracks[profile().music]+'》 · 音乐与当地环境音独立混合。':'点击开启或试听，启动本页声音。');for(const [id,v] of [['audioVolume',volume],['musicVolume',levels.music],['ambientVolume',levels.ambient],['effectVolume',levels.effect]])if($(id+'Value'))$(id+'Value').textContent=Math.round(v*100)+'%';}
function media(id,loop){const p=new Audio();p.id=id;p.loop=loop;p.preload='auto';p.hidden=true;p.volume=0;document.body.append(p);return p;}
function init(){if(effect)return;try{if(navigator.audioSession)navigator.audioSession.type='playback';}catch(_){}effect=media('effectAudio',false);for(const [k,l]of Object.entries(layers))l.players=[media(k+'Audio',true),media(k+'AudioAlt',true)];}
// Music sits slightly behind the scene even when an older save has a high volume setting.
function target(k){return volume*levels[k]*(k==='music'?.8:1)*(k==='music'&&dialogue?.5:1);}
function gains(){for(const [k,l] of Object.entries(layers))for(const p of l.players){p.muted=target(k)===0;p.volume=Math.max(0,Math.min(1,target(k)*(p.mix||0)));}if(effect){effect.muted=target('effect')===0;effect.volume=target('effect')*effectGain;}}
function fade(l,k,to){clearInterval(l.timer);const ticket=l.ticket;let step=0;to.mix=0;l.timer=setInterval(()=>{if(ticket!==l.ticket||!enabled||document.hidden){clearInterval(l.timer);return;}step++;to.mix=Math.min(1,step/60);gains();if(step>=60){clearInterval(l.timer);l.timer=null;}},45);}
function layer(k,key){
  const l=layers[k];if(l.pendingKey===key&&l.pending)return l.pending;
  if(l.key===key&&!l.pending){return l.players[l.active].play();}
  const token=++l.ticket;clearInterval(l.timer);l.timer=null;
  // Stop both old voices before loading: rapid travel cannot stack landscapes.
  for(const old of l.players){old.pause();old.mix=0;old.volume=0;}
  l.active=1-l.active;const p=l.players[l.active];l.pendingKey=key;l.key='';
  p.src=''+(k==='music'?'music-':'scape-')+key+'.mp3';
  l.pending=(async()=>{try{await p.play();if(token!==l.ticket)return;if(!enabled||document.hidden){p.pause();return;}l.key=key;fade(l,k,p);}finally{if(token===l.ticket){l.pending=null;l.pendingKey='';}}})();return l.pending;
}
async function environment(){if(!enabled||!started||document.hidden)return false;init();const ticket=++environmentTicket,p=profile();const results=await Promise.allSettled([layer('music',p.music),layer('ambient',p.ambient)]);if(ticket!==environmentTicket||!enabled||document.hidden)return false;playing=results.every(r=>r.status==='fulfilled');error=playing?'':'音乐或环境音暂未播放，请点击试听重试。';status();return playing;}
async function play(name='click'){if(!enabled||!started||document.hidden||!names.includes(name))return false;init();if(name==='click'){const now=Date.now();if(now-lastClick<90)return false;lastClick=now;}effect.pause();effect.src=''+name+'.wav';effectGain=name==='step'?.14:name==='click'?.38:name==='blocked'?.62:1;effect.muted=target('effect')===0;effect.volume=target('effect')*effectGain;try{await effect.play();return true;}catch(e){if(e.name!=='AbortError'){error='操作音效暂未启动，请点击试听重试。';status();}return false;}}
function pause(){environmentTicket++;for(const l of Object.values(layers)){l.ticket++;l.pending=null;l.pendingKey='';clearInterval(l.timer);for(const p of l.players)p.pause();l.players.forEach((p,i)=>p.mix=i===l.active?1:0);}effect?.pause();playing=false;status();}
async function unlock(){if(!enabled)return false;started=true;init();return environment();}
async function enable(test=false){enabled=true;started=true;try{localStorage.setItem('nanlan_sound','on');}catch(_){}init();await Promise.all([play(test?'test':'click'),environment()]);status();}
async function toggle(){if(!enabled||!playing){await enable();return;}enabled=false;error='';pause();try{localStorage.setItem('nanlan_sound','off');}catch(_){}status();}
function setEnvironment(next,isNight,walking){const before=JSON.stringify(profile());scene=next;night=isNight;if(before!==JSON.stringify(profile())&&started)void environment();if(walking&&effect?.paused&&Date.now()-lastStep>650){lastStep=Date.now();void play('step');}}
function setDialogue(value){dialogue=value;gains();}
function openPanel(){$('audioPanel').hidden=false;status();$('audioTest').focus();}
document.addEventListener('click',e=>{const b=e.target.closest?.('button');if(!b||b.disabled||['sound','startSound','audioTest','audioMusicTest','audioMusicOnly','audioToggle','audioClose'].includes(b.id))return;if(enabled){if(!started||!playing)void unlock();void play('click');}},true);
document.addEventListener('keydown',e=>{if(enabled&&!started&&['Enter',' ','w','a','s','d','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key))void unlock();},{capture:true});
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();else if(started&&enabled){gains();void environment();}});window.addEventListener('pagehide',pause);window.addEventListener('pageshow',()=>{if(started&&enabled)void environment();});
for(const id of ['sound','startSound'])if($(id))$(id).onclick=openPanel;$('audioClose').onclick=()=>{$('audioPanel').hidden=true;};$('audioToggle').onclick=toggle;$('audioTest').onclick=()=>enable(true);$('audioMusicTest').onclick=()=>enable(false);$('audioMusicOnly').onclick=()=>{levels.ambient=0;levels.effect=0;$('ambientVolume').value=0;$('effectVolume').value=0;try{localStorage.setItem('nanlan_ambient_volume','0');localStorage.setItem('nanlan_effect_volume','0');}catch(_){}gains();void enable(false);};
for(const [id,key]of [['audioVolume','master'],['musicVolume','music'],['ambientVolume','ambient'],['effectVolume','effect']]){const el=$(id);el.value=Math.round((key==='master'?volume:levels[key])*100);el.oninput=e=>{const v=Math.max(0,Math.min(1,Number(e.target.value)/100));if(key==='master')volume=v;else levels[key]=v;gains();try{localStorage.setItem(key==='master'?'nanlan_volume':'nanlan_'+key+'_volume',String(v));}catch(_){}status();};}
function stopKitchen(){if(effect&&/rice(?:Simmer|Lid|Rake|Crust)\.wav(?:[?#]|$)/.test(effect.src))effect.pause();}
window.NanlanAudio={stopKitchen,play,setEnvironment,setDialogue,toggle,unlock,profile};status();
})();

