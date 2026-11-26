(() => {
  const E=globalThis.NanlanEstate;
  const art={
    estateOld:'estate-old-v690.webp',estateYard:'estate-yard-v690.webp',
    estateHall:'estate-hall-v690.webp',estateGift:'estate-gift-v690.webp'
  };
  Object.assign(DATA.assets,art);
  const words={
    '宅院修葺':'Home Improvements',
    '先安顿卧房、清出院路和庭院水口。':'Settle the bedroom and clear the courtyard path and drain first.',
    '东厢房的漏点和窗格都补好后，再请人修整院落。':'Mend the East Wing window and roof leak before restoring the courtyard.',
    '等摆摊或铺面累计收到三十文货款，再筹院里的工钱。':'Take in thirty coins from stall or shop sales before setting aside money for the work.',
    '要留够已划出的家用，再付二十四文修葺钱。':'Keep your household reserve intact before spending twenty-four coins on improvements.',
    '先把家安顿好，再帮街坊办妥两桩约定。':'Settle the household, then fulfill two promises to your neighbors.',
    '修整院墙、屋瓦与正厅陈设':'Restored the courtyard walls, roof tiles and hall furnishings',
    '把做生意攒下的铜钱拨了些给家里。院墙刷白，瓦补齐了，正厅也有了新陈设。':'Some of the shop money went back into the home. The courtyard walls are whitewashed, the roof tiles are mended and the hall has new furnishings.',
    '街坊送来一盆桂花和一只竹篮。母亲把它们摆在院里，说往后来了客，正好有地方坐坐。':'The neighbors brought a pot of osmanthus and a bamboo basket. Mother set them in the courtyard, a welcoming spot for guests.'
  };
  if(globalThis.NANLAN_EN&&globalThis.NanlanI18n?.configure){
    Object.assign(globalThis.NANLAN_EN,words);
    globalThis.NanlanI18n.configure(globalThis.NANLAN_EN);
  }
  const L=(zh,en)=>deskText(zh,en);
  function preload(key){
    if(!images[key])void loadImage(key);
  }
  function backdrop(s,scene,fallback){
    const key=E.asset(s,scene);
    if(!key)return fallback;
    preload(key);
    return images[key]?.naturalWidth?key:fallback;
  }
  function preview(s,scene,fallback){
    return DATA.assets[E.asset(s,scene)]||fallback;
  }
  function drawGift(ctx){
    preload('estateGift');
    const im=images.estateGift,{x,y,w,h}=E.gift;
    if(im?.naturalWidth)ctx.drawImage(im,x-w/2,y-h,w,h);
  }
  function card(list,title,body){
    const block=document.createElement('div'),heading=document.createElement('b'),p=document.createElement('p');
    heading.textContent=title;p.textContent=body;block.append(heading,p);list.append(block);
  }
  function reveal(zh,en){
    closeDialog(true);
    render();
    notice(L(zh,en));
  }
  function show(){
    const s=state();
    const intro=E.furnished(s)?L('院墙和屋瓦已修整好，正厅也换上了新陈设。','The walls and tiles are mended, and the hall has new furnishings.'):
      E.settled(s)?L('院路扫净了，水口也通了。等手头宽裕，再慢慢修整。','The path is swept and the drain runs clear. The rest can wait until there is money to spare.'):
      L('初来时院墙斑驳，屋瓦也旧。先把住处安顿下来。','The courtyard walls are weathered and the tiles are old. Start by making the house habitable.');
    activity('宅院修葺',intro,'town-shop');
    const list=document.createElement('div');list.className='time-cards';
    card(list,L('安顿旧宅','Settle the House'),E.settled(s)?L('卧房已安顿，院路和水口都通了。','The bedroom is settled, and the path and drain are clear.'):'先安顿卧房、清出院路和庭院水口。');
    const reason=E.improvement(s);
    card(list,L('修整院落与正厅','Restore the Courtyard and Hall'),E.furnished(s)?
      L('院墙、屋瓦和正厅陈设都已修整。','The courtyard walls, roof tiles and hall furnishings are restored.'):
      L('已收货款 ','Sales taken: ')+Math.floor(E.earnings(s))+' / '+E.earningsGoal+L(' 文。',' coins.')+' '+(reason||L('可付工钱二十四文，请人修整。','Ready to restore for twenty-four coins.')));
    const help=E.neighbors(s);
    card(list,L('街坊的心意','A Gift from the Neighbors'),E.gifted(s)?L('街坊送的桂花与竹篮已摆在院里。','The osmanthus and bamboo basket now sit in the courtyard.'):
      L('已办妥乡邻约定 ','Promises kept: ')+help+' / '+E.neighborGoal+'。 '+(E.giftReady(s)?L('街坊捎来了礼，可收下摆进院里。','The neighbors brought a gift. Accept it and set it in the courtyard.'):'先把家安顿好，再帮街坊办妥两桩约定。'));
    $('panelExtra').append(list);
    if(!E.furnished(s)){
      const b=button(L('请人修整 · 24 文','Commission the repairs · 24 coins'),()=>perform('estateImprove',{},
        ()=>reveal('宅院修整好了。院墙刷了白，正厅添了新陈设。','The home is restored. The walls are whitewashed and the hall has new furnishings.')),'estate-improve');
      if(reason){b.disabled=true;b.title=reason;}
    }
    if(!E.gifted(s)&&E.giftReady(s)){
      button(L('收下桂花与竹篮','Accept the osmanthus and basket'),()=>perform('estateGift',{},
        ()=>reveal('街坊的桂花与竹篮摆进院里了。','The neighbors’ osmanthus and basket are now in the courtyard.')),'estate-gift');
    }
  }
  $('estateOpen').onclick=show;
  globalThis.NanlanEstateUI={backdrop,preview,drawGift};
})();
