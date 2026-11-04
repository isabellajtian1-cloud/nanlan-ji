/* One stationary group per time slot; the same date, weather and slot survive a reload. */
(function(root,make){const common=typeof module==='object'&&module.exports;const m=make(common?require('./rural-model.js'):root.NanlanRural);if(common)module.exports=m;else root.NanlanChildrenModel=m;})(globalThis,function(R){
'use strict';
const keepsakes=['duckStone','grassHopper'];
function camp(s){
 if(s.mode!=='daily'||!s.flags.firstShared)return '';
 const day=R.day(s),min=s.worldTick%1440,slot=min>=450&&min<540?1:min>=930&&min<1020?2:0;
 const weather=R.weather(s,day);if(!slot||weather==='rain')return '';
 const wet=day>1&&R.weather(s,day-1)==='rain';
 const seed=(Math.imul(day,2654435761)>>>0)+(slot===2?7:0);
 if(seed%4===0)return '';
 return wet?'village':weather==='fair'&&s.flags.bridgeReady?'foothill':'';
}
function normalise(s,need){const a=s.children;if(a===undefined)return;
 need(a&&typeof a==='object'&&a.gifts&&a.places&&a.memory,'童物手记缺页。');
 for(const k of Object.keys(a.gifts))need(keepsakes.includes(k)&&a.gifts[k]===true,'童物手记缺页。');
 for(const [k,room]of Object.entries(a.places))need(a.gifts[k]&&['hall','study'].includes(room),'童物摆放位置有误。');
 for(const k of keepsakes)need((s.bag[k]||0)===(a.gifts[k]&&!a.places[k]?1:0),'童物数量有误。');
}
function act(s,name,p,h){const {requireThat:need,requireScene:at,spend,give}=h;
 need(p.sequence===s.revision,'这份记录已更新，请重新查看后确认。');
 const a=s.children??={gifts:{},places:{},memory:{}};
 if(name==='kidsPlay'){
   const scene=camp(s);need(scene&&s.scene===scene,'孩子们已经各自回家了。');need(['watch','join'].includes(p.choice),'选一种陪他们玩的法子。');
   a.memory[scene]=p.choice;const k=scene==='village'?'duckStone':'grassHopper';
   if(!a.gifts[k]){give(s,{[k]:1});a.gifts[k]=true;s.journal.push({id:'村童小记',tick:s.worldTick,text:scene==='village'?'老树下的叶船靠了岸。':'给蚂蚁让过一条路。'});}return;
 }
 const k=p.item;need(keepsakes.includes(k)&&a.gifts[k],'先收下孩子们亲手送的礼物。');
 at(s,['hall','study']);if(s.scene==='hall')need(s.flags.firstShared,'先在正厅安顿好饭桌。');
 if(name==='kidsPlace'){need(!a.places[k],'请先到原处把这件童物收回。');spend(s,{[k]:1});a.places[k]=s.scene;return;}
 need(name==='kidsTake'&&a.places[k]===s.scene,'请先到童物摆放的地方。');delete a.places[k];give(s,{[k]:1});
}
return {camp,keepsakes,normalise,act};
});
