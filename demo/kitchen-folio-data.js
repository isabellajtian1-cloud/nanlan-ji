/* Dishes, sources and stall prices used by both the kitchen and the market. */
(function(root, make){
  if(typeof module==='object' && module.exports) module.exports=make();
  else root.NanlanFoodData=make();
})(globalThis,function(){
  'use strict';
  const groups={
    savoury:['肉脯河鲜','Roasts & river fare'], grain:['饭面点心','Rice & noodles'],
    sweet:['糕饼蜜果','Cakes & preserves'], tea:['茶汤果饮','Teas & coolers']
  };
  const seasons={spring:['春','Spring'],summer:['夏','Summer'],autumn:['秋','Autumn'],winter:['冬','Winter']};
  // Village retail price per portion. A zero price means the ingredient is gathered.
  const goods={
    shoot:['竹笋','Bamboo shoots',4], pork:['猪肉','Pork',6], ginger:['生姜','Ginger',2],
    goose:['净鹅','Dressed goose',12],duck:['净鸭','Dressed duck',10], lees:['香糟','Rice-wine lees',3],
    pondFish:['塘鱼','Pond fish',9], crab:['河蟹','River crab',8], orange:['香橙','Sweet orange',4],
    rice:['米粮','Rice',3], millet:['黄粟','Millet',3], lotusLeaf:['鲜荷叶','Lotus leaf',0],
    flour:['麦面','Wheat flour',3], vegetable:['菜蔬','Greens',4], starch:['豆粉','Bean starch',3], lamb:['羊肉','Mutton',7],
    aspic:['肉汤冻','Jellied stock',4], milk:['鲜乳','Milk',4], sweetWine:['甜酒酿','Sweet rice ferment',3],
    rose:['食用玫瑰','Culinary rose petals',3], wisteriaPaste:['藤萝熟馅','Prepared wisteria filling',4],
    honey:['蜜','Honey',3], plum:['青梅','Green plums',3], stickyRice:['糯米','Glutinous rice',3],
    eightFruits:['八样果料','Eight-fruit mix',7], teaLeaf:['散茶','Loose tea',3],
    jasmine:['茉莉花','Jasmine blossoms',3], osmanthus:['桂花','Osmanthus blossoms',3],
    perilla:['紫苏叶','Perilla leaves',2], lychee:['荔枝','Lychees',5], quince:['木瓜（榠楂类）','Chinese quince',4],
    cane:['甘蔗','Sugarcane',3], ice:['冰屑','Ice chips',2]
  };
  const books={
    songCrab:['南宋 · 林洪《山家清供》','Southern Song · Lin Hong, Shanjia Qinggong','https://www.shidianguji.com/zh/book/GJDS006/chapter/GJDS006_45'],
    mountain:['南宋 · 林洪《山家清供》','Southern Song · Lin Hong, Shanjia Qinggong','https://zh.wikisource.org/wiki/山家清供'],
    fish:['明 · 宋诩《竹屿山房杂部》卷四','Ming · Song Xu, Zhuyu Shanfang Zabu, vol. 4','https://www.shidianguji.com/book/SK1926/chapter/1llqnvb3azyn6'],
    meat:['明 · 宋诩《竹屿山房杂部》卷三','Ming · Song Xu, Zhuyu Shanfang Zabu, vol. 3','https://www.shidianguji.com/book/SK1926/chapter/1llqnv8mcw3zc'],
    noodles:['明 · 宋诩《竹屿山房杂部》卷二','Ming · Song Xu, Zhuyu Shanfang Zabu, vol. 2','https://www.shidianguji.com/book/SK1926/chapter/1llqnv5y5blsz'],
    palace:['明 · 刘若愚《酌中志》卷二十','Ming · Liu Ruoyu, Zhuozhong Zhi, vol. 20','https://www.shidianguji.com/book/NGJ89241199901718740315/chapter/1lmflyin3ls14'],
    leafTea:['明 · 宋诩《竹屿山房杂部》卷一','Ming · Song Xu, Zhuyu Shanfang Zabu, vol. 1','https://www.shidianguji.com/book/SK1926/chapter/1llqnv2y5dmi0'],
    scent:['明 · 高濂《遵生八笺》藏茶','Ming · Gao Lian, Zunsheng Bajian, storing tea','https://www.shidianguji.com/zh/book/SK1927/chapter/1l9o0l47t7evj'],
    water:['明 · 高濂《遵生八笺》熟水诸方','Ming · Gao Lian, Zunsheng Bajian, infusions','https://www.shidianguji.com/book/SK1927/chapter/1l9o0l47tddsf'],
    crystal:['元 · 忽思慧《饮膳正要》聚珍异馔','Yuan · Hu Sihui, Yinshan Zhengyao','https://zh.wikisource.org/wiki/飲膳正要/聚珍異饌'],
    syrup:['元 · 忽思慧《饮膳正要》诸般汤煎','Yuan · Hu Sihui, Yinshan Zhengyao, syrups','https://zh.wikisource.org/wiki/飲膳正要/諸般湯煎'],
    quince:['明 · 李时珍《本草纲目》卷三十','Ming · Li Shizhen, Bencao Gangmu, vol. 30','https://zh.wikisource.org/wiki/本草綱目_(四庫全書本)/卷30'],
    lotus:['清初 · 屈大均《广东新语》卷十四','Early Qing · Qu Dajun, Guangdong Xinyu, vol. 14','https://zh.wikisource.org/wiki/廣東新語/卷14'],
    milk:['清 · 《红楼梦》第十九回','Qing · Dream of the Red Chamber, ch. 19','https://zh.wikisource.org/wiki/紅樓夢/第019回'],
    blossoms:['清 · 富察敦崇《燕京岁时记》','Qing · Fucha Dunchong, Yanjing Suishiji','https://zh.wikisource.org/wiki/燕京歲時記']
  };
  const recipes={};
  function add(id,group,title,en,foods,work,price,season,source,zhNote,enNote){
    recipes[id]={id,group,title:[title,en],foods:foods.split(' '),work,price,season,source,note:[zhNote,enNote]};
  }
  add('bambooRoast','savoury','烧笋','Ember-roasted bamboo shoots','shoot','ember',9,'','mountain','林洪写山里人把新笋埋进热灰。剥开焦壳，笋心还留着汁。','Lin Hong describes shoots tucked into hot ashes. The charred sheath keeps the core juicy.');
  add('braisedPork','savoury','烂煨肉','Slow-braised pork','pork ginger','braise',15,'','meat','宋诩写过封锅缓火的肉食。母亲把姜切厚，夹肉时还能拣得出来。','Song Xu records slow cooking in a sealed pot. Mother slices ginger thick enough to fish out at table.');
  add('roastGoose','savoury','金陵客的烧鹅','Roast goose from a Jinling traveller','goose ginger','roast',22,'','palace','刘若愚记京中烧鹅。金陵客传方是本店故事，刀下先分那一片脆皮。','Liu Ruoyu records roast goose in Beijing. The travelling Jinling cook is our invention. The first cut takes the crisp skin.');
  add('roastDuck','savoury','金陵客的烧鸭','Roast duck from a Jinling traveller','duck honey','roast',20,'','palace','书中可见烧鸭的食名。摊主薄薄刷蜜，切肉时把皮留在每一片上。','Roast duck appears by name in the text. Our vendor brushes the skin with honey and leaves a strip on every slice.');
  add('leesFish','savoury','糟鱼','Fish with rice-wine lees','pondFish lees','crock',19,'','fish','宋诩记鱼与糟同瓮，取用再蒸。塘里收的鱼就能做，封坛和开坛分两回来。','Song Xu puts fish and lees in a jar and steams the fish for serving. Your own pond harvest works here.');
  add('leesCrab','savoury','糟蟹','Crab with rice-wine lees','crab lees','crock',19,'autumn','fish','宋诩记熟蟹入糟。壳沿还带着些糟香，掰开蟹脚才见白肉。','Song Xu preserves cooked crab in lees. The shells keep the fragrance, the legs their white meat.');
  add('crabOrange','savoury','蟹酿橙','Crab steamed in an orange','crab orange','hollow',23,'autumn','songCrab','南宋旧方以橙作盏，留下少许橙汁，填蟹后原盖蒸。揭盖时客人先闻见橙香。','A Southern Song recipe keeps a little juice in the hollow orange and replaces its lid before steaming.');
  add('twoGrains','grain','金银饭','Gold-and-silver grain rice','rice millet','rice',12,'','','白米与黄粟在碗里一粒一粒分得清。金银是南澜家里为这碗饭起的名字。','White rice and yellow millet stay distinct. The Nanlan household named this version for the two colours.');
  add('lotusRice','grain','荷叶饭','Lotus-leaf rice parcel','lotusLeaf rice pork','wrap',20,'summer','lotus','清初屈大均记东莞荷包饭。这一包裹米与肉丁，叶脉朝外，方便客人提走。','Qu Dajun records Dongguan leaf-wrapped rice in the early Qing. This household parcel holds diced pork and rice.');
  add('noodleSoup','grain','青菜汤饼','Noodles in greens broth','flour vegetable','slice',13,'','noodles','宋诩记面片擀薄、切缕。家里留一把青菜作汤头，临上桌再浇。','Song Xu describes rolled and sliced noodles. Here a handful of greens goes into the broth just before serving.');
  add('knifeNoodles','grain','手切面','Hand-cut noodles','flour ginger','slice',12,'','noodles','面片轻折，切开再抖松。姜汤是南澜这一碗的浇头。','Fold the sheet loosely and shake the strands apart after cutting. The ginger broth is a household finish.');
  add('crystalDumpling','grain','水晶角儿','Crystal dumplings','starch lamb','fold',17,'','crystal','元代旧方以豆粉皮裹羊肉。蒸笼一掀，透亮的角儿露出馅色。','A Yuan recipe wraps mutton in bean-starch dough. The filling shows through when the steamer opens.');
  add('soupBun','grain','灌汤包','Soup-filled buns','flour pork aspic','fold',20,'','','肉汤冻包在褶里，遇热又成汤。此处是南澜面摊的灌汤做法。','Jellied stock melts inside the pleats. This filling and folding method belong to the Nanlan noodle stall.');
  add('milkCurd','sweet','糖蒸酥酪','Sweet steamed milk curd','milk sweetWine cane','custard',17,'','milk','这个菜名见于清代《红楼梦》。乳面轻轻一颤，碗沿留一道薄薄的奶皮。此处按后世甜品拟作。','The name appears in the Qing novel Dream of the Red Chamber. A thin skin forms at the rim of our adapted dessert.');
  add('roseCake','sweet','玫瑰饼','Rose-petal cakes','rose flour honey','bake',16,'spring','','南澜饼师把花揉进蜜馅，薄皮一掰，馅心粘在两边。此处取花饼意趣。','The Nanlan baker rubs petals into the honey filling. Break the thin crust and the filling clings to both halves.');
  add('wisteriaCake','sweet','藤萝饼','Wisteria blossom cakes','wisteriaPaste flour','bake',15,'spring','blossoms','清代《燕京岁时记》记春日藤萝饼。铺里备妥熟馅，玩家只管包饼上炉。','Recorded as a spring cake in Qing Beijing. The baker supplies prepared filling for wrapping and baking.');
  add('honeyPlums','sweet','蜜煎青梅','Honey-preserved green plums','plum honey','reduce',14,'','noodles','宋诩的蜜煎制写到梅子。蜜汁挂住果皮，咬开时里面仍有一丝酸。','Song Xu includes plums among honey preserves. Beneath the glossy coating a little tartness remains.');
  add('eightRice','sweet','八宝饭','Eight-treasure sticky rice','stickyRice eightFruits honey','rice',22,'','','果料包里有枣、莲子、核桃、桂圆、栗子、松子、葡萄干、梅脯。家宴里谁都想分到碗底那一圈。','Dates, lotus seeds, walnuts, longan, chestnuts, pine nuts, raisins and preserved plums line our festive bowl.');
  add('greenTea','tea','清香散茶','Loose-leaf green tea','teaLeaf','steep',9,'','leafTea','宋诩写投茶候汤。茶棚里只摆一把壶、两只盏，水声一静就能听见街声。','Song Xu describes leaf tea and water coming to the boil. As the kettle quiets, street sounds fill the tea stall.');
  add('jasmineTea','tea','茉莉窨茶','Jasmine-scented tea','jasmine teaLeaf','scent',14,'summer','scent','高濂记茶与花分层贮藏。客人揭盖先闻花气，杯里喝到的仍是茶。','Gao Lian describes layering tea and flowers. The cup carries the scent even after the blossoms are removed.');
  add('osmanthusTea','tea','桂花窨茶','Osmanthus-scented tea','osmanthus teaLeaf','scent',14,'autumn','scent','旧称木樨的桂花也能窨茶。小花只铺薄层，把叶子轻覆在上面。','Osmanthus, also called muxi, scents the leaves in thin layers, as described by Gao Lian.');
  add('perillaWater','tea','紫苏熟水','Perilla infusion','perilla','steep',8,'','water','高濂记隔纸烘叶再泡。茶棚把紫苏水盛在粗盏里，盏底还浮着一点叶香。','Gao Lian warms perilla leaves on paper before infusing them. The tea stall serves the fragrant water in a coarse cup.');
  add('lycheeIce','tea','冰镇鲜荔枝膏','Iced fresh-lychee cooler','lychee cane ice','chill',18,'summer','syrup','《饮膳正要》的荔枝膏有乌梅调味。南澜果摊另取鲜荔枝熬膏，临卖才添冰。','An earlier syrup called lizhi gao used smoked plums. The Nanlan fruit stall uses fresh lychees and adds ice at service.');
  add('quinceDrink','tea','木瓜蜜姜饮','Quince, honey and ginger drink','quince honey ginger','reduce',16,'','quince','明代木瓜煎有熟果、蜜和姜。这里用芳香酸涩的中式木瓜，调水作街饮。','A Ming quince preparation uses cooked fruit, honey and ginger. Here the aromatic Chinese quince is diluted for a market drink.');
  return {groups,seasons,goods,books,recipes};
});
