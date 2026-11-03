/* Optional village agreements and shared pond accounting. Never show the witness totals in the UI. */
(function(root, factory) {
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;else root.NanlanRural=api;
})(globalThis,function(){
  'use strict';
  const day=s=>Math.floor(s.worldTick/1440)+1;
  const fresh=()=>({chen:'',xu:'',cen:'',homes:0,marks:0,promise:0,dates:{},gifts:{},declined:{},seedDay:0,rackDay:0});
  const groups=['chen','xu','cen'];
  function normalise(s,need){
    s.rural??=fresh();
    const r=s.rural;
    for(const group of groups){
      need(['','working','promised','broken','done'].includes(r[group]),'乡约见证记录无效。');
      need(r.gifts&&r.dates&&r.declined&&typeof r.gifts==='object'&&typeof r.dates==='object'&&typeof r.declined==='object','乡约手记无效。');
      for(const m of [r.dates,r.declined])need(m[group]===undefined||(Number.isInteger(m[group])&&m[group]>=1),'乡约日期无效。');
      need(r.gifts[group]===undefined||r.gifts[group]===true,'乡约赠礼记录无效。');
    }
    for(const k of ['homes','marks'])need(Number.isInteger(r[k])&&r[k]>=0&&r[k]<=3,'乡约足迹无效。');
    for(const k of ['promise','seedDay','rackDay'])need(Number.isInteger(r[k])&&r[k]>=0,'乡约手记无效。');
  }
  function work(s,minutes,energy,need){
    need(s.stamina>=energy,'体力不足，先回卧房歇一歇。');
    need(s.worldTick%1440+minutes<=1320,'天色已晚，明早再来做这件事。');
    s.stamina-=energy;s.worldTick+=minutes;
  }
  function weather(s,d=day(s)){
    // Fixed at dawn; loading a save or leaving the browser cannot reroll the weather.
    let n=Math.imul(d+(s.gender==='male'?173:41),0x45d9f3b);
    n=Math.imul(n^(n>>>16),0x45d9f3b);const roll=((n^(n>>>16))>>>0)%100;
    return roll<15?'rain':roll<35?'damp':'fair';
  }
  function promiseLive(s){return s.rural?.xu==='promised'&&s.rural.promise===day(s)&&s.worldTick%1440<720;}
  function held(s,item){
    const r=s.rural;if(!r)return 0;
    if(item==='bamboo'&&r.cen==='working')return 1;
    if(item==='vegetable'&&r.chen==='working')return 2-Number(!!(r.homes&1))-Number(!!(r.homes&2));
    return item==='herb'&&promiseLive(s)?2:0;
  }
  function rank(s){
    const r=s.rural;if(!r)return 0;
    const neighbor=(r.chen==='done'?2:0)+(r.xu==='done'?1:0)+(r.cen==='done'?1:0);
    const trust=r.xu==='done'?2:r.xu==='broken'?-1:0;
    if(neighbor<2||trust<2||groups.filter(g=>r[g]==='done').length<2)return 0;
    return groups.every(g=>r[g]==='done')?2:1;
  }
  function offered(s,g){
    const r=s.rural,minute=s.worldTick%1440;
    if(!r||s.mode!=='daily'||r[g]==='done'||r[g]==='working'||r.declined[g]===day(s))return false;
    const f=s.flags;
    if(g==='chen')return f.metChen&&(f.neighborVegetables||[s.garden,...(s.extraPlots||[])].some(p=>p.harvestedKind==='vegetable'))&&minute>=420&&minute<660;
    if(g==='xu')return !promiseLive(s)&&f.fullGarden&&f.dryRack&&f.medicinalHarvested&&minute>=480&&minute<600;
    const storm=s.journal.find(row=>row.id==='M13');
    return f.bridgeReady&&s.quests.M13?.status==='COMPLETED'&&(!storm||day(s)>Math.floor(storm.tick/1440)+1)&&minute>=360&&minute<600;
  }
  const location={chen:'village',xu:'village',cen:'foothill'};
  const doneNote={chen:'两篮菜送到了人家门口。',xu:'午前送到了约定的鲜草药。',cen:'桥柱与高阶的水痕已经认清，挑担人改走了高路。'};
  function finish(s,g){
    const before=rank(s);s.rural[g]='done';s.rural.dates[g]=day(s);
    s.journal.push({id:'乡约',tick:s.worldTick,text:doneNote[g]});
    if(rank(s)>before)s.journal.push({id:'村中记事',tick:s.worldTick,text:rank(s)===2?'乡中父老愿为李家作保。':'陈伯在村簿上写下了李家的名字。'});
  }
  function act(s,name,p,h){
    const {requireThat:need,requireScene:at,spend,give,available,log}=h,r=s.rural,g=p.person;
    need(p.sequence===s.revision,'眼前的安排已更新，请重新打开后操作。');
    if(name==='neighborAccept'||name==='neighborDecline'){
      need(groups.includes(g)&&offered(s,g),'请在相约的时辰再来。');at(s,location[g]);
      if(name==='neighborDecline'){r.declined[g]=day(s);return;}
      const item={chen:'vegetable',xu:'herb',cen:'bamboo'}[g],count=g==='cen'?1:2;
      need(available(s,item)>=count,'请先备齐未预留的实物。');
      if(g==='cen')need(s.stamina>=4,'体力不足，先回卧房歇一歇。');
      r[g]=g==='xu'?'promised':'working';if(g==='xu')r.promise=day(s);
      return;
    }
    if(name==='neighborDeliver'){
      at(s,'village');const bit=p.stop===1?1:p.stop===2?2:0;
      need(bit&&r.chen==='working'&&!(r.homes&bit),'这一户已经送到，或尚未接下菜篮。');
      work(s,10,1,need);r.homes|=bit;spend(s,{vegetable:1});
      if(r.homes===3)finish(s,'chen');return;
    }
    if(['neighborKeep','neighborWithdraw','neighborSell'].includes(name)){
      at(s,'village');need(promiseLive(s),'午约已经过去，明日还可重新约定。');
      if(name==='neighborKeep')need(s.worldTick%1440+15<=720,'这一趟赶不上午约，可以先去说明。');
      r.xu=name==='neighborSell'?'broken':'';r.declined.xu=day(s);
      if(name==='neighborWithdraw')return;
      spend(s,{herb:2});if(name==='neighborSell'){s.coins+=6;log(s,'sale',6,'将原约给许青禾的两份鲜草另售','herb');return;}
      work(s,15,1,need);finish(s,'xu');return;
    }
    if(name==='neighborMark'){
      at(s,'mountain');const bit=p.stop===1?1:p.stop===2?2:0;
      need(bit&&r.cen==='working'&&!(r.marks&bit),'先随阿岑认路，或看看另一处水痕。');
      work(s,15,2,need);r.marks|=bit;if(r.marks===3){finish(s,'cen');spend(s,{bamboo:1});}return;
    }
    if(name==='neighborGift'){
      need(groups.includes(g)&&r[g]==='done'&&!r.gifts[g]&&day(s)>=r.dates[g]+3,'等约定的清晨再来。');at(s,location[g]);r.gifts[g]=true;return;
    }
    if(name==='neighborSeed'){
      at(s,'village');need(r.gifts.chen&&r.seedDay!==day(s),'今日的种子已经换过，或还未约好。');
      spend(s,{vegetable:1});give(s,{seed:1});r.seedDay=day(s);return;
    }
    if(name==='neighborDry'){
      at(s,'store');need(r.gifts.xu&&s.quests.M07?.status==='COMPLETED'&&r.rackDay!==day(s),'今日竹匾已用，或尚未取得图样。');
      spend(s,{herb:3});give(s,{driedHerb:2});r.rackDay=day(s);return;
    }
    need(false,'这项乡里事务还不能办理。');
  }
  return {fresh,normalise,day,weather,work,promiseLive,offered,held,rank,act};
});
