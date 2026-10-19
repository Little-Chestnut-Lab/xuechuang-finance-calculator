/* 自行编写的通用汇总；无平台原表行号或文字。 */
(function(g){
function render(p,plan,r,h,selected='comprehensive'){
 const rows=selected==='cash'?[['期初资金',r.opening_cash],['当前阶段结余',r.before_delivery_cash],['交货后资金',r.after_delivery_cash],['季末资金',r.ending_cash],['下一期资金',r.next_opening_cash]]:[['收入',r.revenue],['销售成本',r.cost_of_sales],['销售开支',r.selling],['管理开支',r.management],['融资开支',r.finance],['税前盈余',r.profit],['所得税额',r.income_tax],['税后盈余',r.net_profit]];
 return '<p class="hint">自行填写规则的通用财务汇总。此版本不带比赛预算表行序或填报映射。</p><div class="budget-nav"><button data-budget-tab="comprehensive">经营汇总</button><button data-budget-tab="cash">资金汇总</button></div>'+h.table(['指标','数值'],rows.map(([label,value])=>h.tr([h.esc(label),h.money(value)])));
}
const api={render};if(typeof module!=='undefined')module.exports=api;else g.JiyuBudget=api;
})(globalThis);
