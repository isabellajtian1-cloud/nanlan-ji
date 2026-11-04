/* Qingyu chapter touch points reuse the existing painted environment set. */
(()=>{'use strict';const D=window.NANLAN_DATA,W=D.world;
const add=(sc,o)=>{if(W[sc]&&!W[sc].objects.some(v=>v.id===o.id))W[sc].objects.push(o);};
const point=(id,x,y,label,role)=>({id,x,y,label,type:'activity',action:'voyageScene',...(role?{role}:{})});
const defs=[
 ['qPier','青屿 · 渡口','Qingyu · Landing','wharf'],
 ['qFair','青屿 · 临潮集','Qingyu · Tidal Fair','qingxi'],
 ['qSalt','青屿 · 盐田边','Qingyu · Salt Pans','coast'],
 ['qBamboo','青屿 · 上行竹径','Qingyu · Upper Bamboo Path','bambooGrove'],
 ['qBeacon','青屿 · 旧灯台下','Qingyu · Old Beacon Path','summit'],
 ['qLodge','青屿 · 临时宿院','Qingyu · Guest Courtyard','backHall']
];
for(const [id,name,en,src]of defs){
 W[id]={name,soundScene:src,asset:W[src].asset,spawn:[530,510],bounds:[200,350,940,585],collisions:[],objects:[]};
 const dict=window.NANLAN_EN||(window.NANLAN_EN={});dict[name]=en;
 add(id,point('voyageCompanion',650,490,'同行的人'));add(id,point('voyageSupplies',800,540,'旅途补给'));
}
const door=(sc,to,x,y,label)=>add(sc,{id:'road-'+sc+'-'+to,to,x,y,label,type:'door'});
door('qPier','qFair',900,555,'沿上行路往临潮集');door('qFair','qPier',230,555,'回青屿渡口');
door('qPier','qBamboo',300,370,'循标记上竹径');door('qBamboo','qPier',260,555,'循高路回渡口');
door('qBamboo','qBeacon',890,430,'沿安全步道到旧灯台');door('qBeacon','qBamboo',220,555,'回上行竹径');
door('qFair','qSalt',900,430,'往盐田棚架');door('qSalt','qFair',220,555,'回临潮集');
door('qFair','qLodge',760,370,'往宿院歇脚');door('qLodge','qFair',250,555,'出宿院回集');
add('qPier',point('voyageShoreStove',430,390,'获准用火的岸灶'));
add('qPier',point('voyageRoute',760,370,'青屿归路图'));
add('qPier',point('voyageReturn',350,550,'近岸班船 · 返湾'));
add('qFair',point('voyageCraft',500,390,'匠人案 · 旧篮与合作小样'));
add('qFair',point('voyageStall',760,460,'临潮集 · 试提与实货'));
add('qSalt',point('voyageMeasure',570,410,'盐棚架口 · 量尺寸'));
add('qBamboo',point('voyagePath',580,460,'上行归路 · 岸标'));
add('qBeacon',point('voyageSketch',530,430,'避风坐处 · 写生'));
add('qLodge',point('voyageGuestBook',530,390,'宿院簿 · 歇脚与归期'));
add('anchorage',point('voyageBox',415,490,'春潮木匣 · 竹篮与来信'));
add('anchorage',point('voyageHarbor',350,550,'青屿近岸班船'));
add('backHall',{...point('voyageBook',830,475,'春潮来信与旅途册'),v3Art:3});
add('backHall',{...point('voyageExtras',840,555,'闲日邀约 · 六篇番外'),v3Art:3});
add('coast',point('voyageCoastRest',420,550,'岸上歇脚 · 旧友与绳具'));
})();