// Pure synthetic values for regression checks, not a competition strategy.
const R=require('../custom/rules-model.js');
function rules(){const p=R.blank();p.name='Synthetic rules';for(const s of R.specs())R.set(p,s.path,s.kind==='rate'?'0.1':s.kind==='int'?Math.max(s.min,1):'10');p.business_tax_rate='0';p.factory.default_slots=4;
 for(const e of p.equipment){e.capacity=10;e.worker_capacity=10;e.installation_quarters=0;e.worker_training_quarters=0;}
 p.market_orders=[1,2,3,4].map(q=>({id:'SYN-Q'+q+'-O1',quarter:q,product:'low',mean_order:'20',price_ceiling:'20',lag:1,price_weight:'0.5'}));return R.compile(p).parameters;}
function plan(parameters){const p=parameters.market_orders?R.blankPlan(parameters):require('../templates/template-state.js').blankPlan({parameters},require('../templates/jiyu-order-references.js').orders);p.name='Synthetic roundtrip';p.factories=[{id:'SYN-F1',quarter:1,mode:'rent',slots:4}];p.lines=[{id:'SYN-L1',type:'L1',quarter:1,workerQuarter:1,workers:1,factory:'SYN-F1',outputs:['auto','auto','auto','auto']}];
 for(const q of p.quarters){q.group_count=2;const o=q.orders.find(o=>o.product==='low');if(o){o.quantity=1;o.cap=1;o.splits='1';}}
 return p;
}
function storage(){const values=new Map();return {values,getItem:k=>values.has(k)?values.get(k):null,setItem:(k,v)=>values.set(k,String(v)),removeItem:k=>values.delete(k)};}
module.exports={rules,plan,storage};
