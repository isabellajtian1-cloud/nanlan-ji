/* The courtyard has one physical garden entrance. The work surface lives inside it. */
(() => {
  'use strict';
  const L=(zh,en)=>deskText(zh,en);
  const layout=NanlanGardenLayout;
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
  function status(i){
    const s=state(),g=N.gardenPlot(s,i),c=N.crop(s,i);
    if(!s.flags.smallBed||i>=4&&!s.flags.fullGarden)return 'locked';
    if(c.ready)return 'ripe';
    if(c.planted)return g.watered?'growing':'dry';
    return i===0||g.tilled?'empty':'hard';
  }
  // Frame the existing courtyard painting and register controls in the same coordinates.
  const width=560,height=460;
  function view(x,y){
    return [(x*1536/W-1223)*2,(y*1024/H-538)*2];
  }
  const [tx,ty]=view(0,0),[xx,xy]=view(1,0),[yx,yy]=view(0,1);
  const centers=layout.centers.map(p=>view(...p));
  function paint(paper){
    const ctx=paper.getContext('2d'),s=state();
    const key=window.NanlanEstateUI?.backdrop(s,'yard',world.yard.asset)||world.yard.asset;
    const yard=images[key]||images[world.yard.asset],atlas=images.gardenStages;
    ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#8a8661';ctx.fillRect(0,0,width,height);
    ctx.setTransform(xx-tx,xy-ty,yx-tx,yy-ty,tx,ty);
    ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
    if(yard?.naturalWidth)ctx.drawImage(yard,0,0,W,H);
    for(let i=0;i<6;i++){
      const k=status(i);
      if(atlas?.naturalWidth&&['empty','hard','dry'].includes(k)){
        const bounds=layout.bounds(i);
        const layer=document.createElement('canvas');
        layer.width=Math.ceil(bounds.w*3);layer.height=Math.ceil(bounds.h*3);
        const soil=layer.getContext('2d');soil.setTransform(3,0,0,3,-3*bounds.x,-3*bounds.y);
        const frame=k==='hard'?[1,0]:plotFrame(i);
        layout.draw(soil,atlas,frame[0],frame[1],i);
        // Feather worked earth into the painted bed, keeping its original rim and fence.
        soil.setTransform(layer.width,0,0,layer.height,0,0);
        soil.globalCompositeOperation='destination-in';
        const mask=soil.createRadialGradient(.5,.5,.22,.5,.5,.55);
        mask.addColorStop(0,'#000');mask.addColorStop(1,'transparent');
        soil.fillStyle=mask;soil.fillRect(0,0,1,1);
        ctx.drawImage(layer,bounds.x,bounds.y,bounds.w,bounds.h);
      }
      if(k==='growing'){
        const bed=layout.beds[i];ctx.beginPath();bed.forEach(([x,y],j)=>j?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();
        ctx.fillStyle='rgba(43,69,62,.12)';ctx.fill();
      }
    }
  }
  function show(initial=0){
    const gate=world.yard.objects.find(o=>o.id==='herbPlot');
    if(state().scene!=='yard'||!nearObject(gate))return;
    dialogObject=gate;
    activity(L('竹篱菜圃','The Kitchen Garden'),L('点水滴浇水，点竹篮采收。同一种活可以沿畦划过去。','Tap a drop to water or a basket to harvest. Sweep across beds to repeat the same action.'),'field-close');
    $('dialogPortraits').hidden=true;
    const section=document.createElement('section'),board=document.createElement('div'),paper=document.createElement('canvas');
    section.className='garden-inner';section.dataset.noLocalize='';
    board.className='field-beds garden-painting';board.setAttribute('role','group');board.setAttribute('aria-label',L('六畦菜药田','Six garden beds'));
    paper.width=width;paper.height=height;paper.setAttribute('aria-hidden','true');board.append(paper);
    const header=document.createElement('div'),water=document.createElement('span'),stock=document.createElement('span');
    header.className='garden-stock';header.append(water,stock);
    const note=document.createElement('p'),actions=document.createElement('div');
    note.className='garden-note';note.setAttribute('role','status');note.id='fieldReceipt';actions.className='garden-options';
    section.append(header,board,note,actions);$('panelExtra').append(section);
    let cursor=Math.max(0,Math.min(5,initial)),finger=null,last=null,stroke=null,held=false,origin=-1,moved=false;
    const tiles=[];
    const live=()=>section.isConnected&&!$('dialog').hidden&&dialogKind==='field-close'&&!document.hidden;
    const wet=()=>!!window.NanlanWeather?.helpsWater(state());
    function sync(){
      const s=state();
      water.textContent=wet()?L('檐下有雨 · 可借雨浇地','Rainwater available'):L('木桶　','Bucket　')+(s.bucketWater||0)+'/'+(s.mode==='daily'?3:1);
      stock.textContent=L('种子　','Seeds　')+N.available(s,'seed');
      tiles.forEach((b,i)=>{
        const k=status(i),g=N.gardenPlot(s,i);
        const crop=g.kind==='herb'?L('药草','Herbs'):g.kind==='vegetable'?L('青菜','Greens'):'';
        b.dataset.state=k;
        b.innerHTML='<span>'+icon(k)+'<b>'+words(k)+'</b></span>';
        const label=[place(i),crop,words(k)].filter(Boolean).join(' · ');
        b.setAttribute('aria-label',label);b.title=label;
      });
      paint(paper);
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
      const k=status(i);stroke={kind:k==='ripe'||k==='dry'?k:null,seen:new Set(),count:0,goods:{},blocked:false};
      if(stroke.kind)visit(i);
    }
    function visit(i){
      if(!live()||!stroke||stroke.blocked||stroke.seen.has(i)||status(i)!==stroke.kind)return;
      const batch=stroke,s=state();batch.seen.add(i);cursor=i;
      if(batch.kind==='dry'&&!wet()&&(!s.tools.water||!(s.bucketWater>0))){
        batch.blocked=true;
        const reason=s.tools.water?L('木桶空了，去水缸续水。','The bucket is empty. Refill it at the jar.'):L('先去仓房取木桶。','Collect the bucket from the storehouse.');
        note.textContent=(batch.count?L('已浇 ','Watered ')+batch.count+L(' 畦。',' beds. '):'')+reason;
        if(s.tools.water)route(L('去水缸装水','Go to the water jar'),'yard','waterJar');else route(L('去仓房领木桶','Collect the bucket'),'store','water');return;
      }
      const before={...s.bag};
      void work(batch.kind==='dry'?'waterCrop':'harvest',i,null,()=>{
        batch.count++;
        const tile=tiles[i];tile.classList.remove('field-done');void tile.offsetWidth;tile.classList.add('field-done');
        if(batch.kind==='dry'){note.textContent=L('已浇透 ','Watered ')+batch.count+L(' 畦',batch.count===1?' bed':' beds');}
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
      const b=document.createElement('button'),[x,y]=centers[i];b.type='button';b.dataset.field=String(i);
      b.style.left=(x*100/width)+'%';b.style.top=(y*100/height)+'%';
      b.onclick=e=>{if(e.detail===0&&live()){begin(i);finish();}};
      board.append(b);tiles.push(b);
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
    sync();
    if(!images.gardenStages?.naturalWidth)void loadImage('gardenStages',{passive:true}).then(()=>{if(live())paint(paper);});
    const s=state(),q=N.current(s);
    if(!s.flags.smallBed&&q==='M03'&&s.flags.pathCleared){
      for(const choice of ['vegetable','herb'])actButton(choice==='herb'?L('整理第一畦 · 种香草','Prepare the first herb bed'):L('整理第一畦 · 种青菜','Prepare the first vegetable bed'),'smallBed',{choice},()=>show(0),'field-prepare-'+choice);
    }
    if(q==='M07'&&!s.flags.fullGarden)actButton(L('扩整两块药畦','Open the two herb beds'),'expandGarden',{},()=>show(4),'field-expand');
    if(!s.flags.smallBed)detail(0);
    button(L('回到庭院','Return to the courtyard'),()=>closeDialog(),'field-leave',true,false);
    tiles[cursor].focus({preventScroll:true});
  }
  window.NanlanGardenView={show,fence};
})();
