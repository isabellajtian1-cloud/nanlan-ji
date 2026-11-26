/* Six planted surfaces registered to the existing painted beds (1536 x 1024). */
(function(root,make){const api=make();if(typeof module==='object'&&module.exports)module.exports=api;else root.NanlanGardenLayout=api;})(globalThis,function(){
'use strict';
const beds=[
 [[1275,581],[1331,567],[1351,608],[1297,622]],
 [[1337,566],[1390,553],[1411,594],[1358,608]],
 [[1305,638],[1362,624],[1382,661],[1324,677]],
 [[1368,623],[1423,609],[1446,648],[1389,662]],
 [[1332,694],[1391,679],[1411,719],[1352,735]],
 [[1397,677],[1455,663],[1478,704],[1418,719]]
].map(b=>b.map(([x,y])=>[x*1100/1536,y*733/1024]));
const centers=beds.map(b=>b.reduce((c,p)=>[c[0]+p[0]/4,c[1]+p[1]/4],[0,0]));
function contains(p,b){let yes=false;for(let i=0,j=b.length-1;i<b.length;j=i++){const a=b[i],z=b[j];if((a[1]>p.y)!==(z[1]>p.y)&&p.x<(z[0]-a[0])*(p.y-a[1])/(z[1]-a[1])+a[0])yes=!yes;}return yes;}
function bounds(i){const b=beds[i],xs=b.map(p=>p[0]),ys=b.map(p=>p[1]);return {x:Math.min(...xs),y:Math.min(...ys),w:Math.max(...xs)-Math.min(...xs),h:Math.max(...ys)-Math.min(...ys)};}
function triangle(ctx,image,source,dest){
 const [s0,s1,s2]=source,[d0,d1,d2]=dest,u=s1[0]-s0[0],v=s1[1]-s0[1],w=s2[0]-s0[0],z=s2[1]-s0[1],det=u*z-v*w;
 const a=((d1[0]-d0[0])*z-(d2[0]-d0[0])*v)/det,c=((d2[0]-d0[0])*u-(d1[0]-d0[0])*w)/det;
 const b=((d1[1]-d0[1])*z-(d2[1]-d0[1])*v)/det,d=((d2[1]-d0[1])*u-(d1[1]-d0[1])*w)/det;
 ctx.save();ctx.beginPath();dest.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();ctx.clip();ctx.transform(a,b,c,d,d0[0]-a*s0[0]-c*s0[1],d0[1]-b*s0[0]-d*s0[1]);ctx.drawImage(image,0,0);ctx.restore();
}
function draw(ctx,image,col,row,index){
 const b=beds[index],x=col*384,y=row*1024/3,s=[[192+x,94+y],[351+x,190+y],[192+x,292+y],[29+x,190+y]];
 ctx.save();ctx.filter='saturate(.72) brightness(.91)';triangle(ctx,image,[s[0],s[1],s[2]],[b[0],b[1],b[2]]);triangle(ctx,image,[s[0],s[2],s[3]],[b[0],b[2],b[3]]);ctx.restore();
}
return {beds,centers,contains,bounds,draw};
});
