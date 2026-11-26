(function(root, factory){
  if(typeof module==='object' && module.exports) module.exports=factory(require('./kitchen-folio-data.js'),require('./climate.js'));
  else root.NanlanFood=factory(root.NanlanFoodData,root.NanlanClimate);
})(globalThis,function(D,calendar){
  'use strict';
  const fields={lotusLeaf:['yard','summer'],rose:['village','spring'],jasmine:['village','summer'],osmanthus:['village','autumn']};
  const seasonalGoods={crab:'autumn',rose:'spring',wisteriaPaste:'spring',jasmine:'summer',osmanthus:'autumn',ice:'summer'};
  const day=s=>Math.floor(s.worldTick/1440)+1;
  const portion=r=>'dish_'+r.id;
  const fresh=()=>({pages:{},picked:{},jar:null,orders:{}});
  const inSeason=(s,r)=>!r.season||r.season===calendar.at(s).key;
  const stocked=(s,id)=>D.goods[id][2]>0 && (!seasonalGoods[id]||seasonalGoods[id]===calendar.at(s).key);
  const markets=['market','teahouse','countyInn'];
  function canServe(scene,r){return scene==='market'||(scene==='teahouse'?['tea','sweet'].includes(r.group):scene==='countyInn'&&['savoury','grain'].includes(r.group));}
  function request(s,scene){
    const menu=Object.values(D.recipes).filter(r=>canServe(scene,r)&&inSeason(s,r));
    return menu[(day(s)+(scene==='teahouse'?2:0))%menu.length];
  }
  function quote(s,r){
    const bonus=s.scene!=='market'&&request(s,s.scene)?.id===r.id && s.foodFolio.orders[s.scene]!==day(s);
    return {bonus,price:r.price+(bonus?5:0)};
  }
  function shopping(s,r,available){
    const missing=r.foods.filter(id=>available(s,id)<1);
    const cart=missing.filter(id=>stocked(s,id));
    return {cart,gather:missing.filter(id=>!cart.includes(id)),price:cart.reduce((n,id)=>n+D.goods[id][2],0)};
  }
  function normalise(s,need){
    if(s.foodFolio===undefined)s.foodFolio=fresh();
    const f=s.foodFolio, obj=x=>x && typeof x==='object' && !Array.isArray(x);
    need(obj(f)&&obj(f.pages)&&obj(f.picked)&&obj(f.orders),'市井食笺记录无效。');
    for(const [id,p] of Object.entries(f.pages))need(Object.hasOwn(D.recipes,id)&&obj(p)&&Number.isSafeInteger(p.made)&&p.made>0&&Number.isSafeInteger(p.first)&&p.first>0,'食笺落款无效。');
    for(const r of Object.values(D.recipes))need((s.bag[portion(r)]||0)<=(f.pages[r.id]?.made||0),'食笺与行囊份数不符。');
    for(const [id,n] of Object.entries(f.picked))need(Object.hasOwn(fields,id)&&Number.isSafeInteger(n)&&n>0,'采摘记录无效。');
    for(const [id,n] of Object.entries(f.orders))need(['teahouse','countyInn'].includes(id)&&Number.isSafeInteger(n)&&n>0,'食肆点单记录无效。');
    need(f.jar===null || (obj(f.jar)&&Object.hasOwn(D.recipes,f.jar.id)&&D.recipes[f.jar.id].work==='crock'&&Number.isSafeInteger(f.jar.due)&&f.jar.due>0),'糟坛记录无效。');
  }
  function pack(s,r,give){
    const p=s.foodFolio.pages[r.id] || (s.foodFolio.pages[r.id]={made:0,first:day(s)});
    p.made++;give(s,{[portion(r)]:1});
  }
  function act(s,action,p,h){
    const {requireThat:need,requireScene,done,give,spend,available,log}=h;
    need(done(s,'M04'),'先和家人吃过第一顿饭。');
    need(p.sequence===s.revision,'手边的记录已变，请重新核对。');
    const f=s.foodFolio;
    if(action==='foodPick'){
      const field=Object.hasOwn(fields,p.item)&&fields[p.item];
      need(field,'请选当季可采的花叶。');requireScene(s,field[0]);
      need(field[1]===calendar.at(s).key,'尚未到采摘时节。');
      need(f.picked[p.item]!==day(s),'今日已经采过，明日再来。');
      give(s,{[p.item]:1});f.picked[p.item]=day(s);return;
    }
    if(action==='foodUnseal'){
      requireScene(s,['yard','serviceKitchen']);need(f.jar && s.worldTick>=f.jar.due,'这坛还没有到开坛的时候。');
      pack(s,D.recipes[f.jar.id],give);f.jar=null;return;
    }
    const r=Object.hasOwn(D.recipes,p.id)&&D.recipes[p.id];
    need(r,'请选择食笺里的一道菜。');
    if(action==='foodPurchase'){
      requireScene(s,'village');need(inSeason(s,r),'这道菜尚未到供应时节。');
      const bill=shopping(s,r,available);
      need(bill.cart.length && p.price===bill.price,'请重新核对食篮与钱数。');
      need(s.coins>=bill.price,'身上的铜钱不够。');
      s.coins-=bill.price;give(s,Object.fromEntries(bill.cart.map(id=>[id,1])));
      log(s,'buy',-bill.price,'食材篮 · '+r.title[0],null);return;
    }
    if(action==='foodCook'){
      requireScene(s,['yard','serviceKitchen']);need(inSeason(s,r),'这道菜尚未到供应时节。');
      need(r.work!=='crock'||!f.jar,'糟坛已有一份，待揭坛后再用。');
      need(s.bucketWater>=1,'请先到庭院水缸装水。');
      spend(s,{wood:1,...Object.fromEntries(r.foods.map(id=>[id,1]))});s.bucketWater--;
      if(r.work==='crock') f.jar={id:r.id,due:day(s)*1440+360};
      else pack(s,r,give);
      return;
    }
    if(action==='foodEat'){
      need(s.stamina<100,'体力正满，留到路上再吃。');spend(s,{[portion(r)]:1});
      s.stamina=Math.min(100,s.stamina+25);return;
    }
    need(action==='foodSell','这项食肆操作不可用。');requireScene(s,markets);
    need(canServe(s.scene,r)&&inSeason(s,r),'今日灶单不收这道菜。');
    if(s.scene==='market')need(s.stallUntil>s.worldTick && h.clock(s).minute>=540 && h.clock(s).minute<1020,'先在开市时留一张摊布。');
    else need(s.flags.volume2Started,'请先开启县城南街。');
    const sale=quote(s,r);
    need(p.price===sale.price,'请重新核对客人开出的价钱。');
    spend(s,{[portion(r)]:1});s.coins+=sale.price;
    if(sale.bonus)f.orders[s.scene]=day(s);
    log(s,'sale',sale.price,(s.scene==='market'?'镇集食摊':s.scene==='teahouse'?'茶馆':'客栈')+' · '+r.title[0],portion(r));
  }
  return {...D,fields,seasonalGoods,day,portion,fresh,inSeason,stocked,request,quote,shopping,canServe,normalise,act};
});
