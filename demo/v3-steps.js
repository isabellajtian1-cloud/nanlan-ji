/* Each row is an action at a physical object. IDs remain stable across both languages. */
(function(root,build){const data=build();if(typeof module==='object'&&module.exports)module.exports=data;else root.NanlanV3Steps=data;})(globalThis,function(){
'use strict';
const rows=[
[
['tag','generalStore','v3Chest','对照竹箱旧牌与新纸，另册代管','Compare the old tag and new slip. Enter the chest in safekeeping.'],
['witness','county','v2Neighbor','向隔壁陆掌柜核对送货人','Ask the neighboring shopkeeper who brought the chest.'],
['claim','village','v3Zhou','请周成凭箱牌认领，商量去向','Have Zhou identify the chest and decide where it goes.',['联系原买家','Contact the original buyer'],['由货主寄放一件试卖','Take one piece on consignment']],
],[
['family','hall','v2Family','看母亲的约看册，议一个短班','Consult Mother’s appointment book and agree on a short shift.',['母亲守午前，留足约看时间','Mother covers the morning before her appointment'],['父亲守短班，母亲照常选品','Father takes the shift while Mother visits her supplier']],
['desk','generalStore','v3Desk','核对价签、可售实货、预留与权限，签一小时短班','Check prices, available stock, holds and authority. Sign a one-hour shift.'],
['away','county','v2Neighbor','离店向陆掌柜问河埠来路','Leave the shop and ask about the road to the wharf.'],
['return','generalStore','v3Desk','一小时后回柜台，看本班流水','Return after the hour to review the shift record.'],
],[
['load','wharf','v3Berth','看装船货位，留意叠箱的空隙','Inspect the loading berth and the space between crates.'],
['water','wharf','v3Gauge','在潮桩记下实测水位','Read the tide at the gauge.'],
['inn','wharf','v3Fang','到客栈收货口问用途','Ask the innkeeper what the goods must do.'],
['sail','wharf','v3Boatman','问清容量、班期与报信方式','Confirm capacity, sailing time and how changes are reported.',['先看装船，留一份班牌','Keep the loading list'],['先问客栈，留一张用途单','Keep the inn’s requirements']],
],[
['weaver','village','v3Zhou','问竹匠用料、工时与原定结算','Ask Zhou about bamboo, working hours and payment.'],
['herbal','village','doctor','问青禾盛药与叠放的需要','Ask Qinghe how she packs and stacks herbs.'],
['supply','village','v3Zhou','约定首批上限和退换办法','Agree on the first lot and how to handle unsuitable pieces.',['只约一种承重规格','Agree on one load-bearing grade'],['分记提货与盛药两种用途','Record two uses separately']],
],[
['ground','oldTrail','v3Loose','查看松土，划出安全边界','Inspect the loose bank and mark the safe edge.'],
['rest','oldTrail','v3Shelter','找到歇脚棚的避雨处','Find shelter and a dry place for a load.'],
['sign','oldTrail','v3Sign','留下返程记号，再决定走法','Mark the return route and choose the way through.',['竹材一根，整好安全小段','Use one bamboo to secure a short stretch'],['绘下绕行草图，避开松地','Sketch the detour around the soft ground']],
['report','village','villager','把旧路草图带给陈伯','Bring the route sketch back to Uncle Chen.'],
],[
['sample','store','workbench','在仓房编一件试样','Make a trial piece at the household workbench.',['承重篓 · 竹二、二十分钟','Sturdy basket · two bamboo, 20 minutes'],['叠放篓 · 竹一、十五分钟','Nesting basket · one bamboo, 15 minutes']],
['trial','store','workbench','试提、叠放，摸出一处缺陷','Lift and nest the sample to find a rough spot.'],
['mend','store','workbench','收紧接口，复查样品','Tighten the joint and inspect the sample again.'],
['standard','wharf','v3Fang','把改好的样品交给方掌柜试用','Bring the corrected sample to Keeper Fang for approval.'],
],[
['lease','workshop','v3Bench','看使用约定，定工棚布局','Read the terms and choose the workshop layout.',['小批制作 · 租用四文','Small-batch bench · four coins'],['收发优先 · 租用六文','Receiving-first layout · six coins']],
['repair','workshop','v3Racks','清地、修漏，安放工作台与双架 · 木二竹一','Clear the floor, mend the roof and fit two racks · two wood and one bamboo.'],
['aisle','workshop','v3Door','走到收发口试过通道','Walk to the receiving door and check the passage.'],
],[
['hire','workshop','v3Xiaoman','同小满商量时段、报酬和先学的一项','Agree on Xiaoman’s hours, pay and first skill.',['先教包装','Teach packing first'],['先教收发','Teach receiving first']],
['teach','workshop','v3Racks','拿两份真竹料上架，陪她核数分架','Set aside two real bamboo pieces and help her sort them.'],
['roster','workshop','v3Bench','核准培训记录与日间一班工','Approve the training record and a daytime shift.'],
],[
['inspect','workshop','v3Racks','摸过两捆竹料，对着样品分级','Sort the two bundles against the approved sample.'],
['grade','workshop','v3ZhouShop','请周成确认退换或分级结算','Agree on exchange or graded payment with Zhou.',['换回承重竹 · 六文，等半小时','Exchange for sturdy bamboo · six coins, wait half an hour'],['按用途分级 · 五文，薄料做内衬','Accept two grades · five coins, use thin splits for lining']],
],[
['order','workshop','v3Bench','拨料付工钱，约定首批两件','Allocate materials and wages for the first two pieces.',['合做两件，同批验收','Make two together and inspect them as a lot'],['分两批，首件验过再做','Make them in sequence and inspect the first']],
['batch','workshop','v3Racks','按工时回访，点清两件成品','Return after working time and count two finished pieces.'],
],[
['alert','wharf','v3Boatman','核对改班告示，查看余货与运费','Read the sailing change and compare freight and stock.'],
['amend','wharf','v3Fang','与收货人敲定改约与交期','Agree on the revised delivery with the recipient.',['改陆路 · 两件八文，半小时','Take both by road · eight coins, half an hour'],['分送 · 先一件三文，余件另班','Split the load · three coins now, one piece later'],['整批顺延 · 四文，两小时','Delay both · four coins, two hours']],
['ship','wharf','v3Berth','装运已约货物，付这一程运钱','Load the agreed goods and pay this fare.'],
['receive','wharf','v3Fang','按凭单签收，结清已到的部分','Present the waybill and settle only the pieces received.'],
],[
['note','generalStore','v3Desk','翻开柜台留言，对照预留和流水','Compare the counter note with stock and reservations.'],
['regular','generalStore','v3Desk','与熟客商量日常留货或限期预约','Agree on shelf stock or a dated pickup.',['留一件日用竹器给街坊','Set one everyday piece aside'],['约下一次取货，先不占柜','Arrange a pickup and leave the shelf clear']],
['fill','generalStore','v3Desk','补一件实货，照原约交给熟客','Fill the regular’s request with one real piece.'],
],[
['stall','qingxi','v3Stall','带竹器到遮雨棚，摆一次旧埠小集','Bring bamboo ware to the covered stall for market day.',['摆日用现货','Display an everyday piece'],['展示规格，接受试订','Display a sample and take a trial order']],
['trade','qingxi','v3Stall','完成一笔实售，盘清摊上实货','Complete one sale and count the goods remaining.'],
['needs','qingxi','v3Porter','记下挑担人和买家的两条用途','Record what the porter and the buyer need.'],
],[
['consent','village','v3Zhou','询问制作者愿意如何署名','Ask Zhou how he wants his work credited.',['取得许可，记周成姓名','With permission, record Zhou’s name'],['只记村落与批号','Record only village and batch']],
['origin','workshop','v3Racks','核对批号、货权与原约货款','Match maker, batch and the payment already agreed.'],
['label','generalStore','v3Desk','把来源牌系到本批实样','Tie the maker’s label to the real display sample.'],
],[
['request','wharf','v3Fang','听方掌柜讲明数量、用途与交期','Hear Fang’s quantity, purpose and delivery date.'],
['plan','workshop','v3Bench','先试算一种做法，暂不接单','Cost a possible plan before making a commitment.',['固定小批','Keep the batch small'],['预备扩作坊','Consider another workbench'],['询问合作制作者','Approach a second maker']],
],[
['council','hall','v2Family','灯下听完家人的安排，确定可承担的份额','Hear everyone at the family table and choose a feasible scale.',['两件小批，先顾熟客','Two pieces and room for regulars'],['三件扩量，添置工位','Three pieces with a second work position'],['四件联供，分给同业','Four pieces shared with a fellow maker']],
['capacity','workshop','v3Bench','用料和可用工时核实后备货','Verify materials and hours, then prepare the first lot.'],
['contract','wharf','v3Fang','亲自约定交期，收定金并记未交义务','Confirm the date in person and record the advance against undelivered goods.'],
['first','wharf','v3Fang','交首件，抵扣这一件的定金','Deliver the first piece and credit its share of the advance.'],
],[
['handoff','generalStore','v3Desk','清晨备妥实货与工钱，签离店交接','Set aside stock and wages for a day away.',['陪祖父到村中访友','Visit a friend with Grandfather'],['随阿岑去看旧路幼竹','Visit the young bamboo with A-Cen'],['和沈晚渔到海边听舟讯','Walk the shore with Shen Wanyu']],
['outing','village','villager','离开柜台，亲自赴约','Leave the counter and keep your appointment.'],
['audit','generalStore','v3Desk','日落后回柜台，核对当日委托与留言','Return after sunset to review the day’s work and notes.'],
],[
['answer','generalStore','v3Desk','答复留言，核对工资货款与未交义务','Answer the notes and reconcile wages, goods and open commitments.'],
['meal','hall','mealTable','带热饭回家，选定明日的路','Bring a hot meal home and choose tomorrow’s direction.',['守好南街日用货架','Keep the everyday shelf stocked'],['让村里的工棚慢慢长','Help the village workshop grow'],['再走一班山海商路','Try another small trading route']],
]];
return rows;
});
