import React, { useEffect, useRef, useState } from "react";
import { consoleHomePage, createConsoleState, selectConsoleScope } from "./console-scope.js";
import { ConsoleHome, UnifiedBills, ProductSwitcher, ProductBillingRecords } from "./ConsoleHub.jsx";
import "./console-hub.css";
import {
  ArrowClockwise,
  ArrowRight,
  ArrowUpRight,
  ArrowsDownUp,
  Bell,
  BookOpen,
  Brain,
  CalendarBlank,
  CaretDown,
  CaretLeft,
  CaretRight,
  ChartBar,
  Check,
  Copy,
  Cpu,
  CurrencyCny,
  Database,
  DotsThreeVertical,
  DownloadSimple,
  Export,
  FileText,
  Funnel,
  Gift,
  HardDrives,
  House,
  Key,
  MagnifyingGlass,
  Monitor,
  Moon,
  MinusCircle,
  Plus,
  PuzzlePiece,
  Question,
  Receipt,
  RocketLaunch,
  SignOut,
  SlidersHorizontal,
  SquaresFour,
  Sun,
  TextT,
  Translate,
  TreeStructure,
  User,
  UsersThree,
  Wallet,
  X,
} from "@phosphor-icons/react";

const TENANTS = [
  {
    id: "school",
    name: "示例科技大学",
    short: "山",
    type: "学校",
    enabledProducts: ["api", "gpu", "desk"],
  },
  {
    id: "enterprise",
    name: "示例科技有限公司",
    short: "企",
    type: "企业",
    enabledProducts: ["api", "gpu", "desk"],
  },
];

const PRODUCT_NAV = [
  {
    id: "api",
    label: "AI 模型服务",
    icon: Key,
    items: [
      { id: "api-dashboard", label: "可观测性" },
      { id: "models", label: "模型", external: "https://onelinkai.cloud/pricingList" },
      { id: "api-key", label: "API key" },
      { id: "memory", label: "团队记忆" },
      { id: "prompt", label: "提示词管理" },
      { id: "skill", label: "Skill托管" },
      { id: "api-billing", label: "计费记录" },
    ],
  },
  {
    id: "gpu",
    label: "GPU Cloud",
    icon: Cpu,
    items: [
      { id: "gpu-overview", label: "概览" },
      {
        id: "gpu-instance-group",
        label: "容器实例",
        children: [
          { id: "gpu-personal-instance", label: "个人实例" },
          { id: "gpu-org-instance", label: "组织实例" },
        ],
      },
      {
        id: "gpu-data-group",
        label: "数据管理",
        children: [
          { id: "gpu-public-data", label: "公开数据集" },
          { id: "gpu-shared-data", label: "共享数据集" },
        ],
      },
      { id: "gpu-orders", label: "订单" },
      { id: "gpu-billing", label: "计费记录" },
    ],
  },
  {
    id: "desk",
    label: "GPU 云电脑",
    icon: Monitor,
    items: [
      { id: "desk-computer", label: "云电脑" },
      { id: "desk-disk", label: "云硬盘" },
      { id: "desk-terminal", label: "终端管理" },
      { id: "desk-place", label: "场所管理" },
      { id: "desk-orders", label: "订单" },
      { id: "desk-billing", label: "计费记录" },
      {
        id: "term-group",
        label: "课程管理",
        schoolOnly: true,
        children: [
          { id: "term-year", label: "学期学年", schoolOnly: true },
          { id: "term-course", label: "课程档案", schoolOnly: true },
          { id: "term-task", label: "开课任务", schoolOnly: true },
          { id: "term-schedule", label: "排课管理", schoolOnly: true },
          { id: "term-mapping", label: "节次映射", schoolOnly: true },
        ],
      },
    ],
  },
];

const MANAGE_NAV = [
  {
    id: "account-manage",
    label: "账户",
    icon: Wallet,
    items: [
      { id: "account-funds", label: "账户资金" },
      { id: "bills", label: "账单" },
      { id: "recharge-orders", label: "充值记录" },
      { id: "gift-records", label: "赠金记录" },
    ],
  },
  {
    id: "organization",
    label: "组织",
    icon: UsersThree,
    items: [
      { id: "org-tree", label: "组织架构" },
      { id: "user-list", label: "用户列表" },
      { id: "org-info", label: "组织信息" },
    ],
  },
];

const PAGE_LABELS = {
  dashboard: "首页",
  "api-key": "API key",
  memory: "团队记忆",
  prompt: "提示词管理",
  skill: "Skill托管",
  "api-billing": "计费记录",
  "gpu-overview": "概览",
  "gpu-personal-instance": "个人实例",
  "gpu-org-instance": "组织实例",
  "gpu-public-data": "公开数据集",
  "gpu-shared-data": "共享数据集",
  "gpu-orders": "订单",
  "gpu-billing": "计费记录",
  "desk-computer": "云电脑管理",
  "desk-disk": "云硬盘",
  "desk-terminal": "终端管理",
  "desk-place": "场所管理",
  "desk-orders": "订单",
  "desk-billing": "计费记录",
  "term-year": "学期学年",
  "term-course": "课程档案",
  "term-task": "开课任务",
  "term-schedule": "排课管理",
  "term-mapping": "节次映射",
  "account-funds": "账户资金",
  "recharge-orders": "充值记录",
  "gift-records": "赠金记录",
  "user-list": "用户列表",
  "org-tree": "组织架构",
  "org-info": "组织信息",
};

function visibleItems(items, tenant) {
  return items
    .filter((item) => !item.schoolOnly || tenant.type === "学校")
    .map((item) => ({
      ...item,
      children: item.children ? visibleItems(item.children, tenant) : undefined,
    }));
}

function containsPage(items, page) {
  return items.some((item) => item.id === page || (item.children && containsPage(item.children, page)));
}

function NavButton({ icon: Icon, label, active, expanded, onClick, hasChildren }) {
  return (
    <button className={`nav-item ${active ? "active" : ""}`} onClick={onClick}>
      {Icon ? <Icon size={18} weight={active ? "fill" : "regular"} /> : null}
      <span>{label}</span>
      {hasChildren ? expanded ? <CaretDown size={14} /> : <CaretRight size={14} /> : null}
    </button>
  );
}

function TenantSpaceSwitcher({ tenant, tenants, onSelect }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const dismiss = (event) => {
      if (!wrapRef.current?.contains(event.target)) setOpen(false);
    };
    const escape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  const choose = (nextTenant) => {
    setOpen(false);
    if ((tenant?.id ?? null) !== (nextTenant?.id ?? null)) onSelect(nextTenant);
  };

  const currentName = tenant?.name ?? "个人空间";

  return (
    <div className="tenant-wrap sidebar-tenant-switcher" ref={wrapRef}>
      <button
        className={`tenant-switch ${open ? "open" : ""}`}
        ref={triggerRef}
        aria-label={`切换空间，当前：${currentName}`}
        aria-expanded={open}
        aria-controls="sidebar-tenant-menu"
        aria-haspopup="menu"
        onClick={() => setOpen((current) => !current)}
      >
        <strong className="space-current">{currentName}</strong>
        <ArrowsDownUp className="space-switch-icon" size={17} aria-hidden="true" />
      </button>
      {open ? (
        <div className="tenant-menu space-menu" id="sidebar-tenant-menu" role="menu" aria-label="切换空间">
          <button className="space-option" role="menuitemradio" aria-checked={!tenant} onClick={() => choose(null)}>
            <span className="space-option-label">个人空间</span>
            {!tenant ? <Check size={17} aria-hidden="true" /> : null}
          </button>
          <div className="menu-divider" />
          {tenants.map((item) => (
            <button className="space-option" role="menuitemradio" aria-checked={tenant?.id === item.id} key={item.id} onClick={() => choose(item)}>
              <span className="space-option-label">{item.name}</span>
              {tenant?.id === item.id ? <Check size={17} aria-hidden="true" /> : null}
            </button>
          ))}
          <div className="menu-divider" />
          <button className="space-option space-create" role="menuitem" onClick={() => { setOpen(false); window.alert("创建组织入口（演示）"); }}><span className="space-option-label">创建组织</span><Plus size={18} aria-hidden="true" /></button>
        </div>
      ) : null}
    </div>
  );
}

function Sidebar({ tenant, tenants = [], page, onNavigate, onScopeChange }) {
  const productNav = tenant ? PRODUCT_NAV : PERSONAL_PRODUCT_NAV;
  const manageNav = tenant ? MANAGE_NAV : PERSONAL_MANAGE_NAV;
  const currentProduct = tenant ? productNav.find(group => containsPage(group.items, page)) : null;

  const navigateDirect = (target) => {
    onNavigate(target);
  };

  const renderChild = (item) => {
    if (item.external) {
      return (
        <a className="nav-item nav-subitem nav-link" href={item.external} key={item.id} rel="noreferrer" target="_blank">
          <span className="nav-dot" />
          <span>{item.label}</span>
        </a>
      );
    }
    if (item.children) {
      const active = containsPage(item.children, page);
      return (
        <div className={`nested-nav ${active ? "nested-active" : ""}`} key={item.id}>
          <div className={`nav-item nav-subitem nav-nested-label ${active ? "nested-current" : ""}`}>
            <span className="nav-dot" />
            <span>{item.label}</span>
          </div>
          <div className="third-nav">
            {item.children.map((child) => (
              <button
                className={`nav-item nav-thirditem ${page === child.id ? "active" : ""}`}
                key={child.id}
                onClick={() => onNavigate(child.id)}
              >
                <span>{child.label}</span>
              </button>
            ))}
          </div>
        </div>
      );
    }
    return (
      <button
        className={`nav-item nav-subitem ${page === item.id ? "active" : ""}`}
        key={item.id}
        onClick={() => onNavigate(item.id)}
      >
        <span className="nav-dot" />
        <span>{item.label}</span>
      </button>
    );
  };

  const renderGroup = (group, isProduct = false) => {
    if (isProduct && tenant && !tenant.enabledProducts.includes(group.id)) return null;
    const items = tenant ? visibleItems(group.items, tenant) : group.items;
    const active = containsPage(items, page);
    return (
      <div className={`product-nav ${active ? "product-active" : ""}`} key={group.id}>
        <div className={`nav-item nav-group-label ${active ? "group-current" : ""}`}><group.icon size={18} weight={active ? "fill" : "regular"} /><span>{group.label}</span></div>
        <div className="subnav">{items.map(renderChild)}</div>
      </div>
    );
  };

  return (
    <aside className="sidebar">
      <a className="brand" href="#/home" title="返回 OneLinkAI 官网首页（本地演示）">
        <img src="./assets/onelinkai-logo.png" alt="OneLinkAI" />
      </a>
      <TenantSpaceSwitcher tenant={tenant} tenants={tenants} onSelect={onScopeChange} />
      <nav className="main-nav" aria-label={tenant ? "租户控制台" : "个人控制台"}>
        <NavButton icon={House} label="首页" active={page === (tenant ? "dashboard" : "personal-home")} onClick={() => navigateDirect(tenant ? "dashboard" : "personal-home")} />
        {tenant && currentProduct ? <div className="hub-product-nav"><div className="hub-product-title">{currentProduct.label}</div>{visibleItems(currentProduct.items, tenant).map(renderChild)}</div> : null}
        {!tenant ? productNav.map((group) => renderGroup(group, true)) : null}
        <div className="nav-section-label">管理</div>
        {manageNav.map((group) => renderGroup(group))}
        {!tenant ? <div className="personal-program-nav">{PERSONAL_PROGRAM_NAV.map((item) => <NavButton key={item.id} icon={item.icon} label={item.label} active={page === item.id} onClick={() => navigateDirect(item.id)} />)}</div> : null}
      </nav>
    </aside>
  );
}

function ScopeOptions({ tenant, tenants, onSelect, onCreate }) {
  return (
    <>
      <div className="profile-scopes" role="group" aria-label="切换组织空间">
        {tenants.map((item) => (
          <button className={`scope-option ${tenant?.id === item.id ? "selected" : ""}`} key={item.id} aria-pressed={tenant?.id === item.id} onClick={() => onSelect(item)}>
            <UsersThree size={18} />
            <span className="scope-option-label"><strong>{item.name}</strong><small>{item.type}租户</small></span>
            {tenant?.id === item.id ? <Check size={15} aria-hidden="true" /> : null}
          </button>
        ))}
      </div>
      <button className="profile-create-tenant" onClick={onCreate}><Plus size={17} />创建租户</button>
    </>
  );
}

function Topbar({ tenant, tenants, onScopeChange, onNavigate, page, website = false }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [darkSelected, setDarkSelected] = useState(false);
  const [toast, setToast] = useState("");
  const profileRef = useRef(null);
  const profileTriggerRef = useRef(null);
  useEffect(() => {
    if (!profileOpen) return;
    const dismiss = (event) => {
      if (!profileRef.current?.contains(event.target)) setProfileOpen(false);
    };
    const escape = (event) => {
      if (event.key === "Escape") {
        setProfileOpen(false);
        profileTriggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", escape);
    };
  }, [profileOpen]);
  const notify = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 1800);
  };
  const selectScope = (nextTenant) => {
    onScopeChange(nextTenant);
    setProfileOpen(false);
    profileTriggerRef.current?.focus();
  };
  return (
    <header className={website ? "topbar website-header" : "topbar"}>
      {website ? <>
        <a className="website-logo" href="#/home" aria-label="OneLinkAI 官网首页"><img src="./assets/website-logo.svg" alt="OneLinkAI" /></a>
        <nav className="website-nav" aria-label="官网导航">{["算力市场", "模型广场", "模型体验", "GPU 云电脑", "OLA Studio", "文档"].map((label) => <button key={label} onClick={() => notify(`${label}入口（演示），本次不展开官网子页面。`)}>{label}</button>)}</nav>
      </> : <div className="topbar-spacer">{tenant ? <ProductSwitcher tenant={tenant} page={page} onNavigate={onNavigate} /> : null}</div>}
      <div className="topbar-actions">
        <button className="top-console-button" onClick={() => onNavigate(consoleHomePage(tenant))}><SquaresFour size={18} />{website ? "控制台" : "Console"}</button>
        {!website ? <><button className="top-icon-button" aria-label="文档" title="文档" onClick={() => notify("已打开文档入口")}><FileText size={20} /></button>
        <button className="top-icon-button notice-icon-button" aria-label="站内信，有未读消息" title="站内信" onClick={() => notify("站内信")}>
          <Bell size={20} /><i aria-hidden="true" />
        </button></> : null}
        <div className="profile-wrap" ref={profileRef}>
          <button className="profile-button scope-profile-trigger" ref={profileTriggerRef} aria-label={`个人与租户切换，当前：${tenant?.name ?? "个人"}`} aria-expanded={profileOpen} aria-controls="profile-panel" aria-haspopup="dialog" title={tenant?.name ?? "个人 · 演示用户"} onClick={() => setProfileOpen(!profileOpen)}>
            <span className="scope-trigger-icon">{tenant ? <UsersThree size={19} /> : <User size={19} />}</span>
            <strong>{tenant?.name ?? "个人"}</strong><CaretDown size={13} />
          </button>
          {profileOpen ? (
            <div className="profile-menu scope-profile-menu" id="profile-panel" role="dialog" aria-label="个人与租户切换">
              <ScopeOptions tenant={tenant} tenants={tenants} onSelect={selectScope} onCreate={() => notify("创建租户入口（演示）")} />
              {tenant ? <><div className="menu-divider" /><button className="profile-return-personal" onClick={() => selectScope(null)}><User size={17} />返回个人版</button></> : null}
              <div className="menu-divider" />
              <button onClick={() => notify("中英文切换入口")}><Translate size={17} />中英文切换</button>
              <div className="menu-divider" />
              <button onClick={() => notify("退出为演示操作")}><SignOut size={17} />退出</button>
              <div className="profile-theme-options" role="group" aria-label="主题切换">
                <button title="浅色模式" aria-label="浅色模式" aria-pressed={!darkSelected} onClick={() => { setDarkSelected(false); notify("浅色主题入口（演示）"); }}><Sun size={18} /></button>
                <button title="深色模式" aria-label="深色模式" aria-pressed={darkSelected} onClick={() => { setDarkSelected(true); notify("深色主题入口（演示）"); }}><Moon size={18} /></button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
      {toast ? <div className="toast"><Check size={16} />{toast}</div> : null}
    </header>
  );
}

function PageHeader({ title, subtitle, children }) {
  return (
    <div className="page-header">
      <div><h1>{title}</h1>{subtitle ? <p>{subtitle}</p> : null}</div>
      {children ? <div className="page-actions">{children}</div> : null}
    </div>
  );
}

function EmptyState({ text = "暂无数据", note }) {
  return (
    <div className="plain-empty">
      <MagnifyingGlass size={42} weight="thin" />
      <span>{text}</span>
      {note ? <small>{note}</small> : null}
    </div>
  );
}

function Dashboard() {
  const tabs = ["总览", "消耗分析", "缓存命中", "报错分析", "延迟分析", "多媒体模型"];
  const cards = [
    ["可用额度", "¥128.00"], ["累计充值", "¥5,000.00"], ["累计消费", "¥120.00"], ["赠金", "¥0.00"],
  ];
  return (
    <>
      <PageHeader title="可观测性"><button className="text-button"><ChartBar size={17} />指标管理</button><button className="text-button"><SlidersHorizontal size={17} />布局设置</button></PageHeader>
      <div className="dashboard-tabs">{tabs.map((tab, index) => <button className={index === 0 ? "active" : ""} key={tab}>{tab}</button>)}</div>
      <div className="dashboard-filter"><button className="icon-button"><ArrowClockwise size={18} /></button><div className="filter-input"><Funnel size={16} />添加筛选项</div><div className="range-group"><button>近1小时</button><button className="selected">近1天</button><button>近30天</button><button>自定义</button></div></div>
      <div className="dashboard-metrics">
        {cards.map(([label, value]) => <div className="metric-card" key={label}><span>{label}</span><strong>{value}</strong></div>)}
        <div className="metric-card wide"><span>请求数</span><strong>0</strong></div>
        <div className="metric-card wide"><span>总 token</span><strong>0</strong><small>输入　0　　输出　0　　缓存　0</small></div>
        <div className="metric-card chart"><span>用量汇总</span><strong>0</strong><small>时间段内 Token 用量走势（输入/缓存/输出）</small></div>
        <div className="metric-card chart"><span>消费汇总</span><strong>¥0.00</strong><small>时间段内消费金额走势</small></div>
      </div>
    </>
  );
}

function ApiKeyPage({ onDemoAction } = {}) {
  return (
    <>
      <PageHeader title="API key" subtitle="管理您的API密钥以从OneLink Router 访问所有模型"><button className="primary-button api-create-button" onClick={() => onDemoAction?.("创建API密钥")}><Plus size={16} />创建API密钥</button></PageHeader>
      <div className="endpoint-row"><span>API 调用地址：</span><code>https://api.onelinkai.cloud</code><span className="toolbar-spacer" /><button className="link-button" onClick={() => onDemoAction?.("查看API文档")}>查看API文档</button></div>
      <div className="content-card table-card exact-table">
        <table><thead><tr><th>密钥</th><th>用量</th><th>限制</th><th>操作</th></tr></thead>
          <tbody><tr><td><strong>豆包视频</strong><small>sk-demo-****-example <Copy size={14} /></small></td><td>¥ 0</td><td><strong>不限制</strong><small>总数</small></td><td><button className="icon-button" aria-label="更多操作" onClick={() => onDemoAction?.("密钥操作")}><DotsThreeVertical size={18} /></button></td></tr></tbody></table>
      </div>
    </>
  );
}

const PERSONAL_API_HEADERS = ["时间", "Key", "提供商/模型", "应用程序", "Tokens", "缓存命中", "消费金额", "吞吐量"];

function ApiLogContent({ personal = false } = {}) {
  return (
    <div className="api-log-content">
      <div className="billing-range-row"><span className="toolbar-spacer" /><div className="range-group"><button>近 1 小时</button><button>近 1 天</button><button className="selected">近 1 月</button><button>近 1 年</button></div></div>
      <div className="record-stats compact">{["花费", "Tokens", "请求", "消费占比"].map((label) => <div key={label}><strong>{label}</strong><ChartBar size={38} weight="thin" /><span><i />平均每天 0</span><span><i className="green" />过去一月 0</span></div>)}</div>
      <div className="record-toolbar"><span>从：</span><button>请选择日期及时间</button><span>到：</span><button>请选择日期及时间</button><span className="toolbar-spacer" /><button className="secondary-button"><Funnel size={16} />筛选</button><button className="secondary-button">导出</button></div>
      <table><thead><tr>{(personal ? PERSONAL_API_HEADERS : ["时间", "Key", "提供商/模型", "应用程序", "用户", "Tokens", "缓存命中", "消费金额", "吞吐量"]).map((item) => <th key={item}>{item}</th>)}</tr></thead>{personal ? <tbody><tr><td>2026-01-23<br />09:42:39</td><td>no-key</td><td>天翼云 / DeepSeek:<br />DeepSeek R1 0528</td><td>-</td><td>文本输入：10　|　文本输出：586</td><td>0</td><td>¥0.009416</td><td>20 tps</td></tr></tbody> : null}</table>
      {personal ? <div className="funds-record-pagination"><span>显示第 1 条-第 1 条，共 1 条</span><div><button disabled aria-label="上一页"><CaretLeft size={16} /></button><button aria-label="第1页" aria-current="page">1</button><button disabled aria-label="下一页"><CaretRight size={16} /></button></div></div> : <EmptyState />}
    </div>
  );
}

function GpuPage({ page, personal = false }) {
  const title = personal ? "容器实例" : PAGE_LABELS[page];
  if (page === "gpu-public-data" || page === "gpu-shared-data") return <SimpleExistingPage title={title} />;
  const isOverview = page === "gpu-overview";
  return (
    <>
      <PageHeader title={title} subtitle={isOverview ? undefined : "管理和监控您的 GPU 算力实例"}>{personal ? <a className="primary-button" href="https://onelinkai.cloud/gpucloud" target="_blank" rel="noreferrer">算力市场</a> : <button className="primary-button">算力市场</button>}</PageHeader>
      <div className="gpu-stat-row">
        {[["全部实例", "0"], ["运行中", "0"], ["即将到期", "0"], ["即将释放", "0"]].map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong><small>{label === "运行中" ? "正在活跃使用" : label === "即将到期" ? "需及时续费" : label === "即将释放" ? "即将自动回收" : "总计实例"}</small></div>)}
      </div>
      <div className="content-card table-card">
        <div className="table-toolbar"><label><MagnifyingGlass size={16} /><input placeholder="搜索实例名称或实例 ID" /></label><select defaultValue="all"><option value="all">请选择全部状态</option></select><select defaultValue="gpu"><option value="gpu">请选择全部GPU</option></select><button className="secondary-button">重置</button><span className="toolbar-spacer" /><button className="secondary-button">批量续费</button></div>
        <table><thead><tr>{["实例 ID / 名称", "状态", "规格详情", "本地磁盘", "付费方式", "释放时间/到期时间", "SSH登录", "快捷工具", "操作"].map((item) => <th key={item}>{item}</th>)}</tr></thead></table>
        <EmptyState />
      </div>
    </>
  );
}

function DeskComputerPage() {
  return (
    <>
      <PageHeader title="云电脑管理" />
      <div className="desk-stat-row">{[["有效云电脑总数", "10"], ["运行中的云电脑", "0"], ["今日新增云电脑", "0"], ["即将到期的云电脑", "0"]].map(([label, value]) => <div key={label}><Monitor size={34} weight="thin" /><span>{label}<strong>{value}</strong></span></div>)}</div>
      <div className="content-card table-card">
        <div className="desk-filters"><label>云电脑<select><option>云电脑ID</option></select></label><input placeholder="搜索云电脑ID" /><label>云电脑状态<select><option>全部</option></select></label><label>操作系统<select><option>全部</option></select></label><label>机房(区域)<select><option>全部</option></select></label><label>创建时间<input placeholder="开始日期　~　结束日期" /></label><label>到期时间<input placeholder="开始日期　~　结束日期" /></label><button className="primary-button">查询</button><button className="secondary-button">重置</button></div>
        <table><thead><tr>{["云电脑ID", "云电脑名称", "所属用户", "配置规格", "操作系统", "当前状态", "购买方式", "到期时间", "操作"].map((item) => <th key={item}>{item}</th>)}</tr></thead>
          <tbody><tr><td>CPC-900000000000000001</td><td><strong>教学云电脑 · GPU型</strong><small>RTX4090</small></td><td>演示教师</td><td>vCPU: 16核<br />内存: 32GB<br />GPU: GeForce RTX 4090 8G</td><td>Windows 10</td><td>● 已释放</td><td>计时付费</td><td>2026-01-28 08:00</td><td><button className="table-link">详情</button></td></tr></tbody></table>
      </div>
    </>
  );
}

function SimpleExistingPage({ title }) {
  return <><PageHeader title={title} /><div className="content-card minimum-page"><EmptyState /></div></>;
}

function OrgTreePage() {
  return (
    <>
      <PageHeader title="组织架构"><button className="api-create-button primary-button"><Plus size={16} />新建组织</button></PageHeader>
      <div className="org-filter-row"><label>名称<input placeholder="组织名称" /></label><label>负责人<input placeholder="姓名" /></label><label>代码<input placeholder="组织代码" /></label><button className="primary-button">筛选</button><button className="secondary-button">重置</button></div>
      <div className="content-card table-card org-table"><table><thead><tr>{["名称", "负责人", "代码", "人数", "操作"].map((item) => <th key={item}>{item}</th>)}</tr></thead><tbody><tr><td><strong className="with-icon"><CaretDown size={14} />示例学院</strong></td><td>-</td><td>-</td><td>0</td><td><button className="table-link">编辑　添加下级　删除</button></td></tr><tr><td>　　大模型应用开发与实践</td><td>-</td><td>-</td><td>0</td><td><button className="table-link">编辑　添加下级　删除</button></td></tr></tbody></table></div>
    </>
  );
}

function AssetPage({ page, onDemoAction }) {
  const title = PAGE_LABELS[page];
  if (page === "memory") return <SimpleExistingPage title={title} />;
  const isPrompt = page === "prompt";
  return (
    <>
      <PageHeader title={title} subtitle={isPrompt ? "把你的好用提示词存起来、用起来、优化起来——像管理代码一样管理你的AI指令" : "AI技能云端托管，存储、同步、协作、管理一站完成"}><button className="primary-button" onClick={() => onDemoAction?.(isPrompt ? "新建提示词" : "上传skill")}><Plus size={16} />{isPrompt ? "新建提示词" : "上传skill"}</button></PageHeader>
      <div className="content-card asset-card"><div className="asset-filter-row"><label>{isPrompt ? "提示词搜索" : "关键词"}<input placeholder={isPrompt ? "请输入提示词ID/名称" : "请输入skill或ID进行搜索"} /></label><label>标签<select><option>请选择标签</option></select></label><button className="primary-button">查询</button><button className="secondary-button">重置</button></div><EmptyState /></div>
    </>
  );
}

function AccountFundsPage({ onNavigate }) {
  const [amount, setAmount] = useState("1000");
  const [customAmount, setCustomAmount] = useState("");
  const [payment, setPayment] = useState("wechat");
  const [agreed, setAgreed] = useState(false);
  const [redeemCode, setRedeemCode] = useState("");
  const [notice, setNotice] = useState("");
  const canPay = canConfirmRecharge(amount === "custom" ? customAmount : amount, agreed);
  const showBoundary = (action) => setNotice(`${action}为演示入口，未连接真实资金系统，不会产生扣款或资金变动。`);
  return (
    <>
      <PageHeader title="账户资金" />
      <div className="content-card account-funds-replica">
        <h2>账户总览</h2>
        <div className="account-balance-grid">
          <section className="account-balance-card available-balance">
            <div className="available-balance-main"><h3>可用余额</h3><div className="account-balance-value"><strong>-1.00</strong><span>元</span><button onClick={() => showBoundary("额度预警阈值设置")}>额度预警阈值设置</button></div></div>
            <div className="available-balance-breakdown"><div><span>现金余额 <Question size={12} /></span><strong>0 元</strong></div><MinusCircle size={14} /><div className="overdue-balance"><span>欠费金额 <Question size={12} /></span><strong>1.00 元</strong></div></div>
          </section>
          <section className="account-balance-card invoice-balance"><h3>可开票金额 <Question size={12} /></h3><div className="account-balance-value"><strong>5000.00</strong><span>元</span></div><button className="funds-invoice-button" onClick={() => showBoundary("发票开具")}>发票开具</button></section>
          <section className="account-balance-card gift-balance"><div className="gift-balance-heading"><h3>赠金</h3><button onClick={() => onNavigate("gift-records")}>查看</button></div><div className="account-balance-value"><strong>0</strong><span>元</span></div><form className="funds-redeem" onSubmit={(event) => { event.preventDefault(); if (redeemCode.trim()) showBoundary("兑换"); }}><input aria-label="兑换码" placeholder="请输入兑换码" value={redeemCode} onChange={(event) => setRedeemCode(event.target.value)} required /><button type="submit">兑换</button></form></section>
        </div>
        <form className="account-recharge-panel" onSubmit={(event) => { event.preventDefault(); if (canPay) showBoundary("确认支付"); }}>
          <h3>余额充值</h3>
          <div className="funds-recharge-amounts" role="group" aria-label="充值金额">{["500", "1000", "2000", "3000", "4000"].map((value) => <button type="button" key={value} className={amount === value ? "selected" : ""} aria-pressed={amount === value} onClick={() => { setAmount(value); setCustomAmount(""); }}>¥{value}</button>)}<input type="number" min="0.01" step="0.01" aria-label="自定义充值金额" placeholder="输入自定义金额" value={customAmount} className={amount === "custom" ? "selected" : ""} onFocus={() => setAmount("custom")} onChange={(event) => { setAmount("custom"); setCustomAmount(event.target.value); }} /></div>
          <div className="funds-recharge-bottom">
            <div className="funds-payment-methods" role="group" aria-label="支付方式">{[["wechat", "微信支付"], ["alipay", "支付宝"], ["bank", "对公转账"]].map(([id, label]) => <button type="button" key={id} aria-pressed={payment === id} className={payment === id ? "selected" : ""} onClick={() => setPayment(id)}><img src={`./assets/payment-${id}.png`} alt="" />{label}{payment === id ? <Check className="funds-payment-check" size={12} aria-hidden="true" /> : null}</button>)}</div>
            <div className="funds-recharge-confirm"><label className="funds-recharge-consent"><input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} /><span>我已知悉充值资金不支持直接开具发票，确认支付即代表同意本平台<button type="button" onClick={() => setNotice("《充值协议》正文未提供，本原型暂不展开；正式支付前需阅读平台现行协议。")}>《充值协议》</button></span></label><button type="submit" className="funds-confirm-payment" disabled={!canPay}>确认支付</button></div>
          </div>
        </form>
        <section className="funds-recharge-records"><h3>充值记录</h3><table><thead><tr><th>订单号</th><th>日期</th><th>金额</th></tr></thead><tbody><tr><td>RE900000000000000002</td><td>2026-01-27 14:34:31</td><td>5000</td></tr></tbody></table><div className="funds-record-pagination"><span>显示第 1 条-第 1 条，共 1 条</span><div><button disabled aria-label="上一页"><CaretLeft size={16} /></button><button aria-label="第1页" aria-current="page">1</button><button disabled aria-label="下一页"><CaretRight size={16} /></button></div></div></section>
      </div>
      {notice ? <div className="funds-demo-notice" role="status"><span>{notice}</span><button onClick={() => setNotice("")}>知道了</button></div> : null}
    </>
  );
}

function canConfirmRecharge(amount, agreed) {
  const text = String(amount).trim();
  return Boolean(agreed && /^\d+(?:\.\d{1,2})?$/.test(text) && Number.isFinite(Number(text)) && Number(text) > 0);
}

const ORDER_TABS = [
  ["recharge", "充值订单"],
  ["gpu", "GPU Cloud"],
  ["desk", "GPU 云电脑"],
];

// Desk order fields and sample values follow the supplied order-management screenshot.
// Keep 付费方式 (billing mode) distinct from 支付方式 (payment method).
const DESK_ORDER_HEADERS = ["订单号", "支付单号", "商品名称", "商品单价/数量", "付费方式", "下单类型", "订单金额", "优惠金额", "实收金额", "下单用户", "手机号码", "下单时间", "支付时间", "支付方式", "订单状态", "售后状态", "操作"];
const DESK_ORDER_FILTERS = [
  { label: "订单号", column: 0, type: "text", placeholder: "请输入订单号" },
  { label: "支付单号", column: 1, type: "text", placeholder: "请输入支付单号" },
  { label: "商品名称", column: 2, type: "text", placeholder: "请输入商品名称" },
  { label: "下单用户", column: 9, type: "text", placeholder: "请输入用户昵称" },
  { label: "手机号", column: 10, type: "text", placeholder: "请输入手机号" },
  { label: "下单时间", column: 11, type: "date-range" },
  { label: "下单类型", column: 5, type: "select" },
  { label: "付费方式", column: 4, type: "select" },
  { label: "支付方式", column: 13, type: "select" },
  { label: "支付时间", column: 12, type: "date-range" },
  { label: "订单状态", column: 14, type: "select" },
  { label: "售后状态", column: 15, type: "select" },
];
const DESK_ORDER_ROWS = [
  ["DE900000000000000003", "900000000000000004", "演示云电脑", "¥21.00/时 x 1", "按时计费", "新购", "¥59.85", "¥0.00", "¥59.85", "演示用户", "138****0000", "2026-01-03 20:00:03", "2026-01-03 20:00:03", "余额支付", "已支付", "-"],
  ["DE900000000000000005", "-", "演示云电脑", "¥21.00/时 x 1", "按时计费", "新购", "¥32.20", "¥0.00", "¥32.20", "演示用户", "138****0000", "2026-01-04 11:40:43", "2026-01-04 11:40:43", "余额支付", "已支付", "-"],
  ["DE900000000000000006", "-", "demo-cloud-host", "¥10.00/时 x 1", "按时计费", "新购", "¥455.83", "¥0.00", "¥455.83", "演示用户", "138****0000", "2026-01-30 11:20:06", "2026-01-30 11:20:06", "余额支付", "已支付", "-"],
  ["DE900000000000000007", "-", "demo-cloud-host", "¥10.00/时 x 1", "按时计费", "新购", "¥0.17", "¥0.00", "¥0.17", "演示用户", "138****0000", "2026-01-28 13:44:49", "2026-01-28 13:44:49", "余额支付", "已支付", "-"],
  ["DE900000000000000008", "-", "demo-cloud-host", "¥10.00/时 x 1", "按时计费", "新购", "¥4.33", "¥0.00", "¥4.33", "演示用户", "138****0000", "2026-01-28 13:44:13", "2026-01-28 13:44:13", "余额支付", "已支付", "-"],
  ["HD900000000000000009", "-", "演示云硬盘", "¥1.00 x 100", "-", "-", "¥100.00", "-¥12.00", "¥88.00", "演示用户", "138****0000", "2026-01-28 13:18:38", "2026-01-28 13:18:38", "余额支付", "已支付", "-"],
  ["HD900000000000000010", "-", "演示云硬盘", "¥1.00 x 100", "-", "-", "¥100.00", "-¥12.00", "¥88.00", "演示用户", "138****0000", "2026-01-28 13:18:04", "2026-01-28 13:18:04", "余额支付", "已支付", "-"],
];

const RECHARGE_ORDER_HEADERS = ["订单号", "支付单号", "商品名称", "商品单价/数量", "订单金额", "优惠金额", "实收金额", "下单用户", "手机号码", "下单时间", "支付时间", "支付方式", "订单状态", "售后状态", "操作"];
const RECHARGE_ORDER_FILTERS = [
  { label: "订单号", column: 0, type: "text", placeholder: "请输入订单号" },
  { label: "支付单号", column: 1, type: "text", placeholder: "请输入支付单号" },
  { label: "商品名称", column: 2, type: "text", placeholder: "请输入商品名称" },
  { label: "下单用户", column: 7, type: "text", placeholder: "请输入用户昵称" },
  { label: "手机号", column: 8, type: "text", placeholder: "请输入手机号" },
  { label: "下单时间", column: 9, type: "date-range" },
  { label: "支付方式", column: 11, type: "select" },
  { label: "支付时间", column: 10, type: "date-range" },
  { label: "订单状态", column: 12, type: "select" },
  { label: "售后状态", column: 13, type: "select" },
];
const RECHARGE_ORDER_ROWS = [
  ["RE900000000000000002", "-", "余额充值", "¥5000.00 x 1", "¥5000.00", "¥0.00", "¥5000.00", "演示用户", "138****0000", "2026-01-27 14:34:30", "2026-01-27 14:34:31", "后台充值", "已完成", "-"],
];

function filterOrders(rows, filters, fields = DESK_ORDER_FILTERS) {
  return rows.filter((row) => fields.every(({ column, type }) => {
    const value = filters[column];
    if (type === "date-range") {
      const [start, end] = value ?? ["", ""];
      const date = row[column].slice(0, 10);
      return (!start || date >= start) && (!end || date <= end);
    }
    if (!value) return true;
    return type === "select" ? row[column] === value : row[column].toLowerCase().includes(value.trim().toLowerCase());
  }));
}

function exportOrders(rows, headers, filename) {
  const csvCell = (value) => `"${(/^[=+\-@\t\r]/.test(value) ? "'" + value : value).replaceAll('"', '""')}"`;
  const csv = [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function OrderDateInput({ label, placeholder, value, onChange, inputType = "date" }) {
  const [focused, setFocused] = useState(false);
  return <input type={focused || value ? inputType : "text"} aria-label={label} placeholder={placeholder} value={value} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} onChange={(event) => onChange(event.target.value)} />;
}

function OrderFilters({ filters, fields, sourceRows, onChange, onQuery, onReset }) {
  const actions = <div className="desk-order-filter-actions"><button className="primary-button" type="submit">查询</button><button className="secondary-button" type="button" onClick={onReset}>重置</button></div>;
  return (
    <form className="content-card desk-order-filters" onSubmit={(event) => { event.preventDefault(); onQuery(); }}>
      <div className="desk-order-filter-grid">
        {fields.map(({ label, column, type, placeholder }) => (
          <div className="desk-order-filter" key={column}>
            <label id={`desk-order-label-${column}`} htmlFor={type === "date-range" ? undefined : `desk-order-filter-${column}`}>{label}</label>
            {type === "text" ? <input id={`desk-order-filter-${column}`} placeholder={placeholder} value={filters[column] ?? ""} onChange={(event) => onChange(column, event.target.value)} /> : null}
            {type === "select" ? <select id={`desk-order-filter-${column}`} value={filters[column] ?? ""} onChange={(event) => onChange(column, event.target.value)}><option value="">{label}</option>{[...new Set(sourceRows.map((row) => row[column]))].filter((value) => value !== "-").map((value) => <option key={value}>{value}</option>)}</select> : null}
            {type === "date-range" ? <div className="desk-order-date-range" role="group" aria-labelledby={`desk-order-label-${column}`}>
              <OrderDateInput label={`${label}开始日期`} placeholder="开始日期" value={filters[column]?.[0] ?? ""} onChange={(value) => onChange(column, [value, filters[column]?.[1] ?? ""])} />
              <span>~</span>
              <OrderDateInput label={`${label}结束日期`} placeholder="结束日期" value={filters[column]?.[1] ?? ""} onChange={(value) => onChange(column, [filters[column]?.[0] ?? "", value])} />
              <CalendarBlank size={15} aria-hidden="true" />
            </div> : null}
          </div>
        ))}
        {fields.length % 4 ? actions : null}
      </div>
      {fields.length % 4 ? null : actions}
    </form>
  );
}

function OrderTable({ rows, headers = DESK_ORDER_HEADERS, label = "GPU 云电脑订单" }) {
  return <div className="content-card desk-order-table-card">
    <div className="desk-order-table-scroll" role="region" aria-label={`${label}列表，可横向滚动查看全部字段`} tabIndex={0}>
      <table className="desk-order-table"><thead><tr>{headers.map((label) => <th scope="col" key={label}>{label}</th>)}</tr></thead>
        <tbody>{rows.map((row) => <tr key={row[0]}>{row.map((value, index) => <td key={index}>{value}</td>)}<td><button className="table-link" title="本轮原型仅对齐订单列表，详情沿用现有系统">查看</button></td></tr>)}</tbody>
      </table>
      {!rows.length ? <EmptyState /> : null}
    </div>
    <div className="desk-order-pagination"><span>显示第 {rows.length ? 1 : 0} 条-第 {rows.length} 条，共 {rows.length} 条</span><div><span>总页数：{rows.length ? 1 : 0}</span><button aria-label="上一页" disabled><CaretLeft size={15} /></button><button aria-label="第1页" aria-current="page" disabled={!rows.length}>1</button><button aria-label="下一页" disabled><CaretRight size={15} /></button></div></div>
  </div>;
}

const GPU_ORDER_HEADERS = ["订单号", "时间", "费用类型", "ID", "用户昵称", "手机号", "订单金额", "订单状态", "操作"];
const GPU_ORDER_STATS = [
  { label: "当前组织余额", value: "¥-1.00", icon: CurrencyCny },
  { label: "当前个人余额（由组织进行分配）", value: "¥5000.00", icon: CurrencyCny },
  { label: "今日消费", value: "¥0.00", icon: Receipt },
  { label: "本月累积消费", value: "¥0.00", icon: CalendarBlank },
];
const GPU_COST_NOTES = [
  "GPU实例：按实际使用时长计费，精确到分钟，不足一分钟按一分钟收费",
  "数据盘：按容量和存储时长持续计费",
  "停机收费：停机不释放时不收费",
  "余额不足：余额不足将会自动停机,实例数据将保存15天",
];

function GpuEmptyTable({ headers, jump = false }) {
  return <div className="gpu-record-table-shell">
    <div className="gpu-record-table-scroll" role="region" aria-label={jump ? "GPU Cloud收支明细" : "GPU Cloud我的订单"} tabIndex={0}>
      <table className="gpu-record-table"><thead><tr>{headers.map((label) => <th scope="col" key={label}>{label}</th>)}</tr></thead><tbody><tr><td className="gpu-record-empty" colSpan={headers.length}>暂无数据</td></tr></tbody></table>
    </div>
    <div className="gpu-record-pagination"><span>显示 0-0 共 0 条</span><div><button aria-label="上一页" disabled><CaretLeft size={12} /></button><button aria-label="第1页" aria-current="page">1</button><button aria-label="下一页" disabled><CaretRight size={12} /></button>{jump ? <label>跳转至<input type="number" aria-label="跳转页码" min="1" max="1" defaultValue="1" />页</label> : null}</div></div>
  </div>;
}

function GpuOrdersContent({ personal = false }) {
  const [search, setSearch] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  return <div className="content-card gpu-orders-content">
    {!personal ? <div className="gpu-order-stats">{GPU_ORDER_STATS.map(({ label, value, icon: Icon }) => <div className="gpu-order-stat" key={label}><span className="gpu-order-stat-icon"><Icon size={22} /></span><div><span>{label}</span><strong>{value}</strong></div></div>)}</div> : null}
    <div className="gpu-order-heading"><h2>我的订单</h2><div className="gpu-order-controls">
      <label className="gpu-record-search"><MagnifyingGlass size={14} /><input aria-label="搜索ID或订单号" placeholder="搜索ID或订单号" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
      <select aria-label="资源类型"><option>全部资源</option></select>
      <div className="gpu-record-date"><OrderDateInput label="开始时间" placeholder="开始时间" value={start} onChange={setStart} /><CalendarBlank size={14} aria-hidden="true" /></div><span>−</span><div className="gpu-record-date"><OrderDateInput label="结束时间" placeholder="结束时间" value={end} onChange={setEnd} /><CalendarBlank size={14} aria-hidden="true" /></div>
    </div></div>
    <GpuEmptyTable headers={GPU_ORDER_HEADERS} />
    <section className="gpu-cost-notes" aria-labelledby="gpu-cost-notes-heading"><h3 id="gpu-cost-notes-heading">费用说明</h3><div><ul>{GPU_COST_NOTES.slice(0, 2).map((note) => <li key={note}>{note}</li>)}</ul><ul>{GPU_COST_NOTES.slice(2).map((note) => <li key={note}>{note}</li>)}</ul></div></section>
  </div>;
}

function OrdersPage({ initialTab = "desk", scoped = false } = {}) {
  const [tab, setTab] = useState(initialTab);
  const [filters, setFilters] = useState({});
  const [appliedFilters, setAppliedFilters] = useState({});
  const isOrderList = tab === "desk" || tab === "recharge";
  const sourceRows = tab === "recharge" ? RECHARGE_ORDER_ROWS : DESK_ORDER_ROWS;
  const fields = tab === "recharge" ? RECHARGE_ORDER_FILTERS : DESK_ORDER_FILTERS;
  const headers = tab === "recharge" ? RECHARGE_ORDER_HEADERS : DESK_ORDER_HEADERS;
  const rows = filterOrders(sourceRows, appliedFilters[tab] ?? {}, fields);
  return (
    <>
      <PageHeader title={tab === "recharge" ? "充值记录" : "订单"}>{isOrderList ? <button className="primary-button desk-order-export" onClick={() => exportOrders(rows, headers.slice(0, -1), tab === "desk" ? "GPU 云电脑订单.csv" : "充值记录.csv")}><Export size={16} />导出数据</button> : null}</PageHeader>
      {!scoped ? <div className="content-card billing-card manage-record-card desk-order-tabs">
        <div className="billing-tabs">{ORDER_TABS.map(([id, label]) => <button className={tab === id ? "active" : ""} onClick={() => setTab(id)} key={id}>{label}</button>)}</div>
      </div> : null}
      {isOrderList ? <><OrderFilters key={tab} fields={fields} sourceRows={sourceRows} filters={filters[tab] ?? {}} onChange={(column, value) => setFilters((current) => ({ ...current, [tab]: { ...current[tab], [column]: value } }))} onQuery={() => setAppliedFilters((current) => ({ ...current, [tab]: filters[tab] ?? {} }))} onReset={() => { setFilters((current) => ({ ...current, [tab]: {} })); setAppliedFilters((current) => ({ ...current, [tab]: {} })); }} /><OrderTable rows={rows} headers={headers} label={tab === "desk" ? "GPU 云电脑订单" : "充值订单"} /></> : null}
      {tab === "gpu" ? <GpuOrdersContent /> : null}
    </>
  );
}

const BILLING_DETAIL_TABS = [
  ["api", "API调用"],
  ["gpu", "GPU Cloud"],
  ["desk", "GPU 云电脑"],
];

const GPU_BILLING_HEADERS = ["实例ID", "交易时间", "ID", "计费方式", "费用类型", "用户昵称", "手机号", "时长", "收支类型", "消费金额"];

function GpuBillingContent({ tenant }) {
  const [search, setSearch] = useState("");
  return <div className="gpu-billing-content">
    <div className="gpu-billing-heading"><div><h2>{tenant?.name ? `${tenant.name} · 收支明细` : "收支明细"}</h2><p>汇总展示各类资金变动明细</p></div><div className="gpu-billing-controls"><label className="gpu-record-search"><MagnifyingGlass size={14} /><input aria-label="搜索实例ID" placeholder="搜索实例ID" value={search} onChange={(event) => setSearch(event.target.value)} /></label><button className="primary-button" onClick={() => exportOrders([], GPU_BILLING_HEADERS, "GPU Cloud收支明细.csv")}><DownloadSimple size={16} />下载</button></div></div>
    <GpuEmptyTable headers={GPU_BILLING_HEADERS} jump />
  </div>;
}

// Only the requested tenant/organization columns are removed from the source bill detail.
const DESK_BILLING_HEADERS = ["订单号", "交易流水号", "订单类型", "账单月份", "用户信息", "交易类型", "付费方式", "消费时间", "产品名称", "资源配置", "单价(金额/积分)", "数量/时长", "总金额/积分", "优惠金额/积分", "实付金额/积分", "支付方式"];
const DESK_BILLING_FILTERS = [
  { id: "searchType", label: "搜索类型", type: "select" },
  { id: "query", label: "请输入搜索内容", type: "text" },
  { id: "transactionType", label: "交易类型", type: "select", column: 5 },
  { id: "month", label: "账单月份", type: "month", column: 3 },
  { id: "period", label: "消费时间", type: "date-range", column: 7 },
  { id: "billingMode", label: "付费方式", type: "select", column: 6 },
  { id: "paymentMethod", label: "支付方式", type: "select", column: 15 },
];
// Readable sample records from the screenshot; no hidden tenant/organization data is stored.
const DESK_BILLING_ROWS = [
  ["DE900000000000000011", "900000000000000012", "云电脑", "202601", ["演示用户A", "10001"], "新购", "课时计费", "2026-01-02 10:10:06", "演示云电脑A", ["宽带网络：上行15Mbps,下行15Mbps", "系统盘容量：100GB", "数据盘容量：20GB", "内存：4GB", "CPU：2核", "显卡：-"], "¥1", "2/4小时", "¥4", "¥0", "¥4", "余额支付"],
  ["DE900000000000000013", "900000000000000014", "云电脑", "202601", ["演示用户A", "10001"], "新购", "课时计费", "2026-01-02 10:06:53", "带数据盘", ["宽带网络：上行15Mbps,下行15Mbps", "系统盘容量：100GB", "数据盘容量：50GB", "内存：4GB", "CPU：2核", "显卡：-"], "¥1.2", "2/2小时40分钟", "¥3.2", "¥0", "¥3.2", "余额支付"],
];

function filterDeskBilling(rows, filters) {
  const query = (filters.query ?? "").trim().toLowerCase();
  return rows.filter((row) => {
    if (query && !row.flat().join(" ").toLowerCase().includes(query)) return false;
    if (filters.month && row[3] !== filters.month.replace("-", "")) return false;
    const [start, end] = filters.period ?? ["", ""];
    const date = row[7].slice(0, 10);
    if ((start && date < start) || (end && date > end)) return false;
    return DESK_BILLING_FILTERS.filter(({ type, column }) => type === "select" && column !== undefined)
      .every(({ id, column }) => !filters[id] || row[column] === filters[id]);
  });
}

function DeskBillingContent() {
  const [filters, setFilters] = useState({});
  const [appliedFilters, setAppliedFilters] = useState({});
  const update = (id, value) => setFilters((current) => ({ ...current, [id]: value }));
  const rows = filterDeskBilling(DESK_BILLING_ROWS, appliedFilters);
  return <div className="desk-billing-content">
    <form className="desk-billing-filters" onSubmit={(event) => { event.preventDefault(); setAppliedFilters(filters); }}>
      <div className="desk-billing-filter-grid">
        {DESK_BILLING_FILTERS.map(({ id, label, type, column }) => <div className="desk-billing-filter" key={id}>
          <label id={`desk-billing-label-${id}`} htmlFor={type === "text" || type === "select" ? `desk-billing-filter-${id}` : undefined}>{label}</label>
          {type === "text" ? <input id={`desk-billing-filter-${id}`} placeholder="请输入搜索内容" value={filters[id] ?? ""} onChange={(event) => update(id, event.target.value)} /> : null}
          {type === "select" ? <select id={`desk-billing-filter-${id}`} value={filters[id] ?? ""} onChange={(event) => update(id, event.target.value)}><option value="">全部</option>{column !== undefined ? [...new Set(DESK_BILLING_ROWS.map((row) => row[column]))].map((value) => <option key={value}>{value}</option>) : null}</select> : null}
          {type === "month" ? <div className="desk-billing-month"><OrderDateInput inputType="month" label={label} placeholder="账单月份" value={filters.month ?? ""} onChange={(value) => update("month", value)} /><CalendarBlank size={14} aria-hidden="true" /></div> : null}
          {type === "date-range" ? <div className="desk-billing-date-range" role="group" aria-labelledby={`desk-billing-label-${id}`}><OrderDateInput label="消费时间开始日期" placeholder="开始日期" value={filters.period?.[0] ?? ""} onChange={(value) => update("period", [value, filters.period?.[1] ?? ""])} /><span>~</span><OrderDateInput label="消费时间结束日期" placeholder="结束日期" value={filters.period?.[1] ?? ""} onChange={(value) => update("period", [filters.period?.[0] ?? "", value])} /><CalendarBlank size={14} aria-hidden="true" /></div> : null}
        </div>)}
      </div>
      <div className="desk-billing-filter-actions"><button type="submit" className="primary-button"><MagnifyingGlass size={14} />查询</button><button type="button" className="secondary-button" onClick={() => { setFilters({}); setAppliedFilters({}); }}><ArrowClockwise size={14} />重置</button></div>
    </form>
    <div className="desk-billing-table-scroll" role="region" aria-label="GPU 云电脑费用明细，可横向滚动查看全部字段" tabIndex={0}>
      <table className="desk-billing-table"><thead><tr>{DESK_BILLING_HEADERS.map((label) => <th scope="col" key={label}>{label}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row[1]}>{row.map((value, index) => <td key={index}>{Array.isArray(value) ? <div className="desk-billing-multiline">{value.map((line) => <span key={line}>{line}</span>)}</div> : index === 5 ? <span className="desk-billing-transaction-tag">{value}</span> : value}</td>)}</tr>)}</tbody></table>
      {!rows.length ? <EmptyState /> : null}
    </div>
  </div>;
}

function BillingDetailsPage({ tenant, initialTab = "api", scoped = false } = {}) {
  const [tab, setTab] = useState(initialTab);
  return (
    <>
      <PageHeader title="计费记录" />
      <div className={`content-card billing-card manage-record-card${tab === "gpu" ? " gpu-billing-record-card" : ""}`}>
        {!scoped ? <div className="billing-tabs">{BILLING_DETAIL_TABS.map(([id, label]) => <button className={tab === id ? "active" : ""} onClick={() => setTab(id)} key={id}>{label}</button>)}</div> : null}
        {tab === "api" ? <ApiLogContent /> : null}
        {tab === "gpu" ? <GpuBillingContent tenant={tenant} /> : null}
        {tab === "desk" ? <DeskBillingContent /> : null}
      </div>
    </>
  );
}

function GiftRecordsPage() {
  return (
    <>
      <PageHeader title="赠金记录" />
      <div className="content-card billing-card manage-record-card">
        <div className="record-toolbar billing-toolbar"><span>时间：</span><button>开始时间　~　结束时间</button><span className="toolbar-spacer" /><button className="secondary-button"><Funnel size={16} />筛选</button><button className="secondary-button">导出</button></div>
        <table><thead><tr>{["赠金记录", "变动金额", "赠金余额", "时间"].map((item) => <th key={item}>{item}</th>)}</tr></thead></table>
        <EmptyState />
      </div>
    </>
  );
}

function renderPage(page, onNavigate, tenant) {
  if (page === "dashboard") return <ConsoleHome tenant={tenant} onNavigate={onNavigate} />;
  if (page === "api-dashboard") return <Dashboard />;
  if (page === "bills") return <UnifiedBills tenant={tenant} onNavigate={onNavigate} />;
  if (page === "recharge-orders") return <OrdersPage initialTab="recharge" scoped />;
  if (page === "gpu-orders") return <OrdersPage initialTab="gpu" scoped />;
  if (page === "desk-orders") return <OrdersPage initialTab="desk" scoped />;
  if (page === "api-billing") return <ProductBillingRecords tenant={tenant} product="api" onNavigate={onNavigate} />;
  if (page === "gpu-billing") return <ProductBillingRecords tenant={tenant} product="gpu" onNavigate={onNavigate} />;
  if (page === "desk-billing") return <ProductBillingRecords tenant={tenant} product="desk" onNavigate={onNavigate} />;
  if (page === "api-key") return <ApiKeyPage />;
  if (["memory", "prompt", "skill"].includes(page)) return <AssetPage page={page} />;
  if (page.startsWith("gpu-")) return <GpuPage page={page} />;
  if (page === "desk-computer") return <DeskComputerPage />;
  if (["desk-disk", "desk-terminal", "desk-place", "term-year", "term-course", "term-task", "term-schedule", "term-mapping", "org-info", "user-list"].includes(page)) return <SimpleExistingPage title={PAGE_LABELS[page]} />;
  if (page === "org-tree") return <OrgTreePage />;
  if (page === "account-funds") return <AccountFundsPage onNavigate={onNavigate} />;
  if (page === "gift-records") return <GiftRecordsPage />;
  return <Dashboard />;
}

// Personal context is not a tenant: only confirmed personal products and functions.
const PERSONAL_PRODUCT_NAV = [
  { id: "api", label: "AI 模型服务", icon: Key, items: [
    { id: "personal-models", label: "模型", external: "https://onelinkai.cloud/pricingList" },
    { id: "personal-key", label: "API key" },
    { id: "personal-prompt", label: "提示词管理" },
    { id: "personal-skill", label: "Skill托管" },
  ] },
  { id: "gpu", label: "GPU Cloud", icon: Cpu, items: [
    { id: "personal-gpu-market", label: "算力市场", external: "https://onelinkai.cloud/gpucloud" },
    { id: "personal-gpu-instance", label: "容器实例" },
  ] },
];
const PERSONAL_MANAGE_NAV = [
  { id: "account-manage", label: "账户", icon: Wallet, items: [
    { id: "personal-account", label: "个人资料" },
    { id: "personal-wallet", label: "钱包" },
    { id: "personal-orders", label: "订单" },
    { id: "personal-consumption", label: "费用明细" },
  ] },
];
const PERSONAL_PROGRAM_NAV = [
  { id: "personal-referral", label: "推荐计划", icon: Gift },
  { id: "personal-partner", label: "合作伙伴计划", icon: UsersThree },
];
const PERSONAL_LOCAL_PAGES = [
  "personal-home",
  ...PERSONAL_PRODUCT_NAV.flatMap(({ items }) => items.filter((item) => !item.external).map(({ id }) => id)),
  ...PERSONAL_MANAGE_NAV.flatMap(({ items }) => items.map(({ id }) => id)),
  ...PERSONAL_PROGRAM_NAV.map(({ id }) => id),
  "personal-gift-records",
];

function personalPageOrHome(page) {
  return PERSONAL_LOCAL_PAGES.includes(page) ? page : consoleHomePage(null);
}

function PersonalSidebar({ tenants = [], page, onNavigate, onScopeChange }) {
  return <Sidebar tenant={null} tenants={tenants} page={page} onNavigate={onNavigate} onScopeChange={onScopeChange} />;
}

const PERSONAL_BILLING_TABS = [["api", "API调用"], ["gpu", "GPU Cloud"]];

function PersonalBillingPage({ initialTab = "api" } = {}) {
  const [tab, setTab] = useState(initialTab === "gpu" ? "gpu" : "api");
  return <><PageHeader title="费用明细" /><div className="content-card billing-card manage-record-card personal-billing-records"><div className="billing-tabs">{PERSONAL_BILLING_TABS.map(([id, label]) => <button key={id} className={tab === id ? "active" : ""} onClick={() => setTab(id)}>{label}</button>)}</div>{tab === "api" ? <ApiLogContent personal /> : <GpuBillingContent tenant={null} />}</div></>;
}

function PersonalOrdersPage() {
  return <><PageHeader title="订单" /><div className="content-card billing-card manage-record-card desk-order-tabs"><div className="billing-tabs"><button className="active">GPU Cloud</button></div></div><GpuOrdersContent personal /></>;
}

function PersonalWalletPage({ onNavigate, initialTab = "api" }) {
  const [tab, setTab] = useState(initialTab === "gpu" ? "gpu" : "api");
  const [amount, setAmount] = useState("50");
  const [customAmount, setCustomAmount] = useState("");
  const [payment, setPayment] = useState("wechat");
  const [agreed, setAgreed] = useState(false);
  const [code, setCode] = useState("");
  const [notice, setNotice] = useState("");
  const notify = (action) => setNotice(`${action}为演示入口，未连接个人资金系统，不会产生交易。`);
  return <><PageHeader title="钱包" /><div className="content-card personal-wallet-card">
    <div className="billing-tabs">{[["api", "AI 模型服务"], ["gpu", "GPU Cloud"]].map(([id, label]) => <button key={id} className={tab === id ? "active" : ""} onClick={() => { setTab(id); setNotice(""); }}>{label}</button>)}</div>
    {tab === "api" ? <div className="personal-wallet-body">
      <div className="personal-wallet-balances">
        <section><h2>余额</h2><strong>0 <small>元</small></strong><button className="secondary-button" onClick={() => notify("发票开具")}>发票开具</button></section>
        <section><div className="personal-wallet-gift-heading"><h2>赠金</h2><button className="secondary-button" onClick={() => onNavigate("personal-gift-records")}>查看</button></div><strong>10 <small>元</small></strong><form onSubmit={(event) => { event.preventDefault(); if (code.trim()) notify("兑换"); }}><input aria-label="兑换码" placeholder="请输入兑换码" required value={code} onChange={(event) => setCode(event.target.value)} /><button className="primary-button" type="submit">兑换</button></form></section>
      </div>
      <form className="personal-wallet-recharge" onSubmit={(event) => { event.preventDefault(); if (canConfirmRecharge(amount === "custom" ? customAmount : amount, agreed)) notify("确认支付"); }}>
        <h2>余额充值</h2><div className="funds-recharge-amounts" role="group" aria-label="充值金额">{["50", "100", "200", "300", "400"].map((value) => <button type="button" key={value} className={amount === value ? "selected" : ""} aria-pressed={amount === value} onClick={() => { setAmount(value); setCustomAmount(""); }}>¥{value}</button>)}<input type="number" min="0.01" step="0.01" aria-label="自定义充值金额" placeholder="输入自定义金额" value={customAmount} className={amount === "custom" ? "selected" : ""} onFocus={() => setAmount("custom")} onChange={(event) => { setAmount("custom"); setCustomAmount(event.target.value); }} /></div>
        <div className="funds-recharge-bottom"><div className="funds-payment-methods" role="group" aria-label="支付方式">{[["wechat", "微信支付"], ["alipay", "支付宝"], ["bank", "对公转账"]].map(([id, label]) => <button type="button" key={id} aria-pressed={payment === id} className={payment === id ? "selected" : ""} onClick={() => setPayment(id)}><img src={`./assets/payment-${id}.png`} alt="" />{label}{payment === id ? <Check className="funds-payment-check" size={12} /> : null}</button>)}</div><div className="funds-recharge-confirm"><label className="funds-recharge-consent"><input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} /><span>我已知悉充值资金不支持直接开具发票，确认支付即代表同意本平台<button type="button" onClick={() => setNotice("《充值协议》正文未提供，本原型暂不展开；不会发起真实支付。")}>《充值协议》</button></span></label><button className="funds-confirm-payment" type="submit" disabled={!canConfirmRecharge(amount === "custom" ? customAmount : amount, agreed)}>确认支付</button></div></div>
      </form>
      <section className="personal-wallet-records"><h2>充值记录</h2><table><thead><tr><th>订单号</th><th>日期</th><th>金额</th></tr></thead><tbody><tr><td colSpan={3}>暂无数据</td></tr></tbody></table></section>
    </div> : <div className="personal-existing-boundary"><Wallet size={36} weight="thin" /><h2>GPU Cloud 个人资金</h2><p>个人资金页面待补充，不沿用组织余额或组织分配额度。</p></div>}
  </div>{notice ? <div className="funds-demo-notice" role="status"><span>{notice}</span><button onClick={() => setNotice("")}>知道了</button></div> : null}</>;
}

function PersonalPage({ page, onNavigate }) {
  const [notice, setNotice] = useState("");
  useEffect(() => setNotice(""), [page]);
  const notify = (action) => setNotice(`${action}沿用现有功能，本轮仅演示入口，不修改真实个人账户或资源。`);
  let content;
  if (page === "personal-home") content = <ConsoleHome onNavigate={onNavigate} />;
  else if (page === "personal-account") {
    content = (
      <div className="content-card account-card personal-account-existing">
        <PageHeader title="个人资料" />
        <div className="account-fields">{[["昵称", "演示用户", "修改"], ["手机号", "138****0000", "更改"], ["微信", "暂未绑定", "去绑定"], ["QQ", "暂未绑定", "去绑定"], ["实名认证", "未实名", "去实名"]].map(([label, value, action]) => <div key={label}><span>{label}<strong>{value}</strong></span><button className="secondary-button" onClick={() => notify(`${label}${action}`)}>{action}</button></div>)}</div>
      </div>
    );
  } else if (page === "personal-wallet") content = <PersonalWalletPage onNavigate={onNavigate} />;
  else if (page === "personal-consumption") content = <PersonalBillingPage />;
  else if (page === "personal-orders") content = <PersonalOrdersPage />;
  else if (page === "personal-gpu-instance") content = <GpuPage page="gpu-personal-instance" personal />;
  else if (page === "personal-prompt" || page === "personal-skill") content = <AssetPage page={page === "personal-prompt" ? "prompt" : "skill"} onDemoAction={notify} />;
  else if (page === "personal-gift-records") content = <><PageHeader title="赠金记录"><button className="secondary-button" onClick={() => onNavigate("personal-wallet")}>返回钱包</button></PageHeader><div className="content-card personal-existing-boundary"><Gift size={36} weight="thin" /><h2>个人赠金记录</h2><p>保留个人钱包中的查看入口，明细页面待补充。</p></div></>;
  else if (PERSONAL_PROGRAM_NAV.some(({ id }) => id === page)) {
    const item = PERSONAL_PROGRAM_NAV.find(({ id }) => id === page);
    content = <><PageHeader title={item.label} /><div className="content-card personal-existing-boundary"><item.icon size={36} weight="thin" /><h2>{item.label}</h2><p>原有功能入口保留，本轮不调整活动内容和业务规则。</p></div></>;
  } else content = <ApiKeyPage onDemoAction={notify} />;
  return <>{content}{notice ? <div className="funds-demo-notice" role="status"><span>{notice}</span><button onClick={() => setNotice("")}>知道了</button></div> : null}</>;
}

function WebsiteHome({ tenant, tenants, onScopeChange, onEnterConsole }) {
  const [announcementOpen, setAnnouncementOpen] = useState(true);
  const [notice, setNotice] = useState("");
  const showBoundary = (label) => setNotice(`${label}为官网演示入口，本次仅展示首页及控制台往返，不连接真实业务。`);
  return <div className="website-home">
    {announcementOpen ? <div className="website-announcement"><button onClick={() => showBoundary("GPU 算力市场")}><RocketLaunch size={16} weight="duotone" />GPU算力市场全新上线！按需匹配算力，多种租赁方案灵活可选！<ArrowRight size={15} /></button><button className="website-announcement-close" aria-label="关闭公告" onClick={() => setAnnouncementOpen(false)}><X size={16} /></button></div> : null}
    <Topbar website tenant={tenant} tenants={tenants} onScopeChange={onScopeChange} onNavigate={onEnterConsole} />
    <main>
      <section className="website-hero-section">
        <div className="website-hero-window">
          <div className="website-window-toolbar">
            <div className="website-window-dots" aria-hidden="true"><i /><i /><i /></div>
            {[["gpu", "GPU Cloud"], ["model", "AI模型"], ["memory", "团队记忆"], ["skill", "Skill托管"]].map(([id, label]) => <span className="website-window-tag" key={id}><img src={`./assets/website-tag-${id}.png`} alt="" />{label}</span>)}<span className="website-window-more" aria-hidden="true">…</span>
          </div>
          <div className="website-hero-content">
            <div className="website-hero-copy">
              <h1>一个平台<br />连接<i>AI</i>模型与<i>GPU</i>算力<br />让每一个想法都能即刻落地</h1>
              <ul><li>买卡动辄数万？GPU 按小时租，随需随用</li><li>对接模型太折腾？100+全球主流大模型一个Key通调</li><li>半夜训练崩了找不到人？7×24技术运维全天在线，问题随时响应</li></ul>
              <div className="website-hero-actions"><button onClick={() => showBoundary("接入算力")}>接入算力</button><button onClick={() => showBoundary("探索模型")}>探索模型</button><button className="website-secondary" onClick={() => showBoundary("商务合作")}>商务合作</button></div>
            </div>
            <div className="website-service-cards">
              <button className="website-service-card website-gpu-card" onClick={() => showBoundary("GPU 算力服务")}>
                <h2><i>GPU</i><br />算力服务</h2><p>高性能GPU弹性部署，分钟级交付，覆盖训练推理全场景，按需使用随时释放</p><img src="./assets/website-gpu.png" alt="" /><span className="website-card-arrow"><ArrowUpRight size={18} /></span>
              </button>
              <button className="website-service-card website-ai-card" onClick={() => showBoundary("AI 模型服务")}>
                <h2><i>AI</i><br />模型服务</h2><p>覆盖DeepSeek、GLM等百余模型，一个Key统一调用，切换模型无需改代码</p><img src="./assets/website-ai.png" alt="" /><span className="website-card-arrow"><ArrowUpRight size={18} /></span>
              </button>
            </div>
          </div>
        </div>
      </section>
      <section className="website-why-section"><p>算力+模型，一站全搞定</p><h2>为什么选择我们?</h2></section>
    </main>
    {notice ? <div className="funds-demo-notice" role="status"><span>{notice}</span><button onClick={() => setNotice("")}>知道了</button></div> : null}
  </div>;
}

function getPrototypeSurface(hash) {
  return hash === "#/home" ? "home" : "console";
}

function tenantPageFromHash(hash, tenant) {
  const slug = hash.replace(/^#\/console\/?/, '') || 'home';
  const page = slug === 'home' ? 'dashboard' : slug;
  if (['dashboard', 'bills', 'api-billing', 'gpu-billing', 'desk-billing'].includes(page)) return page;
  if (MANAGE_NAV.some(group => containsPage(group.items, page))) return page;
  if (PRODUCT_NAV.some(group => tenant.enabledProducts.includes(group.id) && containsPage(visibleItems(group.items, tenant), page))) return page;
  return 'dashboard';
}

export function App({ availableTenants = TENANTS, initialSurface } = {}) {
  const [scope, setScope] = useState(() => {
    const initial = createConsoleState(availableTenants[0] ?? null);
    if (initial.tenant && typeof window !== 'undefined') initial.page = tenantPageFromHash(window.location.hash, initial.tenant);
    return initial;
  });
  const [surface, setSurface] = useState(() => initialSurface ?? getPrototypeSurface(typeof window === "undefined" ? "" : window.location.hash));
  useEffect(() => {
    const syncSurface = () => {
      setSurface(getPrototypeSurface(window.location.hash));
      if (window.location.hash.startsWith('#/console')) setScope(current => ({...current, page:current.tenant ? tenantPageFromHash(window.location.hash, current.tenant) : personalPageOrHome(window.location.hash.replace(/^#\/console\/?/, ''))}));
    };
    window.addEventListener("hashchange", syncSurface);
    return () => window.removeEventListener("hashchange", syncSurface);
  }, []);
  const { tenant, page } = scope;
  const setPage = (nextPage) => {
    const safePage = tenant ? tenantPageFromHash(`#/console/${nextPage === 'dashboard' ? 'home' : nextPage}`, tenant) : personalPageOrHome(nextPage);
    setScope(current => ({...current, page:safePage}));
    window.location.hash = `/console/${safePage === 'dashboard' ? 'home' : safePage}`;
  };
  const changeScope = (nextTenant) => {
    setScope((current) => selectConsoleScope(current, nextTenant));
    if (surface !== 'home') window.location.hash = `/console/${nextTenant ? 'home' : consoleHomePage(null)}`;
  };
  const enterConsole = () => {
    setPage(consoleHomePage(tenant));
    setSurface("console");
    window.location.hash = "/console";
  };
  if (surface === "home") return <WebsiteHome tenant={tenant} tenants={availableTenants} onScopeChange={changeScope} onEnterConsole={enterConsole} />;
  return (
    <div className="app-shell">
      {tenant ? <Sidebar key={tenant.id} tenant={tenant} tenants={availableTenants} page={page} onNavigate={setPage} onScopeChange={changeScope} /> : <PersonalSidebar tenants={availableTenants} page={page} onNavigate={setPage} onScopeChange={changeScope} />}
      <main className="workspace">
        <Topbar tenant={tenant} tenants={availableTenants} onScopeChange={changeScope} onNavigate={setPage} page={page} />
        <section className="page-content" key={tenant?.id ?? "personal"}>{tenant ? renderPage(page, setPage, tenant) : <PersonalPage page={page} onNavigate={setPage} />}</section>
      </main>
    </div>
  );
}
