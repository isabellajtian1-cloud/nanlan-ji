/* Gameplay uses journey minutes for work, and calendar dates for the season. */
(function(root,make){
  const api=make();
  if(typeof module==='object'&&module.exports)module.exports=api;else root.NanlanSeasonWork=api;
})(globalThis,function(){
  'use strict';
  function normalise(s,need){
    const tray=s.rural.herbTray;
    if(tray==null)return;
    need(Number.isFinite(tray.spreadAt)&&tray.spreadAt>=0&&tray.spreadAt<=s.worldTick&&
      tray.readyAt===Math.floor(tray.spreadAt/1440)*1440+1020&&tray.readyAt>tray.spreadAt,'晒药时辰无效。');
  }
  function tend(s,name,p,{need,spend,give,near,climate,weather}){
    need(s.mode==='daily'&&s.scene==='yard'&&s.flags.dryRack&&near,'请走到自家晾架前。');
    need(p.sequence===s.revision,'请重新看看竹匾。');
    const current=s.rural.herbTray;
    if(name==='seasonTraySpread'){
      need(!current&&climate.at(s).key==='autumn'&&!weather.current(s).wet&&s.worldTick%1440<960,'秋日晴时，申末以前可摊药。');
      spend(s,{herb:2});
      s.rural.herbTray={spreadAt:s.worldTick,readyAt:Math.floor(s.worldTick/1440)*1440+1020};
    }else if(name==='seasonTrayWait'){
      need(current&&s.worldTick<current.readyAt,'这匾药已无需等候。');s.worldTick=current.readyAt;
    }else{
      need(name==='seasonTrayGather'&&current&&s.worldTick>=current.readyAt,'药草尚未晒妥。');
      give(s,{driedHerb:1});delete s.rural.herbTray;
    }
  }
  function soakedPlots(s,start,climate,weather){
    if(s.mode!=='daily'||Math.floor(start)>=Math.floor(s.worldTick)||!s.flags.smallBed)return [];
    const plots=[s.garden,...s.extraPlots],hits=[];
    const dry=plots.map((p,i)=>({p,i})).filter(({p,i})=>p.plantedAt!=null&&!p.watered&&
      (i<4||s.flags.fullGarden)&&!(p.kind==='herb'&&s.quests.M07?.status==='ACTIVE'&&!s.flags.medicinalWatered));
    if(!dry.length)return hits;
    for(let day=Math.floor(start/1440);day<=Math.floor(s.worldTick/1440)&&hits.length<dry.length;day++){
      const dawn=day*1440,view={...s,worldTick:dawn+360};
      if(climate.at(view).key!=='spring')continue;
      for(const slot of weather.plan(view)){
        if(!slot.wet||dawn+slot.end<=start||dawn+slot.start>s.worldTick)continue;
        for(const {p,i} of dry){
          const when=Math.ceil(Math.max(dawn+slot.start,p.plantedAt))+(slot.id==='drizzle'?14:6)+i*4;
          if(when>start&&when<=s.worldTick&&when<dawn+slot.end&&!hits.some(x=>x.i===i))hits.push({i,when});
        }
      }
    }
    return hits;
  }
  function soak(s,hits){for(const {i,when} of hits){const p=i?s.extraPlots[i-1]:s.garden;p.watered=true;p.wateredAt=when;}}
  return {normalise,tend,soakedPlots,soak};
});
