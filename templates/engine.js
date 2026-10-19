/* 纯计算：模板参数 + 可变方案 -> 四季度账本。无界面、无工作簿单元格依赖。 */
(function(g){
'use strict';
const gcd=(a,b)=>{a=a<0n?-a:a;while(b){const t=a%b;a=b;b=t;}return a||1n;};
class Money {
 constructor(n=0,d){
  if(n instanceof Money){this.n=n.n;this.d=n.d;return;}
  if(d===undefined){
   const s=String(n); if(!/^-?\d+(\.\d+)?$/.test(s))throw Error('金额必须为普通十进制数字：'+s);
   const [i,f='']=s.split('.');d=10n**BigInt(f.length);n=BigInt(i+f);
  }
  n=BigInt(n);d=BigInt(d);if(!d)throw Error('除数为零');if(d<0n){n=-n;d=-d;}
  const k=gcd(n,d);this.n=n/k;this.d=d/k;
 }
 add(x){x=M(x);return new Money(this.n*x.d+x.n*this.d,this.d*x.d);}
 sub(x){return this.add(M(x).neg());} neg(){return new Money(-this.n,this.d);}
 mul(x){x=M(x);return new Money(this.n*x.n,this.d*x.d);}
 div(x){x=M(x);return new Money(this.n*x.d,this.d*x.n);}
 cmp(x){x=M(x);const a=this.n*x.d-x.n*this.d;return a<0n?-1:a>0n?1:0;}
 toString(){
  const a=this.n<0n?-this.n:this.n, i=a/this.d;let rem=a%this.d, frac='';
  for(let k=0;rem&&k<18;k++){rem*=10n;frac+=String(rem/this.d);rem%=this.d;}
  return (this.n<0n?'-':'')+i+(frac?'.'+frac:'');
 }
 toJSON(){return this.toString();}
}
const M=x=>new Money(x), sum=xs=>xs.reduce((a,b)=>a.add(b),M(0)), max=(a,b)=>M(a).cmp(b)>=0?M(a):M(b);
const plain=x=>JSON.parse(JSON.stringify(x));
const check=(v,msg)=>{if(!v)throw Error(msg);};
const integer=(v,name,min=0,maxv=1000000)=>{check(v!==''&&v!==null&&v!==undefined, name+'不能为空');const n=Number(v);check(Number.isInteger(n)&&n>=min&&n<=maxv,name+'必须是'+min+'至'+maxv+'的整数');return n;};
const amount=(v,name)=>{const x=M(v);check(x.cmp(0)>=0,name+'不能为负');return x;};
function openingEmergency(p,config={}){
 const principal=amount(config.principal||0,'季初紧急贷款本金'),timing=config.interest_timing||'upfront';
 check(['upfront','due'].includes(timing),'紧急贷款扣息时点无效');
 if(principal.cmp(0)===0)return {principal,interest:M(0),paid_interest:M(0),net:M(0),timing};
 check(p.emergency_loan&&p.emergency_loan.rate!==undefined,'缺少紧急贷款规则');
 integer(p.emergency_loan.term_quarters,'紧急贷款期限',1,100);
 const rate=amount(p.emergency_loan.rate,'紧急贷款利率');check(rate.cmp(1)<0,'紧急贷款利率必须小于100%');
 const interest=principal.mul(rate),paid_interest=timing==='upfront'?interest:M(0);
 return {principal,interest,paid_interest,net:principal.sub(paid_interest),timing};
}
function emergencyPrincipalForShortfall(p,opening,timing='upfront'){
 const gap=max(M(opening).neg(),0);if(gap.cmp(0)===0)return '0';
 check(p.emergency_loan,'缺少紧急贷款规则');
 const rate=amount(p.emergency_loan.rate,'紧急贷款利率');check(rate.cmp(1)<0,'紧急贷款利率必须小于100%');
 check(['upfront','due'].includes(timing),'紧急贷款扣息时点无效');
 const value=timing==='upfront'?gap.div(M(1).sub(rate)):gap;
 // 按分向上取整，避免补足后仍留有负数。
 return new Money((value.n*100n+value.d-1n)/value.d,100n).toString();
}
function calculate(p, plan){
 const result={quarters:[],errors:[],warnings:[]};
 let q=0;
 const warn=(code,message)=>{if(!result.warnings.some(x=>x.quarter===q&&x.code===code))result.warnings.push({quarter:q,code,message});};
 try{
  const inputBoundary=typeof module!=='undefined'?require('./record-io.js'):g.RecordIO;
  plan=inputBoundary.normalizePlan(plan);
  check(p&&Array.isArray(p.equipment)&&Array.isArray(p.products),'缺少模板参数');
  check(plan&&Array.isArray(plan.factories)&&Array.isArray(plan.lines)&&Array.isArray(plan.quarters)&&plan.quarters.length===4,'方案必须包含厂房、生产线及四季度数据');
  const state=typeof module!=='undefined'?require('./template-state.js'):g.TemplateState;
  if(state?.parametersForPlan)p=state.parametersForPlan(p,plan);
  const eq=Object.fromEntries(p.equipment.map(x=>[x.id,x]));
  const products=Object.fromEntries(p.products.map(x=>[x.id,x])), ps=Object.keys(products);
  const unique=(xs,label)=>{const ids=new Set();for(const x of xs){check(typeof x.id==='string'&&x.id.trim(),label+'缺少编号');check(!ids.has(x.id),label+'编号重复：'+x.id);ids.add(x.id);}};
  unique(plan.factories,'厂房');unique(plan.lines,'生产线');
  const fs=Object.fromEntries(plan.factories.map(f=>[f.id,f]));
  for(const f of plan.factories){integer(f.quarter,'厂房购入季度',1,4);integer(f.slots,'厂房容量',1,100);check(['finance','rent','purchase'].includes(f.mode),'未知厂房取得方式');}
  for(const l of plan.lines){
   integer(l.quarter,'购线季度',1,4);integer(l.workerQuarter,'工人招聘季度',1,4);integer(l.workers,'工人数',0,100);
   check(eq[l.type],'未知设备类型：'+l.type);check(fs[l.factory],'生产线 '+l.id+' 没有有效厂房');
   check(fs[l.factory].quarter<=l.quarter,'生产线不能早于所属厂房取得');check(l.workerQuarter>=l.quarter,'当前模型工人需在购线当季或以后招聘');
   check(Array.isArray(l.outputs)&&l.outputs.length===4,l.id+'缺少四季度产量');
  }
  for(const f of plan.factories)check(plan.lines.filter(l=>l.factory===f.id).length<=f.slots,'厂房 '+f.id+' 的生产线超过容量');
  const allOrders=plan.quarters.flatMap(x=>x.orders||[]);unique(allOrders,'订单');
  let batches=[],notes=[],payables=[],loans=[],cash=M(p.initial_cash),loss=M(0),vatCredit=M(0),taxPaidBefore=M(0);
  let staff=Object.fromEntries(p.sales_staff.map(x=>[x.id,0]));
  for(q=1;q<=4;q++){
   const qp=plan.quarters[q-1];check(Number(qp.quarter)===q,'季度排列错误');
   check(['预计','实际'].includes(qp.stage),'数据阶段必须是预计或实际');
   check(Array.isArray(qp.orders)&&Array.isArray(qp.discounts),'缺少订单或贴现清单');
   const matured=sum(notes.filter(n=>n.due===q&&!n.discounted).map(n=>n.face));
   for(const n of notes)if(n.due===q&&!n.discounted)n.paid=true;
   const payableCurrent=sum(payables.filter(x=>x.due===q).map(x=>x.amount));
   const principalCurrent=sum(loans.filter(x=>x.due===q).map(x=>x.principal));
   const emergencyDueInterest=sum(loans.filter(x=>x.due===q&&x.type==='emergency').map(x=>x.deferred_interest||0));
   if(q>1){const prev=result.quarters[q-2];cash=cash.add(matured).sub(payableCurrent).sub(principalCurrent).sub(emergencyDueInterest).sub(prev.vat).sub(prev.surcharge).sub(prev.income_tax);}
   const openingBeforeEmergency=cash,emergency=openingEmergency(p,qp.opening_emergency);
   if(emergency.principal.cmp(0)>0){
    cash=cash.add(emergency.net);
    loans.push({type:'emergency',created:q,due:q+Number(p.emergency_loan.term_quarters),principal:emergency.principal,deferred_interest:emergency.timing==='due'?emergency.interest:M(0)});
    warn('emergency_record','已计入录入的季初紧急贷款；扣息时点按所选口径试算，请与系统借款流水核对。');
   }
   const opening=cash;
   const held=plan.lines.filter(l=>l.quarter<=q), factories=plan.factories.filter(f=>f.quarter<=q), newLines=held.filter(l=>l.quarter===q);
   const output={},capacity={},byFactory={},production=Object.fromEntries(ps.map(id=>[id,M(0)]));
   const openingStock=Object.fromEntries(ps.map(id=>[id,sum(batches.filter(b=>b.product===id).map(b=>b.remaining))]));
   let wages=M(0),idleWages=M(0),training=M(0),maintenance=M(0),lineDep=M(0);
   for(const l of held){
    const e=eq[l.type],ready=q>=Number(l.quarter)+Number(e.installation_quarters), workers=q>=l.workerQuarter?Number(l.workers):0;
    const trained=q>=Number(l.workerQuarter)+Number(e.worker_training_quarters||0);
    capacity[l.id]=ready&&trained?Math.min(Number(e.capacity),workers*Number(e.worker_capacity)):0;
    const val=l.outputs[q-1];const qty=val==='auto'?capacity[l.id]:integer(val,l.id+'产量');
    check(qty<=capacity[l.id],l.id+' 在Q'+q+'产量 '+qty+' 超过可投产能力 '+capacity[l.id]+'（检查安装期、人员培训期、工人或设备上限）');
    if(ready&&qty===0)throw Error(l.id+' 已可用但产量为零：闲置成本分摊尚未确认，本季度暂不出具结果');
    output[l.id]=M(qty);production[e.product]=production[e.product].add(qty);
    byFactory[l.factory]=(byFactory[l.factory]||M(0)).add(qty);
    const wage=M(e.worker_wage).mul(workers);wages=wages.add(wage);if(!qty)idleWages=idleWages.add(wage);
    if(q===Number(l.workerQuarter))training=training.add(M(e.worker_recruit_training_fee).mul(l.workers));
    if(q-Number(l.quarter)>=Number(e.first_depreciation_maintenance_age)){
     maintenance=maintenance.add(e.maintenance_per_quarter);lineDep=lineDep.add(M(e.price).mul(e.depreciation_rate));
    }
   }
   const factoryAllocation={},rentAllocations=[];let rent=M(0),idleRent=M(0),factoryDep=M(0),financePrincipal=M(0),financeInterest=M(0),factoryPurchase=M(0);
   for(const f of factories){
    const total=byFactory[f.id]||M(0), members=held.filter(l=>l.factory===f.id),active=members.filter(l=>output[l.id].cmp(0)>0);
    let dep=M(0),r=M(0),rentCount=members.length,managementRent=M(0),rentMode='all_active',mixed=false;
    if(f.mode==='rent'){
     r=M(p.factory.rent_per_quarter);rent=rent.add(r);
     if(total.cmp(0)===0){
      check(members.length>0&&members.every(l=>q<Number(l.quarter)+Number(eq[l.type].installation_quarters)),f.id+' 无生产：仅含安装线之外的空置租金处理待确认');managementRent=r;rentMode='all_installing';
     }else if(active.length!==members.length){
      check(members.filter(l=>output[l.id].cmp(0)===0).every(l=>q<Number(l.quarter)+Number(eq[l.type].installation_quarters)),f.id+' 已可用线闲置成本归属尚未确认');
      // 租金分摊口径：全部租金由投产线承担，安装线不分摊。
      // 保留历史 mixedRentQ* 输入字段；该字段不参与当前租金分摊。
      rentMode='active';rentCount=active.length;mixed=true;
     }
     idleRent=idleRent.add(managementRent);
     rentAllocations.push({factory:f.id,mode:rentMode,mixed,provisional:false,total:r,production:r.sub(managementRent),management:managementRent,active_lines:active.length,held_lines:members.length});
    }else{
     if(f.mode==='purchase'){
      if(q===Number(f.quarter))factoryPurchase=factoryPurchase.add(p.factory.purchase_price);
     }
     // 厂房折旧口径：购买、融资均自取得下一季度起计提折旧。
     if(q>f.quarter){dep=M(f.mode==='finance'?p.factory.finance_price:p.factory.purchase_price).mul(p.factory.depreciation_rate);check(total.cmp(0)>0,f.id+' 有折旧但无产出：空置自有厂房成本归属待确认');}
     factoryDep=factoryDep.add(dep);
     if(f.mode==='finance'&&q-Number(f.quarter)<Number(p.factory.finance_term_quarters)){
      financePrincipal=financePrincipal.add(M(p.factory.finance_price).div(p.factory.finance_term_quarters));
      financeInterest=financeInterest.add(M(p.factory.finance_price).mul(p.factory.finance_interest_rate));
      warn('finance_row','融资厂房本金和利息已计入实际现金；比赛现金预算对应填报行仍需人工确认。');
     }
    }
    factoryAllocation[f.id]={total,dep,r,count:rentCount};
   }
   let materials=M(0),processing=M(0),materialCash=M(0);
   for(const prod of Object.values(products)){
    const cost=production[prod.id].mul(prod.material_unit_price);materials=materials.add(cost);
    processing=processing.add(production[prod.id].mul(prod.processing_per_unit));
    const gross=cost.mul(M(1).add(p.vat_rate));
    if(Number(prod.material_credit_quarters)===0)materialCash=materialCash.add(gross);
    else if(gross.cmp(0)>0)payables.push({product:prod.id,created:q,due:q+Number(prod.material_credit_quarters),amount:gross});
   }
   const newBatches=[];
   // 行顺序就是当季默认投产顺序；显式 sequence 可按季度覆盖。
   let ordered=held;
   if(qp.sequence?.length){check(qp.sequence.length===held.length&&new Set(qp.sequence).size===held.length&&qp.sequence.every(id=>held.some(l=>l.id===id)),'投产顺序必须恰好包含本季全部持有生产线');ordered=qp.sequence.map(id=>held.find(l=>l.id===id));}
   for(const l of ordered){
    const qty=output[l.id];if(qty.cmp(0)===0)continue;
    const e=eq[l.type],prod=products[e.product],f=factoryAllocation[l.factory],old=q-Number(l.quarter)>=Number(e.first_depreciation_maintenance_age);
    const parts={material:M(prod.material_unit_price),processing:M(prod.processing_per_unit),worker:M(e.worker_wage).mul(q>=l.workerQuarter?l.workers:0).div(qty),
      depreciation:old?M(e.price).mul(e.depreciation_rate).div(qty):M(0),maintenance:old?M(e.maintenance_per_quarter).div(qty):M(0),
      factory_depreciation:f.dep.cmp(0)>0?f.dep.div(f.total):M(0),factory_rent:f.r.cmp(0)>0?f.r.div(f.count).div(qty):M(0)};
    const b={id:'Q'+q+'-'+l.id,quarter:q,line:l.id,factory:l.factory,product:e.product,produced:qty,remaining:qty,unit_cost:sum(Object.values(parts)),parts};
    batches.push(b);newBatches.push(b);
   }
   const available=Object.fromEntries(ps.map(id=>[id,openingStock[id].add(production[id])]));
   const sold=Object.fromEntries(ps.map(id=>[id,M(0)])),submitted=Object.fromEntries(ps.map(id=>[id,M(0)]));
   let missingCaps=false,advertising=M(0);
   const market=p.market_orders?.filter(o=>o.quarter===q),groups=qp.group_count===null||qp.group_count===undefined||qp.group_count===''?null:integer(qp.group_count,'本季小组数',1);
   if(p.legacy_manual)warn('legacy_manual','聚宝B历史手动记录：保留原订单、报价、需求和贴现，不自动替换为新市场规则。新比赛请先导出记录，再重置本局。');
   if(market&&groups===null)warn('group_count_missing','本季小组数未录入，需求量校验待补；均单、报价和账期采用规则文件，销量仍受可售量约束。');
   for(const o of qp.orders){
    check(products[o.product],'订单产品不存在');integer(o.quantity,'订单数量');integer(o.lag,'账期',0,Math.max(3,...Object.keys(p.discount_rates_by_remaining_quarters).map(Number)));
    const rule=market?.find(x=>x.id===o.id);if(market){check(rule,o.id+' 不在本季度市场规则中');check(o.product===rule.product&&Number(o.lag)===Number(rule.lag),o.id+' 产品或账期与本季度规则不符');}
    amount(o.price,'报价');amount(o.ad,'广告');
    if(p.legacy_manual&&o.price_weight!==null&&o.price_weight!==undefined&&o.price_weight!=='')check(M(o.price_weight).cmp(0)>=0&&M(o.price_weight).cmp(1)<=0,o.id+' 报价占比必须在0至1之间');
    const ceiling=rule?.price_ceiling??products[o.product].price_ceiling;
    if(ceiling!==null&&ceiling!==undefined)check(M(o.price).cmp(ceiling)<=0,o.id+' 报价超过该订单上限');
    const demand=rule?(groups===null?null:M(rule.mean_order).mul(groups).toString()):o.demand;
    if(demand!==null&&demand!==undefined&&demand!==''){integer(demand,'需求量');check(Number(o.quantity)<=Number(demand),o.id+' 出单数量超过市场需求');}
    advertising=advertising.add(o.ad);sold[o.product]=sold[o.product].add(o.quantity);
    const cap=o.cap===null||o.cap===''||o.cap===undefined?null:integer(o.cap,'提交上限');
    if(cap===null){if(Number(o.quantity)>0)missingCaps=true;submitted[o.product]=submitted[o.product].add(o.quantity);}
    else {check(Number(o.quantity)<=cap,o.id+' 出单数量超过你填写的提交上限');submitted[o.product]=submitted[o.product].add(cap);}
   }
   for(const id of ps){check(sold[id].cmp(available[id])<=0,id+' 销量超过可售量 '+available[id]);check(submitted[id].cmp(available[id])<=0,id+' 提交上限合计超过可售量 '+available[id]);}
   if(missingCaps)warn('caps_missing','部分订单未录入真实提交上限；已检查销量不超可售量，但提交上限校验尚不完整。');
   let discountFace=M(0),discountFee=M(0),discountBefore=M(0),discountAfter=M(0),discountEvents=[];
   const eligibleBefore=notes.filter(n=>!n.discounted&&!n.paid&&n.due>q).map(n=>({...n}));
   function applyDiscounts(phase){
    for(const ev of qp.discounts.filter(x=>x.phase===phase)){
     const n=notes.find(x=>x.id===ev.note);
     check(n,'贴现票据 '+ev.note+' 不存在（本季票据需交单后才能贴现）');
     check(!n.discounted&&!n.paid&&n.due>q,'票据 '+ev.note+' 已贴现或已到期，不能再次贴现');
     check(ev.face===undefined&&ev.amount===undefined,'贴现仅能选择整张票据；部分金额请先拆分交货');
     const remaining=n.due-q,rate=p.discount_rates_by_remaining_quarters[String(remaining)];check(rate!==undefined,'缺少剩余 '+remaining+' 期的贴现费率');
     const fee=n.face.mul(rate),net=n.face.sub(fee);n.discounted=true;n.discountQuarter=q;n.discountPhase=phase;
     discountFace=discountFace.add(n.face);discountFee=discountFee.add(fee);
     if(phase==='before')discountBefore=discountBefore.add(net);else discountAfter=discountAfter.add(net);
     discountEvents.push({note:n.id,phase,face:n.face,remaining,rate,fee,net});
    }
   }
   for(const ev of qp.discounts)check(['before','after'].includes(ev.phase),'贴现阶段无效');
   applyDiscounts('before');
   let revenue=M(0),directCash=M(0),cogs=M(0),fifo=[];
   const salesFiling=[];
   for(const o of qp.orders){
    const qty=Number(o.quantity),rev=M(o.price).mul(qty);revenue=revenue.add(rev);if(!qty)continue;
    let remain=M(qty);
    for(const b of batches){
     if(b.product!==o.product||b.remaining.cmp(0)===0)continue;
     const take=remain.cmp(b.remaining)<0?remain:b.remaining;const cost=take.mul(b.unit_cost);
     remain=remain.sub(take);b.remaining=b.remaining.sub(take);cogs=cogs.add(cost);fifo.push({order:o.id,batch:b.id,quantity:take,cost});
     if(remain.cmp(0)===0)break;
    }
    check(remain.cmp(0)===0,'FIFO库存不足');
    const split=String(o.splits||qty).split(/[,，\s]+/).filter(Boolean).map(x=>integer(x,'拆分交货数量',1));
    check(split.reduce((a,b)=>a+b,0)===qty,o.id+' 拆分交货数量合计必须等于订单数量');
    split.forEach((n,i)=>{
     const face=M(o.price).mul(n).mul(M(1).add(p.vat_rate));
     if(Number(o.lag)===0)directCash=directCash.add(face);
     else notes.push({id:o.id+'#'+(i+1),order:o.id,product:o.product,quantity:n,created:q,due:q+Number(o.lag),face,discounted:false,paid:false});
    });
   }
   for(const id of ps){const os=qp.orders.filter(o=>o.product===id&&Number(o.quantity)>0),total=sum(os.map(o=>M(o.price).mul(o.quantity)));const different=new Set(os.map(o=>M(o.price).toString())).size>1;
    salesFiling.push({product:id,real_quantity:sold[id],total,quantity:different?M(1):sold[id],price:different?total:M(os[0]?.price||market?.find(o=>o.product===id)?.price_ceiling||products[id].price_ceiling||0),mixed_price:different});}
   const eligibleAfter=notes.filter(n=>!n.discounted&&!n.paid&&n.due>q).map(n=>({...n}));
   applyDiscounts('after');
   let salesWage=M(0),salesTraining=M(0);
   for(const s of p.sales_staff){const add=integer(qp.sales[s.id],s.id+'销售招聘');staff[s.id]+=add;salesTraining=salesTraining.add(M(s.recruit_fee).mul(add));salesWage=salesWage.add(M(s.wage).mul(staff[s.id]));}
   const admin=M(p.administration.base).add(M(p.administration.per_owned_line_including_installation).mul(held.length));
   const management=admin.add(training).add(salesTraining).add(idleWages).add(idleRent),selling=advertising.add(salesWage);
   let loanInterest=M(0),loanPrincipal=M(0),loanFees={};
   for(const [type,spec] of Object.entries(p.loans)){
    if(!spec||typeof spec!=='object'||spec.rate===undefined)continue;
    const principal=amount(qp.loans[type],type+'贷款金额');loanFees[type]=principal.mul(spec.rate);
    loanInterest=loanInterest.add(loanFees[type]);loanPrincipal=loanPrincipal.add(principal);
    if(principal.cmp(0)>0)loans.push({type,created:q,due:q+Number(spec.term_quarters),principal});
   }
   const emergencyInterest=emergency.paid_interest.add(emergencyDueInterest);
   const finance=loanInterest.add(discountFee).add(financeInterest).add(emergencyInterest);
   const inputVat=materials.mul(p.vat_rate),outputVat=revenue.mul(p.vat_rate),creditOpen=vatCredit;
   const vat=max(outputVat.sub(inputVat).sub(creditOpen),0);vatCredit=max(inputVat.add(creditOpen).sub(outputVat),0);
   if(vatCredit.cmp(0)>0||creditOpen.cmp(0)>0)warn('vat_credit','出现增值税留抵，按进项余额结转试算；该路径尚未与比赛系统对照验证。');
   const surchargeParts=Object.fromEntries(Object.entries(p.surcharge_rates).map(([key,rate])=>[key,vat.mul(rate)]));
   const surcharge=sum(Object.values(surchargeParts)),profit=revenue.sub(cogs).sub(surcharge).sub(selling).sub(management).sub(finance);
   const lossOpen=loss,taxBase=max(profit.sub(loss),0),incomeTax=taxBase.mul(p.income_tax_rate);loss=max(loss.sub(profit),0);
   if(profit.cmp(0)<0&&taxPaidBefore.cmp(0)>0)warn('tax_later_loss','出现先盈利后亏损，按不自动退税、亏损结转试算；比赛累计退抵规则尚未确认。');
   taxPaidBefore=taxPaidBefore.add(incomeTax);
   const equipmentSpend=sum(newLines.map(l=>eq[l.type].price));
   const before=opening.add(loanPrincipal).sub(loanInterest).sub(equipmentSpend).sub(factoryPurchase).sub(training).sub(salesTraining).sub(materialCash).sub(advertising).add(discountBefore);
   const after=before.add(directCash).add(discountAfter);
   cash=after.sub(admin).sub(salesWage).sub(rent).sub(maintenance).sub(processing).sub(wages).sub(financePrincipal).sub(financeInterest);
   const nextReceivables=sum(notes.filter(n=>n.due===q+1&&!n.discounted&&!n.paid).map(n=>n.face)),nextPayables=sum(payables.filter(x=>x.due===q+1).map(x=>x.amount)),nextPrincipal=sum(loans.filter(x=>x.due===q+1).map(x=>x.principal));
   const nextLongPrincipal=sum(loans.filter(x=>x.due===q+1&&x.type==='long').map(x=>x.principal)),nextShortPrincipal=sum(loans.filter(x=>x.due===q+1&&x.type==='short').map(x=>x.principal));
   const nextEmergencyPrincipal=sum(loans.filter(x=>x.due===q+1&&x.type==='emergency').map(x=>x.principal));
   const nextEmergencyDueInterest=sum(loans.filter(x=>x.due===q+1&&x.type==='emergency').map(x=>x.deferred_interest||0));
   const nextCashBeforeEmergency=cash.add(nextReceivables).sub(nextPayables).sub(nextPrincipal).sub(nextEmergencyDueInterest).sub(vat).sub(surcharge).sub(incomeTax);
   const nextEmergency=openingEmergency(p,plan.quarters[q]?.opening_emergency);
   const nextCash=nextCashBeforeEmergency.add(nextEmergency.net);
   const nextCashShortfall=max(nextCash.neg(),0);
   if(q===4&&nextCash.cmp(0)<0)warn('negative_cash','第五季初结算后现金为负，存在紧急贷款风险；需在第四季度结束前补足结算资金缺口 '+nextCashShortfall+' 元。');
   else if(opening.cmp(0)<0||cash.cmp(0)<0||nextCash.cmp(0)<0)warn('negative_cash','季度边界出现负现金：需调整融资、贴现或经营方案；未自动添加紧急贷款。');
   if(before.cmp(0)<0)warn('operation_cash','按页面的操作顺序估算，交单前现金为负；需结合实际操作先后检查。');
   const budget={opening_cash:opening,sales_gross:revenue.mul(M(1).add(p.vat_rate)),receivable:matured.add(discountFace),direct_sales_cash:directCash,
    sales_cash_fraction:revenue.cmp(0)>0?directCash.div(revenue.mul(M(1).add(p.vat_rate))):M(0),
    materials,material_cash_fraction:materials.cmp(0)>0?materialCash.div(M(1).add(p.vat_rate)).div(materials):M(0),current_material_cash:materialCash,matured_payables:payableCurrent,
    sales_filing:salesFiling,advertising,sales_wage:salesWage,administration:admin,worker_training:training,sales_training:salesTraining,worker_wages:wages,
    equipment_depreciation:lineDep,factory_depreciation:factoryDep,maintenance,processing,rent,equipment_purchase:equipmentSpend,factory_purchase:factoryPurchase,
    short_loan:M(qp.loans.short),long_loan:M(qp.loans.long),short_interest:loanFees.short,long_interest:loanFees.long,discount_interest:discountFee,emergency_loan:emergency.principal,emergency_interest:emergencyInterest,
    financing_principal:financePrincipal,financing_interest:financeInterest,vat,income_tax:incomeTax,city_tax:surchargeParts.city,education_tax:surchargeParts.education,local_education_tax:surchargeParts.local_education};
   const r={quarter:q,stage:qp.stage,production,capacity,production_by_line:output,opening_inventory:openingStock,available,sold,
    revenue,cost_of_sales:cogs,surcharge,selling,management,finance,profit,income_tax:incomeTax,net_profit:profit.sub(incomeTax),vat,
    management_parts:{administration:admin,worker_training:training,sales_training:salesTraining,idle_worker_wage:idleWages,idle_factory_rent:idleRent},
    tax_loss_open:lossOpen,tax_loss_close:loss,vat_credit_open:creditOpen,vat_credit_close:vatCredit,input_vat:inputVat,output_vat:outputVat,
    budget,opening_cash:opening,before_delivery_cash:before,after_delivery_cash:after,ending_cash:cash,next_opening_cash:nextCash,next_cash_shortfall:nextCashShortfall,
    opening_cash_before_emergency:openingBeforeEmergency,opening_emergency:emergency,next_cash_before_emergency:nextCashBeforeEmergency,next_emergency:nextEmergency,next_emergency_loan_principal:nextEmergencyPrincipal,next_emergency_due_interest:nextEmergencyDueInterest,
    matured_receivables:matured,next_receivables:nextReceivables,next_payables:nextPayables,next_loan_principal:nextPrincipal,next_long_loan_principal:nextLongPrincipal,next_short_loan_principal:nextShortPrincipal,next_taxes:vat.add(surcharge).add(incomeTax),
    ending_inventory:Object.fromEntries(ps.map(id=>[id,sum(batches.filter(b=>b.product===id).map(b=>b.remaining))])),ending_inventory_cost:sum(batches.map(b=>b.remaining.mul(b.unit_cost))),
    rent_allocations:rentAllocations,new_batches:newBatches.map(b=>({...b})),ending_batches:batches.filter(b=>b.remaining.cmp(0)>0).map(b=>({...b})),fifo,
    discount_events:discountEvents,eligible_before:eligibleBefore,eligible_after:eligibleAfter,notes:notes.map(n=>({...n})),payables:payables.map(x=>({...x})),loans:loans.map(x=>({...x})),staff:{...staff}};
   result.quarters.push(r);
  }
 }catch(e){result.errors.push({quarter:q,message:e.message});}
 return plain(result);
}
const api={calculate,Money,emergencyPrincipalForShortfall};if(typeof module!=='undefined')module.exports=api;else g.JiyuEngine=api;
})(globalThis);
