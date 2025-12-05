# Node.js 安装指南（Windows）

## 🔍 当前情况
系统中未检测到 Node.js，需要进行安装。

## 📥 安装步骤

### 方法 1: 从官网下载安装（推荐）

1. **访问 Node.js 官网**
   - 网址：https://nodejs.org/
   - 你会看到两个版本：
     - **LTS（长期支持版）** - 推荐大多数用户使用 ✅
     - **Current（最新版）** - 包含最新特性

2. **下载安装程序**
   - 点击绿色的 "LTS" 按钮下载
   - 文件名类似：`node-v20.x.x-x64.msi`

3. **运行安装程序**
   - 双击下载的 `.msi` 文件
   - 点击 "Next" 继续
   - 接受许可协议
   - **重要**：确保勾选 "Add to PATH" 选项 ✅
   - 选择完整安装（包括 npm）
   - 点击 "Install" 开始安装
   - 可能需要管理员权限

4. **验证安装**
   - **关闭当前的 PowerShell 窗口**（重要！）
   - 打开**新的** PowerShell 窗口
   - 运行以下命令：
   ```powershell
   node --version
   npm --version
   ```
   - 如果显示版本号，说明安装成功！

### 方法 2: 使用 Chocolatey 安装（适合高级用户）

如果你已经安装了 Chocolatey 包管理器：

```powershell
# 以管理员身份运行 PowerShell
choco install nodejs-lts -y
```

### 方法 3: 使用 Winget 安装（Windows 10/11）

```powershell
# 以管理员身份运行 PowerShell
winget install OpenJS.NodeJS.LTS
```

## ⚠️ 安装后必须做的事

1. **重启终端**
   - 关闭 VS Code 中的所有终端
   - 或者完全重启 VS Code

2. **验证安装**
   ```powershell
   node --version
   npm --version
   ```

3. **如果仍然无法识别 node 命令**：
   - 手动检查 Node.js 安装路径
   - 默认路径通常是：`C:\Program Files\nodejs`
   - 手动添加到 PATH 环境变量：
     1. 右键"此电脑" → "属性"
     2. 点击"高级系统设置"
     3. 点击"环境变量"
     4. 在"系统变量"中找到"Path"
     5. 点击"编辑"
     6. 添加：`C:\Program Files\nodejs\`
     7. 点击"确定"保存
     8. **重启 PowerShell 或 VS Code**

## 📋 安装完成后的下一步

安装并验证 Node.js 成功后，继续项目部署：

```powershell
# 1. 进入项目目录
cd "c:\python code\presentation-ai"

# 2. 安装项目依赖
npm install

# 3. 配置数据库
npm run db:push

# 4. 启动应用（端口 6100）
$env:PORT=6100; npm run dev
```

## 🎯 推荐版本

- **Node.js**: v20.x LTS（长期支持版）
- 这个项目需要 Node.js 18.x 或更高版本

## ❓ 常见问题

### 问：安装后还是提示 "无法识别 node"？
**答：** 
1. 确保完全关闭并重新打开终端
2. 重启 VS Code
3. 检查环境变量 PATH 是否包含 Node.js 路径

### 问：我应该选择 LTS 还是 Current？
**答：** 选择 LTS（长期支持版），更稳定可靠。

### 问：需要卸载旧版本吗？
**答：** 如果之前安装过旧版本，建议先卸载再安装新版本。

## 🔗 相关链接

- Node.js 官网：https://nodejs.org/
- Node.js 文档：https://nodejs.org/docs/
- npm 文档：https://docs.npmjs.com/

---

安装完成后，请在新的终端中运行 `node --version` 来验证安装！
