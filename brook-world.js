/* The lane is an optional walking route. Its uphill exit uses the usual foothill gate. */
(() => {
  const {world,assets} = window.NANLAN_DATA;
  assets.banyanBrook = 'banyan-brook-6100.webp';
  const door=(id,label,to,x,y,exit)=>({id,label,to,x,y,exit,type:'door'});
  const benchText='长凳靠溪的一头磨得发白。你坐下歇脚，才看见桥洞底下有一抹摇晃的亮光。风过榕树，几片叶子落进水里，先在桥脚打了个转，才顺流而去。';
  const railText='石栏上留着挑担人歇肩磨出的浅槽。你把手放上去，石头阴凉，脚下却传来水撞桥墩的轻响。从这里望过去，能看见青岚山脚的石阶。';
  const name='榕溪石径';
  // Each column gives the far and near edge of the actual ground. Linear
  // interpolation follows the arch and leaves both the water and rails solid.
  const banks=[[26,275,385],[100,276,405],[182,275,404],[254,274,388],[301,288,375],
    [343,299,358],[424,291,350],[518,288,347],[612,288,348],[705,297,359],
    [757,297,371],[832,283,395],[921,278,407],[1012,271,390],[1075,265,373]];
  function walkCorridor(x,y,pad=0) {
    if ((x>=245+pad*.5 && x<=294-pad*.5 && y>=218+pad*.5 && y<=294) ||
        (x>=203+pad*.5 && x<=285-pad*.5 && y>=213+pad*.5 && y<=231)) return true;
    for(let i=1;i<banks.length;i++){
      const a=banks[i-1],b=banks[i];
      if(x<a[0]||x>b[0])continue;
      const t=(x-a[0])/(b[0]-a[0]);
      return y>=a[1]+(b[1]-a[1])*t+pad*.5 && y<=a[2]+(b[2]-a[2])*t-pad*.5;
    }
    return false;
  }
  world.banyanBrook={name,asset:'banyanBrook',soundScene:'foothill',spawn:[96,327],
    arrivalFrom:{village:[96,327],foothill:[1008,327]},bounds:[26,213,1075,408],walkCorridor,
    objects:[door('brookVillage','沿溪回南澜村','village',46,327,[-1,0]),
      door('brookFoothill','过桥往青岚山脚','foothill',1050,326,[1,0]),
      {id:'brookBench',label:'溪亭长凳',x:239,y:218,type:'view',lines:benchText,scenic:true,approach:{x:252,y:228},hit:{x:196,y:170,w:87,h:53}},
      {id:'brookRail',label:'石栏听水',x:527,y:349,type:'view',lines:railText,scenic:true,approach:{x:527,y:331},hit:{x:444,y:333,w:160,h:33}}]};
  world.village.objects.push(door('villageBrook',name,'banyanBrook',987,334,[1,0]));
  world.foothill.objects.push(door('foothillBrook',name,'banyanBrook',1012,435,[1,0]));
  world.village.arrivalFrom={...world.village.arrivalFrom,banyanBrook:[932,339]};
  world.foothill.arrivalFrom={...world.foothill.arrivalFrom,banyanBrook:[934,435]};
  Object.assign(window.NANLAN_EN,{
    '榕溪石径':'Banyan Brook Lane','沿溪回南澜村':'Follow the brook back to Nanlan Village',
    '过桥往青岚山脚':'Cross to Qinglan Foothill','溪亭长凳':'The pavilion bench',
    '石栏听水':'Listen at the stone railing',
    [benchText]:'One end of the bench has been rubbed almost white. You sit for a moment and notice a glint of light trembling under the arch. A few banyan leaves blow into the brook, circle the pier, and drift away.',
    [railText]:'Carrying poles have worn a shallow groove in the railing. The stone feels cool under your palm. Water taps against the pier below. Beyond it you can just make out the first steps of Qinglan Mountain.'
  });
  // Preserve the painted front rail in front of passing feet, including its short posts.
  const rail = new Path2D('M286 376 L306 366 308 350 324 347 327 360 423 342 425 326 442 324 446 341 617 341 619 326 636 325 640 342 739 361 741 344 754 345 759 364 776 372 780 397 284 397 Z');
  const outline=new Path2D();outline.rect(0,0,1100,733);outline.addPath(rail);
  function actor(ctx,x,y,paint){
    if(x<255||x>806||y<292){paint(ctx,false);return;}
    ctx.save();ctx.clip(outline,'evenodd');paint(ctx,false);ctx.restore();
  }
  function water(ctx,time,darkness){
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    ctx.save();ctx.lineWidth=.8;ctx.lineCap='round';
    for(const [x,y,r,phase] of [[546,480,9,.2],[589,505,7,.81],[459,588,13,.46],[595,647,10,.1],[514,194,8,.38]]){
      const t=(time/4300+phase)%1;
      ctx.strokeStyle='rgba(227,233,201,'+Math.sin(t*Math.PI)*.25*(1-darkness*.8)+')';
      ctx.beginPath();ctx.ellipse(x,y+t*5,r*(.4+t),1.3+2*t,-.12,.25,2.6);ctx.stroke();
    }
    ctx.restore();
  }
  window.NanlanBrook={actor,water};
})();
