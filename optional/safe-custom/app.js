(function(){
'use strict';
const clone=x=>JSON.parse(JSON.stringify(x)),templates={custom:CustomData},sessionPlans={},resetBackups={},blockedStorage=new Set();
let templateId=document.documentElement.dataset.defaultTemplate||'custom',templateData=templates[templateId],p=templateData.parameters,presets=templateData.presets;
const $=id=>document.getElementById(id),esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=x=>x===null||x===undefined?'—':Number(x).toLocaleString('zh-CN',{minimumFractionDigits:2,maximumFractionDigits:2});
const names={high:'高端',mid:'中端',low:'低端',H1:'高端1',H2:'高端2',M1:'中端1',M2:'中端2',L1:'低端1',L2:'低端2'};
let storageKey=TemplateState.keys[templateId],plan=TemplateState.newPlan(templateData),quarter=1,view='budget',budgetTab='comprehensive',result,loadNote='',constructionUndo=null,orderReordering=false;
function restoreRecord(){
 plan=CustomWorkspace.plan?clone(CustomWorkspace.plan):TemplateState.newPlan(templateData);
 if(CustomWorkspace.blocked){blockedStorage.add(storageKey);loadNote=CustomWorkspace.note;}
}
function setTemplate(id){templateId=id;templateData=templates[id];p=templateData.parameters;presets=templateData.presets;storageKey=TemplateState.keys[id];quarter=1;orderReordering=false;constructionUndo=null;loadNote='';restoreRecord();JiyuUI.ensureNames(plan);}
restoreRecord();
const eq=id=>p.equipment.find(x=>x.id===id),qp=()=>plan.quarters[quarter-1];
JiyuUI.ensureNames(plan);
const lineLabel=l=>JiyuUI.lineName(l),factoryLabel=f=>JiyuUI.factoryName(f);
const batchLabel=id=>{const l=plan.lines.find(l=>id.endsWith('-'+l.id));return l?id.slice(0,id.length-l.id.length-1)+' · '+lineLabel(l):id;};
function readableError(message){for(const l of [...plan.lines].sort((a,b)=>b.id.length-a.id.length))message=message.replaceAll(l.id,lineLabel(l));for(const f of plan.factories)message=message.replaceAll(f.id,factoryLabel(f));return message;}

const input=(path,value,type='number',extra='')=>`<input aria-label="${esc(path)}" data-path="${esc(path)}" type="${type}" value="${esc(value)}" ${type==='number'?'min="0" step="any"':''} ${extra}>`;
const select=(path,value,options)=>`<select aria-label="${esc(path)}" data-path="${esc(path)}">${options.map(([v,label])=>`<option value="${esc(v)}" ${String(v)===String(value)?'selected':''}>${esc(label)}</option>`).join('')}</select>`;
const qs=[1,2,3,4].map(q=>[q,'第'+q+'季度']);
const table=(heads,rows)=>`<div class="table-wrap"><table><thead><tr>${heads.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div>`;
const tr=xs=>'<tr>'+xs.map(x=>'<td>'+x+'</td>').join('')+'</tr>';
const valueTable=rows=>table(['项目','金额 / 比例'],rows.map(([label,value])=>`<tr><td>${esc(label)}</td><td class="num ${Number(value)<0?'negative':''}" title="完整值：${esc(value)}">${money(value)}</td></tr>`));
function toast(text){$('toast').textContent=text;$('toast').style.display='block';setTimeout(()=>$('toast').style.display='none',3500);}
function persist(){
 if(!CustomWorkspace.active)return;
 const ok=CustomWorkspace.savePlan(plan);$('saveStatus').textContent=ok?'本局已保存至本机 · '+new Date().toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'}):'保存失败，请导出完整备份';
}
function sequence(q){const held=plan.lines.filter(l=>Number(l.quarter)<=q).map(l=>l.id);return [...(plan.quarters[q-1].sequence||[]).filter(id=>held.includes(id)),...held.filter(id=>!(plan.quarters[q-1].sequence||[]).includes(id))];}
function syncSequences(){for(let q=1;q<=4;q++)if(plan.quarters[q-1].sequence)plan.quarters[q-1].sequence=sequence(q);}
function render(){
 try{plan=RecordIO.normalizePlan(plan);}catch(e){$('messages').textContent=e.message;return;}
 if(!CustomWorkspace.active){$('goCalculate').disabled=true;$('calculationArea').hidden=true;return;}
 p=TemplateState.parametersForPlan(templateData.parameters,plan);
 TemplateState.syncMarket(plan,p);
 result=JiyuEngine.calculate(p,plan);renderTemplateHeader();$('planName').value=plan.name;
 JiyuUI.ensureNames(plan);renderConstruction();
 $('quarterTabs').innerHTML=qs.map(([v,label])=>`<button data-quarter="${v}" class="${v===quarter?'active':''}">${label}</button>`).join('');
 const prefix=`quarters.${quarter-1}`,q=qp();
 $('quarterInputs').innerHTML='<div class="quarter-fields">'+[
  ['当前数据',select(prefix+'.stage',q.stage,[['预计','交单前预计'],['实际','交单后实际']])],
  ['本季小组数',input(prefix+'.group_count',q.group_count??'','number','step="1" placeholder="待录入"')],
  ['本季新增短贷',input(prefix+'.loans.short',q.loans.short)],['本季新增长贷',input(prefix+'.loans.long',q.loans.long)],
  ['本季新招销售A',input(prefix+'.sales.A',q.sales.A)],['本季新招销售B',input(prefix+'.sales.B',q.sales.B)]
 ].map(([label,html])=>`<label>${label}${html}</label>`).join('')+'</div>';
 $('production').innerHTML=table(['投产顺序','生产线 / 产品','状态 / 当季最大产能','计划产量','顺序调整'],sequence(quarter).map((id,n)=>{
  const i=plan.lines.findIndex(l=>l.id===id),l=plan.lines[i],e=eq(l.type),ready=quarter>=Number(l.quarter)+Number(e.installation_quarters),cap=ready?Math.min(Number(e.capacity),quarter>=Number(l.workerQuarter)+Number(e.worker_training_quarters||0)?Number(l.workers)*Number(e.worker_capacity):0):0;
  return tr([n+1,esc(lineLabel(l))+' / '+names[e.product],ready?'已可用 · '+cap+'套':'安装中 · 0套',input(`lines.${i}.outputs.${quarter-1}`,l.outputs[quarter-1]==='auto'?'':l.outputs[quarter-1],'number','placeholder="满产 '+cap+'"'),`<button data-move="${n}:-1" ${n===0?'disabled':''}>↑</button> <button data-move="${n}:1" ${n===sequence(quarter).length-1?'disabled':''}>↓</button>`]);
 }));
 const current=result.quarters[quarter-1];
 $('orders').innerHTML=table(['本地订单 / 产品','需求量','均单 / 基础单','账期','报价','广告','需求比例参考','提交上限','出单数量','分批交货',''],orderRows().map(({order:o,index:i})=>{
  const path=prefix+'.orders.'+i,den=q.orders.filter(x=>x.product===o.product).reduce((a,x)=>a+Number(x.demand||0),0),reference=den&&current&&o.demand!==null?(Number(o.demand)/den*Number(current.available[o.product])).toFixed(2):'—';
  return tr([`<div class="muted">${esc(o.id)}</div>`+select(path+'.product',o.product,Object.entries(names).slice(0,3)),input(path+'.demand',o.demand??''),jiyuOrderNumbers(o),select(path+'.lag',o.lag,[0,1,2,3].map(n=>[n,n+'期'])),input(path+'.price',o.price),input(path+'.ad',o.ad),reference,input(path+'.cap',o.cap??'','number','placeholder="待填"'),input(path+'.quantity',o.quantity),input(path+'.splits',o.splits,'text','placeholder="如 1,2"'),`<button class="remove" data-remove="orders:${i}">删除</button>`]);
 }));
 if(p.market_orders)renderRuleOrders();else if(p.legacy_manual)renderLegacyOrders();
 renderOrderControls();
 renderTickets();renderResults();renderParameters();
}
function orderRules(){return p.market_orders?.filter(o=>o.quarter===quarter)||[];}
function orderRows(){return JiyuUI.orderRows(qp(),orderRules());}
function renderOrderControls(){
 const rows=orderRows(),container=$('orders');
 const toolbar=document.createElement('div');toolbar.className='order-toolbar';
 toolbar.innerHTML=`<button data-order-mode="true" aria-pressed="${orderReordering}" ${rows.length<2&&!orderReordering?'disabled':''}>${orderReordering?'完成调整':'调整顺序'}</button>`+
  (orderReordering?`<button data-order-default="true" ${!Array.isArray(qp().order_display_sequence)?'disabled':''}>恢复默认顺序</button>`:'')+
  `<span class="hint">${orderReordering?'点击 ↑ ↓，按系统顺序排列当前季度订单。':'可按系统顺序排列订单；整行数据随订单保留，顺序自动保存。'}</span>`;
 container.prepend(toolbar);
 const header=container.querySelector('thead tr');
 if(orderReordering){const th=document.createElement('th');th.textContent='顺序调整';header.prepend(th);}
 container.querySelectorAll('tbody tr').forEach((row,n)=>{
  const o=rows[n].order;row.dataset.orderId=o.id;
  if(!orderReordering)return;
  const label=(names[o.product]||o.product)+' '+o.lag+'期 '+o.id,cell=document.createElement('td');cell.className='order-moves';
  cell.innerHTML=`<button data-order-move="${esc(o.id)}" data-direction="-1" aria-label="${esc(label)} 上移" ${n===0?'disabled':''}>↑</button> <button data-order-move="${esc(o.id)}" data-direction="1" aria-label="${esc(label)} 下移" ${n===rows.length-1?'disabled':''}>↓</button>`;
  row.prepend(cell);
 });
}
function jiyuOrderNumbers(o){
 if(p.legacy_manual){const groups=Number(qp().group_count),weight=o.price_weight;
  if(o.demand==null||o.demand===''||!Number.isInteger(groups)||groups<1)return '<span class="muted">— / —</span>';
  const mean=new JiyuEngine.Money(o.demand).div(groups);
  return esc(mean.toString())+' / '+(weight!=null&&weight!==''?esc(mean.mul(weight).toString()):'—');
 }
 const r=TemplateState.orderReference(JiyuOrderReferences.orders,quarter,o);
 return r?`<span title="基础单＝均单×${Number(r.price_weight)*100}%报价占比">${esc(r.mean_order)} / ${esc(new JiyuEngine.Money(r.mean_order).mul(r.price_weight).toString())}</span>`:'<span class="muted">—</span>';
}
function resetBackup(){return CustomWorkspace.planBackup;}
function renderTemplateHeader(){
 $('undoReset').hidden=!resetBackup();$('templateSelect').value='custom';$('brandTitle').textContent='通用计算';
 $('templateEyebrow').textContent=p.name+' / 本局四季度计算';document.title=p.name+' · 通用计算网页';
 $('verificationStatus').textContent='按已保存的自定义规则计算；金额保留完整精度，显示两位小数。';
 $('scenarioNote').textContent='当前使用第'+CustomWorkspace.revision+'版规则。需求量＝均单×本季小组数；建设、产量、广告、出单、贷款和贴现按对局录入。规则变更请回到规则录入页保存后重算。';
 $('preset').innerHTML='<option value="blank">按季度自定建设</option>';$('preset').value='blank';$('addOrder').hidden=true;
}
function renderRuleOrders(){
 const current=result.quarters[quarter-1],rules=p.market_orders.filter(o=>o.quarter===quarter);
 $('orders').innerHTML=table(['订单 / 产品','需求量','均单 / 基础单','账期','上限报价','广告','比例参考','提交上限','出单数量','分批交货'],orderRows().map(({order:o,index:i})=>{
  const rule=rules.find(r=>r.id===o.id);if(!rule)return tr([esc(o.id),'规则中无此订单，请检查导入文件']);
  const path=`quarters.${quarter-1}.orders.${i}`,total=rules.filter(r=>r.product===o.product).reduce((n,r)=>n+Number(r.mean_order),0),reference=current?(Number(rule.mean_order)/total*Number(current.available[o.product])).toFixed(2):'—';
  return tr([names[o.product]+`<small>${esc(o.id)}</small>`,o.demand===null?'待填小组数':esc(o.demand),esc(rule.mean_order)+' / '+esc(new JiyuEngine.Money(rule.mean_order).mul(rule.price_weight).toString()),rule.lag+'期',money(rule.price_ceiling),input(path+'.ad',o.ad),reference,input(path+'.cap',o.cap??'','number','placeholder="待填"'),input(path+'.quantity',o.quantity),input(path+'.splits',o.splits,'text','placeholder="如 200,300"')]);
 }));
}
function renderLegacyOrders(){
 const prefix=`quarters.${quarter-1}`,q=qp();
 $('orders').innerHTML=table(['历史订单 / 产品','需求量','均单 / 基础单','报价占比（0–1）','账期','原记录报价','广告','提交上限','出单数量','分批交货',''],orderRows().map(({order:o,index:i})=>{
  const path=prefix+'.orders.'+i;
  return tr([`<div class="muted">${esc(o.id)}</div>`+select(path+'.product',o.product,Object.entries(names).slice(0,3)),input(path+'.demand',o.demand??''),jiyuOrderNumbers(o),input(path+'.price_weight',o.price_weight??'','number','max="1"'),select(path+'.lag',o.lag,[['','选择账期'],...[0,1,2,3,4].map(n=>[n,n+'期'])]),input(path+'.price',o.price),input(path+'.ad',o.ad),input(path+'.cap',o.cap??''),input(path+'.quantity',o.quantity),input(path+'.splits',o.splits,'text'),`<button class="remove" data-remove="orders:${i}">删除</button>`]);
 }));
}
function constructionText(model,q){
 const fs=model.factories.filter(f=>Number(f.quarter)===q),ls=model.lines.filter(l=>Number(l.quarter)===q),mode={finance:'融资取得',rent:'租入',purchase:'购买'};
 const groups={};for(const l of ls)groups[l.type]=(groups[l.type]||0)+1;
 const factories=fs.length?fs.map(f=>mode[f.mode]+'厂房1间').join('，'):'不新增厂房';
 const lines=ls.length?Object.entries(groups).map(([type,n])=>names[type]+'×'+n).join('、'):'不新增产线';
 return {factories,lines};
}
function renderConstructionPreview(){
 const selected=presets[$('preset').value];$('constructionPreview').innerHTML=[1,2,3,4].map(q=>{const t=constructionText(selected,q);return `<div>第${q}季度：${esc(t.factories)}；${esc(t.lines)}</div>`;}).join('');
}
function renderConstruction(){
 $('activeQuarter').textContent='当前：第'+quarter+'季度';$('assetsTitle').textContent='第'+quarter+'季度 · 厂房与生产线';$('operationTitle').textContent='第'+quarter+'季度 · 经营数据';
 $('constructionTimeline').innerHTML=[1,2,3,4].map(q=>{const t=constructionText(plan,q);return `<button class="quarter-card ${q===quarter?'active':''}" data-quarter="${q}"><strong>第${q}季度</strong><span>${esc(t.factories)}</span><b>${esc(t.lines)}</b><small>${q===quarter?'正在编辑':'查看本季安排 →'}</small></button>`;}).join('');
 $('undoConstruction').hidden=!constructionUndo;renderConstructionPreview();
 $('factories').innerHTML=table(['厂房','本季状态','取得方式','产线容量','安排调整'],plan.factories.flatMap((f,i)=>{
  if(Number(f.quarter)>quarter)return [];const fresh=Number(f.quarter)===quarter;
  return [tr([esc(factoryLabel(f)),fresh?'<span class="new-tag">本季新增</span>':'前季持有 · 第'+f.quarter+'季度取得',fresh?select(`factories.${i}.mode`,f.mode,[['finance','融资取得'],['rent','经营租赁'],['purchase','直接购买']]):{finance:'融资取得',rent:'经营租赁',purchase:'直接购买'}[f.mode],fresh?input(`factories.${i}.slots`,f.slots):f.slots,fresh?select(`factories.${i}.quarter`,f.quarter,qs)+` <button class="remove" data-remove="factories:${i}">删除</button>`:`<button data-quarter="${f.quarter}">回到取得季度修改</button>`])];
 }));
 const mixed=plan.factories.flatMap((f,i)=>{
  if(f.mode!=='rent'||Number(f.quarter)>quarter)return [];
  const held=plan.lines.filter(l=>l.factory===f.id&&Number(l.quarter)<=quarter),installing=held.filter(l=>quarter<Number(l.quarter)+Number(eq(l.type).installation_quarters));
  if(!installing.length||installing.length===held.length)return [];
  return [tr([esc(factoryLabel(f)),'全部租金由投产线承担；安装线不分摊'])];
 });
 if(mixed.length)$('factories').innerHTML+='<div class="hint"><strong>本季租赁厂房租金分摊（当前口径）</strong><p>投产线承担全部租金，安装线不分摊。先按投产线数量均分，再按各线实际产量计算单位成本。</p>'+table(['厂房','本季租金规则'],mixed)+'</div>';
 $('lines').innerHTML=table(['生产线','本季状态','设备类型','所属厂房','建设调整'],plan.lines.flatMap((l,i)=>{
  if(Number(l.quarter)>quarter)return [];const fresh=Number(l.quarter)===quarter;
  return [tr([esc(lineLabel(l)),fresh?'<span class="new-tag">本季新增</span>':'前季持有 · 第'+l.quarter+'季度购入',fresh?select(`lines.${i}.type`,l.type,p.equipment.map(e=>[e.id,names[e.id]])):names[l.type],fresh?select(`lines.${i}.factory`,l.factory,[['','选择厂房'],...plan.factories.filter(f=>Number(f.quarter)<=quarter).map(f=>[f.id,factoryLabel(f)])]):esc(plan.factories.find(f=>f.id===l.factory)?factoryLabel(plan.factories.find(f=>f.id===l.factory)):'所属厂房已删除'),fresh?select(`lines.${i}.quarter`,l.quarter,qs)+` <button class="remove" data-remove="lines:${i}">删除</button>`:`<button data-quarter="${l.quarter}">回到购入季度修改</button>`])];
 }));
 $('workers').innerHTML=table(['配套生产线','招聘季度','配套工人数','本季招聘状态'],plan.lines.flatMap((l,i)=>Number(l.quarter)>quarter?[]:[tr([esc(lineLabel(l)),select(`lines.${i}.workerQuarter`,l.workerQuarter,qs),input(`lines.${i}.workers`,l.workers),Number(l.workerQuarter)===quarter?'本季招聘':Number(l.workerQuarter)<quarter?'前季已招聘':'尚未招聘'])]));
}
function renderTickets(){
 $('ticketQuarter').textContent='第'+quarter+'季度';
 const preview=clone(plan);preview.quarters[quarter-1].discounts=[];
 const r=JiyuEngine.calculate(p,preview).quarters[quarter-1];
 let html='';
 if(qp().discounts.length){html+='<h3>已选择的贴现</h3>'+table(['票据编号','阶段',''],qp().discounts.map((d,i)=>tr([esc(d.note),d.phase==='before'?'交单前':'交单后',`<button data-remove="discounts:${i}" class="remove">取消贴现</button>`])));}
 if(!r){html+='<div class="warning">请先处理本季或前季的方案错误，才能列出有效票据。已选择的贴现仍可取消。</div>';$('discounts').innerHTML=html;return;}
 const notes=r.eligible_after;
 html+=notes.length?table(['票据 / 产品','生成 → 到期','整张面额','剩余账期','贴现费用','净到账','选择'],notes.map(n=>{
  const remain=n.due-quarter,rate=p.discount_rates_by_remaining_quarters[String(remain)],fee=Number(n.face)*Number(rate),chosen=qp().discounts.find(d=>d.note===n.id),path=`discount:${n.id}`;
  const opts=[['','不贴现'],...(n.created<quarter?[['before','交单前贴现']]:[]),['after','交单后贴现']];
  return tr([esc(n.id)+'<div class="muted">'+names[n.product]+' · '+n.quantity+'套</div>',`Q${n.created} → Q${n.due}`,money(n.face),remain+'期 · '+Number(rate)*100+'%',money(fee),money(Number(n.face)-fee),select(path,chosen?.phase||'',opts)]);
 })):'<div class="empty">本季暂无可贴现票据。零账期交货直接收款。</div>';
 $('discounts').innerHTML=html;
}
function renderResults(){
 let notes=result.errors.map(e=>`<div class="error"><strong>${e.quarter?'Q'+e.quarter:'方案'} 暂不能完成计算</strong>　${esc(readableError(e.message))}。后续季度未生成结果。</div>`).join('');
 const warnings=result.warnings.filter(w=>w.quarter===quarter);notes+=warnings.map(w=>`<div class="${w.code==='negative_cash'?'error':'warning'}">${esc(w.message)}</div>`).join('');
 const otherErrors=result.warnings.filter(w=>w.quarter!==quarter&&w.code==='negative_cash');
 if(otherErrors.length)notes+='<div class="error">其他季度现金提示：'+otherErrors.map(w=>w.quarter===4?'Q4末或第五季初':'Q'+w.quarter).join('、')+'出现负现金，请切换查看。</div>';
 const earlierProvisional=result.warnings.filter(w=>w.quarter<quarter&&(['vat_credit','tax_later_loss'].includes(w.code)));
 if(earlierProvisional.length)notes+='<div class="warning">本季结转数据包含前季的待确认规则，结果仍属试算：'+[...new Set(earlierProvisional.map(w=>'Q'+w.quarter+' '+w.message))].map(esc).join('；')+'</div>';
 if(loadNote)notes+='<div class="warning">'+esc(loadNote)+'</div>';
 $('messages').innerHTML=notes;
 $('overview').innerHTML=table(['季度','产量 高 / 中 / 低','销售收入','营业成本','净利润','期末现金','下季初现金（Q4→Q5）'],[1,2,3,4].map(q=>{
  const r=result.quarters[q-1];
  const cells=r?`<td>${['high','mid','low'].map(id=>r.production[id]).join(' / ')}</td>`+['revenue','cost_of_sales','net_profit','ending_cash','next_opening_cash'].map(k=>`<td class="num ${Number(r[k])<0?'negative':''}" title="${esc(r[k])}">${money(r[k])}</td>`).join(''):'<td colspan="6" class="muted">上方方案问题解决后，自动生成结果</td>';
  return `<tr class="${quarter===q?'selected':''}"><td><button data-quarter="${q}">Q${q} · ${esc(plan.quarters[q-1].stage)}</button></td>${cells}</tr>`;
 }));
 const r=result.quarters[quarter-1];$('snapshot').disabled=!r;
 if(!r){$('metrics').innerHTML='';$('details').innerHTML='<div class="empty">本季度尚无有效结果，请根据提示调整方案。</div>';$('snapshotDiff').innerHTML='';return;}
 $('metrics').innerHTML=[['本季可售量',Number(r.available.high)+Number(r.available.mid)+Number(r.available.low),'期初库存＋当季产量'],['本季净利润',r.net_profit,'已计成本、费用和所得税'],['季度末现金',r.ending_cash,'交货与全部期末付款后'],['两表回款填报额',r.budget.receivable,'到期回款＋本季全部贴现面额']].map(([label,val,hint])=>`<div class="metric"><label>${label}</label><strong class="${Number(val)<0?'negative':''}" title="完整值：${esc(val)}">${money(val)}</strong><small>${hint}</small></div>`).join('');
 const snaps=plan.snapshots?.[quarter]||[],last=snaps[snaps.length-1];
 $('snapshotDiff').innerHTML=last?`<details><summary>本季有 ${snaps.length} 份预算快照 · 最近保存 ${esc(last.time)} · 当时规则第${esc(last.rule_revision??'—')}版 · 展开比较</summary>`+table(['项目','最近快照','当前计算','变化'],[['回款填报额','receivable'],['贴现利息','discount_interest'],['所得税','income_tax'],['增值税','vat']].map(([label,key])=>tr([label,money(last.budget[key]),money(r.budget[key]),money(Number(r.budget[key])-Number(last.budget[key]))])))+'</details>':'<p class="hint">交单前可以保存预算快照；以后修改实际分单和贴现，不会改掉已保存的记录。</p>';
 document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===view));
 const b=r.budget;
 if(view==='budget'){
  $('details').innerHTML=JiyuBudget.render(p,plan,r,{esc,money,table,tr},budgetTab);
 }else if(view==='profit'){
  $('details').innerHTML='<div class="two-col"><div><h3>利润表</h3>'+valueTable([['营业收入',r.revenue],['营业成本',r.cost_of_sales],['营业税金及附加',r.surcharge],['销售费用',r.selling],['管理费用',r.management],['财务费用',r.finance],['利润总额',r.profit],['所得税',r.income_tax],['净利润',r.net_profit]])+'<h3>管理费用构成</h3>'+valueTable([['行政管理费',r.management_parts.administration],['工人招聘培训费',r.management_parts.worker_training],['销售招聘培训费',r.management_parts.sales_training],['安装期工人工资',r.management_parts.idle_worker_wage],['安装线或整间安装期厂房租金',r.management_parts.idle_factory_rent]])+'</div><div><h3>增值税及附加税申报参考</h3>'+valueTable([['销项税额',r.output_vat],['进项税额',r.input_vat],['上期留抵',r.vat_credit_open],['应抵扣税额合计',Number(r.input_vat)+Number(r.vat_credit_open)],['实际抵扣税额',Math.min(Number(r.output_vat),Number(r.input_vat)+Number(r.vat_credit_open))],['应纳增值税',r.vat],['期末留抵',r.vat_credit_close],['城建税',b.city_tax],['教育费附加',b.education_tax],['地方教育费附加',b.local_education_tax]])+'<h3>所得税申报参考</h3>'+valueTable([['营业收入',r.revenue],['营业成本',r.cost_of_sales],['利润总额',r.profit],['税率',p.income_tax_rate],['期初未弥补亏损',r.tax_loss_open],['期末未弥补亏损',r.tax_loss_close],['应纳所得税',r.income_tax]])+'</div></div>';
 }else if(view==='cash'){
  $('details').innerHTML='<div class="two-col"><div><h3>实际现金链</h3>'+valueTable([['期初现金（季初结算后）',r.opening_cash],['操作顺序估算：交单前',r.before_delivery_cash],['交货及交单后贴现之后',r.after_delivery_cash],['期末付款之后',r.ending_cash],[quarter===4?'第五季初现金（最终结算后）':'下季初现金',r.next_opening_cash]])+'<p class="hint">交单前按借款、购置、招聘、采购、广告及交单前贴现完成后估算。真实操作可交错，中途现金不是系统自动紧急贷款结论。</p><h3>'+(quarter===4?'第五季初最终结算明细':'下季初结算明细')+'</h3>'+valueTable([['尚未贴现的到期票据',r.next_receivables],['到期应付账款',r.next_payables],['到期贷款本金合计',r.next_loan_principal],['其中：到期短期贷款本金',r.next_short_loan_principal],['其中：到期长期贷款本金',r.next_long_loan_principal],['本季税费（次季初支付）',r.next_taxes],['结算资金缺口（未计紧急贷款）',r.next_cash_shortfall]])+(quarter===4?'<p class="hint">第五季初是最终成绩前的现金结算点：第四季末现金＋到期未贴现应收－到期应付－到期贷款本金－第四季度税费。负数表示结算资金缺口和紧急贷款风险，应在第四季度结束前调整资金安排；到期贷款仅还本金，已在借入时扣除的利息不重复计算。</p>':'')+'</div><div><h3>本季贴现流水</h3>'+table(['票据','面额','费用','净到账'],r.discount_events.map(e=>tr([esc(e.note),money(e.face),money(e.fee),money(e.net)])))+'<h3>票据台账</h3>'+table(['票据','到期','面额','状态'],r.notes.map(n=>tr([esc(n.id),'Q'+n.due,money(n.face),n.discounted?'Q'+n.discountQuarter+'已贴现':n.paid?'已到期收回':'未到期'])))+'<h3>采购应付</h3>'+table(['产品 / 购入','到期','含税金额'],r.payables.map(n=>tr([names[n.product]+' / Q'+n.created,'Q'+n.due,money(n.amount)])))+'</div></div>';
 }else{
  $('details').innerHTML='<h3>本季生产批次</h3>'+table(['批次 / 产品','产量','材料/套','加工/套','人工/套','设备折旧/套','维修/套','厂房分摊/套','单位成本'],r.new_batches.map(b=>tr([esc(batchLabel(b.id))+' / '+names[b.product],b.produced,...['material','processing','worker','depreciation','maintenance'].map(k=>`<span title="${esc(b.parts[k])}">${money(b.parts[k])}</span>`),money(Number(b.parts.factory_depreciation)+Number(b.parts.factory_rent)),`<strong title="${esc(b.unit_cost)}">${money(b.unit_cost)}</strong>`])))+'<div class="two-col"><div><h3>FIFO销售成本结转</h3>'+table(['订单','来源批次','数量','成本'],r.fifo.map(f=>tr([esc(f.order),esc(batchLabel(f.batch)),f.quantity,money(f.cost)])))+'</div><div><h3>期末库存批次</h3>'+table(['批次','剩余数量','单位成本'],r.ending_batches.map(b=>tr([esc(batchLabel(b.id)),b.remaining,money(b.unit_cost)])))+'<p class="hint">期末库存成本：'+money(r.ending_inventory_cost)+'。Q1—Q3按批次滚入下一季度。</p></div></div>';
 }
 if(r.rent_allocations?.some(a=>a.mixed))$('details').innerHTML+='<h3>本季租金分摊（当前口径）</h3>'+table(['厂房','本季租金','计入生产成本','计入管理费用'],r.rent_allocations.map(a=>tr([esc(factoryLabel(plan.factories.find(f=>f.id===a.factory))),money(a.total),money(a.production),money(a.management)])));

}
function renderParameters(){
 const pct=x=>Number(x)*100+'%';
 $('parameters').innerHTML='<details><summary>查看'+esc(p.name)+'固定参数（金额单位：元）</summary>'+table(['设备','购价','每季折旧','维修','产能','工人工资','招聘培训','设备安装 / 人员培训'],p.equipment.map(e=>tr([names[e.id],money(e.price),money(new JiyuEngine.Money(e.price).mul(e.depreciation_rate).toString()),money(e.maintenance_per_quarter),e.capacity,money(e.worker_wage),money(e.worker_recruit_training_fee),e.installation_quarters+' / '+(e.worker_training_quarters??'未单列')])))+'<div class="two-col"><div>'+valueTable([['初始现金',p.initial_cash],['每间厂房产线容量',p.factory.default_slots],['厂房购买/融资价',p.factory.purchase_price],['厂房租金/季',p.factory.rent_per_quarter],['融资期数',p.factory.finance_term_quarters],['融资利率/季（按原值）',p.factory.finance_interest_rate],['行政管理费基础额',p.administration.base],['每条持有产线管理费',p.administration.per_owned_line_including_installation],['增值税率',p.vat_rate],['所得税率',p.income_tax_rate]])+'</div><div>'+table(['产品','材料/套','加工/套','材料账期'],p.products.map(x=>tr([names[x.id],money(x.material_unit_price),money(x.processing_per_unit),x.material_credit_quarters])))+'<p class="hint">借入时一次扣息：短贷'+pct(p.loans.short.rate)+'，'+p.loans.short.term_quarters+'期到期；长贷'+pct(p.loans.long.rate)+'，'+p.loans.long.term_quarters+'期到期。贴现费率：'+Object.entries(p.discount_rates_by_remaining_quarters).map(([n,r])=>'剩余'+n+'期 '+pct(r)).join('；')+'。</p>'+table(['销售人员','工资/季','招聘费','培训期'],p.sales_staff.map(x=>tr([x.id,money(x.wage),money(x.recruit_fee),x.training_quarters??'未单列'])))+'<p class="hint">购买与融资厂房均从取得下一季度开始折旧，适用于所有模板。新线购入当季免维修、免折旧。招聘当季开始支付工资；人员培训与设备安装共同限制可投产能力。延迟招聘导致设备已可用但零产出时，闲置费用归属仍需核对。</p>'+(p.emergency_loan?'<p class="hint">规则列示紧急贷款利率'+pct(p.emergency_loan.rate)+'、还款期'+p.emergency_loan.term_quarters+'期；当前计算器检查资金缺口及风险，不自动借入。</p>':'')+(p.loan_limit_reference?'<p class="hint">短贷同期上限参考：'+money(p.loan_limit_reference.short_same_period_max)+'元；长贷授信参考：权益×'+pct(p.loan_limit_reference.long_equity_ratio)+'。实际可借额度以比赛系统为准。</p>':'')+'</div></div></details>';
}
function download(name,obj){const url=URL.createObjectURL(new Blob([JSON.stringify(obj,null,2)],{type:'application/json;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
document.addEventListener('change',e=>{
 const path=e.target.dataset.path;if(!path)return;
 if(path.startsWith('discount:')){
  const note=path.slice(9);qp().discounts=qp().discounts.filter(d=>d.note!==note);if(e.target.value)qp().discounts.push({note,phase:e.target.value});
 }else{
  const parts=path.split('.');let obj=plan;for(const key of parts.slice(0,-1))obj=obj[key];const key=parts.at(-1),old=obj[key];
  let val=e.target.value;if(key==='cap'||key==='demand')val=val===''?null:val;
  if(parts.includes('outputs')&&val==='')val='auto';
  // 数字框失焦会再次派发 change；值未改变时不重建其父节点。
  if(String(old)===String(val))return;
  obj[key]=val;
  if(templateId==='jiyu_b'&&parts[0]==='quarters'&&key==='group_count')TemplateState.syncReferenceDemand(plan,JiyuOrderReferences.orders,obj);
  if(parts.includes('orders')&&key==='quantity'&&(!obj.splits||!String(obj.splits).match(/[,，\s]/)))obj.splits=val;
  if(parts.includes('orders')&&key==='product')obj.price=p.products.find(x=>x.id===val).price_ceiling;
  if(parts[0]==='lines'&&key==='quarter'&&String(obj.workerQuarter)===String(old))obj.workerQuarter=val;
  syncSequences();
 }
 persist();render();
});
document.addEventListener('click',e=>{
 const el=e.target.closest('button');if(!el)return;
 if(el.dataset.orderMode){orderReordering=!orderReordering;render();$('orders').querySelector('[data-order-mode]').focus({preventScroll:true});return;}
 if(el.dataset.orderDefault){delete qp().order_display_sequence;persist();render();$('orders').querySelector('[data-order-mode]').focus({preventScroll:true});return;}
 if(el.dataset.orderMove){
  if(!orderReordering||!JiyuUI.moveOrder(qp(),el.dataset.orderMove,Number(el.dataset.direction),orderRules()))return;
  const id=el.dataset.orderMove,direction=el.dataset.direction;persist();render();
  const buttons=[...$('orders').querySelectorAll('[data-order-move]')].filter(b=>b.dataset.orderMove===id);
  (buttons.find(b=>b.dataset.direction===direction&&!b.disabled)||buttons.find(b=>!b.disabled)||$('orders').querySelector('[data-order-mode]')).focus({preventScroll:true});return;
 }

 if(el.dataset.quarter){quarter=Number(el.dataset.quarter);orderReordering=false;render();return;}
 if(el.dataset.budgetTab){budgetTab=el.dataset.budgetTab;renderResults();return;}
 if(el.dataset.view){view=el.dataset.view;renderResults();return;}
 if(el.dataset.remove){const [what,idx]=el.dataset.remove.split(':');if(['orders','discounts'].includes(what))qp()[what].splice(Number(idx),1);else plan[what].splice(Number(idx),1);syncSequences();persist();render();}
 if(el.dataset.move){const [i,d]=el.dataset.move.split(':').map(Number),seq=sequence(quarter);[seq[i],seq[i+d]]=[seq[i+d],seq[i]];qp().sequence=seq;persist();render();}
});
$('resetPlan').onclick=()=>{
 if(blockedStorage.has(storageKey)){toast('原记录读取失败，已保护原数据；请先导入导出文件。');return;}
 const backup={schema:1,template:templateId,plan:clone(plan)};resetBackups[templateId]=backup;
 CustomWorkspace.backupPlan(backup);
 plan=TemplateState.blankPlan(templateData,templateId==='jiyu_b'?JiyuOrderReferences.orders:[]);
 quarter=1;orderReordering=false;view='budget';budgetTab='comprehensive';constructionUndo=null;JiyuUI.ensureNames(plan);persist();render();toast('已重置当前模板，开始新的一局；可撤销本次重置。');
};
$('undoReset').onclick=()=>{
 const backup=resetBackup();if(!backup)return;plan=clone(backup.plan);resetBackups[templateId]=null;
 CustomWorkspace.clearPlanBackup();
 quarter=1;orderReordering=false;constructionUndo=null;JiyuUI.ensureNames(plan);persist();render();toast('已恢复重置前的本局数据及预算快照。');
};
$('planName').onchange=()=>{plan.name=$('planName').value;persist();};
$('addFactory').onclick=()=>{let n=1;while(plan.factories.some(f=>f.id==='F'+n))n++;plan.factories.push({id:'F'+n,quarter,mode:'finance',slots:p.factory.default_slots});persist();render();};
$('addLine').onclick=()=>{let n=1;while(plan.lines.some(l=>l.id==='生产线'+n))n++;const factory=plan.factories.find(f=>Number(f.quarter)<=quarter&&plan.lines.filter(l=>l.factory===f.id).length<f.slots);plan.lines.push({id:'生产线'+n,type:'L1',quarter,workerQuarter:quarter,workers:1,factory:factory?.id||'',outputs:['auto','auto','auto','auto']});syncSequences();persist();render();};
$('addOrder').onclick=()=>{let n=1;const existing=plan.quarters.flatMap(q=>q.orders).map(o=>o.id);while(existing.includes('Q'+quarter+'-新单'+n))n++;qp().orders.push({id:'Q'+quarter+'-新单'+n,product:'low',demand:null,lag:p.legacy_manual?'':1,price:p.products.find(x=>x.id==='low').price_ceiling??'',ad:0,quantity:0,cap:null,splits:''});persist();render();};
$('loadPreset').onclick=()=>{constructionUndo=clone(plan);plan=JiyuUI.applyConstruction(plan,presets[$('preset').value]);persist();render();toast('建设安排已更新，本局经营数据和预算快照保留。');};
$('undoConstruction').onclick=()=>{if(!constructionUndo)return;const current=plan;plan={...current,factories:clone(constructionUndo.factories),lines:constructionUndo.lines.map(l=>{const now=current.lines.find(x=>x.id===l.id);return {...clone(l),...(now?{outputs:clone(now.outputs),workers:now.workers,workerQuarter:now.workerQuarter}:{})};}),nextLineNumber:Math.max(current.nextLineNumber||1,constructionUndo.nextLineNumber||1),nextFactoryNumber:Math.max(current.nextFactoryNumber||1,constructionUndo.nextFactoryNumber||1)};syncSequences();constructionUndo=null;persist();render();toast('已恢复原建设安排，经营数据保留。');};
$('preset').onchange=()=>renderConstructionPreview();
$('export').onclick=()=>download(p.name+'完整记录_'+plan.name+'.json',CustomWorkspace.exportData(plan));
$('exportResults').onclick=()=>download(p.name+'计算明细.json',{template:templateId,parameters:p,plan,result,source:templateData.source});
$('import').onclick=()=>$('file').click();
$('exportImportBackup').onclick=()=>{try{const raw=localStorage.getItem(CustomWorkspace.key+'-before-import');if(!raw||raw==='null')throw Error('没有导入前备份');download('导入前完整备份.json',RecordIO.parse(raw));}catch(e){toast(e.message);}};
$('file').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{CustomWorkspace.importData(RecordIO.parse(await f.text()));CustomRulesUI.render();CustomRulesUI.showMode(CustomWorkspace.active?'calculate':'rules');toast('完整规则与本局记录已恢复');}catch(err){toast('导入失败：'+err.message);}e.target.value='';};
$('snapshot').onclick=()=>{const r=result.quarters[quarter-1];if(!r)return;plan.snapshots||={};plan.snapshots[quarter]||=[];plan.snapshots[quarter].push({time:new Date().toLocaleString('zh-CN'),budget:clone(r.budget),stage:qp().stage,inputs:clone({...plan,snapshots:undefined}),warnings:clone(result.warnings.filter(w=>w.quarter<=quarter))});const snap=plan.snapshots[quarter].at(-1);snap.parameters=clone(p);snap.rule_revision=CustomWorkspace.revision;persist();renderResults();toast('预算快照已保存，同时保留当时的规则。');};
$('templateSelect').onchange=()=>{return;const id=$('templateSelect').value;if(id===templateId)return;persist();setTemplate(id);render();persist();toast('已切换到'+p.name+'，本局记录分别保存。');};
CustomWorkspace.onApply=()=>{
 templateData=CustomWorkspace.data();templates.custom=templateData;p=templateData.parameters;presets=templateData.presets;
 plan=CustomWorkspace.plan?clone(CustomWorkspace.plan):TemplateState.newPlan(templateData);quarter=1;orderReordering=false;constructionUndo=null;loadNote='';blockedStorage.clear();
 JiyuUI.ensureNames(plan);render();persist();CustomRulesUI.render();CustomRulesUI.showMode(CustomWorkspace.active?'calculate':'rules');
};
render();
})();
