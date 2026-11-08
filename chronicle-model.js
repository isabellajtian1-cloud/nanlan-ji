/* Atomic, chapter-scoped records. Old saves keep explicit gaps instead of invented totals. */
(function(root,make){const api=make();if(typeof module==='object'&&module.exports)module.exports=api;else root.NanlanChronicle=api;})(globalThis,()=>{
'use strict';
const flags={'1':'volumeComplete','2':'volume2Complete','3':'volume3Complete','4':'volume4Complete','5':'season5Complete','5-old':'volume5Complete','6':'voyageComplete'};
const round=n=>Math.round((n+Number.EPSILON)*100)/100;
function volume(s){const f=s.flags;return f.voyageStarted?'6':f.season5Started?'5':f.volume5Started?'5-old':f.volume4Started?'4':f.volume3Started?'3':f.volume2Started?'2':'1';}
function entry(s,partial){return {partial,startedAt:s.worldTick,finishedAt:null,income:0,expense:0,sales:0,crafted:0,people:[],decisions:[],closedProfit:0,closedDays:0};}
function fresh(s){return {version:1,volumes:{[volume(s)]:entry(s,false)}};}
function normalise(s,need){
 if(!s.chronicle){s.chronicle={version:1,volumes:{}};const k=volume(s);if(!s.flags[flags[k]])s.chronicle.volumes[k]=entry(s,true);return;}
 const c=s.chronicle;need(c.version===1&&c.volumes&&typeof c.volumes==='object'&&!Array.isArray(c.volumes),'行旅记录无效。');
 for(const [k,v]of Object.entries(c.volumes)){need(Object.hasOwn(flags,k)&&v&&typeof v.partial==='boolean','卷末记录无效。');for(const n of ['startedAt','income','expense','sales','crafted','closedDays'])need(Number.isFinite(v[n])&&v[n]>=0,'卷末数目无效。');need(v.finishedAt===null||Number.isFinite(v.finishedAt)&&v.finishedAt>=v.startedAt,'卷末时辰无效。');need(Number.isFinite(v.closedProfit)&&Array.isArray(v.people)&&v.people.every(x=>typeof x==='string')&&Array.isArray(v.decisions)&&v.decisions.every(d=>typeof d.key==='string'&&Number.isFinite(d.tick)&&['string','number','boolean'].includes(typeof d.value)),'行旅留记无效。');}
}
const knownFlags={metChen:'chen',metCen:'cen',metDoctor:'doctor',metYu:'yu',ledgerPermission:'wan',historyConfirmed:'grandfather',firstShared:'mother',fatherHome:'father'};
function people(s){const set=new Set(Object.entries(knownFlags).filter(([f])=>s.flags[f]).map(([,r])=>r));for(const [k,v]of Object.entries(s.choices||{})){const m=k.match(/^chatCount:(.+)$/)||k.match(/^bond:([^:]+):(?:topic\d|event\d|shared:)/);if(m&&(typeof v==='number'?v>=0:!!v))set.add(m[1]);}return [...set];}
function record(before,s,key){
 normalise(s,(ok,msg)=>{if(!ok)throw Error(msg);});const k=volume(s),from=volume(before);if(!s.chronicle.volumes[k]&&!s.flags[flags[k]])s.chronicle.volumes[k]=entry(s,k===from);
 const v=s.chronicle.volumes[k];if(!v||v.finishedAt!==null)return;
 const cash=s.coins-before.coins;if(cash>0)v.income=round(v.income+cash);else v.expense=round(v.expense-cash);
 const tx=s.transactions.slice(before.transactions.length);for(const t of tx)if(['sale','shopSale','bulk','order','neighborSale'].includes(t.type))v.sales=round(v.sales+t.amount);
 if(key==='craft')v.crafted+=Object.entries(s.bag).reduce((n,[id,q])=>n+Math.max(0,q-(before.bag[id]||0)),0);
 const prior=new Set(people(before));for(const r of people(s))if(!prior.has(r)&&!v.people.includes(r))v.people.push(r);
 for(const [ck,value]of Object.entries(s.choices))if(before.choices[ck]!==value&&['string','number','boolean'].includes(typeof value)&&!/^chat|^bond:/.test(ck))v.decisions.push({key:ck,value,tick:s.worldTick});
 for(const [day,d]of Object.entries(s.story2.days))if(d.closed&&!before.story2.days[day]?.closed){v.closedDays++;v.closedProfit=round(v.closedProfit+d.profit);}
 if(s.flags[flags[k]])v.finishedAt=s.worldTick;
}
return {volume,fresh,normalise,record,people,flags};
});
