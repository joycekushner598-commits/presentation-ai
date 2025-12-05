# 🔑 必需的 API 密钥配置清单

## ⚠️ 在启动应用之前，你需要配置以下内容

### ✅ 已完成
- [x] Node.js v24.11.1 已安装
- [x] 项目依赖已安装（855 个包）
- [x] .env 文件已创建
- [x] 端口已设置为 6100

### 🔴 必须配置（否则无法运行）

#### 1. 数据库配置
```
DATABASE_URL="postgresql://用户名:密码@localhost:5432/presentation_ai"
```
**需要做的事**：
- [ ] 安装 PostgreSQL 数据库
- [ ] 创建数据库 `presentation_ai`
- [ ] 更新 DATABASE_URL 的用户名和密码

**快速安装 PostgreSQL**（Windows）：
- 官网：https://www.postgresql.org/download/windows/
- 或使用：`winget install PostgreSQL.PostgreSQL`

#### 2. NextAuth 密钥
```
NEXTAUTH_SECRET="你的随机密钥字符串"
```
**生成密钥**（在 PowerShell 中运行）：
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```
复制输出的字符串替换到 .env 文件中

#### 3. Google OAuth（用于用户登录）
```
GOOGLE_CLIENT_ID="你的Google客户端ID"
GOOGLE_CLIENT_SECRET="你的Google客户端密钥"
```
**获取步骤**：
1. 访问 https://console.cloud.google.com/
2. 创建新项目或选择现有项目
3. 启用 Google+ API
4. 创建 OAuth 2.0 凭据
5. 授权重定向 URI 添加：`http://localhost:6100/api/auth/callback/google`
6. 复制客户端 ID 和密钥到 .env

#### 4. OpenAI API Key（AI 内容生成）
```
OPENAI_API_KEY="sk-..."
```
**获取步骤**：
1. 访问 https://platform.openai.com/api-keys
2. 注册/登录账号
3. 创建新的 API 密钥
4. 复制密钥到 .env
⚠️ **注意**：需要有可用余额才能使用

### 🟡 可选配置（建议但不是必需）

#### Together AI（图片生成）
```
TOGETHER_AI_API_KEY="你的Together_AI密钥"
```
获取：https://www.together.ai/

#### UploadThing（文件上传）
```
UPLOADTHING_TOKEN="你的UploadThing令牌"
```
获取：https://uploadthing.com/

#### Unsplash（图片库）
```
UNSPLASH_ACCESS_KEY="你的Unsplash访问密钥"
```
获取：https://unsplash.com/developers

#### Tavily（搜索）
```
TAVILY_API_KEY="你的Tavily_API密钥"
```
获取：https://tavily.com/

---

## 🚀 配置完成后的启动步骤

### 1. 初始化数据库
```powershell
npm run db:push
```

### 2. 启动应用（端口 6100）
```powershell
$env:PORT=6100; npm run dev
```

### 3. 访问应用
浏览器打开：http://localhost:6100

---

## 💡 最小可运行配置

如果你只想快速测试，至少需要配置：
1. ✅ DATABASE_URL（PostgreSQL）
2. ✅ NEXTAUTH_SECRET（随机字符串）
3. ✅ GOOGLE_CLIENT_ID 和 GOOGLE_CLIENT_SECRET
4. ✅ OPENAI_API_KEY

其他的可以暂时留空，但某些功能可能无法使用。

---

## ❓ 遇到问题？

### PostgreSQL 连接失败
- 确保 PostgreSQL 服务正在运行
- 检查用户名、密码和数据库名是否正确
- 默认端口是 5432

### Google OAuth 错误
- 检查重定向 URI 是否正确配置
- 确保 OAuth 应用状态为"已发布"

### OpenAI API 错误
- 确认 API 密钥有效
- 检查账户是否有可用余额

---

**当前状态**：✅ 依赖已安装，等待 API 密钥配置
