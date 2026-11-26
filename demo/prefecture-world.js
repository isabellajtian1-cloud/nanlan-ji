(() => {
  const {world,assets}=window.NANLAN_DATA;
  const door=(id,label,to,x,y,exit)=>({id,label,to,x,y,exit,type:'door'});
  const stop=(id,label,x,y,action,role)=>({id,label,x,y,action,role,type:'activity'});
  const add=(id,name,soundScene,spawn,bounds,objects,collisions=[])=>{
    assets[id]='pref-'+id+'-v680.webp';
    world[id]={name,asset:id,soundScene,spawn,bounds,objects,collisions};
  };
  world.wharf.objects.push(stop('prefBoard','府城班船',708,411,'prefBoard'));
  add('prefDock','府城河埠','wharf',[545,537],[175,345,945,631],[
    stop('prefReturn','回南澜的班船',404,442,'prefBoard','boatman'),
    door('prefToMarket','穿城门入府城早市','prefMarket',838,350,[0,-1])
  ]);
  add('prefMarket','府城早市','market',[540,585],[240,324,866,654],[
    stop('prefStall','早市样货摊',550,392,'prefStall','vendor'),
    door('prefToInn','府城临水客栈','prefInn',263,596,[-1,0]),
    door('prefToTea','府城茶铺','prefTea',840,596,[1,0]),
    door('prefToDock','下石街回府城河埠','prefDock',550,626,[0,1])
  ]);
  add('prefInn','府城临水客栈 · 一楼','teahouse',[550,567],[265,306,841,680],[
    stop('prefInnkeeper','杜掌柜 · 吃饭与结账',548,361,'prefLobby','customer'),
    door('prefUp','沿楼梯上二楼','prefRoom',806,359,[0,-1]),
    door('prefInnOut','返回府城早市','prefMarket',550,655,[0,1])
  ],[[265,611,120,69],[715,611,126,69]]);
  add('prefRoom','府城临水客栈 · 二楼','generalStore',[550,570],[263,316,843,679],[
    stop('prefBed','客房床铺',369,339,'prefBed'),
    door('prefDown','沿楼梯下一楼','prefInn',550,650,[0,1])
  ],[[263,611,120,68],[715,611,128,68]]);
  add('prefTea','府城茶铺','teahouse',[550,566],[234,295,869,677],[
    {...stop('prefTeaCounter','茶桌 · 吃茶与点心',229,376,'prefTeaTable'),tabletop:[164,328]},
    door('prefTeaOut','返回府城早市','prefMarket',550,648,[0,1])
  ],[[234,610,150,67],[716,610,153,67],[234,300,15,54]]);
  assets.teaServings='pref-tea-servings-v680.webp';
  assets.teaExtras='pref-tea-extras-v680.webp';
  assets.festivalProps='festival-props-v680.webp';
  assets.countyInn='pref-countyInn-v680.webp';
  world.countyInn.objects.push(door('countyUp','沿楼梯上二楼','countyRoom',802,343,[0,-1]));
  add('countyRoom','南街客栈 · 二楼','generalStore',[550,571],[263,316,843,679],[
    stop('countyBed','客房床铺',352,339,'prefBed'),
    door('countyDown','沿楼梯下一楼','countyInn',550,650,[0,1])
  ],[[263,611,120,68],[715,611,128,68]]);
  for(const event of globalThis.NanlanFestival.events){
    world[event.scene].objects.push({...stop('festival-'+event.id,event.name[0],event.x,event.y,'festival'),festival:event.id});
  }
})();
