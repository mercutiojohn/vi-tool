import { Home, Settings } from "lucide-react"

import {
  createBrowserRouter
} from "react-router";

import Layout from "./components/layout";
import App from "./App";

export const GITHUB_URL = "https://github.com/mercutiojohn/vi-tool";
export const CENTRAL_GO_URL = "https://centralgo.site/vi.html";
export const CENTRAL_GO_LOGO_PATH = "/centralgo_logo.png";
export const PERSONAL_URL = "https://yuchengao.work";
export const PERSONAL_LOGO_PATH = "/logo.svg";

export const APP_NAME = "导向标志生成器";

export const APP_VERSION  = `v0.4`;

// 备案信息配置
export const BEIAN_CONFIG = {
  icp: {
    text: "京ICP备2023014659号",
    url: "https://beian.miit.gov.cn/"
  },
  police: {
    text: "京公网安备11010802042299号",
    url: "https://beian.mps.gov.cn/#/query/webSearch?code=11010802042299",
    iconPath: "/beian.png"
  },
  copyright: "Images Copyright © 2025 Central Go; App Copyright © 2025 Ryan.G",
};

// 使用帮助内容 - Markdown格式
export const HELP_CONTENT = `
1. 从左侧工具栏选择导向标志添加到画板；
2. 拖拽进行排序；
3. 右键打开菜单，执行编辑操作；
4. 工具内容与官方运营单位无关，仅供参考。
`;

// 更新日志 - Markdown格式
export const LICENSE_CONTENT = `
## MIT License

项目代码采用 MIT 许可证进行开源。

## 资源版权

- 项目中的图片资源（包括SVG文件）版权属于 Central Go (© 2025)，CC-BY-NC-SA 4.0协议。
- 这些资源不受MIT许可证的保护。
- 该工具内容与官方运营单位无关，仅供参考。
`;

export const CONTRIBUTION_CONTENT = `
欢迎提交Issue和Pull Request！

访问[GitHub仓库](${GITHUB_URL})参与贡献。
`;

export const UPDATE_LOG = `

## 版本${APP_VERSION}

更新日期: ${new Date().toLocaleDateString()}

feat ✨：
- 移动端适配
`;

export const UPDATE_LOG_PREVIOUS = `
## 版本v0.3
更新日期: 2025-04-29

fix 🐛：
- 修复导出 JPG 格式的问题
- 优化 Canvas 组件
- 改进 ContextMenu 组件显示逻辑

feat ✨：
- 撤销、重做功能（支持快捷键 Ctrl+Z 和 Ctrl+Shift+Z）
- 自动保存生成的自定义标志，关闭后重新打开时自动加载
- 编辑标志自定义文本、颜色配置
- 导入导出画布配置、包括自定义文本、颜色配置

## 版本v0.2
更新日期: 2025-04-29

feat ✨：
- 增加画布配置导入导出功能
- 新增自定义文本和颜色修改配置功能
- 添加文本和颜色编辑对话框

## 版本v0.1

更新日期: 2025-04-28

- 加入导出SVG功能
- 优化工具栏SVG代码格式
- 增加分支出口排版方式
- 增加更多素材
- 全新侧边栏界面设计
`;

export const ROUTER_ITEMS = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      {
        index: true,
        Component: App,
      },
      {
        path: "/settings",
        element: <div>Settings Page</div>,
      }
    ],
  },
]);

export const MENU_ITEMS = [
  {
    title: "Home",
    path: "/",
    icon: Home,
  },
  {
    title: "Settings",
    path: "/settings",
    icon: Settings,
  },
]
