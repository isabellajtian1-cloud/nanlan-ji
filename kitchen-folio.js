window.NanlanFoodUI=(()=>{
  'use strict';
  const F=NanlanFood, L=(zh,en)=>NanlanI18n.language==='en'?en:zh, word=p=>L(p[0],p[1]);
  const item=id=>word(F.goods[id]), name=r=>word(r.title), stock=id=>N.available(state(),id);
  const season=s=>word(F.seasons[s]);
  const methods={
    ember:['灰煨','Roast in embers','炭火已落，只剩厚厚一层热灰。','The flames have died down to a deep bed of ash.','把带壳的笋埋入灰中','Bury the sheathed shoot in the ash','剥壳架在明火上','Peel and hold over a flame'],
    braise:['慢煨','Slow braise','锅边刚冒小泡，肉里的筋还硬着。','Small bubbles appear, but the sinew is still firm.','拨开旺柴，合盖慢煨','Draw back the wood and cover','加柴烧干汤汁','Boil off the broth'],
    roast:['炙烤','Roast','近火的一面已上色，背火处还浅。','The fire-facing side is brown. The far side is pale.','转叉，让浅色一面向火','Turn the pale side to the heat','让深色一面继续靠火','Keep the browned side facing the fire'],
    crock:['糟制','Preserve in lees','熟河鲜已沥凉，香糟还在碟里。','The cooked river catch has cooled. The lees are on the plate.','隔层铺糟，合盖封坛','Layer with lees and seal the jar','趁热把糟全冲掉','Rinse away the lees'],
    hollow:['橙盏蒸','Steam in orange','橙盖刚切下，槽底还有一口橙汁。','The orange lid is off. A little juice remains.','留汁填蟹，盖回原盖','Keep the juice, fill and replace the lid','倒空橙汁，把盖丢开','Discard the juice and lid'],
    rice:['蒸饭','Steam rice','米粒已经吸足水，碗里留好了位置。','The grains have soaked. The steaming bowl is ready.','把米铺匀，架甑合盖','Level the rice and cover the steamer','把生米摊到冷盘里','Tip the uncooked grains onto a cold plate'],
    wrap:['叶包蒸','Steam in a leaf','荷叶心上搁好了米和馅，边上还空着。','Rice and filling sit in the leaf centre with room at the edges.','两边收拢，折口朝下入甑','Tuck the sides and steam seam-down','把叶摊开，米撒到水中','Spread the leaf and scatter rice in the water'],
    slice:['擀切','Roll and cut','面片已经擀薄，要切成能抖开的面条。','The dough is thin enough to cut into loose strands.','撒粉轻折，切缕抖开','Dust, fold loosely, slice and shake apart','攥紧面片再揉成团','Squeeze the sheet back into a ball'],
    fold:['包馅','Enclose filling','馅刚搁在皮心，边缘要合好才可上笼。','The filling is in the centre. The rim still needs sealing.','捏合边口，留出馅心','Seal around the filling','在底部留个敞口','Leave the base open'],
    custard:['隔水蒸','Steam gently','乳盏放稳了，锅边的水刚开始颤。','The milk cup is steady. Water trembles at the rim.','减火隔水，轻蒸至凝','Ease the heat and steam gently','旺火翻搅乳面','Beat the surface over high heat'],
    bake:['烘饼','Bake a cake','馅已入饼，炉壁有热，底火偏旺。','The filling is enclosed. The oven wall is warm and the base hot.','收底火，翻饼看两面','Ease the heat and turn the cake','压在火心不翻面','Press into the embers without turning'],
    reduce:['收汁','Reduce','勺背挂上薄薄一层汁，锅边渐稠。','A thin film coats the spoon and the edges are thickening.','贴底轻搅，缓缓收浓','Stir along the bottom and reduce gently','猛烧至锅底冒烟','Heat until the base smokes'],
    steep:['冲泡','Infuse','壶水已热，新叶备在盏里。','The kettle is hot and the leaves are waiting in the cup.','注水候香，再倾入盏','Pour, steep, then decant','把干叶炒到发黑','Scorch the dry leaves'],
    scent:['窨花','Scent with blossoms','花刚吐香，茶叶已经干爽。','The flowers have opened and the tea leaves are dry.','花茶分层相间，合盖收香','Layer blossoms with tea and cover','花叶入滚水久煮','Boil the leaves and petals together'],
    chill:['调膏','Blend a cooler','果膏已经收浓，冰屑搁在小盏里。','The fruit syrup is thick. The ice chips wait in a cup.','撤火调水，临盛添冰','Take off the fire, dilute and add ice','添冰后再猛火收干','Add the ice and boil it dry']
  };
  function el(tag,cls='',txt=''){const e=document.createElement(tag);e.className=cls;e.textContent=txt;return e;}
  function ctl(host,txt,fn,id=''){
    const b=el('button','food-choice',txt);b.type='button';if(id)b.dataset.foodAction=id;
    b.onclick=fn;host.append(b);return b;
  }
  function nav(txt,fn,id){return navButton(txt,fn,'food-'+id);}
  function route(txt,place,id){nav(txt,()=>{closeDialog();startNavigation(place,id);},'go-'+id);}
  function panel(title,body){
    activity(title,body,'v3-hearth');const board=el('section','food-folio');board.dataset.noLocalize='';
    $('panelExtra').append(board);return board;
  }
  function heading(board,g){const h=el('div','food-banner '+g);h.setAttribute('aria-hidden','true');board.append(h);}
  function noticeLine(board,txt){const p=el('p','food-result',txt);p.setAttribute('role','status');board.append(p);return p;}
  function folio(mode='book',g='savoury',msg=''){
    const s=state(),pages=s.foodFolio.pages;
    const board=panel(mode==='buy'?L('乡邻余粮 · 配食篮','Village pantry · Recipe baskets'):L('南澜市井食笺','Nanlan market cookbook'),
      mode==='buy'?L('货主把竹篮往前推了推：「照方拣，只添你行囊里缺的，手边有的可别重买。」','The grocer nudges a basket towards you. “Let’s choose a dish. I’ll only add what your satchel lacks.”'):
      L('今是'+season(NanlanClimate.at(s).key)+'日。亲手做成的方子会在页边留一枚朱印。','It is '+season(NanlanClimate.at(s).key).toLowerCase()+'. Each recipe you finish earns a red seal in the margin.'));
    const tabs=el('div','food-tabs');board.append(tabs);
    for(const [id,pair] of Object.entries(F.groups)){const b=ctl(tabs,word(pair),()=>folio(mode,id),id);b.setAttribute('aria-pressed',String(id===g));}
    heading(board,g);
    if(msg)noticeLine(board,msg);
    const list=el('div','food-list');board.append(list);
    for(const r of Object.values(F.recipes).filter(r=>r.group===g)){
      const b=ctl(list,'',()=>detail(r,mode),r.id);b.append(el('span','food-title',name(r)));
      const status=[r.season?season(r.season):L('四时','All seasons'),pages[r.id]?L('已入谱','Recorded'):L('待试','Untried')];
      b.append(el('small',pages[r.id]?'food-seal':'',status.join(' · ')));
    }
    if(mode==='stove'){
      nav(L('从手边食材试配','Experiment with ingredients'),trial,'trial');
      if(s.foodFolio.jar)jarLink();
      nav(L('回灶台','Back to the hearth'),showCook,'stove-back');
    }else if(mode==='buy')nav(L('回到乡邻余粮','Back to village supplies'),showPantry,'pantry-back');
    else nav(L('回行囊','Back to satchel'),showBag,'bag-back');
  }
  function jarLink(){
    const s=state(),jar=s.foodFolio.jar;if(!jar)return;
    const r=F.recipes[jar.id],ready=s.worldTick>=jar.due,seq=s.revision;
    const b=button(ready?L('揭坛取出'+name(r),'Unseal · '+name(r)):L(name(r)+' · 第'+(Math.floor(jar.due/1440)+1)+'日卯初再揭坛',name(r)+' · Open on Day '+(Math.floor(jar.due/1440)+1)+' at 06:00'),
      ()=>perform('foodUnseal',{sequence:seq},()=>detail(r,'stove',L('揭开坛口，取出一份，已记入食笺。','One portion packed and entered in the cookbook.'))),'food-unseal',false,false);
    b.disabled=!ready;
  }
  function costLine(r){return r.foods.map(id=>item(id)+' ×1').join(L('、',', '));}
  function detail(r,mode,msg=''){
    const s=state(),rec=s.foodFolio.pages[r.id],held=stock(F.portion(r)),active=F.inSeason(s,r);
    const board=panel(name(r),word(F.groups[r.group])+' · '+(r.season?season(r.season):L('四时可做','All seasons')));
    heading(board,r.group);
    if(msg)noticeLine(board,msg);
    board.append(el('p','food-materials',costLine(r)),el('p','food-note',word(r.note)));
    if(r.source){
      const bk=F.books[r.source],a=el('a','food-source',word(bk)+' ↗');a.href=bk[2];a.target='_blank';a.rel='noopener noreferrer';board.append(a);
    }else board.append(el('small','food-source',L('南澜家灶拟作','A Nanlan household interpretation')));
    board.append(el('p','food-tally',rec?L('初做于第 '+rec.first+' 日 · 共做 '+rec.made+' 份 · 行囊 '+held+' 份','First cooked on Day '+rec.first+' · '+rec.made+' made · '+held+' packed'):L('尚待亲手试做。','Waiting for your first batch.')));
    const bill=F.shopping(s,r,N.available),seq=s.revision;
    if(mode==='buy'){
      const summary=bill.cart.map(id=>item(id)+' '+F.goods[id][2]+L('文','c')).join(' · ');
      if(summary)board.append(el('p','food-quote',summary));
      if(bill.gather.length)board.append(el('p','food-tally',L('另需自行取得：','Gather separately: ')+bill.gather.map(item).join('、')));
      const buy=button(L('买齐摊上缺料 · '+bill.price+' 文','Buy missing market ingredients · '+bill.price+' coins'),()=>perform('foodPurchase',{id:r.id,price:bill.price,sequence:seq},
        ()=>detail(r,mode,L('钱货已清，食材已放进行囊。','Paid and packed in your satchel.'))),'food-buy',false,false);
      buy.disabled=!active||!bill.cart.length||s.coins<bill.price;
      if(!active||!bill.cart.length||s.coins<bill.price)noticeLine(board,!active?L('这道时令食篮尚未开卖。','This basket is out of season.'):!bill.cart.length?L('这一篮能买的食材都已备齐。','You already have everything this stall can supply.'):L('家用不足，还差 '+(bill.price-s.coins)+' 文。','You need '+(bill.price-s.coins)+' more coins.'));
    }else if(mode==='stove'){
      const missing=r.foods.filter(id=>stock(id)<1).map(item);
      if(stock('wood')<1)missing.push(L('枯枝','Firewood'));if(s.bucketWater<1)missing.push(L('桶内水','Water from the jar'));
      const blocked=!active||missing.length>0||r.work==='crock'&&!!s.foodFolio.jar;
      const txt=!active?L('此菜在'+season(r.season)+'季开灶。','Cook this in '+season(r.season).toLowerCase()+'.'):missing.length?L('还缺 ','Still needed: ')+missing.join(L('、',', ')):r.work==='crock'&&s.foodFolio.jar?L('糟坛正用着。','The preserving jar is occupied.'):L('灶上另用枯枝一份、水一桶。','The hearth also uses one firewood and one bucket of water.');
      noticeLine(board,txt);
      const start=nav(L('备料 · '+word(methods[r.work]),'Prepare · '+word(methods[r.work])),()=>tend(r),'prepare');start.disabled=!!blocked;
      if(r.work==='crock'&&s.foodFolio.jar)jarLink();
      if(bill.cart.length&&active)route(L('带我去村里配食篮','Guide me to the village pantry'),'village','villagePantry');
      if(r.foods.includes('lotusLeaf')&&!stock('lotusLeaf')&&active)route(L('去塘边采荷叶','Walk to the lotus leaves'),'yard','silkPond');
      if(!s.bucketWater)route(L('去水缸装水','Walk to the water jar'),'yard','waterJar');
    }
    if(held>0 && mode!=='buy'){
      const eat=button(L('取用一份 · 恢复最多25体力','Have a portion · Restore up to 25 stamina'),()=>perform('foodEat',{id:r.id,sequence:seq},()=>detail(r,mode,L('用去一份。','One portion consumed.'))),'food-eat',true,false);eat.disabled=s.stamina>=100;
    }
    nav(L('翻回'+word(F.groups[r.group]),'Back to '+word(F.groups[r.group])),()=>folio(mode,r.group),'index');
  }
  function tend(r){
    const seq=state().revision,m=methods[r.work],board=panel(name(r)+' · '+word(m),L('先看灶上的模样，再决定下一手。','Look at the food, then choose your next move.'));
    heading(board,r.group);board.append(el('p','food-sense',L(m[2],m[3])));
    const row=el('div','food-technique');board.append(row);
    const feedback=noticeLine(board,'');
    const choices=[true,false];if((r.id.length+F.day(state()))%2)choices.reverse();
    for(const good of choices)ctl(row,good?L(m[4],m[5]):L(m[6],m[7]),()=>{
      if(!good){feedback.textContent=L('再看一眼：','Look again: ')+L(m[2],m[3]);return;}
      row.replaceChildren();window.NanlanAudio?.play('riceLid');
      feedback.textContent=r.work==='crock'?L('熟料已分层。封好后，明晨六时再回来揭坛。','The layers are ready. Seal the jar and return after 06:00 tomorrow.'):L('火候到了，可以起锅。','The batch is ready to serve.');
      const serve=button(r.work==='crock'?L('封坛 · 扣料','Seal jar · Use ingredients'):L('起锅 · 记入食笺','Serve · Record recipe'),()=>perform('foodCook',{id:r.id,sequence:seq},()=>detail(r,'stove',r.work==='crock'?L('坛已封好。明晨六时可来揭坛。','Jar sealed. Return after 06:00 tomorrow.'):L('已做成一份，收进行囊。','One portion made and packed.'))),'food-finish',false,false);
      const heat={ember:1,braise:1,roast:2,rice:2,wrap:2,hollow:2,fold:2,custard:1,bake:2,reduce:1}[r.work];
      if(!heat){serve.focus({preventScroll:true});return;}
      const label=el('label','food-damper',L('推拉灶门，调到'+(heat===1?'文火':'中火')+'。','Slide the stove vent to '+(heat===1?'low':'medium')+' heat.'));
      const vent=el('input');vent.type='range';vent.min='1';vent.max='3';vent.step='1';vent.value='3';label.append(vent);board.insertBefore(label,feedback);
      const heatNames=[null,['文火','Low heat'],['中火','Medium heat'],['旺火','High heat']];
      function adjust(){
        const value=Number(vent.value),current=word(heatNames[value]);vent.setAttribute('aria-valuetext',current);serve.disabled=value!==heat;
        feedback.textContent=current+' · '+(value>heat?L('锅盖响得急，灶口再收一点。','The lid rattles. Close the vent a little.'):value<heat?L('热气散了，再把灶口推开些。','The steam is fading. Open the vent a little.'):L('热气均匀，可以起锅。','Steam rises evenly. Ready to serve.'));
      }
      vent.oninput=adjust;adjust();vent.focus({preventScroll:true});
    },good?'care':'rethink');
    nav(L('放下碗勺，暂不扣料','Set aside without using ingredients'),()=>detail(r,'stove'),'cancel');
  }
  function trial(){
    const s=state(),board=panel(L('拿食材合一道菜','Find a dish from your ingredients'),L('点选一至三味。配出食笺中的组合，便可接着掌勺。','Choose one to three ingredients. A matching recipe takes you straight to its cooking step.'));
    const row=el('div','food-trial');board.append(row);const selected=new Set();
    const result=noticeLine(board,''),matches=el('div','food-list');board.append(matches);
    function update(){
      for(const b of row.children){const id=b.dataset.foodAction;b.setAttribute('aria-pressed',String(selected.has(id)));b.disabled=selected.size>=3&&!selected.has(id);}
      matches.replaceChildren();const list=Object.values(F.recipes).filter(r=>r.foods.length===selected.size&&r.foods.every(id=>selected.has(id)));
      result.textContent=!row.children.length?L('行囊里还没有可试的食材。','Your satchel has no ingredients yet.'):!selected.size?L('先拿一味入碗。','Start with one ingredient.'):!list.length?L('还没合上食笺里的方子，可以换一味。','No recipe matches yet. Try a different combination.'):L('这几味正合：','These ingredients match:');
      for(const r of list)ctl(matches,name(r),()=>detail(r,'stove'),r.id);
    }
    for(const id of Object.keys(F.goods).filter(id=>N.available(s,id)>0))ctl(row,item(id),()=>{if(selected.has(id))selected.delete(id);else selected.add(id);update();},id);
    update();nav(L('翻看食笺','Browse the cookbook'),()=>folio('stove'),'index');nav(L('回原灶自由创方','Invent your own hearth recipe'),()=>NanlanHearthUI.draft(),'invent');
  }
  function field(place,again){
    const s=state(),seq=s.revision;if(!N.done(s,'M04'))return;
    for(const [id,[where,when]] of Object.entries(F.fields)){
      if(place!==where||NanlanClimate.at(s).key!==when)continue;
      const already=s.foodFolio.picked[id]===F.day(s);
      const b=button(already?L(item(id)+' · 今日已采',item(id)+' · Picked today'):L('亲手采一份'+item(id),'Pick one portion of '+item(id)),
        ()=>perform('foodPick',{sequence:seq,item:id},()=>{again();const p=el('p','gather-receipt',L('已采到'+item(id)+' ×1，放进行囊。','Picked '+item(id)+' ×1 and packed it.'));p.dataset.noLocalize='';$('panelExtra').prepend(p);}),
        'food-pick-'+id,true,false);b.disabled=already;
    }
  }
  function counterLink(back){nav(L('看今日食单 · 交付饭菜','View today’s menu · Deliver dishes'),()=>counter(back),'counter');}
  function counter(back,msg=''){
    const s=state(),place=s.scene,req=place==='market'?null:F.request(s,place);
    const board=panel(place==='market'?L('镇集 · 吃食摊','Market food stall'):place==='teahouse'?L('茶馆 · 今日茶单','Teahouse menu'):L('客栈 · 今日灶单','Inn menu'),
      req && s.foodFolio.orders[place]===F.day(s)?L('掌柜：「今日点的'+name(req)+'已经收了。再来的按食单原价算。」','The keeper says, “Today’s '+name(req)+' is in. I can take more at the regular price.”'):req?L('掌柜：「今日有人想尝'+name(req)+'。头一份我多付五文，其余照常收。」','The keeper says, “Someone asked for '+name(req)+' today. Five extra coins for the first portion.”'):
      L('摊布留好后，开市时可把当季做好的菜按份卖给客人。','On a reserved cloth, you can sell prepared dishes in season from 09:00 to 17:00.'));
    if(msg)noticeLine(board,msg);
    const open=place!=='market'||(s.stallUntil>s.worldTick&&N.clock(s).minute>=540&&N.clock(s).minute<1020);
    if(req){const slip=el('p','food-quote',name(req)+' · '+costLine(req));board.append(slip);}
    if(!open)noticeLine(board,L('先在09:00–17:00留好摊布，再来交货。','Reserve a cloth and return between 09:00 and 17:00.'));
    const tray=el('div','food-list');board.append(tray);
    for(const r of Object.values(F.recipes).filter(r=>F.canServe(place,r)&&F.inSeason(s,r)&&stock(F.portion(r))>0)){
      const {price,bonus}=F.quote(s,r);
      const b=ctl(tray,name(r)+' ×'+stock(F.portion(r))+' · '+price+L('文',' coins')+(bonus?L('（点单）',' (request)'):''),()=>{
        tray.replaceChildren();noticeLine(board,L('交给客人一份'+name(r)+'，收 '+price+' 文。','Hand over one '+name(r)+' for '+price+' coins.'));
        const seq=s.revision;
        const yes=button(L('交货收钱','Hand over and receive payment'),()=>perform('foodSell',{sequence:seq,id:r.id,price},()=>counter(back,L('已售一份'+name(r)+'，实收 '+price+' 文，已入账。','Sold one '+name(r)+' for '+price+' coins. Recorded in the ledger.'))),'food-sell',false,false);yes.focus({preventScroll:true});
        nav(L('重新选菜','Choose again'),()=>counter(back),'reselect');
      },r.id);b.disabled=!open;
    }
    if(!tray.children.length)noticeLine(board,L('行囊里还没有这处收的当季成菜。先到庭院灶台做一份。','No matching dishes packed. Cook a seasonal dish at the courtyard hearth.'));
    nav(L('回到柜前','Back to the counter'),back,'counter-back');
  }
  function source(id){
    if(id.startsWith('dish_'))return L('庭院灶台 · 市井食笺。行囊内可取用，镇集可摆卖。','Courtyard hearth · Market cookbook. Eat from the satchel or sell at market.');
    if(id==='lotusLeaf')return L('夏日到庭院桑基鱼塘采荷叶，每日一份。','Pick one lotus leaf a day at the courtyard pond in summer.');
    const fieldInfo=F.fields[id];return L('南澜村乡邻余粮 · 市井食材篮','Village pantry · Recipe baskets')+(fieldInfo?L('；亦可在村摊依时采花。','. Also pick blossoms at the village stall in season.'):'');
  }
  for(const r of Object.values(F.recipes))window.NANLAN_EN[r.title[0]]=r.title[1];
  for(const g of Object.values(F.goods))window.NANLAN_EN[g[0]]=g[1];
  NanlanI18n.configure(window.NANLAN_EN);
  return {folio,detail,field,counterLink,source,jarLink,trial,
    stove(){nav(L('翻市井食笺 · 做时令菜','Market cookbook · Cook a seasonal dish'),()=>folio('stove'),'stove');if(state().foodFolio.jar)jarLink();},
    bag(){nav(L('市井食笺 · 饭菜与茶饮','Market cookbook · Dishes and tea'),()=>folio('book'),'bag');},
    pantry(){nav(L('市井食材篮 · 按方配料','Recipe baskets · Shop by dish'),()=>folio('buy'),'pantry');field('village',showPantry);}
  };
})();
