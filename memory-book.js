/* The book reads durable milestones from the current journey. */
(() => {
  'use strict';

  const english = () => window.NanlanI18n?.language === 'en';
  const local = (zh, en) => english() ? en : zh;
  const chapters = ['一', '二', '三', '四', '五', '六'];
  const milestones = [
    [1, 'firstRepair', ['旧屋的第一处修补', 'The First Repair'], [
      '在东厢检查过窗格和漏点，亲手修好最急的一处。',
      'You inspected the east room and repaired the most urgent damage.'
    ]],
    [1, 'firstShared', ['一家人的第一顿热饭', 'The First Hot Meal Together'], [
      '灶火重新升起来，第一锅热饭端进了正厅。',
      'The hearth was lit again, and the first hot meal reached the family table.'
    ]],
    [1, 'firstSale', ['第一张摊布有了买卖', 'The First Sale at the Market'], [
      '在镇集摆出实物，完成了第一笔买卖。',
      'You laid out your goods at the market and made your first sale.'
    ]],
    [1, 'bookReturned', ['旧簿归还原主', 'The Ledger Goes Home'], [
      '把代为保管的原簿亲手交还程婉。',
      'You returned the original ledger to Cheng Wan for safekeeping.'
    ]],
    [1, 'feastShared', ['岁末满庭', 'A Year-End Table'], [
      '备好饭菜、安排座次，和家人在旧宅吃了一顿岁末家宴。',
      'With food ready and seats set, your family shared a year-end meal in the old house.'
    ]],
    [2, 'v2FirstSale', ['南街的第一笔成交', 'The First South Street Sale'], [
      '从摊布走到柜台，南街铺子有了第一笔实货交付。',
      'From a market cloth to a shop counter, your goods found their first buyer on South Street.'
    ]],
    [2, 'v2ShopLamp', ['南街亮起一盏灯', 'A Light on South Street'], [
      '核过首日收支和余货，在铺门前点亮灯笼。',
      'You checked the first day’s takings and stock and lit the lantern at the door.'
    ]],
    [2, 'v2RegularFulfilled', ['熟客取到了预留的货', 'A Promise to a Regular Kept'], [
      '为熟客留下一件实货，并在约好的时候交到对方手中。',
      'You set aside an item for a regular and handed it over as agreed.'
    ]],
    [3, 'v3_batch', ['作坊的第一批委托', 'The Workshop’s First Batch'], [
      '第一批委托做完并验过，作坊有了可以回看的交接记录。',
      'The first commissioned batch was made and checked, with a record of the handover.'
    ]],
    [3, 'v3_audit', ['离店一日之后', 'A Day Away from the Shop'], [
      '小满按约当班。归来时，你核清了余货、工钱和她留下的事项。',
      'Xiaoman covered the shop. On returning, you reviewed the stock, wages and matters she left for you.'
    ]],
    [4, 'v4_pay', ['几家的账分清了', 'Each Household’s Share'], [
      '联合货物完成签收，公所按各家的工料和约定分账。',
      'The joint shipment was signed for, and the guild settled each household’s share as agreed.'
    ]],
    [4, 'volume4Complete', ['后堂留着灯', 'A Light in the Back Hall'], [
      '家书寄出，公所账已结清，一家人回到后堂点灯。',
      'With the letter sent and the guild’s accounts settled, your family lit the back hall.'
    ]],
    [5, 'season5_claim', ['师徒的第一件留样', 'The First Teaching Sample'], [
      '一起选料、示范和复验，给下一次练习留了一件可比较的样品。',
      'Together you selected material, demonstrated the work and inspected a sample to learn from.'
    ]],
    [5, 'season5Complete', ['来年的一页', 'A Page for the Coming Year'], [
      '核过这一季的约定，给生意、手艺与家人的日子留出时间。',
      'You reviewed the season’s commitments and made room for work, craft and family.'
    ]],
    [6, 'voyageComplete', ['春潮有信', 'Letters on the Spring Tide'], [
      '从青屿归来，把旅途见闻带回南澜。往后的日子仍可自己安排。',
      'You returned from Qingyu with memories of the journey and the freedom to choose what comes next.'
    ]]
  ];

  function entries(save) {
    return milestones.filter(([, flag]) => save.flags[flag] === true);
  }

  function show() {
    const records = entries(state());
    const title = local('南澜旧事簿', 'Nanlan Book of Memories');
    const intro = records.length
      ? local('已写下 ' + records.length + ' 件旧事。', records.length + (records.length === 1 ? ' memory recorded.' : ' memories recorded.'))
      : local('书页还是空的。做成的事，会慢慢写在这里。', 'The pages are still blank. Things you do will find their way here.');
    activity(title, intro, 'memory-book');
    dialogObject = null;
    $('dialogKicker').textContent = local('亲手做过的事', 'Things you made happen');

    if (records.length) {
      const list = document.createElement('div');
      list.className = 'chapter-leaves';
      list.dataset.noLocalize = '';
      for (const [chapter, flag, name, description] of records) {
        const row = document.createElement('article');
        const heading = document.createElement('h3');
        const volume = document.createElement('small');
        const body = document.createElement('p');
        row.dataset.memory = flag;
        heading.textContent = local(...name);
        volume.textContent = local('第' + chapters[chapter - 1] + '卷', 'Volume ' + chapter);
        body.textContent = local(...description);
        row.append(heading, volume, body);
        list.append(row);
      }
      $('panelExtra').append(list);
    }

    navButton(local('合上旧事簿', 'Close the Book'), () => closeDialog(true), 'memory-book-close');
  }

  function link() {
    const label = local('翻开南澜旧事簿', 'Open the Nanlan Book of Memories');
    const button = navButton(label, show, 'memory-book');
    button.dataset.noLocalize = '';
  }

  document.addEventListener('nanlanlanguagechange', () => {
    if (!$('dialog').hidden && dialogKind === 'memory-book') show();
  });
  window.NanlanMemoryBook = {link};
})();
