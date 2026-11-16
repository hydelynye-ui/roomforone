# roomforone · 给自己留一点空间

> **roomforone** 是一款以独处与心流为核心的低多边形沉浸数字空间 Web 应用。它将 3D 物件探索、自适应当季天气、环境白噪音模拟、涂鸦画板、轻量小游戏、手作记录与 AI 心情氛围转换深度融合在同一个界面中。

---

## 一、产品定位与核心功能

- **沉浸式 3D 开放剖面房间**：支持水平安全视角环绕拖拽（100°~140°），视角受控防穿墙。
- **物件直观导航入口**：
  - 💻 **电脑**：个人作品集与项目 Bento 展示面板。
  - 🎨 **画板**：Canvas 2D 自由涂鸦创作，支持画笔、橡皮、色盘、撤销与 PNG 导出，草稿自动暂存至本地 IndexedDB。
  - 🧩 **Tangle**：桌面思考物件，点击后打开随手灵感便签，记录仅保存在当前设备。
  - 🎧 **AirPods Max**：私人听觉入口，复用同一个环境音引擎，可调整天气声与房间声比例。
  - 🎮 **游戏手柄**：秋日接落叶 30 秒轻量趣味小游戏，支持键盘/触摸操控竹篮与最高分持久化。
  - 🔨 **侧墙洞洞板**：木工、客制化键盘与精装手账的手作图文记录。
  - 🪟 **窗户**：开/关窗状态切换，实时联动外部雨雪风声滤波器与粒子进入边界。
  - 💡 **台灯**：暖光照明开关与柔和光照阴影计算。
  - 📻 **音箱**：基于 Web Audio API 纯前端程序化合成雨声、微风、鸟鸣与 Lo-Fi 底噪，零外部大文件依赖。
  - ✨ **AI 心情便签**：「今天想待在什么样的房间？」，输入心情语句即可智能推导适宜的天气预设、灯光与便签短句。

---

## 二、技术架构

| 模块 / 技术 | 选型 | 说明 |
|---|---|---|
| **前端框架** | **React 19 + TypeScript** | 现代组件化架构与严格类型安全 |
| **构建体系** | **Vite 6** | 极速热更新开发服务器与高效率打包构建 |
| **样式体系** | **Tailwind CSS 4** | Utility-first 设计系统与 Token |
| **3D 渲染** | **Three.js** | 开放剖面房间几何体、材质、光影与粒子系统 |
| **音效系统** | **Web Audio API** | 纯前端程序化白噪音与天气声景合成（离线运行） |
| **图标库** | **Lucide React** | 统一且高质感的线性图标体系 |
| **本地存储** | **IndexedDB (`roomforone-local-v1`)** | 大容量画板草稿与笔记持久化 |
| **轻量偏好** | **localStorage (`roomforone-state-v1`)** | 房间状态、天气预设、音量及最高分记录 |

---

## 三、项目目录结构

```
roomforone/
├── .env.example               # 环境变量模板（无任何私密凭据）
├── .env.local                 # 本地开发环境变量
├── .gitignore                 # 严密过滤 node_modules、dist、.env.local 等
├── AGENTS.md                  # AI Agent / Codex 协作规范
├── cloudbaserc.json           # CloudBase v2.1 规范部署配置文件
├── index.html                 # 单页 HTML 模板
├── package.json               # 依赖与脚本
├── package-lock.json          # 依赖锁定文件
├── tsconfig.json              # TypeScript 编译配置
├── vite.config.js             # Vite 配置文件 (base: '/')
├── public/
│   └── favicon.svg            # 站点图标
└── src/
    ├── main.tsx               # 应用挂载入口
    ├── App.tsx                # 主应用组件与状态总线
    ├── index.css              # 全局样式与 Tailwind 指令
    ├── types/
    │   └── index.ts           # 全局 TypeScript 接口定义
    ├── services/
    │   ├── storage.ts         # 本地独立存储隔离服务 (localStorage / IndexedDB)
    │   ├── audioEngine.ts     # Web Audio API 声音程序化引擎
    │   └── aiMoodService.ts   # 智能心情语义解析规则层
    └── components/
        ├── Room3D.tsx         # Three.js 3D 房间与交互射线拾取
        ├── TopBar.tsx         # 顶部状态与快速天气切换栏
        ├── BentoCards.tsx     # 桌面 Bento 侧边卡片
        ├── FloatingDock.tsx   # 底部悬浮快捷 Dock
        ├── ComputerModal.tsx  # 作品集弹窗
        ├── DrawingModal.tsx   # 涂鸦画板弹窗
        ├── GameModal.tsx      # 接落叶游戏弹窗
        ├── DIYModal.tsx       # 手作记录弹窗
        ├── TangleModal.tsx    # Tangle 随手灵感便签
        ├── HeadphonesModal.tsx# AirPods Max 声音入口
        ├── AtmosphereModal.tsx# 氛围与混音弹窗
        ├── MoodAIModal.tsx    # AI 心情转换弹窗
        └── AboutModal.tsx     # 关于与环境信息弹窗
```

---

## 四、本地开发与构建

### 1. 安装依赖
```bash
npm ci
```

### 2. 本地开发服务器启动
```bash
npm run dev
```
启动后在浏览器打开 `http://localhost:5173` 即可预览。

### 3. 生产打包构建
```bash
npm run build
```
构建产物输出到 `dist/` 目录。

---

## 五、环境变量配置

复制 `.env.example` 为 `.env.local`：
```bash
cp .env.example .env.local
```

配置项说明：
```env
# 专属 CloudBase 环境 ID
VITE_CLOUDBASE_ENV_ID=applicable-butterfly-d9ac7eb21be
# CloudBase 地域
VITE_CLOUDBASE_REGION=ap-shanghai
# 公共发布密钥（客户端安全公钥，不填时使用本地模拟）
VITE_CLOUDBASE_PUBLISHABLE_KEY=
# 独立环境根路径
VITE_APP_BASE_PATH=/
VITE_APP_NAME=roomforone
```

---

## 六、CloudBase 环境信息

- **环境名称**：`applicable-butterfly`
- **环境 ID**：`applicable-butterfly-d9ac7eb21be`
- **地域**：`ap-shanghai`
- **部署模式**：静态网站托管（Static Hosting）
- **部署路径**：`/`（独立根路径）
- **访问域名**：`https://applicable-butterfly-d9ac7eb21be-1525079590.tcloudbaseapp.com/`

> **环境隔离红线**：
> 本项目与历史生产项目 `Focus Space`（环境 ID: `focus-space-d5gmg1bimc422765f`）完全物理隔离，严禁将本项目部署至 Focus Space 环境，亦严禁混入 Focus Space 的任何配置与资产。

---

## 七、GitHub 分支管理与协作流程

- **默认生产分支**：`master`
- **开发规范**：
  - 功能特性在特性分支开发，通过 PR 合并至 `master`。
  - 严禁对 `master` 执行 `git push --force` 或 `git reset --hard`。
  - 严禁将含有 API Key、Secret、私钥或 `.env.local` 的文件提交至版本库。

---

## 八、部署方式与回滚方法

### 1. 声明式 CLI 部署
在项目根目录下执行：
```bash
# 1. 构建前端产物
npm run build

# 2. 部署到 CloudBase 静态托管
tcb deploy
```

### 2. 部署回滚
- **代码版本回滚**：使用 `git revert <commit-id>` 生成回滚提交，并重新执行构建与部署。
- **静态资源回溯**：在 CloudBase 控制台「静态网站托管 - 文件管理」中回滚历史上传或重新上传对应版本的 `dist/` 静态资源包。

---

## 九、尚未实现的云端功能（规划中）

当前第一阶段为完全离线的纯静态沉浸体验，以下功能预留架构将在第二阶段逐步实现：
1. **云函数真实大模型 API 接入**：通过独立云函数（`roomforone-ai`）接入服务端 LLM 模型，替代当前本地规则分析引擎。
2. **多端云数据库同步**：通过带有 `roomforone_` 前缀的独立数据库表实现涂鸦草稿与便签的跨设备同步。
3. **云存储私有画廊**：开通专属对象存储 `roomforone/uploads/` 供访客导出并分享个人涂鸦。


## 互动房间更新（2026-11-16）

本次完整实现和验收说明见 [IMPLEMENTATION_REPORT.md](IMPLEMENTATION_REPORT.md)。
桌面小物件共用同一套选中、拿起、拖动、旋转与放回逻辑。所有新场景数据均写入原 `roomforone-state-v1`；既有 IndexedDB 画稿保留。

```bash
npm ci --include=optional
npm run typecheck
npm test
npm run build
npm run dev -- --host 0.0.0.0
```

鼠标拖动空白转动镜头；拖动物件移动，右键或 Shift + 拖动旋转。手机单指操作物件、双指转动房间，工具栏可切换旋转模式。选中后可使用方向键移动、R 旋转、Escape 退出。Tangle 拖动连接段改变形状，“恢复原状”重置形状。

耳机面板提供雨声、风声、鸟鸣、lo-fi 四条独立逻辑轨、总音量与总静音；声音仅在主动点击后解锁。lo-fi 是自有程序生成的占位旋律。手柄的 A/B/方向键/Home 与既有秋日接落叶游戏联动，其余按钮的说明显示在游戏底部。

WebGL 不可用时尝试 Three.js SVGRenderer 简化渲染，复用同一份场景、相机、射线拾取和状态；阴影、贴图及 GPU 玻璃效果会简化。若两种渲染都失败仍可浏览普通卡片。电脑与手机尺寸验收使用 `tests/viewport.html`，该测试页不进入 Vite 的生产入口。

`.openai/hosting.json` 仅配置本次私密体验站。CloudBase 的专用环境与 `/` 根部署配置保持原样；未在当前会话执行 CloudBase 正式上传。
