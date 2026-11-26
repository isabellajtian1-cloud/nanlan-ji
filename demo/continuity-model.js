/* Read-only explanations derived from the authoritative save and transaction records. */
(function(root,make){const server=typeof module==='object'&&module.exports;const api=make(server?require('./engine.js'):root.NanlanEngine);if(server)module.exports=api;else root.NanlanContinuityModel=api;})(globalThis,function(N){
'use strict';
function contract(s){
 const c=s.story2?.contract,records=(s.transactions||[]).filter(r=>['lease','deposit'].includes(r.type));
 if(!c)return {signed:false,records};
 const rentRecord=records.find(r=>r.type==='lease'&&r.amount<0),signedAt=Number.isFinite(c.signedAt)?c.signedAt:Number.isFinite(rentRecord?.tick)?rentRecord.tick:null;
 return {signed:true,name:c.legacy?'沿用首期租约':c.name,rent:c.rent,deposit:c.deposit,dailyRent:c.dailyRent,period:Number.isFinite(c.period)?c.period:null,signedAt,repair:c.repair,legacy:!!c.legacy,records};
}
function documentNote(s,id,english=false){
 const L=(zh,en)=>english?en:zh;
 if(id==='ledgerCopy')return L('文书 · 留作纪念与查阅。获程婉同意誊下，可在书案回看；开铺和交单不消耗这份抄本。','Paper · Kept for reference and memory. Copied with Cheng Wan’s permission; read it at the study desk. Shop leases and deliveries do not consume it.');
 if(id==='receipt')return N.done(s,'M17')?L('凭据 · 留存核账。第一卷的争议已结清；南街的新成交仍会添入凭单，账房按流水核算，不必销毁或重复交出。','Receipt · Kept with the accounts. The Volume I dispute is settled; new sales add receipts. The ledger records transactions without consuming these papers.'):L('凭据 · 后续要用。请保留至少一张，镇集核账时须出示；出示后仍留在行囊。','Receipt · Needed later. Keep at least one to show at the market account review; it remains in your satchel afterwards.');
 return '';
}
function observationLine(s,slot,english=false){
 const a=N.story2.observationStatus(s,slot);if(!a)return '';
 const time=m=>String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0'),window=time(a.minute)+'–'+time(a.end);
 if(english)return a.done?'Recorded':a.state==='open'?'Observation open · '+window:a.state==='missed'?'Today’s window has passed · return tomorrow '+window:'Today’s window · '+window+' · not open yet';
 return a.done?'已经记下':a.state==='open'?'现在可观察 · '+window:a.state==='missed'?'今日已晚，明日'+a.label+'再探 · '+window:'今日'+a.label+' · '+window+'，尚未到时';
}
return {contract,documentNote,observationLine};
});
