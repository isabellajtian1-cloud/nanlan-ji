/* Measurements are in the 1100 × 733 coordinate system of the paintings.
   The floor position of each foreground piece determines when it covers a figure. */
window.NanlanDepth = (() => {
  const plates = {};
  const limit = n => Math.max(0, Math.min(1, n));
  const aperture = (x,y,rx,ry,slant) => ({x,y,rx,ry,slant});
  const piece = (foot,points) => {
    const xy = points.split(' ').map(pair => pair.split(',').map(Number));
    const path = new Path2D();
    xy.forEach(([x,y],i) => i ? path.lineTo(x,y) : path.moveTo(x,y));
    path.closePath();
    const outside=new Path2D();outside.rect(-100,-100,1300,933);outside.addPath(path);
    return {foot,outside,left:Math.min(...xy.map(p=>p[0])),right:Math.max(...xy.map(p=>p[0])),
      top:Math.min(...xy.map(p=>p[1])),bottom:Math.max(...xy.map(p=>p[1]))};
  };
  function plate(names,kind,opening,foreground,water=[]) {
    const p = {kind,opening,foreground,water};
    for (const name of names.split(' ')) plates[name] = p;
  }
  // Posts are separate from the walls. The playable doorway remains clear.
  function threshold(left,right,postY,wallY) {
    return [
      piece(postY+103,`0,${wallY} ${left-36},${wallY} ${left-36},${postY+5} ${left-28},${postY} ${left-7},${postY} ${left},${postY+8} ${left},${postY+103} 0,${postY+103}`),
      piece(postY+103,`${right},${postY+8} ${right+6},${postY} ${right+28},${postY} ${right+36},${postY+6} ${right+36},${wallY} 1100,${wallY} 1100,${postY+103} ${right},${postY+103}`)
    ];
  }
  const hallGate = threshold(418,684,558,590);
  const bedroomGate = threshold(405,680,548,586);
  const shopGate = threshold(388,718,560,588);
  plate('hall','window',aperture(260,440,155,230,.28),[...hallGate,
    piece(312,'477,183 625,183 629,244 479,244'),
    piece(312,'479,244 487,244 487,313 479,313'),piece(312,'618,244 626,244 626,313 618,313')]);
  plate('study','window',aperture(732,425,190,183,-.50),[...bedroomGate,
    piece(280,'426,174 683,174 686,203 424,203')]);
  plate('bed','window',aperture(312,476,168,205,.43),[...bedroomGate,
    piece(288,'651,58 686,64 683,285 663,282'),piece(284,'873,61 901,61 901,270 884,276'),
    piece(287,'680,196 860,196 862,245 844,276 679,276')]);
  plate('store','window',aperture(373,452,214,168,.41),[...threshold(415,687,598,625),
    piece(598,'31,503 142,500 160,522 141,542 36,544')]);
  plate('backHall qLodge','window',aperture(276,400,143,216,.30),hallGate);
  plate('guild','window',aperture(378,397,252,116,-.54),[
    piece(360,'322,224 728,224 751,254 321,255'),piece(360,'339,253 350,253 351,358 340,358')]);
  plate('workshop','window',aperture(614,383,176,129,-.33),[
    piece(368,'91,275 326,227 335,244 92,295'),piece(369,'191,148 199,146 205,363 198,365')]);
  plate('pharmacy','window',aperture(265,465,156,186,.37),[...shopGate,
    piece(321,'365,208 784,208 794,230 795,316 367,317')]);
  plate('generalStore','window',aperture(535,479,269,190,.12),[...shopGate,
    piece(286,'327,154 802,154 813,196 809,283 324,283')]);
  plate('clothShop','window',aperture(634,437,204,207,-.25),[...shopGate,
    piece(278,'296,146 812,146 847,186 830,273 294,273')]);
  plate('bookShop','window',aperture(736,416,192,166,-.57),[...bedroomGate,
    piece(271,'386,175 748,175 774,202 374,202')]);
  plate('teahouse','window',aperture(228,416,158,215,.48),[...threshold(395,730,539,600),
    piece(386,'107,268 216,269 239,304 89,304'),piece(560,'899,401 993,402 1056,479 917,479')]);
  plate('countyInn','window',aperture(281,428,187,204,.37),[...threshold(390,720,552,621),
    piece(449,'78,282 195,288 166,349 49,354')]);
  plate('prefInn','window',aperture(265,390,160,208,.43),[...threshold(394,718,546,612),
    piece(508,'75,336 214,343 168,421 39,421')]);
  plate('prefRoom','window',aperture(288,420,168,176,.45),[...threshold(413,701,540,612),
    piece(290,'249,63 274,65 268,284 248,280')]);
  plate('prefTea','window',aperture(804,410,151,175,-.45),[...threshold(379,719,552,606),
    piece(429,'865,307 966,305 1027,347 919,356'),piece(424,'110,303 216,304 219,322 106,322')]);
  plate('countyRoom','window',aperture(248,440,157,202,.31),[...threshold(381,710,542,615),
    piece(248,'194,58 207,56 205,238 193,238')]);

  // Sun patches and glints follow the trees, awnings and shorelines in each plate.
  plate('gate','leaves',aperture(732,441,204,183,-.32),[
    piece(561,'284,493 320,482 382,496 380,537 314,560 280,545')]);
  plate('village','leaves',aperture(467,383,225,191,-.42),[
    piece(541,'722,501 797,481 851,468 851,489 748,523 722,527'),
    piece(414,'120,398 237,371 275,363 278,378 134,412')]);
  plate('market','awning',aperture(535,471,223,178,-.23),[
    piece(575,'903,488 998,456 1060,452 1067,473 915,512'),
    piece(574,'905,502 910,502 910,572 905,574'),piece(565,'199,511 222,510 298,536 285,544 198,521')]);
  plate('county','awning',aperture(546,474,234,192,-.33),[
    piece(620,'164,418 253,394 257,410 169,446 150,452 129,453'),
    piece(601,'249,413 256,408 255,576 248,580')]);
  plate('prefMarket','awning',aperture(533,453,257,190,-.27),[
    piece(609,'47,464 209,416 232,423 224,441 64,491'),piece(612,'216,455 224,452 223,608 216,612')]);
  plate('qingxi qFair','awning',aperture(567,431,218,165,.15),[
    piece(393,'99,253 126,260 290,276 354,256 385,252 386,265 287,290 109,271'),
    piece(390,'169,276 176,276 177,389 170,390'),piece(371,'156,250 164,249 164,367 158,367')]);
  plate('foothill','leaves',aperture(505,418,219,156,.3),[
    piece(381,'759,278 768,277 768,375 760,377'),
    piece(323,'734,270 791,278 793,289 738,282')],[[920,557,54],[932,486,40]]);
  plate('oldTrail','leaves',aperture(571,431,194,174,-.34),[
    piece(329,'208,145 216,145 216,293 209,294'),piece(325,'410,143 417,141 417,284 411,285')],[[944,200,28]]);
  plate('mountain','leaves',aperture(601,406,212,137,-.29),[
    piece(638,'743,481 776,455 823,448 836,454 866,503 847,553 809,587 749,583 729,558')]);
  plate('mountainside','leaves',aperture(586,399,198,144,-.18),[
    piece(594,'283,501 286,497 303,500 305,583 290,590 282,583')],[[965,435,24]]);
  plate('summit qBeacon','ridge',aperture(542,416,244,169,.18),[
    piece(398,'205,320 218,311 217,294 208,279 204,261 214,262 227,284 234,300 233,317 244,349 249,364 237,370 222,356')]);
  plate('bambooGrove qBamboo','leaves',aperture(569,398,183,162,-.26),[
    piece(655,'109,583 123,581 321,638 316,646'),piece(638,'118,533 124,518 130,539 126,622 118,621'),
    piece(639,'702,601 709,584 716,603 710,638 702,641')]);
  plate('coast qSalt','shore',aperture(529,449,271,169,-.11),[
    piece(551,'184,492 210,483 243,495 257,524 235,538 189,535')],
    [[475,274,113],[705,281,78],[860,382,61]]);
  plate('tidalflat','shore',aperture(613,426,259,152,-.07),[
    piece(506,'805,456 827,445 855,449 872,463 900,468 895,479 849,486 809,478')],
    [[591,424,64],[510,325,71],[672,554,86]]);
  plate('wharf qPier','shore',aperture(604,418,263,169,-.24),[
    piece(365,'348,320 351,315 370,314 381,321 379,331 373,335 373,357 353,359 353,335 347,331')],
    [[217,314,42],[356,102,89],[397,277,39]]);
  plate('prefDock','shore',aperture(591,446,262,163,-.31),[
    piece(633,'980,565 983,548 1001,548 1008,555 1005,625 983,628')],
    [[167,307,48],[290,198,53]]);
  plate('anchorage','shore',aperture(565,460,260,173,-.18),[
    piece(352,'253,288 330,287 335,302 334,345 260,346')],
    [[530,298,51],[775,306,29],[380,288,35]]);
  plate('homeLane','leaves',aperture(484,484,215,145,-.15),[piece(689,'0,448 37,487 108,528 166,563 204,610 288,649 329,673 301,685 160,674 0,629')]);
  plate('reedLanding','shore',aperture(599,371,204,106,-.25),[],[[940,420,23],[905,435,17]]);
  plate('washingCourt','leaves',aperture(590,490,195,172,.11),[]);
  plate('serviceKitchen','window',aperture(538,426,163,156,.21),[]);
  plate('dryingLoft','leaves',aperture(567,510,239,128,-.2),[]);
  plate('eavesGallery','window',aperture(482,424,190,148,.22),[
    piece(450,'278,86 310,83 315,422 325,434 324,450 271,450 270,435 278,422'),
    piece(507,'757,73 797,70 798,461 810,478 811,506 749,506 749,479 761,460')
  ]);
  plate('banyanBrook','leaves',aperture(485,315,179,103,-.2),[]);
  plate('yard','leaves',aperture(545,345,133,95,-.32),[]);

  // A close arrival opens out with actual walking distance. Standing still,
  // opening a conversation, or bouncing against a wall spends no distance.
  function framing(scene,previous,player,moving,compact,reduced) {
    const p=plates[scene];
    const travel=previous && previous.scene===scene
      ? previous.travel+(moving?Math.min(25,Math.hypot(player.x-previous.x,player.y-previous.y)):0) : 0;
    const t=limit(travel/(p.kind==='window'?155:205));
    const eased=t*t*(3-2*t);
    const near=p.kind==='window' ? .27 : .24;
    return {scene,x:player.x,y:player.y,travel:Math.min(235,travel),
      zoom:reduced?1:1+(1-eased)*near*(compact ? .76 : 1)};
  }
  const lightMaps=new WeakMap();
  function groundMap(image) {
    if (!(image?.naturalWidth || image?.width)) return null;
    if (lightMaps.has(image)) return lightMaps.get(image);
    const c=document.createElement('canvas');c.width=80;c.height=54;
    const g=c.getContext('2d',{willReadFrequently:true});
    let map=null;
    try {
      g.drawImage(image,0,0,80,54);
      const rgb=g.getImageData(0,0,80,54).data;
      map=new Uint8Array(80*54);
      const shade=g.createImageData(80,54);
      for(let i=0;i<map.length;i++) {
        map[i]=rgb[i*4]*.27+rgb[i*4+1]*.62+rgb[i*4+2]*.11;
        const offset=i*4;
        shade.data[offset]=39;shade.data[offset+1]=52;shade.data[offset+2]=47;
        shade.data[offset+3]=Math.round(limit((177-map[i])/110)*255);
      }
      g.putImageData(shade,0,0);
      map={values:map,colors:rgb,canopy:c};
    } catch { /* Local file previews may restrict pixel reads. The mapped lights still work. */ }
    lightMaps.set(image,map);
    return map;
  }
  function groundSample(map,x,y) {
    if(!map)return {light:.52, color:null};
    const u=limit(x/1100)*78.99,v=limit(y/733)*52.99;
    const i=Math.floor(v)*80+Math.floor(u),fx=u%1,fy=v%1;
    const sample=(values,stride,channel)=>{
      const start=i*stride+channel;
      const top=values[start]*(1-fx)+values[start+stride]*fx;
      const bottom=values[start+80*stride]*(1-fx)+values[start+81*stride]*fx;
      return top*(1-fy)+bottom*fy;
    };
    const light=limit((sample(map.values,1,0)-58)/145);
    const rgb=[0,1,2].map(k=>Math.round(sample(map.colors,4,k)));
    return {light,color:'rgb('+rgb.join(',')+')'};
  }
  function frame(scene,image,day,weather,sourceWidth) {
    const cloud=weather?.wet ? .29 : weather?.id==='fog' ? .45 : weather?.id==='cloud' ? .67 : 1;
    // An enlarged cache has more pixels, but its source still sets the painted detail scale.
    const width=sourceWidth||image?.naturalWidth||image?.width;
    // Faces and woven patterns need finer sampling than a broad painted stroke.
    const density=width?Math.max(2,Math.min(4,width/1100*1.85)):4;
    return {p:plates[scene],map:groundMap(image),density,day,sun:(1-day.darkness)*cloud};
  }
  function beam(opening,x,y) {
    const dy=(y-opening.y)/opening.ry;
    const dx=(x-opening.x-(y-opening.y)*opening.slant)/opening.rx;
    return Math.exp(-2.1*(dx*dx+dy*dy));
  }
  function lightAt(f,x,y) {
    const sample=groundSample(f.map,x,y);
    return {patch:beam(f.p.opening,x,y)*f.sun,ground:sample.light,color:sample.color};
  }
  function surface(){return document.createElement('canvas').getContext('2d');}
  function raster(view,x,y,w,h,ground,paintDensity=4){
    // Keep device alignment near the native target. A second, nearly 1:1
    // resample visibly softens the eyes without changing the silhouette.
    const res=ground?Math.min(1,view.a):view.a<=paintDensity*1.12?view.a:paintDensity;
    const snap=(v,offset)=>(Math.floor(v*res+offset)-offset)/res;
    const left=snap(x,view.e*res/view.a),top=snap(y,view.f*res/view.d);
    return {res,left,top,w:Math.ceil((x+w-left)*res),h:Math.ceil((y+h-top)*res)};
  }
  function prepare(g,r){
    const w=Math.ceil(r.w/32)*32,h=Math.ceil(r.h/32)*32;
    if(g.canvas.width<w)g.canvas.width=w;
    if(g.canvas.height<h)g.canvas.height=h;
    g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,r.w,r.h);
    g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
    g.setTransform(r.res,0,0,r.res,-r.left*r.res,-r.top*r.res);
  }
  function bounce(brush,color,x,y,radius,height,sun){
    if(!color)return;
    const fade=brush.createLinearGradient(x,y-height,x,y);
    fade.addColorStop(0,'transparent');fade.addColorStop(1,color);
    brush.save();brush.globalCompositeOperation='source-atop';
    brush.globalAlpha=.12+.11*sun;brush.fillStyle=fade;
    brush.fillRect(x-radius,y-height,2*radius,height+2);brush.restore();
  }
  let body,shade;
  function actor(target,x,y,scale,f,paint,groundPass=false){
    const {p,sun}=f,view=target.getTransform();
    // Discard offscreen actors before doing the two small alpha composites.
    const half=76*scale,height=116*scale,size=2*half;
    if((x+half)*view.a+view.e<0||(x-half)*view.a+view.e>target.canvas.width||
       (y+24*scale)*view.d+view.f<0||(y-height)*view.d+view.f>target.canvas.height)return;
    const brush=groundPass?(shade ||= surface()):(body ||= surface());
    const r=raster(view,x-half,y-height,size,size,groundPass,f.density);
    const {left,top}=r,w=r.w/r.res,h=r.h/r.res,region=Math.max(w,h);
    prepare(brush,r);brush.save();paint(brush,true);brush.restore();
    target.save();
    // Remove only figure/shadow pixels. The in-game plate and its repair state show through.
    for(const o of p.foreground){
      if(y>o.foot||x+half<o.left||x-half>o.right||y-height>o.bottom||y+10<o.top)continue;
      target.clip(o.outside,'evenodd');
    }
    if(groundPass){
      const {patch,ground}=lightAt(f,x,y);
      shade.save();shade.globalCompositeOperation='source-in';shade.fillStyle='#3b3935';
      shade.fillRect(left,top,w,h);shade.restore();
      target.save();
      target.translate(x,y);target.transform(1,0,-p.opening.slant*.76,-(.10+.13*sun),0,0);
      target.globalAlpha=.045+sun*(.05+.13*ground+.09*patch);
      target.drawImage(shade.canvas,0,0,r.w,r.h,left-x,top-y,w,h);target.restore();
      target.save();target.translate(x,y);target.scale(1,.26);
      const radius=17*scale,contact=target.createRadialGradient(0,0,0,0,0,radius);
      contact.addColorStop(0,'rgba(41,34,28,.61)');contact.addColorStop(.35,'rgba(48,40,32,.32)');contact.addColorStop(1,'rgba(48,40,32,0)');
      target.fillStyle=contact;target.fillRect(-radius,-radius,2*radius,2*radius);target.restore();
      target.restore();
      return;
    }
    const {patch,ground,color}=lightAt(f,x,y);
    body.save();body.globalCompositeOperation='source-atop';
    body.fillStyle=p.kind==='leaves'?'#344837':'#333e51';
    body.globalAlpha=.035+(1-ground)*.16;
    body.fillRect(left,top,region,region);
    const warm=body.createLinearGradient(x-half,top,x+half,y);
    warm.addColorStop(0,'rgba(255,230,175,.8)');warm.addColorStop(1,'rgba(253,207,126,.12)');
    body.fillStyle=warm;body.globalAlpha=patch*.23+ground*sun*.055;
    body.fillRect(left,top,region,region);
    if(f.map && sun>.04 && (p.kind==='leaves'||p.kind==='awning')) {
      // Lift the shade already painted on the road onto the walking silhouette.
      // The upper sleeve intercepts a different part of the canopy than the hem.
      body.save();body.globalAlpha=sun*.28;
      body.translate(0,y);body.transform(1,0,-p.opening.slant/.46,1/.46,0,0);
      body.drawImage(f.map.canopy,0,-y,1100,733);body.restore();
    }
    if(p.kind==='window'&&patch>.08) {
      // World-anchored lattice. Sleeves cross the bars as their owner walks.
      body.globalAlpha=patch*.12;body.strokeStyle='#5e5144';body.lineWidth=2.6;
      const slope=p.opening.slant,base=Math.floor((left-slope*top)/17)*17;
      body.beginPath();
      for(let k=-4;k<20;k++){const a=base+17*k;body.moveTo(a+slope*top,top);body.lineTo(a+slope*(top+region),top+region);}
      body.stroke();
    }
    body.restore();
    bounce(body,color,x,y,half,80*scale,sun);
    target.drawImage(body.canvas,0,0,r.w,r.h,left,top,w,h);target.restore();
  }
  function air(ctx,f,time,reduced) {
    if(reduced||f.sun<.03)return;
    const {p,sun}=f;
    ctx.save();
    if(p.kind==='window') {
      const a=p.opening;
      ctx.fillStyle='#fff0c5';
      for(let i=0;i<9;i++) {
        const t=(time/12500+i*.38197)%1;
        const dx=Math.sin(i*27.3)*a.rx*.52+t*12;
        const y=a.y-a.ry*.42+Math.cos(i*13.1)*a.ry*.47-t*22;
        ctx.globalAlpha=Math.sin(t*Math.PI)*.36*sun;
        ctx.beginPath();ctx.arc(a.x+dx+(y-a.y)*a.slant,y,i%3===0?1.05:.64,0,2*Math.PI);ctx.fill();
      }
    }
    ctx.strokeStyle='#f9eed2';ctx.lineWidth=1;ctx.lineCap='round';
    for(const [x,y,r] of p.water)for(let j=0;j<3;j++) {
      const t=(time/4900+x*.043+j*.39)%1;
      const px=x+Math.sin(j*4.3+y)*r*.57,py=y+j*3+t*1.7;
      ctx.globalAlpha=Math.sin(t*Math.PI)*sun*.32;ctx.beginPath();
      ctx.ellipse(px,py,Math.max(1,r*(.07+.20*t)),.75+.35*t,-.035,.2,2.9);ctx.stroke();
    }
    ctx.restore();
  }
  return {plates,framing,frame,actor,air,lightAt,raster,prepare,bounce};
})();
