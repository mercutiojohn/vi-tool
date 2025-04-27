import { useEffect, useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import Canvas, { CanvasRef } from '@/components/canvas/Canvas';
import Toolbar from '@/components/toolbar/Toolbar';
import { loadFonts } from '@/utils/fontUtils';
import { exportAsJPG, exportAsSVG } from '@/utils/exportUtils';
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
  Info, 
  Eraser, 
  Save, 
  Download, 
  PanelLeft, 
  Undo, 
  Redo,
  Github,
  Loader2
} from 'lucide-react';
import { SvgItem } from './types';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { APP_VERSION, GITHUB_URL, BEIAN_CONFIG, HELP_CONTENT, UPDATE_LOG, APP_NAME } from './config';
// import { MDXProvider } from '@mdx-js/react';
import ReactMarkdown from 'react-markdown';

export default function App() {
  const canvasRef = useRef<CanvasRef>(null);
  const [fontBuffer, setFontBuffer] = useState<ArrayBuffer | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [canvasItems, setCanvasItems] = useState<SvgItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  
  // 监听canvasItems变化
  useEffect(() => {
    console.log('App: canvasItems更新:', canvasItems);
  }, [canvasItems]);

  // 加载字体
  useEffect(() => {
    async function loadFontData() {
      setIsLoading(true);
      try {
        const buffer = await loadFonts();
        if (buffer) {
          setFontBuffer(buffer);
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
  const handleAddItem = useCallback((file: string, customUrl?: string): string => {
    console.log('App: 添加新项目:', { file, customUrl });
    // 创建新项目
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    const newItem: SvgItem = { id, file, customUrl };
    // 使用newItem的引用更新状态
    setCanvasItems(prev => {
      const newItems = [...prev, newItem];
      return newItems;
    });
    // 返回新创建的项目ID
    return id;
  }, []);

  // 切换侧边栏折叠状态
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };
  
  return (
    <div className="flex flex-col h-screen bg-background">
      {/* 顶部导航栏 */}
      <header className="border-b bg-background h-14 flex items-center px-4 justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          {/* <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Menu className="h-5 w-5" />
          </Button> */}
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            {APP_NAME}
            <Badge variant="secondary" className="ml-1 font-normal">Beta</Badge>
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={showHelp} className="flex items-center gap-1">
            <Info className="h-4 w-4" /> 帮助
          </Button>
          
          <Separator orientation="vertical" className="h-6" />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                导出
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>导出选项</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleExportJpg} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                导出为JPG
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportSvg} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                下载SVG
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      
      {/* 主内容区 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧工具栏 */}
        <div className="flex h-full">
          <Toolbar 
            onAddItem={handleAddItem}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={toggleSidebar}
          />
        </div>
        
        {/* 右侧工作区 */}
        <div className="flex-1 overflow-hidden flex flex-col">
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
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleClear}
                disabled={canvasItems.length === 0}
                className="flex items-center gap-1"
              >
                <Eraser className="h-4 w-4" /> 清空画板
              </Button>
            </div>
            
            <div className="text-xs text-muted-foreground">
              {/* 最后更新：{new Date().toLocaleDateString('zh-CN')} */}
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
                
                {/* {canvasItems.length === 0 && (
                  <div className="mt-12 text-center text-muted-foreground flex flex-col items-center">
                    <PanelLeft className="h-12 w-12 mb-4 text-muted-foreground/50" />
                    <h3 className="text-lg font-medium mb-2">开始创建您的导向标志</h3>
                    <p className="max-w-md text-sm">从左侧工具栏拖拽元素到画布，或点击元素添加到画布。点击画布中的元素可以编辑、复制或删除。</p>
                  </div>
                )} */}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* 底部状态栏 */}
      <footer className="border-t py-2 px-4 bg-muted/30 text-xs text-muted-foreground flex items-center justify-between">
        <div className="flex items-center">
          <span className="mr-2">{BEIAN_CONFIG.copyright}</span>
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
            <AlertDialogTitle className="text-xl">使用帮助</AlertDialogTitle>
            <AlertDialogDescription>
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
    </div>
  );
}
