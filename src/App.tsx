import { useEffect, useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import Canvas, { CanvasRef } from '@/components/canvas/Canvas';
import Toolbar from '@/components/toolbar/Toolbar';
import { loadFonts } from '@/utils/fontUtils';
import { exportAsJPG, exportAsSVG } from '@/utils/exportUtils';
import { exportCanvasConfig, importCanvasConfig } from '@/utils/configUtils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Eraser,
  Undo,
  Redo,
  Loader2,
  Menu,
  X,
  Github
} from 'lucide-react';
import { SvgItem } from './types';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  HELP_CONTENT,
  UPDATE_LOG,
  APP_NAME,
  LICENSE_CONTENT,
  CONTRIBUTION_CONTENT,
  APP_VERSION,
  GITHUB_URL,
  BEIAN_CONFIG
} from './config';
import { AppMenuItems } from '@/components/AppMenuItems';
// import { MDXProvider } from '@mdx-js/react';
import ReactMarkdown from 'react-markdown';
import { saveCanvasItems, loadCanvasItems } from '@/utils/storageUtils';

export default function App() {
  const canvasRef = useRef<CanvasRef>(null);
  const [fontBuffer, setFontBuffer] = useState<ArrayBuffer | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isLicenseOpen, setIsLicenseOpen] = useState(false);
  const [isContributionOpen, setIsContributionOpen] = useState(false);
  const [canvasItems, setCanvasItems] = useState<SvgItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 监听canvasItems变化并保存到IndexedDB
  useEffect(() => {
    if (!isLoading) { // 只在加载完成后保存数据
      console.log('App: canvasItems更新:', canvasItems);
      saveCanvasItems(canvasItems).catch(error => {
        console.error('保存画布数据失败:', error);
      });
    }
  }, [canvasItems, isLoading]);

  // 加载字体
  useEffect(() => {
    async function loadFontData() {
      setIsLoading(true);
      try {
        const buffer = await loadFonts();
        if (buffer) {
          setFontBuffer(buffer);
          // 加载完字体后，尝试从IndexedDB恢复数据
          try {
            const items = await loadCanvasItems();
            if (items.length > 0) {
              setCanvasItems(items);
            }
          } catch (error) {
            console.error('从IndexedDB加载数据失败:', error);
          }
        }
      } catch (error) {
        console.error("加载字体失败", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadFontData();
  }, []);

  // 清空画板
  const handleClear = () => {
    if (canvasItems.length === 0) return;

    if (confirm('确定要清空画板吗？')) {
      setCanvasItems([]);
    }
  };

  // 显示帮助
  const showHelp = () => {
    setIsHelpOpen(true);
  };

  // 导出JPG
  const handleExportJpg = async () => {
    if (!fontBuffer) {
      alert('字体尚未加载完成，请稍后再试');
      return;
    }

    if (canvasItems.length === 0) {
      alert('画板中没有可导出的导向标志');
      return;
    }

    await exportAsJPG(canvasItems);
  };

  // 导出SVG
  const handleExportSvg = async (): Promise<void> => {
    if (!fontBuffer) {
      alert('字体尚未加载完成，请稍后再试');
      return;
    }

    if (canvasItems.length === 0) {
      alert('画板中没有可导出的导向标志');
      return;
    }

    await exportAsSVG(canvasItems, fontBuffer);
  };

  // 添加项目到画布
  // 添加项目到画布
  const handleAddItem = useCallback((
    file: string,
    customUrl?: string,
    config?: {
      customText?: {
        cn: string;
        en: string;
        alignment: 'start' | 'middle' | 'end';
      };
      hasColorBand?: boolean;
      colorBandColor?: string;
      customColor?: string;
    }
  ): string => {
    console.log('App: 添加新项目:', { file, customUrl, config });
    // 创建新项目
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    const newItem: SvgItem = {
      id,
      file,
      customUrl,
      ...config
    };
    // 使用newItem的引用更新状态
    setCanvasItems(prev => {
      const newItems = [...prev, newItem];
      return newItems;
    });
    // 返回新创建的项目ID
    return id;
  }, []);

  // 导出配置
  const handleExportConfig = async () => {
    try {
      const config = await exportCanvasConfig(canvasItems);
      const blob = new Blob([config], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `导向标志配置_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('导出配置失败:', error);
      alert('导出配置失败，请稍后重试');
    }
  };

  // 导入配置
  const handleImportConfig = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const newItems = await importCanvasConfig(text);
        setCanvasItems(newItems);
      } catch (error) {
        console.error('导入配置失败:', error);
        alert('导入配置失败，请确保文件格式正确');
      }
    };
    input.click();
  };

  // 切换侧边栏折叠状态
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="flex flex-col h-screen bg-background relative overflow-hidden">
      {/* 移动端菜单 */}
      <div className={`fixed inset-0 bg-background/80 backdrop-blur-sm z-50 md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="fixed right-0 top-0 h-full w-[280px] bg-background border-l">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-semibold">菜单</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <AppMenuItems
                onShowHelp={showHelp}
                onExportConfig={handleExportConfig}
                onImportConfig={handleImportConfig}
                onExportJpg={handleExportJpg}
                onExportSvg={handleExportSvg}
                onShowLicense={() => setIsLicenseOpen(true)}
                onShowContribution={() => setIsContributionOpen(true)}
                variant="mobile"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 顶部导航栏 */}
      <header className="border-b bg-background h-14 flex items-center px-4 justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            {APP_NAME}
            <Badge variant="secondary" className="ml-1 font-normal">Beta</Badge>
          </h1>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground md:hidden"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="hidden md:flex items-center gap-2">
          <AppMenuItems
            onShowHelp={showHelp}
            onExportConfig={handleExportConfig}
            onImportConfig={handleImportConfig}
            onExportJpg={handleExportJpg}
            onExportSvg={handleExportSvg}
            onShowLicense={() => setIsLicenseOpen(true)}
            onShowContribution={() => setIsContributionOpen(true)}
            variant="desktop"
          />
        </div>
      </header>

      {/* 主内容区 */}
      <div className="flex md:flex-row flex-col flex-1 overflow-hidden">
        {/* 移动端时工具栏在底部，PC端在左侧 */}
        <div className="md:flex md:h-full order-last md:order-first overflow-x-auto md:overflow-x-visible">
          <Toolbar
            onAddItem={handleAddItem}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={toggleSidebar}
          />
        </div>

        {/* 工作区 */}
        <div className="flex-1 overflow-hidden flex flex-col order-first md:order-last">
          {/* 工具栏 */}
          <div className="flex items-center justify-between border-b p-2">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={!canUndo}
                className="text-muted-foreground flex gap-1"
                onClick={() => canvasRef.current?.undo()}
              >
                <Undo className="h-4 w-4" />
                撤销
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={!canRedo}
                className="text-muted-foreground flex gap-1"
                onClick={() => canvasRef.current?.redo()}
              >
                <Redo className="h-4 w-4" />
                重做
              </Button>
              <Separator orientation="vertical" className="h-6" />
              
            </div>

            <div className="text-xs text-muted-foreground">
            <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                disabled={canvasItems.length === 0}
                className="flex items-center gap-1"
              >
                <Eraser className="h-4 w-4" /> 清空画板
              </Button>
            </div>
          </div>

          {/* 画布区域 */}
          <div className="flex-1 p-8 h-full relative">
            {isLoading ? (
              <div className="h-full flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
                <p className="text-muted-foreground">正在加载资源...</p>
              </div>
            ) : (
              <div className="max-w-6xl mx-auto h-full flex flex-col justify-center items-center">

                <div className="absolute inset-0 bg-muted pointer-events-none" />

                {/* 画布 */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, #00000023 1px, transparent 0)`,
                    backgroundSize: '12px 12px',
                  }}
                />

                <Canvas
                  ref={canvasRef}
                  items={canvasItems}
                  onItemsChange={setCanvasItems}
                  onAddItem={handleAddItem}
                  onHistoryChange={state => {
                    setCanUndo(state.canUndo);
                    setCanRedo(state.canRedo);
                  }}
                  className="z-10"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 底部状态栏 - 仅在PC端显示 */}
      <footer className="border-t py-2 px-4 bg-muted/30 text-xs text-muted-foreground md:flex items-center justify-between hidden">
        <div className="flex items-center">
          <span className="mr-2">{BEIAN_CONFIG.copyright}</span>
          <Button variant="ghost" size="sm" onClick={() => setIsLicenseOpen(true)} className="text-xs flex items-center gap-1 !py-0 -my-2">
            版权说明
          </Button>
          <Separator orientation="vertical" className="h-3 mx-2" />
          {/* <a href={BEIAN_CONFIG.icp.url} className="hover:text-foreground transition-colors">
            {BEIAN_CONFIG.icp.text}
          </a>
          <Separator orientation="vertical" className="h-3 mx-2" />
          <a href={BEIAN_CONFIG.police.url} 
             rel="noreferrer noopener" 
             target="_blank"
             className="hover:text-foreground transition-colors flex items-center">
            <img src={BEIAN_CONFIG.police.iconPath} alt="备案" className="h-[14px] mr-1" />
            {BEIAN_CONFIG.police.text}
          </a> */}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setIsContributionOpen(true)} className="text-xs flex items-center gap-1 !py-0 -my-2">
            贡献指南
          </Button>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
          >
            <Github className="h-3 w-3" />
            <span>GitHub</span>
          </a>
          <span>{APP_VERSION}</span>
        </div>
      </footer>

      <AlertDialog open={isHelpOpen} onOpenChange={setIsHelpOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl text-start">使用帮助</AlertDialogTitle>
            <AlertDialogDescription className="text-start">
              <div className="prose prose-sm dark:prose-invert prose-headings:mb-2 prose-p:my-1 prose-ul:my-1 prose-li:my-0 max-w-none">
                <ReactMarkdown>
                  {HELP_CONTENT}
                </ReactMarkdown>
              </div>
              <div className="prose prose-sm dark:prose-invert prose-headings:text-primary prose-headings:flex prose-headings:items-center max-w-none mt-4 pt-4 border-t border-border">
                <ReactMarkdown>
                  {UPDATE_LOG}
                </ReactMarkdown>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction className="w-full sm:w-auto">确定</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isLicenseOpen} onOpenChange={setIsLicenseOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">版权说明</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="prose prose-sm dark:prose-invert prose-headings:mb-2 prose-p:my-1 prose-ul:my-1 prose-li:my-0 max-w-none">
                <ReactMarkdown>
                  {LICENSE_CONTENT}
                </ReactMarkdown>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction className="w-full sm:w-auto">确定</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isContributionOpen} onOpenChange={setIsContributionOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">贡献指南</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="prose prose-sm dark:prose-invert prose-headings:mb-2 prose-p:my-1 prose-ul:my-1 prose-li:my-0 max-w-none">
                <ReactMarkdown>
                  {CONTRIBUTION_CONTENT}
                </ReactMarkdown>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction className="w-full sm:w-auto">确定</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
