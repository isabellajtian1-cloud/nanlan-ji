/* All three views read the household calendar. Only the visible season is fetched. */
(() => {
  'use strict';
  const keys=['spring','summer','autumn','winter'];
  for(const name of keys) NANLAN_DATA.assets['canopy_'+name]='phenology-'+name+'-6119.webp';
  Object.assign(NANLAN_DATA.assets,{seasonLotus:'pond-lotus-6119.webp',seasonTray:'drying-tray-6119.webp'});
  const retryAt=new Map();
  function painted(id){
    if(images[id]?.naturalWidth)return images[id];
    if(Date.now()>=(retryAt.get(id)||0)){
      retryAt.set(id,Date.now()+15000);
      void loadImage(id,{passive:true});
    }
    return null;
  }
  function phase(s){
    const d=NanlanClimate.at(s),i=d.index;
    if(d.day>=25)return {a:i,b:(i+1)%4,mix:(d.day-24)*.105};
    if(d.day<=2&&(!s.calendar?.from||s.calendar.anchorDay!==Math.floor(s.worldTick/1440)+1)&&s.mode==='daily'){
      return {a:(i+3)%4,b:i,mix:d.day===1?.78:.91};
    }
    return {a:i,b:i,mix:0};
  }
  function frame(s){
    const p=phase(s),a=painted('canopy_'+keys[p.a]),b=p.mix?painted('canopy_'+keys[p.b]):null;
    return {a,b,mix:p.mix,key:[p.a,p.b,p.mix,!!a,!!b].join('/')};
  }
  function ready(s){
    const p=phase(s),ids=p.mix?[p.a,p.b]:[p.a];
    return Promise.all(ids.map(i=>loadImage('canopy_'+keys[i],{passive:true})));
  }
  function environment(ctx,frame,garden,w,h,ruin=false){
    const {a,b,mix}=frame;
    ctx.save();
    if(ruin){
      // Keep the unrepaired masonry and dry pond. Only vegetation changes on arrival.
      ctx.beginPath();ctx.rect(0,0,w,h*.23);ctx.rect(w*.515,h*.278,w*.15,h*.18);
      ctx.rect(w*.83,h*.79,w*.17,h*.21);ctx.clip();ctx.filter='saturate(.55) brightness(.77)';
    }
    const sy=garden?512:0;
    if(a)ctx.drawImage(a,0,sy,768,512,0,0,w,h);
    if(b){ctx.globalAlpha=a?mix:1;ctx.drawImage(b,0,sy,768,512,0,0,w,h);}
    ctx.restore();
  }
  function pondPlants(ctx,s,w,h){
    const im=painted('seasonLotus');if(!im)return;
    const p=phase(s);
    const clusters=[[[.32,.42,.12],[.67,.66,.095]],[[.32,.50,.29],[.66,.68,.20]],[[.32,.48,.19],[.66,.67,.145]],[[.32,.47,.17],[.665,.68,.105]]];
    function draw(i,alpha){
      ctx.globalAlpha=alpha;
      for(const [x,y,scale] of clusters[i]){
        const side=w*scale;
        ctx.drawImage(im,i*184,0,184,184,x*w-side/2,y*h-side,side,side);
      }
    }
    ctx.save();draw(p.a,1-p.mix);if(p.mix)draw(p.b,p.mix);ctx.restore();
  }
  function pondOverlay(){
    const overlay=document.createElement('canvas');overlay.width=384;overlay.height=344;
    overlay.className='pond-plant-layer';overlay.setAttribute('aria-hidden','true');
    const draw=()=>pondPlants(overlay.getContext('2d'),state(),384,344);
    void loadImage('seasonLotus',{passive:true}).then(ok=>{if(ok&&overlay.isConnected)draw();});
    return overlay;
  }
  function drawTray(ctx,s,o){
    if(!s.rural.herbTray&&NanlanClimate.at(s).key!=='autumn')return;
    const im=painted('seasonTray');if(im)ctx.drawImage(im,s.rural.herbTray?256:0,0,256,208,o.x-30,o.y-39,60,49);
  }
  function trayPanel(o){
    const s=state(),cal=NanlanClimate.at(s),batch=s.rural.herbTray;
    if(cal.key!=='autumn'&&!batch)return false;
    const L=deskText,ready=batch&&s.worldTick>=batch.readyAt;
    const wet=NanlanWeather.current(s).wet,late=N.clock(s).minute>=960;
    const message=batch?(ready?L('竹匾里的药叶已经干透。收进袋里，这一匾就腾出来了。','The leaves have dried. Gather them into a pouch to empty the tray.'):
      L('你摊开的药草还在檐下，今日酉初（17:00）可收。','Your herbs are drying under the eaves. Return at 17:00.')):
      wet?L('檐外在下雨。等天放晴，再把鲜草摊开。','Rain falls beyond the eaves. Spread the herbs once it clears.'):
      late?L('斜阳已经过墙，明日趁早来摊药。','The sunshine has slipped past the wall. Start a fresh batch tomorrow.'):
      L('竹匾已放在檐下。摊两份鲜药草，傍晚可收一份干药草。','Spread two fresh herbs under the eaves. One portion of dried herbs will be ready at dusk.');
    activity(L('檐下 · 晒药竹匾','The drying tray'),message,'autumn-herbs');dialogObject=o;
    const img=document.createElement('div');img.className='herb-tray-art';img.dataset.filled=String(!!batch);img.setAttribute('aria-hidden','true');$('panelExtra').append(img);
    if(!batch&&!wet&&!late){
      const b=actButton(L('摊开鲜药草 ×2','Spread two fresh herbs'),'seasonTraySpread',{sequence:s.revision},()=>trayPanel(o),'season-spread');
      if(N.available(s,'herb')<2){b.disabled=true;const note=document.createElement('p');note.textContent=L('行囊里可用的鲜药草不足两份。','You need two available fresh herbs.');$('panelExtra').append(note);}
    }
    if(ready)actButton(L('收进药袋 · 干药草 ×1','Gather one dried herb'),'seasonTrayGather',{sequence:s.revision},()=>trayPanel(o),'season-gather');
    if(batch&&!ready&&N.clock(s).minute<1020)button(L('在檐下等到酉初（17:00）','Wait by the tray until 17:00'),()=>{
      activity(L('留在檐下','Stay under the eaves'),L('等候会把今天的时辰推进到 17:00。','Waiting here will advance today’s clock to 17:00.'),'autumn-wait');
      actButton(L('等到酉初','Wait until 17:00'),'seasonTrayWait',{sequence:state().revision},()=>trayPanel(o),'season-wait-yes');
      button(L('先去办事','Keep my time'),()=>trayPanel(o),'season-wait-no',true);
    },'season-wait',true);
    button(L('回庭院','Return to the courtyard'),()=>closeDialog(true),'season-leave',true);
    return true;
  }
  function yardAir(ctx,s,t,reduced){
    const d=NanlanClimate.at(s),w=NanlanWeather.current(s),minute=N.clock(s).minute;
    const afterRain=d.key==='spring'&&w.index>0&&minute-w.start<45&&NanlanWeather.plan(s)[w.index-1]?.wet;
    ctx.save();ctx.scale(W/1536,H/1024);
    if(d.key==='spring'&&!reduced&&!w.wet&&afterRain){
      for(const [i,x] of [521,690,809].entries()){
        const f=reduced?.68:(t/1380+i*.31)%1;
        ctx.fillStyle='rgba(209,226,212,.74)';ctx.beginPath();ctx.ellipse(x,116+f*f*155,1.4,2.7,0,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle='rgba(206,224,209,.48)';ctx.beginPath();ctx.ellipse(x,274,2+f*7,1+f*2.5,0,0,Math.PI*2);ctx.stroke();
      }
    }
    if(d.key==='winter'&&s.flags.stoveClean){
      for(let n=0;n<3;n++){
        const f=reduced?(n+1)/4:(t/2800+n/3)%1,x=1448+Math.sin(f*6)*3,y=425-f*34;
        ctx.strokeStyle='rgba(252,246,222,'+(.52*(1-f))+')';ctx.lineWidth=2.2;
        ctx.beginPath();ctx.moveTo(x,y);ctx.bezierCurveTo(x-7,y-5,x+6,y-9,x+2,y-14);ctx.stroke();
      }
    }
    ctx.restore();
  }
  function sampleLinks(){
    const s=state(),key=NanlanClimate.at(s).key;
    if(s.scene==='yard'){
      const route=({spring:s.flags.smallBed&&['herbPlot','到菜圃看墒情','Visit the garden beds'],
        summer:s.flags.volume2Started&&['silkPond','去塘边看荷、喂鱼','Visit the lotus pond'],
        autumn:s.flags.dryRack&&['dryRackVisual','去檐下看晒药竹匾','Visit the drying tray'],
        winter:s.flags.stoveClean&&['stove','回灶边暖一暖','Warm up by the hearth']})[key];
      if(route)navButton(deskText(route[1],route[2]),()=>{closeDialog(true);startNavigation('yard',route[0]);},'season-visit');
    }
    if(window.NanlanFarmSample==='weather'){
      const nav=document.createElement('nav');nav.className='season-sample-links weather-sample-links';nav.dataset.noLocalize='';
      nav.setAttribute('aria-label',deskText('选择试玩天气','Choose a weather sample'));
      const current=NanlanWeather.current(s).id;
      for(const [id,type] of Object.entries(NanlanWeather.TYPES)){
        const a=document.createElement('a'),url=new URL(location.href);url.searchParams.set('sky',id);a.href=url.href;
        a.textContent=deskText(type.zh,type.en);if(id===current)a.setAttribute('aria-current','true');nav.append(a);
      }
      $('panelExtra').prepend(nav);return;
    }
    if(window.NanlanFarmSample!=='seasons')return;
    const row=document.createElement('nav');row.className='season-sample-links';row.dataset.noLocalize='';
    for(const [i,key] of keys.entries()){
      const a=document.createElement('a'),url=new URL(location.href);
      url.searchParams.set('season',key);a.href=url.href;
      a.textContent=deskText(['春庭','夏庭','秋庭','冬庭'][i],['Spring','Summer','Autumn','Winter'][i]);
      if(NanlanClimate.at(state()).key===key)a.setAttribute('aria-current','true');row.append(a);
    }
    $('panelExtra').prepend(row);
  }
  function winterMeal(){
    const s=state();if(s.mode!=='daily'||NanlanClimate.at(s).key!=='winter')return;
    const L=deskText;
    button(L('围灶吃碗热饭','Warm up by the hearth'),()=>{
      activity(L('冬日围灶','By the winter hearth'),L('母亲给你让出灶边的小凳。祖父正捧着碗暖手。','Mother moves a stool beside the hearth. Grandfather warms his hands around his bowl.'),'winter-hearth');
      if(N.available(state(),'hotMeal'))actButton(L('端一份热饭坐下','Sit down with one hot meal'),'eat',{},()=>{
        activity(L('一家人吃热饭','A hot meal together'),L('你吃了随身的一份热饭。祖父把壶嘴转向你：「喝口热的，出门手就不僵了。」','You finish your hot meal. Grandfather turns the kettle towards you. “A little tea will warm your hands for the walk.”'));
        button(L('回到灶边','Back to the hearth'),showCook,'winter-cook-back');
      },'winter-eat');
      button(L('去灶上做饭','Cook at the hearth'),showCook,'winter-cook',true);
      if(NanlanFestivalUI.active(state())?.id==='winterSolstice'){
        const event=world.hall.objects.find(o=>o.festival==='winterSolstice');
        if(event)button(L('去正厅过冬至','Join the family for Winter Solstice'),()=>{closeDialog();startNavigation('hall',event.id);},'winter-solstice');
      }
    },'winter-hearth');
  }
  function note(s,en){
    const notes=[
      ['白花开在庭心，荷尖刚露水。春雨持续一阵，菜畦会先后吃透雨水；湿土颜色更深。','White flowers open in the yard and lotus tips break the water. Sustained spring rain soaks the beds one by one. Look for dark earth.'],
      ['浓荫落到石板上，荷叶间留着亮水。晴时听蝉，雨来声歇；塘边可采夏荷做荷叶饭。','Shade falls across the paving and fish swim between lotus leaves. Cicadas quieten in rain. Gather a summer leaf for lotus-leaf rice.'],
      ['莲蓬渐熟，檐下能晒药。自家晾架搭好后，晴日16:00前摊两份鲜药草，17:00后可收一份干药草。','Seedpods ripen. Once the rack is built, spread two herbs before 16:00 in dry weather. Gather one dried herb after 17:00.'],
      ['残荷让出一池清水，灶边留了热茶。带一份热饭可坐下暖身，冬至去正厅与家人搓圆子。','Bare lotus stems stand over open water. Bring a hot meal to the hearth. At Winter Solstice, join the family in the hall to roll rice dumplings.']
    ];
    return notes[NanlanClimate.at(s).index][en?1:0];
  }
  let cicadas=null,lastCheck=0,retrySound=0;
  function quietSound(){if(cicadas){cicadas.pause();cicadas.volume=0;}lastCheck=0;}
  function sound(s,allowed,gain){
    const now=performance.now();
    if(!allowed||!gain){if(cicadas&&!cicadas.paused)quietSound();return;}
    if(now-lastCheck<250)return;lastCheck=now;
    const light=N.daylight(s).minute;
    const wanted=NanlanClimate.at(s).key==='summer'&&light>=480&&light<1080&&!NanlanWeather.current(s).wet;
    if(!wanted&&!cicadas)return;
    if(!cicadas){cicadas=new Audio('summer-cicadas-6119.wav');cicadas.loop=true;cicadas.volume=0;}
    const target=wanted?Math.min(.65,gain*.66):0;
    cicadas.volume=Math.max(0,Math.min(1,cicadas.volume+Math.max(-.12,Math.min(.06,target-cicadas.volume))));
    if(wanted&&cicadas.paused&&now>=retrySound){retrySound=now+3000;cicadas.play().catch(()=>{});}
    if(!wanted&&cicadas.volume<.001)cicadas.pause();
  }
  window.NanlanScenery={frame,ready,environment,pondPlants,pondOverlay,drawTray,trayPanel,yardAir,sampleLinks,winterMeal,sound,quietSound,note};
})();
