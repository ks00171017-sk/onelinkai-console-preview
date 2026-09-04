# OneLinkAI Console Preview

OneLinkAI 统一控制台交互原型，包含租户与个人视图。

- 租户：API Router、GPU Cloud、GPU 云电脑及账户/组织管理。
- 个人：API Router、GPU Cloud 及个人账户管理。
- 官网首页：通过左上角 Logo 进入；右上角“控制台”返回控制台。
- 右上角菜单可切换个人、学校租户和企业租户。

这是脱敏后的展示副本。学校/企业名称、用户信息和交易标识均为演示值，不包含原始调研资料或截图。资金、充值、密钥和资源管理动作不连接真实业务系统。

## 本地预览

```sh
npm ci
npm run dev
```

## 发布

在仓库的 Settings → Pages 中选择 GitHub Actions。推送到 main 后会构建并发布 `dist/client`。
主页使用 Hash 路由和相对资源路径，支持 GitHub Pages 的仓库子路径。

部署配置参考 [Vite 官方 GitHub Pages 指南](https://vite.dev/guide/static-deploy.html#github-pages)。
