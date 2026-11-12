(() => {
  'use strict';
  const model=window.NanlanNeighbors;
  const word=pair=>deskText(...pair);
  const coin=n=>n+deskText(' 文',' coins');
  const ids=Object.keys(model.goods);
  function goodsStyle(id){
    const index=ids.indexOf(id);
    return 'background-position:'+(index%3)*50+'% '+Math.floor(index/3)*100+'%';
  }
  function basket(o,id){
    const s=state(),g=model.goods[id];
    activity(deskText('周六顺 · 货郎担','Zhou Liushun · The peddler’s baskets'),g?word(g.detail):deskText('周六顺把筐盖斜靠在担边。「慢慢挑。中意哪件，先拿近了看看。」','Zhou props the lid against the yoke. “Take your time. Pick one up for a closer look.”'),'dialogue-scene');
    dialogObject=o;
    if(g){
      const closeup=document.createElement('div');
      closeup.className='ware-closeup';closeup.style.cssText=goodsStyle(id);closeup.setAttribute('role','img');closeup.setAttribute('aria-label',word(g.name));$('panelExtra').append(closeup);
      const status=document.createElement('p');status.textContent=word(g.name)+' · '+coin(g.price)+deskText('　钱囊 ','　Purse ')+coin(s.coins)+deskText('　已有 ','　Owned ')+N.quantity(s,id);$('panelExtra').append(status);
      const b=button(deskText('付 ','Pay ')+coin(g.price)+deskText('，买下这件',' for this item'),()=>{
        const r=engine.act('peddlerBuy',{item:id,quote:g.price,sequence:s.revision});
        if(!r.ok){$('dialogNotice').hidden=false;$('dialogNotice').textContent=r.message;return;}
        activity(deskText('周六顺 · 收好货品','Zhou Liushun · Wrapped and ready'),word(g.name)+deskText('已收进行囊。付了 ',' is in your satchel. Paid ')+coin(g.price)+deskText('，还余 ','; remaining ')+coin(state().coins)+deskText('。','.'),'dialogue-scene');
        dialogObject=o;navButton(deskText('再看看货担','Browse the baskets'),()=>basket(o),'wares-again');navButton(deskText('收好，回镇集','Return to market'),closeDialog,'wares-close');
      },'wares-buy',false,false);
      b.disabled=s.coins<g.price;
      if(b.disabled)status.textContent+=deskText('　还差 ','　Short by ')+coin(g.price-s.coins);
      navButton(deskText('放回筐里，再看看','Put it back and browse'),()=>basket(o),'wares-back');
    }else{
      addTray(o);
      navButton(deskText('再与货郎说说话','Talk with Zhou'),()=>open(o),'wares-talk');
    }
    navButton(deskText('回到镇集','Return to market'),closeDialog,'wares-leave');
  }
  function addTray(o){
    const tray=document.createElement('div');tray.className='peddler-tray';
    for(const id of ids){
      const g=model.goods[id],b=document.createElement('button');b.type='button';b.dataset.ware=id;
      const label=document.createElement('span');label.textContent=word(g.name)+' · '+coin(g.price);b.append(label);
      b.onclick=()=>basket(o,id);tray.append(b);
    }
    $('panelExtra').append(tray);
  }
  function open(o){
    const person=model.residents[o.id],s=state(),minute=s.worldTick%1440;
    const light=minute<660?0:minute<1050?1:2;
    const last=person.topics[s.choices['chatStreetLast:'+o.id]];
    function page(text){
      activity(word(person.name),text,'dialogue-scene');
      dialogObject=o;
      $('dialogKicker').textContent=word(person.trade);
    }
    function respond(topic,text){
      if(!nearObject(o))return;
      const replay=topic==='drum'?state().choices['chatStreetDrum:'+o.id]:
        Number.isInteger(topic)&&Boolean(model.heard(state(),o.id)&(1<<topic));
      if(!replay){
        const result=engine.act('streetTalk',{object:o.id,topic});
        if(!result.ok){$('dialogNotice').hidden=false;$('dialogNotice').textContent=result.message;return;}
      }
      page(word(text));
      navButton(deskText('再聊两句','Keep talking'),()=>open(o),'street-back');
      navButton(deskText('改日再聊','Say goodbye'),closeDialog,'street-leave');
    }
    page(word(person.hours[light])+'\n\n'+word(last?.remember||person.hello));
    if(o.id==='peddler')addTray(o);
    if(person.child&&N.quantity(s,'handDrum')>0){
      button(deskText('把拨浪鼓摇给孩子听','Play the rattle drum'),()=>respond('drum',person.toy),'street-drum',false,false);
    }
    if(model.canRelay(s,o.id)){
      button(word(person.pass),()=>respond('relay',person.received),'street-relay',false,false);
    }
    person.topics.forEach((t,i)=>{
      button(word(t.ask),()=>respond(i,t.reply),'street-topic-'+i,false,false);
    });
    navButton(deskText('改日再聊','Say goodbye'),closeDialog,'street-leave');
  }
  window.NanlanStreetTalk={open,goodsStyle};
})();
