import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Canvas from '@/components/canvas/Canvas';
import Toolbar from '@/components/toolbar/Toolbar';
import { loadFonts } from '@/utils/fontUtils';
import { exportAsJPG, exportAsSVG } from '@/utils/exportUtils';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './components/ui/alert-dialog';
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
    console.log('App: 创建的新项目:', newItem);
    setCanvasItems(prev => {
      console.log('App: 当前items:', prev);
      const newItems = [...prev, newItem];
      console.log('App: 更新后的items:', newItems);
      return newItems;
    });
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white py-6 shadow-md">
        <div className="container mx-auto text-center">
          <h1 className="text-3xl font-bold text-[#001D31] mb-2">NaL 导向标志生成器</h1>
          <p className="text-gray-600 mb-4">🔄 {new Date().toLocaleDateString('zh-CN')}更新 🧹 清理缓存以加载新功能</p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              variant="outline" 
              className="bg-[#bdcbd2] text-[#001D31] hover:bg-[#c5e3ef]"
              onClick={showHelp}
            >
              ℹ️ 帮助
            </Button>
            <Button 
              variant="destructive"
              onClick={handleClear}
            >
              🧽 清空画板
            </Button>
            <Button 
              variant="default" 
              className="bg-[#001D31] hover:bg-[#003366]"
              onClick={handleExportJpg}
            >
              💾 导出为JPG
            </Button>
            <Button 
              variant="default" 
              className="bg-[#001D31] hover:bg-[#003366]"
              onClick={handleExportSvg}
            >
              ⏬ 下载SVG
            </Button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 p-8 flex justify-center items-center">
          <Canvas 
            items={canvasItems}
            onItemsChange={setCanvasItems}
          />
      </main>
      
      <Toolbar 
        onAddItem={handleAddItem} 
      />
      
      <footer className="bg-[#BDCBD2] py-6 text-center -mt-20 relative">
        <div className="container mx-auto">
          <div className="text-[#001D31] font-bold mb-2">Copyright © 2025 Central Go</div>
          <div className="text-sm mb-2">
            <a href="https://beian.miit.gov.cn/">京ICP备2023014659号</a>
          </div>
          <div className="text-sm flex items-center justify-center">
            <img src="../beian.png" alt="备案" className="h-[15px] mr-1" />
            <a href="https://beian.mps.gov.cn/#/query/webSearch?code=11010802042299" rel="noreferrer noopener" target="_blank">
              京公网安备11010802042299号
            </a>
          </div>
        </div>
      </footer>

      <AlertDialog open={isHelpOpen} onOpenChange={setIsHelpOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>使用帮助</AlertDialogTitle>
            <AlertDialogDescription>
              <p>1️⃣点击底部工具栏图标添加到画板，拖拽即可排序，亦可点击图标打开菜单。</p>
              <p>2️⃣目前该工具仍为测试版本，部分功能尚未实现，仅供参考体验。</p>
              <p>3️⃣首次打开时，需要5-10秒进行加载，请耐心等待。</p>
              <p>4️⃣工具内容与官方运营单位无关，仅供参考。</p>
              <p className="mt-4 font-bold">🍉版本0.85🍑</p>
              <p>1️⃣加入导出SVG功能。</p>
              <p>2️⃣优化工具栏SVG代码格式。</p>
              <p>3️⃣增加分支出口排版方式。</p>
              <p>4️⃣增加更多素材。</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>确定</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
