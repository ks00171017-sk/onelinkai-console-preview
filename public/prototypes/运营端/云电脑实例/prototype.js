'use strict';
const $=id=>document.getElementById(id);
const initial=[
 {id:'CPC-900000000000000013',name:'教学云电脑 · 增强型 16核32G',cpu:16,memory:32,mode:'计时付费',status:'维护中',result:'running',created:'2026-10-08',expiry:null},
 {id:'CPC-900000000000000014',name:'教学云电脑 · 增强型 16核32G',cpu:16,memory:32,mode:'计时付费',status:'维护中',result:'released',created:'2026-10-07',expiry:null},
 {id:'CPC-900000000000000015',name:'教学云电脑 · 标准型 8核16G',cpu:8,memory:16,mode:'包月',status:'维护中',created:'2026-10-01',expiry:'2026-11-01'},
 {id:'CPC-900000000000000016',name:'教学云电脑 · GPU型 RTX4090',cpu:16,memory:32,mode:'计时付费',status:'运行中',created:'2026-10-05',expiry:null},
 {id:'CPC-900000000000000017',name:'教学云电脑 · 标准型 8核16G',cpu:8,memory:16,mode:'计时付费',status:'已释放',created:'2026-10-02',expiry:'2026-10-03'}
];
let rows=structuredClone(initial),selected=new Set(),busy=new Set(),filter=null,version=0;
function icon(name){return `<i data-icon="${name}" style="--icon:url('assets/${name}.svg')" aria-hidden="true"></i>`}
function setIcons(){document.querySelectorAll('[data-icon]').forEach(e=>e.style.setProperty('--icon',`url('assets/${e.dataset.icon}.svg')`))}
function visibleRows(){return rows.filter(r=>!filter||(!filter.cs||r.created>=filter.cs)&&(!filter.ce||r.created<=filter.ce)&&(!filter.es||r.expiry&&r.expiry>=filter.es)&&(!filter.ee||r.expiry&&r.expiry<=filter.ee))}
function render(){const visible=visibleRows();$('instances').innerHTML=visible.map(r=>{
 const eligible=r.mode==='计时付费'&&r.status==='维护中',working=busy.has(r.id);
 const cls={'维护中':'maintaining','运行中':'running','已关机':'stopped','已释放':'released'}[r.status];
 const details=`<button class="text-button" data-detail="${r.id}">${icon('Eye')}查看详情</button>`;
 const result=r.syncResult;
 const sync=working?`<button class="text-button sync-button busy" data-sync="${r.id}" aria-label="同步状态 ${r.id}" disabled>${icon('LoadingOutlined')}同步中</button>`:result?.ok?`<span class="sync-result sync-success" aria-label="同步成功 ${r.id}" title="${r.status} · ${r.writtenAt}">${icon('CheckCircleFilled')}同步成功</span>`:eligible?result?`<div class="sync-control"><div class="sync-result-line"><span class="sync-result sync-error">${icon('CloseCircleFilled')}同步失败</span><button class="text-button sync-retry" data-sync="${r.id}" aria-label="重试同步 ${r.id}">重试</button></div><small class="failure-reason">${result.reason}</small></div>`:`<button class="text-button sync-button" data-sync="${r.id}" aria-label="同步状态 ${r.id}">${icon('SyncOutlined')}同步状态</button>`:'';
 const normal=r.status==='运行中'?`<button class="text-button shutdown" data-existing="关机">${icon('Power')}关机</button><button class="text-button release" data-existing="释放">${icon('XCircle')}释放</button>`:'';
 return `<tr data-instance="${r.id}"><td><input type="checkbox" data-select="${r.id}" aria-label="选择 ${r.id}" ${selected.has(r.id)?'checked':''}></td><td><div class="id-cell"><strong class="instance-id">${r.id.slice(0,14)}<br>${r.id.slice(14)}</strong><button class="copy" data-copy="${r.id}" aria-label="复制 ${r.id}">${icon('Copy')}</button></div></td><td><div class="name">${r.name}</div><div class="secondary-line">${r.name}</div><div class="small-line">${r.mode}</div></td><td class="usercell"><strong>138****0000</strong><div class="secondary-line">演示用户</div></td><td class="spec">vCPU: ${r.cpu}核<br>系统盘: 100GB<br>内存: ${r.memory}GB${r.name.includes('RTX')?'<br>GPU: GeForce RTX 4090 8G':''}<br>数据盘: 0GB</td><td>Windows 10</td><td><span class="status ${cls}">${r.status}</span></td><td class="operations"><div class="actions">${details}${sync}${normal}</div><span class="sr-only" role="status">${working?'同步中':result?(result.ok?'同步成功，当前'+r.status:'同步失败：'+result.reason):''}</span></td></tr>`
 }).join('');if(!visible.length)$('instances').innerHTML='<tr><td colspan="8" style="text-align:center;color:#98a2b3">暂无符合条件的实例</td></tr>';
 $('count').textContent=`共 ${visible.length} 条`;$('selection').textContent=`已选择 ${selected.size} 项`;$('select-all').checked=visible.length>0&&visible.every(r=>selected.has(r.id));$('select-all').indeterminate=visible.some(r=>selected.has(r.id))&&!$('select-all').checked;
}
function toast(text){document.querySelector('.toast')?.remove();const el=document.createElement('div');el.className='toast';el.setAttribute('role','status');el.textContent=text;document.body.append(el);setTimeout(()=>el.remove(),3200)}
function timeString(){return new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(new Date())+'（北京时间）'}
async function sync(id){const r=rows.find(r=>r.id===id);if(!r||r.status!=='维护中'||r.mode!=='计时付费'||busy.has(id))return;const runVersion=version;const scenario=$('scenario').value==='default'?r.result:$('scenario').value;
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
 busy.delete(id);$('reset-demo').disabled=busy.size>0;render();
}
function detail(id){const r=rows.find(r=>r.id===id);$('details-body').innerHTML=`<div class="summary"><span>云电脑ID</span><strong>${r.id}</strong><span>云电脑名称</span><strong>${r.name}</strong><span>付费方式</span><strong>${r.mode}</strong><span>当前状态</span><strong>${r.status}</strong>${r.writtenAt?`<span>回写成功时间</span><strong>${r.writtenAt}</strong>`:''}${r.billingStart?`<span>恢复计费时间</span><strong>${r.billingStart}</strong>`:''}</div><p class="dialog-note">本次原型展示状态同步相关信息；其余实例详情沿用现有页面。</p>`;$('details-dialog').showModal()}
$('instances').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.sync)sync(b.dataset.sync);else if(b.dataset.detail)detail(b.dataset.detail);else if(b.dataset.existing)toast(b.dataset.existing+'沿用现有流程，本次原型未展开');else if(b.dataset.copy){if(navigator.clipboard)navigator.clipboard.writeText(b.dataset.copy).then(()=>toast('云电脑ID已复制')).catch(()=>toast('复制失败，请手动复制ID'));else toast('请手动复制ID')}});
$('instances').addEventListener('change',e=>{const id=e.target.dataset.select;if(id){e.target.checked?selected.add(id):selected.delete(id);render()}});
$('select-all').onchange=e=>{for(const r of visibleRows())e.target.checked?selected.add(r.id):selected.delete(r.id);render()};
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>$(b.dataset.close).close());$('rules').onclick=()=>{$('rules-dialog').showModal()};
$('demo-failure').onclick=()=>{
 const r=rows.find(r=>r.id==='CPC-900000000000000014'&&r.mode==='计时付费'&&r.status==='维护中'&&!busy.has(r.id))||rows.find(r=>r.mode==='计时付费'&&r.status==='维护中'&&!busy.has(r.id));
 if(!r){toast('暂无可演示的维护中实例，请先重置演示');return}
 $('scenario').value='queryFail';sync(r.id);
};
$('reset-demo').onclick=()=>{version++;rows=structuredClone(initial);selected.clear();busy.clear();filter=null;$('scenario').value='default';document.querySelectorAll('.filters input').forEach(e=>e.value='');$('region').value='all';render()};
$('query').onclick=()=>{filter={cs:$('created-start').value,ce:$('created-end').value,es:$('expiry-start').value,ee:$('expiry-end').value};selected.clear();render()};
$('reset-filters').onclick=()=>{filter=null;selected.clear();document.querySelectorAll('.filters input').forEach(e=>e.value='');$('region').value='all';render()};
setIcons();render();
