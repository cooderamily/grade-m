# Cloudflare 部署指南

## 问题解决

### 1. API 路由静态渲染问题 ✅ 已修复
- 已将所有 API 路由中的 `new URL(request.url)` 改为 `request.nextUrl.searchParams`
- 这解决了 "Dynamic server usage" 错误

### 2. 数据库配置问题 ⚠️ 需要处理

当前项目使用 SQLite 本地数据库，但 Cloudflare 不支持文件系统数据库。

#### 选项 A: 使用 Cloudflare D1 数据库（推荐）

1. 创建 D1 数据库：
```bash
npx wrangler d1 create grade-m2-db
```

2. 更新 `wrangler.toml`：
```toml
[[d1_databases]]
binding = "DB"
database_name = "grade-m2-db"
database_id = "your-d1-database-id"
```

3. 修改 Prisma 配置支持 D1

#### 选项 B: 使用外部数据库

使用云数据库服务如：
- PlanetScale (MySQL)
- Neon (PostgreSQL)  
- Supabase (PostgreSQL)
- MongoDB Atlas

更新 `DATABASE_URL` 环境变量即可。

### 3. 当前部署配置

已创建基本的 `wrangler.toml` 配置文件。

## 部署步骤

1. **选择数据库方案**（见上方选项）

2. **设置环境变量**：
```bash
# 在 Cloudflare Dashboard 中设置
DATABASE_URL=your_database_url
NODE_ENV=production
```

3. **部署**：
```bash
npm run build
npx wrangler pages deploy .next
```

## 注意事项

- 当前的本地 SQLite 数据库文件不会上传到 Cloudflare
- 需要在云环境中重新创建数据库结构
- API 路由需要在 serverless 环境中运行

## 建议

对于生产环境，推荐使用 Vercel 或 Netlify，它们对 Next.js + Prisma 有更好的支持。

如果坚持使用 Cloudflare，建议：
1. 迁移到 Cloudflare D1 数据库
2. 或使用外部托管数据库服务 