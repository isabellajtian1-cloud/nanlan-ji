/* A separate market ledger lets visitors try the stall without moving the family save. */
(() => {
  'use strict';
  const sheet = document.getElementById('demoSheet');
  const art = document.getElementById('demoArt');
  const heading = document.getElementById('demoHeading');
  const passage = document.getElementById('demoPassage');
  const note = document.getElementById('demoNote');
  const actions = document.getElementById('demoActions');
  const L = (zh, en) => window.NanlanI18n.language === 'en' ? en : zh;
  let scene = '', market = null, fromSupper = false;

  function page(id, chapter, title, picture, alt, copy, foot) {
    scene = id;
    sheet.dataset.scene = id;
    document.getElementById('demoChapter').textContent = chapter;
    heading.textContent = title;
    art.src = picture;
    art.alt = alt;
    passage.textContent = copy;
    note.textContent = foot || '';
    note.hidden = !foot;
    actions.replaceChildren();
    if (!sheet.open) sheet.showModal();
    sheet.scrollTop = 0;
    heading.focus({preventScroll:true});
  }
  function choice(id, name, act, secondary = false) {
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.demo = id;
    b.textContent = name;
    if (secondary) b.className = 'quiet';
    b.onclick = act;
    actions.append(b);
  }
  function title() {
    if (started) { location.reload(); return; }
    scene = '';
    market = null;
    sheet.close();
    window.NanlanAudio?.setEnvironment('title', false, false);
    document.getElementById('demoMarket').focus({preventScroll:true});
  }
  function leaveStall() { if (fromSupper) supper(); else title(); }

  function supper() {
    const s = state();
    active = false;
    document.getElementById('hud').hidden = true;
    window.NanlanAudio?.setEnvironment('hall', true, false);
    const gesture = s.choices.firstSupperGesture;
    const repair = s.choices.repair === 'window'
      ? L('修好的窗扇终于不响了。','The shutter you mended has finally fallen quiet.')
      : L('屋檐还在滴水，铺盖却是干的。','Water still drips from the eaves. The bedding under your patch stays dry.');
    const bowl = s.choices.firstMeal === 'chen'
      ? L('母亲用碟子扣住留给陈伯的那一碗。','Mother covers the bowl you set aside for Uncle Chen with a saucer.')
      : L('祖父捧着你盛的饭，等大家都坐好才动筷。','Grandfather cups the bowl you filled for him and waits until everyone is seated.');
    const after = gesture === 'crust'
      ? L('母亲掰下半块锅巴，又递回你手里。「你也尝尝。」','Mother breaks the rice crust in two and puts half back in your hand. “You have some too.”')
      : gesture === 'sit' ? L('你陪母亲坐到灯芯结花。院外的水，一滴，一滴。','You sit with Mother until the wick flowers. Outside, water drips from the eaves.') : '';
    page('supper', L('抵达南澜 · 试玩终章','Arrival in Nanlan · End of the story demo'),
      L('灯下的第一顿饭','Our First Supper'),
      DATA.assets[s.gender === 'male' ? 'familyMealMale' : 'familyMealFemale'],
      L('一家人围坐在旧宅的饭桌旁','The family gathered around the table in their old home'),
      [repair, bowl, after].filter(Boolean).join('\n\n'),
      L('第一日手记 · 家用 ' + s.coins + ' 文','First day’s journal · Household purse: ' + s.coins + ' coins'));
    if (!gesture) {
      const remember = value => {
        const result = engine.act('homewardSupper', {choice:value});
        if (result.ok) { window.NanlanAudio?.play('bowlTouch'); supper(); }
        else { note.hidden = false; note.textContent = window.NanlanI18n.t(result.message); }
      };
      choice('crust', L('给母亲盛锅巴','Share the rice crust'), () => remember('crust'));
      choice('sit', L('陪她坐一会儿','Sit with Mother'), () => remember('sit'), true);
    }
    choice('market', L('去赶集 · 试玩第一笔生意','Visit the market · Your first sale'), () => startMarket(true));
    choice('title', L('合上手记，回到标题','Close the journal'), title, true);
  }
  function startMarket(afterMeal) {
    fromSupper = afterMeal;
    market = new N.Engine({}, world);
    market.memoryOnly = true;
    market.demoStall = true;
    market.state = JSON.parse(document.getElementById('demoMarketState').textContent);
    window.NanlanAudio?.setEnvironment('market', false, false);
    stall();
  }
  function stall() {
    const s = market.state;
    const sold = s.flags.firstSale;
    const stage = sold ? 'sold' : s.choices.ferryBasketTrial || 'arrive';
    const price = N.prices[s.featured];
    const copy = {
      arrive: L('渡口大娘把针线包搁在摊布上。「昨儿船一晃，剪子差点掉进河里。你这两样竹器，哪件能带上船？」',
        'A woman sets a sewing bundle on your stall. “The ferry rocked yesterday and I nearly lost my scissors. Which of these baskets would you take aboard?”'),
      shallow: L('大娘把浅筐一斜，剪子便滑到了筐沿。她用手指一勾，笑道：「好险，又来一次。」',
        'She tilts the tray. The scissors slide to the rim. She catches them with one finger. “There they go again.”'),
      lidded: L('她扣上红线缠口的篓盖，轻轻晃了两下。再掀开，剪子还压在布包底下。「这个成。多少钱？」',
        'She fastens the red-thread lid and shakes the hamper twice. The scissors stay tucked beneath the cloth. “That’ll do. How much?”'),
      sold: L('她把铜钱数在你手心，挎起竹篓向渡口跑去。「船来啦！下趟赶集，还来寻你。」',
        'She counts the coins into your palm, slips the hamper over her arm and hurries to the landing. “There’s my ferry! I’ll look for you next market day.”')
    };
    page('stall-' + stage, L('镇集 · 经营短篇','Market day · A trading vignette'),
      sold ? L('第一张收据','Your First Receipt') : L('渡口来了一位客人','A Customer from the Ferry'),
      'ferry-' + (sold ? 'lidded' : stage) + '-6122.webp',
      L('渡口大娘在竹器摊前试装她的针线包','A ferry passenger testing a basket for her sewing bundle'),
      copy[stage], sold ? L('售出带盖竹篓一只 · 实收 ' + price + ' 文','Sold one lidded hamper · Received ' + price + ' coins') : '');
    function transact(action, params) {
      const result = market.act(action, params);
      if (result.ok) { window.NanlanAudio?.play(action === 'sell' ? 'success' : 'click'); stall(); }
      else { note.hidden = false; note.textContent = window.NanlanI18n.t(result.message); }
    }
    if (!sold) {
      if (stage !== 'shallow') choice('shallow', L('递上浅筐','Offer the shallow tray'), () => transact('tryFerryBasket', {basket:'shallow'}), stage === 'lidded');
      if (stage !== 'lidded') choice('lidded', L('递上带盖竹篓','Offer the lidded hamper'), () => transact('tryFerryBasket', {basket:'lidded'}));
      if (stage === 'lidded') choice('sell', L('交货，收 ' + price + ' 文','Hand it over for ' + price + ' coins'), () => transact('sell', {ferryHandover:true, sequence:s.transactions.length}));
    }
    choice('leave', fromSupper ? L('回到家人的饭桌','Return to the family table') : L('回到标题','Return to title'), leaveStall, true);
  }
  function labels() {
    document.title = L('南澜记 · 第一顿热饭 | 试玩版 2.0','Nanlan Chronicles · Our First Supper | Demo 2.0');
    document.querySelector('.version-note').textContent = L('试玩版 2.0 · 基于 V6.10.30','Demo 2.0 · Based on V6.10.30');
    document.getElementById('demoMarket').textContent = L('镇集短篇 · 第一笔生意','Market vignette · Your first sale');
    const begin = document.getElementById('begin');
    begin.dataset.noLocalize = '';
    begin.textContent = storedRaw ? L('重新开始故事','Start a new story') : L('开始故事 · 第一顿热饭','Play the story · Our First Supper');
    const premise = [...document.querySelectorAll('#start .premise')].at(-1);
    if (premise) {
      premise.dataset.noLocalize = '';
      premise.textContent = L('替家人找一处干铺盖，给旧宅生起第一炉火。','Find a dry place for your family to sleep, then light the first cooking fire in your new home.');
    }
    if (scene === 'supper') supper();
    else if (scene.startsWith('stall-')) stall();
  }
  sheet.addEventListener('cancel', event => {
    event.preventDefault();
    if (scene.startsWith('stall-')) leaveStall();
  });
  // Keep game hotkeys behind the native modal. Browser Tab, Enter and Space still work.
  window.addEventListener('keydown', event => { if (sheet.open) event.stopImmediatePropagation(); }, true);
  document.getElementById('demoMarket').onclick = () => startMarket(false);
  document.addEventListener('nanlanlanguagechange', labels);
  window.NanlanDemo = {supper, labels};
  labels();
})();
