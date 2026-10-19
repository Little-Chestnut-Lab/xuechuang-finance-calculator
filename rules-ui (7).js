(function(g){
'use strict';
const W=g.CustomWorkspace,R=g.CustomRules,$=id=>document.getElementById(id),esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),specs=R.specs();
const heads=(titles,rows)=>'<div class="table-wrap"><table><thead><tr>'+titles.map(h=>'<th>'+h+'</th>').join('')+'</tr></thead><tbody>'+rows.join('')+'</tbody></table></div>';
const row=items=>'<tr>'+items.map(x=>'<td>'+x+'</td>').join('')+'</tr>';
function field(path,label,kind){const spec=specs.find(s=>s.path===path),v=R.get(W.draft,path),rate=kind==='rate'||spec?.kind==='rate';let shown=v??'';
 if(rate)try{shown=R.percent(v);}catch(e){shown='';}
 return `<input data-rule-path="${esc(path)}" ${rate?'data-rule-percent="1"':''} type="${kind==='text'?'text':'number'}" aria-label="${esc(label||spec?.label||path)}" value="${esc(shown)}" ${kind==='text'?'':`min="0" step="${kind==='int'||spec?.kind==='int'?'1':'any'}"`} placeholder="待录入">`;
}
function group(paths){return '<div class="rule-fields">'+paths.map(path=>{const s=specs.find(x=>x.path===path);return '<label>'+esc(s.label)+(s.kind==='rate'?'（%）':'')+field(path)+'</label>';}).join('')+'</div>';}
function showMode(mode){if(mode==='calculate'&&!W.active)return;$('rulesEditor').hidden=mode!=='rules';$('calculationArea').hidden=mode!=='calculate';document.querySelectorAll('[data-work-mode]').forEach(b=>b.classList.toggle('active',b.dataset.workMode===mode));}
function download(name,obj){const url=URL.createObjectURL(new Blob([JSON.stringify(obj,null,2)],{type:'application/json;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function errors(items){$('ruleErrors').innerHTML=items.length?'<div class="error"><strong>规则尚未完整保存</strong><ul>'+items.slice(0,16).map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>'+(items.length>16?'<p>另有'+(items.length-16)+'项待补，请继续录入。</p>':'')+'</div>':'';}
function market(){let html='';for(let q=1;q<=4;q++){
 const entries=W.draft.market_orders.map((o,i)=>[o,i]).filter(([o])=>o.quarter===q);
 html+=`<div class="market-quarter"><h3>第${q}季度市场订单</h3>`+heads(['订单编号','产品','均单（套）','最高报价（元）','账期','报价占比（%）','基础单 / 广告占比',''],entries.map(([o,i])=>{
  const pre='market_orders.'+i+'.';return row([esc(o.id),`<select aria-label="${esc(o.id)}产品" data-rule-path="${pre}product"><option value="">请选择</option>`+['high','mid','low'].map(id=>`<option value="${id}" ${o.product===id?'selected':''}>${R.names[id]}</option>`).join('')+'</select>',field(pre+'mean_order',o.id+'均单','int'),field(pre+'price_ceiling',o.id+'最高报价'),field(pre+'lag',o.id+'账期','int'),field(pre+'price_weight',o.id+'报价占比','rate'),`<span data-market-preview="${i}">—</span>`,`<button class="remove" data-delete-rule="${i}">删除</button>`]);}))+(entries.length?'':'<p class="hint">本季尚未录入订单。</p>')+`<button class="text-button" data-add-rule="${q}">＋ 第${q}季度新增市场订单</button></div>`;
 }$('ruleMarket').innerHTML=html;preview();}
function preview(){document.querySelectorAll('[data-market-preview]').forEach(el=>{const o=W.draft.market_orders[Number(el.dataset.marketPreview)];try{
  if(o.mean_order===''||o.price_weight===''){el.textContent='—';return;}const Money=g.JiyuEngine.Money;el.textContent=new Money(o.mean_order).mul(o.price_weight).toString()+' / '+new Money(1).sub(o.price_weight).mul(100).toString()+'%';
 }catch(e){el.textContent='—';}});}
function render(){
 $('ruleName').innerHTML='<label>规则名称'+field('name','规则名称','text')+'</label>';
 $('ruleBasic').innerHTML=group(['initial_cash','administration.base','administration.per_owned_line_including_installation','default_penalty_rate']);
 $('ruleFactory').innerHTML=group(['factory.default_slots','factory.rent_per_quarter','factory.purchase_price','factory.purchase_depreciation_rate','factory.finance_price','factory.finance_depreciation_rate','factory.finance_term_quarters','factory.finance_interest_rate']);
 $('ruleEquipment').innerHTML=heads(['设备','购价（元）','折旧率（%）','维修费/季（元）','安装期','设备产能（套）'],W.draft.equipment.map((e,i)=>row([R.names[e.id],...['price','depreciation_rate','maintenance_per_quarter','installation_quarters','capacity'].map(k=>field(`equipment.${i}.${k}`))])));
 $('ruleWorkers').innerHTML=heads(['配套设备','工人工资/季（元）','招聘培训费/人（元）','每人工人产能（套）','培训期'],W.draft.equipment.map((e,i)=>row([R.names[e.id],...['worker_wage','worker_recruit_training_fee','worker_capacity','worker_training_quarters'].map(k=>field(`equipment.${i}.${k}`))])));
 $('ruleSales').innerHTML=heads(['销售人员','工资/季（元）','招聘费（元）','培训期'],W.draft.sales_staff.map((e,i)=>row(['销售'+e.id,...['wage','recruit_fee','training_quarters'].map(k=>field(`sales_staff.${i}.${k}`))])));
 $('ruleMaterials').innerHTML=heads(['产品','原料单价（元/套）','加工费（元/套）','付款账期'],W.draft.products.map((e,i)=>row([R.names[e.id],...['material_unit_price','processing_per_unit','material_credit_quarters'].map(k=>field(`products.${i}.${k}`))])));
 $('ruleLoans').innerHTML=group(['loans.short.rate','loans.short.term_quarters','loans.long.rate','loans.long.term_quarters','emergency_loan.rate','emergency_loan.term_quarters']);
 $('ruleDiscounts').innerHTML=group([1,2,3,4].map(n=>'discount_rates_by_remaining_quarters.'+n));
 $('ruleTaxes').innerHTML=group(['vat_rate','income_tax_rate','business_tax_rate','surcharge_rates.city','surcharge_rates.education','surcharge_rates.local_education']);
 market();$('undoRuleDraft').hidden=!W.draftBackup;$('applyRules').textContent=W.active?'应用规则变更并重算':'保存规则并开始计算';$('goCalculate').disabled=!W.active;
 $('rulesState').textContent=W.active?'正在计算：'+W.active.name+' · 第'+W.revision+'版。录入草稿不影响已保存的计算，应用后再重算。':'规则尚未保存。请先录入完整规则，再开始计算。';
 if(W.note)errors([W.note]);
}
W.onSave=(ok,note)=>{$('ruleSaveStatus').textContent=ok?'录入已保存至本机 · '+new Date().toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'}):note||'本地保存失败，请导出备份';};
document.addEventListener('input',e=>{const path=e.target.dataset.rulePath;if(!path)return;let v=e.target.value;try{if(e.target.dataset.rulePercent)v=R.percent(v,true);}catch(err){errors(['请使用普通小数填写百分比']);return;}R.set(W.draft,path,v);W.save();preview();});
document.addEventListener('change',e=>{const path=e.target.dataset.rulePath;if(!path||e.target.tagName!=='SELECT')return;R.set(W.draft,path,e.target.value);W.save();});
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
 if(b.dataset.workMode)showMode(b.dataset.workMode);
 if(b.dataset.addRule){W.addOrder(Number(b.dataset.addRule));market();}
 if(b.dataset.deleteRule!==undefined){W.draft.market_orders.splice(Number(b.dataset.deleteRule),1);W.save();market();}
});
$('applyRules').onclick=()=>{try{const issues=W.apply();errors(issues);if(!issues.length){render();showMode('calculate');window.scrollTo({top:0,behavior:'smooth'});}}catch(e){errors([e.message]);}};
$('clearRuleDraft').onclick=()=>{W.clearDraft();errors([]);render();};$('undoRuleDraft').onclick=()=>{W.undoDraft();errors([]);render();};
$('exportRules').onclick=()=>download((W.draft.name||'自定义')+'规则.json',W.rulesExport());$('importRules').onclick=()=>$('rulesFile').click();
$('rulesFile').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{W.importRules(RecordIO.parse(await f.text()));render();errors([]);}catch(err){errors(['导入失败：'+err.message]);}e.target.value='';};
$('backupAll').onclick=()=>download((W.active?.name||W.draft.name||'通用计算')+'完整备份.json',W.exportData());$('restoreAll').onclick=()=>$('workspaceFile').click();
$('workspaceFile').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{W.importData(RecordIO.parse(await f.text()));render();errors([]);showMode(W.active?'calculate':'rules');}catch(err){errors(['恢复失败：'+err.message]);}e.target.value='';};
W.onRulesImport=render;
g.CustomRulesUI={render,showMode};render();showMode(W.active?'calculate':'rules');
})(globalThis);
