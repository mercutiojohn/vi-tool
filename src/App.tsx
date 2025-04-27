import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Canvas from '@/components/canvas/Canvas';
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
  Menu, 
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
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { APP_VERSION, GITHUB_URL } from './config';

export default function App() {
  const [fontBuffer, setFontBuffer] = useState<ArrayBuffer | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [canvasItems, setCanvasItems] = useState<SvgItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
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
      alert('画板中没有可导出的图标');
      return;
    }
    
    await exportAsJPG(canvasItems, fontBuffer);
  };

  // 导出SVG
  const handleExportSvg = async () => {
    if (!fontBuffer) {
      alert('字体尚未加载完成，请稍后再试');
      return;
    }
    
    if (canvasItems.length === 0) {
      alert('画板中没有可导出的图标');
      return;
    }
    
    await exportAsSVG(canvasItems, fontBuffer);
  };

  // 添加项目到画布
  const handleAddItem = (file: string, customUrl?: string) => {
    console.log('App: 添加新项目:', { file, customUrl });
    const newItem: SvgItem = {
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      file,
      customUrl,
    };
    setCanvasItems(prev => [...prev, newItem]);
  };

  // 切换侧边栏折叠状态
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };
  
  return (
    <div className="flex flex-col h-screen bg-background">
      {/* 顶部导航栏 */}
      <header className="border-b bg-background h-14 flex items-center px-4 justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            NaL 导向标志生成器
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
              <Button variant="ghost" size="sm" disabled className="text-muted-foreground flex gap-1">
                <Undo className="h-4 w-4" />
                撤销
              </Button>
              <Button variant="ghost" size="sm" disabled className="text-muted-foreground flex gap-1">
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
              最后更新：{new Date().toLocaleDateString('zh-CN')}
            </div>
          </div>
          
          {/* 画布区域 */}
          <ScrollArea className="flex-1 p-8">
            {isLoading ? (
              <div className="h-full flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
                <p className="text-muted-foreground">正在加载资源...</p>
              </div>
            ) : (
              <div className="max-w-6xl mx-auto h-full flex flex-col">
                <Canvas 
                  items={canvasItems}
                  onItemsChange={setCanvasItems}
                  onAddItem={handleAddItem}
                />
                
                {canvasItems.length === 0 && (
                  <div className="mt-12 text-center text-muted-foreground flex flex-col items-center">
                    <PanelLeft className="h-12 w-12 mb-4 text-muted-foreground/50" />
                    <h3 className="text-lg font-medium mb-2">开始创建您的导向标志</h3>
                    <p className="max-w-md text-sm">从左侧工具栏拖拽元素到画布，或点击元素添加到画布。点击画布中的元素可以编辑、复制或删除。</p>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
      
      {/* 底部状态栏 */}
      <footer className="border-t py-2 px-4 bg-muted/30 text-xs text-muted-foreground flex items-center justify-between">
        <div className="flex items-center">
          <span className="mr-2">Copyright © 2025 Central Go</span>
          <Separator orientation="vertical" className="h-3 mx-2" />
          <a href="https://beian.miit.gov.cn/" className="hover:text-foreground transition-colors">京ICP备2023014659号</a>
          <Separator orientation="vertical" className="h-3 mx-2" />
          <a href="https://beian.mps.gov.cn/#/query/webSearch?code=11010802042299" 
             rel="noreferrer noopener" 
             target="_blank"
             className="hover:text-foreground transition-colors flex items-center">
            <img src="/beian.png" alt="备案" className="h-[14px] mr-1" />
            京公网安备11010802042299号
          </a>
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
            <AlertDialogDescription className="space-y-2 text-foreground/80">
              <p className="flex items-start">
                <span className="mr-2">1.</span> 
                <span>从左侧工具栏选择图标添加到画板，拖拽即可排序，点击图标打开菜单。</span>
              </p>
              <p className="flex items-start">
                <span className="mr-2">2.</span> 
                <span>目前该工具仍为测试版本，部分功能尚未实现，仅供参考体验。</span>
              </p>
              <p className="flex items-start">
                <span className="mr-2">3.</span> 
                <span>首次打开时，需要5-10秒进行加载，请耐心等待。</span>
              </p>
              <p className="flex items-start">
                <span className="mr-2">4.</span> 
                <span>工具内容与官方运营单位无关，仅供参考。</span>
              </p>
              {/* <div className="mt-4 pt-4 border-t border-border">
                <p className="font-bold mb-2 text-primary flex items-center">
                  <span className="bg-primary/10 rounded-full p-1 mr-2">
                    <Download className="h-4 w-4 text-primary" />
                  </span>
                  版本0.85
                </p>
                <ul className="space-y-1 pl-6 list-disc">
                  <li>加入导出SVG功能</li>
                  <li>优化工具栏SVG代码格式</li>
                  <li>增加分支出口排版方式</li>
                  <li>增加更多素材</li>
                  <li>全新侧边栏界面设计</li>
                </ul>
              </div> */}
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
