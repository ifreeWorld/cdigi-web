# cdigi-web

## 项目启动

```bash
rush update
pnpm start:server
pnpm start:client
```

## 代码管理

代码仓库管理采用 monorepo 的方式，主要使用 [rush](https://rushjs.io/zh-cn/pages/intro/get_started/) + [pnpm](https://pnpm.io/zh/installation) 的方案

### 服务端

[nestjs](https://docs.nestjs.com/first-steps 'nestjs') 框架（[中文文档](https://docs.nestjs.cn/8/firststeps?id=%e8%bf%90%e8%a1%8c%e5%ba%94%e7%94%a8%e7%a8%8b%e5%ba%8f)）

ORM 框架使用 [typeorm](https://typeorm.io/migrations)（[中文文档](https://typeorm.biunav.com/zh/#%E5%AE%89%E8%A3%85)）

### 客户端

[ant-design-pro](https://pro.ant.design/zh-CN/docs/getting-started/ 'nestjs') 框架（主要是 [umi3](https://v3.umijs.org/zh-CN/docs/getting-started) 那一套）
