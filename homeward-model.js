/* Optional village encounters share the game's clock and atomic save transaction. */
(function (root, make) {
  const api = make();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.NanlanHomewardModel = api;
})(globalThis, () => {
  function visit(s) {
    const minute = Math.floor(s.worldTick) % 1440;
    if (s.mode !== 'daily') return '';
    if (minute >= 360 && minute < 600) return 'dawn';
    if (minute >= 990 && minute < 1170) return 'dusk';
    return '';
  }
  function ownsHamper(s) {
    return s.choices.ferryFirstGood === 'bambooWare' && !!s.flags.firstSale;
  }
  function cloth(s){return s.choices.householdCloth || {stage:'basket',dry:0,tick:s.worldTick};}
  function dryness(s,weather){
    const c=cloth(s),end=Math.floor(s.worldTick);
    if(c.stage==='shelter')return Math.min(60,c.dry+Math.max(0,end-c.tick)*.5);
    if(c.stage!=='roof')return c.dry;
    // One uninterrupted weather slot fully dries or wets the towel. Two recent days cover every boundary.
    let t=Math.max(c.tick,end-2880),dry=c.dry;
    while(t<end){
      const minute=t%1440,next=[360,600,840,1080,1440].find(n=>n>minute);
      const span=Math.min(end-t,next-minute),view={...s,worldTick:t};
      const rate=weather.current(view).wet?-1:(minute>=360&&minute<1080?1:.35);
      dry=Math.min(60,Math.max(0,dry+span*rate));t+=span;
    }
    return dry;
  }
  function laundry(s,name,p,{need,near,weather}){
    const c=cloth(s),now=Math.floor(s.worldTick);
    const at=(place,id)=>s.scene===place&&near(id);
    const rail=at('dryingLoft','linenRail'),eaves=at('eavesGallery','coveredPeg');
    const set=(stage,dry=0)=>{s.choices.householdCloth={stage,dry,tick:now};};
    switch(name){
      case 'homewardWash':
        need(at('washingCourt','linenStone')&&['basket','used'].includes(c.stage),'到洗衣埠石案旁拿起待洗的布。');return set('damp');
      case 'homewardHang':
        need((rail||eaves)&&c.stage==='damp','先把湿布带到竹竿或廊下。');return set(rail?'roof':'shelter',c.dry);
      case 'homewardLift':{
        need((rail&&c.stage==='roof')||(eaves&&c.stage==='shelter'),'走到挂着这块布的地方。');
        const dry=dryness(s,weather);return set(dry>=60?'folded':'damp',dry);
      }
      case 'homewardAirWait':
        need(((rail&&c.stage==='roof')||(eaves&&c.stage==='shelter'))&&p.sequence===s.revision&&now%1440<=1305,'眼下不便坐等，先收好衣物。');
        s.worldTick=now+15;return;
      case 'homewardSetCloth':
        need(at('serviceKitchen','linenCounter')&&c.stage==='folded','请带一块已晒干、折好的布来案边。');return set('used');
    }
  }
  function act(s, name, p, {need, near, tide, current}) {
    const f = s.flags, c = s.choices;
    function by(scene, ...ids) {
      need(s.scene === scene && ids.some(near), '请先走到相应的人或物件旁。');
    }
    function remember(key, value=true) {
      if (c[key] !== undefined) return false;
      c[key] = value;
    }
    switch (name) {
      case 'homewardVisit': {
        const time = visit(s);
        need(time && time === p.time && current(s) !== 'V2_10', '大娘已经动身，清晨或黄昏再来村口看看。');
        by('village',time === 'dawn' ? 'homewardDawn' : 'homewardDusk');
        return remember(time === 'dawn' ? 'ferryMorningSeen' : 'ferrySewingSeen');
      }
      case 'homewardWeave':
        by('banyanBrook','brookBasket');
        return remember('brookWeaveSeen');
      case 'homewardBoard':
        by('mountain','bridgeWork');
        need(f.bambooChoice || f.bridgeReady,'先和阿岑商量木道用料。');
        return remember('learnedPlank');
      case 'homewardTide':
        by(s.scene === 'tidalflat' ? 'tidalflat' : 'coast','coastBoard','tideNotice');
        need(f.metYu,'先请沈晚渔讲讲归路。');
        need(p.low === tide(s).low,'再看一眼眼下的水痕。');
        return remember('learnedWaterline');
      case 'homewardHandle':
        by('generalStore','v2Customer','generalStoreKeeper','v2Shelf');
        need(ownsHamper(s) && f.v2Opened && f.v2CustomerHeard,'等卖过竹篓的大娘带着它进铺，再为她改提梁。');
        return remember('ferryWideHandle');
      case 'homewardSupper':
        by('hall','mealTable');
        need(f.firstShared && ['crust','sit'].includes(p.choice),'等家人围桌后，再决定怎样收锅。');
        return remember('firstSupperGesture',p.choice);
    }
    need(false,'眼下没有这桩事。');
  }
  return {visit,ownsHamper,act,cloth,dryness,laundry};
});
