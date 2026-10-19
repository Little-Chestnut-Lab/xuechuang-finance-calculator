(function(g){
'use strict';
const engine=typeof module!=='undefined'?require('./engine.js'):g.JiyuEngine;
const layout=typeof module!=='undefined'?require('./budget-layout.js'):g.JiyuBudgetLayout;
const M=x=>new engine.Money(x),sum=xs=>xs.reduce((a,x)=>a.add(x),M(0)),plain=x=>JSON.parse(JSON.stringify(x));
function build(p,plan,r){
 const b=r.budget,q=r.quarter,ids=['high','mid','low'],eq=Object.fromEntries(p.equipment.map(e=>[e.id,e]));
 const held=plan.lines.filter(l=>Number(l.quarter)<=q),manufacturing=[];
 function grouped(row,entries,unit='项'){
  const count=sum(entries.map(x=>x.count)),value=sum(entries.map(x=>M(x.price).mul(x.count))),rates=new Set(entries.filter(x=>Number(x.count)>0).map(x=>M(x.price).toString()));
  return {row,label:layout.comprehensive[row],value,price:rates.size>1?null:M(entries.find(x=>Number(x.count)>0)?.price||entries[0]?.price||0),quantity:rates.size>1?null:count,unit,mixed:rates.size>1};
 }
 for(const [offset,kind] of [[14,'wage'],[17,'dep'],[20,'repair'],[23,'processing']]){
  ids.forEach((id,i)=>{
   const lines=held.filter(l=>eq[l.type].product===id),prod=p.products.find(x=>x.id===id);let entries;
   if(kind==='processing')entries=[{price:prod.processing_per_unit,count:r.production[id]}];
   else entries=lines.map(l=>{const e=eq[l.type],old=q-Number(l.quarter)>=Number(e.first_depreciation_maintenance_age);return kind==='wage'?{price:e.worker_wage,count:q>=Number(l.workerQuarter)?l.workers:0}:kind==='dep'?{price:M(e.price).mul(e.depreciation_rate),count:old?1:0}:{price:e.maintenance_per_quarter,count:old?1:0};});
   manufacturing.push(grouped(offset+i,entries,kind==='wage'?'人':kind==='processing'?'套':'条'));
  });
 }
 manufacturing.push(grouped(26,[{price:p.factory.rent_per_quarter,count:plan.factories.filter(f=>f.mode==='rent'&&Number(f.quarter)<=q).length}],'间'));
 manufacturing.push(grouped(27,plan.factories.filter(f=>f.mode!=='rent').map(f=>({price:M(f.mode==='finance'?p.factory.finance_price:p.factory.purchase_price).mul(p.factory.depreciation_rate),count:Number(f.quarter)<q?1:0})),'间'));
 const materials=[34,35,36,37,38,39].map(row=>({row,label:layout.comprehensive[row],values:ids.map(id=>{const prod=p.products.find(x=>x.id===id);return row===34||row===37?M(r.production[id]):row===35||row===36?M(0):row===38?M(prod.material_unit_price):M(r.production[id]).mul(prod.material_unit_price);})}));
 const cashValues={3:b.opening_cash,6:b.administration,7:b.advertising,8:'0',9:b.sales_wage,10:b.sales_training,11:'0',12:b.current_material_cash,13:b.factory_purchase,14:b.equipment_purchase,15:b.rent,16:b.maintenance,17:b.processing,18:b.worker_wages,19:b.worker_training,20:'0',21:b.income_tax,22:b.vat,23:'0',24:b.city_tax,25:b.education_tax,26:b.local_education_tax,27:b.short_interest,28:'0',29:b.long_interest,30:b.discount_interest,31:b.matured_payables,32:'0',33:'0',34:'0',35:'0',36:'0',40:b.receivable,41:b.short_loan,42:'0',43:'0',44:b.sales_gross,45:'0',46:'0',47:b.long_loan,48:'0',49:'0'};
 cashValues[37]=M(b.financing_principal).add(b.financing_interest).cmp(0)>0?null:sum(Array.from({length:31},(_,i)=>cashValues[i+6]));
 cashValues[50]=sum(Array.from({length:10},(_,i)=>cashValues[i+40]));
 const cash=layout.cash.map(x=>({...x,value:cashValues[x.row],auto:[37,50].includes(x.row)}));
 return plain({cash,manufacturing,materials,manufacturingTotal:sum(manufacturing.map(x=>x.value)),depreciationTotal:M(b.equipment_depreciation).add(b.factory_depreciation),manufacturingCash:sum(manufacturing.filter(x=>![17,18,19,27].includes(x.row)).map(x=>x.value))});
}
function render(p,plan,r,h,selected='comprehensive'){
 const {esc,money,table,tr}=h,b=r.budget,v=build(p,plan,r),labels=layout.comprehensive;
 const val=x=>x===null?'<span class="pending">待核对</span>':`<span title="完整值：${esc(x)}">${money(x)}</span>`;
 const rows=(items)=>table(['原表行','项目','金额 / 比例'],items.map(([row,value,auto,percent])=>`<tr class="${auto?'system-row':''}" data-source-row="${row}"><td>${row}</td><td>${esc(labels[row])}${auto?'<small>系统合计参考</small>':''}</td><td class="num">${percent?money(Number(value)*100)+'%':val(value)}</td></tr>`));
 const navigation=`<div class="budget-nav"><button data-budget-tab="comprehensive" class="${selected==='comprehensive'?'active':''}">全面预算 · 按原表顺序</button><button data-budget-tab="cash" class="${selected==='cash'?'active':''}">现金预算 · 按部门顺序</button><span>第${r.quarter}季度 · ${esc(r.stage)}数据</span></div>`;
 let html=navigation+'<p class="hint">行次对应《系统所需》表格。灰色合计仅供核对；填报责任以比赛系统实际输入框为准。两张表切换时保留同一季度。</p>';
 if(selected==='cash'){
  let previous='',list=[];
  for(const x of v.cash){
   const dep=x.department;if(dep!==previous){list.push(`<tr class="department"><td colspan="4">${esc(dep==='收入'?'现金收入':dep==='总经理'?'现金支出 · 总经理':dep)}</td></tr>`);previous=dep;}
   list.push(`<tr data-source-row="${x.row}" class="${x.auto?'system-row':''}"><td>${x.row}</td><td>${esc(x.label)}</td><td class="num">${val(x.value)}</td><td class="muted">${x.row===37&&x.value===null?'融资厂房付款的填报行待确认':x.auto?'系统合计参考':x.row===40?'含本季交单前和交单后贴现面额':x.row===44?'所有账期的含税销售金额':x.row===47?'按原表映射：本季新增长贷本金':x.row===31?'季初结算的到期应付仍列示':''}</td></tr>`);
  }
  html+=table(['原表行','项目','预算金额（元）','核对说明'],list);
  html+='<p class="hint">未交货违约、辞退、紧急贷款及投资等未建模操作在当前方案下列0；若实盘发生，不能直接沿用这些0。预算合计不等于实际现金余额。</p>';
 }else{
  html+='<h3>本期销售收入预算</h3>'+table(['原表行','产品','销售单价（元/套）','预计销售量（套）','收入小计（元）'],b.sales_filing.map((s,i)=>tr([i+3,['高端1产品','中端2产品','低端3产品'][i]+(s.mixed_price?'<small>多报价：总额填价格，数量填1</small>':''),val(s.price),s.quantity,val(s.total)])));
  html+=rows([[6,r.revenue,true],[7,b.sales_cash_fraction,false,true],[8,M(r.revenue).mul(b.sales_cash_fraction).toString(),true],[9,b.receivable,false],[10,M(r.revenue).mul(b.sales_cash_fraction).add(b.receivable).toString(),true]]);
  html+='<h3>本期制造费用预算</h3>'+table(['原表行','费用名称','单价（元）','数量','小计（元）'],v.manufacturing.map(x=>`<tr data-source-row="${x.row}"><td>${x.row}</td><td>${esc(x.label)}${x.mixed?'<small>多型号单价不同：请核对总额及平台填法</small>':''}</td><td class="num">${val(x.price)}</td><td class="num">${x.quantity===null?'待核对':esc(x.quantity)}</td><td class="num">${val(x.value)}</td></tr>`));
  html+=rows([[28,v.manufacturingTotal,true],[29,v.depreciationTotal,true],[30,v.manufacturingCash,true]]);
  html+='<h3>本期原料采购预算</h3>'+table(['原表行','项目','高端1产品原料','中端2产品原料','低端3产品原料'],v.materials.map(x=>tr([x.row,esc(x.label),...x.values.map(val)])));
  html+=rows([[40,b.material_cash_fraction,false,true],[41,null,false],[42,null,true]]);
  html+='<p class="hint">按需采购，原料期初/期末数量按0。第41行“本期末到期”与季初自动结算的对应口径待核对：本季初已结算 '+money(b.matured_payables)+'，下季初到期 '+money(r.next_payables)+'；因此第42行暂不代填。当前实际采购付款已在现金预算原料采购费用中列示。</p>';
  html+='<h3>本期销售费用预算</h3>'+rows([[46,b.advertising,false],[47,b.sales_wage,false],[48,M(b.advertising).add(b.sales_wage).toString(),true]]);
  html+='<h3>本期管理费用预算</h3>'+rows([[52,b.administration,false],[53,b.worker_training,false],[54,b.sales_training,false],[55,'0',false],[56,'0',false],[57,M(b.administration).add(b.worker_training).add(b.sales_training).toString(),true]]);
  html+='<p class="hint">此处按平台预算行列展示，管理费用预算合计与利润表管理费用口径不同。安装期工资、整间安装厂房租金在上述工资和租金行填报，在利润表归入管理费用。</p>';
 }
 if(Number(b.financing_principal)||Number(b.financing_interest))html+='<div class="notice">融资厂房本季付款：本金 '+money(b.financing_principal)+' ＋ 利息 '+money(b.financing_interest)+'。真实现金和利润已计算；比赛预算的对应填报行仍待确认。</div>';
 return html;
}
const api={build,render};if(typeof module!=='undefined')module.exports=api;else g.JiyuBudget=api;
})(globalThis);
