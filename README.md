# 北轨导向标志生成器

一个简单易用的在线导向标志制作工具，帮助北轨爱好者和设计者快速创建和编辑导向标志。

> ⚠️ 注意：当前版本为测试版本，部分功能可能尚未完全实现。

## ✨ 特性

- 🖱️ 拖拽式导向标志编辑器
- 📝 自定义文字编辑
- 🎨 自定义颜色选项
- 💾 支持导出JPG和SVG格式

## 路线图

- [x] 撤销、重做功能（支持快捷键 Ctrl+Z 和 Ctrl+Shift+Z）
- [ ] 保存到localStorage，关闭后重新打开时自动加载
- [ ] 导入导出配置
- [ ] 编辑配置
- [ ] 增加其他城市的导向标志
- [ ] 多语言支持
- [ ] 支持导出PDF格式
- [ ] 模版功能

## 🛠️ 技术栈

- React
- TypeScript
- Vite
- TailwindCSS
- Radix UI
- Lucide Icons

## 🚀 本地开发

1. 安装依赖

```bash
pnpm install
```

2. 启动开发服务器

```bash
pnpm dev
```

3. 构建项目

```bash
pnpm build
```

## 📦 项目结构

```
src/
├── components/     # React组件
│   ├── canvas/    # 画布相关组件
│   ├── dialog/    # 对话框组件
│   ├── toolbar/   # 工具栏组件
│   └── ui/        # 通用UI组件
├── utils/         # 工具函数
├── types/         # TypeScript类型定义
└── lib/          # 通用库函数
```

## 💡 使用说明

1. 从左侧工具栏选择导向标志添加到画板，拖拽即可排序，点击导向标志打开菜单
2. 首次打开时，需要5-10秒进行加载，请耐心等待
3. 支持自定义文字、颜色设置
4. 可以导出JPG或SVG格式的成品图片

## 🤝 贡献指南

欢迎提交Issue和Pull Request！欢迎访问[GitHub仓库](https://github.com/mercutiojohn/vi-tool)。

## 📄 版权说明

本项目的代码采用 [MIT许可证](LICENSE) 进行开源。

特别说明：

- 项目中的图片资源（包括SVG文件）版权属于 Central Go (© 2025)，CC-BY-NC-SA 4.0协议。
- 这些资源不受此MIT许可证的保护。
- App Copyright © 2025 Ryan.G
- 该工具内容与官方运营单位无关，仅供参考
