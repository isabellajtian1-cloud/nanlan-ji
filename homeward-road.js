/* Walkable strips follow the floor in each painting. Door targets use the ordinary world graph. */
window.NanlanHomewardRoad = (()=>{
  const {world,assets}=NANLAN_DATA;
  const L=(zh,en)=>deskText(zh,en);
  const tr=(zh,en)=>{NANLAN_EN[zh]=en;return zh;};
  const d=(id,label,en,to,x,y,exit)=>({id,type:'door',label:tr(label,en),to,x,y,exit});
  const view=(id,label,en,x,y,ax,ay)=>({id,label:tr(label,en),type:'activity',action:'homewardPlace',x,y,scenic:true,approach:{x:ax,y:ay},hit:{x:x-27,y:y-34,w:54,h:47}});
  function inside(poly,x,y){
    let yes=false;
    for(let i=0,j=poly.length-1;i<poly.length;j=i++){
      const [a,b]=poly[i],[c,d]=poly[j];
      if(((b>y)!==(d>y))&&(x<(c-a)*(y-b)/(d-b)+a))yes=!yes;
    }
    return yes;
  }
  function walk(polys){return (x,y,pad=0)=>{
    const k=Math.min(7,pad*.6);
    return [[0,0],[k,0],[-k,0],[0,k],[0,-k]].every(([dx,dy])=>polys.some(poly=>inside(poly,x+dx,y+dy)));
  };}
  const lanes=[
    [[32,345],[165,402],[309,445],[465,519],[546,502],[680,457],[870,394],[907,374],[1039,350],[1080,383],[1000,436],[930,473],[842,526],[746,611],[689,708],[339,716],[223,598],[141,507],[36,461]],
    [[300,454],[353,405],[372,317],[397,246],[431,214],[445,230],[423,279],[413,328],[415,361],[426,390],[415,458],[474,522],[375,538]]
  ];
  const dock=[
    [[60,299],[125,268],[293,264],[316,318],[348,419],[369,456],[346,498],[225,551],[145,544],[75,483],[40,414]],
    [[287,318],[733,306],[778,319],[853,362],[865,395],[804,410],[364,449],[311,436]],
    [[116,495],[247,464],[334,471],[365,538],[392,583],[260,636],[212,603],[179,573],[116,559]]
  ];
  const gallery=[
    [[49,375],[160,362],[305,371],[480,398],[664,414],[819,420],[878,406],[940,394],[1044,366],[1068,402],[1063,553],[919,539],[747,507],[595,502],[457,481],[306,456],[164,437],[57,427]]
  ];
  function scene(id,label,en,file,sound,spawn,arrival,polys,objects){
    assets[id]='homeward-'+file+'-map.webp';
    world[id]={name:tr(label,en),asset:id,soundScene:sound,spawn,arrivalFrom:arrival,bounds:[18,160,1086,725],walkCorridor:walk(polys),objects,collisions:[]};
  }
  scene('homeLane','榕荫归巷','Banyan Home Lane','lane','village',[155,448],{village:[155,448],yard:[889,411],reedLanding:[404,361]},lanes,[
    d('laneVillage','穿过榕荫回村口','Return to the village','village',92,410,[-1,0]),
    d('laneYard','推开自家院门','Open the family gate','yard',934,390,[1,-1]),
    d('laneDock','从墙角小巷去河埠','Take the alley to the landing','reedLanding',407,305,[0,-1]),
    view('laneWindow','自家花窗','The family window',804,378,812,428)
  ]);
  // The window is high in the wall. Its illustrated hotspot and ground approach are separate.
  world.homeLane.objects.at(-1).hit={x:709,y:182,w:136,h:84};
  scene('reedLanding','听橹小埠','Reed Ferry Landing','dock','wharf',[125,392],{village:[125,392],homeLane:[182,321]},dock,[
    d('dockVillage','沿石阶回村','Follow the paving back to the village','village',76,395,[-1,0]),
    d('dockLane','绕过棚子回归巷','Round the shelter into Home Lane','homeLane',164,287,[0,-1]),
    view('dockMooring','船首的缆绳','The mooring rope',839,380,802,373),
    view('dockWater','石级边的水圈','Ripples at the steps',325,576,312,562)
  ]);
  scene('eavesGallery','旧宅 · 檐下回廊','Home · Covered Veranda','gallery','hall',[160,405],{yard:[160,405],hall:[938,445]},gallery,[
    d('galleryYard','下廊回庭院','Step down into the courtyard','yard',86,397,[-1,0]),
    d('galleryHall','推门进正厅','Enter the main hall','hall',982,413,[1,0]),
    view('galleryJar','檐下承雨缸','The jar under the eaves',850,506,839,472),
    view('galleryLattice','隔窗听家人说话','Voices behind the lattice',618,417,615,439)
  ]);
  world.eavesGallery.objects.at(-1).hit={x:419,y:153,w:309,h:143};
  world.eavesGallery.objects[2].hit={x:805,y:478,w:88,h:118};
  world.eavesGallery.collisions=[[281,431,31,14],[760,475,39,24]];
  function join(from,to,id,label,en,x,y,ex,arrive){
    world[from].objects.push(d(id,label,en,to,x,y,ex));
    world[from].arrivalFrom={...world[from].arrivalFrom,[to]:arrive};
  }
  join('village','homeLane','villageHomeLane','沿西巷走回家','Walk home by the west lane',266,377,[-1,0],[306,389]);
  join('village','reedLanding','villageSmallDock','沿村南去听橹小埠','Take the south path to the ferry',579,605,[0,1],[583,586]);
  join('yard','homeLane','yardHomeLane','推侧门进榕荫归巷','Take the side gate to Home Lane',508,421,[-1,1],[530,395]);
  join('yard','eavesGallery','yardGallery','上檐下回廊','Step onto the covered veranda',618,288,[0,-1],[610,314]);
  join('hall','eavesGallery','hallGallery','侧门去檐下回廊','Open the side door to the veranda',313,530,[-1,0],[340,539]);
  const courtFloor=[
    [[31,545],[209,347],[266,335],[504,328],[714,337],[874,349],[940,481],[1012,476],[1075,453],[1071,602],[976,688],[874,712],[34,714]],
    [[39,487],[51,385],[119,321],[185,293],[190,354],[103,452],[55,521]]
  ];
  const kitchenFloor=[
    [[31,500],[115,430],[208,415],[244,342],[358,313],[642,312],[919,327],[985,306],[1053,311],[1072,350],[1070,714],[31,714]],
    [[43,468],[43,364],[101,313],[142,313],[131,389],[86,468]]
  ];
  const loftFloor=[
    [[247,368],[337,335],[558,320],[741,314],[831,331],[924,358],[985,397],[1068,421],[1074,709],[318,711],[293,535]],
    [[44,691],[52,628],[189,605],[234,641],[314,659],[341,703],[291,715],[48,716]],
    [[933,363],[989,321],[1044,301],[1060,337],[1058,406],[993,432]]
  ];
  scene('washingCourt','旧宅 · 天井洗衣埠','Home · Washing Court','wash','yard',[133,394],
    {eavesGallery:[133,394],dryingLoft:[968,503]},courtFloor,[
      d('washGallery','穿过门洞回廊下','Return through the veranda arch','eavesGallery',103,371,[-1,-1]),
      d('washLoft','沿石阶上晒台','Climb the stairs to the drying terrace','dryingLoft',971,496,[0,-1]),
      view('linenStone','石槽洗巾','Wash the towel at the stone trough',395,342,395,365)
    ]);
  world.washingCourt.objects[2].hit={x:266,y:210,w:249,h:110};
  scene('serviceKitchen','旧宅 · 后罩房灶间','Home · Rear Kitchen','cook','hall',[136,456],
    {eavesGallery:[136,456],yard:[990,360]},kitchenFloor,[
      d('kitchenGallery','穿过木门回廊下','Return to the veranda','eavesGallery',88,397,[-1,0]),
      d('kitchenYard','经后门到庭院','Step out into the courtyard','yard',1020,325,[1,-1]),
      view('kitchenFire','砖灶做饭','Cook at the brick stove',552,319,549,346),
      view('linenCounter','灶间案几','The kitchen counter',808,331,809,350)
    ]);
  world.serviceKitchen.objects[2].hit={x:447,y:145,w:236,h:141};
  world.serviceKitchen.objects[3].hit={x:706,y:150,w:234,h:146};
  scene('dryingLoft','旧宅 · 二楼晒台','Home · Drying Terrace','loft','yard',[271,681],
    {washingCourt:[271,681],eavesGallery:[977,410]},loftFloor,[
      d('loftWash','下石阶到天井','Descend to the washing court','washingCourt',188,672,[-1,0]),
      d('loftGallery','下木梯回廊','Take the wooden stairs to the veranda','eavesGallery',1018,355,[1,-1]),
      view('linenRail','竹竿晾巾','Air the towel on the bamboo rail',478,343,474,367),
      view('loftHorizon','望村榕与河埠','Look out over the village and river',692,330,675,355)
    ]);
  world.dryingLoft.objects[2].hit={x:316,y:162,w:300,h:85};
  world.dryingLoft.objects[3].hit={x:620,y:81,w:131,h:134};
  join('eavesGallery','washingCourt','galleryWash','穿过月洞去洗衣埠','Enter the washing court',189,386,[0,-1],[204,410]);
  join('eavesGallery','serviceKitchen','galleryKitchen','推开灶间木门','Open the rear kitchen door',420,406,[0,-1],[433,434]);
  join('eavesGallery','dryingLoft','galleryLoft','沿木梯上晒台','Climb to the drying terrace',718,443,[0,-1],[705,455]);
  join('yard','serviceKitchen','yardRearKitchen','绕到后罩房灶间','Take the back door to the kitchen',743,316,[1,0],[716,329]);
  const peg=view('coveredPeg','廊下晾布钉','The sheltered drying peg',535,417,535,448);
  peg.hit={x:507,y:301,w:58,h:76};world.eavesGallery.objects.push(peg);
  function inspect(o){
    if(o.action!=='homewardPlace')return false;
    if(window.NanlanHousehold?.show(o))return true;
    const s=state(),lit=s.flags.firstShared&&N.daylight(s).minute>=990,wet=!!NanlanWeather.current(s).wet;
    let body;
    switch(o.id){
      case 'laneWindow':body=lit?L('旧窗纸把灯火映成三格。拐过墙角，这扇窗是你第一个看见的。门闩从里头抬起来了。','Lamplight fills three paper panes. You know the window before you round the corner. The latch lifts inside.'):L('风吹过窗格，屋里传来扫帚擦过砖面的沙沙声。你认出了自家的门槛。','A broom brushes the bricks behind the lattice. You recognize your own doorstep.');break;
      case 'dockMooring':body=L('小船轻轻扯动系缆的绳圈。手搭上去，能感觉水把船往外送了一尺。','The skiff tugs at its mooring. Rest a hand on the rope and feel it pay out a little with the water.');break;
      case 'dockWater':body=L('最后一级石头带着湿气。你在石边蹲下来，船影恰好落在脚边。','The last stone tread is damp. You crouch beside the reflection of the skiff.');break;
      case 'galleryJar':body=wet?L('雨顺着瓦当滴进陶缸。重的一滴落下去，上一圈水纹还没走到缸沿。','Rain drips from the tiles. A second drop lands before the first ring reaches the rim.'):L('瓦沿已经干了，缸里收着前一场雨。斜着望过去，一小方屋檐倒在水里。','The tiles are dry. The jar holds water from the last shower, with a corner of the roof reflected in it.');break;
      default:body=lit?L('窗里轻轻碰了一下碗。母亲问：「谁还没盛？」有人笑着回她：「您自己。」','Crockery taps softly inside. “Who still needs rice?” Mother asks. “You do,” comes the laughing reply.'):L('祖父在窗后展平一页纸。光从窗格挪到他手边，他也把砚台挪了一寸。','Grandfather smooths a page. As the patch of light moves across it, he shifts his inkstone a little too.');
    }
    activity(o.label,body,'homeward-scene');dialogObject=o;
    if(o.id==='dockMooring'||o.id==='dockWater'||o.id==='galleryJar'){
      const rope=o.id==='dockMooring';
      navButton(rope?L('扶稳绳圈，再松手','Steady the line, then release it'):L('用指尖轻点水面','Touch the water'),()=>{
        pulse={scene:s.scene,kind:o.id,start:performance.now()};closeDialog(true);
        NanlanAudio.play(rope?'ferryPole':'water');
        notice(rope?L('绳圈收紧，水纹推向船尾。','The line draws taut. Ripples travel towards the stern.'):L('一圈水纹慢慢散开。','A ring spreads across the water.'));
      },'homeward-touch-water');
    }else navButton(o.id==='laneWindow'?L('走到自家院门','Walk to the family gate'):L('走到正厅门前','Walk to the hall door'),()=>{closeDialog(true);approach(world[s.scene].objects.find(d=>d.id===(o.id==='laneWindow'?'laneYard':'galleryHall')));},'homeward-enter-home');
    return true;
  }
  const floors={homeLane:'stone',reedLanding:'stone',eavesGallery:'tile',washingCourt:'stone',serviceKitchen:'tile',dryingLoft:'wood'};
  function floor(scene,x,y){if(scene==='reedLanding'&&x>315&&y<452)return 'wood';return floors[scene];}
  let marks=[],track='',distance=0,side=1,pulse=null;
  function move(s,dx,dy,d,step){
    if(!floors[s.scene]||!d)return;
    if(track!==s.scene){marks=[];distance=0;track=s.scene;}
    distance+=d;if(distance<step)return;distance%=step;
    const now=performance.now(),a=Math.atan2(dy,dx),material=floor(s.scene,s.player.x,s.player.y);
    const wet=(s.scene==='reedLanding'&&s.player.y>490)||(!['tile','wood'].includes(material)&&NanlanWeather.current(s).wet);
    side=-side;
    if(wet&&!reduceCameraMotion.matches){marks.push({x:s.player.x-Math.sin(a)*side*3,y:s.player.y+Math.cos(a)*side*2,a,t:now});if(marks.length>12)marks.shift();}
  }
  function ring(ctx,x,y,t,r){
    if(t<=0||t>=1)return;
    ctx.strokeStyle='rgba(242,230,190,'+(.67*Math.sin(t*Math.PI))+')';ctx.lineWidth=1.2;
    ctx.beginPath();ctx.ellipse(x,y,r*t+2,(r*t+2)*.25,0,0,2*Math.PI);ctx.stroke();
  }
  function ground(ctx,s,t){
    if(track!==s.scene){marks=[];distance=0;track=s.scene;}
    if(!floors[s.scene])return;
    window.NanlanHousehold?.draw(ctx,s,t);
    ctx.save();
    if(!reduceCameraMotion.matches){
      for(const m of marks){const age=t-m.t;if(age>3300)continue;ctx.save();ctx.translate(m.x,m.y);ctx.rotate(m.a);ctx.fillStyle='rgba(39,49,41,'+(.37*(1-age/3300))+')';ctx.beginPath();ctx.ellipse(0,0,4.2,1.8,0,0,2*Math.PI);ctx.fill();ctx.restore();}
      if(s.scene==='reedLanding'){
        const beat=t/3100;ring(ctx,923,402,beat%1,18);ring(ctx,937,413,(beat+.42)%1,12);
      }
      if(pulse?.scene===s.scene){const k=(t-pulse.start)/1750;const pt=pulse.kind==='dockMooring'?[910,409]:pulse.kind==='dockWater'?[382,602]:jarWater;
        ring(ctx,...pt,k,pulse.kind==='galleryJar'?13:35);ring(ctx,...pt,k-.17,pulse.kind==='galleryJar'?10:27);
        if(k>1.2)pulse=null;
      }
      if(s.scene==='eavesGallery'&&NanlanWeather.current(s).wet)ring(ctx,...jarWater,(t/1670)%1,12);
    }
    ctx.restore();
  }
  const jarWater=[851,496];
  return {inspect,move,ground,floor};
})();
