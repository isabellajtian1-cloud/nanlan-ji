/* Read-only metadata; story models retain all unlock authority. */
(function(root,make){const server=typeof module==='object'&&module.exports;const api=make(server?require('./engine.js'):root.NanlanEngine);if(server)module.exports=api;else root.NanlanChapterCatalog=api;})(globalThis,function(N){
'use strict';
const cn=['','一','二','三','四','五','六'],roman=['','I','II','III','IV','V','VI'];
const descriptions=[null,
 ['从旧宅门前开始，与家人安顿新家，认识南澜的山路、海湾与邻里。','Settle into the old house and discover Nanlan’s hills, bay and neighbors.'],
 ['到南街筹备自己的铺子，在真实的买卖、账目与约定中点亮一街灯火。','Prepare a South Street shop through real trade, accounts and promises.'],
 ['从铺门边的竹箱接续故事，走向新河埠、旧山道、工棚与青溪。','Begin with the bamboo chest at the shop and explore the wharf, old trail, workshop and Qingxi.'],
 ['从海湾的陌生帆影开始，认识避风泊岸与公所，收拾一家人的后堂。','Follow unfamiliar sails to the sheltered berth, guild and family back hall.'],
 ['在后堂翻开岁序簿，与家人分担劳作，商量下一季的生活。沿用已经开放的家园与街巷。','Open the seasons book in the back hall and share plans for the coming year, using the home and streets you already know.'],
 ['在后堂拆开春潮来信，备妥交接、行囊与归程，再乘班船前往青屿。','Open the spring-tide letter, arrange cover and a return journey, then sail to Qingyu.']];
function label(number,english=false){return number==='extras'?(english?'Six Epilogues':'六篇番外'):(english?'Volume '+roman[number]:'第'+cn[number]+'卷');}
function heading(item,english=false){return label(item.number,english)+' · '+(item.status==='locked'?(english?'Sealed':'未解封'):(english?item.en:item.title));}
function progress(s,number){const order=[null,N.ORDER,N.V2_ORDER,N.V3_ORDER,N.V4_ORDER,N.SEASON5_ORDER,N.V6_ORDER][number];if(number==='extras')return {done:Object.keys(N.voyage.get(s)?.extra?.done||{}).length,total:N.voyage.bonus.length};return {done:order.filter(id=>N.done(s,id)).length,total:order.length};}
function entries(s){
 const first={number:1,title:'初抵南澜',en:'Arrival in Nanlan',started:true,complete:!!s.flags.volumeComplete||N.done(s,'M20'),ready:false,scene:'gate',object:'familyLuggage',requirements:[]};
 const chapters=[first,...N.chapterEntries(s)].map(item=>({...item,progress:progress(s,item.number),description:descriptions[item.number],status:item.complete?'complete':item.started?'current':item.ready?'ready':'locked'}));
 const extra=N.voyage.get(s)?.extra,complete=N.voyage.bonus.every((_,i)=>!!extra?.done?.[i]);
 chapters.push({number:'extras',title:'闲日邀约',en:'Days Together',scene:'backHall',object:'voyageExtras',description:['六卷之后，与家人和伙伴相约六段闲日。已完成的番外可以重看回忆。','After the six volumes, share six days with family and friends. Completed epilogues can be recalled.'],started:!!extra?.active,complete,ready:!!s.flags.voyageComplete,requirements:[[!!s.flags.voyageComplete,'完成第六卷「春潮有信」主线','Complete Volume VI: Letters on the Spring Tide']],status:complete?'complete':extra?.active?'current':s.flags.voyageComplete?'ready':'locked'});
 chapters.at(-1).progress=progress(s,'extras');
 return chapters;
}
const placeVolumes={county:2,pharmacy:2,generalStore:2,teahouse:2,clothShop:2,bookShop:2,countyInn:2,countyRoom:2,wharf:3,oldTrail:3,workshop:3,qingxi:3,prefDock:3,prefMarket:3,prefInn:3,prefRoom:3,prefTea:3,anchorage:4,guild:4,backHall:4,qPier:6,qFair:6,qSalt:6,qBamboo:6,qBeacon:6,qLodge:6};
const placeFlags={wharf:'v3_return',oldTrail:'v3_supply',workshop:'v3_standard',qingxi:'v3_fill',anchorage:'v4_look',guild:'v4_assemble',backHall:'v4_letter'};
function place(id){
 const number=placeVolumes[id]||1,flag=placeFlags[id];let questTitle='',stepLabel='';
 let requirement=number===1?'随第一卷剧情与修路进度逐步开放。':number===2?'在正厅开启第二卷后，进入县城与南街。':'';
 if(flag){for(const [quest,steps]of Object.entries(N.steps)){const step=steps.find(row=>row[0]===flag);if(step){questTitle=N.titles[quest];stepLabel=step[1];requirement='完成「'+questTitle+'」中的「'+stepLabel+'」后开放。';break;}}}
 if(id.startsWith('pref'))requirement='第三卷完成「谁替你看一会儿店」的回柜台事项后，从新河埠按船期乘船前往府城。';
 if(number===6)requirement='第六卷完成行前安排，在避风泊岸核船期、天气和往返船脚，再乘班船前往青屿。';
 const requirementEn=id.startsWith('pref')?'In Volume III, return to the counter after the shop shift, then take the scheduled ferry from New River Wharf.':number===6?'Finish the Volume VI preparations, then check the weather, sailing time and return fare at the sheltered berth before sailing to Qingyu.':number===2?'Begin Volume II in the main hall to enter the county town and South Street.':'Opens gradually with Volume I’s story and path repairs.';
 const shared5=['backHall','yard','hall','store','generalStore','market','guild','workshop','wharf'].includes(id);
 return {number,volumes:shared5?[number,5]:[number],flag,requirement,requirementEn,questTitle,stepLabel};
}
return {entries,label,heading,progress,place};
});
