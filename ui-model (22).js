(function(g){
'use strict';
const types={H1:'高端1',H2:'高端2',M1:'中端1',M2:'中端2',L1:'低端1',L2:'低端2'};
const clone=x=>JSON.parse(JSON.stringify(x));
function ensureNames(plan){
 for(const [field,counter] of [['lines','nextLineNumber'],['factories','nextFactoryNumber']]){
  const items=plan[field],used=new Set();let next=Math.max(Number(plan[counter])||1,...items.map(x=>(Number(x.displayNumber)||0)+1));
  for(const x of items){if(!Number.isInteger(x.displayNumber)||x.displayNumber<1||used.has(x.displayNumber))x.displayNumber=next++;used.add(x.displayNumber);}
  plan[counter]=next;
 }
 return plan;
}
const lineName=l=>'产线'+String(l.displayNumber).padStart(2,'0')+'（'+types[l.type]+'）';
const factoryName=f=>'厂房'+String(f.displayNumber).padStart(2,'0');
function applyConstruction(current,preset){
 const p=clone(current);ensureNames(p);
 p.factories=preset.factories.map(f=>({...clone(f),displayNumber:p.factories.find(x=>x.id===f.id)?.displayNumber}));
 p.lines=preset.lines.map(l=>{
  const old=p.lines.find(x=>x.id===l.id);
  return {...clone(l),displayNumber:old?.displayNumber,outputs:old?clone(old.outputs):['auto','auto','auto','auto'],workers:old?.workers??1,workerQuarter:old?.workerQuarter??l.quarter};
 });
 for(let q=1;q<=4;q++)if(p.quarters[q-1].sequence){const held=p.lines.filter(l=>Number(l.quarter)<=q).map(l=>l.id),prior=p.quarters[q-1].sequence;p.quarters[q-1].sequence=[...prior.filter(id=>held.includes(id)),...held.filter(id=>!prior.includes(id))];}
 ensureNames(p);return p;
}
// 展示顺序单独保存；原订单数组的计算顺序及票据编号保持稳定。
function orderSequence(q,rules=[]){
 const present=new Set(q.orders.map(o=>o.id));
 const defaults=[...new Set([...rules.map(o=>o.id),...q.orders.map(o=>o.id)])].filter(id=>present.has(id));
 const saved=Array.isArray(q.order_display_sequence)?q.order_display_sequence:[];
 return [...new Set([...saved,...defaults])].filter(id=>present.has(id));
}
function orderRows(q,rules=[]){
 const rank=new Map(orderSequence(q,rules).map((id,i)=>[id,i]));
 return q.orders.map((order,index)=>({order,index})).sort((a,b)=>rank.get(a.order.id)-rank.get(b.order.id));
}
function moveOrder(q,id,direction,rules=[]){
 if(direction!==-1&&direction!==1)return false;
 const seq=orderSequence(q,rules),i=seq.indexOf(id),target=i+direction;
 if(i<0||target<0||target>=seq.length)return false;
 [seq[i],seq[target]]=[seq[target],seq[i]];q.order_display_sequence=seq;return true;
}
const api={ensureNames,lineName,factoryName,applyConstruction,orderSequence,orderRows,moveOrder};if(typeof module!=='undefined')module.exports=api;else g.JiyuUI=api;
})(globalThis);
