/* Identity is saved with the journey, never in a separate browser preference. */
(function(root,make){const api=make();if(typeof module==='object'&&module.exports)module.exports=api;else root.NanlanCharacter=api;})(globalThis,()=>{
 'use strict';
 function validate(value,gender){
  if(!value||typeof value!=='object')throw new Error('请填写姓与名。');
  const surname=typeof value.surname==='string'?value.surname.trim().normalize('NFC'):'';
  const givenName=typeof value.givenName==='string'?value.givenName.trim().normalize('NFC'):'';
  const allowed=/^[\p{L}\p{M}][\p{L}\p{M} ·’'-]*$/u;
  if(!surname||!givenName||!allowed.test(surname)||!allowed.test(givenName)||[...surname].length>24||[...givenName].length>24)throw new Error('姓与名均须填写，各限 24 字；可用汉字、字母、间隔点与连字符。');
  if(!['female','male'].includes(gender)||value.portraitId!==gender)throw new Error('请选择人物立绘。');
  return {surname,givenName,portraitId:gender};
 }
 function display(value){if(!value)return '';return value.surname+(/[\p{Script=Han}]/u.test(value.surname+value.givenName)?'':' ')+value.givenName;}
 return {validate,display};
});
