/* Merchant seals: inventory, routes and receipts. No reputation score. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.NanlanSealsModel=api;})(globalThis,function(){
'use strict';
const names={fang:'方掌柜',qiu:'邱管事',chen:'陈伯',xu:'许员外',zhou:'周夫子',luo:'罗掌柜',regular:'南街熟客'};
const lines={
fang:{wood:['方掌柜压着单角，点齐货数才收好。','「货到了，照单收下。下班船几时，还请写清。」'],stone:['他将凭单在手心护了一会儿，示意伙计先把竹篓端进去。','「这方印我认得。以后水急，早捎句话，门边的位置我给你留着。」']},

qiu:{wood:['他把凭单移到窗下，逐行核过货数，手指停在交期上。','「这一批我收下。后头的货，照单上的日子办；有变动，务必先来信。」'],stone:['他看了看印文，原本压着交期的手松开，将凭单折进随身账簿。','「这铺号，我记住了。往后大单先来问你；若遇风雨误船，早些递话，我好替你调一调装船的次序。」']},
chen:{wood:['陈伯扶好眼镜，把各家的物件分开数了一遍，才将凭单收进布袋。','「这几件是替街坊带的，哪家哪份，我再对一遍。单子留好，回村也好交代。」'],stone:['陈伯用掌心护住未干的印泥，笑着朝铺门外望了一眼。','「往后街坊问起，我也好指给他们看：南街这间，就是咱们熟识的铺子。下回零碎东西没齐，先捎句话，我进城时替你带回去。」']},
xu:{wood:['许员外拈起凭单一角，示意随从再看一遍包好的货。','「成色与样货相合，便照这个价。下回若换材料，先送样来，别等交货才说。」'],stone:['他将凭单端正放好，转头嘱咐随从，把铺号记入家中采办簿。','「下回备礼，先来你这里看样。细工不必赶得毛糙，要多留几日，定样时说清便是。」']},
zhou:{wood:['夫子扫过货目，伸指点了点用途一栏，神情端正。','「书院的东西经手人多，品目写明白，日后才不误事。这张凭单，我带回去入簿。」'],stone:['夫子等印泥略干，细细折好凭单，眉间渐松。','「铺号落得端正，做事也该如此。书院下回添置，我先来问你。工夫若紧，照实说，我们也好早作安排。」']},
luo:{wood:['罗掌柜掂了掂货，收单前又确认了一遍规格。','「茶客日日要用，大小可别忽宽忽窄。下回照这件做，到日子送来便好。」'],stone:['罗掌柜收起凭单，顺手将一盏温茶推到你面前。','「坐会儿，茶还温着。往后缺了什么，我先托人来问；不急用的那几件，你凑一趟送来，省得来回奔波。」']},
regular:{wood:['她对照凭单清点物件，又核过已付的定钱。','「这就齐了。单子我收着，下回有要添的，再来问。」'],stone:['她把凭单仔细折起，紧攥钱袋的手渐渐松了。','「这回约好的都齐了，我心里也踏实。下回有要添的，先来同你商量；做得慢些，提前说一声就好。」']}
};
const eligible=(name,p={})=>name==='v3Balance'||name==='v3SignLate'||name==='v3Step'&&['receive','first'].includes(p.key)||['v2Sell','v2SampleDeliver','v2DeliverBulk','v2DeliverRegular','v2DeliverBatch'].includes(name)||(name==='v2Bulk'&&p.choice!=='decline');
function patron(s,name){if(name.startsWith('v3'))return 'fang';if(['v2Bulk','v2DeliverBulk','v2SampleDeliver'].includes(name))return 'qiu';if(name==='v2DeliverRegular')return 'regular';if(name==='v2DeliverBatch')return s.story2.orders.batch?.item==='narrowBasket'?'xu':'zhou';return ['chen','luo','xu','zhou'][(s.shop.customerDay===Math.floor(s.worldTick/1440)+1?s.shop.served:0)%4];}
function fresh(){return {wood:false,stone:false,woodRoute:false,stoneRoute:false,receipts:[]};}
function normalise(s,need){if(s.seals===undefined)s.seals=fresh();const z=s.seals;need(z&&typeof z==='object'&&!Array.isArray(z),'印章资料无效。');for(const k of ['wood','stone','woodRoute','stoneRoute'])need(typeof z[k]==='boolean','印章资料无效。');need(!z.stone||z.wood,'石印资料缺少木印经历。');need(Array.isArray(z.receipts)&&z.receipts.length<=30,'凭单资料无效。');for(const r of z.receipts)need(r&&['wood','stone'].includes(r.seal)&&names[r.patron]&&typeof r.complete==='boolean'&&typeof r.item==='string'&&Number.isInteger(r.quantity)&&r.quantity>0&&Number.isFinite(r.paid)&&r.paid>=0&&Number.isFinite(r.tick)&&r.tick>=0,'凭单记录无效。');}
function act(s,name,p,h){const {requireThat:need,requireScene:at,spend,give}=h;need(s.flags.volume2Started,'请先在正厅开启第二卷，再筹备铺号印章。');need(p.sequence===s.revision,'这份安排已更新，请重新打开后操作。');s.seals??=fresh();const z=s.seals;
 if(name==='sealRouteWood'){need(['foothill','village'].includes(s.scene),'请当面向阿岑问路。');need(!z.woodRoute,'阿岑已经把路记下。');z.woodRoute=true;return;}
 if(name==='sealRouteStone'){at(s,'coast');need(z.wood,'请先请林师傅刻好木印，再向沈晚渔询问海湾印石。');need(!z.stoneRoute,'海湾旧泊岸的路已记下。');z.stoneRoute=true;return;}
 if(name==='sealGatherWood'){at(s,'mountain');need(z.woodRoute,'请先向阿岑询问适合刻印的坚木。');need(!z.wood&&!s.bag.sealTimber,'印材已经取过，请交给林师傅。');need(s.tools.axe&&s.selected==='axe','请先到仓房领取短柄斧，并在工具栏选中。');need(s.stamina>=3,'取下坚木需要 3 点体力，请先休息。');s.stamina-=3;give(s,{sealTimber:1});return;}
 if(name==='sealGatherStone'){at(s,'coast');need(z.stoneRoute,'请先向沈晚渔问清旧泊岸的归路。');need(!z.stone&&!s.bag.sealPebble,'印石已经取过，请交给林师傅。');need(s.stamina>=2,'拾取印石需要 2 点体力，请先休息。');s.stamina-=2;give(s,{sealPebble:1});return;}
 if(['sealCraftWood','sealCraftStone'].includes(name)){at(s,'generalStore');need(s.flags.v2Leased,'请先签下南街铺约，再请林师傅落铺号。');const stone=name==='sealCraftStone',key=stone?'stone':'wood';need(!z[key],'这方印已经做好，妥善收在印匣里。');need(!stone||z.wood,'先做木印，再磨石印。');need(z[stone?'stoneRoute':'woodRoute'],'请先亲自问路、采集印材。');spend(s,{[stone?'sealPebble':'sealTimber']:1});z[key]=true;return;}
 need(false,'这件印章事务尚未开放。');
}
function settle(s,name,p,run,need){if(!p.seal)return run();need(eligible(name,p),'这笔事务不使用盖印结算。');need(['wood','stone'].includes(p.seal)&&s.seals?.[p.seal],'请先请林师傅制好这方印。');const who=patron(s,name),coins=s.coins,stock={...s.shop.stock};const road=name.startsWith('v3'),shipped=s.story3?.freight?.n||0;
const result=run();const item=road?'bambooWare':Object.keys(stock).find(k=>stock[k]>s.shop.stock[k]);need(item,'尚未交付实货，不能出具收讫凭单。');const order=name==='v2DeliverBulk'||name==='v2Bulk'?s.story2.orders.bulk:name==='v2DeliverBatch'?s.story2.orders.batch:name==='v2DeliverRegular'?s.story2.orders.regular:null;const receipt={shopName:s.production?.shopName||'南澜记',seal:p.seal,patron:who,item,quantity:road?(name==='v3SignLate'||p.key==='receive'?shipped:1):stock[item]-s.shop.stock[item],paid:s.coins-coins,complete:road?(name==='v3SignLate'||p.key==='receive'?!s.story3.remainder:s.story3.contract.delivered===s.story3.contract.q):!order||order.delivered>=order.quantity,tick:s.worldTick};s.seals.receipts.push(receipt);s.seals.receipts=s.seals.receipts.slice(-30);return result;}
function response(r){if(!r.complete)return ['他将本次交货另记一行，指了指尚未交齐的货目。','「这一份先收下，余下的仍照原单办。凭单两边各留一份。」'];return lines[r.patron][r.seal];}
return {names,eligible,patron,fresh,normalise,act,settle,response};
});
