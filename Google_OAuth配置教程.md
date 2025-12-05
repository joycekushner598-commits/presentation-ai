# Google OAuth 凭据配置教程

## 📋 目标
获取 `GOOGLE_CLIENT_ID` 和 `GOOGLE_CLIENT_SECRET` 用于用户登录功能。

---

## 🚀 详细步骤

### 步骤 1: 访问 Google Cloud Console

1. 打开浏览器，访问：**https://console.cloud.google.com/**
2. 使用你的 Google 账号登录

---

### 步骤 2: 创建新项目（或选择现有项目）

#### 如果是第一次使用：

1. 点击页面顶部的 **"选择项目"** 下拉菜单
2. 点击 **"新建项目"**
3. 填写项目信息：
   - **项目名称**: `presentation-ai`（或你喜欢的名字）
   - **组织**: 保持默认
4. 点击 **"创建"**
5. 等待几秒钟，项目创建完成后会自动选中

#### 如果已有项目：

- 直接在顶部下拉菜单中选择你要使用的项目

---

### 步骤 3: 配置 OAuth 同意屏幕

1. 在左侧菜单中，找到 **"API和服务"** → **"OAuth 同意屏幕"**
   - 或直接访问：https://console.cloud.google.com/apis/credentials/consent

2. 选择用户类型：
   - ✅ **外部** (External) - 推荐，任何 Google 账号都可以登录
   - 内部 (Internal) - 仅限你的组织内部用户
   
3. 点击 **"创建"**

4. 填写 OAuth 同意屏幕信息：

   **应用信息**：
   - **应用名称**: `Presentation AI`（或你喜欢的名字）
   - **用户支持电子邮件**: 选择你的邮箱
   - **应用徽标**: 可选，暂时跳过
   
   **应用首页链接**: `http://localhost:6100`（可选）
   
   **授权网域**: 暂时不填（本地开发不需要）
   
   **开发者联系信息**：
   - **电子邮件地址**: 填写你的邮箱

5. 点击 **"保存并继续"**

6. **作用域 (Scopes)** 页面：
   - 点击 **"添加或移除范围"**
   - 选择以下范围（基本信息）：
     - ✅ `.../auth/userinfo.email`
     - ✅ `.../auth/userinfo.profile`
     - ✅ `openid`
   - 点击 **"更新"**
   - 点击 **"保存并继续"**

7. **测试用户** 页面：
   - 点击 **"+ 添加用户"**
   - 输入你自己的 Google 邮箱地址（用于测试）
   - 点击 **"添加"**
   - 点击 **"保存并继续"**

8. **摘要** 页面：
   - 检查信息无误后点击 **"返回控制台"**

---

### 步骤 4: 创建 OAuth 2.0 凭据

1. 在左侧菜单中，选择 **"API和服务"** → **"凭据"**
   - 或直接访问：https://console.cloud.google.com/apis/credentials

2. 点击页面顶部的 **"+ 创建凭据"**

3. 选择 **"OAuth 客户端 ID"**

4. 如果提示配置同意屏幕，说明步骤 3 没完成，返回完成步骤 3

5. 配置 OAuth 客户端：

   **应用类型**: 
   - 选择 ✅ **"Web 应用"**
   
   **名称**: 
   - 输入 `Presentation AI Web Client`（或你喜欢的名字）
   
   **已获授权的 JavaScript 来源**: 
   - 点击 **"+ 添加 URI"**
   - 输入: `http://localhost:6100`
   
   **已获授权的重定向 URI**: 
   - 点击 **"+ 添加 URI"**
   - ⚠️ **重要！** 输入: `http://localhost:6100/api/auth/callback/google`
   - 确保路径完全正确，包括 `/api/auth/callback/google`

6. 点击 **"创建"**

---

### 步骤 5: 获取凭据

创建成功后，会弹出一个对话框显示：

- **客户端 ID** (Client ID)
- **客户端密钥** (Client Secret)

✅ **复制这两个值！**

如果对话框关闭了，你可以：
1. 在 **"凭据"** 页面找到刚创建的 OAuth 2.0 客户端
2. 点击客户端名称
3. 在详情页面可以看到客户端 ID 和密钥

---

### 步骤 6: 配置到 .env 文件

1. 打开项目中的 `.env` 文件

2. 找到以下两行：
```env
GOOGLE_CLIENT_ID="你的Google客户端ID"
GOOGLE_CLIENT_SECRET="你的Google客户端密钥"
```

3. 替换为你刚才复制的值：
```env
GOOGLE_CLIENT_ID="123456789-xxxxxxxxxxxxxxxxxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx"
```

4. **保存文件** ✅

---

## 📝 配置示例

你的 `.env` 文件应该看起来像这样：

```env
# 数据库配置
DATABASE_URL="postgresql://postgres:password@localhost:5432/presentation_ai"

# NextAuth 配置
NEXTAUTH_SECRET="a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
NEXTAUTH_URL="http://localhost:6100"

# Google 认证（已配置）✅
GOOGLE_CLIENT_ID="123456789-abcdefghijk.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-abc123def456ghi789jkl012"

# OpenAI API
OPENAI_API_KEY="sk-..."

# 其他可选配置...
```

---

## ⚠️ 重要注意事项

### 1. 重定向 URI 必须完全匹配
```
✅ 正确: http://localhost:6100/api/auth/callback/google
❌ 错误: http://localhost:6100/
❌ 错误: http://localhost:6100/api/auth/callback
❌ 错误: https://localhost:6100/api/auth/callback/google (不是 https)
```

### 2. 端口必须一致
- Google Console 配置: `http://localhost:6100`
- .env 文件配置: `NEXTAUTH_URL="http://localhost:6100"`
- 启动命令: `$env:PORT=6100; npm run dev`

### 3. 测试用户
在应用发布前，只有添加为"测试用户"的 Google 账号才能登录。

### 4. 保密密钥
- ⚠️ **不要将 GOOGLE_CLIENT_SECRET 分享给任何人**
- ⚠️ **不要提交到公共 Git 仓库**
- `.env` 文件已在 `.gitignore` 中，不会被提交

---

## ✅ 验证配置

配置完成后，当你启动应用：

1. 访问 `http://localhost:6100`
2. 点击 "使用 Google 登录"
3. 应该会跳转到 Google 登录页面
4. 登录后应该会重定向回应用

如果出现错误，检查：
- ✅ 重定向 URI 是否完全正确
- ✅ 端口是否一致
- ✅ 你的 Google 账号是否添加为测试用户

---

## 🔗 相关链接

- Google Cloud Console: https://console.cloud.google.com/
- OAuth 同意屏幕: https://console.cloud.google.com/apis/credentials/consent
- 凭据管理: https://console.cloud.google.com/apis/credentials
- NextAuth.js 文档: https://next-auth.js.org/providers/google

---

## 💡 快速命令

生成 NEXTAUTH_SECRET（在 PowerShell 中运行）：
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

---

配置完成后，你就可以继续配置其他 API 密钥了！🎉
