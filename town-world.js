/* South Street interiors. They share the county route, not the story gates of the player's shop. */
(() => {
  const {world,assets}=window.NANLAN_DATA;
  // Leave the southern pavement open while routing around the planter and eaves.
  world.county.collisions=[...(world.county.collisions||[]),[740,427,92,142],[824,455,53,118]];
  const rooms=[
    {id:'clothShop',name:'榕下布庄',role:'clothKeeper',keeper:'顾绣娘',x:275,y:615,exit:[0,1],returnAt:[305,566]},
    {id:'bookShop',name:'青简书坊',role:'bookKeeper',keeper:'叶先生',x:875,y:605,exit:[0,1],returnAt:[797,592]},
    {id:'countyInn',name:'南街客栈',role:'innKeeper',keeper:'冯掌柜',x:809,y:295,exit:[0,-1],returnAt:[811,369]}
  ];
  for(const {id,name,role,keeper,x,y,exit,returnAt} of rooms){
    world.county.objects.push({id:'to-'+id,type:'door',label:name,to:id,x,y,exit});
    assets[id]='town-'+id+'-v670.webp';
    assets['npc_'+role]='town-'+role+'-v670.webp';
    world[id]={name,asset:id,soundScene:id==='countyInn'?'teahouse':'generalStore',spawn:[550,585],returnAt,
      bounds:[280,310,820,683],collisions:[[280,612,111,71],[709,612,111,71]],
      objects:[{id:role,label:keeper,x:570,y:351,type:'activity',action:'townShop',role},
        {id:'exit-county',label:'返回县城街道',x:550,y:670,type:'door',to:'county'}]};
  }
})();
