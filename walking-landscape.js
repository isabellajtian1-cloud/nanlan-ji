/* The road, bridge and clickable scenery use the ground camera. Only the
   distant valley and foliage over the lens have a separate depth. */
window.NanlanLandscape = (() => {
  const views = {
    village: {zoom:2.34, distant:[1030,85,179,121], branches:[[330,172,.72,-1]]},
    banyanBrook: {zoom:2.56, distant:[503,83,89,173], branches:[[175,229,.86,-1],[849,221,1.12,1]]}
  };
  const cache = new WeakMap();
  function walkingFrame(player, previous, moving, reduced, span){
    const entry = {x:player.x,y:player.y,lookX:previous?.lookX||0,lookY:previous?.lookY||0};
    if(reduced){entry.lookX=0;entry.lookY=0;}
    else if(moving && previous){
      const dx=player.x-previous.x,dy=player.y-previous.y,d=Math.hypot(dx,dy);
      if(d>0 && d<32){
        // Blend by distance so a pivot or a dropped frame cannot whip the view.
        const weight=1-Math.exp(-d/27);
        entry.lookX+=(dx/d-entry.lookX)*weight;
        entry.lookY+=(dy/d-entry.lookY)*weight;
      }
    }
    entry.aheadX=entry.lookX*Math.min(58,span.width*.095);
    entry.aheadY=entry.lookY*Math.min(22,span.height*.055);
    return entry;
  }
  function makePlanes(picture,view){
    const [x,y,rx,ry]=view.distant;
    const valley=document.createElement('canvas');
    valley.width=rx*2;valley.height=ry*2;
    const g=valley.getContext('2d');
    g.drawImage(picture,rx-x,ry-y,1100,733);
    g.save();g.scale(rx,ry);
    const fade=g.createRadialGradient(1,1,0,1,1,1);
    fade.addColorStop(0,'#000');fade.addColorStop(.52,'#000');fade.addColorStop(1,'transparent');
    g.globalCompositeOperation='destination-in';g.fillStyle=fade;g.fillRect(0,0,2,2);g.restore();

    // The small foreground spray takes its leaf colour and surface texture
    // from the painted canopy for the active season.
    const spray=document.createElement('canvas');
    spray.width=370;spray.height=344;
    const b=spray.getContext('2d');b.scale(2,2);
    const sticks=[[0,-6,18,70,86,100,129,153],[34,68,59,53,85,48,116,51],
      [58,95,45,108,47,128,50,150],[78,111,107,104,133,107,154,118],
      [18,47,32,37,47,31,66,29]];
    for(const [i,s] of sticks.entries()){
      b.beginPath();b.moveTo(s[0],s[1]);b.bezierCurveTo(...s.slice(2));b.lineCap='round';
      b.strokeStyle='#544d32';b.lineWidth=i===0?3.6:1.4;b.stroke();
      for(let j=2;j<=8;j++){
        const t=j/8,u=1-t;
        const at=k=>u*u*u*s[k]+3*u*u*t*s[2+k]+3*u*t*t*s[4+k]+t*t*t*s[6+k];
        b.save();b.translate(at(0),at(1));b.rotate((j%2?-.94:.80)+.20*Math.sin(i+j));
        const len=11+(j*3+i)%7,w=3.4+(j+i)%3;
        b.beginPath();b.moveTo(0,0);b.quadraticCurveTo(w*1.85,len*.40,0,len);
        b.quadraticCurveTo(-w*1.25,len*.57,0,0);b.closePath();b.clip();
        const sx=(view===views.village?180:780)+(i*17+j*11)%65, sy=12+(i*7+j*11)%39;
        b.drawImage(picture,sx*picture.width/1100,sy*picture.height/733,11*picture.width/1100,18*picture.height/733,-w,0,w*2,len);
        b.fillStyle='rgba(37,56,30,.25)';b.fillRect(-w,0,w,len);
        b.strokeStyle='rgba(199,194,126,.5)';b.lineWidth=.55;b.beginPath();b.moveTo(0,0);b.lineTo(0,len*.87);b.stroke();
        b.restore();
      }
    }
    const planes={valley,spray};cache.set(picture,planes);return planes;
  }
  function paint(ctx,picture,scene,camera,front,reduced,darkness){
    const view=views[scene];if(!view||!picture||camera.whole)return;
    const {valley,spray}=cache.get(picture)||makePlanes(picture,view);
    const cx=(camera.vw*.5-camera.ox)/camera.scale;
    const cy=(camera.vh*.5-camera.oy)/camera.scale;
    const [x,y,rx,ry]=view.distant;
    if(!front){
      if(!reduced)ctx.drawImage(valley,x-rx+(cx-550)*.032,y-ry+(cy-300)*.022);
      return;
    }
    for(const [anchor,tip,size,side] of view.branches){
      const dx=reduced?0:(anchor-cx)*.18,dy=reduced?0:(300-cy)*.12;
      const top=Math.min(tip+dy-size*172,-camera.oy/camera.scale-4);
      ctx.save();ctx.translate(anchor+dx,top);ctx.scale(size*side,size);
      ctx.globalAlpha=.98;
      if(darkness>.05)ctx.filter='brightness('+Math.max(.43,1-darkness*.56)+')';
      ctx.drawImage(spray,0,0,185,172);ctx.restore();
    }
  }
  return {views,walkingFrame,paint};
})();
