/* The courtyard has one physical garden entrance. The work surface lives inside it. */
(() => {
  'use strict';
  const L=(zh,en)=>deskText(zh,en);
  const fence=[[1227,566],[1406,524],[1501,712],[1333,775],[1243,691]].map(([x,y])=>[x*W/1536,y*H/1024]);
  const pictures={
    dry:'<path d="M8 1C7 4 3.4 7.2 3.4 10a4.6 4.6 0 0 0 9.2 0C12.6 7.2 9 4 8 1Z"/><path d="M5.8 10.3q.2 2 2.2 2"/>',
    ripe:'<path d="M2 8h12l-1.6 6H3.6L2 8Zm2.3-.3L8 2l3.7 5.7M6 10l.4 2m3.6-2-.4 2"/>',
    growing:'<path d="M8 14V7M8 9C3 9 2 6 2 4c4 0 6 1.7 6 5ZM8 7c0-4 2.5-5 6-5 0 3.7-1.8 6-6 6"/>',
    empty:'<path d="M2 13h12M4 10l2-1m4 1 2-1M9 4c1 1.5.3 3.5-1.6 4C6 6.8 6.3 5.3 9 4Z"/>',
    hard:'<path d="m4 13 7-9m-4-.5 4.3.5L14 7M2 14h5"/>',
    locked:'<rect x="3.5" y="7" width="9" height="7" rx="1.5"/><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2"/>'
  };
  const icon=key=>'<svg viewBox="0 0 16 16" aria-hidden="true">'+pictures[key]+'</svg>';
  const words=key=>({
    dry:L('待浇水','Water'),ripe:L('可采收','Harvest'),growing:L('生长中','Growing'),
    empty:L('可播种','Sow'),hard:L('待翻土','Till'),locked:L('未开垦','Unopened')
  })[key];
  const place=i=>i<4?L('菜畦','Bed ')+(i+1):L('药畦','Herb bed ')+(i-3);
  let usingKeys=false;
  function markInput(keys){
    if(usingKeys===keys)return;
    usingKeys=keys;document.querySelector('.garden-world')?.classList.toggle('garden-keys',keys);
  }
  window.addEventListener('keydown',e=>{if(['Tab','Enter',' ','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))markInput(true);},true);
  window.addEventListener('pointerdown',()=>markInput(false),true);
  function status(i){
    const s=state(),g=N.gardenPlot(s,i),c=N.crop(s,i);
    if(!s.flags.smallBed||i>=4&&!s.flags.fullGarden)return 'locked';
    if(c.ready)return 'ripe';
    if(c.planted)return g.watered?'growing':'dry';
    return i===0||g.tilled?'empty':'hard';
  }
  // The same four corners register the soil, plants and hit area on the new painting.
  const width=1536,height=1024;
  const beds=[
    [[318,192],[747,192],[739,339],[273,339]],
    [[798,192],[1221,192],[1262,339],[798,339]],
    [[249,379],[742,378],[737,532],[216,532]],
    [[799,379],[1273,378],[1321,532],[800,532]],
    [[202,581],[738,581],[731,790],[151,790]],
    [[800,581],[1329,581],[1391,790],[803,790]]
  ];
  const spriteRects=[
    [[61,105,136,88],[267,39,198,172],[509,10,247,210]],
    [[61,346,128,90],[274,297,194,173],[505,270,256,220]]
  ];
  Object.assign(NANLAN_DATA.assets,{gardenGround:'garden-ground-6118.webp',gardenPlants:'garden-plants-6118.webp'});
  function point(i,u,v){
    const [a,b,c,d]=beds[i];
    return [0,1].map(k=>(a[k]*(1-u)+b[k]*u)*(1-v)+(d[k]*(1-u)+c[k]*u)*v);
  }
  function bedPath(ctx,i){
    ctx.beginPath();
    beds[i].forEach(([x,y],j)=>j?ctx.lineTo(x,y):ctx.moveTo(x,y));
    ctx.closePath();
  }
  const roots=[[.22,.35],[.49,.36],[.79,.32],[.18,.83],[.50,.82],[.80,.84]];
  function paint(paper){
    const ctx=paper.getContext('2d'),s=state();
    const ground=images.gardenGround,plants=images.gardenPlants;
    if(!ground?.naturalWidth||!plants?.naturalWidth)return false;
    ctx.save();ctx.scale(paper.width/width,paper.height/height);
    ctx.drawImage(ground,0,0,width,height);
    if(window.NanlanScenery)NanlanScenery.environment(ctx,NanlanScenery.frame(s),true,width,height);
    for(let i=0;i<beds.length;i++){
      const k=status(i),g=N.gardenPlot(s,i),c=N.crop(s,i);
      if(k==='hard'||k==='locked'){
        bedPath(ctx,i);ctx.fillStyle=k==='hard'?'rgba(183,159,113,.24)':'rgba(125,129,80,.32)';ctx.fill();
        continue;
      }
      if(k==='empty')continue;
      if(g.watered){
        bedPath(ctx,i);ctx.fillStyle='rgba(54,43,28,.34)';ctx.fill();
      }
      const progress=g.watered?Math.min(1,Math.max(0,1-c.remaining/Math.max(1,g.duration))):0;
      const stage=k==='ripe'?2:progress>=.36?1:0;
      const [sx,sy,sw,sh]=spriteRects[g.kind==='herb'?1:0][stage];
      const depth=[.89,1,1.13][Math.floor(i/2)];
      for(let n=0;n<roots.length;n++){
        const [u,v]=roots[n],variation=Math.sin((i+3)*(n+1)*1.69);
        const [x,y]=point(i,u+variation*.037,v+variation*.066);
        const w=[50+progress*63,80+progress*34,123][stage]*depth*(n<3?.88:1)*(1+variation*.14);
        const h=w*sh/sw;
        ctx.save();ctx.translate(x,y);
        ctx.fillStyle='rgba(42,39,15,.24)';ctx.beginPath();ctx.ellipse(0,-1,w*.33,w*.07,-.09,0,2*Math.PI);ctx.fill();
        ctx.rotate(variation*.085);if((i+n)%3===1)ctx.scale(-1,1);
        ctx.drawImage(plants,sx,sy,sw,sh,-w*.5,-h,w,h);ctx.restore();
      }
    }
    ctx.restore();return true;
  }
  function show(initial=0){
    const gate=world.yard.objects.find(o=>o.id==='herbPlot');
    if(state().scene!=='yard'||!nearObject(gate))return;
    dialogObject=gate;
    activity(L('竹篱菜圃','The Kitchen Garden'),'','field-close');
    $('dialogPortraits').hidden=true;
    $('skip').textContent=L('‹ 回庭院','‹ Courtyard');
    const section=document.createElement('section'),board=document.createElement('div'),worldView=document.createElement('div'),paper=document.createElement('canvas');
    section.className='garden-inner';section.dataset.noLocalize='';
    board.className='field-beds garden-painting';board.setAttribute('role','group');board.setAttribute('aria-label',L('六畦菜药田','Six garden beds'));
    worldView.className='garden-world';worldView.classList.toggle('garden-keys',usingKeys);paper.width=width;paper.height=height;paper.setAttribute('aria-hidden','true');worldView.append(paper);window.NanlanWeatherPaint?.attach(worldView,'gardenClose',720,480);board.append(worldView);
    const header=document.createElement('div'),water=document.createElement('span'),stock=document.createElement('span');
    const foot=document.createElement('div'),guide=document.createElement('div');
    header.className='garden-stock';header.append(water,stock);foot.className='garden-foot';
    guide.className='garden-guide';guide.innerHTML='<span>'+icon('dry')+L('浇水','Water')+'</span><span>'+icon('ripe')+L('采收','Harvest')+'</span>';
    guide.title=L('点一畦照料，沿相邻田畦划动可连续操作。','Tap a bed to tend it, or sweep across adjacent beds.');
    const note=document.createElement('p'),actions=document.createElement('div');
    note.className='garden-note';note.setAttribute('role','status');note.id='fieldReceipt';actions.className='garden-options';
    foot.append(guide,note,header);section.append(board,foot,actions);$('panelExtra').append(section);
    let cursor=Math.max(0,Math.min(5,initial)),finger=null,last=null,stroke=null,held=false,origin=-1,moved=false;
    const tiles=[];
    const wateredThisVisit=new Set();
    function wateringReceipt(){
      const count=wateredThisVisit.size;
      return L('本次已浇透 '+count+' 畦','Watered '+count+(count===1?' bed':' beds')+' this visit');
    }
    const live=()=>section.isConnected&&!$('dialog').hidden&&dialogKind==='field-close'&&!document.hidden;
    const wet=()=>!!window.NanlanWeather?.helpsWater(state());
    function sync(){
      const s=state();
      water.textContent=wet()?L('檐下有雨 · 可借雨浇地','Rainwater available'):L('箍木桶　','Wooden bucket　')+(s.bucketWater||0)+'/'+N.bucketCapacity(s);
      stock.textContent=L('种子　','Seeds　')+N.available(s,'seed');
      tiles.forEach((b,i)=>{
        const k=status(i),g=N.gardenPlot(s,i);
        const crop=g.kind==='herb'?L('药草','Herbs'):g.kind==='vegetable'?L('青菜','Greens'):'';
        b.dataset.state=k;
        b.innerHTML='<span class="garden-pin" aria-hidden="true">'+icon(k)+'<b>'+words(k)+'</b></span>';
        const label=[place(i),crop,words(k)].filter(Boolean).join(' · ');
        b.setAttribute('aria-label',label);b.title=label;
      });
      return paint(paper);
    }
    function option(label,fn,tag,disabled=false){
      const b=document.createElement('button');b.type='button';b.textContent=label;b.dataset.action=tag;b.disabled=disabled;
      b.onclick=()=>{if(live()&&!b.disabled)fn();};actions.append(b);return b;
    }
    function route(label,scene,id){
      option(label,()=>{closeDialog();startNavigation(scene,id);},'field-go-'+id);
    }
    function work(name,i,kind,after){
      return perform(name,{plot:i,...(kind?{kind}:{}),fieldStroke:true},()=>{
        if(live()){sync();after?.();}
      });
    }
    function detail(i){
      actions.replaceChildren();const s=state(),k=status(i),g=N.gardenPlot(s,i),prefix=place(i)+' · ';
      if(k==='locked'){
        note.textContent=prefix+(!s.flags.smallBed?L('先清出通路，再备第一畦。','Clear a path before preparing the first bed.'):L('跟许青禾学过整药圃，就能扩出这两畦。','Learn to open the herb garden with Xu Qinghe.'));
      }else if(k==='growing'){
        const minutes=Math.ceil(N.crop(s,i).remaining);
        note.textContent=prefix+(g.kind==='herb'?L('药草','Herbs'):L('青菜','Greens'))+L(' · 土还湿，约 ',' · soil is damp, about ')+minutes+L(' 游戏分钟后可采。',' game minutes until harvest.');
        if(s.mode==='prologue')note.textContent+=L(' 家人吃过第一顿热饭，作物才开始计时。',' Growth begins after the first family meal.');
        if(s.mode==='daily'&&N.clock(s).minute>=1320)route(L('回卧房歇息','Go to bed'),'bed','bedRest');
      }else if(k==='empty'){
        const n=N.available(s,'seed');note.textContent=prefix+(n?L('选好种子再落土。','Choose what to sow.'):L('种袋空了，采收可留种。','The pouch is empty. Harvest a crop to save seed.'));
        const kinds=i>=4?['herb']:['vegetable',...(s.flags.fullGarden||s.choices.firstBed==='herb'?['herb']:[])];
        for(const kind of kinds)option(kind==='herb'?L('播药草 · 1 份种子','Sow herbs · 1 seed'):L('播青菜 · 1 份种子','Sow greens · 1 seed'),
          ()=>work('plant',i,kind,()=>{actions.replaceChildren();note.textContent=prefix+L('种子已入土，可以浇水了。','Seeds sown. This bed is ready for water.');}), 'field-sow-'+kind,!n);
        if(!n)route(L('去乡邻余粮补种','Visit the village pantry'),'village','villagePantry');
      }else if(k==='hard'){
        note.textContent=prefix+L('土还硬，翻松后才能播种。','Loosen the soil before sowing.');
        if(s.tools.hoe)option(L('用锄翻土 · 体力 2','Till · 2 stamina'),()=>{if(equipGardenHoe())work('tillPlot',i,null,()=>detail(i));},'field-till');
        else route(L('去仓房领锄','Collect the hoe'),'store','sickle');
      }else if(k==='dry'){
        note.textContent=prefix+L('泥土干了。','The soil is dry.');
      }else note.textContent=prefix+L('叶子已长足，可以采了。','This crop is ready to pick.');
    }
    function begin(i){
      cursor=i;origin=i;moved=false;actions.replaceChildren();
      const k=status(i);stroke={kind:k==='ripe'||k==='dry'?k:null,seen:new Set(),goods:{},blocked:false};
      if(stroke.kind)visit(i);
    }
    function visit(i){
      if(!live()||!stroke||stroke.blocked||stroke.seen.has(i)||status(i)!==stroke.kind)return;
      const batch=stroke,s=state();batch.seen.add(i);cursor=i;
      if(batch.kind==='dry'&&!wet()&&(!s.tools.water||!(s.bucketWater>0))){
        batch.blocked=true;
        const reason=s.tools.water?L('木桶空了，去水缸续水。','The bucket is empty. Refill it at the jar.'):L('先去仓房取木桶。','Collect the bucket from the storehouse.');
        note.textContent=(wateredThisVisit.size?wateringReceipt()+L('。','. '):'')+reason;
        if(s.tools.water)route(L('去水缸装水','Go to the water jar'),'yard','waterJar');else route(L('去仓房领木桶','Collect the bucket'),'store','water');return;
      }
      const before={...s.bag};
      void work(batch.kind==='dry'?'waterCrop':'harvest',i,null,()=>{
        const tile=tiles[i];tile.dataset.work=batch.kind;tile.classList.remove('field-done');void tile.offsetWidth;tile.classList.add('field-done');
        if(batch.kind==='dry'){wateredThisVisit.add(i);note.textContent=wateringReceipt();}
        else{
          const names={vegetable:L('青菜','Greens'),herb:L('鲜草药','Fresh herbs'),seed:L('留种','Seeds')};
          for(const id of Object.keys(names)){const n=(state().bag[id]||0)-(before[id]||0);if(n>0)batch.goods[id]=(batch.goods[id]||0)+n;}
          note.textContent=L('收进竹篓 · ','In the basket · ')+Object.entries(batch.goods).map(([id,n])=>names[id]+' ×'+n).join(' · ');
        }
      });
    }
    function finish(cancel=false){
      if(stroke&&!cancel&&!stroke.kind&&!moved&&live())detail(origin);
      stroke=null;finger=null;last=null;held=false;
    }
    function cross(i){if(i===null)return;if(i!==origin)moved=true;if(stroke?.kind)visit(i);}
    function trace(x,y){
      const from=last||[x,y],steps=Math.max(1,Math.ceil(Math.hypot(x-from[0],y-from[1])/8));
      for(let n=1;n<=steps;n++){
        const b=document.elementFromPoint(from[0]+(x-from[0])*n/steps,from[1]+(y-from[1])*n/steps)?.closest('[data-field]');
        if(b&&board.contains(b))cross(Number(b.dataset.field));
      }last=[x,y];
    }
    for(let i=0;i<6;i++){
      const b=document.createElement('button'),corners=beds[i];
      const xs=corners.map(p=>p[0]),ys=corners.map(p=>p[1]);
      const x=Math.min(...xs),y=Math.min(...ys),w=Math.max(...xs)-x,h=Math.max(...ys)-y;
      b.type='button';b.dataset.field=String(i);
      Object.assign(b.style,{left:x*100/width+'%',top:y*100/height+'%',width:w*100/width+'%',height:h*100/height+'%',
        clipPath:'polygon('+corners.map(([a,c])=>(a-x)*100/w+'% '+(c-y)*100/h+'%').join(',')+')'});
      b.onclick=e=>{if(e.detail===0&&live()){begin(i);finish();}};
      worldView.append(b);tiles.push(b);
    }
    board.onpointerdown=e=>{const b=e.target.closest('[data-field]');if(!live()||!b||finger!==null||!e.isPrimary||e.button!==0)return;
      e.preventDefault();finger=e.pointerId;board.setPointerCapture(finger);begin(Number(b.dataset.field));last=[e.clientX,e.clientY];};
    board.onpointermove=e=>{if(e.pointerId===finger)trace(e.clientX,e.clientY);};
    board.onpointerup=e=>{if(e.pointerId===finger){trace(e.clientX,e.clientY);finish();}};
    board.onpointercancel=board.onlostpointercapture=()=>{if(finger!==null)finish(true);};
    board.onfocusout=e=>{if(held&&!board.contains(e.relatedTarget))finish(true);};
    board.onkeydown=e=>{
      const b=e.target.closest('[data-field]');if(!b)return;const i=Number(b.dataset.field);
      const delta={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[e.key];
      if(delta){e.preventDefault();e.stopPropagation();const j=Math.max(0,Math.min(2,Math.floor(i/2)+delta[1]))*2+Math.max(0,Math.min(1,i%2+delta[0]));cursor=j;tiles[j].focus();if(held)cross(j);}
      else if(e.key===' '){e.preventDefault();e.stopPropagation();if(!held&&!e.repeat){held=true;begin(i);}}
    };
    board.onkeyup=e=>{if(held&&e.key===' '){e.preventDefault();e.stopPropagation();finish();}};
    if(window.NanlanScenery)void NanlanScenery.ready(state()).then(()=>{if(live())paint(paper);});
    if(!sync()){
      const loader=document.createElement('div'),msg=document.createElement('span'),again=document.createElement('button');
      loader.className='garden-loading';msg.setAttribute('role','status');again.type='button';again.hidden=true;
      again.textContent=L('重看田景','Reload garden');loader.append(msg,again);board.append(loader);
      worldView.inert=true;board.setAttribute('aria-busy','true');
      async function load(){
        again.hidden=true;msg.textContent=L('正推开篱门…','Opening the garden gate…');
        await Promise.all(['gardenGround','gardenPlants'].map(id=>loadImage(id,{retry:true})));
        if(!section.isConnected)return;
        if(paint(paper)){
          worldView.inert=false;board.removeAttribute('aria-busy');loader.remove();
          if(live()&&(document.activeElement===$('skip')||document.activeElement===document.body))tiles[cursor].focus({preventScroll:true});
        }else{msg.textContent=L('田景还没载好。','The garden could not load.');again.hidden=false;}
      }
      again.onclick=load;void load();
    }
    const s=state(),q=N.current(s);
    if(!s.flags.smallBed&&q==='M03'&&s.flags.pathCleared){
      for(const choice of ['vegetable','herb'])actButton(choice==='herb'?L('整理第一畦 · 种香草','Prepare the first herb bed'):L('整理第一畦 · 种青菜','Prepare the first vegetable bed'),'smallBed',{choice},()=>show(0),'field-prepare-'+choice);
    }
    if(q==='M07'&&!s.flags.fullGarden)actButton(L('扩整两块药畦','Open the two herb beds'),'expandGarden',{},()=>show(4),'field-expand');
    if(!s.flags.smallBed)detail(0);
    if(!worldView.inert)tiles[cursor].focus({preventScroll:true});
  }
  window.NanlanGardenView={show,fence};
})();
