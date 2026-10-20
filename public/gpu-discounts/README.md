# GPU卡时专属折扣原型

- [评审入口](https://ks00171017-sk.github.io/onelinkai-console-preview/gpu-discounts/)
- [运营配置](https://ks00171017-sk.github.io/onelinkai-console-preview/gpu-discounts/admin.html)
- [选卡与单个创建](https://ks00171017-sk.github.io/onelinkai-console-preview/gpu-discounts/market.html)
- [批量操作与子订单](https://ks00171017-sk.github.io/onelinkai-console-preview/gpu-discounts/batch.html)

沿用现有用户／租户管理和租卡布局。运营通过租户独立折扣设置内的 GPU Tab 配置，个人从用户列表操作列进入；列表摘要打开相应设置 Tab。

租卡价格位于卡片左下角。创建页面保留原有字段、优惠券选择框及底部合计，移除单独“专属优惠”行和计费模式中由售价换算的折扣标签；专属折扣在实际 GPU 价格处体现。批量页面提供创建、续费、转包期、转按量及子订单示例，按实例汇总费用。未配置年价不能购买，T4 可演示年包。

示例规则：个人七五折、学校八折、企业正常价。按量新旧实例的未来用量适用有效折扣；已付款包期保留成交折扣。学校租户费用、余额、预算及退款显示积分（1 元＝20 积分），内部计价仍为金额，个人和企业显示元。旧单折扣记录与当前优惠分开。

页面只使用演示数据，不连接账户、资金、库存或 GPU 服务。各页为独立场景，在运营端保存不自动更新租卡页。优惠券框展示“暂无可用优惠券”，不实现发券、核销或叠加；退款为展示样本，不执行真实结算，也不新增退订算法。

发布副本不包含原始业务截图、真实主机 ID 或内部评审材料。维护时编辑原型源文件，运行 prepare_gpu_pages.py 导出 HTML，更新本目录，执行构建和检查后发布。

更新：2026-10-20。
