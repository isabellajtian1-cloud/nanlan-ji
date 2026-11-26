/* A walk home, with optional observations attached to the people and places that teach them. */
window.NanlanHomeward = (() => {
  const model = NanlanHomewardModel;
  const L = (zh,en) => deskText(zh,en);
  const land = NANLAN_DATA.world;
  const locals = [
    ['village','homewardDusk','榕下收针的大娘','The seamstress under the banyan',305,352,'dusk','auntDusk'],
    ['village','homewardDawn','赶早渡的大娘','A passenger for the morning ferry',670,574,'dawn','auntDawn'],
    ['wharf','homewardWharf','提宽梁篓的大娘','The woman with the broad-handled hamper',463,446,'wharf','auntDawn']
  ];
  for (const [scene,id,label,en,x,y,when,role] of locals) {
    land[scene].objects.push({id,label,x,y,type:'activity',action:'homeward',role,when});
    NANLAN_EN[label] = en;
  }
  Object.assign(NANLAN_DATA.assets,{npc_auntDawn:'homeward-aunt-dawn.webp',npc_auntDusk:'homeward-aunt-dusk.webp'});
  const stone = {id:'brookBasket',type:'view',label:'石边的竹背篓',x:782,y:267,scenic:true,approach:{x:785,y:307},hit:{x:757,y:237,w:51,h:40},action:'homeward'};
  land.banyanBrook.objects.push(stone);
  NANLAN_EN[stone.label]='The drying basket on the far bank';
  function visible(s,o,q) {
    if (!o.when) return true;
    if (o.when === 'wharf') return !!s.choices.ferryWideHandle && model.visit(s)==='dawn';
    return q !== 'V2_10' && model.visit(s)===o.when && !(o.when==='dawn' && s.choices.ferryWideHandle && s.visits.wharf);
  }
  function photo(key,alt) {
    const frame=document.createElement('div'), img=document.createElement('img');
    frame.className='homeward-picture';
    img.src='homeward-'+key+'.webp';img.alt=alt;
    frame.append(img);$('panelExtra').append(frame);
    return frame;
  }
  function page(title,line,key,alt) {
    activity(title,line,'homeward-scene');
    $('dialogPortraits').hidden=true;
    return photo(key,alt);
  }
  function spot(frame,id,label,x,y,fn) {
    const b=document.createElement('button');
    b.type='button';b.className='homeward-spot';b.dataset.action=id;b.textContent=label;
    b.style.left=x+'%';b.style.top=y+'%';b.onclick=async()=>{
      if(b.disabled)return;
      b.disabled=true;
      try{await fn();}finally{if(b.isConnected)b.disabled=false;}
    };
    frame.append(b);return b;
  }
  function back(label,id,fn) {return navButton(label,fn||(()=>closeDialog(true)),id);}
  function aunt(o) {
    const s=state(),dawn=o.when==='dawn';
    if(o.when==='wharf'||s.choices.ferryWideHandle){
      page(L('渡口大娘 · 腾出一只手','At the ferry · A free hand'),L('她把提梁往肘弯里一挂，另一只手稳稳扶住船沿。「你看，这回哪还用人搀！」篓扣上还是你认得的那截红线。','She slips the broad handle over her arm and grips the rail. “See? No need for a hand up today.” The old red thread is still on the clasp.'),'mended',L('她把手腕穿过改宽的竹梁。','Her wrist slips through the broad bamboo handle.'));
      back(L('目送她上船','Watch her board'),'homeward-farewell');return;
    }
    const seen=dawn?s.choices.ferryMorningSeen:s.choices.ferrySewingSeen;
    const line=dawn?L('竹篙轻轻碰了两下船帮。大娘把针线包往胳肢窝一夹，想腾出手扶船沿，包里的剪子却滑出了半截。','A pole taps the hull twice. She tucks her sewing under one arm to take the rail. Her scissors start sliding out.'):
      L('大娘把红线绕在两指间，针尖在最后一点日头里闪了一下。「上船那一下，偏要两只手都空着。你说这包针线往哪儿搁？」','She winds red thread around two fingers. The needle catches the last light. “I need both hands getting aboard. Where am I to put this sewing?”');
    const pic=page(L('渡口来的大娘','The woman from the ferry'),line,dawn?'dawn':'sewing',dawn?L('她腾出一只手扶船沿。','She frees one hand to grip the rail.'):L('榕荫下收针的老妇。','An older woman gathers her thread beneath the banyan.'));
    if(!seen)spot(pic,'homeward-meet',dawn?L('接住布包','Catch the bundle'):L('替她绕好红线','Wind the red thread'),dawn?44:60,dawn?62:62,()=>perform('homewardVisit',{time:o.when},()=>aunt(o)));
    if(seen)$('line').textContent=dawn?L('你托住包底，她这才腾出手来。「赶集那天，帮我留意一只能扣紧的小篓。」','You steady the bundle. “At market, keep an eye out for a hamper with a lid that stays put.”'):L('她把针收进布包，系牢红线。「篓得有盖，还得能挂在臂弯里。我赶早渡，手要留给船沿。」','She slips the needle inside and ties the thread. “A lid and a handle I can slip over my arm. I need my hand for the ferry rail.”');
    if(!dawn)back(L('沿巷子往自家窗下走','Walk towards the light at home'),'homeward-home',()=>startNavigation('village',window.NanlanHomewardRoad?'villageHomeLane':'home'));
    back(L('继续走走','Keep walking'),'homeward-walk');
  }
  function brook(){
    const s=state();
    activity(L('榕溪石径 · 对岸石边','Banyan Brook · On the far bank'),s.choices.brookWeaveSeen?
      L('篓底的篾尾都收在内侧。你指腹从外沿抹过，一处也没勾手。','The ends turn in under the base. Your finger passes along the outside without catching.'):
      L('隔溪看见的正是这只背篓。篓底还挂着水珠，背带朝上搭着，编篾的人特意把收口藏了起来。','It is the basket you saw across the stream. Water beads on the base. Its maker tucked the last split out of sight.'),'homeward-scene');
    const detail=document.createElement('div');detail.className='homeward-basket-detail';detail.setAttribute('role','img');detail.setAttribute('aria-label',L('竹背篓的编纹与背带','Weave and straps of the drying basket'));$('panelExtra').append(detail);
    if(!s.choices.brookWeaveSeen)button(L('翻看篓底的收口','Turn the basket and feel the weave'),()=>perform('homewardWeave',{},brook),'homeward-weave',false,false);
    back(L('把篓放回石边','Set it back beside the stone'),'homeward-brook-back');
  }
  function water(board) {
    const low=N.tide(state()).low,known=state().choices.learnedWaterline;
    const line=known?L('你还认得晚渔教的那道痕。今天能不能下滩，先看看水面和最下面一级离得多远。','You remember the mark Wanyu showed you. How far is the water from the lowest tread today?'):
      L('晚渔教过你，石上的旧湿痕会骗人，要看浪头眼下舔到哪一级。你扶着木牌，低头找这会儿的水边。','Wanyu warned you that yesterday’s wet mark can mislead. Look for the step the water is actually touching.');
    const frame=page(L('海边石阶 · 认水痕','Shore steps · Read the water'),line,'tide',L('由高到低的三级石阶。','Three stone steps leading down into the bay.'));
    frame.dataset.tide=low?'low':'high';
    const wash=document.createElement('span');wash.className='homeward-water';frame.append(wash);
    function choose(answer){
      if(answer!==N.tide(state()).low){$('line').textContent=answer?L('那是石上留下的旧水痕。眼下浪头已盖过最低一级，走高岸。','That is an older stain. The water now covers the lowest tread. Keep to the high bank.'):L('看最下面那一级，湿石已经露出，浪头在石脚。','Look down. The wet bottom tread is exposed, with water lapping at its foot.');return;}
      const reveal=()=>{
        activity(L('海边石阶 · 归路在眼前','Shore steps · The way back'),answer?L('最低一级露出来了。你顺着水边望过去，滩口的路这会儿能走。','The lowest step is showing. The route out to the flats is open.'):L('水盖过了最下一阶。你退上高岸，从木牌这一侧回村。','The lowest tread is submerged. Step back onto the high bank to return to the village.'),'homeward-scene');
        if(N.current(state())==='M09'&&!state().flags.tideRead)actButton(L('对照木牌，记下归路','Check the board and mark the way home'),'readTide',{},()=>showTide(board));
        else back(L('再看潮线木牌','Look at the tide board'),'homeward-board-back',()=>showTide(board));
      };
      return perform('homewardTide',{low:answer},reveal);
    }
    spot(frame,'homeward-high',L('水已漫上石面','Water over the tread'),35,42,()=>choose(false));
    spot(frame,'homeward-low',L('最低一级露出','Bottom step exposed'),70,74,()=>choose(true));
    back(L('抬头看木牌','Read the board'),'homeward-board-back',()=>showTide(board));
  }
  function plank(o){
    const learned=state().choices.learnedPlank;
    const frame=page(L('山路木道 · 试板头','Mountain walkway · Test the plank'),learned?L('板端一松，手一摸便知。往后验篾，也可以用这法子。','Feel which end gives. The same test works on a loose bamboo split.'):
      L('你记起父亲教的法子：「踩住近头，眼睛瞧远头。」脚下一压，板的另一端微微抬起。','Father’s advice comes back. “Press this end and watch the other.” The far end lifts under your weight.'),'plank',L('鞋尖压住近端，另一端翘起。','A shoe pins one end while the far end lifts.'));
    if(!learned){
      spot(frame,'homeward-heel',L('试脚下这头','Test the near end'),26,72,()=>{$('line').textContent=L('脚下压得牢。沿着板面看过去，哪一端离开了横木？','The near end holds firm. Which end has lifted off its support?');});
      spot(frame,'homeward-tip',L('摸翘起的板头','Feel the raised end'),78,45,()=>perform('homewardBoard',{},()=>plank(o)));
    }
    back(L('回到木道旁','Return to the walkway'),'homeward-plank-back',()=>interact(o));
  }
  function handle(o,stage='inspect'){
    if(state().choices.ferryWideHandle)stage='done';
    const done=stage==='done';
    const frame=page(L('南街铺里 · 改一根提梁','South Street · Refit the handle'),done?
      L('大娘把手腕穿进宽提梁，摇了两下。篓扣上的红线一动没动。「这下扶船的时候，手可腾出来了。」','She slips her wrist through the new handle and gives it two swings. The red clasp holds. “Now I can keep a hand free for the rail.”'):
      stage==='inspect'?L('你认出扣上的红线。她指了指提梁：「这儿磨手，我缠了两圈布。下回能宽一指么？」','You recognize the red thread. She shows you the grip. “I wrapped it twice and it still rubs. Could you make it a finger wider?”'):
      L('布下的竹梁又窄又亮。案右有一根已刮平的宽梁，留着旧篓身就能换上。','Under the cloth, the narrow grip is polished smooth. A wider handle lies to the right. The old body can stay.'),done?'mended':'handle',L('旧篓身与提梁细节','The worn hamper and its handle'));
    if(!done&&stage==='inspect')spot(frame,'homeward-unwrap',L('摸旧布缠过的地方','Feel the wrapped grip'),43,20,()=>handle(o,'fit'));
    if(stage==='fit')spot(frame,'homeward-refit',L('装上宽梁，请她试提','Fit the wide handle'),78,68,()=>perform('homewardHandle',{},()=>handle(o,'done')));
    back(L('回到铺里','Return to the shop'),'homeward-shop-back',()=>interact(o));
  }
  function meal(feast,memory,ordinary=false){
    const s=state(),choice=s.choices.firstSupperGesture;
    const caption=feast?L('母亲刚伸手，热饭已经有人替她盛好了。','Mother reaches out. Someone has already filled her bowl.'):L('母亲伸手摸锅底，父亲把自己的碗朝她推了半寸。','Mother feels along the bottom of the pot. Father nudges his bowl towards her.');
    const frame=page(ordinary?L('正厅 · 灯下坐坐','Main hall · A moment at table'):feast?L('岁末 · 给母亲的饭','Year’s end · A bowl for Mother'):L('第一顿饭 · 桌边','The first supper · At the table'),ordinary?L('堂屋的灯映在碗沿。坐回这个位置，你记起初来时，父亲把碗朝母亲推了半寸。','Lamplight catches the rim. Sitting here brings back the first evening, when Father slid his bowl towards Mother.'):caption,feast?'feast':'first',caption);
    if(!ordinary&&!memory&&!feast){
      const receipt=document.createElement('p');receipt.textContent=firstMealReceipt();$('panelExtra').append(receipt);
    }
    function finish(which){
      const outcome=()=>{NanlanAudio.play('bowlTouch');$('line').textContent=which==='crust'?L('你把锅巴刮进母亲碗里。她掰下一小块递回来：「尝尝，这块最香。」','You scrape the crust into her bowl. She breaks off a piece. “Taste this bit. It is the best.”'):L('你陪她坐了一会儿。桌边安静下来，只有瓷碗轻碰木桌的一声。','You sit with her a while. A ceramic bowl touches the table in the quiet.');frame.querySelectorAll('button').forEach(b=>b.remove());};
      if(!ordinary&&!memory&&!choice)return perform('homewardSupper',{choice:which},outcome);
      outcome();
    }
    if(!feast&&(!choice||ordinary)&&!memory){
      spot(frame,'homeward-crust',L('给母亲盛锅巴','Share the rice crust'),75,58,()=>finish('crust'));
      spot(frame,'homeward-sit',L('陪她坐一会儿','Sit with her'),29,77,()=>finish('sit'));
    }else if(!feast&&choice)$('line').textContent+=' '+(choice==='crust'?L('那块最香的锅巴，她又分了一半给你。','She shared the crispest piece with you.'):L('那一晚，你陪她坐到了灯花落下。','You sat beside her until the wick burned low.'));
    if(feast)spot(frame,'homeward-serve',L('把饭送到她手边','Set the rice by her hand'),38,54,()=>{NanlanAudio.play('bowlTouch');$('line').textContent=L('母亲低头看了看，笑道：「今儿我倒成了头一个吃的。」','She looks down and smiles. “First to be served, am I?”');frame.querySelector('button')?.remove();});
    back(ordinary?L('起身回到正厅','Stand up'):L('回到围桌的家人身边','Return to the family table'),'homeward-meal-back',ordinary?undefined:()=>showFamilyMeal(feast,memory,true));
  }
  function offer(o){
    if(o.id==='brookBasket'){brook();return true;}
    if(o.action==='homeward'){aunt(o);return true;}
    return false;
  }
  function basket(ctx,x,y,w,h) {
    const atlas=images.inventoryCrafts;
    if(!atlas?.naturalWidth)return;
    ctx.save();
    ctx.fillStyle='rgba(45,39,23,.24)';
    ctx.beginPath();ctx.ellipse(x,y,w*.40,h*.09,0,0,2*Math.PI);ctx.fill();
    ctx.drawImage(atlas,836,800,418,454,x-w/2,y-h,w,h);ctx.restore();
  }
  function props(ctx,s,actors){
    if(s.scene==='banyanBrook')actors.push({y:stone.y,draw:()=>basket(ctx,stone.x,stone.y,31,31)});
    if(s.scene==='village'&&(model.ownsHamper(s)||s.bag.bambooWare>0))
      actors.push({y:332,draw:()=>basket(ctx,149,330,24,25)});
    if(s.choices.ferryWideHandle&&['village','wharf'].includes(s.scene)){
      const when=model.visit(s);
      const woman=land[s.scene].objects.find(o=>o.when&&(o.when===when||o.when==='wharf')&&visible(s,o,N.current(s)));
      if(woman)actors.push({y:woman.y+1,draw:()=>{
        const x=woman.x+12,y=woman.y-7;
        ctx.save();ctx.strokeStyle='#c79b5d';ctx.lineWidth=2.6;ctx.beginPath();
        ctx.ellipse(x,y-12,6,9,0,Math.PI,2*Math.PI);ctx.stroke();ctx.restore();
        basket(ctx,x,y,15,16);
      }});
    }
  }
  let lastPlace='',heard='';
  function lamplight(ctx,s,minute) {
    const place=s.scene;
    if(place!==lastPlace){lastPlace=place;heard='';}
    if(!['village','yard','homeLane'].includes(place))return;
    const evening=Math.min(1,Math.max(0,(minute-977)/86));
    if(place==='village'&&active&&!document.hidden){
      const period=model.visit(s),p=s.player;
      const point=period==='dusk'?[305,352]:[670,574];
      if(period&&period!==heard&&Math.hypot(p.x-point[0],p.y-point[1])<135){
        heard=period;NanlanAudio.play(period==='dawn'?'ferryPole':'stallBoards');
      }
    }
    if(!evening||!(s.flags.firstCooked||s.flags.stableLights||s.flags.firstShared))return;
    const panes=place==='homeLane'?[[724,209,741,208,741,237,724,238],[775,208,792,208,792,237,775,237],[815,204,831,203,831,234,815,235]]:place==='village'?[[88,273,101,269,101,285,88,289],[104,268,117,264,117,282,104,285],[120,264,134,260,134,278,120,282]]:
      [[368,110,385,108,385,143,368,146],[388,108,405,105,405,141,388,143]];
    ctx.save();ctx.globalCompositeOperation='screen';
    for(const corners of panes){
      ctx.fillStyle='rgba(255,172,69,'+(.57*evening)+')';ctx.beginPath();ctx.moveTo(corners[0],corners[1]);
      for(let i=2;i<corners.length;i+=2)ctx.lineTo(corners[i],corners[i+1]);
      ctx.closePath();ctx.fill();
    }
    const x=place==='homeLane'?778:place==='village'?114:390,y=place==='homeLane'?224:place==='village'?280:132;
    const glow=ctx.createRadialGradient(x,y,4,x,y,55);
    glow.addColorStop(0,'rgba(255,165,69,'+.30*evening+')');glow.addColorStop(1,'rgba(235,131,47,0)');
    ctx.fillStyle=glow;ctx.fillRect(x-55,y-55,110,110);ctx.restore();
  }
  return {visible,water,plank,handle,meal,offer,props,lamplight};
})();
