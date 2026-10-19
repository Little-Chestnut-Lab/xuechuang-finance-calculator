(function(g){
'use strict';
const clone=x=>JSON.parse(JSON.stringify(x));
const keys={custom:'financial-custom-workspace-v1'};
// Historical manual records keep their original order and note IDs, prices and demands.
function parametersForPlan(p,plan){return p;}
function newPlan(data){
 const refs=[];
 return blankPlan(data,refs);
}
function syncMarket(plan,p){if(!p.market_orders)return;
 for(const q of plan.quarters)for(const o of q.orders){const rule=p.market_orders.find(x=>x.id===o.id&&x.quarter===Number(q.quarter));if(!rule)continue;
  o.demand=q.group_count!==null&&q.group_count!==undefined&&q.group_count!==''?Number(rule.mean_order)*Number(q.group_count):null;
 }
}
function blankPlan(data,references=[]){
 const plan={name:data.parameters.name+' · 新的一局',factories:[],lines:[],quarters:[],snapshots:{}};
 if(data.parameters.template_id==='jubao_b')plan.market_mode='rules';
 for(let q=1;q<=4;q++){
  const rules=data.parameters.market_orders||references;
  const orders=rules.length?rules.filter(o=>o.quarter===q).map(o=>({id:o.id,product:o.product,demand:null,lag:o.lag,price:o.price_ceiling,ad:0,quantity:0,cap:null,splits:''})):[];
  plan.quarters.push({quarter:q,stage:'预计',group_count:null,loans:{short:0,long:0},sales:Object.fromEntries(data.parameters.sales_staff.map(s=>[s.id,0])),orders,discounts:[]});
 }
 return plan;
}
function orderReference(references,q,o){return references.find(r=>r.quarter===q&&(r.id===o.id||r.legacy_id===o.id)&&r.product===o.product)||null;}
function syncReferenceDemand(plan,references,q){
 if(q.group_count==null||q.group_count===''){for(const o of q.orders)if(orderReference(references,Number(q.quarter),o))o.demand=null;return;}
 const group=Number(q.group_count);if(!Number.isInteger(group)||group<1)return;
 for(const o of q.orders){const ref=orderReference(references,Number(q.quarter),o);if(ref)o.demand=Number(ref.mean_order)*group;}
}
const api={keys,newPlan,syncMarket,blankPlan,orderReference,syncReferenceDemand,parametersForPlan};if(typeof module!=='undefined')module.exports=api;else g.TemplateState=api;
})(globalThis);
