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
import { Info, Eraser, Save, Download } from 'lucide-react';
import { SvgItem } from './types';

export default function App() {
  const [fontBuffer, setFontBuffer] = useState<ArrayBuffer | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [canvasItems, setCanvasItems] = useState<SvgItem[]>([]);
  
  // 监听canvasItems变化
  useEffect(() => {
    console.log('App: canvasItems更新:', canvasItems);
  }, [canvasItems]);

  // 加载字体
  useEffect(() => {
    async function loadFontData() {
      const buffer = await loadFonts();
      if (buffer) {
        setFontBuffer(buffer);
      }
    }
    loadFontData();
  }, []);
  
  // 清空画板
  const handleClear = () => {
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
    if (fontBuffer) {
      if (canvasItems.length === 0) {
        alert('画板中没有可导出的图标');
        return;
      }
      await exportAsJPG(canvasItems, fontBuffer);
    } else {
      alert('字体尚未加载完成，请稍后再试');
    }
  };

  // 导出SVG
  const handleExportSvg = async () => {
    if (fontBuffer) {
      if (canvasItems.length === 0) {
        alert('画板中没有可导出的图标');
        return;
      }
      await exportAsSVG(canvasItems, fontBuffer);
    } else {
      alert('字体尚未加载完成，请稍后再试');
    }
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
  
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b bg-background py-6">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-primary mb-2">NaL 导向标志生成器</h1>
          <p className="text-muted-foreground mb-4">
            <span className="inline-flex items-center">
              <Download className="h-4 w-4 mr-1 rotate-180" />
              {new Date().toLocaleDateString('zh-CN')}更新
            </span>
            <span className="mx-2">|</span>
            <span className="inline-flex items-center">
              <Eraser className="h-4 w-4 mr-1" />
              清理缓存以加载新功能
            </span>
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              variant="outline" 
              onClick={showHelp}
              className="flex items-center gap-2"
            >
              <Info className="h-4 w-4" /> 帮助
            </Button>
            <Button 
              variant="destructive"
              onClick={handleClear}
              className="flex items-center gap-2"
            >
              <Eraser className="h-4 w-4" /> 清空画板
            </Button>
            <Button 
              variant="secondary" 
              onClick={handleExportJpg}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" /> 导出为JPG
            </Button>
            <Button 
              variant="default" 
              onClick={handleExportSvg}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" /> 下载SVG
            </Button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 p-8 flex justify-center items-center">
        <Canvas 
          items={canvasItems}
          onItemsChange={setCanvasItems}
          onAddItem={handleAddItem}
        />
      </main>
      
      <Toolbar 
        onAddItem={handleAddItem} 
      />
      
      <footer className="bg-muted py-6 text-center -mt-20 relative">
        <div className="container mx-auto">
          <div className="text-foreground font-bold mb-2">Copyright © 2025 Central Go</div>
          <div className="text-sm mb-2">
            <a href="https://beian.miit.gov.cn/" className="text-muted-foreground hover:text-foreground transition-colors">京ICP备2023014659号</a>
          </div>
          <div className="text-sm flex items-center justify-center">
            <img src="../beian.png" alt="备案" className="h-[15px] mr-1" />
            <a href="https://beian.mps.gov.cn/#/query/webSearch?code=11010802042299" 
               rel="noreferrer noopener" 
               target="_blank"
               className="text-muted-foreground hover:text-foreground transition-colors">
              京公网安备11010802042299号
            </a>
          </div>
        </div>
      </footer>

      <AlertDialog open={isHelpOpen} onOpenChange={setIsHelpOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">使用帮助</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2 text-foreground/80">
              <p className="flex items-start">
                <span className="mr-2">1.</span> 
                <span>点击底部工具栏图标添加到画板，拖拽即可排序，亦可点击图标打开菜单。</span>
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
              <div className="mt-4 pt-4 border-t border-border">
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
                </ul>
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
