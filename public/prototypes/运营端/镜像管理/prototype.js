'use strict';
const $=id=>document.getElementById(id);
const tenants=[{id:'TEN-SDUST',name:'示例科技大学（济南校区）'},{id:'TEN-QLU',name:'齐鲁工业大学'},{id:'TEN-SDNU',name:'山东师范大学'},{id:'TEN-TEST',name:'高校测试租户'}];
const regions=[{id:'DEMO-REGION-BAOSHAN',name:'鲍山机房-高可用'},{id:'DEMO-REGION-TEST',name:'测试机房（演示）'}];
const regionName=id=>regions.find(r=>r.id===id)?.name||id;
const sourceRegion=id=>['DEMO-QLU-WIN10','DEMO-QLU-PYTHON-V2','DEMO-UBUNTU-ROS2','DEMO-UBUNTU-DATA-V2'].includes(id)?regions[1].id:regions[0].id;
const seed=[
{id:'IMG-OPS-20261022-001',backendId:'DEMO-WIN11-BASE',name:'Windows 11 Pro',status:'可用',category:'系统镜像',visibility:'all',tenants:[],os:'Windows 11 Pro',scope:'仅系统盘',systemDisk:100,dataDisk:null,source:'底层镜像关联',created:'2026-10-22 09:30:00',description:'教学基础环境，安装通用办公软件',creator:'运营人员'},
{id:'IMG-OPS-20261021-002',backendId:'DEMO-SDUST-AI-V3',name:'山科大 · AI开发环境-v3',status:'可用',category:'自定义镜像',visibility:'specified',tenants:['TEN-SDUST'],os:'Windows 10 Pro',scope:'系统盘及数据盘',systemDisk:100,dataDisk:50,source:'云电脑创建',sourceId:'CPC-900000000000000006',created:'2026-10-21 16:20:00',description:'山科大教学专用，Python、CUDA、VS Code',creator:'租户管理员'},
{id:'IMG-OPS-20261020-003',backendId:'DEMO-UBUNTU-PYTORCH',name:'Ubuntu 22.04 · PyTorch',status:'可用',category:'社区镜像',visibility:'all',tenants:[],os:'Ubuntu 22.04',scope:'仅系统盘',systemDisk:100,dataDisk:null,source:'底层镜像关联',created:'2026-10-20 14:15:00',description:'PyTorch、JupyterLab深度学习环境',creator:'运营人员'},
{id:'IMG-OPS-20261020-004',backendId:'DEMO-QLU-WIN10',name:'齐鲁工大 · 计算机基础环境',status:'可用',category:'系统镜像',visibility:'specified',tenants:['TEN-QLU'],os:'Windows 10 Pro',scope:'仅系统盘',systemDisk:100,dataDisk:null,source:'底层镜像关联',created:'2026-10-20 10:05:00',description:'齐鲁工业大学专用教学镜像',creator:'运营人员'},
{id:'IMG-OPS-20261022-005',backendId:'DEMO-SDUST-AIGC-V4',name:'山科大 · AIGC实训环境-v4',status:'不可用',category:'社区镜像',visibility:'specified',tenants:['TEN-SDUST'],os:'Ubuntu 24.04',scope:'仅系统盘',systemDisk:150,dataDisk:null,source:'底层镜像关联',created:'2026-10-22 10:40:00',description:'AIGC课程实训，底层镜像暂不可用',creator:'运营人员'},
{id:'IMG-OPS-20261019-006',backendId:'DEMO-DATA-ANALYSIS',name:'Ubuntu · 数据分析环境',status:'不可用',category:'自定义镜像',visibility:'specified',tenants:['TEN-SDNU'],os:'Ubuntu 22.04',scope:'仅系统盘',systemDisk:100,dataDisk:null,source:'底层镜像关联',created:'2026-10-19 11:10:00',description:'数据分析课程环境',reason:'底层镜像暂不可用，请确认底层状态后再使用。',creator:'运营人员'},
{id:'IMG-OPS-20261016-007',backendId:'DEMO-WIN10-OLD',name:'Windows 10 · 教学旧版',status:'已移除',category:'系统镜像',visibility:'specified',tenants:['TEN-SDUST','TEN-SDNU'],os:'Windows 10 Pro',scope:'仅系统盘',systemDisk:100,dataDisk:null,source:'底层镜像关联',created:'2026-10-16 09:00:00',removedAt:'2026-10-21 15:30:00',description:'旧版环境已移除，保留历史记录',creator:'运营人员'}
];
seed.forEach(r=>r.regionId=sourceRegion(r.backendId));
let images=structuredClone(seed),filter={},page=1,editing=null,selectedTenants=new Set(),pendingSave=null,removeId=null,previewCategory='系统镜像',toastTimer=null,serial=8,lastFocus=null,lookupResult=null,lookupTimer=null,lookupVersion=0,lookupAttemptId=null,saving=false;
const esc=v=>String(v??'-').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const tenantName=id=>tenants.find(t=>t.id===id)?.name||id;
const icon=name=>`<i data-icon="${name}" aria-hidden="true" style="--icon:url('${name==='Plus'?'../../租户端/assets/create-cloud/plus.svg':'../云电脑实例/assets/'+name+'.svg'}')"></i>`;
function setIcons(){document.querySelectorAll('[data-icon]').forEach(e=>e.style.setProperty('--icon',`url('${e.dataset.icon==='Plus'?'../../租户端/assets/create-cloud/plus.svg':'../云电脑实例/assets/'+e.dataset.icon+'.svg'}')`))}
function now(){const d=new Date(),p=n=>String(n).padStart(2,'0');return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`}
function toast(message){clearTimeout(toastTimer);$('toast').textContent=message;$('toast').classList.remove('hidden');toastTimer=setTimeout(()=>$('toast').classList.add('hidden'),3000)}
function openDialog(id){lastFocus=document.activeElement;$(id).showModal()}
function closeDialog(id){if(id==='editor'){closeCloudPicker();resetLookup()}$(id).close();lastFocus?.focus?.()}
function filtered(){return images.filter(r=>{
const k=(filter.keyword||'').toLowerCase(),isRemoved=filter.status==='已移除'||filter.removed;
return (!k||(r.name+' '+r.id+' '+r.backendId).toLowerCase().includes(k))&&(!filter.category||r.category===filter.category)&&(!filter.status||r.status===filter.status)&&(isRemoved||r.status!=='已移除')&&(!filter.os||r.os.startsWith(filter.os))&&(!filter.tenant||(filter.tenant==='all'?r.visibility==='all':r.visibility==='all'||r.tenants.includes(filter.tenant)))&&(!filter.start||r.created.slice(0,10)>=filter.start)&&(!filter.end||r.created.slice(0,10)<=filter.end)
})}
function statusHTML(r){return `<span class="status ${r.status==='可用'?'ready':r.status==='已移除'?'removed':'failed'}">${r.status}</span>`}
function visibilityHTML(r){if(r.visibility==='all')return '<div class="visibility-label">全部租户</div><div class="visibility-sub">含后续新增租户</div>';return `<div class="visibility-label">${r.tenants.map(tenantName).map(esc).join('<br>')}</div><div class="visibility-sub">指定 ${r.tenants.length} 个租户</div>`}
function render(){const list=filtered(),pages=Math.max(1,Math.ceil(list.length/10));page=Math.min(page,pages);const shown=list.slice((page-1)*10,page*10);
$('image-rows').innerHTML=shown.map(r=>`<tr data-image-id="${r.id}"><td><div class="image-name">${esc(r.name)}</div><div class="image-id">${r.id}</div></td><td>${statusHTML(r)}</td><td><span class="category-tag ${r.category==='社区镜像'?'community':r.category==='自定义镜像'?'custom':''}">${r.category}</span></td><td>${visibilityHTML(r)}</td><td>${esc(r.os)}</td><td>${r.scope}</td><td><div class="spec">系统盘：${r.systemDisk} GiB<br>数据盘：${r.dataDisk===null?'-':r.dataDisk+' GiB'}</div></td><td><div class="image-source">${r.source}<div class="secondary-line">${esc(r.sourceId||r.backendId)}</div></div></td><td>${r.created.replace(' ','<br>')}</td><td>${esc(r.description)}</td><td class="operations"><div class="actions"><button class="text-button" data-detail="${r.id}" aria-label="查看详情 ${r.id}">详情</button>${r.status!=='已移除'?`<button class="text-button" data-edit="${r.id}" aria-label="编辑 ${r.id}">编辑</button><button class="text-button danger" data-remove="${r.id}" aria-label="移除 ${r.id}" >移除</button>`:''}</div></td></tr>`).join('')||'<tr><td colspan="11" class="empty-cell">暂无符合条件的镜像</td></tr>';
$('list-total').textContent=`镜像列表 · 共 ${list.length} 个`;$('page-count').textContent=list.length?`显示第 ${(page-1)*10+1}–${Math.min(page*10,list.length)} 条，共 ${list.length} 条`:'共 0 条';$('page-current').textContent=page;$('page-prev').disabled=page===1;$('page-next').disabled=page>=pages;
if($('preview').open)renderPreview();}
function collectFilters(){if($('filter-start').value&&$('filter-end').value&&$('filter-start').value>$('filter-end').value){toast('创建开始日期不能晚于结束日期');return}filter={keyword:$('filter-keyword').value.trim(),category:$('filter-category').value,status:$('filter-status').value,tenant:$('filter-tenant').value,os:$('filter-os').value,start:$('filter-start').value,end:$('filter-end').value,removed:$('show-removed').checked};page=1;render()}
function clearErrors(){['region','name','backend','os','disk','tenant'].forEach(k=>$(k+'-error').textContent='');document.querySelectorAll('.invalid').forEach(e=>e.classList.remove('invalid'))}
function getRadio(name){return document.querySelector(`input[name="${name}"]:checked`).value}
function setRadio(name,value){document.querySelectorAll(`input[name="${name}"]`).forEach(e=>e.checked=e.value===value)}
function updateVisibility(){const all=getRadio('visibility')==='all';$('tenant-selector').hidden=all;$('public-note').hidden=!all;$('tenant-error').textContent=''}
function renderTenantOptions(){const q=$('tenant-search').value.trim().toLowerCase(),list=tenants.filter(t=>(t.name+' '+t.id).toLowerCase().includes(q));$('tenant-options').innerHTML=list.map(t=>`<label class="tenant-choice"><input type="checkbox" data-tenant="${t.id}" ${selectedTenants.has(t.id)?'checked':''}><span>${esc(t.name)}<small>${t.id}</small></span></label>`).join('')||'<div class="preview-empty">未找到租户</div>';$('tenant-selection').textContent=`已选择${selectedTenants.size}个租户${selectedTenants.size?'：'+[...selectedTenants].map(tenantName).join('、'):''}`}
const mockBackend={
 'DEMO-SDUST-COURSE-V5':{name:'山科大 · 课程环境-v5',os:'Ubuntu 22.04',systemDisk:100,scope:'仅系统盘',dataDisk:null,availability:'available'},
 'DEMO-WINDOWS-NEW':{name:'Windows 11 Pro教学环境',os:'Windows 11 Pro',systemDisk:120,scope:'仅系统盘',dataDisk:null,availability:'available'},
 'DEMO-UBUNTU-NEW':{name:'Ubuntu开发环境',os:'Ubuntu 24.04',systemDisk:150,scope:'仅系统盘',dataDisk:null,availability:'available'}
};
seed.forEach(r=>mockBackend[r.backendId]={name:r.name,os:r.os,systemDisk:r.systemDisk,scope:r.scope,dataDisk:r.dataDisk,availability:r.status==='不可用'?'unavailable':'available'});
[
 ['DEMO-UBUNTU-BASE-24','Ubuntu 24.04 基础环境','Ubuntu 24.04',80],
 ['DEMO-WIN-SERVER-2022','Windows Server 2022 标准环境','Windows Server 2022',100],
 ['DEMO-SDUST-AIGC-V5','山科大 · AIGC实训环境-v5','Ubuntu 24.04',150],
 ['DEMO-QLU-PYTHON-V2','齐鲁工大 · Python教学-v2','Ubuntu 22.04',100],
 ['DEMO-UBUNTU-ROS2','Ubuntu 22.04 · ROS 2开发','Ubuntu 22.04',120],
 ['DEMO-WIN10-OFFICE','Windows 10 Pro · 办公环境','Windows 10 Pro',100],
 ['DEMO-UBUNTU-DATA-V2','Ubuntu · 数据分析环境-v2','Ubuntu 24.04',120],
 ['DEMO-LEGACY-WITH-DATA','历史教学环境 · 含数据盘','Windows 10 Pro',100]
].forEach(([id,name,os,systemDisk])=>mockBackend[id]={name,os,systemDisk,scope:id==='DEMO-LEGACY-WITH-DATA'?'系统盘及数据盘':'仅系统盘',dataDisk:id==='DEMO-LEGACY-WITH-DATA'?50:null,availability:'available'});
const cloudCatalog=Object.entries(mockBackend).map(([id,r])=>({id,regionId:sourceRegion(id),...r}));
const CATALOG_PAGE_SIZE=6;
let catalogQuery='',catalogPage=1,catalogTotal=0,catalogRows=[],catalogState='idle',catalogActiveId=null,catalogTimer=null,catalogDebounce=null,catalogVersion=0,autoImageName='';
const foldCatalog=v=>String(v).toLowerCase().replace(/\s+/g,'');
function catalogDisabledReason(r){if(images.some(image=>image.regionId===r.regionId&&image.backendId===r.id&&image.status!=='已移除'))return '已添加';if(r.availability!=='available')return '底层不可用';if(r.scope!=='仅系统盘')return '本期仅支持系统盘镜像';return ''}
function closeCloudPicker(){clearTimeout(catalogTimer);clearTimeout(catalogDebounce);catalogVersion++;$('cloud-image-menu').hidden=true;$('cloud-image-search').setAttribute('aria-expanded','false');$('cloud-image-search').removeAttribute('aria-activedescendant')}
function renderCloudCatalog(){
 const options=$('cloud-image-options'),footer=$('cloud-image-page');footer.hidden=catalogState!=='ready';
 if(catalogState==='loading'){options.innerHTML='<div class="cloud-catalog-state" role="status">正在加载 Cloud Pod 镜像…</div>';footer.innerHTML='';return}
 if(catalogState==='error'){options.innerHTML='<div class="cloud-catalog-state" role="status"><strong>镜像列表加载失败</strong><span>请稍后重试</span><button type="button" class="text-button" data-catalog-retry>重新加载</button></div>';footer.innerHTML='';return}
 const selectable=catalogRows.filter(r=>!catalogDisabledReason(r));
 if(!selectable.some(r=>r.id===catalogActiveId))catalogActiveId=selectable[0]?.id||null;
 options.innerHTML=catalogRows.length?catalogRows.map(r=>{const reason=catalogDisabledReason(r);return `<div id="cloud-option-${esc(r.id)}" class="cloud-candidate ${reason?'is-disabled':''} ${r.id===catalogActiveId?'is-active':''}" role="option" aria-selected="${$('backend-image-id').value===r.id}" aria-disabled="${!!reason}" data-cloud-id="${esc(r.id)}" title="${esc(r.name)}"><div class="cloud-candidate-main"><strong>${esc(r.name)}</strong><span class="cloud-candidate-id">${esc(r.id)}</span></div><div class="cloud-candidate-meta"><span>${esc(r.os)} · 至少 ${r.systemDisk} GiB</span>${reason?`<span class="cloud-candidate-reason">${reason}</span>`:''}</div></div>`}).join(''):'<div class="cloud-catalog-state" role="status"><strong>未找到匹配镜像</strong><span>请尝试其他镜像名称或 ID</span></div>';
 const pages=Math.max(1,Math.ceil(catalogTotal/CATALOG_PAGE_SIZE));
 footer.innerHTML=`<span>共 ${catalogTotal} 个 · ${catalogPage}/${pages} 页</span><div><button type="button" data-catalog-page="${catalogPage-1}" ${catalogPage===1?'disabled':''}>上一页</button><button type="button" data-catalog-page="${catalogPage+1}" ${catalogPage>=pages?'disabled':''}>下一页</button></div>`;
 if(catalogActiveId)$('cloud-image-search').setAttribute('aria-activedescendant','cloud-option-'+catalogActiveId);else $('cloud-image-search').removeAttribute('aria-activedescendant');
}
function queryCloudCatalog(){
 clearTimeout(catalogTimer);clearTimeout(catalogDebounce);const regionId=$('image-region').value;if(!regionId)return;const version=++catalogVersion;catalogState='loading';catalogRows=[];catalogActiveId=null;$('cloud-image-search').removeAttribute('aria-activedescendant');renderCloudCatalog();
 catalogTimer=setTimeout(()=>{if(version!==catalogVersion||regionId!==$('image-region').value||editing||!$('editor').open||$('cloud-image-menu').hidden)return;
  if($('demo-result').value==='catalog-failure'){catalogState='error';renderCloudCatalog();return}
  // Local mock of a region-scoped server query; production must pass regionId on list, detail and save requests.
  const query=foldCatalog(catalogQuery),matches=cloudCatalog.filter(r=>r.regionId===regionId&&(!query||foldCatalog(r.name).includes(query)||foldCatalog(r.id).includes(query)));
  catalogTotal=matches.length;catalogPage=Math.max(1,Math.min(catalogPage,Math.max(1,Math.ceil(catalogTotal/CATALOG_PAGE_SIZE))));catalogRows=matches.slice((catalogPage-1)*CATALOG_PAGE_SIZE,catalogPage*CATALOG_PAGE_SIZE);catalogState='ready';renderCloudCatalog();
 },280);
}
function openCloudPicker(){if(editing||!$('image-region').value)return;$('cloud-image-menu').hidden=false;$('cloud-image-search').setAttribute('aria-expanded','true');queryCloudCatalog()}
function clearCloudSelection(){
 if(autoImageName&&$('image-name').value.trim()===autoImageName)$('image-name').value='';autoImageName='';$('backend-image-id').value='';resetLookup();
}
function chooseCloudImage(id){
 if(editing)return;const r=cloudCatalog.find(row=>row.regionId===$('image-region').value&&row.id===id);if(!r||catalogDisabledReason(r))return;
 clearCloudSelection();$('backend-image-id').value=id;$('cloud-image-search').value=`${r.name} · ${id}`;catalogQuery='';closeCloudPicker();
 if(!$('image-name').value.trim()){$('image-name').value=r.name;autoImageName=r.name}
 lookupImage(true);
}
function resetLookup(){$('lookup-status').hidden=true;clearTimeout(lookupTimer);lookupAttemptId=null;lookupVersion++;lookupResult=null;$('image-os').value='';$('image-disk').value='';$('lookup-image').disabled=false;$('lookup-image').textContent='重试';$('lookup-image').hidden=true;$('lookup-feedback').textContent='';$('lookup-feedback').className='';$('backend-error').textContent='';$('editor-submit').disabled=!editing;}
function updateRegionControls(){const selected=!!$('image-region').value;$('cloud-image-search').disabled=!selected;$('cloud-image-search').placeholder=selected?'搜索该机房的镜像名称或 ID':'请先选择机房';$('toggle-cloud-picker').disabled=!selected;document.querySelector('.cloud-catalog-heading').textContent=selected?regionName($('image-region').value)+' · Cloud Pod 镜像':'Cloud Pod 镜像'}
function changeRegion(){closeCloudPicker();clearCloudSelection();$('cloud-image-search').value='';catalogQuery='';catalogPage=1;catalogRows=[];catalogTotal=0;catalogState='idle';catalogActiveId=null;$('region-error').textContent='';updateRegionControls()}
function openEditor(id=null,demo=false){editing=id;closeCloudPicker();resetLookup();clearErrors();saving=false;pendingSave=null;autoImageName='';catalogQuery='';catalogPage=1;const r=images.find(x=>x.id===id);if(r?.status==='已移除')return;
 $('editor-title').textContent=id?'编辑镜像':'添加镜像';$('editor-subtitle').textContent=id?'修改展示配置，不改变关联的 Cloud Pod 镜像和技术属性。':'选择机房及其 Cloud Pod 镜像，再设置展示分类和可见范围。';
 $('image-region').value=r?.regionId||(demo?regions[0].id:'');$('image-region').disabled=!!id;updateRegionControls();
 $('image-name').value=r?.name||'';$('backend-image-id').value=r?.backendId||'';$('cloud-image-search').value=r?`${r.backendName||mockBackend[r.backendId]?.name||r.name} · ${r.backendId}`:'';$('cloud-image-search').readOnly=!!id;$('cloud-image-search').setAttribute('aria-readonly',String(!!id));$('toggle-cloud-picker').hidden=!!id;
 $('image-os').value=r?.os||'';$('image-disk').value=r?.systemDisk||'';$('image-description').value=r?.description||'';$('description-count').textContent=$('image-description').value.length+' / 200';setRadio('category',r?.category||'系统镜像');setRadio('visibility',r?.visibility||'specified');selectedTenants=new Set(r?.tenants||[]);$('tenant-search').value='';renderTenantOptions();updateVisibility();$('editor-submit').textContent=id?'保存修改':'确认添加';$('lookup-feedback').textContent=id?'已关联 Cloud Pod 镜像；机房和技术属性不可修改。':'';$('lookup-status').hidden=!id;
 if(demo){setRadio('category','自定义镜像');selectedTenants.add('TEN-SDUST');renderTenantOptions()}
 openDialog('editor');document.querySelector('#editor .editor-body').scrollTop=0;if(demo)chooseCloudImage('DEMO-SDUST-COURSE-V5');
}
function lookupImage(force=false){const id=$('backend-image-id').value.trim(),regionId=$('image-region').value,result=$('demo-result').value;if(editing||!regionId||!id||!$('editor').open)return;const attemptKey=regionId+'/'+id;if(!force&&lookupAttemptId===attemptKey)return;resetLookup();lookupAttemptId=attemptKey;const version=lookupVersion;$('lookup-image').disabled=true;$('lookup-image').hidden=true;$('lookup-status').hidden=false;$('lookup-feedback').textContent='正在获取所选镜像属性…';
 lookupTimer=setTimeout(()=>{if(version!==lookupVersion||regionId!==$('image-region').value||id!==$('backend-image-id').value||!$('editor').open)return;$('lookup-image').disabled=false;const record=cloudCatalog.find(r=>r.regionId===regionId&&r.id===id),existing=images.find(r=>r.regionId===regionId&&r.backendId===id&&r.status!=='已移除');let error='';
 if(result==='failure')error='镜像属性获取失败，请重试';else if(result==='missing'||!record)error='该镜像已不存在，请重新选择';else if(result==='unavailable'||record.availability!=='available')error='该镜像当前不可用，请确认 Cloud Pod 状态';else if(existing)error='该镜像已添加，请在列表中查询或编辑';else if(record.scope!=='仅系统盘')error='本期仅支持系统盘镜像';
 if(error){$('lookup-image').hidden=!(result==='failure'||result==='unavailable');$('backend-error').textContent=error;$('lookup-feedback').textContent='未获取有效镜像信息';return}
 lookupResult={regionId,name:record.name,backendName:record.name,os:record.os,systemDisk:record.systemDisk,scope:record.scope,dataDisk:null,backendId:id};$('image-os').value=lookupResult.os;$('image-disk').value=lookupResult.systemDisk;if(!$('image-name').value.trim()){$('image-name').value=lookupResult.name;autoImageName=lookupResult.name}$('lookup-feedback').textContent='';$('lookup-status').hidden=true;$('editor-submit').disabled=false;
 },420)
}
function validate(){clearErrors();let ok=true;const fail=(key,text)=>{$(key+'-error').textContent=text;ok=false};const name=$('image-name').value.trim();if(!name)fail('name','请输入镜像名称');else if(images.some(r=>r.id!==editing&&r.status!=='已移除'&&r.name===name))fail('name','镜像名称已存在，请使用不同名称');if(!$('image-region').value)fail('region','请选择机房');if(!editing&&(!lookupResult||lookupResult.regionId!==$('image-region').value||lookupResult.backendId!==$('backend-image-id').value.trim()))fail('backend','请从 Cloud Pod 列表选择有效镜像');if(getRadio('visibility')==='specified'&&!selectedTenants.size)fail('tenant','请至少选择一个可见租户');return ok}
function collectEditor(){return {name:$('image-name').value.trim(),category:getRadio('category'),visibility:getRadio('visibility'),tenants:getRadio('visibility')==='all'?[]:[...selectedTenants],description:$('image-description').value.trim()||'-'}}
function submitEditor(e){e.preventDefault();if(saving||!validate())return;pendingSave=collectEditor();const before=images.find(r=>r.id===editing);if(pendingSave.visibility==='all'&&(!before||before.visibility!=='all')){$('public-copy').textContent=`镜像「${pendingSave.name}」将对所有现有及后续新增租户可见，展示在「${pendingSave.category}」页签。`;openDialog('public-confirm');return}saveEditor()}
function saveEditor(){if(saving||!pendingSave)return;if(!editing&&(!lookupResult||lookupResult.regionId!==$('image-region').value||lookupResult.backendId!==$('backend-image-id').value.trim()||images.some(r=>r.regionId===lookupResult.regionId&&r.backendId===lookupResult.backendId&&r.status!=='已移除'))){if($('public-confirm').open)$('public-confirm').close();toast('镜像信息已失效或已添加，请重新获取');return}saving=true;if($('public-confirm').open)$('public-confirm').close();if(editing){Object.assign(images.find(r=>r.id===editing),pendingSave,{updated:now()})}else{images.unshift({...lookupResult,...pendingSave,id:'IMG-OPS-20261104-'+String(serial++).padStart(3,'0'),status:'可用',source:'底层镜像关联',created:now(),creator:'运营人员'})}pendingSave=null;$('editor').close();closeCloudPicker();filter={};$('filter-form').reset();page=1;render();toast(editing?'镜像配置已更新':'镜像已添加，已按可见范围开放');saving=false;resetLookup()}
function showDetail(id){const r=images.find(x=>x.id===id);const entries=[['镜像名称',esc(r.name)],['镜像ID',r.id],['状态',statusHTML(r)],['展示分类',r.category],['可见范围',visibilityHTML(r)],['操作系统',esc(r.os)],['镜像范围',r.scope],['系统盘 / 数据盘',`${r.systemDisk} GiB / ${r.dataDisk===null?'-':r.dataDisk+' GiB'}`],['来源',esc(r.source)+(r.sourceId?'<br>'+esc(r.sourceId):'')],['所属机房',esc(regionName(r.regionId))],['底层镜像ID',esc(r.backendId)],['创建人',esc(r.creator)],['创建时间',r.created],['描述',esc(r.description)]];if(r.updated)entries.push(['修改时间',r.updated]);if(r.reason)entries.push(['失败原因',esc(r.reason)]);if(r.removedAt)entries.push(['移除时间',r.removedAt]);$('detail-body').innerHTML='<dl class="detail-grid">'+entries.map(([label,value])=>`<dt>${label}</dt><dd>${value}</dd>`).join('')+'</dl>';openDialog('detail')}
function askRemove(id){const r=images.find(x=>x.id===id);if(!r||r.status==='已移除')return;removeId=id;$('remove-name').textContent=r.name;$('remove-confirm').textContent='确认移除';openDialog('remove-dialog')}
function doRemove(){const r=images.find(x=>x.id===removeId);if(!r||r.status==='已移除')return;r.status='已移除';r.removedAt=now();$('remove-dialog').close();render();toast('镜像已移除，租户端不再展示')}
function renderPreview(){const tenant=$('preview-tenant').value;document.querySelectorAll('[data-preview-tab]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.previewTab===previewCategory)));const list=images.filter(r=>r.status==='可用'&&r.category===previewCategory&&(r.visibility==='all'||r.tenants.includes(tenant)));$('preview-list').innerHTML=list.map(r=>`<div class="preview-image"><img src="../../租户端/assets/create-cloud/${r.os.startsWith('Windows')?'windows.svg':'ubuntu.svg'}" alt=""><div><strong>${esc(r.name)}</strong><small>${esc(r.os)} · ${r.scope}<br>系统盘至少 ${r.systemDisk} GiB${r.dataDisk===null?'':' · 数据盘至少 '+r.dataDisk+' GiB'}</small></div></div>`).join('')||'<div class="preview-empty">暂无可选镜像</div>'}
function openPreview(){previewCategory='系统镜像';renderPreview();openDialog('preview')}
$('filter-tenant').insertAdjacentHTML('beforeend',tenants.map(t=>`<option value="${t.id}">${esc(t.name)}</option>`).join(''));$('preview-tenant').innerHTML=tenants.map(t=>`<option value="${t.id}">${esc(t.name)}</option>`).join('');
$('filter-form').onsubmit=e=>{e.preventDefault();collectFilters()};$('filter-reset').onclick=()=>{$('filter-form').reset();filter={};page=1;render()};$('show-removed').onchange=collectFilters;$('page-prev').onclick=()=>{page--;render()};$('page-next').onclick=()=>{page++;render()};
$('upload-open').onclick=()=>openEditor();$('demo-upload').onclick=()=>openEditor(null,true);$('rules').onclick=()=>openDialog('rules-dialog');document.addEventListener('click',event=>{if(!event.target.closest('#demo-reset'))return;editing=null;resetLookup();images=structuredClone(seed);serial=8;filter={};page=1;$('filter-form').reset();render();toast('已恢复演示数据')});
$('image-region').innerHTML='<option value="">请选择机房</option>'+regions.map(r=>`<option value="${r.id}">${esc(r.name)}</option>`).join('');$('image-region').onchange=changeRegion;
$('editor-form').onsubmit=submitEditor;$('public-confirm-save').onclick=saveEditor;$('lookup-image').onclick=()=>lookupImage(true);
$('cloud-image-search').onfocus=event=>{if(editing)return;catalogQuery='';catalogPage=1;event.target.select();openCloudPicker()};
$('cloud-image-search').onclick=()=>{if(!editing&&$('cloud-image-menu').hidden)openCloudPicker()};
$('cloud-image-search').oninput=()=>{if(editing)return;clearCloudSelection();catalogQuery=$('cloud-image-search').value;catalogPage=1;clearTimeout(catalogDebounce);clearTimeout(catalogTimer);catalogVersion++;catalogState='loading';catalogRows=[];catalogActiveId=null;$('cloud-image-menu').hidden=false;$('cloud-image-search').setAttribute('aria-expanded','true');$('cloud-image-search').removeAttribute('aria-activedescendant');renderCloudCatalog();catalogDebounce=setTimeout(queryCloudCatalog,250)};
$('cloud-image-search').onkeydown=event=>{
 if(editing||event.isComposing)return;const opened=!$('cloud-image-menu').hidden;
 if(event.key==='Escape'){if(opened){event.preventDefault();event.stopPropagation();closeCloudPicker()}return}
 if(event.key==='Tab'){closeCloudPicker();return}
 if(!['Enter','ArrowDown','ArrowUp'].includes(event.key))return;event.preventDefault();if(!opened){openCloudPicker();return}if(catalogState!=='ready')return;
 if(event.key==='Enter'){if(catalogActiveId)chooseCloudImage(catalogActiveId);return}
 const eligible=catalogRows.filter(r=>!catalogDisabledReason(r));if(!eligible.length)return;const at=eligible.findIndex(r=>r.id===catalogActiveId),delta=event.key==='ArrowDown'?1:-1;catalogActiveId=eligible[(at+delta+eligible.length)%eligible.length].id;renderCloudCatalog();$('cloud-option-'+catalogActiveId)?.scrollIntoView({block:'nearest'});
};
$('toggle-cloud-picker').onclick=()=>{if(editing)return;if(!$('cloud-image-menu').hidden){closeCloudPicker();return}$('cloud-image-search').focus();if($('cloud-image-menu').hidden)openCloudPicker()};
$('cloud-image-menu').onmousedown=event=>event.preventDefault();
$('cloud-image-menu').onclick=event=>{event.stopPropagation();const retry=event.target.closest('[data-catalog-retry]'),pager=event.target.closest('[data-catalog-page]'),option=event.target.closest('[data-cloud-id]');if(retry){queryCloudCatalog();return}if(pager&&!pager.disabled){catalogPage=Number(pager.dataset.catalogPage);queryCloudCatalog();return}if(option)chooseCloudImage(option.dataset.cloudId)};
document.addEventListener('click',event=>{if(!event.target.closest('.cloud-picker'))closeCloudPicker()});
document.querySelectorAll('input[name=visibility]').forEach(e=>e.onchange=updateVisibility);$('tenant-search').oninput=renderTenantOptions;$('tenant-options').onchange=e=>{const id=e.target.dataset.tenant;if(!id)return;if(e.target.checked)selectedTenants.add(id);else selectedTenants.delete(id);renderTenantOptions();$('tenant-error').textContent=''};$('image-description').oninput=()=>$('description-count').textContent=$('image-description').value.length+' / 200';
$('image-rows').onclick=e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.detail)showDetail(b.dataset.detail);if(b.dataset.edit)openEditor(b.dataset.edit);if(b.dataset.remove)askRemove(b.dataset.remove)};document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>closeDialog(b.dataset.close));document.querySelectorAll('dialog').forEach(d=>d.addEventListener('cancel',e=>{if(d.id==='editor'){closeCloudPicker();resetLookup()}}));$('remove-confirm').onclick=doRemove;$('preview-open').onclick=openPreview;$('preview-tenant').onchange=renderPreview;document.querySelectorAll('[data-preview-tab]').forEach(b=>b.onclick=()=>{previewCategory=b.dataset.previewTab;renderPreview()});setIcons();render();
