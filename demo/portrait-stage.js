/* Painted dialogue above the paper. Art and speaker placement never change the game state. */
const NanlanPortraitStage = (() => {
  const originals = new Set(['mother','father','grandfather','guard','playerFemale','playerMale']);
  const silkFiles = {
    mother:'family-silk-v399.webp', father:'family-silk-v399.webp', grandfather:'family-silk-v399.webp',
    playerFemale:'player-female-silk-v399.webp', playerMale:'player-male-silk-v399.webp'
  };
  const windows = {
"npc-cen-v30.webp":[
86, 2, 160, 178, 313, 313
], "npc-chen-v30.webp":[
76, 5, 156, 177, 277, 314
], "npc-customer-v30.webp":[
67, 0, 156, 177, 291, 313
], "npc-doctor-v30.webp":[
37, 3, 167, 176, 249, 313
], "npc-father-v30.webp":[
97, 3, 156, 177, 309, 314
], "npc-grandfather-v30.webp":[
84, 2, 195, 178, 310, 314
], "npc-guard-v30.webp":[
81, 0, 156, 177, 312, 313
], "npc-lin-v30.webp":[
92, 0, 159, 180, 313, 314
], "npc-mother-v30.webp":[
68, 6, 155, 176, 307, 314
], "npc-playerFemale-v30.webp":[
63, 0, 178, 172, 313, 313
], "npc-playerMale-v30.webp":[
70, 0, 186, 177, 314, 313
], "npc-qiu-v30.webp":[
77, 0, 159, 180, 281, 314
], "npc-tea-v30.webp":[
78, 1, 158, 179, 314, 314
], "npc-vendor-v30.webp":[
97, 1, 192, 179, 299, 314
], "npc-wan-v30.webp":[
30, 2, 161, 177, 260, 313
], "npc-yu-v30.webp":[
63, 3, 156, 176, 311, 313
], "v3-xiaoman.webp":[
38, 5, 342, 383, 420, 680
], "v3-fang.webp":[
39, 5, 342, 384, 420, 680
], "v3-zhou.webp":[
39, 5, 342, 383, 420, 680
], "v3-boatman.webp":[
40, 4, 342, 384, 420, 680
], "npc-v4-merchant.webp":[
37, 0, 345, 387, 420, 680
], "npc-v4-visitor.webp":[
38, 4, 342, 383, 420, 680
], "liang-wenchui.webp":[
38, 6, 342, 384, 420, 680
], "resident-blueDyer-v6923.webp":[
-9, 0, 194, 219, 175, 384
], "resident-cakeAunt-v6923.webp":[
1, 0, 254, 219, 255, 384
], "resident-ferryPorter-v6923.webp":[
1, 0, 194, 219, 196, 384
], "resident-kidChun-v6923.webp":[
-3, 0, 194, 219, 189, 384
], "resident-kidDou-v6923.webp":[
-25, 0, 194, 219, 143, 384
], "resident-kidLing-v6923.webp":[
1, 0, 250, 219, 253, 384
], "resident-kidQiao-v6923.webp":[
-23, 0, 194, 219, 150, 384
], "resident-kidRong-v6923.webp":[
-18, 0, 194, 219, 159, 384
], "resident-kidYan-v6923.webp":[
-28, 0, 194, 219, 136, 384
], "resident-letterScribe-v6923.webp":[
-13, 0, 194, 219, 169, 384
], "resident-netMender-v6923.webp":[
-1, 0, 194, 219, 191, 384
], "resident-peddler-v6923.webp":[
2, 0, 314, 257, 317, 452
], "resident-youngWeaver-v6923.webp":[
-19, 0, 194, 219, 165, 384
], "town-bookKeeper-v670.webp":[
39, 14, 194, 219, 280, 410
], "town-clothKeeper-v670.webp":[
49, 11, 198, 224, 280, 410
], "town-innKeeper-v670.webp":[
43, 7, 201, 227, 280, 410
], "grandfatherSilk":[
13, 12, 544, 537, 1536, 1024
], "fatherSilk":[
560, 15, 479, 536, 1536, 1024
], "motherSilk":[
1034, 63, 471, 510, 1536, 1024
], "playerMaleSilk":[
63, 5, 307, 290, 1536, 1024
], "playerFemaleSilk":[
51, 19, 310, 274, 1536, 1024
]
};
  const kinds = new Set(['general','arrival','dialogue-scene','family-letter','bond-visit','bond-memory','bond-talk','bond-reply','v3-voice','v4-voices','v4-arrival','v5-voices','v3-story','v4-story','v5-story']);
  const isPlayer = title => ['你','主角','You','Protagonist'].includes(title);
  const split = title => title.split(/\s*·\s*/);
  function partner(beats, line, names) {
    if (line[0] !== 'player') return '';
    const pos = beats.indexOf(line);
    for (let gap=1; gap<beats.length; gap++) {
      for (const row of [beats[pos-gap],beats[pos+gap]]) {
        if (!row || row[0]==='player') continue;
        const name = names[row[0]], title = Array.isArray(name) ? name[0] : name;
        if (title && dialogueCast(title).length===1) return title;
      }
    }
    return '';
  }
  function art(role) {
    let file = DATA.assets['npc_'+role], crop = windows[file];
    if (state().actorState?.outfit==='nanlanSilk' && silkFiles[role]) {
      file=silkFiles[role]; crop=windows[role+'Silk'];
    } else if (originals.has(role)) {
      file='dialogue-'+role+'-6927.webp'; crop=null;
    }
    if (!file) return null;
    const image = document.createElement('img');
    image.alt=''; image.draggable=false;
    if(crop) {
      const [x,y,w,h,iw,ih]=crop;
      const frame=document.createElement('span'); frame.className='bust-crop';
      frame.style.aspectRatio=w+' / '+h;
      Object.assign(image.style,{width:(100*iw/w)+'%',height:(100*ih/h)+'%',left:(-100*x/w)+'%',top:(-100*y/h)+'%'});
      frame.append(image); image.src=file; return frame;
    }
    image.src=file;
    return image;
  }
  function figure(role, side, speaking) {
    const picture=art(role); if (!picture) return null;
    const el=document.createElement('figure'); el.className='talk-figure '+side+(speaking?' speaking':' listening');
    el.dataset.role=role; el.setAttribute('aria-hidden','true'); el.append(picture); return el;
  }
  function place() {
    const host=$('dialogPortraits'), dialog=$('dialog'), sheet=dialog.querySelector('.sheet');
    if(dialog.classList.contains('talk-scene')) sheet.before(host);
    else $('speaker').before(host);
  }
  function open(title, kind, cast, partnerTitle) {
    const dialog=$('dialog'), host=$('dialogPortraits'), heading=$('speaker');
    const [first,...rest]=split(title), player=isPlayer(first);
    const named=cast.length===1 && (first===cast[0][0] || first===window.NanlanI18n?.english(cast[0][0]) || /^[A-Za-z]/.test(first));
    const on=kinds.has(kind) && (player || named) && !['原信留存','Kept for Reading'].includes(rest.at(-1));
    dialog.classList.toggle('talk-scene',on);
    dialog.classList.toggle('player-speaking',on && player);
    place();
    delete heading.dataset.noLocalize;
    if (!on) return false;
    const who=player?dialogueCast(partnerTitle||'')[0]:cast[0];
    const identity=state().identity;
    heading.textContent=player && identity ? NanlanCharacter.display(identity) : player ? deskText('你','You') : first;
    if (player && identity) heading.dataset.noLocalize='';
    $('dialogKicker').textContent=rest.join(' · ');
    host.className='talk-cast'; host.hidden=false; host.replaceChildren();
    const left=who && figure(who[1],'at-left',!player);
    const right=figure(state().gender==='male'?'playerMale':'playerFemale','at-right',player);
    if(left) host.append(left);
    if(right) host.append(right);
    window.NanlanAudio?.setDialogue(true);
    return true;
  }
  return {open,place,partner};
})();
