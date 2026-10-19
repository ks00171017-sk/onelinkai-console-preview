# GPU卡时专属折扣原型

- [原型入口](https://ks00171017-sk.github.io/onelinkai-console-preview/gpu-discounts/)
- [运营配置](https://ks00171017-sk.github.io/onelinkai-console-preview/gpu-discounts/admin.html)
- [GPU 选卡](https://ks00171017-sk.github.io/onelinkai-console-preview/gpu-discounts/market.html)

用于演示在现有用户／租户管理入口配置GPU卡时专属折扣，以及个人、组织空间选卡时自动显示适用价格。沿用现有租卡页面布局，价格位于卡片左下角。租户列表保留现有 15 个字段，通过“独立折扣设置 → 设置 → GPU卡时专属折扣”Tab 配置优惠；默认显示大模型调用，原列表预览保留大模型信息。个人用户仍从操作列直接配置 GPU卡时折扣。

页面仅包含演示数据，不连接账户、资金、库存或 GPU 服务。运营与租卡页面为独立场景；在运营页面保存不会自动更改租卡页的演示权益。租卡示例为个人七五折、学校八折、企业无专属优惠。退款、完整续费／转换和账单处理不在此演示中执行，真实功能仍需研发与计费验收。

发布副本不包含原始业务截图、真实主机 ID 或内部需求评审材料。品牌图使用本仓库已有公开资产。页面可能加载图标 CDN；网络策略阻断时图标可能缺失。

维护：编辑原型后重新导出独立 HTML，替换本目录的 `admin.html`、`market.html`，执行仓库构建与检查，再推送 main；现有 GitHub Actions 会发布到 Pages。

更新：2026-10-19。
