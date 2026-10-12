import React, { useState } from 'react';
import { ArrowRight, CaretDown, Cpu, Key, Monitor, House, DownloadSimple } from '@phosphor-icons/react';

const PRODUCTS = [
  { id: 'api', name: 'AI 模型服务', english: 'Model API', icon: Key, page: 'api-dashboard', description: '通过统一 API 接入多种 AI 模型，管理应用调用与使用成本。', action: '管理模型服务', features: [['统一模型接入','模型选择与 API key 管理'],['调用可观测性','用量、缓存命中、延迟与报错分析'],['开发资产管理','提示词、团队记忆与 Skill 托管']] },
  { id: 'gpu', name: 'GPU Cloud', english: 'GPU Compute', icon: Cpu, page: 'gpu-overview', description: '交付 GPU 容器算力，为模型训练与推理提供运行资源。', action: '管理 GPU 算力', features: [['GPU 容器实例','组织与个人实例集中管理'],['数据资源共享','公开数据集与组织共享数据集'],['用量与费用追溯','按实例核对订单与计费记录']] },
  { id: 'desk', name: 'GPU 云电脑', english: 'GPU Desktop', icon: Monitor, page: 'desk-computer', description: '集中管理云端桌面、存储与终端，支撑组织统一使用算力。', action: '管理云电脑', features: [['桌面与存储','云电脑、云硬盘集中管理'],['终端与场所','管理接入终端与使用场所'],['使用费用追溯','查看云电脑订单与计费记录']] },
];
const permitted = tenant => PRODUCTS.filter(p => tenant.enabledProducts.includes(p.id));
const productOfPage = page => page?.startsWith('gpu-') ? 'gpu' : page?.startsWith('desk-') || page?.startsWith('term-') ? 'desk' : ['api-dashboard', 'api-key', 'memory', 'prompt', 'skill', 'api-billing'].includes(page) ? 'api' : '';
export function ProductSwitcher({ tenant, page, onNavigate }) {
  const active = PRODUCTS.find(p => p.id === productOfPage(page));
  return <div className="hub-switcher"><span className="hub-switcher-label">{active?.name || 'OneLinkAI 控制台'}</span><details key={`${tenant.id}-${page}`}><summary aria-label="切换产品控制台">切换控制台 <CaretDown size={13} /></summary><div className="hub-switch-menu"><button onClick={() => onNavigate('dashboard')}><House size={18} /><span>首页</span></button>{permitted(tenant).map(p => <button className={active?.id === p.id ? 'selected' : ''} key={p.id} onClick={() => onNavigate(p.page)}><p.icon size={18} /><span>{p.name}</span><ArrowRight size={14} /></button>)}</div></details></div>;
}

export function homeServices(tenant) {
  const actions = tenant ? {
    api: [['模型','选择可调用的模型','https://onelinkai.cloud/pricingList'],['API key','管理应用接入密钥','api-key'],['可观测性','分析用量、延迟与报错','api-dashboard']],
    gpu: [['容器实例','管理组织已租用的算力','gpu-org-instance'],['数据管理','查看组织共享数据集','gpu-shared-data'],['算力概览','查看 GPU 服务概况','gpu-overview']],
    desk: [['云电脑','管理组织桌面环境','desk-computer'],['终端管理','管理接入设备','desk-terminal'],tenant.type==='学校'?['课程管理','管理课程档案','term-course']:['云硬盘','管理桌面存储','desk-disk']]
  } : {
    api: [['模型','选择可调用的模型','https://onelinkai.cloud/pricingList'],['API key','管理应用接入密钥','personal-key'],['提示词管理','管理常用提示词','personal-prompt']],
    gpu: [['算力市场','选择并租用 GPU 算力','https://onelinkai.cloud/gpucloud'],['容器实例','管理已租用的算力','personal-gpu-instance']]
  };
  return (tenant?permitted(tenant):PRODUCTS.filter(p=>p.id!=='desk')).map(p=>({...p,actions:actions[p.id]}));
}

export function ConsoleHome({ tenant = null, onNavigate }) {
  const services=homeServices(tenant);
  return <div className="hub-home hub-task-home">
    <div className="hub-heading"><div><h1>首页</h1><p>{tenant?tenant.name:'个人空间'} <span className="hub-tenant-type">{tenant?tenant.type+'组织':'模型与算力服务'}</span></p></div></div>
    <div className="hub-section-heading"><h2>我的服务</h2><span>选择服务，直接开始工作</span></div>
    <div className="hub-task-services">{services.map(p=><section className={'hub-task-service hub-service-'+p.id} key={p.id}>
      <div className="hub-task-identity"><div className="hub-product-symbol"><p.icon size={26}/></div><div><span className="hub-task-english">{p.english}</span><h2>{p.name}</h2><p>{p.id==='api'?'通过 API 为应用接入模型能力。':p.id==='gpu'?'租用 GPU 环境，运行训练与推理任务。':'为组织交付桌面环境，集中管理终端与使用安排。'}</p></div></div>
      <div className="hub-task-actions">{p.actions.map(([label,note,target])=>{
        const content=<><span><strong>{label}</strong><small>{note}</small></span><ArrowRight size={17}/></>;
        return target.startsWith('https:')?<a key={target} href={target} target="_blank" rel="noreferrer" aria-label={label+'（新窗口打开）'}>{content}</a>:<button key={target} onClick={()=>onNavigate(target)}>{content}</button>;
      })}</div>
    </section>)}</div>
    {!services.length&&<div className="hub-panel hub-empty">当前组织暂无可用产品，请联系组织管理员。</div>}
  </div>;
}

// Demo ledger: integer units of 0.00000001 CNY, never rounded per transaction.
// School points are a presentation unit, not a second asset.
const SCALE = 100000000;
const EVENTS = [
  {id:'API-0801',product:'api',date:'2026-01-27 09:50:13',method:'按量计费',resource:'模型 A · 输入 / 输出 Token',resourceId:'CALL-0801',quantity:'30,526 输入 / 217 输出 Token',paid:0.06002115,gift:0},
  {id:'GPU-0801',product:'gpu',date:'2026-01-30 10:00:00',method:'包月计费',resource:'GPU 容器实例',resourceId:'GPU-002',quantity:'1 个月',period:'2026-01-30 至 2026-01-29',paid:750,gift:0},
  {id:'API-0901',product:'api',date:'2026-01-02 10:00:00',method:'按量计费',resource:'模型 A · 调用汇总',resourceId:'CALL-0901',quantity:'1,200,000 Token',paid:80,gift:20},
  {id:'API-0902',product:'api',date:'2026-01-03 11:00:00',method:'按量计费',resource:'模型 B · 调用汇总',resourceId:'CALL-0902',quantity:'300,000 Token',paid:120,gift:30},
  {id:'API-0903',product:'api',date:'2026-01-04 09:42:39',method:'按量计费',resource:'模型 A · 单次调用',resourceId:'CALL-0903',quantity:'10 输入 / 586 输出 Token',paid:0.009416,gift:0},
  {id:'GPU-0901',product:'gpu',date:'2026-01-05 10:00:00',method:'按量计费',resource:'GPU 容器实例',resourceId:'GPU-001',quantity:'120 卡时',paid:1100,gift:0},
  {id:'DISK-0901',product:'gpu',date:'2026-01-05 10:00:01',method:'按量计费',resource:'实例数据盘',resourceId:'DISK-001',quantity:'1,000 GB·时',paid:50,gift:0},
  {id:'GPU-0902',product:'gpu',date:'2026-01-06 10:00:00',method:'包周计费',resource:'GPU 容器实例',resourceId:'GPU-003',quantity:'1 周',period:'2026-01-06 至 2026-01-12',paid:300,gift:0},
  {id:'DESK-0901',product:'desk',date:'2026-01-05 12:00:00',method:'计时付费',resource:'云电脑',resourceId:'DESK-001',quantity:'40 小时',paid:400,gift:0},
  {id:'DESK-0902',product:'desk',date:'2026-01-04 13:28:47',method:'按课表付费',resource:'教学云电脑',resourceId:'DESK-002',quantity:'10 小时',period:'2026-01-04 至 2026-01-30',paid:0.1,gift:0},
  {id:'REFUND-0901',product:'gpu',date:'2026-01-07 15:00:00',method:'包月计费',resource:'GPU 容器实例',resourceId:'GPU-002',quantity:'—',refund:50,source:'GPU-0801',sourceDate:'2026-01-30 10:00:00'}
];
const PRODUCT_BILL_PAGES = {api:'api-billing',gpu:'gpu-billing',desk:'desk-billing'};
export function billPresentation(tenant) {
  const school=tenant?.type==='学校';
  return {school,unit:school?'积分':'元',divisor:school?SCALE/20:SCALE,gift:school?'赠送积分抵扣':'赠金抵扣',balance:school?'余额扣费':'现金余额扣费',refund:school?'退款':'现金退款',net:school?'净支出':'净现金支出'};
}
export function formatBillValue(value,tenant,grouping=true) {
  return new Intl.NumberFormat('zh-CN',{minimumFractionDigits:2,maximumFractionDigits:8,useGrouping:grouping}).format(value/billPresentation(tenant).divisor);
}
const fields=tenant=>{const p=billPresentation(tenant);return [['charged','扣费总额'],['paid',p.balance],['gift',p.gift],['refund',p.refund],['net',p.net]]};
export function makeBills(tenant,month) {
  return EVENTS.filter(r=>r.date.startsWith(month)&&!(tenant.type!=='学校'&&r.method==='按课表付费')).map(r=>{
    const paid=Math.round((r.paid||0)*SCALE),gift=Math.round((r.gift||0)*SCALE),refund=Math.round((r.refund||0)*SCALE);
    return {...r,id:tenant.id+'-'+r.id,source:r.source?tenant.id+'-'+r.source:null,month:r.date.slice(0,7),type:refund?'退款':'扣费',paid,gift,refund,charged:paid+gift,net:paid-refund};
  });
}
export function sumBills(rows) {
  return Object.fromEntries(['charged','paid','gift','refund','net'].map(k=>[k,rows.reduce((n,r)=>n+r[k],0)]));
}
function useBillMonth(tenant) {
  const key='bill-month-'+tenant.id;
  const [month,setMonth]=useState(()=>{try{return sessionStorage.getItem(key)||'2026-09'}catch{return '2026-09'}});
  return [month,value=>{setMonth(value);try{sessionStorage.setItem(key,value)}catch{}}];
}
function exportTable(headers,values,filename) {
  const csv=[headers,...values].map(row=>row.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(',')).join('\r\n');
  const url=URL.createObjectURL(new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'}));
  const a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function cellValue(row,key,tenant) {
  return key==='gift'&&row.product&&row.product!=='api'?'—':formatBillValue(row[key],tenant);
}
export function billExport(tenant,rows,summary=false) {
  const unit=billPresentation(tenant).unit;
  const amountHeaders=fields(tenant).map(([,label])=>label+'（'+unit+'）');
  if(summary){
    const groups=PRODUCTS.filter(p=>rows.some(r=>r.product===p.id)).map(p=>({product:p.id,name:p.name,...sumBills(rows.filter(r=>r.product===p.id))}));
    return {headers:['产品',...amountHeaders],values:[...groups.map(g=>[g.name,...fields(tenant).map(([k])=>cellValue(g,k,tenant))]),['合计',...fields(tenant).map(([k])=>formatBillValue(sumBills(rows)[k],tenant,false))]]};
  }
  return {headers:['交易记录编号','交易时间','交易类型','产品','资源 / 模型','计费方式','数量 / 时长','服务期间','原扣费记录',...amountHeaders],values:rows.map(r=>[r.id,r.date,r.type,PRODUCTS.find(p=>p.id===r.product).name,r.resource+' · '+r.resourceId,r.method,r.quantity,r.period||'—',r.source||'—',...fields(tenant).map(([k])=>cellValue(r,k,tenant))])};
}
function BillContext({tenant,month}) {
  return <div className="hub-bill-context"><span>{tenant.name} · {month}</span><span>{['2026-08','2026-09'].includes(month)?'示例数据截至 2026-01-08 10:00':'暂无交易'}</span><span className="hub-demo-label">演示数据 · 单位：{billPresentation(tenant).unit}</span></div>;
}
function BillMetrics({tenant,rows}) {
  const sums=sumBills(rows),p=billPresentation(tenant);
  return <><div className="hub-bill-metrics">{[['charged','扣费总额'],['paid',p.balance],['refund',p.refund],['net',p.net]].map(([k,label])=><div key={k}><span>{label}（{p.unit}）</span><strong>{formatBillValue(sums[k],tenant)}</strong></div>)}</div>
    <div className="hub-bill-note">按扣款、退款实际发生月份统计；充值不计入消费。{p.gift}仅适用于 AI 模型服务。<br/>包时段购买及课表预付在扣款时计入，后续使用不重复计费。{p.net} = {p.balance} − {p.refund}。</div></>;
}
function AmountCells({row,tenant}) {return fields(tenant).map(([k])=><td key={k}>{cellValue(row,k,tenant)}</td>)}
function BillDetail({row,tenant,onClose}) {
  const p=billPresentation(tenant);
  const pairs=[['交易记录编号',row.id],['所属组织',tenant.name],['交易时间',row.date],['交易类型',row.type],['产品',PRODUCTS.find(p=>p.id===row.product).name],['资源 / 模型',row.resource],['资源标识',row.resourceId],['计费方式',row.method],['数量 / 时长',row.quantity],['服务期间',row.period||'—'],...fields(tenant).map(([k,label])=>[label+'（'+p.unit+'）',cellValue(row,k,tenant)]),['状态',row.refund?'退款已到账':'扣款成功'],...(row.source?[['原扣费记录',row.source],['原扣费时间',row.sourceDate]]:[])];
  return <div className="hub-modal-backdrop" onClick={onClose}><section className="hub-detail-modal" role="dialog" aria-modal="true" aria-label="交易详情" onClick={e=>e.stopPropagation()}><div className="hub-heading"><h2>交易详情</h2><button className="secondary-button" onClick={onClose}>关闭</button></div><dl>{pairs.map(([k,v])=><React.Fragment key={k}><dt>{k}</dt><dd>{v}</dd></React.Fragment>)}</dl></section></div>;
}
export function UnifiedBills({tenant,onNavigate}) {
  const [month,setMonth]=useBillMonth(tenant),[product,setProduct]=useState('all');
  const rows=makeBills(tenant,month).filter(r=>product==='all'||r.product===product);
  const groups=PRODUCTS.filter(p=>rows.some(r=>r.product===p.id)).map(p=>({...p,product:p.id,...sumBills(rows.filter(r=>r.product===p.id))}));
  const unit=billPresentation(tenant).unit;
  const download=()=>{const data=billExport(tenant,rows,true);exportTable(data.headers,data.values,'产品费用汇总-'+month+'-'+unit+'.csv')};
  return <div className="hub-bills"><div className="hub-heading"><div><h1>账单</h1><p>查看组织实际扣费与退款，按产品核对支出</p></div></div><BillContext tenant={tenant} month={month}/>
    <div className="hub-panel"><div className="hub-bill-filters"><label>交易月份<input aria-label="账单月份" type="month" value={month} onChange={e=>setMonth(e.target.value)}/></label><label>产品<select aria-label="账单产品" value={product} onChange={e=>setProduct(e.target.value)}><option value="all">全部产品</option>{PRODUCTS.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label><button className="secondary-button" disabled={!rows.length} onClick={download}><DownloadSimple size={16}/>导出汇总</button></div>
    <BillMetrics tenant={tenant} rows={rows}/><div className="hub-ledger-heading"><h2>各产品费用</h2><span>当前筛选合计 · 单位：{unit}</span></div>
    <div className="hub-table-scroll"><table className="hub-bill-table"><thead><tr>{['产品',...fields(tenant).map(([,label])=>label),'操作'].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{groups.map(g=><tr key={g.id}><td><span className="hub-product-cell"><g.icon size={18}/>{g.name}</span></td><AmountCells row={g} tenant={tenant}/><td><button className="hub-text-link" onClick={()=>onNavigate(PRODUCT_BILL_PAGES[g.id])}>查看计费记录 <ArrowRight size={14}/></button></td></tr>)}{!!rows.length&&<tr className="hub-total"><td>合计</td><AmountCells row={sumBills(rows)} tenant={tenant}/><td/></tr>}</tbody></table></div>
    {!rows.length&&<div className="hub-empty">当前筛选条件下暂无交易</div>}<div className="hub-table-footer">{groups.length} 个产品 · {rows.filter(r=>r.type==='扣费').length} 条扣费 · {rows.filter(r=>r.type==='退款').length} 条退款</div></div>
    <p className="hub-prototype-note">以上为对账演示数据。退款可能关联其他月份的扣费；“—”表示该产品不适用赠送抵扣。</p></div>;
}
export function ProductBillingRecords({tenant,product,onNavigate}) {
  const [month,setMonth]=useBillMonth(tenant),[query,setQuery]=useState(''),[method,setMethod]=useState('all'),[type,setType]=useState('all'),[selected,setSelected]=useState(null);
  const p=PRODUCTS.find(p=>p.id===product),unit=billPresentation(tenant).unit;
  const all=makeBills(tenant,month).filter(r=>r.product===product);
  const rows=all.filter(r=>(method==='all'||r.method===method)&&(type==='all'||r.type===type)&&(!query||[r.id,r.resource,r.resourceId,r.source].join(' ').toLowerCase().includes(query.toLowerCase())));
  const download=()=>{const data=billExport(tenant,rows);exportTable(data.headers,data.values,p.name+'-计费记录-'+month+'-'+unit+'.csv')};
  return <div className="hub-bills"><div className="hub-heading"><div><h1>计费记录</h1><p>{p.name} · 核对每笔扣费、退款及其来源</p></div><button className="secondary-button" onClick={()=>onNavigate('bills')}>返回组织账单 <ArrowRight size={15}/></button></div><BillContext tenant={tenant} month={month}/>
    <div className="hub-panel"><div className="hub-bill-filters"><label>交易月份<input aria-label="账单月份" type="month" value={month} onChange={e=>{setMonth(e.target.value);setMethod('all');setSelected(null)}}/></label><label>交易类型<select value={type} onChange={e=>setType(e.target.value)}><option value="all">全部交易</option><option>扣费</option><option>退款</option></select></label><label>计费方式<select value={method} onChange={e=>setMethod(e.target.value)}><option value="all">全部计费方式</option>{[...new Set(all.map(r=>r.method))].map(m=><option key={m}>{m}</option>)}</select></label><label>资源 / 记录<input placeholder="搜索资源或交易编号" value={query} onChange={e=>setQuery(e.target.value)}/></label><button className="secondary-button" disabled={!rows.length} onClick={download}><DownloadSimple size={16}/>导出记录</button></div><BillMetrics tenant={tenant} rows={rows}/>
    <div className="hub-table-scroll"><table className="hub-bill-table"><thead><tr>{['交易时间 / 编号','交易类型','资源 / 模型','计费方式','数量 / 时长',...fields(tenant).map(([,label])=>label),'操作'].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{rows.map(r=><tr key={r.id}><td>{r.date}<small>{r.id}</small></td><td>{r.type}</td><td>{r.resource}<small>{r.resourceId}</small></td><td>{r.method}</td><td>{r.quantity}</td><AmountCells row={r} tenant={tenant}/><td><button className="hub-text-link" onClick={()=>setSelected(r)}>详情</button></td></tr>)}{!!rows.length&&<tr className="hub-total"><td colSpan={5}>合计（{unit}）</td><AmountCells row={{...sumBills(rows),product}} tenant={tenant}/><td/></tr>}</tbody></table></div>{!rows.length&&<div className="hub-empty">当前筛选条件下暂无交易</div>}<div className="hub-table-footer">{rows.length} 条交易记录 · 当前筛选合计 · 单位：{unit}</div></div>
    <p className="hub-prototype-note">演示记录与组织账单共用同一来源；详情展示服务期间或原扣费关联，避免预付与后续使用重复计费。</p>
    {selected&&<BillDetail row={selected} tenant={tenant} onClose={()=>setSelected(null)}/>}</div>;
}
