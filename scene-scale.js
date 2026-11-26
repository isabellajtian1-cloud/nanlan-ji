/* Dimensions refer to the original 1100 by 733 paintings. Scale is measured
   at a character's soles, so actors sharing a row share the same perspective. */
(function(root, make) {
  const api = make();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.NanlanSceneScale = api;
})(globalThis, () => {
  const profiles = {};
  function group(names, nearY, farScale, nearScale, zoom) {
    for (const name of names.split(' ')) profiles[name] = {nearY, farScale, nearScale, zoom};
  }
  group('hall study bed store', 610, 1.52, 1.89, 1.55);
  group('pharmacy generalStore teahouse workshop guild backHall qLodge clothShop bookShop countyInn prefInn prefRoom prefTea countyRoom', 630, 1.28, 1.69, 1.58);
  group('gate', 660, 1.38, 1.66, 1.57);
  group('yard', 455, .72, .90, 1.98);
  group('county market prefMarket village qingxi qFair', 645, .73, 1.06, 1.93);
  group('wharf anchorage prefDock qPier', 630, .77, 1.05, 1.92);
  group('foothill mountain mountainside summit bambooGrove coast tidalflat oldTrail qSalt qBamboo qBeacon', 645, .71, 1.03, 1.98);
  group('homeLane reedLanding eavesGallery washingCourt serviceKitchen dryingLoft', 620, .84, 1.10, 2.04);
  group('banyanBrook', 600, .80, 1.07, 1.85);

  function actor(scene, y) {
    const p = profiles[scene];
    if (!p) return 1;
    const farY = scene === 'yard' ? 200 : 260;
    const depth = Math.min(1, Math.max(0, (y - farY) / (p.nearY - farY)));
    return p.farScale + (p.nearScale - p.farScale) * depth;
  }
  function zoom(scene) { return profiles[scene]?.zoom || 1.65; }

  // Painted openings beyond the former rectangular play areas.
  const extensions = {
    gate: [[174,424,303,581],[475,615,815,701]],
    village: [[425,244,615,309],[461,604,612,669],[939,307,1005,365]],
    foothill: [[467,601,600,700],[914,411,1034,454],[200,262,445,310]],
    market: [[456,605,647,679]],
    county: [[448,605,635,680]],
    hall: [[426,599,665,676],[139,411,216,548],[223,279,902,308]],
    study: [[426,599,665,676],[181,375,249,529],[248,282,845,312]],
    bed: [[426,599,665,676],[184,375,243,530],[239,275,848,310]],
    store: [[426,599,665,676],[253,268,787,310]]
  };
  const original = new WeakMap();
  // The east path bends back uphill behind the bamboo rail. Its centre and
  // width follow the stones at each row, in the painting's world coordinates.
  const eastLane = [[249,873,10],[260,899,12],[276,926,13],
    [293,956,16],[311,978,19],[336,982,22],[358,975,24],[382,958,25]];
  function onEastLane(x,y){
    for(let i=1;i<eastLane.length;i++){
      const [y0,x0,w0]=eastLane[i-1], [y1,x1,w1]=eastLane[i];
      if(y<y0||y>y1)continue;
      const t=(y-y0)/(y1-y0);
      return Math.abs(x-(x0+t*(x1-x0)))<=w0+t*(w1-w0);
    }
    return false;
  }
  const laneMouth={x:982,y:336};
  function laneRoute(from,to){
    const centre=y=>{
      const i=eastLane.findIndex(row=>row[0]>=y);
      if(i<=0)return {x:eastLane[0][1],y};
      const [a,x]=eastLane[i-1], [b,z]=eastLane[i];
      return {x:x+(z-x)*(y-a)/(b-a),y};
    };
    const turns=eastLane.filter(([y])=>y>Math.min(from.y,to.y)&&y<Math.max(from.y,to.y));
    if(from.y>to.y)turns.reverse();
    return [centre(from.y),...turns.map(([y,x])=>({x,y})),centre(to.y),to];
  }
  function configure(world) {
    for (const [id, lanes] of Object.entries(extensions)) {
      const w = world[id];
      if (original.has(w)) continue;
      if (id === 'bed') w.collisions = (w.collisions || []).filter(r => r.join(',') !== '740,275,90,36');
      for (const o of w.objects) {
        const placement = furnishing(id,o);
        if (placement) { o.x = placement.x; o.y = placement.y; }
      }
      const base = w.bounds.slice(); original.set(w, base);
      w.bounds = [Math.min(base[0], ...lanes.map(r => r[0])), Math.min(base[1], ...lanes.map(r => r[1])),
        Math.max(base[2], ...lanes.map(r => r[2])), Math.max(base[3], ...lanes.map(r => r[3]))];
      if (['hall','study','bed','store'].includes(id)) w.objects.find(o => o.id === 'exit-yard').y = 659;
    }
  }
  const within = (r,x,y) => x >= r[0] && y >= r[1] && x <= r[2] && y <= r[3];
  function outside(id, scene, x, y, clearance=0) {
    const base = original.get(scene);
    if (!base) return false;
    const onFloor=(px,py)=>within(base,px,py)||extensions[id].some(r=>within(r,px,py))||
      (id==='village' && onEastLane(px,py));
    if (!onFloor(x,y)) return true;
    // A smoothed route must clear the inside corner even between sampled points.
    if (id==='village' && x>835 && y<320 && clearance>0) {
      const edge=Math.min(3,clearance);
      return !onFloor(x-edge,y)||!onFloor(x+edge,y)||!onFloor(x,y-edge)||!onFloor(x,y+edge);
    }
    return false;
  }

  // These walls are visible in all four painted room states. The opening stays
  // clear at the centre. Feet and pathfinding use the wall's floor position.
  const threshold = [{x:5,y:572,w:400,h:112},{x:700,y:572,w:395,h:112}];
  const tables = {
    hall:[{x:356,y:224,w:107,h:40},{x:627,y:224,w:106,h:40}],
    bed:[{x:686,y:231,w:212,h:57},{x:840,y:295,w:61,h:47}],
    study:[{x:423,y:213,w:264,h:58},{x:854,y:300,w:48,h:62}]
  };
  const roomsWithWalls = new Set(['hall','study','bed','store']);
  function solids(id) {
    return roomSolids[id] || empty;
  }
  const empty = [], roomSolids = {};
  for (const id of roomsWithWalls) roomSolids[id] = [...threshold, ...(tables[id] || [])];

  // Select the furniture where the player sees it. Only the front edges are
  // approach points, so opening a book or resting never puts feet on the wood.
  const furniture = {
    'bed:bedRest': {x:791,y:286, hit:{x:697,y:70,w:207,h:217}, approach:[790,308]},
    'study:books': {x:546,y:269, hit:{x:425,y:165,w:258,h:107}, approach:[546,296]}
  };
  function furnishing(id, object) {return furniture[id+':'+object.id];}

  const props = {
    waterJar:{width:39,height:34,foot:[-15,-10,30,12]},
    stove:{width:60,height:40,foot:[-24,-16,48,18]},
    workbench:{width:167,height:112,foot:[-66,-53,132,55]},
    bookBox:{width:39,height:33,foot:[-17,-16,34,18]}
  };
  return {profiles,actor,zoom,configure,outside,onEastLane,laneMouth,laneRoute,solids,furnishing,furniture,props};
});
