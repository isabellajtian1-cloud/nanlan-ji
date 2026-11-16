window.NanlanHearthUI = (() => {
  'use strict';
  const H=NanlanHearth;
  const L=(zh,en)=>window.NanlanI18n.language==='en' ? en : zh;
  const words=pair=>L(...pair);
  const ingredient=id=>words(H.ingredients[id]);
  const recipeName=(dish,entry)=>entry?.name||words(dish.title);
  const sources={
    rice:['南澜村 · 乡邻余粮','Village pantry'], vegetable:['庭院 · 自家菜畦','Courtyard vegetable beds'],
    shoot:['山间 · 采笋','Gather on the mountain'], mushroom:['山间 · 采菌','Gather on the mountain'],
    clam:['海湾 · 退潮时拾取','Gather on the coast at low tide'], seaweed:['海湾 · 岸边采集','Gather along the coast'],
    pondFish:['庭院 · 养成后起塘','Harvest from your fishpond'], longan:['山脚 · 龙眼树','Longan tree at the foothill']
  };
  function source(id) {
    if (Object.hasOwn(H.pantry,id)) return L('南澜村 · 乡邻余粮，每份 '+H.pantry[id]+' 文','Village pantry · '+H.pantry[id]+' coins per portion');
    return words(sources[id]);
  }
  function node(tag,cls,text) {
    const n=document.createElement(tag); n.className=cls;
    if (text!==undefined) n.textContent=text;
    return n;
  }
  function control(host,label,run) {
    const b=node('button','hearth-chip',label); b.type='button'; b.onclick=run; host.append(b); return b;
  }
  function panel(title,line) {
    activity(title,line,'v3-hearth');
    const board=node('div','hearth-board'); board.dataset.noLocalize=''; $('panelExtra').append(board); return board;
  }
  function scene(board,frame) {
    const figure=node('div','hearth-picture'); figure.dataset.frame=String(frame);
    figure.setAttribute('aria-hidden','true'); board.append(figure);
  }
  function stoveLinks() {
    navButton(L('添料试菜','Experiment at the hearth'),()=>draft(),'hearth-draft');
    navButton(L('翻开灶边食谱簿','Open the kitchen notebook'),()=>book(true),'hearth-book');
  }
  function bagLink() {
    navButton(L('灶边食谱簿 · 查看饭菜','Kitchen notebook · Packed dishes'),()=>book(false),'hearth-bag');
  }
  function missing(method,foods) {
    const problem=H.problem(method,foods);
    if(problem) return words(problem);
    const s=state();
    const absent=foods.filter(id=>N.available(s,id)<1).map(ingredient);
    if(N.available(s,'wood')<1) absent.push(L('枯枝（村边可拾）','firewood (village paths)'));
    if(!(s.bucketWater>=1)) absent.push(L('一桶水（庭院水缸）','a bucket of water (courtyard jar)'));
    return absent.length ? L('还缺：','Still needed: ')+absent.join(L('、',', ')) : '';
  }
  function draft(method='porridge', selected=[]) {
    const foods=[...selected];
    const board=panel(L('灶边 · 添料试菜','Experiment at the hearth'),
      L('母亲把木勺递过来：「你掌灶。米收干了就是饭，多添水慢慢熬，滋味又不同。」','Mother hands you the ladle. “Your turn. Let the rice absorb the water for a firm bowl, or simmer it slowly for congee.”'));
    const methodRow=node('div','hearth-methods'); board.append(methodRow);
    const methodButtons={};
    for(const [id,label] of Object.entries(H.methods)) {
      methodButtons[id]=control(methodRow,words(label),()=>{method=id; update();});
    }
    const pot=node('div','hearth-pot');
    const title=node('strong','',L('锅中食材','In the pot'));
    const contents=node('span','hearth-pot-items'); pot.append(title,contents); board.append(pot);
    const basket=node('div','hearth-basket'); board.append(basket);
    const buttons={};
    for(const id of Object.keys(H.ingredients).filter(id=>N.available(state(),id)>0 || foods.includes(id))) {
      const b=control(basket,'',()=>{
        if(foods.includes(id)) foods.splice(foods.indexOf(id),1);
        else if(foods.length<4) foods.push(id);
        update();
      });
      b.dataset.food=id;
      const icon=inventoryArt(id);
      if(icon){const iconBox=node('span','hearth-icon');iconBox.innerHTML=icon;b.append(iconBox);}
      b.append(node('span','',ingredient(id)+' ×'+N.available(state(),id)));
      buttons[id]=b;
    }
    const info=node('details','hearth-sources'),sum=node('summary','',L('问问食材从哪里来','Where to find ingredients'));
    const list=node('ul',''); for(const id of Object.keys(H.ingredients)) list.append(node('li','',ingredient(id)+' · '+source(id)));
    info.append(sum,list); board.append(info);
    const status=node('p','hearth-status'); status.setAttribute('aria-live','polite'); board.append(status);
    const start=button(L('备料起火','Prepare the pot'),()=>prepare(method,foods),'hearth-prepare',false,false);
    navButton(L('回到灶台','Back to the stove'),showCook,'hearth-back');
    function update() {
      for(const [id,b] of Object.entries(methodButtons)) b.setAttribute('aria-pressed',String(method===id));
      for(const [id,b] of Object.entries(buttons)) {
        b.setAttribute('aria-pressed',String(foods.includes(id)));
        b.disabled=(!foods.includes(id)&&foods.length>=4)||N.available(state(),id)<1&&!foods.includes(id);
      }
      contents.replaceChildren();
      if(!foods.length) contents.textContent=L('点选行囊里的食材，最多四味','Choose up to four ingredients from your satchel');
      for(const id of foods) {
        const bit=node('span','hearth-pot-food'),art=node('span','hearth-icon');
        art.innerHTML=inventoryArt(id);bit.append(art,document.createTextNode(ingredient(id)));contents.append(bit);
      }
      const lack=missing(method,foods);
      const supply=L('每味取一份，另用枯枝一份、水一桶。','One portion of each ingredient, one bundle of wood and one bucket of water.');
      status.textContent=lack ? lack+' '+supply : supply;
      start.disabled=!!lack;
    }
    update();
  }
  const preparation={
    redBean:['把赤豆先煮软','Soften the beans first'], fishDry:['煮软海鲞，拆骨分丝','Soften, bone and flake the dried fish'],
    cane:['压取蔗浆，滤去粗渣','Press the cane and strain the juice'], chestnut:['剥熟栗，揉碎栗肉','Peel and crumble the cooked chestnuts'],
    clam:['淘洗蛤蜊，拣净沙粒','Rinse the clams free of grit'], pondFish:['剔去鱼刺，顺纹分片','Bone and flake the fish'],
    shoot:['剥笋焯透，切成薄片','Peel, parboil and slice the shoots'], mushroom:['洗净菌伞，顺纹撕开','Clean and tear the mushroom caps'],
    longan:['剥壳去核，留下果肉','Shell and pit the longan'], vegetable:['洗净菜叶，切成细丝','Wash and shred the greens'],
    seaweed:['漂净海藻，剪成小段','Rinse and trim the sea greens'], ginger:['刮去姜皮，切成细丝','Peel and sliver the ginger'],
    rice:['淘净米粒，沥去浑水','Wash the rice and drain the cloudy water']
  };
  const stirs={
    broth:['汤面已开，撇沫收小火','Skim the broth and lower the fire'],
    ricepot:['水声渐轻，收柴盖焖','Draw back the wood and cover the rice'],
    porridge:['米粒绽开，贴锅底慢搅','Stir the opening grains along the bottom']
  };
  function prepare(method,selection) {
    const foods=[...selection],dish=H.describe(method,foods),sequence=state().revision;
    const board=panel(words(H.methods[method]),foods.map(ingredient).join(' · '));
    scene(board,0);
    const desc=node('p','hearth-status'); desc.setAttribute('aria-live','polite'); board.append(desc);
    const lead=Object.keys(preparation).find(id=>foods.includes(id));
    let phase=0;
    const cues=[words(preparation[lead]),words(stirs[method]),L('盛碗 · 扣料并记方','Serve, use ingredients and record')];
    const lines=[
      L('先备好这一味，再合锅。','Prepare this ingredient before combining the pot.'),
      L('锅沿冒出热气，现在照看火候。','Steam curls over the rim. Tend the fire.'),
      L('可以起锅了。盛碗用掉所选各一份、枯枝一份和一桶水。','Ready to serve. Serving uses one of each selected ingredient, one wood and one bucket of water.')
    ];
    const step=button(cues[0],async event=>{
      if(event?.detail>1) return;
      if(phase<2) {
        window.NanlanAudio?.play(phase===0?'water':'riceLid');
        phase++; board.querySelector('.hearth-picture').dataset.frame=String(phase);
        step.textContent=cues[phase]; desc.textContent=lines[phase]; return;
      }
      const first=!state().hearthBook?.[dish.id];
      return perform('hearthCook',{method,foods,sequence},()=>detail(dish.id,true,first?'new':'again'));
    },'hearth-step',false,false);
    desc.textContent=lines[0];
    navButton(L('改配食材','Change ingredients'),()=>draft(method,foods),'hearth-change');
  }
  function book(atStove) {
    const entries=Object.entries(state().hearthBook||{});
    const board=panel(L('灶边食谱簿','Kitchen notebook'), entries.length ?
      L('翻到一页，可看用料、余下的碗数与记下它的日子。','Open a page to see its ingredients, packed portions and first cooking day.') :
      L('第一页还空着。母亲在页角写了一句：「赤豆要先煮软，才好往米里合。」','The first page is blank except for a note from Mother: “Soften the red beans before they meet the rice.”'));
    const list=node('div','hearth-pages'); board.append(list);
    for(const [id,r] of entries.reverse()) {
      const {method,foods}=H.unpack(id), dish=H.describe(method,foods);
      const b=control(list,recipeName(dish,r),()=>detail(id,atStove));
      b.dataset.recipe=id;
      b.append(node('small','',words(H.methods[method])+' · '+L('余 '+r.left+' 碗',r.left+' packed')));
    }
    if(atStove) navButton(L('另试一锅','Try a new pot'),()=>draft(),'hearth-draft');
    navButton(atStove?L('回到灶台','Back to the stove'):L('回到行囊','Back to the satchel'),atStove?showCook:showBag,'hearth-back');
  }
  function detail(id,atStove,outcome='') {
    const r=state().hearthBook[id],{method,foods}=H.unpack(id),dish=H.describe(method,foods);
    const board=panel(L('灶边食谱簿','Kitchen notebook'), outcome==='new'?L('新方落笔 · 已盛好一碗','New recipe recorded · One bowl packed'):
      outcome==='again'?L('又做成一锅 · 已盛好一碗','Recipe cooked again · One bowl packed'):L('家中手记','A page from the household notebook'));
    const page=node('article','hearth-page'); board.append(page);
    const mark=node('span','hearth-art hearth-art-hearthServing'); mark.setAttribute('aria-hidden','true');page.append(mark);
    page.append(node('small','hearth-origin',dish.old?L('明代食书记载','Recorded in a Ming text'):L('南澜私房 · 玩家试方','Nanlan household invention')),
      node('h3','',recipeName(dish,r)),node('p','hearth-ingredients',words(H.methods[method])+' · '+foods.map(ingredient).join('、').replaceAll('、',L('、',', '))),
      node('p','hearth-taste',words(dish.taste)));
    if(dish.old) page.append(node('p','hearth-citation',L('方见明代高濂《遵生八笺》卷十一「粥糜类」· '+dish.title[0]+'。','Adapted from Gao Lian’s Ming-era Eight Discourses on Nurturing Life, vol. 11, congee section · '+dish.title[1]+'.')));
    page.append(node('p','hearth-count',L('初记于第 '+r.day+' 日 · 做过 '+r.made+' 锅 · 行囊余 '+r.left+' 碗','First made on Day '+r.day+' · '+r.made+' pots cooked · '+r.left+' bowls packed')));
    const naming=node('details','hearth-sources'); naming.append(node('summary','',L('给自家这道菜题名','Name your version')));
    const field=node('input','hearth-name'); field.type='text'; field.value=r.name; field.placeholder=words(dish.title);
    field.setAttribute('aria-label',L('自题菜名，最多二十四字','Your dish name, up to 24 characters'));
    naming.append(field); const seq=state().revision;
    control(naming,L('落款','Save name'),()=>perform('hearthName',{id,name:field.value,sequence:seq},()=>detail(id,atStove)));
    page.append(naming);
    if(atStove) navButton(L('照此方再备一锅','Prepare this recipe again'),()=>draft(method,foods),'hearth-repeat');
    const eat=button(L('吃一碗 · 恢复最多 30 体力','Eat a bowl · Restore up to 30 stamina'),()=>perform('hearthEat',{id,sequence:seq},()=>detail(id,atStove)),'hearth-eat',true,false);
    eat.disabled=r.left<1 || state().stamina>=100;
    if(eat.disabled) eat.textContent=r.left<1?L('这道菜已经吃完','No portions left'):L('体力已满 · 留在行囊里','Stamina full · Keep it packed');
    navButton(L('翻回食谱目录','Back to the recipe index'),()=>book(atStove),'hearth-index');
    if(atStove) navButton(L('另试一锅','Try a new pot'),()=>draft(),'hearth-draft');
  }
  const dict=window.NANLAN_EN;
  for(const names of Object.values(H.ingredients)) if(!dict[names[0]]) dict[names[0]]=names[1];
  dict['灶上饭菜']='Packed hearth dishes';
  for(const [zh,en] of [
    ['请先到庭院水缸装水。','Fill your bucket at the courtyard water jar.'],
    ['手边的记录已变，请重新核对。','The record has changed. Open the page again.'],
    ['菜名最多二十四字。','Choose a name of up to 24 characters.']
  ]) dict[zh]=en;
  window.NanlanI18n.configure(dict);
  return {stoveLinks,bagLink,source};
})();
