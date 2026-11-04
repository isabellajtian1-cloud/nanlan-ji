/* Scene-bound second-volume story UI. All changes go through Engine.act. */
window.NanlanV2={
  targets:{v2Entry:['hall','v2Family'],v2ReserveSet:['hall','v2Family'],v2ObserveMorning:['county','v2ObserveMorning'],v2ObserveNoon:['county','v2ObserveNoon'],v2ObserveAfternoon:['county','v2ObserveAfternoon'],v2InspectEast:['county','leaseEast'],v2InspectWest:['county','leaseWest'],v2ShopSelected:['county','leaseEast'],v2PlanRecorded:['hall','v2Family'],v2BudgetPlan:['hall','v2Family'],v2LeaseSigned:['county','countyInn'],v2Repaired:['generalStore','v2Repair'],v2Decorated:['generalStore','v2Repair'],v2Sign:['generalStore','v2Repair'],v2PackingDone:['store','goodsCrates'],v2ShipmentSent:['store','goodsCrates'],v2ShipmentReceived:['generalStore','v2Shelf'],v2DisplayChosen:['generalStore','v2Shelf'],v2HoldChosen:['generalStore','v2Shelf'],v2PriceConfirmed:['generalStore','generalStoreKeeper'],v2Opened:['generalStore','generalStoreKeeper'],v2CustomerHeard:['generalStore','v2Customer'],v2FirstSale:['generalStore','generalStoreKeeper'],v2BulkResolved:['generalStore','generalStoreKeeper'],v2FirstCounted:['generalStore','generalStoreKeeper'],v2ShopLamp:['generalStore','v2ShopLamp'],v2NeighborHeard:['county','v2Neighbor'],v2CompetitionPlan:['county','v2Neighbor'],v2RegularAgreed:['generalStore','v2Customer'],v2RegularFulfilled:['generalStore','generalStoreKeeper'],v2CapacityPlanned:['generalStore','generalStoreKeeper'],v2BatchDelivered:['generalStore','generalStoreKeeper'],v2SupplyTerms:['village','v2Supplier'],v2SupplyReceived:['village','v2Supplier'],v2RosterPlanned:['hall','v2Family'],v2Cooperated:['county','v2Neighbor'],v2ThreeDays:['generalStore','generalStoreKeeper'],v2FamilyEnd:['hall','v2Family']},
  scenes:{
    V2_01:'母亲从碗底抽出一张铺讯，背面记着镇集客人的意见。\n「先看看，什么人会来买。」\n父亲把家中的收支摊开。这回，先商量留给生活的钱，再决定带多少进城。',
    V2_02:'同一条南街，早市是提菜篮的街坊，午间是挑耐用物件的匠工，午后又换成赶路的行商。\n陆掌柜：「人过得多，未必肯停。你先看看，他们手里提着什么。」',
    V2_03:'郑掌柜带你看两扇铺门。榕荫铺租金低，窗脚却返潮；桥口铺显眼，路口拥挤时又要留出取货的位置。缺陷要亲自查验，估价与责任才有根据。',
    V2_04:'父亲逐笔写下押金、租金、柜架、货物和运费。母亲提醒：「仓房里已有的东西，也花过材料和工夫。先算清，再决定带多少。」',
    M12:'郑掌柜：「价钱可以谈。修到什么样、哪日算租，也一并写清。」\n低租自修、房东修补、短期试租，各有要承担的事。确认前，先看看付款后还能留下多少。',
    V2_06:'林师傅把竹器放上柜架，问你站在门口能不能看清、取下来。\n「架子是给人拿东西的。替客人走一遍，再挂铺号。」',
    V2_07:'母亲按住两件货：「这两只留给谁，你还记得么？」\n你把旧承诺和本次装货分开。家中、在途、铺内各有实货，也要各有一笔能核对的账。',
    V2_08:'门口最醒目的位置只能放几样。小件能引人试买，招牌制品能让人记住。你也可以给午后来客留一部分货，但要承担上午少卖、下午未必卖出的风险。',
    V2_09:'祖父把写好的铺号放在柜台。母亲扮客人问价，父亲核对找零。\n「字用不用，你自己定。东西和价钱，都要叫人看得明白。」',
    V2_10:'第一位街坊没有急着恭喜，先问：「你后来改的那只，还在么？」\n镇集上听过的意见，如今落在真实的货品、报价和约定里。',
    V2_11:'午后的行商愿意带走一批现货，今日就要。母亲提醒旧客的预留；父亲把补货量列给你看。\n「接多少，你来定；定了，我们一起交出去。」',
    M18:'钱匣比早晨厚了，货架也空了一些。先盘实货，再分清收入、成本与费用。赚多赚少，都把下一步写具体，最后亲自去门前点灯。',
    V2_13:'陆掌柜也把竹器摆到了门边。客人在两家问价，双方都得靠生意吃饭。你可以调整普通货价、做好合用的款式，也可以约定互相介绍缺货的客人。',
    V2_14:'熟客只带了部分钱，想给家里添件日用品。母亲认得她，父亲希望把约定写清。小额定金或分次购买，都要落到一件实际能交出的货。',
    V2_15:'县集前来了两张单：日用小单交期早，窄篓礼品单数量少、要求更细。林师傅的工时、现有材料和下一班车，都需要一并考虑。',
    V2_16:'阿岑带着村中准备的货来谈供货。\n「好用的竹我认得。进了你这铺子，也得让人知道好在哪里。」\n规格、等级、货款和结算，一样样确认。',
    V2_17:'生意渐忙，母亲的选品时间总被临时事打断，父亲又替你揽了几项往来。晚饭后，一家人重新商量轮值，给每个人留出能自己安排的时间。',
    V2_18:'陆掌柜记得约定，把问窄篮的客人领到门口。你也把自己暂时没有的货介绍给邻铺。三次真实营业之后，灯下写着余货、承诺和下一阶段的打算。'
  },
  hint(s,q=N.current(s)){
    if(!s.flags.volume2Started)return N.done(s,'M20')?'第一卷已完成。回正厅读铺讯，开启第二卷；银钱、物资、日期与选择保留。':null;
    if(!q)return '第二卷已完成。可继续装货、转运、接待、按原价交付订单，并逐日盘点。';
    const step=N.steps[q].find(([flag])=>!s.flags[flag]);
    return (step?step[1]+'。':'')+({V2_02:'三个时段都有预约观察入口，会同步推进时间。',V2_03:'两间铺面都在县城南街；亲自比较后选定。',V2_07:'仓房货箱装货发车 → 铺内货架验收。',V2_10:'先听旧客问窄篮，再在柜台成交。',V2_14:'缺可售货时先补货，或解除自己设置的时段留货。',V2_15:'仓房制作 → 装货转运 → 铺内交单。',V2_18:'三次闭账要在不同游戏日期发生；今日已闭店就回东厢房睡一夜。'}[q]||'点击「在地图中找目标」，可查看实际地点。');
  },
  show(kind,o=null,selected=null){
    const s=state(),f=s.flags,t=s.story2,shop=s.shop,q=s.flags.volume3Started?null:N.current(s),M=N.story2,again=()=>window.NanlanV2.show(kind,o,selected);
    const num=n=>Number(n.toFixed(2)),itemName=id=>N.itemNames[id]||id;
    const stockText=()=>Object.entries(shop.stock).filter(([,n])=>n>0).map(([id,n])=>itemName(id)+' ×'+n).join('、')||'暂无实收库存';
    const goods=cost=>Object.entries(cost).every(([id,n])=>N.available(s,id)>=n);
    function action(label,name,p={},ready=true,why='请先完成眼前的安排。'){
      const b=window.NanlanSealsModel.eligible(name,p)?button(label,()=>window.NanlanSeals.prepare(name,{sequence:s.revision,...p},label,again),'settle-'+name+'-'+(p.item||p.choice||'')):actButton(label,name,{sequence:s.revision,...p},again,name+'-'+(p.item||p.product||p.choice||p.style||p.slot||p.site||'')+'-'+(p.tier??p.quantity??p.day??''));
      if(!ready){b.disabled=true;const x=document.createElement('small');x.className='v2-note';x.textContent=why;$('choices').append(x);}return b;
    }
    function note(text){const p=document.createElement('p');p.className='v2-note';p.textContent=text;$('panelExtra').append(p);}
    function nav(label,scene,id){button(label,()=>{closeDialog();startNavigation(scene,id);},'v2-nav-'+scene+'-'+id,true);}
    function table(headers,rows){const table=document.createElement('table');table.className='shop-story-table';const head=document.createElement('thead'),tr=document.createElement('tr');headers.forEach(label=>{const th=document.createElement('th');th.textContent=label;tr.append(th);});head.append(tr);table.append(head);const body=document.createElement('tbody');rows.forEach(row=>{const tr=document.createElement('tr');row.forEach(value=>{const td=document.createElement('td');td.textContent=value;tr.append(td);});body.append(tr);});table.append(body);$('panelExtra').append(table);}
    function title(name,text){activity(name,text,'volume2');$('dialogKicker').textContent='第二卷 · 南街灯起'+(q?' · '+(N.V2_ORDER.indexOf(q)+1)+'/18':' · 日常经营');if(q){const story=document.createElement('p');story.className='shop-story-copy';story.textContent=window.NanlanV2.scenes[q];$('panelExtra').append(story);}button('读当前任务与回报',showQuest,'v2-task-read',true);navButton('前往当前剧情目标',()=>{
      const current=state(),target=nextObjective();
      if(kind==='v2Observe'&&target.scene===current.scene&&target.object===o?.id){
        const slot=M.slots[o.slot];
        if(slot&&!current.flags[slot.flag]){
          const message='请先完成当前观察：点击「赴约观察 · '+slot.label+'」，记录这一时段的客流后再前往下一处。';
          let feedback=$('choices').querySelector('.v2-navigation-note');
          if(!feedback){feedback=document.createElement('p');feedback.className='v2-note v2-navigation-note';feedback.setAttribute('role','status');feedback.setAttribute('tabindex','-1');$('choices').append(feedback);}
          feedback.textContent=message;feedback.focus();notice(message,true);return;
        }
      }
      closeDialog();startNavigation(target.scene,target.object);
    },'v2-next-place');}
    function pricesPanel(){const ids=Object.keys(shop.stock).filter(id=>shop.stock[id]>0);table(['商品','到店参考成本','当前售价','可售'],ids.map(id=>[itemName(id),num(shop.cost[id]??M.baseCost(id))+' 文',N.shopPrice(s,id)+' 文',M.stockAvailable(s,id)]));if(!ids.length)return;const id=ids.includes(selected)?selected:ids.includes(shop.featured)?shop.featured:ids[0];for(const item of ids)button('选 '+itemName(item)+' 调价',()=>window.NanlanV2.show('v2Pricing',o,item),'v2-price-item-'+item,true);for(const tier of [0,1,2])action(itemName(id)+' · '+['让利价','常价','较高价'][tier],'v2Price',{item:id,tier});}
    function ledger(){const v=M.summary(s),d=v.day;table(['账目','当前记录'],[['现金余额',s.coins+' 文'],['家用保留目标',t.reserve+' 文'],['实收存货参考价值',v.stockValue+' 文'],['已完成闭账',v.closedDays+' 个不同营业日'],['当日成交收入',(d?.sales||0)+' 文'],['当日已售成本',num(d?.cost||0)+' 文'],['当日租金与设施分摊',num(v.rent+v.wear)+' 文'],['当日经营结果',v.profit+' 文'],['今日状态',d?.closed?'已打烊并保存':'尚未闭账']]);const note=document.createElement('p');note.className='v2-note';note.textContent='成本采用材料参考价与实际运费；旧版历史销售不回算新日账。预付租金与可退押金不在闭店时重复扣款。';$('panelExtra').append(note);}
    if(!f.volume2Started){title('正厅 · 家宴后的铺讯','母亲拿出早已记下的铺讯。父亲摊开收支，祖父问谁来拿主意。\n「先看看，什么人会来买。」\n第一卷的物资与选择都留在身边。');action('读铺讯，开启第二卷','v2Start',{},N.done(s,'M20'),'请先完成 M20 岁末家宴。');return;}
    if(kind==='v2Family'){
      title('家议 · 铺讯与分工','母亲：「东西做出来，总得有人用。」\n父亲：「每一笔写清，剩下多少，再决定用多少。」\n祖父把纸留在桌上，等你拿主意。'+(t.legacy?'\n\n旧版租金、货物和完成记录已保留；新增剧情接续，不重付旧租金。':''));
      if(s.scene!=='hall'){nav('回正厅共同商议家计与分工','hall','v2Family');return;}
      if(q==='V2_01'&&!f.v2Entry)action('读母亲留好的铺讯','v2ReadNotice');
      action('保留现有家用的四分之一，再安排筹备','v2Reserve',{choice:'cautious'});action('本轮灵活调配，家用暂不另作预留','v2Reserve',{choice:'flexible'});
      if(q==='V2_04'){for(const product of N.shopProducts)action('商议主打 · '+itemName(product),'v2Plan',{product});const a=M.shops[t.site||'east'];table(['筹备项目','眼前安排'],[['候选铺面',a.name],['常规租金与押金',t.contract?.legacy?'旧约已付，不重复收费':a.rent+' + '+a.deposit+' 文'],['自修材料',Object.entries(a.repair).map(([k,n])=>itemName(k)+' '+n).join('、')],['挂号材料','枯枝 1、草绳 1'],['首批转运','拼车8文/8格；定班12文/20格'],['目前现金 / 家用保留',s.coins+' / '+t.reserve+' 文']]);action('逐项看过，记下筹备方案','v2Budget',{},f.v2PlanRecorded,'先选定主打制品。');}
      if(q==='V2_17'){action('主角接待 · 母亲选品 · 父亲协助核账','v2Roster',{choice:'playerStore'});action('母亲轮值店面 · 主角协调制作与补货','v2Roster',{choice:'motherStore'});}
      if(q==='V2_18'){for(const [choice,label]of [['steady','稳住熟客与手艺'],['neighbors','做好南澜进城供货'],['travel','拓展轻便的行商选品']])action('下一阶段 · '+label,'v2FamilyEnd',{choice},f.v2ThreeDays&&f.v2Cooperated,'先完成邻铺转介与三个不同营业日闭账，并交清已接订单。');}
      if(f.volume2Complete)note('本卷已完成，已接受订单和日常经营仍可继续。');return;
    }
    if(kind==='v2Observe'){
      // The last observation completes this quest; replace its old detail panel.
      if(q!=='V2_02'){showQuest();notice(nextHint());return;}
      const slot=o?.slot||'morning',a=M.slots[slot];title('南街 · '+a.label+'客流札记',a.text+'\n\n当前游戏时间：第'+N.clock(s).day+'日。按约观察会推进到对应时段；菜畦与其他事务同步经过这段时间。');
      if(q==='V2_02')action((f[a.flag]?'已记下 · ':'赴约观察 · ')+a.label,'v2Observe',{slot},!f[a.flag],'这一时段已真实记录，可前往下一个观察点。');
      table(['已经看见','记录'],t.observations.map(x=>[M.slots[x.slot].label,x.text]));return;
    }
    if(kind==='v2Lease'){
      const site=o?.site||t.site||'east',a=M.shops[site];title(a.name+' · 看铺与条款',a.text+'\n\n榕荫铺：租金30文、押金20文。桥口铺：租金45文、押金30文。房东修补需加租；自修需实际备料。'+(t.contract?'\n\n已确认：'+t.contract.name+'；已付租金'+t.contract.rent+'文，押金'+t.contract.deposit+'文。':''));
      if(q==='V2_03'){action('亲查'+a.name+'的窗墙、门面和通道','v2Inspect',{site},!f[site==='east'?'v2InspectEast':'v2InspectWest'],'这间铺面的缺陷已记下。');if(f.v2InspectEast&&f.v2InspectWest)for(const key of ['east','west'])action('选定'+M.shops[key].name,'v2SelectShop',{site:key},!f.v2Leased||t.site===key,'旧租约继续有效，保留原铺面。');}
      if(q==='M12')for(const [choice,label]of [['self','自修换低租'],['owner','房东负责修补'],['trial','短期试租']]){const c=M.leaseQuote(s,choice);action(label+' · 租金'+c.rent+'＋押金'+c.deposit+'文','v2Lease',{choice},s.coins-c.total>=t.reserve,'支付后需保留家用 '+t.reserve+' 文；可回正厅调整，或继续试摊筹钱。');}
      if(q==='V2_04')nav('回正厅逐笔核算','hall','v2Family');return;
    }
    if(kind==='v2Repair'){
      const cost=M.shops[t.site||'east'].repair;title('林师傅 · 尺与柜架','「架子是给人拿东西的。替客人走一遍。」\n'+(t.contract?.repair==='owner'?'本次租约由房东负责约定修补，你仍需到场验收。':'自修材料：'+Object.entries(cost).map(([k,n])=>itemName(k)+' '+n).join('、'))+'\n挂铺号：枯枝1、草绳1。草绳可在仓房制作。');
      window.NanlanSeals.workshop();
      if(!s.production.shopName)nav('回书房请祖父题字号','study','books');else note('已题字号：「'+s.production.shopName+'」。');
      if(q==='V2_06'){if(!f.v2Repaired)action(t.contract?.repair==='owner'?'现场检查房东完成的修补':'备料检修柜架','v2Repair',{},t.contract?.repair==='owner'||goods(cost),'材料不足；可在村庄与山路采集。');else if(!f.v2Decorated){action('试走低架通道 · 日用靠前','v2Decorate',{style:'practical'});action('试走靠墙陈列 · 草木分类','v2Decorate',{style:'herbal'});}else if(!f.v2Sign)action('亲手挂铺号 · 枯枝1、草绳1','v2Sign',{},goods({wood:1,rope:1})&&!!s.production.shopName,'先在书房选定字号，并备好枯枝1、草绳1。');}nav('去仓房制作与备料','store','workbench');return;
    }
    if(kind==='v2Cargo'){
      title('旧宅仓房 · 实货与装车','母亲：「这两只留给谁，你还记得么？」\n装箱从行囊扣实货，原有订单预留不能装车；发车后转入在途，签收后才能在县城出售。\n\n已装：'+(Object.entries(t.cargo).filter(([,n])=>n).map(([id,n])=>itemName(id)+' ×'+n).join('、')||'暂无')+(t.shipment?'\n已有一批在途，请去铺内验收。':''));
      if(!f.v2Sign){prerequisiteNote('先完成柜架检修、陈列和铺号。');return;}
      if(!t.shipment){for(const id of Object.keys(N.prices)){const n=N.available(s,id);if(n>0){action('装入 '+itemName(id)+' ×1','v2Pack',{item:id,quantity:1});if(n>=3)action('装入 '+itemName(id)+' ×3','v2Pack',{item:id,quantity:3});}if(t.cargo[id]>0)action('卸回 '+itemName(id)+' ×1','v2Unpack',{item:id,quantity:1});}action('同乡拼车 · 8文 / 8格 / 90分钟','v2Ship',{method:'shared'},Object.values(t.cargo).reduce((a,b)=>a+b,0)>=(f.v2ShipmentReceived?1:2),f.v2ShipmentReceived?'至少装入一件补货。':'首批至少装两件实货。');action('商行定班 · 12文 / 20格 / 45分钟','v2Ship',{method:'regular'},Object.values(t.cargo).reduce((a,b)=>a+b,0)>=(f.v2ShipmentReceived?1:2),f.v2ShipmentReceived?'至少装入一件补货。':'首批至少装两件实货。');}
      nav('去县城铺内清点到货','generalStore','v2Shelf');nav('在仓房制作成品','store','workbench');return;
    }
    if(kind==='v2Shelf'){
      title('铺内货架 · 到货与陈列','当前实收：'+stockText()+'\n\n主打只影响推介，其他可交易的采集物与制成品同样可以卖。订单预留与自己的时段留货分别记录。');
      if(t.shipment)action('依约等车到货，逐件清点签收','v2Receive');
      table(['实货','在店','订单预留','时段留货','可售'],Object.entries(shop.stock).filter(([,n])=>n).map(([id,n])=>[itemName(id),n,shop.reserved[id]||0,shop.holds[id]||0,M.stockAvailable(s,id)]));
      if(q==='V2_08'){for(const [style,label]of [['small','小件引客'],['signature','招牌制品先被看见'],['use','按用途搭配']])action('陈列 · '+label,'v2Display',{style});}
      if(f.v2DisplayChosen){const id=shop.stock[shop.featured]>0?shop.featured:Object.keys(shop.stock).find(k=>M.stockAvailable(s,k)>0);if(id)action('为午后留 '+itemName(id)+' ×1','v2Hold',{item:id,quantity:1},(shop.stock[id]||0)-(shop.reserved[id]||0)>=1,'这批货已承诺给顾客。');action('不设时段留货 / 解除自己的留货','v2NoHold');}
      for(const id of Object.keys(shop.stock))if(M.stockAvailable(s,id)>0)action('取回行囊 '+itemName(id)+' ×1','v2Withdraw',{item:id});nav('去旧宅仓房装下一批货','store','goodsCrates');return;
    }
    if(kind==='v2Pricing'){title('价签 · 成本与报价','较高价格可能让街坊暂缓购买；常价和让利也要看毛利。已经确认的订单保留原单价。');pricesPanel();button('回柜台经营',()=>window.NanlanV2.show('v2Shop'),'v2-price-back',true);return;}
    if(kind==='v2Lamp'){title('门前灯笼','母亲把明日补货单压在砚台下：「她说明日还来，带隔壁一起。」');if(q==='M18')action('亲手点亮南街这盏灯','v2Lamp',{},f.v2FirstCounted,'先在柜台完成真实闭店盘点。');return;}
    if(kind==='v2Shop'){
      const d=M.summary(s).day;title((s.production.shopName||M.shops[t.site]?.name||'南街铺面')+' · 柜台与账目','主打：'+itemName(shop.featured)+'\n货架：'+stockText()+'\n今日尚可接待 '+N.shopCustomers(s)+' 位普通来客。'+(d?.closed?'\n今日已经打烊，回东厢房睡一夜，明日继续。':'\n街坊、匠工与行商关心的东西不同；谈妥后才付钱拿货。'));
      if(!s.production.shopName)nav('去书房补题自家字号','study','books');
      ledger();if(s.scholar?.pots&&f.v2Opened)globalThis.NanlanScholar?.counter();window.NanlanV3?.shelves();if(s.story3)button('查看山海交接手记',window.NanlanV3.journal,'v3-orders',true);if(f.v2Opened)window.NanlanVillage?.counter();button('打开铺号印匣与采料路线',()=>window.NanlanSeals.show(),'v2-seal-box',true);
      if(q==='V2_09'){button('查看并调整逐件价签',()=>window.NanlanV2.show('v2Pricing'),'v2-pricing');if(!f.v2PriceConfirmed)action('核对到店成本，确认开门报价','v2ConfirmPrices');else action('亲手开门迎客','v2Open',{},!!s.production.shopName,'先回书房请祖父题字号。');}
      if(q==='V2_10'&&!f.v2CustomerHeard)action('听旧客问：改过的窄篮还在么？','v2HearCustomer');
      if(f.v2Opened&&!d?.closed){for(const id of Object.keys(shop.stock))if(M.stockAvailable(s,id)>0)action('成交 '+itemName(id)+' ×1 · '+N.shopPrice(s,id)+'文','v2Sell',{item:id,quote:N.shopPrice(s,id)},N.shopCustomers(s)>0,'今日普通来客已散；可交已约订单或回家过夜。');action('这一位先不买，接待下一位','v2NextCustomer',{},N.shopCustomers(s)>0,'今日普通来客已散。');button('调整未成交货物价签',()=>window.NanlanV2.show('v2Pricing'),'v2-retail-pricing',true);}
      if(q==='V2_11'){action('只卖可售现货，保留旧承诺','v2Bulk',{choice:'cash'});action('现货先交，另约一件分批补交','v2Bulk',{choice:'split'});action('这次不接超出能力的大单','v2Bulk',{choice:'decline'});}
      if(t.orders.bulk&&t.orders.bulk.delivered<t.orders.bulk.quantity)action('按原报价交分批单 · '+itemName(t.orders.bulk.item),'v2DeliverBulk',{},M.stockAvailable(s,t.orders.bulk.item)>0&&!d?.closed,'需要可售现货，且今日尚未打烊。');
      if(q==='V2_14'){if(!f.v2RegularAgreed){action('收小额定金，约好留货','v2Regular',{choice:'deposit'},!d?.closed,'今日已打烊，明日再约。');action('改为先买一件，分次添置','v2Regular',{choice:'small'},!d?.closed,'今日已打烊，明日再约。');}else{const a=t.orders.regular;note('已约 '+itemName(a.item)+' ×1，单价'+a.unitPrice+'文，定金'+a.deposit+'文。');action('按约交货，抵扣原定金','v2DeliverRegular',{},!d?.closed,'今日已打烊，请明日交货。');}}
      if(q==='V2_15'){if(!f.v2CapacityPlanned){action('先保早交期 · 竹制小器2件，每件16文','v2Capacity',{choice:'early'});action('承接小批精品 · 窄口竹篓1件，24文','v2Capacity',{choice:'split'});}else{const a=t.orders.batch;action('按单交付 '+itemName(a.item)+' ×1（'+a.delivered+'/'+a.quantity+'）','v2DeliverBatch',{},M.stockAvailable(s,a.item)>0&&!d?.closed,'先实际制作、运到店内，并在营业日交付。');}}
      if(f.v2BulkResolved&&!d?.closed)action('打烊至傍晚，核对并保存今日账目','v2Close',{},(d?.quantity||0)>0,'今日至少需要一笔真实销售或订单交付。');
      if(f.v2BulkResolved)for(const pending of Object.values(t.days).filter(day=>!day.closed&&day.quantity>0&&day.day<N.clock(s).day).sort((a,b)=>a.day-b.day))action('补核第'+pending.day+'日账目 · 收入'+pending.sales+'文','v2Close',{day:pending.day});
      const saved=Object.values(t.days).filter(day=>day.closed).sort((a,b)=>a.day-b.day);if(saved.length)table(['已结营业日','成交收入','商品与费用成本','经营结果'],saved.map(day=>['第'+day.day+'日',day.sales+'文',num(day.cost+day.expenses+day.rent+day.wear)+'文',day.profit+'文']));
      if(q==='M18'&&f.v2FirstCounted)nav('走到门前亲手点灯','generalStore','v2ShopLamp');
      if(d?.closed)nav('回东厢房床榻睡一夜','bed','bedRest');nav('查看到货、预留与实货','generalStore','v2Shelf');button('查看逐笔家庭收支',showAccounts,'v2-ledger',true);return;
    }
    if(kind==='v2Neighbor'){
      title('陆掌柜 · 也做生意的街坊','「你家的竹器改过，我看见了。我的客人，也有要别种尺寸的。」\n双方争生意，也可以把自己没有的货介绍到邻铺。');
      if(q==='V2_13'){if(!f.v2NeighborHeard)action('把彼此的商品和客人需求说清','v2Neighbor');else for(const [choice,label]of [['price','普通货调整价格'],['quality','强调真实规格与改良'],['refer','不同尺寸互相介绍']])action(label,'v2Competition',{choice});}
      if(q==='V2_18')action('带一件竹器兑现邻铺转介 · 收12文','v2Cooperate',{},N.available(s,'bambooWare')>0,'从行囊交一件真实竹器，货架上可售的可先取回。');return;
    }
    if(kind==='v2Supplier'){
      title('阿岑 · 南澜来的货','「好用的竹我认得。进了你这铺子，也得让人知道好在哪里。」\n本批竹制小器1、鲜草药1，验收后进入行囊，再由你安排转运。');
      if(q==='V2_16'){if(!f.v2SupplyTerms){action('小批严格验收 · 本批8文','v2SupplyTerms',{choice:'standard'});action('分等说明用途 · 本批6文','v2SupplyTerms',{choice:'graded'});}else action('清点两件实货，按约付款验收','v2SupplyReceive',{},s.coins-(s.choices.supply==='graded'?6:8)>=t.reserve,'先回款或回正厅调整家用保留。');}return;
    }
    title('南街往来','旧友与邻铺仍在。当前主线：'+window.NanlanV2.hint(s));
    nav('去铺面柜台查看经营','generalStore','generalStoreKeeper');
  }
};
