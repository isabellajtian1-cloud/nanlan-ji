/* The first market customer carries the same red-thread hamper to South Street. */
(() => {
  'use strict';
  const L = (zh, en) => deskText(zh, en);
  const descriptions = {
    arrive: ['大娘拢着红布包，面前摆着浅篮和带盖的小篓。', 'A woman gathers a red bundle between a shallow tray and a lidded hamper.'],
    shallow: ['浅篮斜向一边，布包松开，剪柄已经探出篮沿。', 'The tray tips. The bundle loosens and the scissors slip over the rim.'],
    lidded: ['她提着篓盖的环扣晃了两下，系着红线的盖子仍稳稳合着。', 'She gives the hamper two shakes. The lid with the red thread stays snug.'],
    reunion: ['南街铺门前，大娘臂弯里仍挽着系红线的小篓。', 'At the South Street shop, the red-thread hamper still hangs from her arm.']
  };
  function illustration(scene) {
    const img = document.createElement('img');
    img.src = 'ferry-' + scene + '-6122.webp';
    img.alt = L(...descriptions[scene]);
    img.className = 'ferry-illustration';
    return img;
  }
  function goodsName(item) {
    if (item === 'bambooWare') return L('带盖小篓', 'lidded hamper');
    if (item === 'driedHerb') return L('干药包', 'dried herbs');
    return L('贝饰', 'shell ornament');
  }
  function reunion(s) {
    const item = s.choices.ferryFirstGood;
    if (!N.products.includes(item)) return null;
    const figure = illustration('reunion');
    figure.classList.add('ferry-reunion');
    $('panelExtra').prepend(figure);
    const copy = $('panelExtra').querySelector('.shop-story-copy');
    if (copy) copy.textContent = L('她腾出一只手，把铺门再推开些，朝身后招了招。', 'She pushes the door a little wider and beckons to someone outside.');
    if (s.flags.v2CustomerHeard) return [ '她比了比门框。「跟我同船的阿婆，家门比你这儿窄。给她也挑一只吧，能贴着腿提的那种。」', 'She measures the doorway with her hands. “My neighbor has a narrow door. Could we find her one she can carry close to her side?”' ];
    if (item === 'bambooWare') return [ '还没看清来人，你先认出了篓扣上那截红线。大娘敲敲篓盖：「你摊上买的。船来来回回这么多趟，我那把剪子一次也没掉过。」', 'You recognize the red thread first. She taps the lid. “Bought this at your stall. All those ferry crossings, and I’ve never lost my scissors.”' ];
    return item === 'driedHerb'
      ? ['大娘把自己的旧篓搁上柜台。「上回在你摊上买的药包，一路干干爽爽。你瞧，我那把剪子也还在。」', 'She sets her own hamper on the counter. “The herbs I bought from you stayed dry all the way home. Look, my scissors are still here too.”']
      : ['大娘抬抬臂弯里的旧篓。「上回买的贝饰，孙女早系在衣襟上了。你教我把剪子也收好，她正好拿来剪线头。」', 'She lifts her old hamper. “My granddaughter wears the shell piece I bought from you. Good thing we packed the scissors too. She needed them to trim the thread.”'];
  }
  function show() {
    const s = state(), item = s.featured, price = N.prices[item];
    const sellingBasket = item === 'bambooWare';
    activity(L('镇集 · 渡口来的大娘', 'At the Stall · A Woman from the Ferry'), '', 'market-work-ferry');
    $('dialogPortraits').hidden = true;
    $('dialogKicker').textContent = L('镇集 · 第一张摊布', 'Market · Your First Stall');
    const layout = document.createElement('section');
    layout.className = 'ferry-counter';
    const picture = document.createElement('div');
    picture.className = 'ferry-picture';
    const side = document.createElement('div');
    side.className = 'ferry-side';
    const line = document.createElement('p');
    line.className = 'ferry-voice';
    line.setAttribute('role', 'status');
    const actions = document.createElement('div');
    actions.className = 'ferry-actions';
    side.append(line, actions);
    layout.append(picture, side);
    $('panelExtra').append(layout);
    let busy = false;
    function add(id, label, fn) {
      const b = document.createElement('button');
      b.type = 'button';
      b.dataset.ferry = id;
      b.textContent = label;
      b.onclick = async () => {
        if (busy) return;
        busy = true;
        try { await fn(); } finally { busy = false; }
      };
      actions.append(b);
      return b;
    }
    function draw(stage, moveFocus) {
      const art = stage === 'sold' ? 'lidded' : stage;
      picture.replaceChildren(illustration(art));
      picture.dataset.scene = stage;
      actions.replaceChildren();
      if (stage === 'sold') {
        line.textContent = L('她把红线绕回篓扣，数了' + price + '文放在布上。「船家催了！下回进城，还找你。」', 'She winds the thread back around the clasp and counts out ' + price + ' coins. “There’s my boat! I’ll look for you when I come to town.”');
        add('done', L('收好凭单，照看摊子', 'Put away the receipt'), () => NanlanHands.market()).focus({preventScroll:true});
        return;
      }
      if (stage === 'arrive') {
        line.textContent = L('「昨儿船一晃，剪子差点滑进河里。」大娘拢住针线包。' + (sellingBasket ? '她看看借来比样的浅篮，又看看你编的带盖小篓。「容我拿这包试试？」' : '她来买' + goodsName(item) + '，把自己的浅篮和小篓搁在摊边。「劳你搭把手，这些东西搁哪只好？」'), '“The boat lurched yesterday. Nearly lost my scissors in the river.” She gathers her sewing bundle. ' + (sellingBasket ? 'She eyes the borrowed sample tray and the lidded hamper you wove. “Mind if I try them?”' : 'She has come for your ' + goodsName(item) + ' and brought two baskets. “Help me see how everything will travel?”'));
      } else if (stage === 'shallow') {
        line.textContent = L('她把布包往篮里一搁，手腕刚一斜，剪柄便蹭过竹沿。她伸指勾住：「哎，又是这么溜出去的。」', 'She sets down the bundle. A slight tilt sends the scissors scraping over the rim. She catches them with a finger. “There they go again.”');
      } else {
        line.textContent = L('她扣好盖，提起来轻轻晃了两下。里头笃、笃两声。她掀盖摸了摸，剪子还压在布包底下。「就这么带。」', 'She closes the lid and gives the hamper two shakes. Tap, tap. She lifts the lid and feels under the bundle. “There they are. This will do.”');
      }
      async function tryBasket(basket) {
        const result = await perform('tryFerryBasket', {basket}, () => {});
        if (result.ok) draw(basket, true);
        else line.textContent = result.message;
      }
      const shallow = add('shallow', L('递浅竹篮', 'Offer the shallow tray'), () => tryBasket('shallow'));
      const lidded = add('lidded', L('递带盖小篓', 'Offer the lidded hamper'), () => tryBasket('lidded'));
      if (stage === 'lidded') add('sell',
        L('递过' + goodsName(item) + ' · 收' + price + '文', 'Hand over the ' + goodsName(item) + ' · ' + price + ' coins'),
        async () => {
          const result = await perform('sell', {sequence:saleSequence, ferryHandover:true}, () => {});
          if (result.ok) draw('sold', true);
          else line.textContent = result.message;
        });
      if (moveFocus) (stage === 'lidded' ? lidded : shallow).focus({preventScroll:true});
    }
    const saleSequence = s.transactions.length;
    const trial = s.choices.ferryBasketTrial;
    draw(['shallow','lidded'].includes(trial) ? trial : 'arrive', true);
    navButton(L('先照看摊上的其他货', 'Tend to the other goods'), () => NanlanHands.market('stock'), 'ferry-stock');
  }
  window.NanlanFerry = {show, reunion};
})();
