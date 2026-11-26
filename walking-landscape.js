/* Painted depth in the coordinate system of the original scene plates. */
window.NanlanLandscape = (() => {
  const views = {
    village: {zoom:2.34, distant:[1030,85,179,121], branches:[[330,172,.72,-1]]},
    banyanBrook: {zoom:2.56, distant:[503,83,89,173], branches:[[175,229,.86,-1],[849,221,1.12,1]]}
  };
  // Choose background and foreground details outside the walking surface.
  // Rooms use a much smaller displacement than a shoreline or a mountain.
  function detail(names, distant, near, depth){
    const view={distant,near,depth};
    for(const name of names.split(' '))views[name]=view;
  }
  detail('gate',[570,112,240,94],[68,585,115,123],.74);
  detail('yard',[552,75,156,61],[63,558,106,157],.66);
  detail('hall',[547,95,168,69],[164,628,190,62],.28);
  detail('study',[536,96,189,66],[80,631,98,66],.27);
  detail('bed',[365,99,118,78],[918,634,132,60],.24);
  detail('store',[598,107,202,72],[73,541,89,83],.29);
  detail('market',[524,108,140,81],[1021,481,107,87],.65);
  detail('county',[557,94,159,76],[84,425,96,107],.64);
  detail('pharmacy',[548,101,190,64],[922,646,155,61],.27);
  detail('generalStore',[558,86,173,70],[148,634,145,59],.29);
  detail('teahouse',[539,84,160,64],[980,463,103,78],.28);
  detail('foothill',[582,83,210,78],[68,613,126,122],.84);
  detail('mountain',[816,90,221,83],[935,628,147,117],1);
  detail('mountainside',[685,85,230,85],[62,616,126,122],.96);
  detail('summit qBeacon',[295,101,255,104],[947,588,151,117],1);
  detail('bambooGrove qBamboo',[536,126,160,106],[83,537,112,156],.83);
  detail('coast qSalt',[578,142,280,80],[90,629,138,94],1);
  detail('tidalflat',[543,122,287,73],[976,597,134,106],.94);
  detail('wharf qPier',[388,99,183,73],[65,544,98,130],.77);
  detail('workshop',[548,105,176,72],[1004,409,92,141],.32);
  detail('oldTrail',[588,103,167,94],[70,571,100,134],.83);
  detail('qingxi qFair',[534,105,192,84],[91,291,97,89],.7);
  detail('anchorage',[690,105,241,78],[1004,559,104,116],.86);
  detail('guild',[541,100,177,78],[84,474,94,118],.29);
  detail('backHall qLodge',[529,91,200,65],[151,637,142,62],.28);
  detail('clothShop',[548,86,168,66],[947,638,155,66],.25);
  detail('bookShop',[555,95,174,79],[141,626,143,61],.26);
  detail('countyInn',[526,101,175,69],[70,327,78,89],.3);
  detail('prefInn',[534,90,161,68],[107,377,96,72],.31);
  detail('prefRoom',[521,87,170,64],[964,630,127,57],.24);
  detail('prefTea',[547,95,155,68],[1007,387,93,97],.29);
  detail('prefDock',[492,111,172,85],[1027,586,93,108],.79);
  detail('prefMarket',[733,99,150,83],[86,445,106,96],.68);
  detail('countyRoom',[551,89,139,69],[123,641,139,63],.25);
  detail('homeLane',[582,92,179,80],[79,532,123,117],.72);
  detail('reedLanding',[710,105,221,86],[91,611,132,106],.9);
  detail('eavesGallery',[605,103,180,80],[88,598,110,103],.45);
  detail('washingCourt',[580,92,173,76],[81,611,98,108],.48);
  detail('serviceKitchen',[550,103,155,77],[1031,401,74,126],.28);
  detail('dryingLoft',[620,93,213,83],[69,521,87,131],.7);
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
  function paintedDetail(picture,[x,y,rx,ry]){
    const valley=document.createElement('canvas');
    // Keep the same sampling density as the seasonally graded ground. A
    // world-sized crop discards the small branches and rooflines before zoom.
    valley.width=Math.ceil(rx*2*picture.width/1100);
    valley.height=Math.ceil(ry*2*picture.height/733);
    const g=valley.getContext('2d');
    g.scale(valley.width/(rx*2),valley.height/(ry*2));
    g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
    g.drawImage(picture,rx-x,ry-y,1100,733);
    g.save();g.scale(rx,ry);
    const fade=g.createRadialGradient(1,1,0,1,1,1);
    fade.addColorStop(0,'#000');fade.addColorStop(.52,'#000');fade.addColorStop(1,'transparent');
    g.globalCompositeOperation='destination-in';g.fillStyle=fade;g.fillRect(0,0,2,2);g.restore();
    return valley;
  }
  function makePlanes(picture,view){
    const valley=paintedDetail(picture,view.distant);
    if(view.near)return {valley,near:paintedDetail(picture,view.near)};

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
    return {valley,spray};
  }
  function paint(ctx,picture,scene,camera,front,reduced){
    const view=views[scene];if(!view||!picture||camera.whole)return;
    if(view.near&&(front||reduced))return;
    let cached=cache.get(picture);
    if(cached?.view!==view){cached={view,...makePlanes(picture,view)};cache.set(picture,cached);}
    const {valley,near,spray}=cached;
    const cx=(camera.vw*.5-camera.ox)/camera.scale;
    const cy=(camera.vh*.5-camera.oy)/camera.scale;
    const [x,y,rx,ry]=view.distant;
    if(near){
      // Foot position also contributes when the camera reaches a map edge.
      // Repaint both layers behind actors and the physical occlusion masks.
      const px=cx*.72+(camera.walk?.x??cx)*.28;
      const py=cy*.72+(camera.walk?.y??cy)*.28;
      const dx=Math.max(-1,Math.min(1,(px-550)/395))*view.depth;
      const dy=Math.max(-1,Math.min(1,(py-363)/265))*view.depth;
      ctx.drawImage(valley,x-rx+dx*7,y-ry+dy*4,rx*2,ry*2);
      const [nx,ny,nrx,nry]=view.near;
      ctx.drawImage(near,nx-nrx-dx*9,ny-nry-dy*5,nrx*2,nry*2);
      return;
    }
    if(!front){
      if(!reduced)ctx.drawImage(valley,x-rx+(cx-550)*.032,y-ry+(cy-300)*.022,2*rx,2*ry);
      return;
    }
    for(const [anchor,tip,size,side] of view.branches){
      const dx=reduced?0:(anchor-cx)*.18,dy=reduced?0:(300-cy)*.12;
      const top=Math.min(tip+dy-size*172,-camera.oy/camera.scale-4);
      ctx.save();ctx.translate(anchor+dx,top);ctx.scale(size*side,size);
      ctx.globalAlpha=.98;
      ctx.drawImage(spray,0,0,185,172);ctx.restore();
    }
  }
  return {views,walkingFrame,paint};
})();
