((root,make)=>{
  const climate=typeof module==='object'&&module.exports?require('./climate.js'):root.NanlanClimate;
  const api=make(climate);
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.NanlanFestival=api;
})(globalThis,climate=>{
  const events=[
    {id:'newYear',name:['春节','Spring Festival'],season:0,day:1,scene:'hall',x:363,y:545,
      intro:['母亲把两张红纸压在案上。「门外的人一眼就见得着。你想给他们写句什么？」','Mother weighs down two red sheets. “People will see them as they pass. What would you like to wish them?”'],
      choices:[['写一副「风调雨顺」','Write “Fair Winds and Timely Rain”','母亲把对联晾在窗边，等墨干了再一起贴。','Mother sets the couplet by the window. You can put it up together when the ink dries.'],['写一副「四邻平安」','Write “Peace to All Our Neighbors”','祖父扶住纸角，和你一道把平安二字写稳。','Grandfather steadies the corner as you write the characters for peace.']]},
    {id:'lanterns',name:['元宵','Lantern Festival'],season:0,day:14,scene:'village',x:673,y:485,
      intro:['灯下悬着一条纸签。「有面无口，照见眉目。打一件日用物。」','A slip hangs beneath a lantern. “It has a face but no mouth, and shows your brow and eyes. Name an everyday object.”'],
      choices:[['猜「镜子」','Guess “a mirror”','陈伯笑着翻过纸签，背面果然写着一个「镜」字。','Uncle Chen turns the slip over with a grin. The character on its back means mirror.'],['猜「团扇」','Guess “a round fan”'],['与街坊一起提灯','Carry lanterns with the neighbors','纸灯沿村路一盏盏亮起来，孩子们比着谁的影子更长。','Lanterns glow one by one along the village lane. The children compare the lengths of their shadows.']]},
    {id:'dragonBoat',name:['端午','Dragon Boat Festival'],season:1,day:5,scene:'village',x:673,y:485,
      intro:['桌上有箬叶和细绳。村口有人敲起鼓来，母亲正给邻家孩子留粽子。','Bamboo leaves and twine lie on the table. A drum sounds by the village gate as Mother sets aside dumplings for the neighbors’ children.'],
      choices:[['添一份米粮，一起裹粽','Add one portion of rice and wrap zongzi','箬叶一折一收，细绳系紧。蒸熟后，第一只粽子送给隔壁。','Fold the leaf and tie it snug. Once the dumplings are steamed, the first goes next door.','rice'],['帮街坊系好粽绳','Help the neighbors tie their dumplings','街坊扶着粽叶，你绕了两匝绳。远处的鼓声又近了些。','A neighbor holds the leaf while you wind the twine twice. The drumming draws nearer.']]},
    {id:'midAutumn',name:['中秋','Mid-Autumn Festival'],season:2,day:13,scene:'yard',x:774,y:413,
      intro:['家人把小桌搬到檐下。父亲倒了茶，特意留出一张空凳。','The family carries a small table under the eaves. Father pours tea and leaves an empty stool.'],
      choices:[['围桌分饼，给邻人留一块','Share a cake and save a piece for a neighbor','母亲把留的一块用油纸裹好，说等人经过就递出去。','Mother wraps the saved piece in paper, ready to hand it over when the neighbor passes.'],['坐在檐下，听祖父说旧事','Sit under the eaves and hear Grandfather’s story','祖父说起故乡的月光，末了又问，你最喜欢南澜哪处夜色。','Grandfather remembers the moonlight at home, then asks which Nanlan evening you love best.']]},
    {id:'doubleNinth',name:['重阳','Double Ninth Festival'],season:2,day:22,scene:'foothill',x:620,y:430,
      intro:['山脚摆着菊花和两只茶盏。阿岑试了试山石，便把席子铺在平处。','Chrysanthemums and two cups wait at the foothill. Cen tests a rock, then lays the mat on level ground.'],
      choices:[['走一小段山路，看看秋色','Walk a little way up and look at the autumn hills','你们走到能望见村瓦的地方便停了。阿岑折回去请长辈坐下歇脚。','You stop where the village roofs come into view. Cen goes back to invite the elders to sit and rest.'],['在山脚为长辈斟茶','Pour tea for the elders at the foothill','菊香淡淡。祖父接过茶盏，说山脚也能听见山上的风。','The scent of chrysanthemums is faint. Grandfather takes the cup and says the hill wind reaches all the way down here.']]},
    {id:'winterSolstice',name:['冬至','Winter Solstice'],season:3,day:8,scene:'hall',x:363,y:545,
      intro:['锅边腾起白汽。母亲叫你去喊家里人，说趁热围桌就好。','Steam rises from the pot. Mother asks you to call the family to the table while supper is hot.'],
      choices:[['添一份米粮，帮着搓圆子','Add one portion of rice and help roll dumplings','小圆子浮到水面。母亲盛出第一碗，请你先端给祖父。','The little dumplings float to the top. Mother fills the first bowl for Grandfather.','rice'],['摆碗筷，一起吃热饭','Set out the bowls and share a hot meal','窗外天色早早暗下去，屋里还留着一锅热汤和半桌闲话。','Darkness comes early outside. Inside, there is still a pot of hot soup and conversation around the table.']]}
  ];
  const day=s=>Math.floor(s.worldTick/1440)+1;
  const eventKey=(s,event)=>'festival:'+event.id+':'+(day(s)-climate.at(s).day+event.day);
  const riddles=[
    [['有面无口，照见眉目。打一件日用物。','It has a face but no mouth and shows your brow and eyes. Name an everyday object.'],['铜镜','Bronze mirror'],['团扇','Round fan']],
    [['细长一根线，肚里藏着油，亮到夜将尽。打一件灯中物。','A narrow thread drinks oil and shines deep into the night. Name the part of a lamp.'],['灯芯','Wick'],['灯罩','Shade']],
    [['两兄弟并肩站，夹起菜来不沾手。打一件桌上物。','Two brothers stand side by side and pick up food without hands. Name a table utensil.'],['筷子','Chopsticks'],['汤匙','Spoon']]
  ];
  function riddle(s,event){
    const season=climate.at(s),start=day(s)-season.day+event.day;
    return riddles[Math.floor((start-1)/(4*season.length))%riddles.length];
  }
  function active(s,event){
    if(s.mode!=='daily')return false;
    const season=climate.at(s);
    return event.season===season.index&&season.day>=event.day&&season.day<event.day+3;
  }
  function next(s,event){
    const season=climate.at(s);
    const length=season.length;
    return (event.season*length+event.day-season.index*length-season.day+4*length)%(4*length);
  }
  function act(s,p,{requireThat,requireScene,spend}){
    const event=events.find(e=>e.id===p.id);
    requireThat(event&&active(s,event),'这个节日眼下还没有开场。');
    requireScene(s,event.scene);
    const key=eventKey(s,event),choice=event.choices[p.choice];
    requireThat(choice?.[2],'这不是本次节庆的参与选项。');
    if(s.choices[key]!==undefined)return false;
    if(choice[4])spend(s,{[choice[4]]:1});
    s.choices[key]=p.choice;
    const reply=event.id==='lanterns'&&p.choice===0?'陈伯翻开纸签，笑说你猜中了。':choice[2];
    s.journal.push({id:key,tick:s.worldTick,text:event.name[0]+' · '+reply});
  }
  return {events,active,eventKey,next,act,day,riddle};
});
