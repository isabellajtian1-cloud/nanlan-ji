/* Activities draft their work locally. The existing story or inventory action
   alone spends materials, signs a shift, or sails. */
window.NanlanWorktable = (() => {
  'use strict';
  const L = (zh, en) => window.NanlanI18n?.language === 'en' ? en : zh;
  function element(tag, cls, words) {
    const node = document.createElement(tag);
    node.className = cls;
    if (words) node.textContent = words;
    return node;
  }
  function control(parent, words, run, cls = '') {
    const b = element('button', cls, words);
    b.type = 'button';
    b.onclick = run;
    parent.append(b);
    return b;
  }
  function bench(kind, title, instructions, finishLabel, commit, back) {
    const scene = state().scene, revision = state().revision;
    const object = dialogObject;
    activity(title, instructions, 'v3-worktable');
    dialogObject = object;
    $('dialogPortraits').hidden = true;
    const board = element('div', 'worktable wt-' + kind);
    board.dataset.work = kind;
    const live = element('p', 'wt-status');
    live.setAttribute('role', 'status');
    $('panelExtra').append(board, live);
    let busy = false;
    const finish = button(finishLabel, async () => {
      if (busy || !board.isConnected || $('dialog').hidden) return;
      if (state().scene !== scene || state().revision !== revision) {
        live.textContent = L('手边的记录已变，请返回再核对。','The record changed. Go back and check it again.');
        finish.disabled = true;
        return;
      }
      busy = true;
      finish.disabled = true;
      try {
        const result = await commit();
        if (result?.ok === false && board.isConnected) live.textContent = result.message || L('请返回核对。','Go back and check the record.');
      } finally {
        busy = false;
        if (board.isConnected) finish.disabled = false;
      }
    }, 'wt-finish', false, false);
    finish.disabled = true;
    button(L('放下手里的东西，返回','Set this down and go back'), back, 'wt-back', true, false);
    return {board, live, finish};
  }
  function weave(label, commit, back) {
    const w = bench('weave', L('仓房 · 案上编竹','At the weaving bench'), L('抬起相间的经篾，让横篾从空隙穿过。下一道从另一头回来。','Lift alternating uprights and pass the strip through. Weave back from the other side.'), label, commit, back);
    const loom = element('div','wt-loom');
    const warp = element('div','wt-warp');
    const bed = element('div','wt-weft');
    loom.append(bed,warp);
    w.board.append(loom);
    const edges = element('div','wt-edges');
    w.board.append(edges);
    const lifted = new Set(), reeds = [];
    let row = 0, origin = null;
    const hint = () => row === 0 ? L('先抬第一、三根，再把横篾从左穿到右。','Lift reeds 1 and 3, then pass the strip from left to right.') : L('换向。抬第二、四根，把横篾从右穿回左。','Reverse. Lift reeds 2 and 4, then pass the strip from right to left.');
    for (let i = 0; i < 4; i++) {
      const b = control(warp, String(i + 1), () => {
        if (lifted.has(i)) lifted.delete(i); else lifted.add(i);
        b.setAttribute('aria-pressed', String(lifted.has(i)));
      }, 'wt-reed');
      b.setAttribute('aria-label', L('抬起经篾 ','Lift reed ') + (i + 1));
      b.setAttribute('aria-pressed','false');
      reeds.push(b);
    }
    const pass = control(edges,'',() => {
      if (row >= 2) return;
      if (lifted.size !== 2 || !lifted.has(row) || !lifted.has(row + 2)) {
        w.live.textContent = L('横篾抵住了。','The weft catches. ') + hint();
        return;
      }
      const strip = element('span','wt-strip row-' + row);
      bed.append(strip);
      loom.classList.add('woven-' + row);
      row++;
      lifted.clear();
      reeds.forEach(b => { b.setAttribute('aria-pressed','false'); b.disabled = row === 2; });
      pass.textContent = L('← 从右穿回','← Weave back');
      pass.disabled = row === 2;
      edges.hidden = row === 2;
      w.live.textContent = row === 2 ? L('两道篾纹已经咬合，可以收边了。','The two rows hold each other. Finish the rim.') : hint();
      w.finish.disabled = row !== 2;
    }, 'wt-pass');
    pass.textContent = L('从左穿入 →','Weave across →');
    w.live.textContent = hint();
    // Resolve a tap or a sweep once, including on touch browsers which dispatch
    // a delayed compatibility click to a different reed after the finger moves.
    loom.addEventListener('pointerdown', e => {
      if (!e.isPrimary || e.button !== 0 || row >= 2) return;
      origin = {id:e.pointerId,x:e.clientX,y:e.clientY,reed:e.target.closest('.wt-reed')};
      loom.setPointerCapture(e.pointerId);
    });
    loom.addEventListener('pointercancel', () => { origin = null; });
    loom.addEventListener('pointerup', e => {
      if (!origin || e.pointerId !== origin.id) return;
      const dx=e.clientX-origin.x, dy=e.clientY-origin.y, reed=origin.reed;
      origin=null;
      if (Math.abs(dx)<12 && Math.abs(dy)<12) {
        if (reed && !reed.disabled) { reed.click(); reed.focus({preventScroll:true}); }
        return;
      }
      if (Math.abs(dx)<34 || Math.abs(dx)<Math.abs(dy)*1.5) return;
      if ((row===0 && dx>0) || (row===1 && dx<0)) pass.click();
    });
    loom.addEventListener('click', e => {
      if(e.detail>0) { e.preventDefault(); e.stopPropagation(); }
    },true);
    reeds[0].focus({preventScroll:true});
  }
  function inspect(area, label, commit, back) {
    const rim = area === 'rim';
    const w = bench('inspect', L('验货案 · 试一试这只篓','Inspection bench · Examine the basket'), rim ? L('套叠时篓口有些发涩。摸过各处，把待验签系在松动的地方。','The rim catches when nested. Feel the basket and tie a tag where it is loose.') : L('轻提时一侧微微下沉。摸过各处，把待验签系在松动的地方。','One side dips when lifted. Feel each part and tie a tag where it gives.'), label, commit, back);
    const specimen = element('div','wt-specimen');
    specimen.innerHTML = inventoryArt('narrowBasket');
    w.board.append(specimen);
    const spots = [[L('篓耳根','Handle joint'),L('一提，短篾尾便从耳根滑出来。','A short end slips out as the handle lifts.')],[L('篓口','Rim'),L('套上样篓时，突起的篾尾勾住了边缘。','A raised strip snags the rim of the sample.')],[L('篓底','Base'),'']];
    const correct = rim ? 1 : 0;
    let selected = -1;
    const tag = control(w.board,L('在刚摸过的位置系待验签','Tie the tag at the spot just checked'),() => {
      if (selected !== correct) { w.live.textContent = L('这处受力很稳。再试试别处。','This part holds. Try another spot.'); return; }
      w.live.textContent = L('待验签已系稳。这一件可以单独记下。','The tag is tied. This piece can be recorded separately.');
      specimen.classList.add('wt-tagged');
      probes.forEach(b => b.disabled = true); tag.disabled = true; w.finish.disabled = false;
    });
    tag.disabled = true;
    const probes = spots.map(([name, clue], i) => {
      const b = control(specimen,name,() => {
        selected = i; tag.disabled = false;
        probes.forEach((n,j) => n.setAttribute('aria-pressed',String(i === j)));
        w.live.textContent = i === correct ? clue : i === 2 ? L('压过篓底，交错的篾片没有松。','The base stays firm under your hand.') : L('摸过去很平整，这处没有松动。','The weave feels even and firm here.');
      },'wt-probe spot-' + i);
      b.setAttribute('aria-pressed','false'); return b;
    });
    probes[0].focus({preventScroll:true});
  }
  function shift(full, label, commit, back) {
    const s = state(), who = full ? L('小满','Xiaoman') : s.story3.choices.family === 0 ? L('母亲','Mother') : L('父亲','Father');
    const w = bench('shift', who + L('的柜台交接',' · Counter handover'), L('翻看手边三张单，把可以当班办的和要等掌柜的分开放。','File the three slips under what the attendant may do or what must wait for you.'), label, commit, back);
    const items = Object.keys(s.shop.stock), stock = items.find(id => N.story2.stockAvailable(s,id) > (full && id === 'bambooWare' && s.story3.choices.regular === 0 ? 1 : 0));
    const goods = stock ? window.NanlanI18n.t(N.itemNames[stock]) : '';
    const slips = [L('老客要求动用预留货','A customer asks for reserved stock'), stock ? L('照价零售 · ','Sell at the posted price · ') + goods + ' · ' + N.shopPrice(s,stock) + L(' 文',' coins') : L('架上没有可卖的货，登记来客问询','Shelves empty · record a customer enquiry'), L('临时加单，还要柜上垫钱','A new order asking for a cash advance')];
    const card = element('div','wt-slip'); w.board.append(card);
    const trays = element('div','wt-trays'); w.board.append(trays);
    let index = 0;
    const bins = [L('当班可办','On this shift'), L('留给掌柜','For the proprietor')].map((title,j) => control(trays,title,() => {
      if (j !== (index === 1 ? 0 : 1)) {
        w.live.textContent = index === 1 ? L('这件已在交代的范围内。','This is within the attendant’s remit.') : L('预留货与垫款都要掌柜过目。','Reserved goods and advances must wait for the proprietor.'); return;
      }
      bins[j].append(element('small','wt-filed',slips[index]));
      index++; card.textContent = slips[index] || L('三单已归位','All slips filed');
      if (index === slips.length) { bins.forEach(b => b.disabled = true); w.finish.disabled = false; w.live.textContent = who + L('收好交班笺，等你签定。',' has the slips ready for your signature.'); }
    }));
    card.textContent = slips[0]; bins[0].focus({preventScroll:true});
  }
  function sail(label,commit,back) {
    const w = bench('sail',L('泊岸 · 分好往返船脚','At the berth · Set aside the fares'),L('往返共六文。将钱分进两个钱袋，归程的钱随身封好。','There are six coins for the voyage. Divide them between the outward fare and the return purse.'),label,commit,back);
    const pile = element('div','wt-coins'), trays = element('div','wt-trays');
    w.board.append(pile,trays);
    const counts = [0,0], titles = [L('去程船脚','Outward fare'),L('封存归程','Return purse')];
    function paint() {
      const left = 6-counts[0]-counts[1];
      pile.replaceChildren();
      for(let i=0;i<left;i++) pile.append(element('i','wt-coin'));
      pile.setAttribute('aria-label',L('剩余铜钱 ','Unallocated coins: ')+left);
      bags.forEach((b,i)=>{b.textContent=titles[i]+' · '+counts[i];b.disabled=left===0;});
      const balanced=counts[0]===3&&counts[1]===3;
      w.finish.disabled=!balanced;
      undo.disabled=left===6;
      w.live.textContent=left?L('点钱袋，每次放入一文。余 ','Select a purse to place one coin. Remaining: ')+left:balanced?L('去程三文，归程三文。可向船家交付，按所选航路出发。','Three coins each way. Confirm with the skipper to depart on the selected route.'):L('船牌上写着单程三文。把钱倒回案上，再给归程留足。','The fare is three each way. Empty the purses and leave enough for the return.');
    }
    const bags=titles.map((title,i)=>control(trays,title,()=>{if(counts[0]+counts[1]<6)counts[i]++;paint();},'wt-purse'));
    const undo=control(w.board,L('把两袋钱倒回案上','Empty both purses onto the table'),()=>{counts.fill(0);paint();});
    paint(); bags[0].focus({preventScroll:true});
  }
  function pack(sample, label, commit, back) {
    const hot = N.available(state(),'hotMeal') > 0;
    const food = hot ? L('行囊里的热饭','A packed hot meal') : L('干粮一份 · 三文','Travel rations · three coins');
    const pieces = [{label:food, item:hot?'hotMeal':'rice', slots:2}];
    if(sample) pieces.push({label:NanlanI18n.t(N.itemNames[sample]),item:sample,slots:2});
    const w=bench('pack', L('仓房 · 收拾行囊','Storehouse · Pack for the crossing'),L('点案上的物件装进行囊。点已装入的物件可取出，留空的格子给归程用。','Select an item to pack it. Select it again to take it out. Keep the unused space for the return.'),label,commit,back);
    const tray=element('div','wt-pack-tray'),bag=element('div','wt-pack-bag'),slots=element('div','wt-slots');
    w.board.append(tray,bag,slots);
    const packed=new Set();
    const buttons=pieces.map((piece,i)=>{
      const b=control(tray,'',()=>{
        if(packed.has(i)){packed.delete(i);tray.append(b);}else{packed.add(i);bag.append(b);}
        paint();b.focus({preventScroll:true});
      });
      b.innerHTML=inventoryArt(piece.item);b.append(element('span','',piece.label));return b;
    });
    function paint(){
      const used=Array.from(packed).reduce((n,i)=>n+pieces[i].slots,0);
      slots.replaceChildren();
      for(let i=0;i<6;i++)slots.append(element('i',i<used?'filled':''));
      buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(packed.has(i))));
      w.finish.disabled=packed.size!==pieces.length;
      w.live.textContent=L('已占 ','Packed ')+used+L(' / 6 格。余下 ',' / 6 spaces. ')+(6-used)+L(' 格留空。',' spaces remain.');
    }
    paint();buttons[0].focus({preventScroll:true});
  }
  return {weave,inspect,shift,pack,sail};
})();
