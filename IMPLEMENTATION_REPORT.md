# roomforone 实现与验收记录

日期：2026-11-16（北京时间）。基线来自 `hydelynye-ui/roomforone` 的现有 Vite + React + TypeScript + Three.js 项目和 PR #1。新增逻辑继续使用 Room3D、GameModal、audioEngine 和 storage，没有引入第二套房间、声音或本地存储系统。

## 可以体验的内容

桌面上的电脑、键盘、鼠标、台灯、Tangle、AirPods Max、Switch 手柄、收音机，以及 DIY 工具共用指针拾取和操作层。按下与点击以 7px 阈值区分；物件操作不旋转镜头。空白鼠标拖动旋转房间，手机双指转动房间。右键、Shift 拖动或工具栏旋转模式控制物件角度。抬升、缩放和放回采用平滑反馈，取消手势恢复原位置。坐标限定在桌面或工具柜台面；主要物件有排斥边界。相机范围约 120°，跨到背面时隐藏对应遮挡墙。物件选择器、键盘方向键/R、恢复原状和全景按钮提供普通 UI 与键盘入口。

Tangle 采用自制的橙色/半透明粉色圆润连杆与球形连接部。拖动任意连接段会带动前后节点，保持每段原始连接长度。默认形状、拖动形状、物件位置和角度均可恢复；随手记录与形变入口共存。当前是受约束的运动学链条，不是软体物理模拟。

AirPods Max 用低多边形头梁、耳罩和桌面支架表达。点击或拖动后放回耳机会打开统一声音面板。面板提供雨声、风声、鸟鸣、lo-fi、总音量、静音与当前天气。声音源只在第一次主动播放时创建；切天气只改变增益和滤波，不叠加旧音源。关窗降低户外声并低通滤波，所有轨道与天气使用同一状态。刷新后恢复偏好但重新保持静音。lo-fi 是本项目生成的占位和弦/旋律，没有使用未授权音乐。

Switch 模型可摆放和旋转。点击或拿起后放回打开现有 GameModal，在内容层显示独立按钮：A、B、X、Y、四个方向、L、R、ZL、ZR、加号、减号、Home。按钮有 hover、pressed 和 disabled 反馈，鼠标、触摸、键盘共享同一事件。A/Enter 开始或继续，B/减号返回，方向键/L/R 移动，ZL/下慢速、ZR/上快速，X/加号暂停，Y 重开，Home/H 退出。30 秒计时、得分、最高分和退出仍由 GameModal 负责。后台页面自动暂停。

保留五种天气、Bento、Dock、作品、画板、DIY、关于和本地心情演示。天气同步天空、光色、窗户、粒子与声音；雪花进入室内必须开窗，并限定在窗边且不越过桌面家具。画板保留 IndexedDB 草稿、画笔、橡皮、撤销、清空确认和 PNG 生成入口，草稿异步恢复前不接受新笔画，避免迟到的草稿覆盖新绘制内容。DIY 未获真实资料的内容标为“示例”。作品卡片与电脑面板复用同一数据文件。

心情演示明确标注为本地规则。结果只包含支持的预设和经过数值/长度校验的参数。请求编号处理迟到结果；记录生成时的场景版本，手动调整后拒绝应用过期结果。应用建议保留用户的窗户和静音选择。未接入真实模型，也未存储模型密钥。

## 修改文件

| 文件 | 变更 |
| --- | --- |
| `src/components/Room3D.tsx` | 同一个房间中的统一拾取/拖动/旋转/取消逻辑、物件几何、Tangle、视角、天气、分级渲染和触控命中区域 |
| `src/room/constraints.ts` | 台面边界、物件排斥、旋转归一化、Tangle 初始形状与连杆约束 |
| `src/types/index.ts` | 增量场景字段、物件姿态、四轨音量、Tangle 形状与便签类型 |
| `src/services/storage.ts` | 原键兼容迁移、数据验证、姿态/形状/声音保存、画稿事务完成反馈 |
| `src/services/audioEngine.ts` | 同一声音引擎中的四逻辑轨、总音量、主动解锁、天气混音和开关窗滤波 |
| `src/components/HeadphonesModal.tsx` | 四轨及总音量、静音、天气控制 |
| `src/components/TangleModal.tsx` | 改用原房间状态保存便签，加入回到房间编辑形状入口 |
| `src/components/SwitchControls.tsx` | 15 个独立手柄按键、触摸/键盘/鼠标按下与释放反馈 |
| `src/components/GameModal.tsx` | 既有接落叶内容接入手柄、连续移动、时间步进、暂停与最高分 |
| `src/App.tsx` | 单一状态、按需加载面板、声音状态、AI 版本保护、焦点循环与 Escape |
| `src/components/MoodAIModal.tsx` | 本地演示标识、请求去重、迟到结果保护、应用前预览 |
| `src/components/DrawingModal.tsx` | 草稿恢复时序、保存反馈、画布比例与键盘标签、PNG 显式下载入口 |
| `src/data/projects.ts` | 作品数据共用来源 |
| `src/components/ComputerModal.tsx` | 共用作品数据，补充现有项目链接显示与关闭标签 |
| `src/components/BentoCards.tsx` | 侧栏/手机重排、作品卡与普通交互入口、便签键盘访问 |
| `src/components/FloatingDock.tsx` | 窄屏五个主要入口与触控区域 |
| `src/components/DIYModal.tsx` | 将未经真实材料确认的记录明确标为示例，关闭标签 |
| `src/components/AboutModal.tsx` | 面向访客的操作、本机保存和演示说明 |
| `src/components/AtmosphereModal.tsx` | 保留原有氛围控制，补充关闭标签 |
| `src/index.css` | 响应式布局、手柄反馈、面板焦点与尺寸、减少动态、无横向页面溢出 |
| `index.html` | 保留品牌，允许浏览器正常缩放 |
| `package.json` | 增加 typecheck/test 命令，依赖和锁文件保持原有版本 |
| `tests/core.test.ts`、`tests/run.mjs` | 对真实约束与保存源代码进行七项检查 |
| `tests/viewport.html` | 在真实浏览器中载入 390px/320px 宽的应用进行响应式验收；不进入生产入口 |
| `.openai/hosting.json` | 当前私密体验站的独立静态托管声明 |
| `README.md`、`docs/qa/*.jpg` | 运行说明与实际浏览器截图 |

## 构建与验证

`npm ci --include=optional` 成功，安装了锁文件中的 95 个包。`npm run typecheck`、`npm test`、`npm run build`、`git diff --check` 均通过，未忽略 TypeScript 错误。七项测试覆盖旧状态迁移与未知字段保留、异常输入、旧便签迁移后删除不重现、所有物件台面边界、重复 120 次 Tangle 拖动的连杆长度、姿态/四轨刷新恢复和静音锁、心情结果范围。

浏览器使用本地预览 `http://127.0.0.1:4173/`；该地址属于云工作环境，不能作为用户电脑的 localhost 链接。实际验收为桌面 1363×936，以及真实 iframe 视口 390×844、320×760，未发现页面级横向溢出。手机手柄控件曾有右侧溢出，已修正并重查，320px 控制器 clientWidth 与 scrollWidth 同为 286px。

实际浏览器验证了：Tangle 连接段拖动后形状改变且没有误开面板；空白区域转动；四轨滑块分别改变；主动开启后可静音；连续切换五种天气后保持静音；A 开始、X 暂停、B 返回、Home 退出；游戏正常结束并记录 140 分最高分；便签刷新恢复；画板绘制与撤销、草稿保存；作品和 DIY 面板；心情演示应用后仍保持静音。SVG 简化模式与普通卡片均能工作。移动端的双指手势已实现，但本次未使用真实手机进行多点触摸/硬件性能测试。

PNG 已在画板生成带 download 属性的显式下载入口。下载工具拒绝 `data:` 协议，未通过更换路径或规避策略继续下载；实际文件下载完成状态尚未在此云浏览器中确认，需要在用户普通浏览器中复核。

## 访问与部署边界

独立私密体验站：https://roomforone-yy.tealpancake.chatgpt.site 。该站通过 Sites 保存相同源码和生产构建；它不代表腾讯云正式站已更新。

现有 CloudBase 专用地址：https://applicable-butterfly-d9ac7eb21be-1525079590.tcloudbaseapp.com/ 。本次执行环境没有可用的腾讯云 CLI/写入凭据，未执行 CloudBase 上传。`cloudbaserc.json` 和原环境配置未修改，也没有访问或修改 Focus Space 的仓库、数据或部署。

## 目前的实际限制

云浏览器返回 WebGL disabled，因此本次交互截图使用 SVGRenderer：它复用同一 Scene、Camera、Raycaster 和状态，避免另起平行渲染逻辑；纹理、软阴影、GPU 玻璃雨痕及部分透明表面的遮挡会简化。WebGL 路径通过类型和生产构建，但尚未在本会话的 GPU 上视觉验收。最终交互和性能仍需在真实桌面/手机设备核对，未声称已达到全设备 60/30 FPS。

生产包主脚本约 801 kB、gzip 约 222 kB，Vite 保留主包大于 500 kB 的提示；内容面板、画板和游戏已分包，声音在主动开启时才生成。Tangle 无真实软体碰撞，所有数据仍是本机保存。真实 DIY 资料和真实模型 AI 属后续可替换内容。

下一步是用这个体验站在 YY 的真实设备上验收 WebGL、双指手势和 PNG 文件下载；如果需要同步到既有腾讯云正式站，再在具有该专用环境写入凭据的会话中执行校验、dry-run 和根路径部署。
