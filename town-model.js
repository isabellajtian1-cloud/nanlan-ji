((root,factory)=>{
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.NanlanTown=api;
})(globalThis,()=>{
  const rooms=['clothShop','bookShop','countyInn'];
  const itemNames={townSwatch:'布样册',townNotebook:'线装小札'};
  const terms={swatch:2,book:3,meal:5,mealRest:20,mealTime:20,bookTime:12};
  const colors={indigo:'靛青',tea:'茶褐',persimmon:'柿红'};
  const uses={herbs:'草木札',road:'行路记'};
  const minute=(s,n)=>Math.max(s.worldTick,Math.min(s.worldTick+n,Math.floor(s.worldTick/1440)*1440+1320));
  function act(s,name,p,{requireThat,requireScene,give,log}){
    requireThat(s.flags.volume2Started,'第二卷开启后，方可在南街走访这几间铺子。');
    const choices=s.choices;
    function pay(n,note,item){
      requireThat(s.coins>=n,'钱袋里的铜钱不够。');
      s.coins-=n;log(s,'buy',-n,note,item);
    }
    if(name==='townSwatch'){
      requireScene(s,'clothShop');
      if(choices['town:swatch']||s.bag.townSwatch)return false;
      requireThat(Object.hasOwn(colors,p.color),'请先挑一种布色。');
      pay(terms.swatch,'榕下布庄 · 布样册','townSwatch');
      choices['town:swatch']=p.color;give(s,{townSwatch:1});return;
    }
    if(name==='townBook'){
      requireScene(s,'bookShop');
      if(choices['town:book']||s.bag.townNotebook)return false;
      requireThat(Object.hasOwn(uses,p.use),'请先选手札的用途。');
      pay(terms.book,'青简书坊 · 纸与装订线','townNotebook');
      choices['town:book']=p.use;give(s,{townNotebook:1});s.worldTick=minute(s,terms.bookTime);return;
    }
    if(name==='townMeal'){
      requireScene(s,'countyInn');
      requireThat(s.stamina<100,'体力已满，可以把这一碗留待赶路回来。');
      pay(terms.meal,'南街客栈 · 一碗热饭');s.stamina=Math.min(100,s.stamina+terms.mealRest);
      s.worldTick=minute(s,terms.mealTime);return;
    }
    if(name==='townShowSwatch'||name==='townShowBook'){
      const cloth=name==='townShowSwatch',item=cloth?'townSwatch':'townNotebook',key=cloth?'town:motherSaw':'town:grandfatherSaw';
      requireScene(s,cloth?['hall','generalStore']:'hall');
      requireThat(s.bag[item]>0,'请先把这件物件带在行囊里。');
      if(choices[key])return false;
      choices[key]=true;
      s.journal.push({id:key,tick:s.worldTick,text:cloth?'母亲将布样贴在窗边看了看，说下次裁衣时也试试南街的颜色。':'祖父摸了摸亲手装订的小札，把第一页留给门前的新叶。'});
      return;
    }
    requireThat(false,'这里没有这项营生。');
  }
  return {rooms,itemNames,terms,colors,uses,act};
});
