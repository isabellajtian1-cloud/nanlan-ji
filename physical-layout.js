/* Solid painted prop bounds and separate, reachable interaction positions. */
(function(root,make){const api=make();if(typeof module==='object'&&module.exports)module.exports=api;else root.NanlanPhysical=api;})(globalThis,()=>{
 const boxes={mealTable:[-88,-137,176,137],v5FamilyTable:[-88,-137,176,137],workbench:[-77,-100,154,101],bookBox:[-22,-38,44,40],waterJar:[-23,-48,46,50],stove:[-36,-58,72,60]};
 function configure(world){for(const id of ['mealTable','v5FamilyTable']){const o=world.hall.objects.find(o=>o.id===id);if(o)Object.assign(o,{x:560,y:316});}world.hall.collisions=(world.hall.collisions||[]).filter(r=>r.join(',')!=='475,375,70,45');Object.assign(world.yard.objects.find(o=>o.id==='festivalLantern'),{x:604,y:273});Object.assign(world.store.objects.find(o=>o.id==='workbench'),{x:360,y:545});Object.assign(world.store.objects.find(o=>o.id==='oldAxe'),{x:455,y:545});Object.assign(world.store.objects.find(o=>o.id==='bookBox'),{x:760,y:560});}
 function rect(o,s){if(o.solid)return o.solid;let r=boxes[o.id];if(o.id==='goodsCrates'&&!s.flags.cratesRaised&&s.quests.M14?.status!=='ACTIVE')r=[-52,-67,120,76];if(o.festival)r=[-35,-68,70,72];if(o.v3Art!=null){const w=[62,68,48,38][o.v3Art];r=[-w*.46,-w*.84,w*.92,w*.94];}return r?{x:o.x+r[0],y:o.y+r[1],w:r[2],h:r[3]}:null;}
 function contains(r,x,y,pad=0){return x>r.x-pad&&x<r.x+r.w+pad&&y>r.y-pad&&y<r.y+r.h+pad;}
 function depth(r,x,y,pad=0){return Math.min(x-r.x+pad,r.x+r.w+pad-x,y-r.y+pad,r.y+r.h+pad-y);}
 function anchors(o,s){const r=rect(o,s);if(!r)return null;return [{x:o.x,y:r.y+r.h+24},{x:r.x-24,y:r.y+r.h-8},{x:r.x+r.w+24,y:r.y+r.h-8}];}
 return {rect,contains,depth,anchors,configure};
});
