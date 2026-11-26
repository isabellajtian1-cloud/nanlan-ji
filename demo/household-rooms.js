/* The same household towel can be carried, aired and used by the cook. */
window.NanlanHousehold=(()=>{
  const M=NanlanHomewardModel,L=(zh,en)=>deskText(zh,en);
  const clothObjects={linenStone:1,linenRail:1,coveredPeg:1,linenCounter:1};
  function show(o,rinsed=false){
    if(o.id==='kitchenFire'){showCook();dialogObject=o;return true;}
    if(o.id==='loftHorizon'){
      const s=state(),w=NanlanWeather.current(s),next=NanlanWeather.plan(s)[w.index+1]||NanlanWeather.plan(s,1)[0];
      activity(o.label,L('从瓦脊上望过去，村口老榕树的树冠比屋顶高半截。竿头那根布条朝河边动了一下。','Above the rooftops, the old village banyan rises into view. The ribbon on the rail flutters towards the river.')+' '+L('眼下','Now: ')+L(w.zh,w.en)+' · '+L('下一阵','Next: ')+L(next.zh,next.en),'homeward-scene');dialogObject=o;return true;
    }
    if(!clothObjects[o.id])return false;
    const s=state(),c=M.cloth(s),stage=c.stage,roof=o.id==='linenRail',peg=o.id==='coveredPeg',site=roof?'roof':'shelter';
    const dry=M.dryness(s,NanlanWeather);
    const lines={
      basket:L('案边留着一块家用布巾。把布摊进清水，顺着布纹揉掉灶灰。','A household towel waits on the stone. Spread it in clean water and rub the soot out along the weave.'),
      used:L('灶上用过的布巾卷在洗衣篮里，布角沾了点锅灰。','The cooking towel is back in the wash basket, with a little soot along one corner.'),
      damp:L('拧好的湿布在手里。楼上竹竿受风，廊下木钉可以避雨。','You carry the wrung towel. It will catch the breeze upstairs or stay out of the rain under the eaves.'),
      roof:L('布巾挂在二楼竹竿上。','The towel hangs on the upstairs bamboo rail.'),
      shelter:L('布巾挂在回廊木钉上，檐口替它挡着雨。','The towel is on the veranda peg, sheltered under the eaves.'),
      folded:L('干布已经叠好，带到后罩房的案几上，就能用它垫住烫手的锅耳。','The dry towel is folded. Take it to the kitchen counter to lift the hot pot safely.')
    };
    const detail=(stage==='shelter'||stage==='roof')?(dry>=60?L('摸起来干透了，可以收了。','It feels dry all the way through.'):L('摸上去还有潮气，约干了','Still damp to the touch, about ')+Math.floor(dry/60*100)+L('%。','%.')):'';
    activity(o.label,rinsed?L('你把布按进水里漂了两遍。提起来时，水已经清了。','You rinse twice until the water runs clear.'):lines[stage]+(detail?' '+detail:''),'homeward-scene');dialogObject=o;
    const doAct=(id,label,next=()=>show(o),args={})=>button(label,()=>perform(id,args,next),id,false,false);
    if(o.id==='linenStone'&&['basket','used'].includes(stage)){
      if(rinsed)doAct('homewardWash',L('拧去水分，拿好布巾','Wring out the towel'));
      else navButton(L('把布摊进清水漂洗','Rinse the towel'),()=>{NanlanAudio.play('water');show(o,true);},'homeward-rinse');
    }else if((roof||peg)&&stage==='damp')doAct('homewardHang',roof?L('把布展平挂上竹竿','Spread it on the bamboo rail'):L('搭在廊下木钉上','Hang it under the eaves'));
    else if((roof||peg)&&stage===site){
      doAct('homewardLift',dry>=60?L('收下干布，叠成方块','Fold the dry towel'):L('取下湿布带走','Take down the damp towel'));
      if(dry<60&&N.clock(s).minute<=1305)doAct('homewardAirWait',L('在旁歇一刻 · 15 游戏分钟','Rest nearby · 15 game minutes'),()=>show(o),{sequence:s.revision});
    }else if(o.id==='linenCounter'&&stage==='folded')doAct('homewardSetCloth',L('垫着干布端锅，放回洗衣篮','Lift the pot and return the towel to the wash basket'),()=>{
      activity(o.label,L('母亲接稳锅底，你隔着叠厚的布巾放好锅盖。布角蹭了烟灰，顺手搁进待洗的篮里。','Mother steadies the pot while you lift the lid through the folded towel. You put the sooty cloth in the wash basket.'),'homeward-scene');dialogObject=o;
    });
    const go=(text,en,scene,id)=>navButton(L(text,en),()=>startNavigation(scene,id),'cloth-to-'+id);
    if(stage==='damp'&&!roof)go('上二楼晒台','Take it upstairs','dryingLoft','linenRail');
    if(stage==='damp'&&!peg)go('去檐下避雨','Take it under cover','eavesGallery','coveredPeg');
    if(stage==='roof'&&!roof)go('去竹竿边看布','Check the upstairs rail','dryingLoft','linenRail');
    if(stage==='shelter'&&!peg)go('去回廊收布','Check the veranda peg','eavesGallery','coveredPeg');
    if(stage==='folded'&&o.id!=='linenCounter')go('把干布带去灶间','Take the towel to the kitchen','serviceKitchen','linenCounter');
    if(['basket','used'].includes(stage)&&o.id!=='linenStone')go('去天井洗衣埠','Go to the washing court','washingCourt','linenStone');
    navButton(L('回到场景','Return to the room'),()=>closeDialog(true),'linen-close');return true;
  }
  function draw(ctx,s,t){
    const c=M.cloth(s);
    const upstairs=s.scene==='dryingLoft'&&c.stage==='roof';
    if(!upstairs&&!(s.scene==='eavesGallery'&&c.stage==='shelter'))return;
    const x=upstairs?478:525,y=upstairs?175:323,w=upstairs?68:33,h=upstairs?60:42;
    const sway=reduceCameraMotion.matches?0:Math.sin(t/1700)*(upstairs?1.8:.6);
    ctx.save();ctx.translate(x,y);
    const shade=ctx.createLinearGradient(0,0,w,0);shade.addColorStop(0,'#aaa080');shade.addColorStop(.19,'#e4dcc1');shade.addColorStop(.32,'#c5bda1');shade.addColorStop(.51,'#eee5ca');shade.addColorStop(.72,'#c2bba6');shade.addColorStop(1,'#e1d8bd');
    ctx.fillStyle=shade;ctx.strokeStyle='#81755c';ctx.lineWidth=.85;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(w,-3);ctx.lineTo(w+sway,h-3);ctx.quadraticCurveTo(w*.55,h+3,w*.26+sway,h-1);ctx.lineTo(sway,h);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.strokeStyle='rgba(79,93,90,.60)';for(const n of [6,9]){ctx.beginPath();ctx.moveTo(sway,h-n);ctx.lineTo(w+sway,h-n-2);ctx.stroke();}ctx.restore();
  }
  return {show,draw};
})();
