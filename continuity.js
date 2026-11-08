/* Persistent, read-only records and explicit time transitions. */
(()=>{'use strict';
const M=window.NanlanContinuityModel,C=window.NanlanClimate,en=()=>window.NanlanI18n?.language==='en',L=(zh,english)=>en()?english:zh;
function note(text,host=$('panelExtra')){const p=document.createElement('p');p.className='continuity-note';p.dataset.noLocalize='';p.textContent=text;host.append(p);return p;}
function rows(values,host=$('panelExtra')){const dl=document.createElement('dl');dl.className='record-facts';dl.dataset.noLocalize='';for(const [key,value]of values){const row=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=key;dd.textContent=value;row.append(dt,dd);dl.append(row);}host.append(dl);}
const coins=n=>Number(n.toFixed(2))+' '+L('文','coins');
const journeyDay=tick=>L('旅程第 ','Journey day ')+(Math.floor(tick/1440)+1)+L(' 日','')+' · '+time(tick);
const time=n=>String(Math.floor(n%1440/60)).padStart(2,'0')+':'+String(Math.floor(n%60)).padStart(2,'0');
function dateAt(s,tick){return C.label({...s,worldTick:tick},en())+' · '+time(tick);}
function tabs(selected){const nav=document.createElement('nav');nav.className='record-tabs';nav.dataset.noLocalize='';nav.setAttribute('aria-label',L('铺面记录','Shop records'));for(const [id,zh,english,open]of [['business','生意与家计','Trade & Household',()=>window.NanlanRecords.business()],['shop','柜台流水','Trading ledger',()=>window.NanlanV2.show('v2Shop')],['contract','租约与押金','Lease & Deposit',lease],['papers','铺讯与手记','Notice & Notes',handbook]]){const b=document.createElement('button');b.type='button';b.textContent=L(zh,english);b.setAttribute('aria-current',id===selected?'page':'false');b.onclick=open;nav.append(b);}$('panelExtra').prepend(nav);}
function lease(){
 const s=state(),c=M.contract(s),t=s.story2;
 activity(L('账房 · 租约与押金','Accounts · Lease & Deposit'),L('契约随时可查。预付租金、押金和每日核账分开记，不会在闭店时再扣一遍。','Your agreement stays here. Prepaid rent, the deposit and daily accounting are separate; closing the shop does not charge rent again.'),'contract-record');dialogObject=null;
 tabs('contract');
 if(!c.signed){
  rows([[L('租约状态','Lease status'),L('尚未签约 · 当前没有应付日租','Not signed · No daily rent due')],[L('现有家用','Cash'),coins(s.coins)],[L('另留家用','Household reserve'),coins(t.reserve)]]);
  note(L('钱不够也可以先看铺、观察客流。只有亲自确认签约才会支付租金和押金。','You may inspect shops and observe customers before you can afford the lease. Rent and deposit are paid only when you confirm signing.'));
  for(const site of ['east','west']){const shop=N.story2.shops[site];note((en()?window.NanlanI18n.t(shop.name):shop.name)+' · '+L('常规首期 30 日，租金 ','Standard 30-day first term, rent ')+coins(shop.rent)+L('，押金 ',', deposit ')+coins(shop.deposit));}
 }else{
  const zero=c.dailyRent===0;
  rows([[L('租约','Agreement'),c.legacy?L('沿用首期租约','Existing first-term agreement'):en()?window.NanlanI18n.t(c.name):c.name],
   [L('预付租金','Prepaid rent'),coins(c.rent)+' · '+L('已付','Paid')],
   [L('首期约定','First term'),c.period?c.period+' '+L('日','days'):L('旧约未另载期限','No separate term recorded in the existing agreement')],
   [L('每日核账分摊','Daily accounting allocation'),zero?L('旧约不另计日租','No further daily rent under the existing agreement'):(Number.isInteger(c.dailyRent*100)?'':L('约 ','About '))+coins(c.dailyRent)+L(' / 日（从已付租金分摊）',' / day, allocated from prepaid rent')],
   [L('今日另扣租金','Additional cash rent today'),L('无 · 已预付，闭店不重复扣款','None · Prepaid; no repeated closing charge')],
   [L('可退押金','Refundable deposit'),c.deposit?coins(c.deposit)+' · '+L('已交，另列保管','Paid and held separately'):L('免押金 · 未收取','Deposit waived · Nothing collected')],
   [L('签约时间','Signed'),c.signedAt===null?L('旧约未载明时辰','The existing agreement has no dated entry'):journeyDay(c.signedAt)],
   [L('修缮责任','Repairs'),c.repair==='owner'?L('房东修补，需到场验收','Landlord repairs, inspected on site'):L('自备材料修缮','Your household supplies materials and repairs')]]);
  note(L('每日分摊只用于核算盈亏，不代表欠租。首期届满后仍照现约经营，不另收续钱；押金单独保管，打烊时不作退还。','Daily allocation measures profit; it is not unpaid rent. Trading continues under the existing terms after the first period, with no automatic renewal charge. Closing the books does not refund the deposit.'));
 }
 if(c.records.length){note(L('已付凭据','Payment records'));rows(c.records.map(r=>[journeyDay(r.tick),(r.type==='deposit'?L('押金 ','Deposit '):L('租金 ','Rent '))+coins(-r.amount)]));}
 navButton(L('查看逐笔家庭收支','Open Household Transactions'),showAccounts,'contract-household');
 navButton(L('合上账册','Close the Ledger'),()=>closeDialog(true),'contract-close');
}
function section(title,text,open=false){const box=document.createElement('details');box.className='paper-record';box.open=open;box.dataset.noLocalize='';const h=document.createElement('summary');h.textContent=title;box.append(h);note(text,box);$('panelExtra').append(box);return box;}
function handbook(){
 const s=state(),seen=s.flags.volume2Started||N.done(s,'M20');
 activity(L('铺讯与手记','Shop Notice & Notes'),L('收到的铺讯、看铺所记与家计安排都夹在这里。翻阅不会推进时间，也不重复领取回报。','Keep the shop notice, observations and household plans here. Reading does not advance time or grant rewards again.'),'paper-records');dialogObject=null;
 if(!seen){note(L('家宴后的铺讯尚未送到，先把眼前的安顿做好。','The notice has not arrived. Settle the family first.'));return;}
 tabs('papers');
 section(L('家宴后的一张铺讯 · 原信','The Notice After the Feast · Original'),L('母亲从碗底抽出一张铺讯，背面记着镇集客人的意见。\n「先看看，什么人会来买。」\n\n父亲把家中的收支摊开：先商量留给生活的钱，再决定带多少进城。\n\n钱不够也可以先调查。看客流、比较铺面都不收租金；租金、押金、修缮、首货和运费会在付款前逐项列明。可继续制作、试摊筹钱，再回来签约。','Mother takes a notice from beneath the bowl, with market customers’ comments on the back.\n“First see who might buy.”\n\nFather opens the accounts: keep money for daily life before deciding what to take to town.\n\nYou may investigate before you can afford a lease. Observation and inspection do not charge rent. Rent, deposit, repairs, stock and transport are listed before payment. Craft and trade at the stall, then return to sign.'),true);
 section(L('筹备次序 · 随时回看','Preparation · Read Anytime'),L('读铺讯、商议家用 → 在早市、午间、午后三个时段观察 → 亲查两间铺面 → 算预算 → 确认租约 → 修架、挂号、备货。\n「南街三时」只要求三个时段的观察；三个不同营业日的闭账是卷末「一街灯火」的另一项安排。','Read the notice and reserve household funds → observe morning, midday and afternoon trade → inspect both shops → budget → sign → repair, name and stock the shop.\nThree Hours on South Street means three observations. Closing three distinct trading days is a separate objective at the end of Volume II.'));
 const budget=section(L('家计安排','Household Plan'),s.flags.v2ReserveSet?L('现留家用 ','Current household reserve: ')+coins(s.story2.reserve):L('尚待与家人商议，可在正厅决定。','Not yet agreed; discuss it in the hall.'));
 if(s.story2.site)note(L('已选铺面：','Selected shop: ')+(en()?window.NanlanI18n.t(N.story2.shops[s.story2.site].name):N.story2.shops[s.story2.site].name),budget);
 const observations=s.story2.observations||[];
 section(L('客流札记','Customer Observations'),observations.length?observations.map(r=>(en()?({morning:'Morning',noon:'Midday',afternoon:'Afternoon'})[r.slot]:N.story2.slots[r.slot].label)+' · '+journeyDay(r.tick)+'\n'+(en()?window.NanlanI18n.t(r.text):r.text)).join('\n\n'):L('尚未亲访。三个窗口每日都会再来，错过不会失去任务。','No observations yet. Each window returns daily; missing it does not forfeit the quest.'));
 if(s.flags.volume2Started)section(L('新岁记','A New Year'),L('秋去冬来，新岁已至。家人在南澜安顿下来，第二卷从次年春日接续。日历记四季，账本另记旅程经过的日数。旧有物资与约定仍在，不因翻卷额外扣钱。','Autumn and winter pass; a new year arrives. With the household settled, Volume II begins in spring of the following year. The calendar tracks seasons, while the accounts also record journey days. Goods and promises remain, with no extra charge for turning the volume.'));
 navButton(L('查看租约与押金','Read Lease & Deposit'),lease,'papers-contract');
 navButton(L('回到眼前记事','Current Quest'),showQuest,'papers-quest');
}
function rewards(){
 const s=state(),q=N.current(s);
 activity(L('当前任务 · 回报与记事','Current Quest · Outcome & Notes'),q?(en()?window.NanlanI18n.t(N.titles[q]):N.titles[q]):L('眼前主线已完成，可翻看行记或继续日常。','The current storyline is complete. Read the journal or continue daily life.'),'quest-reward');dialogObject=null;
 if(q){const [money,text]=N.rewards[q];rows([[L('办妥后留下','What completion brings'),en()?window.NanlanI18n.t(text):text],[L('额外铜钱','Additional coins'),money?coins(money):L('本段无额外铜钱；交易收入另入账','No additional coins for this entry; trading income is recorded separately')],[L('领取方式','When received'),L('全部事项办妥后自动记入，不需再次领取','Recorded automatically when all steps are complete')]]);}
 navButton(L('查看当前事项与去处','View Steps & Destinations'),showQuest,'reward-steps');
 navButton(L('回看已完成的记事','Completed Entries'),showQuestCatalog,'reward-history');
}
function yearTransition(next){
 const s=state();activity(L('新岁已至','A New Year Arrives'),L('秋去冬来，屋檐下又添了新绿。\n一家人的日子渐渐安稳，母亲将南街铺讯放在了桌上。','Autumn and winter pass, and new green returns beneath the eaves.\nThe household has found its feet. Mother lays the South Street notice on the table.'),'season-transition');dialogObject=null;
 note(C.label(s,en())+' · '+L('第二卷从这一页接续','Volume II begins here'));
 note(L('这次翻卷跨入新春；现有家用、行囊、作物和约定保留。日后可在「铺讯与手记」回看。','This turn of the volume brings a new spring. Savings, belongings, crops and promises are kept. Read this passage again in Shop Notice & Notes.'));
 navButton(L('翻到新春 · 读铺讯','Turn to Spring · Read the Notice'),next,'year-continue');
}
Object.assign(window.NANLAN_EN,{'当前任务要用的材料即使为 0 也会列出来源；预留库存仍属于你，但不能散卖。':'Materials needed for the current quest include their sources even when stock is zero. Reserved goods remain yours, but cannot be sold individually.','卷轴地图':'Scroll Map'});
window.NanlanI18n?.configure(window.NANLAN_EN);
window.NanlanContinuity={lease,handbook,rewards,yearTransition,tabs,dateAt};
})();
