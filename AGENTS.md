# AGENTS.md — roomforone 自动化与 AI Agent 协作工程规范

本规范适用于所有针对本仓库进行代码维护、特性迭代、缺陷修复或自动化构建的 AI Agent（包括 Codex、Claude Code、Cursor、Gemini CLI 等）。

---

## 一、修改前的基线检查

1. **项目结构感知**：修改任何文件前，必须先完整读取当前项目目录结构与依赖清单，严禁凭经验假设文件位置。
2. **环境隔离意识**：本项目绑定专属 CloudBase 环境 `applicable-butterfly-d9ac7eb21be`（地域 `ap-shanghai`，根路径 `/`）。
   - **绝对禁止**将本项目部署到已有的 Focus Space 生产环境（`focus-space-d5gmg1bimc422765f`）。
   - **绝对禁止**将 Focus Space 的代码、资源、数据库 Schema、环境变量或云函数混入本项目。

---

## 二、代码与 UI/UX 维护规范

1. **保留原有 UI 与交互设计**：
   - 保持低多边形开放剖面 3D 房间的整体美学基调（奶油白、浅木色、深暖灰、鼠尾草绿与陶土橙）。
   - 保持 3D 视角环绕角度限制（100°~140° 安全观察区间，防止视角穿墙）。
   - 保持已有核心交互：电脑作品集 Bento、画板涂鸦、接落叶小游戏、手作洞洞板、天气声音联动。
2. **优先增量修改**：
   - 不重写未受影响的模块。
   - 严禁为了代码“重构风格”而破坏现有的成熟组件架构。
3. **数据结构与持久化保护**：
   - 不随意变更 `RoomState`、`ModalType` 等核心 TypeScript 接口定义。
   - **绝对严禁**清除、覆写或重命名用户的本地持久化缓存：
     - `localStorage` Key 必须为 `roomforone-state-v1`。
     - `IndexedDB` 库名必须为 `roomforone-local-v1`。
     - 不得注册破坏性的根路径 Service Worker。

---

## 三、安全与环境安全规范（零容忍）

1. **凭证与密钥防泄漏**：
   - **严禁**将任何 `SecretId`、`SecretKey`、API Key、Token、私钥或凭据提交至 Git 仓库。
   - `.env.local` 必须严格保持在 `.gitignore` 中。
   - `.env.example` 中仅保留公开环境变量名与环境 ID，值必须脱敏或留空。
2. **生产部署审批防线**：
   - **未经用户明确确认，严禁擅自执行云端正式发布命令**（如 `tcb deploy`、`tcb hosting deploy`）。
   - 任何部署前，必须严格先执行 `tcb validate` 与 `tcb deploy --dry-run` 审查资源变动。
   - 若 dry-run 显示部署路径不为 `/`，或涉及外部项目，必须立即终止。
3. **Git 协作纪律**：
   - 严禁执行 `git reset --hard` 或 `git push --force`。
   - 保持清晰规范的 Commit Message。
