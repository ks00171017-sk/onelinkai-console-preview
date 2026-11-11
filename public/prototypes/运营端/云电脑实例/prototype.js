'use strict';
const $=id=>document.getElementById(id);
const tenantNames={sdust:'示例科技大学（济南校区）',qlu:'齐鲁工业大学'};
const initial=[
 {id:'CPC-900000000000000001',name:'教学云电脑 · 标准型 8核16G',cpu:8,memory:16,mode:'包月',status:'维护中',created:'2026-10-01',expiry:'2026-11-01'},
 {id:'CPC-900000000000000002',name:'教学云电脑 · GPU型 RTX4090',cpu:16,memory:32,mode:'计时付费',status:'运行中',connection:'connected',created:'2026-10-05',expiry:null},
 {id:'CPC-900000000000000003',name:'教学云电脑 · 标准型 8核16G',cpu:8,memory:16,mode:'计时付费',status:'已释放',created:'2026-10-02',expiry:'2026-10-03'},
 {id:'CPC-900000000000000004',name:'教学云电脑 · GPU型 RTX4090',cpu:16,memory:32,mode:'计时付费',status:'运行中',connection:'failed',tenant:'sdust',server:'cp-worker8',created:'2026-11-09',expiry:null},
 {id:'CPC-900000000000000005',name:'教学云电脑 · 标准型 8核16G',cpu:8,memory:16,mode:'计时付费',status:'运行中',tenant:'qlu',server:'cp-worker9',os:'Ubuntu 22.04',created:'2026-11-09',expiry:null}
].map((row,index)=>({tenant:index%2===0?'sdust':'qlu',server:'cp-worker'+(index%2+7),os:'Windows 10',region:'demo',...row}));
let rows=structuredClone(initial),selected=new Set(),busy=new Set(),filter=null,version=0;
let batch=null;
const canSync=r=>r.mode==='计时付费'&&r.status==='维护中';
function renderBatch(){
 const picked=rows.filter(r=>selected.has(r.id)),eligible=picked.filter(canSync),locked=busy.size>0||batch?.working;
 $('selection').textContent=`已选择 ${selected.size} 项`;
 $('batch-sync').disabled=!!locked||!eligible.length;
 $('batch-label').textContent=batch?.working?`同步中 ${batch.done}/${batch.total}`:'批量同步状态';
 $('batch-sync').classList.toggle('busy',!!batch?.working);
 $('eligible-count').textContent=picked.length?`可同步 ${eligible.length} 项${picked.length>eligible.length?`，${picked.length-eligible.length} 项不符合同步条件，将跳过`:''}`:'';
 document.querySelector('.batch-actions').hidden=!picked.length;
 document.querySelectorAll('.batch-actions [data-existing]').forEach(b=>b.disabled=!!locked);
 $('batch-sync').title=eligible.length?`同步所选的 ${eligible.length} 台计时付费维护中实例`:'仅支持计时付费且维护中的实例';
 $('eligible-count').hidden=!picked.length||picked.length===eligible.length;
 $('select-all').disabled=!!locked;
 document.querySelectorAll('[data-select]').forEach(e=>e.disabled=!!locked);
 ['query','reset-filters','scenario','reset-demo'].forEach(id=>$(id).disabled=!!locked);
 $('demo-failure').disabled=!!locked||!rows.some(canSync);
 $('batch-feedback').classList.toggle('hidden',!batch||batch.working);
 if(batch&&!batch.working){
  $('batch-summary').innerHTML=`${icon(batch.failed.length?'CloseCircleFilled':'CheckCircleFilled')}成功 ${batch.success} 项，失败 ${batch.failed.length} 项${batch.skipped?`，跳过 ${batch.skipped} 项`:''}${batch.failed.length?'；失败原因见对应实例行':''}`;
  $('batch-feedback').classList.toggle('has-error',!!batch.failed.length);
  $('retry-failed').hidden=!batch.failed.length;
  $('retry-failed').disabled=!!locked||!batch.failed.some(id=>rows.some(r=>r.id===id&&canSync(r)&&r.syncResult?.ok===false));
 }
}

function icon(name){return `<i data-icon="${name}" style="--icon:url('assets/${name}.svg')" aria-hidden="true"></i>`}
function setIcons(){document.querySelectorAll('[data-icon]').forEach(e=>e.style.setProperty('--icon',`url('assets/${e.dataset.icon}.svg')`))}
const connectionLabels={connected:'连接成功',failed:'连接失败',disconnected:'未连接'};
function connectionState(row){
 return row.status==='运行中' && connectionLabels[row.connection] ? row.connection : 'disconnected';
}
function readFilters(){
 return {
  field:$('search-type').value,search:$('instance-search').value.trim().toLowerCase(),
  tenant:$('tenant-filter').value,status:$('status-filter').value,os:$('os-filter').value,
  server:$('server-filter').value.trim().toLowerCase(),region:$('region').value,
  cs:$('created-start').value,ce:$('created-end').value,es:$('expiry-start').value,ee:$('expiry-end').value
 };
}
function resetFilters(){
 filter=null;
 selected.clear();
 document.querySelectorAll('.filters input').forEach(input=>input.value='');
 document.querySelectorAll('.filters select').forEach(select=>select.selectedIndex=0);
 $('instance-search').placeholder='请输入云电脑ID';
}
function visibleRows(){
 if(!filter)return rows;
 return rows.filter(row=>
  (!filter.search||row[filter.field].toLowerCase().includes(filter.search)) &&
  (!filter.tenant||row.tenant===filter.tenant) &&
  (!filter.status||row.status===filter.status) &&
  (!filter.os||row.os===filter.os) &&
  (!filter.server||row.server.toLowerCase().includes(filter.server)) &&
  (filter.region==='all'||row.region===filter.region) &&
  (!filter.cs||row.created>=filter.cs) &&
  (!filter.ce||row.created<=filter.ce) &&
  (!filter.es||row.expiry&&row.expiry>=filter.es) &&
  (!filter.ee||row.expiry&&row.expiry<=filter.ee));
}
function renderOverview(){
 const now=new Date();
 const today=now.toLocaleDateString('sv-SE');
 const active=rows.filter(row=>row.status!=='已释放');
 $('stat-active').textContent=active.length;
 $('stat-running').textContent=rows.filter(row=>row.status==='运行中').length;
 $('stat-connected').textContent=rows.filter(row=>connectionState(row)==='connected').length;
 $('stat-new').textContent=rows.filter(row=>row.created===today).length;
 $('stat-expiring').textContent=active.filter(row=>{
  if(!row.expiry)return false;
  const expiry=Date.parse(row.expiry+'T00:00:00');
  return expiry>=now.getTime()&&expiry<=now.getTime()+86400000;
 }).length;
}
function render(){renderOverview();const visible=visibleRows();$('instances').innerHTML=visible.map(r=>{
 const eligible=r.mode==='计时付费'&&r.status==='维护中',working=busy.has(r.id);
 const cls={'维护中':'maintaining','运行中':'running','已关机':'stopped','已释放':'released'}[r.status];
 const details=`<button class="text-button" data-detail="${r.id}">${icon('Eye')}查看详情</button>`;
 const result=r.syncResult;
 const connection=connectionState(r);
 const sync=working?`<button class="text-button sync-button busy" data-sync="${r.id}" aria-label="同步状态 ${r.id}" disabled>${icon('LoadingOutlined')}同步中</button>`:result?.ok?`<span class="sync-result sync-success" aria-label="同步成功 ${r.id}" title="${r.status} · ${r.writtenAt}">${icon('CheckCircleFilled')}同步成功</span>`:eligible?result?`<div class="sync-control"><div class="sync-result-line"><span class="sync-result sync-error">${icon('CloseCircleFilled')}同步失败</span><button class="text-button sync-retry" data-sync="${r.id}" aria-label="重试同步 ${r.id}">重试</button></div><small class="failure-reason">${result.reason}</small></div>`:`<button class="text-button sync-button" data-sync="${r.id}" aria-label="同步状态 ${r.id}">${icon('SyncOutlined')}同步状态</button>`:'';
 const normal=r.status==='运行中'?`<button class="text-button shutdown" data-existing="关机">${icon('Power')}关机</button><button class="text-button release" data-existing="释放">${icon('XCircle')}释放</button>`:'';
 return `<tr data-instance="${r.id}"><td><input type="checkbox" data-select="${r.id}" aria-label="选择 ${r.id}" ${selected.has(r.id)?'checked':''}></td><td><div class="id-cell"><strong class="instance-id">${r.id.slice(0,14)}<br>${r.id.slice(14)}</strong><button class="copy" data-copy="${r.id}" aria-label="复制 ${r.id}">${icon('Copy')}</button></div></td><td><div class="name">${r.name}</div><div class="secondary-line">${r.name}</div><div class="small-line">${r.mode}</div></td><td class="usercell"><strong>138****0000</strong><div class="secondary-line">演示用户</div></td><td>${tenantNames[r.tenant]}</td><td class="spec">vCPU: ${r.cpu}核<br>系统盘: 100GB<br>内存: ${r.memory}GB${r.name.includes('RTX')?'<br>GPU: GeForce RTX 4090 8G':''}<br>数据盘: 0GB</td><td>${r.os}</td><td><span class="status ${cls}">${r.status}</span></td><td class="instance-connection"><span class="pc-connection-indicator ${connection}" role="img" aria-label="${connectionLabels[connection]}" tabindex="0"></span></td><td class="operations"><div class="actions">${details}${sync}${normal}</div><span class="sr-only" role="status">${working?'同步中':result?(result.ok?'同步成功，当前'+r.status:'同步失败：'+result.reason):''}</span></td></tr>`
 }).join('');if(!visible.length)$('instances').innerHTML='<tr><td colspan="10" style="text-align:center;color:#98a2b3">暂无符合条件的实例</td></tr>';
 $('count').textContent=`共 ${visible.length} 条`;$('selection').textContent=`已选择 ${selected.size} 项`;$('select-all').checked=visible.length>0&&visible.every(r=>selected.has(r.id));$('select-all').indeterminate=visible.some(r=>selected.has(r.id))&&!$('select-all').checked;renderBatch();
}
function toast(text){document.querySelector('.toast')?.remove();const el=document.createElement('div');el.className='toast';el.setAttribute('role','status');el.textContent=text;document.body.append(el);setTimeout(()=>el.remove(),3200)}
function timeString(){return new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(new Date())+'（北京时间）'}
async function sync(id,scenarioOverride){const r=rows.find(r=>r.id===id);if(!r||!canSync(r)||busy.has(id))return;const runVersion=version;const choice=scenarioOverride??$('scenario').value;const scenario=choice==='default'||choice==='mixed'?r.result:choice;
 busy.add(id);delete r.syncResult;$('reset-demo').disabled=true;render();
 await new Promise(resolve=>setTimeout(resolve,1400));
 if(runVersion!==version)return;
 // Local simulated backend response; successful write-back defines the billing start.
 if(['running','stopped','released'].includes(scenario)){
  const serverWriteTime=timeString();r.status={running:'运行中',stopped:'已关机',released:'已释放'}[scenario];r.writtenAt=serverWriteTime;r.billingStart=scenario==='running'?serverWriteTime:null;r.syncResult={ok:true};
  const successResult=r.syncResult;
  setTimeout(()=>{if(rows.includes(r)&&r.syncResult===successResult){delete r.syncResult;render()}},3000);
 }else{
  const reason={unknown:'底层状态不明确',queryFail:'底层状态查询失败',writeFail:'状态回写失败'}[scenario];
  r.syncResult={ok:false,reason};
 }
 busy.delete(id);render();return r.syncResult?.ok===true;
}
async function batchSync(retry=false){
 if(busy.size||batch?.working)return;
 const scope=retry?(batch?.failed??[]):[...selected];
 const targets=rows.filter(r=>scope.includes(r.id)&&canSync(r)&&(!retry||r.syncResult?.ok===false));
 if(!targets.length)return;
 const task={working:true,total:targets.length,done:0,success:0,failed:[],skipped:retry?0:scope.length-targets.length};
 batch=task;const choice=$('scenario').value;render();
 await Promise.all(targets.map(async (r,index)=>{const scenario=choice==='mixed'&&index===1?'queryFail':choice;const ok=await sync(r.id,scenario);task.done++;if(ok)task.success++;else task.failed.push(r.id);renderBatch()}));
 task.working=false;render();
 if(!task.failed.length)setTimeout(()=>{if(batch===task){batch=null;renderBatch()}},3000);
}

function detail(id){const r=rows.find(r=>r.id===id);$('details-body').innerHTML=`<div class="summary"><span>云电脑ID</span><strong>${r.id}</strong><span>云电脑名称</span><strong>${r.name}</strong><span>付费方式</span><strong>${r.mode}</strong><span>当前状态</span><strong>${r.status}</strong>${r.writtenAt?`<span>回写成功时间</span><strong>${r.writtenAt}</strong>`:''}${r.billingStart?`<span>恢复计费时间</span><strong>${r.billingStart}</strong>`:''}</div><p class="dialog-note">本次原型展示状态同步相关信息；其余实例详情沿用现有页面。</p>`;$('details-dialog').showModal()}
document.addEventListener('change',e=>{
 if(e.target.id==='search-type'){
  $('instance-search').placeholder=e.target.value==='name'?'请输入云电脑名称':'请输入云电脑ID';
 }
 const id=e.target.dataset.select;
 if(id){e.target.checked?selected.add(id):selected.delete(id);render()}
 else if(e.target.id==='select-all'){const checked=e.target.checked;for(const r of visibleRows())checked?selected.add(r.id):selected.delete(r.id);render()}
});
document.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b||b.disabled)return;
 if(b.dataset.sync){if(batch?.working)return;sync(b.dataset.sync)}
 else if(b.dataset.detail)detail(b.dataset.detail);
 else if(b.dataset.close)$(b.dataset.close).close();
 else if(b.dataset.existing)toast(b.dataset.existing+'沿用现有流程，本次原型未展开');
 else if(b.dataset.copy){if(navigator.clipboard)navigator.clipboard.writeText(b.dataset.copy).then(()=>toast('云电脑ID已复制')).catch(()=>toast('复制失败，请手动复制ID'));else toast('请手动复制ID')}
 else if(b.id==='batch-sync')batchSync();
 else if(b.id==='retry-failed')batchSync(true);
 else if(b.id==='rules')$('rules-dialog').showModal();
 else if(b.id==='demo-failure'){
  const r=rows.find(r=>canSync(r)&&!busy.has(r.id));
  if(!r){toast('暂无可演示的维护中实例，请先重置演示');return}
  $('scenario').value='queryFail';sync(r.id);
 }
 else if(b.id==='reset-demo'){
  version++;rows=structuredClone(initial);busy.clear();batch=null;$('scenario').value='default';resetFilters();render();
 }
 else if(b.id==='refresh-instances'){render();toast('数据已刷新')}
 else if(b.id==='query'){filter=readFilters();selected.clear();render()}
 else if(b.id==='reset-filters'){resetFilters();render()}
});
setIcons();render();
