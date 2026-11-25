/* Each crossed bed settles through the same saved action as a single tap. */
(() => {
  'use strict';
  const L = (zh, en) => deskText(zh, en);
  const rain = () => !!window.NanlanWeather?.helpsWater(state());
  const availableBeds = () => state().flags.fullGarden ? 6 : 4;
  const deltas = {ArrowLeft:[-1,0], ArrowRight:[1,0], ArrowUp:[0,-1], ArrowDown:[0,1]};
  const effects = new Map();
  let finger = null, held = null, cursor = 0;
  const stop = e => { e.preventDefault(); e.stopImmediatePropagation(); };
  function usable() {
    return state().scene === 'yard' && state().flags.smallBed && canWalk()
      && !window.NanlanSettings?.isOpen() && ['water','basket'].includes(state().selected);
  }
  function newStroke() {
    return {tool:state().selected, seen:new Set(), count:0, goods:{}, dry:false, failed:false};
  }
  function visit(stroke, i) {
    const closeView=dialogKind==='field-close' && !$('dialog').hidden && !document.hidden;
    if (stroke.failed || stroke.seen.has(i) || i < 0 || i >= availableBeds() || (!usable() && !closeView)
        || state().selected !== stroke.tool || !nearObject(gardenTarget(i))) return;
    stroke.seen.add(i);
    const s=state(), crop=N.crop(s,i), plot=N.gardenPlot(s,i);
    if (!crop.planted) return;
    const water = stroke.tool === 'water';
    if (water && plot.watered || !water && !crop.ready) return;
    if (water && !rain() && !s.bucketWater) { stroke.dry=true; return; }
    const before = {...s.bag};
    stroke.failed=true;
    void perform(water?'waterCrop':'harvest', {plot:i,fieldStroke:true}, () => {
      stroke.failed=false;
      stroke.count++;
      effects.set(i, {at:performance.now(), water, kind:plot.kind});
      for (const item of ['vegetable','herb','seed']) {
        const gain=(state().bag[item]||0)-(before[item]||0);
        if (gain>0) stroke.goods[item]=(stroke.goods[item]||0)+gain;
      }
    });
  }
  function receipt(stroke) {
    const line=dialogKind==='field-close' && !$('dialog').hidden && $('fieldReceipt');
    if (!stroke || stroke.failed || (!line && (!active || !$('dialog').hidden)) || state().scene!=='yard') return;
    const say=text=>{if(line)line.textContent=text;else notice(text);};
    const dry=L('桶空了，去水缸续水。','The bucket is empty. Refill it at the jar.');
    if (!stroke.count) {
      say(stroke.dry?dry:stroke.tool==='water'?L('只需浇刚播下、土还干的畦。','Water the dry, newly sown beds.'):L('这几畦还没有熟透的作物。','These beds have nothing ripe yet.'));
      return;
    }
    const names={vegetable:L('青菜','Greens'),herb:L('鲜草药','Fresh herbs'),seed:L('留种','Seeds')};
    const items=Object.entries(stroke.goods).map(([id,n])=>names[id]+' ×'+n).join(' · ');
    const waterLeft=rain()?L('借了檐雨','Rainwater'):L('桶中余水 ','Water left ')+(state().bucketWater||0);
    say(stroke.tool==='basket'?L('收进竹篓 · ','In the basket · ')+items:
      L('浇透 ','Watered ')+stroke.count+L(' 畦 · ',' beds · ')+(stroke.dry?dry:waterLeft));
  }
  function bedAt(p) {
    return NanlanGardenLayout.beds.slice(0,availableBeds()).findIndex(b=>NanlanGardenLayout.contains(p,b));
  }
  function cross(f, index) {
    if (index<0 || f.route.includes(index)) return;
    f.route.push(index);
    if (f.near) visit(f.stroke,index);
  }
  function trace(f,e) {
    const end=worldPoint(e), from=f.last;
    const steps=Math.max(1, Math.ceil(Math.hypot(end.x-from.x,end.y-from.y)/7));
    for (let n=1;n<=steps;n++) cross(f,bedAt({x:from.x+(end.x-from.x)*n/steps,y:from.y+(end.y-from.y)*n/steps}));
    f.last=end;
  }
  canvas.addEventListener('pointerdown', e=>{
    if (finger || !e.isPrimary || e.button!==0 || !usable()) return;
    const p=worldPoint(e), i=bedAt(p);
    if (i<0) return;
    stop(e); touchWalk.cancel(); cancelNavigation(); path=[]; keys={};
    canvas.setPointerCapture(e.pointerId);
    finger={id:e.pointerId,last:p,near:nearObject(gardenTarget(i)),route:[],stroke:newStroke()};
    cursor=i; cross(finger,i);
  },true);
  canvas.addEventListener('pointermove', e=>{
    if (finger?.id!==e.pointerId) return;
    stop(e); trace(finger,e);
  },true);
  function release(e, cancelled) {
    if (finger?.id!==e.pointerId) return;
    const f=finger; finger=null; stop(e);
    if (!cancelled) trace(f,e);
    if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
    if (cancelled || !usable() || f.stroke.tool!==state().selected) return;
    if (f.near) receipt(f.stroke);
    else if(f.route.length===1) approach(gardenTarget(f.route[0]));
    else approach({...gardenTarget(f.route[0]),action:'fieldStroke',route:f.route,tool:f.stroke.tool});
  }
  canvas.addEventListener('pointerup',e=>release(e,false),true);
  canvas.addEventListener('pointercancel',e=>release(e,true),true);
  canvas.addEventListener('lostpointercapture',e=>{if(finger?.id===e.pointerId)finger=null;});
  function arrive(o) {
    if (!usable() || o.tool!==state().selected || !nearObject(o)) return;
    const stroke=newStroke(); for(const i of o.route) visit(stroke,i); receipt(stroke);
  }
  function nextBed(i, key) {
    const [dx,dy]=deltas[key];
    return Math.max(0,Math.min(availableBeds()/2-1,Math.floor(i/2)+dy))*2+Math.max(0,Math.min(1,i%2+dx));
  }
  function keyboard(e) {
    if (e.altKey||e.ctrlKey||e.metaKey||!usable()||!nearObject(gardenTarget(0))) {held=null;return;}
    if(e.key===' '){
      stop(e);
      if(!e.repeat && !held){touchWalk.cancel();path=[];keys={};cancelNavigation();held=newStroke();cursor=Math.min(cursor,availableBeds()-1);visit(held,cursor);}
    }else if(held && deltas[e.key]){
      stop(e); cursor=nextBed(cursor,e.key); visit(held,cursor);
    }else if(held){receipt(held);held=null;}
  }
  window.addEventListener('keydown', keyboard, true);
  window.addEventListener('keyup',e=>{if(held && e.key===' '){stop(e);const stroke=held;held=null;receipt(stroke);}},true);
  function reset(){held=null;finger=null;effects.clear();}
  window.addEventListener('blur',reset);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)reset();});
  function draw(t) {
    if(state().scene!=='yard'){reset();return;}
    if(!active){held=null;finger=null;}
    const edge = i => {
      ctx.beginPath(); NanlanGardenLayout.beds[i].forEach(([x,y],n)=>n?ctx.lineTo(x,y):ctx.moveTo(x,y)); ctx.closePath();
    };
    ctx.save();
    if(held){edge(cursor);ctx.strokeStyle='#f7da89';ctx.lineWidth=2/camera.scale;ctx.stroke();}
    for(const [i,fx] of effects){
      const age=(t-fx.at)/900;
      if(age>=1){effects.delete(i);continue;}
      const [x,y]=gardenSpots[i];ctx.globalAlpha=Math.max(0,1-age);ctx.lineWidth=1.5;
      if(fx.water){
        edge(i);ctx.fillStyle='#436679';ctx.globalAlpha=.28*(1-age);ctx.fill();ctx.globalAlpha=1-age;
        ctx.strokeStyle='#cdf1ed';
        for(let j=-1;j<=1;j++){ctx.beginPath();ctx.moveTo(x+j*8-3,y-22+age*11);ctx.lineTo(x+j*8,y-10+age*10);ctx.stroke();}
        ctx.beginPath();ctx.ellipse(x,y,3+age*13,2+age*3,-.2,0,Math.PI*2);ctx.stroke();
      }else{
        ctx.save();ctx.translate(x+12*age,y-20*age);ctx.rotate(.3*age);
        for(let j=-1;j<=1;j++){ctx.fillStyle=fx.kind==='herb'?'#83935c':'#57804a';ctx.beginPath();ctx.ellipse(j*3,-5,3,7,j*.55,0,Math.PI*2);ctx.fill();}
        ctx.restore();
      }
    }
    ctx.restore();
  }
  function show() {
    if(state().scene!=='yard'||!state().flags.smallBed||!nearObject(gardenTarget(0)))return;
    activity(L('田边 · 理畦','At the garden fence'),L('选木桶或竹篓，点一畦或划过相邻几畦。用方向键选畦，按住空格可以一路做过去。','Choose the bucket or basket. Tap a bed or sweep across several. With the arrow keys, hold Space to work along a row.'),'field-close');
    const bar=document.createElement('div'), board=document.createElement('div'), line=document.createElement('p');
    bar.className='field-tools';board.className='field-beds';bar.dataset.noLocalize='';board.dataset.noLocalize='';line.className='pond-note';line.id='fieldReceipt';
    line.setAttribute('role','status');line.dataset.noLocalize='';
    if(!['water','basket'].includes(state().selected))state().selected=state().tools.water?'water':'basket';
    let stroke=null, id=null, last=null, keyHeld=false;
    function sync(){
      for(const b of bar.children){
        const wet=b.dataset.tool==='water';
        const title=wet?L('木桶 ','Bucket ')+(state().bucketWater||0)+'/'+(state().mode==='daily'?3:1):L('竹背篓','Basket');
        b.lastElementChild.textContent=title;
        b.setAttribute('aria-pressed',String(b.dataset.tool===state().selected));
      }
      for(const [i,b] of Array.from(board.children).entries()){
        const g=N.gardenPlot(state(),i),c=N.crop(state(),i);
        const label=c.ready?L('可采','Ripe'):c.planted?(g.watered?L('润土','Watered'):L('待浇','Dry')):L('空畦','Empty');
        b.innerHTML=plotArt(i)+'<span>'+ (i<4?L('菜','Bed ')+(i+1):L('药','Herb ')+(i-3))+' · '+label+'</span>';
        b.setAttribute('aria-label',b.textContent);b.dataset.ripe=String(c.ready);
      }
    }
    function choose(i){
      if(!stroke||i<0||stroke.seen.has(i))return;
      cursor=i;const count=stroke.count;visit(stroke,i);
      if(stroke.count!==count){sync();receipt(stroke);const b=board.children[i];b.dataset.work=stroke.tool;b.classList.remove('worked');void b.offsetWidth;b.classList.add('worked');}
    }
    function finish(){if(stroke)receipt(stroke);stroke=null;id=null;last=null;keyHeld=false;}
    for(const tool of ['water','basket']){
      const b=document.createElement('button');b.type='button';b.dataset.tool=tool;b.disabled=!state().tools[tool];
      b.innerHTML='<i aria-hidden="true">'+toolbarArt(tool)+'</i><span></span>';
      b.onclick=()=>{finish();state().selected=tool;refreshToolbar();sync();};bar.append(b);
    }
    for(let i=0;i<availableBeds();i++){
      const b=document.createElement('button');b.dataset.field=String(i);b.type='button';
      b.onclick=e=>{if(e.detail===0){stroke=newStroke();choose(i);finish();}};
      board.append(b);
    }
    function traceBoard(x,y){
      const from=last||[x,y],steps=Math.max(1,Math.ceil(Math.hypot(x-from[0],y-from[1])/10));
      for(let n=1;n<=steps;n++){
        const target=document.elementFromPoint(from[0]+(x-from[0])*n/steps,from[1]+(y-from[1])*n/steps)?.closest('[data-field]');
        if(target&&board.contains(target))choose(Number(target.dataset.field));
      }
      last=[x,y];
    }
    board.onpointerdown=e=>{if(id!==null||e.button!==0||!e.isPrimary||!e.target.closest('[data-field]'))return;
      e.preventDefault();id=e.pointerId;board.setPointerCapture(id);stroke=newStroke();last=null;traceBoard(e.clientX,e.clientY);};
    board.onpointermove=e=>{if(e.pointerId===id)traceBoard(e.clientX,e.clientY);};
    board.onpointerup=e=>{if(id===e.pointerId){traceBoard(e.clientX,e.clientY);finish();}};
    board.onpointercancel=board.onlostpointercapture=()=>{if(id!==null)finish();};
    board.onfocusout=e=>{if(keyHeld&&!board.contains(e.relatedTarget))finish();};
    board.onkeydown=e=>{
      const tile=e.target.closest('[data-field]');if(!tile)return;
      const i=Number(tile.dataset.field);
      if(deltas[e.key]){stop(e);const next=nextBed(i,e.key);board.children[next].focus();if(keyHeld)choose(next);}
      else if(e.key===' '){stop(e);if(!keyHeld&&!e.repeat){keyHeld=true;stroke=newStroke();choose(i);}}
    };
    board.onkeyup=e=>{if(keyHeld&&e.key===' '){stop(e);finish();}};
    $('panelExtra').append(bar,board,line);sync();
    button(L('收起农具','Leave the beds'),()=>closeDialog(),'field-leave',true,false);
    board.children[Math.min(cursor,availableBeds()-1)].focus({preventScroll:true});
  }
  window.NanlanFieldwork={arrive,draw,show};
})();
