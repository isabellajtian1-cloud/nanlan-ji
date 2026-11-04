/* Fifth-volume touch points reuse established painted scenes; no floating task labels. */
(()=>{'use strict';const D=window.NANLAN_DATA,W=D&&D.world;if(!W)return;
const add=(scene,o)=>{if(W[scene]&&!W[scene].objects.some(x=>x.id===o.id))W[scene].objects.push(o);};
const deep=W.mountain?.objects.find(o=>o.id==='deep');if(deep)Object.assign(deep,{type:'activity',action:'v5Scene',label:'深谷旧渠口'});
add('backHall',{id:'v5Ledger',x:646,y:410,label:'井边水样与清渠簿',type:'activity',action:'v5Scene'});
add('village',{id:'v5Well',x:610,y:500,label:'村井与取水名簿',type:'activity',action:'v5Scene'});
add('coast',{id:'v5SaltMark',x:826,y:502,label:'潮后白痕',type:'activity',action:'v5Scene'});
add('yard',{id:'v5Jar',x:845,y:365,label:'水缸与取样碗',type:'activity',action:'v5Scene'});
add('summit',{id:'v5Spring',x:343,y:390,label:'高处山泉',type:'activity',action:'v5Scene'});
add('hall',{id:'v5FamilyTable',x:625,y:468,label:'分水家议',type:'activity',action:'v5Scene'});
add('store',{id:'v5TroughStock',x:710,y:514,label:'引水竹料',type:'activity',action:'v5Scene'});
add('workshop',{id:'v5Trough',x:530,y:430,label:'竹槽试接案',type:'activity',action:'v5Scene'});
add('generalStore',{id:'v5ShopWater',x:815,y:492,label:'门边饮水壶',type:'activity',action:'v5Scene'});
add('guild',{id:'v5GuildWater',x:520,y:450,label:'运水轮值桌',type:'activity',action:'v5Scene'});
add('guild',{id:'v5GuildBoard',x:758,y:388,label:'公价与轮值榜',type:'activity',action:'v5Scene'});
add('anchorage',{id:'v5MerchantWater',x:650,y:405,label:'船东与淡水单',type:'activity',action:'v5Scene'});
add('village',{id:'v5ForgottenHome',x:330,y:344,label:'巷中闭门人家',type:'activity',action:'v5Scene'});
})();