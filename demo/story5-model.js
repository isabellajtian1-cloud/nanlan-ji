/* Volume V keeps water, labour and responsibility visible without changing old save schema. */
(function(root,make){const common=typeof module==='object'&&module.exports;const api=make(common?require('./v5-steps'):root.NanlanV5Steps,common?require('./v5-script'):root.NanlanV5Script);if(common)module.exports=api;else root.NanlanStory5=api;})(globalThis,function(chapters,script){
'use strict';
const order=chapters.map((_,i)=>'V5_'+String(i+1).padStart(2,'0')),titles={},steps={},rewards={},rows={},chapter={},flag=k=>'v5_'+k;
chapters.forEach((group,i)=>{const id=order[i];titles[id]=script[i].title[0];rewards[id]=[0,'清渠簿又添了一页，实物与当值都已记下。'];steps[id]=group.map(row=>{rows[row[0]]=row;chapter[row[0]]=i;return [flag(row[0]),row[3]];});});
const initial=()=>({choices:{},ledger:[],clearRuns:0,repairs:0,named:'',lastShift:0});
const first=s=>{const n=order.findIndex(id=>s.quests[id]?.status==='ACTIVE');return chapters[n]?.find(r=>!s.flags[flag(r[0])])||null;};
const target=(s,key)=>rows[key]?.slice(1,3);
function canStart(s){return !!s.flags.volume4Complete&&!s.story5&&s.quests.V4_18?.status==='COMPLETED';}
function gate(){return null;}
function record(s,text){s.story5.ledger.push({tick:s.worldTick,text});}
function normalise(s,need){
 const t=s.story5;if(t==null){need(!s.flags.volume5Started&&!s.flags.volume5Complete,'清渠簿缺页。');return;}
 const num=n=>Number.isSafeInteger(n)&&n>=0&&n<1e8;
 need(s.flags.volume4Complete&&s.flags.volume5Started&&t.choices&&Array.isArray(t.ledger)&&num(t.clearRuns)&&num(t.repairs)&&typeof t.named==='string','清渠簿缺页。');
 const ix=order.findIndex(id=>s.quests[id]?.status!=='COMPLETED');
 order.forEach((id,i)=>need(s.quests[id]?.status===(ix<0||i<ix?'COMPLETED':i===ix?'ACTIVE':'LOCKED'),'第五卷章节次序有误。'));
 need(!!s.flags.volume5Complete===(ix<0),'第五卷章节次序有误。');
 for(const [k,c]of Object.entries(t.choices))need(rows[k]&&num(c)&&c<rows[k].length-4,'清渠选择记录无效。');
 need(t.ledger.every(e=>Number.isFinite(e.tick)&&typeof e.text==='string'),'清渠簿缺页。');
}
function act(s,name,p,h){
 const {requireThat:need,requireScene:at,spend,available,log}=h;need(p.sequence===s.revision,'这份记录已更新，请重新查看后确认。');
 if(name==='v5Start'){at(s,'backHall');need(canStart(s),'先完成公所第一航与后堂家书。');s.flags.volume5Started=true;s.story5=initial();order.forEach((id,i)=>s.quests[id]={status:i?'LOCKED':'ACTIVE'});record(s,'村井绳上结出白霜，陈伯来请李家一同查水');return;}
 const t=s.story5;need(t&&s.flags.volume5Started,'先到后堂查看井边送来的水样。');
 const row=first(s);need(name==='v5Step'&&row&&row[0]===p.key,'先办妥清渠簿中眼前的一件事。');const k=row[0];at(s,row[1]);
 if(row.length>4){need(Number.isInteger(p.choice)&&p.choice>=0&&p.choice<row.length-4,'请先选定一种安排。');t.choices[k]=p.choice;}
 switch(k){
  case 'brine':record(s,'井水微咸，井绳干后留白，不作饮水结论前先查潮痕');break;
  case 'tideMark':record(s,'湾口白痕高过旧刻，确认昨夜海潮越界');break;
  case 'askHomes':record(s,'药灶、幼老与腿脚不便者另列，不以到场先后判断缺水');break;
  case 'jar':record(s,'自家留一缸日用水与一只取样碗，未把库存写成公水');break;
  case 'oldMap':record(s,'草木册中的石菖蒲记号与旧渠线相合');break;
  case 'spring':record(s,'高处泉眼无咸味，石缝出水仍清');break;
  case 'clear':need(s.stamina>=4,'清旧渠需要 4 点体力，可先回卧房小憩。');s.stamina-=4;record(s,'先移浮石、再断枯枝，旧渠口没有被踩塌');break;
  case 'measure':record(s,'草绳记下三段落差，竹槽不逆坡硬接');break;
  case 'council':record(s,'各户当面说出灶用、药用与照护所需');break;
  case 'rule':s.flags.v5FairWater=p.choice!==2;record(s,['首轮先保饮水和药灶','各户先领同量，急用另记','出力户先领，未到场者另行核问'][p.choice]);break;
  case 'materials':record(s,'竹、木、绳分列来源，没有把铺货混入公料');break;
  case 'build':need(available(s,'bamboo')>=2&&available(s,'wood')>=1,'还需竹材 ×2、枯枝 ×1。可去竹林与村边采集。');spend(s,{bamboo:2,wood:1});need(s.stamina>=3,'试接竹槽需要 3 点体力，可先休息。');s.stamina-=3;record(s,'两节竹槽空接严密，接口仍留可拆换的草绳');break;
  case 'sample':record(s,'取样碗中没有咸味，仍见少量新竹木屑');break;
  case 'rinse':t.clearRuns++;record(s,'头一槽浑水放回沟中，第二槽清流才入桶');break;
  case 'ration':s.flags.v5WaterShared=true;record(s,p.choice===0?'药灶与幼老先领，余户按簿领取':'依登记顺序领取，急用在旁补记');break;
  case 'shop':record(s,'南街门边留一壶清水，不随买卖标价');break;
  case 'guild':record(s,'公所排出挑水、收空桶与巡槽三班');break;
  case 'offer':s.flags.v5KeptPublicWater=true;record(s,p.choice===0?'拒绝整批买水，船用与岸用分开':'只照船上实需登记，未动村中留量');break;
  case 'price':record(s,p.choice===0?'水不标价，只实记桶损、竹节与运脚':'商户承担运脚，村户免收，理由写在榜上');break;
  case 'forgotten':record(s,'旧簿查到腿脚不便的一户，未把缺席当作不需要');break;
  case 'carry':need(s.stamina>=2,'送水需要 2 点体力，可先休息。');s.stamina-=2;record(s,'小桶送进灶边，空桶随即带回');break;
  case 'night':record(s,'夜里凭水声找到一处急漏，没有在暗处拆槽');break;
  case 'mark':record(s,'漏处系草结，天明接班人一眼能认');break;
  case 'storm':s.flags.v5StormPlan=true;record(s,p.choice===0?'暂停南街送水，先护渠口与上山人':'井边先留应急水，上山关槽避洪');break;
  case 'brace':need(available(s,'wood')>=1,'压稳渠口还需枯枝 ×1。可在村边或山脚拾取。');spend(s,{wood:1});t.repairs++;record(s,'木楔压稳，急雨来时槽口可卸水而不掀翻');break;
  case 'answer':s.flags.v5OpenLedger=true;record(s,p.choice===0?'当值人先述所见，众人补全断流经过':'公所共担修复，再逐项记明各处疏漏');break;
  case 'repair':need(available(s,'bamboo')>=1,'补竹节还需竹材 ×1。可到竹林采集。');spend(s,{bamboo:1});t.repairs++;record(s,'断节按原样替换，旧件留在验案说明裂处');break;
  case 'name':t.named=['南澜清渠','借灯水路','同心竹引'][p.choice];record(s,'众人把水路题作「'+t.named+'」');break;
  case 'tablet':record(s,'祖父把水路名字、首日当值与修补处写入新簿');break;
  case 'letters':record(s,'京中问候与井边轮值短笺并放一案');break;
  case 'reply':record(s,'回信写下南澜的水路、家人与远方牵挂');break;
  case 'witness':t.lastShift=Math.floor(s.worldTick/1440)+1;record(s,'下一班当面接过草结图、空桶数与修补办法');break;
  case 'home':need(s.flags.v5WaterShared&&t.named,'先把第一轮水送妥，并给共用水路留下名字。');s.flags.volume5Complete=true;record(s,'清水添满自家水缸，缸边仍留一只给路人的碗');s.journal.push({id:'第五卷',tick:s.worldTick,text:'清渠有名，轮值有人；李家在自己的水缸边，也替别人留下一碗清水。'});log(s,'volume5',0,'第五卷 · 清水满缸');break;
 }
 s.flags[flag(k)]=true;
}
return {order,titles,steps,rewards,rows,chapter,chapters,script,flag,first,target,canStart,gate,act,normalise};
});