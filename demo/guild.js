/* Replayable guild orders share the founding voyage's acceptance, cargo and
 * settlement rules, while preserving its signed ledger and the family ending. */
(()=>{'use strict';const V=N.v4,names={house:'李家',farm:'桑户',lu:'陆家',makers:'竹作工棚'};
const responses=['陆掌柜：「上一回你肯等我收紧篓耳，这回每捆我都提两遍。多留二十分钟，招牌我自己护。」','陆掌柜：「轻用的我已另扎细绳。上次你肯替我问用途，我就把能做与不能做的都写明。」','陆掌柜：「退回的原件我认。往后我只接一件，见过收条再添；余下的，请工棚帮着排。」'];
function sheet(rows){const el=document.createElement('dl');el.className='v4-accounts';for(const [a,b] of rows){const x=document.createElement('dt'),y=document.createElement('dd');x.textContent=a;y.textContent=String(b);el.append(x,y);}$('panelExtra').append(el);}
function note(t){const p=document.createElement('p');p.className='production-note';p.textContent=t;$('panelExtra').append(p);}
let arrival=null;
function atStop(o){if(!arrival)return false;const hit=state().scene===arrival.sc&&o.id===arrival.id;if(o.type==='door'&&!hit)return false;arrival=null;if(!hit)return false;show();return true;}
function travel(label,sc,id){navButton(label,()=>{closeDialog();arrival=id==='bedRest'?null:{sc,id};startNavigation(sc,id);},'season-route-'+id);}
function op(label,name,p={},next=show){return actButton(label,'v4Guild'+name,{sequence:state().revision,...p},next,'guild-'+name+'-'+(p.choice??p.size??p.space??0)+(name==='Open'?'-'+Number(p.own)+'-'+Number(!!p.workWithNeighbors):''));}
function clock(t){const m=Math.floor(t)%1440;return '第 '+(Math.floor(t/1440)+1)+' 日 '+String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');}
function wait(){const s=state(),due=V.guildDue(s),night=(N.clock(s).day-1)*1440+1320;if(due<=s.worldTick)return;note('下一次约定 · '+clock(due));if(s.worldTick<night)op('守候至 '+clock(Math.min(night,due)),'Wait');travel('回东厢房过夜，再来看班期','bed','bedRest');}
function buttonHere(label,scene,id,fn){const obj=world[scene].objects.find(o=>o.id===id);if(state().scene!==scene||!obj||!engine.near(obj)){travel(label,scene,id);return;}fn();}
function openForm(size){
 const s=state(),a=V.guildInfo(s,size),t=s.story4,raw=V.stores(s);
 activity('派单之前 · 各家能交多少','丝束三十二文，窄篓二十二文。先领对岸三分之一订金，再依供货份额预付工料款的四分之一。李家选自供时只取未预留的行囊实货。','guild-order');
 sheet([['约货 · 特级丝 / 精篓',a.silk+' / '+a.baskets],['需用仓格 / 现有仓格',a.slots+' / '+V.capacity(t)],['陆家可接精篓',a.lu],['本批货款 / 船东订金',a.gross+' / '+Math.floor(a.gross/3)+' 文'],['开仓清扫、铺垫与搬运',a.maintenance+' 文'],['约定交到公库',clock(s.worldTick+a.lead)],['可调丝料 / 竹篾',raw.silk+' / '+raw.bamboo]]);
 sheet([['李家可自交 · 丝 / 篓','1 / 1'],['桑户 · 李家自交 / 全部代供',(a.silk-1)+' / '+a.silk],['工棚 · 李家自交 / 全部代供',(a.baskets-a.lu-1)+' / '+(a.baskets-a.lu)]]);
 note('丝绞与留样比匀细、查接头；篓口合样尺，篓耳须能负重。');note(responses[a.prior]);note('一束用一份可缫丝料，一件用两份竹篾。每日新备两份丝料、四份竹篾，各有存放上限。');note('样尺验篓口，试提验篓耳；轻用篓单列，须经船东同意。货到之前可离开照看家里。');
 if(a.slots<=V.capacity(t)&&N.rural.rank(s)>0&&s.flags.v2RegularFulfilled){
 const tr=deskText;note(tr('熟客替李家递了话。街坊肯合班搬货：你亲自帮二十分钟，费两点体力，本单少雇两文脚力。','A regular has vouched for you. Work with the neighbours for twenty minutes and two stamina to save two coins in porter wages.'));
 sheet([[tr('合班开仓费','Shared opening cost'),a.maintenance-2],[tr('合班交货时辰','Delivery after shared loading'),clock(s.worldTick+20+a.lead)]]);
 op(tr('合班搬货 · 李家自供','Share the work · supply our own goods'),'Open',{size,own:true,workWithNeighbors:true});
 op(tr('合班搬货 · 只经办','Share the work · coordinate only'),'Open',{size,own:false,workWithNeighbors:true});}
 if(a.slots<=V.capacity(t)){op('李家自供丝篓各一，照单拨料','Open',{size,own:true});op('本户只经办，按各家实供开单','Open',{size,own:false});}else note('公库放不下这张单，先缩量或验收新干货架。');
 button('回到公所总账',show,'season-back',true,false);
}
function stockRows(b){return b.lots.map((l,i)=>{const shipped=V.issued(b,i),signed=b.ships.filter(x=>x.signed).reduce((n,x)=>n+x.cargo[i],0);
 return [names[l.owner]+' · '+N.itemNames[l.item],(l.received?l.qty-shipped-Number(i===4&&b.phase==='recheck'&&b.policy===2&&b.returns>0):0)+' / '+(shipped-signed)+' / '+signed];});}
function inspect(){const s=state(),b=s.story4.repeat;activity('样尺旁 · 抽提一篓','小满留着封签。摸清这件的篓耳，再决定是否入合格架。','guild-check');
 const sample=document.createElement('span');sample.className='v3-prop';sample.style.backgroundPosition='0 100%';$('panelExtra').append(sample);
 function feel(i){if(i<b.needsCheck){button(i===0?'挑开一捆，扣住篓耳试提':'翻过底签，与旧样比篾',()=>{note(i===0?(b.defect==='loose'?'负重一提，接口滑了一线。':b.defect==='light'?'篓耳很轻，架签上另系着细绳。':'手柄稳当，里面还有一枚复验签。'):'拿样尺贴住篓口，逐项对过原单。');$('choices').replaceChildren();feel(i+1);},'season-inspect-'+i,false,false);return;}
 const sound=b.defect==='sound';for(const [j,label]of ['系合格签，入成货架','单件封存，另开待议单'].entries())button(label,()=>{if((j===0)!==sound){note(sound?'样尺与两道签都相合，复看后可入合格架。':'这件尚未合原约承重，先把它另放。');return;}
 return perform('v4GuildCheck',{sequence:state().revision,inspected:b.needsCheck},show);},'season-verdict-'+j,false,false);}
 feel(0);
}
function show(){
 const s=state(),t=s.story4;if(!t||!s.flags.volume4Complete)return;const b=t.repeat,sc=s.scene;
 activity('行商公所 · 下一航',b?'实物、定钱和船脚沿同一张派单结清。':'新单是单独一笔生意。先看岸上能放多少，再问各家能做多少。','guild');
 sheet([['家用 / 保留',s.coins+' / '+s.story2.reserve+' 文'],['仓位上限',V.capacity(t)+' 格'],['干油布余量',t.cloth+' 卷'],['本航公匣',b?b.fund+' 文':'尚未开匣']]);
 if(!b){
  buttonHere('到公所议约长桌开单','guild','v4Table',()=>{
    if(t.upgradeDue){op('验收加造干货架','InspectRack');wait();}
    else{for(const [i,l]of ['拟小单 · 四束六篓','拟全单 · 六束八篓','拟扩单 · 八束十二篓'].entries())button(l,()=>openForm(i),'v4-size-'+i,true,false);
    if(!t.warehouse)op('添十二格干货架 · 九十六文、枯枝四、竹三、两小时','Build');}
  });
  if(t.lastSeason){const h=t.lastSeason;note('上航已结 · '+h.ships+' 班');sheet(h.settlement.map(x=>[names[x.owner],x.total+' 文']));const d=document.createElement('details'),head=document.createElement('summary');head.textContent='逐笔翻看收支与交接';d.append(head);for(const e of h.ledger){const line=document.createElement('p');line.textContent=clock(e.tick)+' · '+e.text+(e.amount?'　'+e.amount+' 文':'');d.append(line);}$('panelExtra').append(d);}
 }else{
  note('各来源单 · 在库 / 在途 / 已签收');sheet(stockRows(b));sheet([['已拨丝料 / 竹篾',b.inputs.silk+' / '+b.inputs.bamboo],['各家已领工料定钱',b.prepaid.reduce((a,c)=>a+c,0)+' 文']]);
  if(b.phase==='await'){if(s.worldTick>=b.due)buttonHere('去验货案亲手抽检','guild','v4Inspect',()=>button('揭封抽检',inspect,'season-examine'));else wait();}
  if(b.phase==='dispute')note('已隔放一件待议篓，仍占原来的两格。');
  if(b.phase==='recheck'&&b.policy===2)note('原件已退回。工棚另取两份竹篾补编一件，其余在架货不动。');
  if(b.phase==='dispute')buttonHere('到公所商量这一件的去向','guild','v4Inspect',()=>{op('请陆家返工 · 四文、二十分钟','Fix',{choice:0});op('另议轻用等级，先问船东','Fix',{choice:1});op('退回原件、另家替补 · 六文、一个时辰','Fix',{choice:2});});
  if(b.phase==='consent')buttonHere('到泊岸请船东确认轻用价','anchorage','v4Merchant',()=>op('同意减六文，其中陆家少取二文','Consent'));
  if(b.phase==='recheck'){if(s.worldTick>=b.due)buttonHere('去公库复验到架货物','guild','v4Inspect',()=>op('复验封签，纳入合格架','Recheck'));else wait();}
  if(b.phase==='sail'){wait();buttonHere('到避风泊岸按格装船','anchorage','v4Hold',()=>{for(const [space,fee]of [[0,14],[1,5]]){const tag=space?'十一格':'二十二格';op(tag+' · 船脚 '+fee+' 文 · 草席二文','Sail',{space,oil:false});if(t.cloth)op(tag+' · 船脚 '+fee+' 文 · 用一卷库存油布','Sail',{space,oil:true});}});}
  if(b.phase==='water'){if(s.worldTick>=V.guildDue(s))buttonHere('到河埠取回对岸签收','wharf','v3Boatman',()=>op('核对回报，湿丝另付晾验费','Receive'));else wait();}
  if(b.phase==='close')buttonHere('回公所抵订金，按户分账','guild','v4Ledger',()=>op('结清本班，保留最后一联','Close'));
 }
 if(sc==='guild'&&t.cloth<4)op('添一卷干油布 · 七文，一航用一卷','BuyCloth');
 button('回看立所第一航',window.NanlanV4.ledger,'season-founding',true,false);
}
window.NanlanGuild={show,atStop};
})();
