// Construct the walking sample from a fresh game. The isolated tab owns this session.
if (window.NanlanWalkSample) {
  const model = window.NanlanEngine;
  const world = window.NANLAN_DATA.world;
  const walk = new model.Engine({}, world);
  walk.memoryOnly = true;
  const act = (name, options) => {
    const result = walk.act(name, options);
    if (!result.ok) throw Error(name + ' · ' + result.message);
  };
  const enter = scene => {
    const result = walk.enter(scene);
    if (!result.ok) throw Error(scene + ' · ' + result.message);
  };
  const standBy = id => {
    const person = world[walk.state.scene].objects.find(object => object.id === id);
    walk.move(person.x, person.y);
  };
  const accept = (id, scene, person) => {
    enter(scene);
    standBy(person);
    act('acceptFamilyRequest', {id});
  };
  standBy('familyLuggage');
  act('handover', {choice:'grandfather'});
  act('takeKey');
  act('openGate');
  accept('M02', 'bed', 'mother');
  act('inspectWindow');
  act('inspectLeak');
  act('firstRepair', {choice:'window'});
  act('setBed');
  accept('M03', 'hall', 'father');
  enter('store');
  act('farmTools');
  act('repairTools');
  act('bucket');
  enter('yard');
  walk.state.selected = 'sickle';
  for (const id of ['weed1','weed2','weed3']) act('clearWeed', {id});
  act('smallBed', {choice:'vegetable'});
  accept('M04', 'hall', 'motherHall');
  enter('yard');
  for (const action of ['cleanStove','fillWater','clearDrain','cookMeal']) act(action);
  enter('hall');
  act('shareFirst', {choice:'family'});
  enter('bed');
  act('sleep');
  enter('village');
  if(window.NanlanHomewardSample){
    walk.state.worldTick=Math.floor(walk.state.worldTick/1440)*1440+1056;
    if(window.NanlanHomewardSample==='veranda'){enter('yard');enter('eavesGallery');walk.move(591,452);}
    else walk.move(430,371);
  }
  else walk.move(948,373);
  localStorage.setItem(model.SAVE_KEY, JSON.stringify(walk.state));
}
