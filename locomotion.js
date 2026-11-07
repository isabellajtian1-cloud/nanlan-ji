/* Distances, poses and sole anchors share the same authored character scale. */
(function(root,make){const api=make();if(typeof module==='object'&&module.exports)module.exports=api;else root.NanlanLocomotion=api;})(globalThis,()=>{
'use strict';
const idle=[[[198,18,350],[180,18,350],[154,18,350]],[[198,8,342],[179,10,342],[154,10,342]],[[198,14,346],[179,16,346],[152,16,346]],[[198,6,344],[180,10,344],[154,10,344]]];
// [head center, top, grounded sole], measured independently for each painted frame.
const walk=[
 [[[210,22,496],[181,20,491],[215,18,492]],[[208,10,480],[183,10,475],[205,12,475]]],
 [[[237,9,484],[203,9,485],[180,10,478]],[[222,3,473],[207,3,480],[186,5,461]]],
 [[[211,22,496],[181,21,493],[216,20,493]],[[208,10,484],[183,10,478],[209,10,480]]],
 [[[238,9,487],[202,9,487],[179,11,480]],[[222,1,475],[206,2,481],[186,4,465]]]
];
function pose(gender,silk,direction,phase,walking){
 const variant=(silk?2:0)+(gender==='male'?1:0),col=direction==='down'?0:direction==='up'?1:2;
 const cycle=((phase/(Math.PI*2))%1+1)%1,passing=walking&&((cycle>=.32&&cycle<.5)||cycle>=.82),rest=!walking||passing,row=cycle<.5?0:1;
 const [center,top,foot]=rest?idle[variant][col]:walk[variant][row][col],height=gender==='male'?88:84,scale=height/(foot-top);
 const cellHeight=gender==='male'?500:512;
 return {idle:rest,passing,flip:direction==='left',source:rest?[col*362,variant*362,362,362]:[col*384,row*cellHeight,384,cellHeight],destination:[-center*scale,-foot*scale,(rest?362:384)*scale,(rest?362:cellHeight)*scale],ground:0,height};
}
return {pose,walkSpeed:112,briskSpeed:175,stepLength:40};
});
