/* The household notebook stores a pot by method and ingredients, independently of its title. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.NanlanHearth = factory();
})(globalThis, function () {
  'use strict';
  const ingredients = {
    rice: ['米粮', 'Rice'], vegetable: ['菜蔬', 'Greens'], shoot: ['竹笋', 'Bamboo shoots'],
    mushroom: ['蘑菇', 'Mushrooms'], pondFish: ['塘鱼', 'Pond fish'], clam: ['蛤蜊', 'Clams'],
    seaweed: ['海藻', 'Sea greens'], ginger: ['生姜', 'Ginger'], redBean: ['赤豆', 'Adzuki beans'],
    chestnut: ['栗子', 'Chestnuts'], fishDry: ['海鲞', 'Dried sea fish'], cane: ['甘蔗', 'Sugarcane'],
    longan: ['龙眼', 'Longan']
  };
  const pantry = {ginger:2, redBean:3, chestnut:4, fishDry:5, cane:3};
  const methods = {
    porridge: ['熬粥', 'Simmer congee'], ricepot: ['焖饭', 'Cook covered rice'], broth: ['煮汤', 'Make soup']
  };
  const finish = {porridge:['粥','congee'], ricepot:['焖饭','covered rice'], broth:['汤','soup']};
  const slots = Object.keys(ingredients);
  const notes = new Map();
  function key(method, foods) {
    return method + ':' + slots.filter(id => foods.includes(id)).join('+');
  }
  function card(method, foods, title, taste, old = false) {
    notes.set(key(method, foods), {title, taste, old});
  }
  card('porridge',['rice','redBean'],['芜蒌粥','Wulou bean congee'],['赤豆先在砂罐中煮软，再与微沸的米粥合煮。舀起一勺，豆皮还挂在勺沿，豆心已经酥了。','The beans soften in a clay pot before joining the simmering rice. A skin catches on the ladle, but the centre gives way.'],true);
  card('porridge',['rice','fishDry'],['河祇粥','Heqi dried-fish congee'],['海鲞煮软后拆骨分丝，待粥熟才合进去。米汤只带一点咸，细嚼才尝到鱼鲜。','The softened dried fish is boned and flaked into cooked rice. The first spoonful tastes of rice, the next of the sea.'],true);
  card('porridge',['rice','chestnut'],['山栗粥','Mountain chestnut congee'],['熟栗肉揉碎再入米。碗底留着些细栗末，越往下舀，米香里那点甜越清楚。','Cooked chestnuts are crumbled into the rice. Fine chestnut meal settles near the bottom, where the sweetness gathers.'],true);
  card('porridge',['rice','cane'],['甘蔗粥','Cane-juice congee'],['取蔗浆煮米，滤去的蔗渣搁在灶边。粥面看去素白，送到嘴边才闻着清甜。','The rice cooks in pressed cane juice. The fibres stay by the hearth. The white grains give away their sweetness only at the spoon.'],true);
  card('porridge',['rice','vegetable'],['畦头青菜粥','Garden greens congee'],['青菜切细，最后才下。热粥里的菜叶还看得出叶脉。','The greens go in finely cut and late enough that their veins still show.']);
  card('porridge',['rice','clam','ginger'],['姜丝蛤蜊粥','Clam and ginger congee'],['米花托住蛤肉。先尝到潮水似的咸鲜，咽下去时，姜丝才暖起来。','Rice holds the clam meat at the surface. Brine comes first, then a little warmth from the ginger.']);
  card('porridge',['rice','longan'],['桂圆鲜粥','Fresh longan congee'],['龙眼剥壳去核，果肉在米花间半透明，一勺里偶尔才遇着一颗。','Slivers of pitted longan turn translucent among the grains, a sweet find in every few spoonfuls.']);
  card('ricepot',['rice','shoot','mushroom'],['山笋菌香饭','Bamboo shoot and mushroom rice'],['揭盖先冒出菌香，筷尖拨开才见笋丁。锅底那层米把山里的滋味吃足了。','Mushroom fragrance escapes first. Diced shoots lie under the rice, with the deepest flavour in the bottom layer.']);
  card('ricepot',['rice','chestnut','redBean'],['栗豆焖饭','Chestnut and bean rice'],['栗肉一碰就散，赤豆把挨着的米染成浅红。','The chestnuts crumble at a touch. Each bean leaves a blush on the grains beside it.']);
  card('broth',['shoot','mushroom'],['双鲜笋菌汤','Woodland shoot broth'],['笋片脆，菌伞软，两样都咬过一口，再喝汤便尝得出分别。','Crisp slices of shoot and soft mushroom caps give the clear broth two distinct bites.']);
  card('broth',['clam','seaweed'],['潮口双鲜汤','Tidepool clam broth'],['海藻贴着碗边舒开，蛤肉沉在底下。轻晃一下碗，汤里还有海边的气息。','Sea greens unfurl at the rim, with clams below. A swirl brings up the scent of the shore.']);
  card('broth',['pondFish','ginger'],['塘鱼姜丝汤','Pond fish and ginger soup'],['鱼肉剔过刺，顺着纹理分成小片。几缕姜丝浮在汤上，闻起来格外清鲜。','Boned fish separates into flakes. Fine threads of ginger float in the clean, fragrant broth.']);
  function problem(method, foods) {
    if (!Object.hasOwn(methods,method) || !Array.isArray(foods) || foods.length < 1 || foods.length > 4 ||
        new Set(foods).size !== foods.length || foods.some(id => !Object.hasOwn(ingredients,id)))
      return ['选一至四味不同食材，每味一份。','Choose one to four different ingredients, one portion each.'];
    if ((method !== 'broth') !== foods.includes('rice'))
      return method === 'broth' ? ['米留给粥或焖饭，这锅汤可换一味菜。','Set rice aside for congee or covered rice. Choose another ingredient for soup.'] :
        ['这一锅要先有米。','This pot needs rice.'];
    if (foods.length === 1 && foods[0] === 'ginger') return ['姜是提味的，再添一味主料。','Ginger seasons the pot. Add a main ingredient.'];
    if (foods.some(x => ['longan','cane'].includes(x)) && foods.some(x => ['vegetable','shoot','mushroom','pondFish','clam','fishDry','seaweed'].includes(x)))
      return ['果蔗走甜口。这锅可配米、赤豆、栗子或生姜。','For a sweet pot, pair fruit or cane with rice, beans, chestnuts or ginger.'];
    return null;
  }
  const accents = {
    ginger:['细姜透出一点辛香','shredded ginger lends warmth'], pondFish:['鱼肉顺纹散开','the fish falls into flakes'],
    clam:['蛤肉带出海味','clams lend a briny note'], seaweed:['海藻滑嫩','the sea greens are silky'],
    fishDry:['海鲞的咸鲜渗进汤汁','the dried fish gives up its savour'], mushroom:['菌香留在舌尖','a mushroom fragrance lingers'],
    shoot:['薄笋还带着脆意','the sliced shoots keep some bite'], vegetable:['碎叶透着菜香','the cut greens smell fresh'],
    redBean:['赤豆酥软','the beans have softened'], chestnut:['栗肉细而带甜','the chestnuts crumble sweetly'],
    cane:['蔗浆清甜','the cane juice has a clean sweetness'], longan:['果肉留下一点蜜香','the longan leaves a honeyed note']
  };
  function describe(method, foods) {
    const id=key(method,foods), known=notes.get(id);
    const parts=slots.filter(x=>x!=='rice' && foods.includes(x));
    if (known) return {id, ...known};
    const base = parts.length ? parts.map(x=>ingredients[x][0]).join('') : '白米';
    const english = parts.length ? parts.map(x=>ingredients[x][1].toLowerCase()).join(' & ') : 'Plain';
    const senses = parts.map(x=>accents[x]);
    const body = {porridge:['米花熬开，粥落勺时稠而不断。','The grains open into a soft, spoon-coating congee.'],ricepot:['揭盖松饭，锅边收得干爽。','Lifting the lid releases a puff of steam from the tender grains.'],broth:['舀起一勺，碗边还冒着热气。','Steam gathers at the bowl as you lift the ladle.']}[method];
    return {id,old:false,title:[base+finish[method][0],english+' '+finish[method][1]],
      taste:[body[0]+(senses.length?senses.map(t=>t[0]).join('，')+'。':''),body[1]+(senses.length?' In this batch, '+senses.map(t=>t[1]).join(', ')+'.':'')]};
  }
  function unpack(id) {
    const [method, list] = id.split(':');
    return {method, foods:list ? list.split('+') : []};
  }
  function normalise(s, need) {
    if (s.hearthBook === undefined) s.hearthBook={};
    const book=s.hearthBook;
    need(book && typeof book==='object' && !Array.isArray(book),'灶边食谱簿损坏。');
    let stock=0;
    for (const [id,r] of Object.entries(book)) {
      const {method,foods}=unpack(id);
      need(!problem(method,foods) && key(method,foods)===id && r && Number.isSafeInteger(r.made) && r.made>0 &&
        Number.isSafeInteger(r.left) && r.left>=0 && r.left<=r.made && Number.isSafeInteger(r.day) && r.day>=1 &&
        typeof r.name==='string' && Array.from(r.name).length<=24 && !/[\u0000-\u001f\u007f]/.test(r.name),'灶边食谱记录无效。');
      stock+=r.left;
    }
    need(stock===(s.bag.hearthServing||0),'食谱簿和行囊里的碗数不符。');
  }
  function act(s, action, p, h) {
    const {requireThat:need,spend,give}=h;
    need(h.done(s,'M04'),'先把第一顿热饭端回正厅。');
    need(s.revision===p.sequence,'手边的记录已变，请重新核对。');
    const book=s.hearthBook || (s.hearthBook={});
    if (action==='hearthCook') {
      h.requireScene(s,['yard','serviceKitchen']);
      const issue=problem(p.method,p.foods);
      need(!issue,issue?.[0]);
      need(Number.isInteger(s.bucketWater) && s.bucketWater>=1,'请先到庭院水缸装水。');
      spend(s,{wood:1,...Object.fromEntries(p.foods.map(x=>[x,1]))});
      s.bucketWater--;
      const id=key(p.method,p.foods);
      const entry=book[id] || (book[id]={made:0,left:0,day:h.clock(s).day,name:''});
      entry.made++; entry.left++;
      give(s,{hearthServing:1});
      return;
    }
    need(typeof p.id==='string' && Object.hasOwn(book,p.id),'请先试做这道菜。');
    const entry=book[p.id];
    if (action==='hearthName') {
      need(typeof p.name==='string' && Array.from(p.name.trim()).length<=24 && !/[\u0000-\u001f\u007f]/.test(p.name),'菜名最多二十四字。');
      entry.name=p.name.trim();
      return;
    }
    need(action==='hearthEat' && entry.left>0,'这道菜已经吃完了。');
    need(s.stamina<100,'体力正满，可以把这碗留到路上。');
    spend(s,{hearthServing:1}); entry.left--;
    s.stamina=Math.min(100,s.stamina+30);
  }
  return {ingredients,methods,pantry,key,unpack,problem,describe,normalise,act};
});
