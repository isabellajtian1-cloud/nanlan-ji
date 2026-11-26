((root,make)=>{
  const api=make();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.NanlanEstate=api;
})(globalThis,()=>{
  const fee=24, earningsGoal=30, neighborGoal=2;
  const gift={x:590,y:393,w:58,h:50};
  const settled=s=>!!(s.flags.firstRepair&&s.flags.pathCleared&&s.flags.drainClear);
  const furnished=s=>s.choices.estateFurnished===true;
  const gifted=s=>s.choices.estateGift===true;
  function earnings(s){
    const looseSales=s.transactions.reduce((sum,row)=>sum+(row.type==='sale'&&row.amount>0?row.amount:0),0);
    return (s.shop?.revenue||0)+looseSales;
  }
  function neighbors(s){
    return ['chen','xu','cen'].filter(name=>s.rural?.[name]==='done').length;
  }
  function asset(s,scene){
    if(scene==='yard')return furnished(s)?'estateYard':settled(s)?null:'estateOld';
    if(scene==='hall'&&furnished(s))return 'estateHall';
    return null;
  }
  function improvement(s){
    if(furnished(s))return '';
    if(!settled(s))return '先安顿卧房、清出院路和庭院水口。';
    if(!s.flags.windowPatched||!s.flags.leakPatched)return '东厢房的漏点和窗格都补好后，再请人修整院落。';
    if(earnings(s)<earningsGoal)return '等摆摊或铺面累计收到三十文货款，再筹院里的工钱。';
    if(s.coins-fee<(s.story2?.reserve||0))return '要留够已划出的家用，再付二十四文修葺钱。';
    return '';
  }
  function giftReady(s){
    return settled(s)&&neighbors(s)>=neighborGoal;
  }
  function act(s,name,{requireThat,requireScene,log}){
    requireScene(s,['yard','hall']);
    if(name==='estateImprove'){
      if(furnished(s))return false;
      const reason=improvement(s);
      requireThat(!reason,reason);
      s.coins-=fee;
      s.choices.estateFurnished=true;
      log(s,'repair',-fee,'修整院墙、屋瓦与正厅陈设');
      s.journal.push({id:'estate-furnished',tick:s.worldTick,text:'把做生意攒下的铜钱拨了些给家里。院墙刷白，瓦补齐了，正厅也有了新陈设。'});
      return;
    }
    if(name==='estateGift'){
      if(gifted(s))return false;
      requireThat(giftReady(s),'先把家安顿好，再帮街坊办妥两桩约定。');
      s.choices.estateGift=true;
      if(s.scene==='yard'&&giftBlocks(s.player.x,s.player.y))s.player.y=gift.y+17;
      s.journal.push({id:'estate-gift',tick:s.worldTick,text:'街坊送来一盆桂花和一只竹篮。母亲把它们摆在院里，说往后来了客，正好有地方坐坐。'});
      return;
    }
    requireThat(false,'这项修葺尚未安排。');
  }
  function normalise(s,need){
    for(const key of ['estateFurnished','estateGift']){
      const value=s.choices[key];
      need(value===undefined||typeof value==='boolean','宅院修葺记有误。');
    }
  }
  function giftBlocks(x,y,clearance=0){
    return Math.abs(x-gift.x)<24+clearance&&Math.abs(y-gift.y+5)<10+clearance;
  }
  return {fee,earningsGoal,neighborGoal,gift,settled,furnished,gifted,earnings,neighbors,asset,improvement,giftReady,giftBlocks,act,normalise};
});
