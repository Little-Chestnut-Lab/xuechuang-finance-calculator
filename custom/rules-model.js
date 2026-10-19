(function(g){
'use strict';
const clone=x=>JSON.parse(JSON.stringify(x)),types=['H1','H2','M1','M2','L1','L2'],products=['high','mid','low'];
const names={H1:'高端1',H2:'高端2',M1:'中端1',M2:'中端2',L1:'低端1',L2:'低端2',high:'高端',mid:'中端',low:'低端'};
const money=()=>typeof module!=='undefined'?require('./engine.js').Money:g.JiyuEngine.Money;
function blank(){return {template_id:'custom',name:'',currency:'CNY',amount_unit:'元',quantity_unit:'套',scale:1,
 initial_cash:'',vat_rate:'',income_tax_rate:'',business_tax_rate:'',default_penalty_rate:'',
 surcharge_rates:{city:'',education:'',local_education:''},
 loans:{short:{rate:'',term_quarters:''},long:{rate:'',term_quarters:''}},
 emergency_loan:{rate:'',term_quarters:'',mode:'显示风险，不自动借入'},
 discount_rates_by_remaining_quarters:{1:'',2:'',3:'',4:''},
 factory:{purchase_price:'',rent_per_quarter:'',finance_price:'',finance_term_quarters:'',finance_interest_rate:'',purchase_depreciation_rate:'',finance_depreciation_rate:'',default_slots:''},
 administration:{base:'',per_owned_line_including_installation:''},
 equipment:types.map(id=>({id,product:{H:'high',M:'mid',L:'low'}[id[0]],price:'',depreciation_rate:'',maintenance_per_quarter:'',installation_quarters:'',capacity:'',worker_wage:'',worker_recruit_training_fee:'',worker_capacity:'',worker_training_quarters:'',first_depreciation_maintenance_age:1})),
 sales_staff:['A','B'].map(id=>({id,wage:'',recruit_fee:'',training_quarters:''})),
 products:products.map(id=>({id,material_unit_price:'',material_credit_quarters:'',processing_per_unit:''})),
 market_orders:[],rounding:{internal:'exact_rational',platform_midpoint_policy:'未确认'},strategic_constraints:{material_purchase_equals_production:true},excluded_modules:['股票','债券']};}
const get=(p,path)=>path.split('.').reduce((v,k)=>v?.[k],p);
function set(p,path,v){const keys=path.split('.');let obj=p;for(const k of keys.slice(0,-1))obj=obj[k];obj[keys.at(-1)]=v;}
function percent(v,reverse=false){if(v===''||v===null||v===undefined)return '';const Money=money();return reverse?new Money(v).div(100).toString():new Money(v).mul(100).toString();}
function specs(){const s=[];const add=(path,label,kind='money',min=0,max=null)=>s.push({path,label,kind,min,max});
 add('initial_cash','季初现金');add('administration.base','行政管理费基础额');add('administration.per_owned_line_including_installation','每条持有产线管理费');
 for(const [key,label] of [['purchase_price','购买价'],['rent_per_quarter','季度租金'],['finance_price','融资原值']])add('factory.'+key,'厂房'+label);
 for(const [key,label] of [['purchase_depreciation_rate','购买折旧率'],['finance_depreciation_rate','融资折旧率'],['finance_interest_rate','融资每季利率']])add('factory.'+key,'厂房'+label,'rate',0,1);
 add('factory.default_slots','每厂房产线容量','int',1,100);add('factory.finance_term_quarters','融资还本期数','int',1,20);
 for(const [key,label] of [['short','短贷'],['long','长贷']]){add('loans.'+key+'.rate',label+'一次扣息利率','rate',0,1);add('loans.'+key+'.term_quarters',label+'到期期数','int',1,20);}
 add('emergency_loan.rate','紧急贷款利率','rate',0,1);add('emergency_loan.term_quarters','紧急贷款期数','int',1,20);
 for(let n=1;n<=4;n++)add('discount_rates_by_remaining_quarters.'+n,'剩余'+n+'期贴现率','rate',0,1);
 for(const [key,label] of [['vat_rate','增值税率'],['income_tax_rate','所得税率'],['business_tax_rate','营业税率'],['surcharge_rates.city','城建税率'],['surcharge_rates.education','教育附加率'],['surcharge_rates.local_education','地方教育附加率'],['default_penalty_rate','违约罚金比例']])add(key,label,'rate',0,1);
 types.forEach((id,i)=>{const pre='equipment.'+i+'.',label=names[id]+' · ';
  for(const [key,l] of [['price','购价'],['maintenance_per_quarter','维修费'],['worker_wage','工人工资'],['worker_recruit_training_fee','招聘培训费']])add(pre+key,label+l);
  add(pre+'depreciation_rate',label+'折旧率','rate',0,1);
  for(const [key,l] of [['capacity','设备产能'],['worker_capacity','每人工人产能']])add(pre+key,label+l,'int',1,1000000);
  for(const [key,l] of [['installation_quarters','设备安装期'],['worker_training_quarters','人员培训期']])add(pre+key,label+l,'int',0,4);
 });
 ['A','B'].forEach((id,i)=>{add(`sales_staff.${i}.wage`,'销售'+id+'工资');add(`sales_staff.${i}.recruit_fee`,'销售'+id+'招聘费');add(`sales_staff.${i}.training_quarters`,'销售'+id+'培训期','int',0,4);});
 products.forEach((id,i)=>{add(`products.${i}.material_unit_price`,names[id]+'原料单价');add(`products.${i}.processing_per_unit`,names[id]+'加工费');add(`products.${i}.material_credit_quarters`,names[id]+'原料付款账期','int',0,4);});return s;
}
function hasShape(p){return !!(p&&typeof p==='object'&&typeof p.name==='string'&&p.factory&&p.administration&&p.surcharge_rates&&p.loans?.short&&p.loans?.long&&p.emergency_loan&&p.discount_rates_by_remaining_quarters&&Array.isArray(p.equipment)&&p.equipment.length===6&&p.equipment.every((e,i)=>e&&e.id===types[i])&&Array.isArray(p.products)&&p.products.length===3&&p.products.every((e,i)=>e&&e.id===products[i])&&Array.isArray(p.sales_staff)&&p.sales_staff.length===2&&p.sales_staff.every((e,i)=>e&&e.id===['A','B'][i])&&Array.isArray(p.market_orders)&&p.market_orders.every(o=>o&&typeof o.id==='string'&&Number.isInteger(o.quarter)&&o.quarter>=1&&o.quarter<=4));}
function validate(p){const errors=[];if(!hasShape(p))return ['规则数据格式不完整，需包含厂房、六种设备、人员、原料、贷款、税费及市场表'];
 if(typeof p.name!=='string'||!p.name.trim())errors.push('请填写规则名称');
 if(!Array.isArray(p.equipment)||p.equipment.length!==6||p.equipment.some((x,i)=>x.id!==types[i]||x.product!=={H:'high',M:'mid',L:'low'}[types[i][0]]))errors.push('需提供六种标准设备及对应产品');
 if(!Array.isArray(p.sales_staff)||p.sales_staff.length!==2||p.sales_staff.some((x,i)=>x.id!==['A','B'][i]))errors.push('需提供销售A、B规则');
 if(!Array.isArray(p.products)||p.products.length!==3||p.products.some((x,i)=>x.id!==products[i]))errors.push('需提供高、中、低端原料规则');
 const check=(v,label,kind,min,max)=>{if(v===''||v===null||v===undefined){errors.push('请填写'+label);return;}
  if(!/^(\d+)(\.\d+)?$/.test(String(v))||!Number.isFinite(Number(v))){errors.push(label+'必须为非负数字');return;}
  const n=Number(v);if((kind==='int'&&!Number.isInteger(n))||n<min||(max!==null&&n>max))errors.push(label+'应为'+min+'至'+(max===null?'非负数':max)+(kind==='int'?'的整数':''));
 };
 specs().forEach(s=>check(get(p,s.path),s.label,s.kind,s.min,s.max));
 if(p.business_tax_rate!==''&&Number(p.business_tax_rate)!==0)errors.push('现有比赛计算口径仅支持营业税率为0，非零口径需另行补充');
 const ids=new Set();if(!Array.isArray(p.market_orders))errors.push('四季度市场订单格式不正确');else{
  for(let q=1;q<=4;q++)if(!p.market_orders.some(o=>o.quarter===q))errors.push('请添加第'+q+'季度市场订单');
  p.market_orders.forEach((o,i)=>{const l='第'+(i+1)+'条市场订单';if(typeof o.id!=='string'||!o.id.trim()||ids.has(o.id))errors.push(l+'编号为空或重复');ids.add(o.id);
   if(!products.includes(o.product))errors.push(l+'请选择产品');check(o.quarter,l+'季度','int',1,4);check(o.mean_order,l+'均单','int',1,1000000);check(o.price_ceiling,l+'最高报价','money',0,null);check(o.lag,l+'账期','int',0,4);check(o.price_weight,l+'报价占比','rate',0,1);
  });
 }return errors;
}
function compile(draft){const errors=validate(draft);if(errors.length)return {errors};const p=clone(draft);
 p.template_id='custom';p.name=p.name.trim();p.factory.depreciation_rate=p.factory.purchase_depreciation_rate;
 p.equipment.forEach(e=>e.first_depreciation_maintenance_age=1);
 p.market_orders.forEach(o=>{const Money=money();o.ad_weight=new Money(1).sub(o.price_weight).toString();});
 p.products.forEach(x=>{x.price_ceiling=String(Math.max(...p.market_orders.filter(o=>o.product===x.id).map(o=>Number(o.price_ceiling)),0));});
 return {parameters:p,errors:[]};
}
function blankPlan(p){return {name:p.name+' · 新的一局',factories:[],lines:[],quarters:[1,2,3,4].map(q=>({quarter:q,stage:'预计',group_count:null,loans:{short:0,long:0},sales:{A:0,B:0},orders:p.market_orders.filter(o=>o.quarter===q).map(o=>({id:o.id,product:o.product,demand:null,lag:o.lag,price:o.price_ceiling,ad:0,quantity:0,cap:null,splits:''})),discounts:[]})),snapshots:{}};}
function reconcile(plan,p){if(!plan)return blankPlan(p);const copy=clone(plan);
 for(const q of copy.quarters){const rules=p.market_orders.filter(o=>o.quarter===Number(q.quarter)),ids=new Set(rules.map(o=>o.id));
  for(const o of q.orders)if(!ids.has(o.id)&&([o.quantity,o.ad,o.cap].some(x=>Number(x)>0)||q.discounts.some(d=>d.note.startsWith(o.id+'#'))||copy.quarters.some(t=>t.discounts.some(d=>d.note.startsWith(o.id+'#')))))throw Error(o.id+'已有经营数据或贴现，不能直接删除规则。请先导出本局，再清理该订单数据，或新开一局。');
  q.orders=rules.map(rule=>{const old=q.orders.find(o=>o.id===rule.id);return {id:rule.id,ad:0,quantity:0,cap:null,splits:'',...(old||{}),product:rule.product,lag:rule.lag,price:rule.price_ceiling,demand:q.group_count==null||q.group_count===''?null:Number(rule.mean_order)*Number(q.group_count)};});
 }return copy;
}
const api={blank,clone,names,get,set,percent,specs,validate,compile,blankPlan,reconcile,hasShape};if(typeof module!=='undefined')module.exports=api;else g.CustomRules=api;
})(globalThis);
