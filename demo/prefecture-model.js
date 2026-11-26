((root,make)=>{
  const api=make(root);
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.NanlanPrefecture=api;
})(globalThis,root=>{
  const places=['prefDock','prefMarket','prefInn','prefRoom','prefTea'];
  const inns={
    county:{lobby:'countyInn',room:'countyRoom',fee:6},
    prefecture:{lobby:'prefInn',room:'prefRoom',fee:8}
  };
  const fare=8, passage=90;
  const teaMenu={
    tea:{
      mountain:{name:['山中散茶','Mountain Leaf Tea'],cost:2,energy:8,tile:0},
      songluo:{name:['松萝茶','Songluo Tea'],cost:3,energy:10,tile:1},
      roasted:{name:['焙香散茶','Roasted Leaf Tea'],cost:4,energy:12,tile:4}
    },
    cake:{
      rice:{name:['蒸米糕','Steamed Rice Cake'],cost:3,energy:12,tile:2},
      sesame:{name:['芝麻小饼','Sesame Cakes'],cost:4,energy:14,tile:3},
      jujube:{name:['枣糕','Jujube Cake'],cost:4,energy:14,tile:5},
      bean:{name:['豆沙团','Red Bean Dumplings'],cost:4,energy:15,tile:6},
      pastry:{name:['糖酥饼','Sugared Flaky Cakes'],cost:5,energy:16,tile:7}
    }
  };
  const serving=s=>{
    const order=s.choices.prefectureTea;
    return order&&s.worldTick-order.at<45?order:null;
  };
  const day=s=>Math.floor(s.worldTick/1440)+1;
  const minutes=s=>Math.floor(s.worldTick)%1440;
  const away=s=>s.choices.prefectureAway===true;
  const unlocked=s=>s.flags.v3_return===true;
  const booked=(s,id)=>s.choices['inn:'+id]===day(s);
  const storm=s=>root.NanlanWeather?.current(s)?.id==='storm';
  function gate(s,to){
    if(places.includes(to))return away(s)?'':'府城须从新河埠乘船抵达。';
    if(away(s))return '正在府城。请从府城河埠乘回程船返回南澜。';
    if(to==='countyRoom')return s.flags.volume2Started?'':'开启第二卷后可到南街客栈。';
    return null;
  }
  function sailing(s){
    if(storm(s))return '雷雨未歇，船家暂缓开船。';
    if(minutes(s)<420||minutes(s)>=960)return '班船在 07:00 至 16:00 开行。';
    return '';
  }
  function act(s,name,p,{requireThat,requireScene,spend,give,log,prices,sleepToMorning,world}){
    const go=to=>{
      const [x,y]=world[to].spawn;
      s.scene=to;s.player={x,y};s.visits[to]=true;
    };
    const pay=(amount,note)=>{
      requireThat(s.coins>=amount,'钱袋里的铜钱不够。');
      s.coins-=amount;log(s,'buy',-amount,note);
    };
    const advance=duration=>{const start=Math.floor(s.worldTick/1440)*1440;s.worldTick=Math.max(s.worldTick,Math.min(s.worldTick+duration,start+1320));};
    if(name==='prefCheckIn'||name==='prefSleep'){
      const inn=Object.hasOwn(inns,p.inn)&&inns[p.inn];
      requireThat(inn&&s.mode==='daily','先安顿家里，再到客栈投宿。');
      requireScene(s,name==='prefCheckIn'?inn.lobby:inn.room);
      if(name==='prefCheckIn'){
        if(booked(s,p.inn))return false;
        pay(inn.fee,'客栈柜台结清一夜房钱');
        s.choices['inn:'+p.inn]=day(s);
      }else{
        requireThat(booked(s,p.inn),'请先到一楼柜台结账订房。');
        sleepToMorning(s);
      }
      return;
    }
    if(name==='prefSail'||name==='prefReturn'){
      const outbound=name==='prefSail';
      requireScene(s,outbound?'wharf':'prefDock');
      requireThat(outbound?unlocked(s)&&!away(s)&&!s.choices.voyage6?.away:away(s),'先认得新河埠，再安排这趟船。');
      const why=sailing(s);requireThat(!why,why);
      if(outbound)pay(fare,'新河埠结清府城往返船脚');
      s.choices.prefectureAway=outbound;
      s.worldTick+=passage;
      go(outbound?'prefDock':'wharf');
      if(outbound&&!s.choices.prefectureFirst){
        s.choices.prefectureFirst=true;
        s.journal.push({id:'prefecture-first',tick:s.worldTick,text:'第一次沿水路进府城。手里还留着回南澜的船凭。'});
      }
      return;
    }
    if(name==='prefWait'){
      requireScene(s,['wharf','prefDock']);
      requireThat(s.scene==='prefDock'?away(s):unlocked(s),'先认得新河埠，再安排这趟船。');
      requireThat(!!sailing(s),'此刻可以乘船。');
      if(minutes(s)<420&&!storm(s))s.worldTick=(day(s)-1)*1440+420;
      else s.worldTick=day(s)*1440+420;
      return;
    }
    if(name==='prefSale'){
      requireScene(s,'prefMarket');
      requireThat(minutes(s)>=360&&minutes(s)<600,'早市在 06:00 至 10:00 收样。');
      requireThat(s.choices.prefectureSale!==day(s),'今日样货已结账，明早再来。');
      requireThat(['driedHerb','bambooWare'].includes(p.item),'今日只收干药草或竹编。');
      spend(s,{[p.item]:1});const price=prices[p.item]+3;
      s.coins+=price;log(s,'sale',price,'府城早市售出一件样货',p.item);
      give(s,{receipt:1});s.choices.prefectureSale=day(s);
      return;
    }
    if(name==='prefMeal'){
      requireScene(s,'prefInn');
      pay(6,'府城客栈结清一份饭钱');
      s.stamina=Math.min(100,s.stamina+25);advance(20);return;
    }
    if(name==='prefTea'){
      requireScene(s,'prefTea');
      const tea=p.tea&&Object.hasOwn(teaMenu.tea,p.tea)&&teaMenu.tea[p.tea];
      const cake=p.cake&&Object.hasOwn(teaMenu.cake,p.cake)&&teaMenu.cake[p.cake];
      requireThat((tea||cake)&&(!p.tea||tea)&&(!p.cake||cake),'请先选茶或点心。');
      const cost=(tea?.cost||0)+(cake?.cost||0),energy=(tea?.energy||0)+(cake?.energy||0);
      pay(cost,'府城茶铺结清茶点钱');
      s.stamina=Math.min(100,s.stamina+energy);advance(15);
      s.choices.prefectureTea={tea:p.tea||null,cake:p.cake||null,at:s.worldTick};
      return;
    }
    requireThat(false,'这里没有这项营生。');
  }
  function normalise(s,need){
    need(s.choices.prefectureAway===undefined||typeof s.choices.prefectureAway==='boolean','府城船凭有误。');
    need(away(s)===places.includes(s.scene),'府城地点与船凭不符。');
    need(!away(s)||unlocked(s)&&!s.choices.voyage6?.away,'府城船路尚未开放。');
    for(const key of ['inn:county','inn:prefecture','prefectureSale']){
      const value=s.choices[key];
      need(value===undefined||Number.isInteger(value)&&value>0&&value<=day(s),'房账或市账日期有误。');
    }
    const order=s.choices.prefectureTea;
    if(order!==undefined)need(order&&Number.isFinite(order.at)&&order.at>=0&&order.at<=s.worldTick&&
      (order.tea===null||Object.hasOwn(teaMenu.tea,order.tea))&&
      (order.cake===null||Object.hasOwn(teaMenu.cake,order.cake))&&(order.tea||order.cake),'茶桌上的茶点记录有误。');
  }
  return {places,inns,fare,passage,day,minutes,away,unlocked,booked,gate,sailing,act,normalise,teaMenu,serving};
});
