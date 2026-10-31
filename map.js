/* Every planned scene and local place is visible; story gates still apply. */
const mapPositions={
  gate:[190,535],yard:[190,365],hall:[190,110],study:[65,235],bed:[325,235],store:[325,445],
  village:[520,520],market:[570,735],county:[850,735],pharmacy:[820,575],generalStore:[1075,735],teahouse:[1070,585],
  foothill:[535,340],mountain:[710,225],bambooGrove:[710,70],mountainside:[935,195],summit:[1080,70],
  coast:[855,450],tidalflat:[1090,410]
};
const mapGroups=[['宅院与房间',['gate','yard','hall','study','bed','store']],
  ['村镇与县城',['village','market','county','pharmacy','generalStore','teahouse']],
  ['青岚山',['foothill','mountain','bambooGrove','mountainside','summit']],['南澜海湾',['coast','tidalflat']]];
const deferredPlaces=['county','pharmacy','generalStore','teahouse'];
let selectedMapPlace='yard',selectedMapObject=null,navigationTarget=null,navigationObject=null,mapReturnFocus=null,mapZoom=1;
function mapAccess(id){
  const s=state(),why=N.sceneGate(s,id);if(why)return why;
  if(id==='bambooGrove'&&!s.flags.bridgeReady)return 'M06 在山路木道铺通竹林小径后开放。';
  if(id==='tidalflat'&&!N.tide(s).low)return '现在涨潮，下一轮低潮还有 '+Math.ceil(N.tide(s).remaining)+' 游戏分钟。可以先在海边走动，随时可以从滩涂返回。';
  return '';
}
function nextObjective(){
  const s=state(),q=N.current(s),f=s.flags;
  if(!q)return N.done(s,'M20')&&!s.flags.volume2Started?{scene:'hall',object:'v2Family',label:'新春家议 · 开启第二卷'}:{scene:'yard',object:'herbPlot',label:'回家照料小畦'};
  const flag=N.steps[q].find(([id])=>!f[id])?.[0];
  const targets={...(typeof window!=='undefined'?window.NanlanV2?.targets:{}),handover:['gate','familyLuggage'],keyTaken:['gate','keyHandover'],gateOpen:['gate','closedGate'],
    windowInspected:['bed','window'],leakInspected:['bed','leak'],firstRepair:['bed','window'],bedReady:['bed','bedRest'],
    farmTools:['store','sickle'],toolsRepaired:['store','workbench'],smallBed:['yard','herbPlot'],stoveClean:['yard','stove'],
    bucketFilled:s.tools.water?['yard','waterJar']:['store','water'],drainClear:['yard','drain'],firstCooked:['yard','stove'],firstShared:['hall','mealTable'],
    metChen:['village','villager'],metDoctor:['village','doctor'],letterRead:['village','villageLetter'],
    metCen:['foothill','aCen'],bambooIdentified:['foothill','footBamboo'],bambooChoice:['foothill','aCen'],bridgeReady:['mountain','bridgeWork'],
    fullGarden:['yard','herbPlot'],dryRack:['store','workbench'],medicinalPlanted:['yard','herbPlot'],medicinalWatered:s.bucketWater?['yard','herbPlot']:['yard','waterJar'],medicinalHarvested:['yard','herbPlot'],
    boxFound:['store','bookBox'],ledgerPermission:['village','chengWan'],pagesDried:['study','dryPages'],
    metYu:['village','shenYu'],coastVisited:['coast','coastBoard'],tideRead:['coast','coastBoard'],tidalCollected:['tidalflat','clam1'],
    stallBooked:['market','vegetableStall'],productDisplayed:['market','playerStall'],firstSale:['market','playerStall'],orderAccepted:['market','playerStall'],orderReserved:['market','playerStall'],orderDelivered:['market','playerStall'],
    gutterChecked:['yard','roofGutter'],goodsStored:['store','goodsCrates'],stormWarned:['village','villager'],
    hallwayCleared:['hall','hallway'],cratesRaised:['store','goodsCrates'],guestsSettled:['hall','hallway'],
    fatherClue:['village','villager'],guideReady:['foothill','aCen'],waterChecked:['mountainside','waterMark'],fatherFound:['mountainside','fatherHill'],fatherHome:['hall','father'],
    bookReturned:['village','chengWan'],historyConfirmed:['hall','grandfather'],copyApproved:['village','chengWan'],
    receiptsReviewed:['market','qiu'],accountResolved:f.mediationRequested?['village','villager']:['market','qiu'],fairFeePaid:s.choices.accounts==='mediate'?['village','villager']:['market','qiu'],
    letterFamily:['hall',!s.familyTalks.grandfather?'grandfather':!s.familyTalks.father?'father':'motherHall'],giftChosen:['hall','mealTable'],replyWritten:['hall','grandfather'],replySent:['village','villager'],
    seatingChosen:['hall','mealTable'],feastCooked:['yard','stove'],festivalLamps:['yard','festivalLantern'],feastShared:['hall','mealTable']};
  if(flag==='pathCleared')targets.pathCleared=['yard',['weed1','weed2','weed3'].find(id=>!s.collected[id])];
  const [scene,object]=targets[flag]||[s.scene,null];
  return {scene,object,label:q+' · '+(N.steps[q].find(([id])=>id===flag)?.[1]||N.titles[q])};
}
function showMap(id=state().scene,objectId=null){
  cancelNavigation();active=false;path=[];keys={};moving=false;mapReturnFocus=document.activeElement;
  $('worldMap').hidden=false;selectedMapPlace=world[id]?id:state().scene;selectedMapObject=objectId;
  drawMap();inspectMapPlace(selectedMapPlace,objectId);$('mapClose').focus();centerMap(selectedMapPlace);
}
function centerMap(id){requestAnimationFrame(()=>{
  const [x,y]=mapPositions[id],scroll=$('mapScroll'),board=$('mapBoard');
  scroll.scrollTo({left:Math.max(0,x/1200*board.clientWidth-scroll.clientWidth/2),top:Math.max(0,y/820*board.clientHeight-scroll.clientHeight/2),behavior:'smooth'});
});}
function setMapZoom(value){
  mapZoom=Math.max(.85,Math.min(1.55,value));const board=$('mapBoard'),base=window.innerWidth<=650?920:800;
  board.style.width=Math.round(mapZoom*100)+'%';board.style.minWidth=Math.round(base*mapZoom)+'px';
  $('mapZoomOut').disabled=mapZoom<=.85;$('mapZoomIn').disabled=mapZoom>=1.55;$('mapZoomReset').textContent=Math.round(mapZoom*100)+'%';centerMap(selectedMapPlace);
}
function closeMap(){
  $('worldMap').hidden=true;active=started&&$('dialog').hidden&&$('gallery').hidden&&!document.hidden&&!transitioning;
  if(mapReturnFocus?.isConnected)mapReturnFocus.focus({preventScroll:true});
}
function drawMap(){
  const s=state(),edges=[],seen=new Set(),objective=nextObjective();
  for(const [from,w] of Object.entries(world))for(const o of w.objects.filter(o=>o.type==='door')){
    const pair=[from,o.to].sort().join(':');if(seen.has(pair)||!mapPositions[o.to])continue;seen.add(pair);edges.push([from,o.to]);
  }
  edges.push(['gate','yard'],['market','county']);
  let svg='<g class="region-label" font-family="NanlanSerif,serif" fill="#f6e7bd" stroke="#213d30" stroke-width="4" paint-order="stroke" font-size="18" letter-spacing="5" opacity=".88"><text x="74" y="675">李 家 旧 宅</text><text x="430" y="650">南 澜 村 镇</text><text x="785" y="250">青 岚 山</text><text x="970" y="530">南 澜 海 湾</text></g>';
  svg+='<g class="map-decoration" transform="translate(1128 690)" font-family="NanlanSerif,serif"><circle r="40" fill="#e8dab0" stroke="#69492f" stroke-width="2" opacity=".82"/><circle r="32" fill="none" stroke="#80613e"/><path d="M0-27l7 20-7 7-7-7zM0 27l-6-19 6-8 6 8zM-27 0l19-6 8 6-8 6zM27 0L8 6 0 0l8-6z" fill="#486342"/><text x="-7" y="-46" font-size="14" fill="#5e422e">北</text></g>';
  svg+='<g class="map-decoration" transform="translate(58 54) rotate(-4)" font-family="NanlanSerif,serif"><rect width="72" height="54" rx="2" fill="#f0dca8aa" stroke="#8f4337" stroke-width="3"/><text x="12" y="24" font-size="16" fill="#8f4337" letter-spacing="5">南澜</text><text x="12" y="44" font-size="15" fill="#8f4337" letter-spacing="5">舆图</text></g>';
  for(const [a,b] of edges){const [x1,y1]=mapPositions[a],[x2,y2]=mapPositions[b],open=!mapAccess(a)&&!mapAccess(b);
    const d='M'+x1+' '+y1+' Q'+((x1+x2)/2)+' '+((y1+y2)/2+10)+' '+x2+' '+y2;
    if(open)svg+='<path class="map-route" d="'+d+'" fill="none" stroke="#f3e4ba" stroke-width="8" opacity=".72"/><path class="map-route" d="'+d+'" fill="none" stroke="#456247" stroke-width="3.2" stroke-linecap="round" opacity=".9"/>';
    else svg+='<path class="map-route" d="'+d+'" fill="none" stroke="#d8c59c" stroke-width="4" stroke-dasharray="7 7" opacity=".72"/><path class="map-route" d="'+d+'" fill="none" stroke="#6d6048" stroke-width="1.4" stroke-dasharray="7 7" opacity=".75"/>';
  }$('mapLines').innerHTML=svg;$('mapNodes').replaceChildren();
  for(const [id,[x,y]] of Object.entries(mapPositions)){
    const why=mapAccess(id),b=document.createElement('button');
    b.className='map-node'+(!why?' open':'')+(s.scene===id?' current':'')+(objective.scene===id?' objective':'');
    b.dataset.mapPlace=id;b.style.left=(x/12)+'%';b.style.top=(y/8.2)+'%';
    b.innerHTML=clean(world[id].name.replace('旧宅 · ','').replace('青岚山 · ','').replace('南澜海湾 · ','').replace('南澜县城 · ',''))+
      '<small>'+(s.scene===id?'你在这里':deferredPlaces.includes(id)&&why?'开启第二卷后前往':why?'随剧情 / 时机开启':objective.scene===id?'下一步目标':s.visits[id]?'已走过':'可前往')+'</small>';
    b.setAttribute('aria-label',world[id].name+'，'+(why?'待开放':'已开放')+(objective.scene===id?'，当前任务目标':''));
    b.onclick=()=>inspectMapPlace(id);$('mapNodes').append(b);
  }
  $('mapSummary').textContent='完整山海原画 · 19 个场景点（含门前序章） · '+Object.keys(world).filter(id=>!mapAccess(id)).length+' 处当前可达 · 全部地点均可查看';
  $('mapTime').textContent=timeText().short+' · 查看地图时暂停';
  drawPlaceLists();filterMap();
}
function inspectMapPlace(id,objectId=null){
  selectedMapPlace=id;selectedMapObject=objectId;const s=state(),w=world[id],why=mapAccess(id),historical=id==='gate'&&s.flags.gateOpen;
  for(const b of $('mapNodes').children)b.classList.toggle('selected',b.dataset.mapPlace===id);
  $('mapPlaceTitle').textContent=w.name;$('mapPlaceState').textContent=s.scene===id?'当前位置 · 你在这里':historical?'序章入口 · 现并入庭院':why?'已标出 · 暂未开放':'已开放 · 可以沿路抵达';
  $('mapPlaceImage').src=DATA.assets[w.asset];$('mapPlaceImage').alt=w.name+'原画预览';
  const target=historical?'yard':id,route=firstRoute(s.scene,target),o=w.objects.find(v=>v.id===objectId);
  let description=historical?'接行李、拿钥匙、开院门的序章入口。现在可回庭院查看门前通路。':why||'沿已开放入口逐段行走，途经物资仍可停下采集。';
  if(o)description='目标：'+o.label+'\n'+description;
  if(!why&&route?.length)description+='\n\n出行路线：'+[world[s.scene].name,...route.map(step=>world[step.to].name)].join(' → ');
  if(!why&&route===null)description+='\n当前通路尚未连通，先完成门前交接或当前修路任务。';
  $('mapPlaceDescription').textContent=description;$('mapPlaceActions').replaceChildren();
  function add(label,fn,secondary){const b=document.createElement('button');b.textContent=label;b.onclick=fn;if(secondary)b.className='secondary';$('mapPlaceActions').append(b);}
  if(started&&!why&&route!==null)add(s.scene===target?(o?'走近目标 · '+o.label:'查看这里的互动地点'):'沿路前往'+w.name,()=>{closeMap();if(state().scene===target&&!o)showNearby();else startNavigation(target,o?.id);});
  if(!started)add('从旧宅门前启程',()=>{closeMap();$('begin').focus();});
  add('放大场景原画',()=>{closeMap();showGallery();const card=$('galleryGrid').querySelector('[data-scene="'+(id==='gate'?'yard':id)+'"]');if(card){card.classList.add('expanded');card.scrollIntoView({block:'start'});}},true);
  $('mapPlaceDetails').replaceChildren();
  for(const local of visibleObjects(id,true)){
    const b=document.createElement('button');b.className=local.id===objectId?'local-selected':'';
    const resource=resourceTypes.includes(local.type),last=s.nodes[local.id],cooldown=resource&&last!==undefined&&s.worldTick-last<N.resourceCooldown(local.type);
    b.textContent=local.label+(cooldown?' · '+Math.ceil(N.resourceCooldown(local.type)-s.worldTick+last)+' 分钟后再生':local.type==='door'?' · 出入口':resource?' · 采集点':local.type==='npc'?' · 人物':'');
    b.onclick=()=>{
      if(local.type==='door'){inspectMapPlace(local.to);centerMap(local.to);return;}
      if(started&&state().scene===id&&visibleObjects().some(v=>v.id===local.id)){closeMap();approach(local);return;}
      if(local.type==='locked'||local.type==='property'){$('mapPlaceDescription').textContent=local.lines||'后续开放。';return;}
      inspectMapPlace(id,local.id);
    };$('mapPlaceDetails').append(b);
  }
}
function drawPlaceLists(){
  $('allPlaceList').replaceChildren();
  mapGroups.forEach(([title,ids])=>{
    const box=document.createElement('section');box.className='place-list-card';const heading=document.createElement('b');heading.textContent=title;box.append(heading);
    for(const id of ids){
      const b=document.createElement('button');b.className='directory-scene';b.textContent=world[id].name+' · '+(deferredPlaces.includes(id)?'第二卷':mapAccess(id)?'待开放':'可达');
      b.onclick=()=>{inspectMapPlace(id);centerMap(id);};box.append(b);
      const details=document.createElement('details'),summary=document.createElement('summary');summary.textContent='展开 '+world[id].objects.length+' 处人物、设施与采集点';details.append(summary);
      for(const o of world[id].objects){const local=document.createElement('button');local.textContent=o.label;local.onclick=()=>{inspectMapPlace(id,o.id);centerMap(id);$('mapInspector').scrollIntoView({block:'nearest',behavior:'smooth'});};details.append(local);}
      box.append(details);
    }
    if(title==='宅院与房间'){const p=document.createElement('p');p.textContent='池塘：第一卷固定淤塞背景，无互动。灶边与药圃是庭院内设施。';box.append(p);}
    $('allPlaceList').append(box);
  });
}
function filterMap(){
  const query=$('mapSearch').value.trim(),results=$('mapSearchResults');results.replaceChildren();results.hidden=!query;
  for(const node of $('mapNodes').children){const w=world[node.dataset.mapPlace];node.classList.toggle('dimmed',!!query&&!(w.name+w.objects.map(o=>o.label).join('')).includes(query));}
  if(!query)return;
  const matches=[];for(const [id,w] of Object.entries(world)){
    if(w.name.includes(query))matches.push({id,label:w.name});
    for(const o of w.objects)if(o.label.includes(query))matches.push({id,object:o.id,label:w.name+' · '+o.label});
  }
  const note=document.createElement('p');note.textContent=matches.length?'找到 '+matches.length+' 项，点击查看位置与路线。':'没有找到这个地点。可试试「竹林」「灶」「药圃」或「待租」。';results.append(note);
  for(const match of matches){const b=document.createElement('button');b.textContent=match.label;b.onclick=()=>{inspectMapPlace(match.id,match.object);centerMap(match.id);};results.append(b);}
}
function firstRoute(from,to){
  if(from===to)return [];
  const queue=[[from,[]]],seen=new Set([from]);
  for(let n=0;n<queue.length;n++){
    const [id,route]=queue[n];
    for(const o of world[id].objects.filter(o=>o.type==='door')){
      if(seen.has(o.to)||mapAccess(o.to)||(o.requires&&!state().flags[o.requires]))continue;
      const next=[...route,o];if(o.to===to)return next;seen.add(o.to);queue.push([o.to,next]);
    }
  }return null;
}
function cancelNavigation(){navigationTarget=null;navigationObject=null;if($('navigationStatus'))$('navigationStatus').hidden=true;}
function startNavigation(to,objectId=null){
  const route=firstRoute(state().scene,to);
  if(route===null){notice(mapAccess(to)||'这条路线还未连通。先完成门前交接或修通小路。',true);cancelNavigation();return;}
  navigationTarget=to;navigationObject=objectId;
  if(!route.length){
    const o=visibleObjects().find(o=>o.id===objectId);cancelNavigation();
    if(o)approach(o);else notice(objectId?'已到达。这个物件随任务开放，可先查看「场景互动」。':'已经到达'+world[to].name+'。');return;
  }
  $('navigationLabel').textContent='前往 '+world[to].name+' · 还经 '+route.length+' 处入口';$('navigationStatus').hidden=false;
  approach(route[0]);notice('导航到'+world[to].name+' · 下一处：'+route[0].label+'。',true);
}
function continueNavigation(){if(navigationTarget)startNavigation(navigationTarget,navigationObject);}
function locateObjective(){const target=nextObjective();inspectMapPlace(target.scene,target.object);centerMap(target.scene);}
$('mapClose').onclick=closeMap;$('mapSearch').oninput=filterMap;$('startMap').onclick=()=>showMap();$('mapOpen').onclick=()=>showMap();
$('questMap').onclick=()=>{const target=nextObjective();showMap(target.scene,target.object);};
$('mapObjective').onclick=locateObjective;$('mapHome').onclick=()=>{const id=state().flags.bedReady?'bed':'yard';inspectMapPlace(id,id==='bed'?'bedRest':null);centerMap(id);};
$('mapZoomOut').onclick=()=>setMapZoom(mapZoom-.15);$('mapZoomIn').onclick=()=>setMapZoom(mapZoom+.15);$('mapZoomReset').onclick=()=>setMapZoom(1);
$('mapMarkers').onclick=()=>{const hidden=$('mapBoard').classList.toggle('map-cinematic');$('mapMarkers').setAttribute('aria-pressed',String(hidden));$('mapMarkers').textContent=hidden?'显示地点牌 · 继续导航':'隐藏地点牌 · 看全景';};
$('navigationCancel').onclick=()=>{cancelNavigation();path=[];notice('已停止导航，可自由走动。');};
