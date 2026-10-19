/* 输入校验与导入事务；不包含经营方案或财务计算公式。 */
(function(g){
'use strict';
const clone=x=>JSON.parse(JSON.stringify(x));
const object=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const check=(v,m)=>{if(!v)throw Error(m);};
function integer(v,label,min=0,max=1000000){
 check((typeof v==='number'||typeof v==='string')&&String(v).trim()!==''&&/^\d+(\.0+)?$/.test(String(v).trim()),label+'必须为合法整数');
 const n=Number(v);check(Number.isSafeInteger(n)&&n>=min&&n<=max,label+'必须为'+min+'至'+max+'的整数');return n;
}
function decimal(v,label){check((typeof v==='string'||typeof v==='number')&&/^\d+(\.\d+)?$/.test(String(v))&&String(v).length<=1024,label+'必须为非负普通十进制数');return v;}
function safeTree(x,depth=0,count={n:0}){
 check(depth<=60&&++count.n<=500000,'记录嵌套过深或内容过多');
 if(x===null||['string','boolean','number'].includes(typeof x)){if(typeof x==='number')check(Number.isFinite(x),'记录包含非有限数字');return;}
 check(typeof x==='object','记录包含不支持的数据类型');
 for(const k of Object.keys(x)){check(!['__proto__','prototype','constructor'].includes(k),'记录包含不安全字段');safeTree(x[k],depth+1,count);}
}
function normalizePlan(input){
 check(object(input),'方案必须为对象');const p=clone(input);
 check(Array.isArray(p.factories)&&Array.isArray(p.lines)&&Array.isArray(p.quarters)&&p.quarters.length===4,'方案必须包含厂房、生产线及四季度数据');
 for(const f of p.factories){check(object(f),'厂房格式无效');f.quarter=integer(f.quarter,'厂房取得季度',1,4);}
 for(const l of p.lines){check(object(l),'生产线格式无效');l.quarter=integer(l.quarter,'购线季度',1,4);l.workerQuarter=integer(l.workerQuarter,'工人招聘季度',1,4);}
 for(const q of p.quarters){check(object(q),'季度格式无效');q.quarter=integer(q.quarter,'经营季度',1,4);}
 return p;
}
function normalizeRules(input){const p=clone(input);if(Array.isArray(p?.market_orders))for(const o of p.market_orders){check(object(o),'规则订单格式无效');o.quarter=integer(o.quarter,'规则订单季度',1,4);}return p;}
function validatePlan(input,parameters,{historical=false}={}){
 safeTree(input);const p=normalizePlan(input);check(typeof p.name==='string','本局名称格式无效');
 const eq=new Set(parameters.equipment.map(x=>x.id)),products=new Set(parameters.products.map(x=>x.id));
 const unique=(xs,label)=>{check(xs.length<=10000,label+'数量过多');const ids=new Set();for(const x of xs){check(object(x)&&typeof x.id==='string'&&x.id.trim()&&x.id.length<=500,label+'编号无效');check(!ids.has(x.id),label+'编号重复');ids.add(x.id);}return ids;};
 const factories=unique(p.factories,'厂房'),lines=unique(p.lines,'生产线');
 for(const f of p.factories){integer(f.slots,'厂房容量',1,100);check(['finance','rent','purchase'].includes(f.mode),'厂房取得方式无效');}
 for(const l of p.lines){check(eq.has(l.type),'生产线类型无效');check(factories.has(l.factory),'生产线所属厂房无效');const f=p.factories.find(x=>x.id===l.factory);check(l.quarter>=f.quarter,'生产线不能早于所属厂房取得');check(l.workerQuarter>=l.quarter,'招聘季度不能早于购线季度');integer(l.workers,'工人数',0,100);check(Array.isArray(l.outputs)&&l.outputs.length===4,'生产线缺少四季度产量');l.outputs.forEach(x=>{if(x!=='auto')integer(x,'生产线产量');});}
 for(const f of p.factories)check(p.lines.filter(l=>l.factory===f.id).length<=Number(f.slots),'厂房生产线超过容量');
 const orders=[];
 p.quarters.forEach((q,i)=>{
  check(q.quarter===i+1,'季度排列错误');check(['预计','实际'].includes(q.stage),'数据阶段无效');
  check(object(q.loans)&&object(q.sales)&&Array.isArray(q.orders)&&Array.isArray(q.discounts),'季度经营字段不完整');
  decimal(q.loans.short,'短贷');decimal(q.loans.long,'长贷');
  for(const s of parameters.sales_staff)integer(q.sales[s.id],'销售招聘');
  if(q.group_count!==null&&q.group_count!==undefined&&q.group_count!=='')integer(q.group_count,'小组数',1);
  check(q.orders.length<=10000&&q.discounts.length<=10000,'订单或贴现记录过多');
  for(const o of q.orders){check(object(o),'订单格式无效');check(products.has(o.product),'订单产品无效');integer(o.quantity,'订单数量');integer(o.lag,'订单账期',0,Math.max(3,...Object.keys(parameters.discount_rates_by_remaining_quarters).map(Number)));decimal(o.price,'订单报价');decimal(o.ad,'订单广告');
   if(o.cap!==null&&o.cap!==undefined&&o.cap!==''){integer(o.cap,'订单提交上限');check(Number(o.quantity)<=Number(o.cap),'订单出单数量超过提交上限');}
   if(o.demand!==null&&o.demand!==undefined&&o.demand!=='')integer(o.demand,'订单需求量');
   if(o.splits!==undefined){check(typeof o.splits==='string'||typeof o.splits==='number','分批交货格式无效');if(Number(o.quantity)>0&&o.splits){const xs=String(o.splits).split(/[,，\s]+/).filter(Boolean);check(xs.length&&xs.reduce((n,x)=>n+integer(x,'分批数量',1),0)===Number(o.quantity),'分批交货数量合计不符');}}
   if(o.price_weight!==null&&o.price_weight!==undefined&&o.price_weight!==''){decimal(o.price_weight,'报价占比');check(Number(o.price_weight)<=1,'报价占比超过1');}orders.push({...o,created:q.quarter});
  }
  for(const key of ['sequence','order_display_sequence'])if(q[key]!==undefined)check(Array.isArray(q[key])&&q[key].every(v=>typeof v==='string'),key+'格式无效');
  if(q.sequence)check(new Set(q.sequence).size===q.sequence.length&&q.sequence.length===p.lines.filter(l=>l.quarter<=q.quarter).length&&q.sequence.every(id=>lines.has(id)&&p.lines.find(l=>l.id===id).quarter<=q.quarter),'投产顺序无效');
  if(q.opening_emergency!==undefined){check(object(q.opening_emergency),'紧急贷款格式无效');decimal(q.opening_emergency.principal??0,'紧急贷款本金');check(['upfront','due'].includes(q.opening_emergency.interest_timing||'upfront'),'紧急贷款扣息时点无效');}
 });
 unique(orders,'订单');
 const state=typeof module!=='undefined'?require('./template-state.js'):g.TemplateState;
 const effective=state.parametersForPlan(parameters,p),seenNotes=new Set();
 for(const q of p.quarters){
  for(const o of q.orders)if(effective.market_orders&&!historical){const rule=effective.market_orders.find(r=>r.id===o.id&&Number(r.quarter)===q.quarter);check(rule,'订单不在当前模板市场中');check(o.product===rule.product&&Number(o.lag)===Number(rule.lag),'订单产品或账期与模板不符');}
  for(const d of q.discounts){check(object(d)&&typeof d.note==='string'&&['before','after'].includes(d.phase),'贴现记录格式无效');check(!seenNotes.has(d.note),'票据重复贴现');seenNotes.add(d.note);
   const o=orders.find(o=>d.note.startsWith(o.id+'#')&&/^\d+$/.test(d.note.slice(o.id.length+1)));check(o,'贴现票据对应订单不存在');const n=Number(d.note.slice(o.id.length+1)),parts=String(o.splits||o.quantity).split(/[,，\s]+/).filter(Boolean);check(n>=1&&n<=parts.length&&Number(o.quantity)>0,'贴现票据批次不存在');check(Number(o.lag)>0&&o.created+Number(o.lag)>q.quarter&&(d.phase!=='before'?o.created<=q.quarter:o.created<q.quarter),'贴现阶段或到期时间无效');check(d.face===undefined&&d.amount===undefined,'仅支持整张票据贴现');}
 }
 if(p.snapshots!==undefined){check(object(p.snapshots),'预算快照格式无效');for(const [q,list] of Object.entries(p.snapshots)){integer(q,'快照季度',1,4);check(Array.isArray(list)&&list.length<=10000,'预算快照列表无效');for(const s of list)check(object(s)&&object(s.budget)&&typeof s.time==='string','预算快照内容无效');}}
 else p.snapshots={};
 return p;
}
function validateTemplate(record,templates){safeTree(record);check(object(record)&&record.schema===1&&typeof record.template==='string'&&Object.hasOwn(templates,record.template),'不是已支持模板的本局记录');return {...clone(record),plan:validatePlan(record.plan,templates[record.template].parameters)};}
function parse(text){check(typeof text==='string'&&text.length<=20*1024*1024,'JSON文件过大或内容无效');let r;try{r=JSON.parse(text);}catch(e){throw Error('JSON损坏或不是合法JSON');}safeTree(r);return r;}
function transaction(storage,key,record,{backup,apply=()=>{},restore=()=>{}}={}){
 const previous=storage.getItem(key);
 // 在触碰当前记录前确认可恢复副本已写入。
 const recovery=backup===undefined?previous:JSON.stringify(backup);
 try{storage.setItem(key+'-before-import',recovery??'null');if(storage.getItem(key+'-before-import')!==(recovery??'null'))throw Error('备份校验失败');}catch(e){throw Error('导入取消：无法备份原局（'+e.message+'）');}
 try{const value=JSON.stringify(record);storage.setItem(key,value);if(storage.getItem(key)!==value)throw Error('存储写入校验失败');apply(record);return record;}
 catch(e){const failures=[];try{restore();}catch(r){failures.push('原界面恢复失败：'+r.message);}
  try{if(previous===null)storage.removeItem(key);else storage.setItem(key,previous);if(storage.getItem(key)!==previous)throw Error('恢复校验失败');}catch(r){failures.push('本机记录未能恢复：'+r.message);}
  throw Error('导入失败：'+e.message+'；'+(failures.length?failures.join('；')+'。请使用导入前备份恢复':'已恢复原记录和界面')+'（导入前备份已保留）');
 }
}
const api={clone,integer,decimal,safeTree,normalizePlan,normalizeRules,validatePlan,validateTemplate,parse,transaction};
if(typeof module!=='undefined')module.exports=api;else g.RecordIO=api;
})(globalThis);
