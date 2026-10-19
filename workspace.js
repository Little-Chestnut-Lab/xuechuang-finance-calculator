(function(g){
'use strict';
const R=typeof module!=='undefined'?require('./rules-model.js'):g.CustomRules,IO=typeof module!=='undefined'?require('./record-io.js'):g.RecordIO,key='financial-custom-workspace-v1';
function create(storage){
 let state={draft:R.blank(),active:null,plan:null,revision:0,planBackup:null,draftBackup:null,orderCounters:{}},blocked=false,note='',importing=false;
 function validateRecord(record){if(record?.schema!==1||record.type!=='custom-workspace'||!record.state?.draft)throw Error('不是通用计算网页的完整记录');
  IO.safeTree(record);const x=R.clone(record.state);x.draft=IO.normalizeRules(x.draft);if(!R.hasShape(x.draft))throw Error('规则草稿格式不完整');if(x.active){x.active=IO.normalizeRules(x.active);const errors=R.validate(x.active);if(errors.length)throw Error('保存规则不完整：'+errors[0]);}
  if(x.plan){if(!x.active)throw Error('本局缺少已保存规则');x.plan=IO.validatePlan(x.plan,x.active);}
  if(x.revision!==undefined)IO.integer(x.revision,'规则版本',0,Number.MAX_SAFE_INTEGER);
  if(x.planBackup){if(x.planBackup.schema!==1||x.planBackup.template!=='custom'||!x.active)throw Error('撤销备份格式无效');x.planBackup.plan=IO.validatePlan(x.planBackup.plan,x.active,{historical:true});}
  if(x.draftBackup){x.draftBackup=IO.normalizeRules(x.draftBackup);if(!R.hasShape(x.draftBackup))throw Error('草稿备份格式无效');}
  if(x.orderCounters!==undefined){if(!x.orderCounters||typeof x.orderCounters!=='object'||Array.isArray(x.orderCounters))throw Error('订单计数格式无效');for(const v of Object.values(x.orderCounters))IO.integer(v,'订单计数',1);}
  return x;
 }
 try{const raw=storage.getItem(key);if(raw)state=validateRecord(JSON.parse(raw));}catch(e){blocked=true;note='本地记录读取失败，已保留原数据并停止自动保存。请导入完整备份恢复。';}
 const api={key,onApply:null,onSave:null,
  get draft(){return state.draft;},get active(){return state.active;},get plan(){return state.plan;},get revision(){return state.revision;},get planBackup(){return state.planBackup;},get draftBackup(){return state.draftBackup;},get blocked(){return blocked;},get note(){return note;},
  save(){if(blocked){api.onSave?.(false,note);return false;}try{storage.setItem(key,JSON.stringify({schema:1,type:'custom-workspace',state}));api.onSave?.(true);return true;}catch(e){api.onSave?.(false,'本地保存失败，请导出备份。');if(importing)throw e;return false;}},
  data(){const p=state.active||R.blank();if(!p.name)p.name='自定义规则';return {parameters:p,presets:{blank:R.blankPlan(p)},default_preset:'blank',preset_labels:{blank:'按季度自定建设'},source:{basis:'用户录入的自定义规则',revision:state.revision}};},
  savePlan(plan){state.plan=R.clone(plan);return api.save();},
  addOrder(q){state.orderCounters||={};const all=[...state.draft.market_orders,...(state.active?.market_orders||[]),...(state.plan?.quarters.flatMap(x=>x.orders)||[])];
   const prefix='USR-Q'+q+'-O';let n=Math.max(state.orderCounters[q]||1,...all.filter(o=>o.id.startsWith(prefix)).map(o=>Number(o.id.slice(prefix.length))+1));
   state.orderCounters[q]=n+1;state.draft.market_orders.push({id:prefix+n,quarter:q,product:'',mean_order:'',price_ceiling:'',lag:'',price_weight:''});api.save();},
  apply(){if(blocked)throw Error(note);const compiled=R.compile(state.draft);if(compiled.errors.length)return compiled.errors;
   const plan=R.reconcile(state.plan,compiled.parameters);state.active=compiled.parameters;state.plan=plan;state.revision++;api.save();api.onApply?.();return [];},
  backupPlan(record){state.planBackup=R.clone(record);api.save();},clearPlanBackup(){state.planBackup=null;api.save();},
  clearDraft(){state.draftBackup=R.clone(state.draft);state.draft=R.blank();api.save();},undoDraft(){if(state.draftBackup){state.draft=state.draftBackup;state.draftBackup=null;api.save();}},
  rulesExport(){return {schema:1,type:'custom-rules',parameters:R.clone(state.active||state.draft),draft:R.clone(state.draft)};},
  importRules(record){if(blocked)throw Error(note);if(record?.schema!==1||record.type!=='custom-rules')throw Error('请选择本网页导出的规则文件');IO.safeTree(record);const draft=IO.normalizeRules(record.parameters||record.draft);if(!R.hasShape(draft))throw Error('规则文件不完整');const next=R.clone(state);next.draftBackup=R.clone(state.draft);next.draft=draft;commit(next,()=>api.onRulesImport?.());},
  exportData(plan){const x=R.clone(state);if(plan&&state.active)x.plan=R.clone(plan);return {schema:1,type:'custom-workspace',state:x};},
  importData(record){const next=validateRecord(record);if(blocked){const raw=storage.getItem(key);if(raw)storage.setItem(key+'-unreadable-backup',raw);}commit(next,()=>api.onApply?.());}
 };return api;
 function commit(next,show){const previous=R.clone(state),wasBlocked=blocked,oldNote=note;importing=true;
  try{IO.transaction(storage,key,{schema:1,type:'custom-workspace',state:next},{backup:wasBlocked?undefined:api.exportData(),apply(){state=next;blocked=false;note='';show();},restore(){state=previous;blocked=wasBlocked;note=oldNote;show();}});}finally{importing=false;}
 }
}
if(typeof module!=='undefined')module.exports={create,key};else{let storage;try{storage=g.localStorage;}catch(e){storage={getItem(){throw e;},setItem(){throw e;}};}g.CustomWorkspace=create(storage);g.CustomData=g.CustomWorkspace.data();g.JiyuOrderReferences={orders:[]};}
})(globalThis);
