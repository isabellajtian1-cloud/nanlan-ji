(() => {
  const F=globalThis.NanlanFestival,P=globalThis.NanlanPrefecture;
  const words={
    '府城河埠':'Prefectural Landing','府城早市':'Prefectural Morning Market','府城临水客栈':'Riverside Inn','府城茶铺':'Prefectural Teahouse',
    '府城班船':'Ferry to the Prefecture','回南澜的班船':'Ferry Back to Nanlan','府城水路':'Prefectural Ferry Route',
    '穿城门入府城早市':'Through the Gate to the Morning Market','下石街回府城河埠':'Down the Stone Street to the Landing','返回府城早市':'Return to the Morning Market',
    '南街客栈 · 二楼':'South Street Inn · Upstairs','一楼':'Downstairs','二楼':'Upstairs','沿楼梯上二楼':'Take the Stairs Up','沿楼梯下一楼':'Take the Stairs Down',
    '杜掌柜':'Innkeeper Du','吃饭与结账':'Meals and the Bill','客房床铺':'Guest Bed','早市样货摊':'Morning Market Sample Stall',
    '茶桌 · 吃茶与点心':'Tea Table · Tea and Snacks','年节簿':'Festival Calendar','钱袋里的铜钱不够。':'There are not enough coins in your purse.',
    '班船在 07:00 至 16:00 开行。':'The ferry runs from 07:00 to 16:00.','雷雨未歇，船家暂缓开船。':'The boatman is waiting for the storm to pass.',
    '府城须从新河埠乘船抵达。':'Take the ferry from New River Wharf to reach the prefecture.',
    '正在府城。请从府城河埠乘回程船返回南澜。':'You are in the prefecture. Take the return ferry from the landing.',
    '请先到一楼柜台结账订房。':'Settle the room bill at the downstairs counter first.',
    '第一次沿水路进府城。手里还留着回南澜的船凭。':'Your first journey to the prefecture by water. The return ticket is still in your hand.',
    '客栈柜台结清一夜房钱':'Settled one night’s room bill at the inn',
    '新河埠结清府城往返船脚':'Paid the round trip fare at New River Wharf',
    '府城客栈结清一份饭钱':'Settled the bill for one meal at the Riverside Inn',
    '府城茶铺结清茶点钱':'Settled the tea and snacks bill',
    '府城早市售出一件样货':'Sold a sample at the prefectural morning market',
    '沿水路抵达府城，回程船脚已付。':'Arrived by river. Your return fare is paid.',
    '已凭船凭回到南澜新河埠。':'Your ticket brought you back to New River Wharf.',
    '目的地图片未能载入。船脚尚未扣除，请重试。':'The landing did not load. No fare was charged. Please try again.'
  };
  for(const event of F.events){
    words[event.name[0]]=event.name[1];
    words[event.intro[0]]=event.intro[1];
    for(const [zh,en,reply,translation] of event.choices){
      words[zh]=en;
      if(reply){words[reply]=translation;words[event.name[0]+' · '+reply]=event.name[1]+' · '+translation;}
    }
  }
  for(const group of Object.values(P.teaMenu)){
    for(const item of Object.values(group))words[item.name[0]]=item.name[1];
  }
  words['陈伯翻开纸签，笑说你猜中了。']='Uncle Chen turns over the slip and smiles. You guessed it.';
  words['元宵 · 陈伯翻开纸签，笑说你猜中了。']='Lantern Festival · Uncle Chen turns over the slip and smiles. You guessed it.';
  if(globalThis.NANLAN_EN&&globalThis.NanlanI18n?.configure){
    Object.assign(globalThis.NANLAN_EN,words);
    globalThis.NanlanI18n.configure(globalThis.NANLAN_EN);
  }
  const L=(zh,en)=>deskText(zh,en);
  const pick=(text,fn,id,secondary=false)=>button(text,fn,id,secondary,false);
  const panel=(name,body)=>activity(name,body,'town-shop');
  const money=(n)=>L(n+' 文',n===1?'1 coin':n+' coins');
  const hint=text=>{
    const p=document.createElement('p');p.className='town-note';p.textContent=text;$('panelExtra').append(p);
  };
  function choice(label,action,params,done,id=action,why=''){
    const b=pick(label,async()=>{
      const result=await perform(action,params,done);
      if(!result.ok&&b.isConnected)hint(result.message);
    },id);
    b.disabled=!!why;
    if(why){b.title=why;hint(why);}
    return b;
  }
  const noMoney=cost=>state().coins<cost?'钱袋里的铜钱不够。':'';
  function travel(to,id){
    closeDialog(true);
    startNavigation(to,id);
  }
  const seasonNames=[['春','Spring'],['夏','Summer'],['秋','Autumn'],['冬','Winter']];
  const active=s=>F.events.find(e=>F.active(s,e));
  function festivalCalendar(){
    const s=state();
    panel('年节簿',L('节期按南澜的四季日历轮转，每节连办三日。错过了，可以等下一轮。','Festivals follow Nanlan’s four-season calendar. Each runs for three days and returns the next year.'));
    const today=document.createElement('p');today.dataset.noLocalize='';today.textContent=L('今日：','Today: ')+NanlanClimate.label(s,window.NanlanI18n?.language==='en');$('panelExtra').append(today);
    const list=document.createElement('div');list.className='time-cards festival-cards';
    for(const event of F.events){
      const now=F.active(s,event),record=s.choices[F.eventKey(s,event)],season=seasonNames[event.season];
      const card=document.createElement('div'),title=document.createElement('b'),text=document.createElement('p');
      title.textContent=event.name[0];
      const date=L(season[0]+'第 '+event.day+'–'+(event.day+2)+' 日',season[1]+' days '+event.day+'–'+(event.day+2));
      const dateNow=NanlanClimate.at(s),past=dateNow.index===event.season&&dateNow.day>=event.day+3;
      const when=now?L('正在过节','Happening now'):past?L('本轮已过 · 下次还有 '+F.next(s,event)+' 日','This festival has ended · Returns in '+F.next(s,event)+' days'):L('尚未到节 · 还有 '+F.next(s,event)+' 日','Upcoming · In '+F.next(s,event)+' days');
      text.textContent=date+' · '+world[event.scene].name+' · '+when;
      card.append(title,text);
      if(now){
        const go=document.createElement('button'),why=N.sceneGate(s,event.scene);
        go.textContent=record===undefined?L('前往过节','Go to the festival'):L('回去看看','Visit again');
        go.disabled=!!why;go.onclick=()=>travel(event.scene,'festival-'+event.id);card.append(go);
        if(why){const note=document.createElement('p');note.textContent=why;card.append(note);}
      }
      list.append(card);
    }
    $('panelExtra').append(list);
    pick(L('回到日历','Back to the calendar'),showTime,'festival-back',true);
  }
  function atlas(key,tile,columns,rows,label){
    const span=document.createElement('span');span.className='food-tile';
    span.setAttribute('role','img');span.setAttribute('aria-label',label);
    span.style.backgroundImage='url("'+DATA.assets[key]+'")';
    span.style.backgroundSize=(columns*100)+'% '+(rows*100)+'%';
    span.style.backgroundPosition=(tile%columns)*100/(columns-1)+'% '+Math.floor(tile/columns)*100/(rows-1)+'%';
    return span;
  }
  const steps={
    newYear:[[['扶住红纸，贴上联','Hold the red paper and hang the first line'],['对齐门边，贴下联','Align the paper and hang the second line']]],
    dragonBoat:[[['托起箬叶，折成斗形','Cup a bamboo leaf into a cone'],['拢好叶口，系紧粽绳','Fold the leaf over and tie it snug']], [['捻齐细绳，帮街坊打结','Twist the twine and tie the neighbors’ parcels']]],
    midAutumn:[[['把圆饼切开','Cut the round cake'],['用油纸包好留给邻人的一块','Wrap a piece for the neighbor']]],
    doubleNinth:[[['择平缓小路，走到能看见村瓦处','Take the gentler path until you can see the village roofs']],[['给长辈斟茶，移一张凳到阴凉处','Pour tea for the elders and move a stool into the shade']]],
    winterSolstice:[[['合掌把米团搓圆','Roll the rice dough between your palms'],['待圆子浮起，盛进碗里','Ladle the dumplings into bowls when they float']],[['把碗筷摆好，请家人趁热吃','Lay out bowls and chopsticks and call the family']]]
  };
  const poems={
    newYear:[['宋 · 王安石《元日》','Wang Anshi, Song · New Year’s Day'],['千门万户曈曈日，\n总把新桃换旧符。','The dawn shines on a thousand households.\nFresh peachwood charms replace the old.']],
    lanterns:[['宋 · 辛弃疾《青玉案·元夕》','Xin Qiji, Song · Lantern Festival Night'],['东风夜放花千树，\n更吹落、星如雨。','The east wind opens a thousand flowering trees by night,\nthen scatters stars like rain.']],
    dragonBoat:[['宋 · 陆游《乙卯重五诗》','Lu You, Song · The Double Fifth'],['粽包分两髻，\n艾束著危冠。','Leaf-wrapped dumplings come to two pointed ends.\nA sprig of mugwort adorns a tall cap.']],
    midAutumn:[['宋 · 苏轼《水调歌头》','Su Shi, Song · Prelude to the Water Melody'],['但愿人长久，\n千里共婵娟。','May we all live long,\nand share this moon though far apart.']],
    doubleNinth:[['唐 · 王维《九月九日忆山东兄弟》','Wang Wei, Tang · Thinking of My Brothers on the Ninth Day'],['遥知兄弟登高处，\n遍插茱萸少一人。','From afar I know my brothers climb the heights.\nAll wear dogwood sprigs. One is missing.']],
    winterSolstice:[['唐 · 白居易《邯郸冬至夜思家》','Bai Juyi, Tang · Thinking of Home on the Winter Solstice in Handan'],['想得家中夜深坐，\n还应说着远行人。','I picture my family sitting late at night,\nstill talking of the one far from home.']],
    boat:[['唐 · 孟浩然《宿建德江》','Meng Haoran, Tang · A Night on the Jiande River'],['移舟泊烟渚，\n日暮客愁新。','I moor by an island wrapped in mist.\nAt dusk, a traveler’s sorrow returns.']],
    tea:[['宋 · 杜耒《寒夜》','Du Lei, Song · Cold Night'],['寒夜客来茶当酒，\n竹炉汤沸火初红。','On a cold night, a guest comes and we pour tea for wine.\nWater boils on the bamboo stove as the fire glows red.']]
  };
  function poem(key,back){
    const [author,verse]=poems[key];
    panel(L(...author),'');
    const paper=document.createElement('blockquote');paper.className='poetry-slip';paper.textContent=L(...verse);
    $('panelExtra').append(paper);
    pick(L('收起诗笺','Put away the poem'),back,'poem-close',true);
  }
  function poemButton(key,back){
    pick(L('读一页诗笺','Read a poem'),()=>poem(key,back),'poem-'+key,true);
  }
  function poetryBook(){
    panel(L('祖父的诗笺','Grandfather’s Poetry Slips'),L('几页唐宋旧句，按时令夹在册里。','A few old verses from the Tang and Song, tucked into the book by season.'));
    for(const [key,[author]] of Object.entries(poems)){
      pick(L(...author),()=>poem(key,poetryBook),'poetry-'+key,true);
    }
    pick(L('回到书案','Return to the desk'),showArchive,'poetry-back',true);
  }
  function festivalStep(event,index,stage=0){
    const labels=steps[event.id]?.[event.id==='newYear'?0:index]||[];
    const item=event.choices[index][4];
    if(stage<labels.length){
      panel(event.name[0],stage===0?event.intro[0]:L('前一步已备好，接着做这一手。','The first part is ready. Finish the next step.'));
      $('panelExtra').append(atlas('festivalProps',F.events.indexOf(event),3,2,event.name[0]));
      pick(L(...labels[stage]),()=>festivalStep(event,index,stage+1),'festival-step-'+stage);
      pick(L('回到节庆桌旁','Return to the festival table'),()=>festival(event),'festival-step-back',true);
      return;
    }
    panel(event.name[0],L('都备齐了。','Everything is ready.'));
    const why=item&&N.available(state(),item)<1?L('行囊里没有余下的米粮。','There is no rice to spare.'):'';
    choice(L('完成这一回','Finish this activity'),'festivalAttend',{id:event.id,choice:index},()=>festival(event),'festival-choice-'+index,why);
    pick(L('回到节庆桌旁','Return to the festival table'),()=>festival(event),'festival-step-back',true);
  }
  function festival(event,wrong=false){
    const s=state(),stored=s.choices[F.eventKey(s,event)],lanterns=event.id==='lanterns';
    const reply=lanterns&&stored===0?'陈伯翻开纸签，笑说你猜中了。':event.choices[stored]?.[2];
    const riddle=lanterns?F.riddle(s,event):null;
    panel(event.name[0],reply||(riddle?L(...riddle[0]):event.intro[0]));
    const art=atlas('festivalProps',F.events.indexOf(event),3,2,event.name[0]);$('panelExtra').append(art);
    poemButton(event.id,()=>festival(event,wrong));
    if(reply){hint(L('这一回节庆已经记进行记。','This year’s celebration is in your journal.'));return;}
    if(wrong)hint(L('陈伯把谜签翻回正面。「慢慢想，这盏灯给你留着。」','Uncle Chen turns the riddle back over. “Take your time. I’ll keep the lantern lit for you.”'));
    if(riddle){
      pick(L(...riddle[2]),()=>festival(event,true),'festival-guess-wrong',true);
      choice(L(...riddle[1]),'festivalAttend',{id:event.id,choice:0},()=>festival(event),'festival-guess-right');
      choice(event.choices[2][0],'festivalAttend',{id:event.id,choice:2},()=>festival(event),'festival-carry');
      return;
    }
    event.choices.forEach(([label,,,,item],i)=>{
      const why=item&&N.available(state(),item)<1?L('行囊里没有余下的米粮，可以选另一项。','There is no rice to spare. You can choose the other activity.'):'';
      const b=pick(label,()=>festivalStep(event,i),'festival-start-'+i);
      if(why){b.disabled=true;b.title=why;hint(why);}
    });
  }
  function boat(){
    const s=state(),home=s.scene==='wharf',why=P.sailing(s);
    panel(home?'府城班船':'回南澜的班船',home?
      L('船家往上游指了指。「过了弯就见府城的城门。往返八文，船凭留好。」','The boatman points upstream. “The city gate is just past the bend. Eight coins covers the round trip. Keep your ticket.”'):
      L('「南澜的船凭还在，回去这一程不用再付。」','“Your Nanlan ticket is still good. There is nothing more to pay for the return.”'));
    hint(L('班船每日 07:00–16:00 开行。雷雨时停航。','Ferries run daily from 07:00 to 16:00. Boats wait out thunderstorms.'));
    choice(home?L('付八文，乘船去府城','Pay 8 coins and sail to the prefecture'):L('凭船凭回南澜','Use your ticket to sail back to Nanlan'),
      home?'prefSail':'prefReturn',{},null,home?'pref-sail':'pref-return',why||(home?noMoney(P.fare):''));
    if(why)choice(L('在候船棚等下一班 · 不收钱','Wait at the shelter for the next sailing · free'),'prefWait',{},boat,'pref-wait');
    poemButton('boat',boat);
  }
  function market(done=false){
    const s=state(),minute=P.minutes(s);
    panel('早市样货摊',done?L('货主把样货收进篮里，递来一张凭单。','The trader puts the sample in a basket and hands you a receipt.'):
      L('「干药要闻清香，竹编要试提。早上只收一件样货，等下回再看你的整批货。」','“Dried herbs should smell clean, and a basket must carry well. I buy one sample in the morning. Bring a full lot another time.”'));
    if(s.choices.prefectureSale===P.day(s)){hint(L('今日样货已结账，明早再来。','Today’s sample is settled. Come back tomorrow morning.'));return;}
    if(minute<360||minute>=600){hint(L('早市 06:00–10:00 收样。可以先逛街或投宿，次日再来。','Samples are bought from 06:00 to 10:00. Browse the street or take a room and return tomorrow.'));return;}
    for(const item of ['driedHerb','bambooWare']){
      const name=L(N.itemNames[item],item==='driedHerb'?'Dried Herbs':'Bamboo Ware');
      choice(L('出售一份 ','Sell one ')+name+' · '+money(N.prices[item]+3),'prefSale',{item},()=>market(true),'pref-sell-'+item,
        N.available(s,item)<1?L('没有可出售的现货。','No unreserved stock to sell.'):'');
    }
  }
  function lodging(inn,back){
    const s=state(),room=P.inns[inn];
    panel(world[room.lobby].name,L('「饭钱在这儿结。楼上有铺好的床，若要歇一夜，也先把房钱记在柜上。」','“Settle meals here. Beds are made upstairs. If you wish to stay the night, settle your room here first.”'));
    if(P.booked(s,inn)){
      hint(L('今晚房钱已结清。可以从一楼楼梯上二楼。','Tonight’s room is paid. Take the stairs from the common room.'));
      pick(L('沿楼梯上二楼','Take the stairs up'),()=>travel(room.room),'pref-up');
    }else{
      choice(L('结清今晚房钱 · ','Settle tonight’s room · ')+money(room.fee),'prefCheckIn',{inn},()=>lodging(inn,back),'pref-check-in',noMoney(room.fee));
    }
    pick(L('回到一楼大堂','Return to the common room'),back,'pref-lobby-back',true);
  }
  function lobby(done=false){
    panel('杜掌柜 · 吃饭与结账',done?L('你把空碗放回长桌，窗下船声听得分明。','You set the empty bowl on the long table. The boats are easy to hear from the window.'):
      L('「一楼吃饭结账。若看完早市还想多留一日，楼上有安静的客房。」','“Meals and bills downstairs. If you would like another day after the market, there are quiet rooms above.”'));
    choice(L('吃一份热饭，结饭钱 · 6 文','Have a hot meal and settle the bill · 6 coins'),'prefMeal',{},()=>lobby(true),'pref-meal',noMoney(6));
    pick(L('柜台订房','Book a room at the counter'),()=>lodging('prefecture',lobby),'pref-room-bill');
  }
  function bed(done=false){
    const inn=state().scene==='countyRoom'?'county':'prefecture';
    panel('客房床铺',done?L('窗纱透进晨光。你收好行李，楼下已经在烧水。','Morning light comes through the window screen. You pack your things as water heats downstairs.'):
      L('床褥干爽。掩上窗，能听见街上渐渐安静下来。','The bedding is dry. Close the window and listen as the street grows quiet.'));
    if(P.booked(state(),inn))choice(L('在客房睡到次日清晨','Sleep in the guest room until dawn'),'prefSleep',{inn},()=>bed(true),'pref-sleep');
    else if(!done)hint('请先到一楼柜台结账订房。');
    pick(L('沿楼梯下一楼','Take the stairs down'),()=>travel(P.inns[inn].lobby),'pref-down',true);
  }
  function tea(order=null,served=false){
    const s=state(),current=order||P.serving(s);
    panel('茶桌 · 吃茶与点心',served?L('茶点端上了木桌。你可以多坐一会儿，也可以起身再逛。','Your order arrives at the wooden table. Sit a while, or get up and explore some more.'):
      L('掌柜把食单搁在桌边。「茶用散叶冲泡，点心现蒸现烘。想吃哪样，只管指给我看。」','The keeper lays the menu by the table. “Loose leaves in the pot, and cakes fresh from the steamer or oven. Show me what you would like.”'));
    const tray=document.createElement('div');tray.className='tea-tray';
    for(const category of ['tea','cake']){
      const item=current&&P.teaMenu[category][current[category]];
      if(!item)continue;
      const figure=document.createElement('figure'),caption=document.createElement('figcaption');
      caption.textContent=item.name[0];figure.append(atlas(item.tile<4?'teaServings':'teaExtras',item.tile%4,2,2,item.name[0]),caption);tray.append(figure);
    }
    if(tray.children.length)$('panelExtra').append(tray);
    poemButton('tea',()=>tea(order,served));
    if(served||(!order&&current)){
      pick(L('再看茶单','Look at the menu again'),()=>tea({tea:null,cake:null}),'pref-tea-menu');
      return;
    }
    const selection=order||{tea:null,cake:null};
    for(const category of ['tea','cake']){
      const group=document.createElement('fieldset');group.className='tea-menu-group';
      const title=document.createElement('legend');title.textContent=category==='tea'?L('茶','Tea'):L('点心','Snacks');group.append(title);
      for(const [id,item] of Object.entries(P.teaMenu[category])){
        const chosen=selection[category]===id;
        const b=pick(item.name[0]+' · '+money(item.cost),()=>tea({...selection,[category]:chosen?null:id}),'pref-menu-'+id,true);
        b.setAttribute('aria-pressed',String(chosen));group.append(b);
      }
      $('choices').append(group);
    }
    const price=(P.teaMenu.tea[selection.tea]?.cost||0)+(P.teaMenu.cake[selection.cake]?.cost||0);
    if(price)choice(L('结账上桌 · ','Settle the bill and serve · ')+money(price),'prefTea',selection,()=>tea(null,true),'pref-tea-pay',noMoney(price));
  }
  function offer(o){
    if(o.action==='festival'){const event=F.events.find(e=>e.id===o.festival);if(event&&F.active(state(),event))festival(event);return true;}
    if(o.action==='prefBoard'){boat();return true;}
    if(o.action==='prefStall'){market();return true;}
    if(o.action==='prefLobby'){lobby();return true;}
    if(o.action==='prefBed'){bed();return true;}
    if(o.action==='prefTeaTable'){tea();return true;}
    return false;
  }
  function visible(s,o){
    if(o.festival)return F.events.some(e=>e.id===o.festival&&F.active(s,e));
    if(o.id==='prefBoard')return P.unlocked(s);
    return true;
  }
  function drawTile(ctx,key,tile,columns,rows,x,y,w,h){
    const image=images[key];if(!image?.naturalWidth){void loadImage(key);return;}
    const cw=image.naturalWidth/columns,ch=image.naturalHeight/rows;
    ctx.drawImage(image,(tile%columns)*cw,Math.floor(tile/columns)*ch,cw,ch,x,y,w,h);
  }
  function draw(ctx,s,o){
    if(o.festival){
      const tile=F.events.findIndex(e=>e.id===o.festival);
      drawTile(ctx,'festivalProps',tile,3,2,o.x-38,o.y-72,76,76);
    }
    if(o.tabletop){
      const serving=P.serving(s);if(!serving)return;
      const [x,y]=o.tabletop;
      for(const [category,offset] of [['tea',-17],['cake',17]]){
        const item=P.teaMenu[category][serving[category]];
        if(item)drawTile(ctx,item.tile<4?'teaServings':'teaExtras',item.tile%4,2,2,x+offset-15,y-18,30,30);
      }
    }
  }
  globalThis.NanlanFestivalUI={offer,visible,draw,active,festivalCalendar,lodging,poetryBook};
})();
