import { useState, useEffect } from 'react';
import { svgFiles } from '@/data/svgFiles';
import { typeNames } from '@/data/svgFiles';
import ToolbarTab from './ToolbarTab';
import ToolbarItem from './ToolbarItem';
import { Button } from '@/components/ui/button';
import { SvgTypes } from '@/types';
import TextDialog from '../dialog/TextDialog';
import SubDialog from '../dialog/SubDialog';
import ColorDialog from '../dialog/ColorDialog';
import { loadFonts } from '@/utils/fontUtils';
import { 
  generateSubSVG, 
  generateColoredSVG, 
  generateTextSVG, 
  generateTextSubSVG 
} from '@/utils/svgGeneratorUtils';
import { 
  PlusCircle, 
  ChevronLeft, 
  ChevronRight
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface ToolbarProps {
  onAddItem: (file: string, customUrl?: string, config?: {
    customText?: {
      cn: string;
      en: string;
      alignment: 'start' | 'middle' | 'end';
    };
    hasColorBand?: boolean;
    colorBandColor?: string;
    customColor?: string;
  }) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function Toolbar({ onAddItem, isCollapsed = false, onToggleCollapse }: ToolbarProps) {
  const [activeTab, setActiveTab] = useState<SvgTypes>('line');
  const [showTextDialog, setShowTextDialog] = useState(false);
  const [showSubDialog, setShowSubDialog] = useState(false);
  const [showColorDialog, setShowColorDialog] = useState(false);
  const [currentColorFile, setCurrentColorFile] = useState('');
  const [fontBuffer, setFontBuffer] = useState<ArrayBuffer | null>(null);
  
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
  
  // 按类型分组SVG文件
  const groupedSvgs = svgFiles.reduce((acc, file) => {
    const type = file.split('@')[0] as SvgTypes;
    if (!acc[type]) acc[type] = [];
    acc[type].push(file);
    return acc;
  }, {} as Record<SvgTypes, string[]>);

  // 手动添加文本框类别，确保即使没有 text@ 开头的文件，也能显示文本框标签页
  if (!groupedSvgs['text']) {
    groupedSvgs['text'] = [
      // 'text@left.svg',
      // 'text@center.svg',
      // 'text@right.svg'
    ];
  }
  
  // 加载工具栏项目
  const renderToolbarItems = () => {
    if (activeTab === 'text') {
      return (
        <Button 
          variant="default" 
          className="bg-primary hover:bg-primary/80 w-full mb-2"
          onClick={() => setShowTextDialog(true)}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          添加文本框
        </Button>
      );
    } 
    
    if (activeTab === 'sub') {
      return (
        <div className="grid grid-cols-2 gap-2 p-2">
          {groupedSvgs[activeTab].map(file => {
            if (file === 'sub@exit.svg') {
              return (
                <ToolbarItem 
                  key={file} 
                  file={file} 
                  onClick={() => setShowSubDialog(true)} 
                />
              );
            } else if (file === 'sub@text.svg') {
              return (
                <ToolbarItem 
                  key={file} 
                  file={file} 
                  onClick={() => setShowTextDialog(true)} 
                />
              );
            } else if (file.startsWith('sub@')) {
              return (
                <ToolbarItem 
                  key={file} 
                  file={file} 
                  onClick={() => {
                    setCurrentColorFile(file);
                    setShowColorDialog(true);
                  }} 
                />
              );
            }
            
            return (
              <ToolbarItem 
                key={file} 
                file={file} 
                onClick={() => onAddItem(file)} 
              />
            );
          })}
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-2 gap-2 p-2">
        {groupedSvgs[activeTab]?.map(file => (
          <ToolbarItem 
            key={file} 
            file={file} 
            onClick={() => onAddItem(file)} 
          />
        ))}
      </div>
    );
  };


  return (
    <div className={cn(
      "flex border-border bg-background",
      "md:h-full md:flex-row md:border-r",
      "h-24 flex-col border-t",
      isCollapsed ? "w-0" : "md:w-[300px] max-md:h-[40svh]"
    )}>
      {!isCollapsed && (
        <div className={cn(
          "md:flex-col md:border-r md:p-2",
          "flex flex-row overflow-x-auto no-scrollbar py-2 border-b md:border-b-0 gap-2",
          "max-md:px-3",
        )}>
          {Object.keys(groupedSvgs).map(type => (
            <TooltipProvider key={type} delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    onClick={() => setActiveTab(type as SvgTypes)}
                    title={typeNames[type] || type}
                    className="flex-none"
                  >
                    <ToolbarTab
                      type={type as SvgTypes}
                      isActive={activeTab === type}
                      onClick={() => setActiveTab(type as SvgTypes)}
                      label={typeNames[type] || type}
                      isCollapsed={isCollapsed}
                    />
                  </button>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right">
                    {typeNames[type] || type}
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      )}
      
      {!isCollapsed && (
        <ScrollArea className="flex-1 overflow-x-auto md:overflow-x-hidden">
          <div className="p-2">
            <div className="mb-2 px-2 py-1.5 text-sm font-medium text-muted-foreground">
              {typeNames[activeTab] || activeTab}
            </div>
            {renderToolbarItems()}
          </div>
        </ScrollArea>
      )}

      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleCollapse}
        className={cn(
          "absolute w-6 h-6 rounded-full border shadow-md bg-background z-10",
          "md:bottom-12 md:left-0 md:translate-x-1/2",
          "bottom-full right-0 -translate-y-1/2 translate-x-1/2"
        )}
      >
        {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </Button>
      
      {showTextDialog && (
        <TextDialog 
          mode={activeTab === 'sub' ? 'colorBand' : 'normal'} // 根据当前标签页设置模式
          onClose={() => setShowTextDialog(false)}
          onConfirm={async (cnText: string, enText: string, alignment: string, hasColorBand: boolean, colorBandColor: string | undefined) => {
            if (!fontBuffer) {
              alert('字体尚未加载完成，请稍后再试');
              setShowTextDialog(false);
              return;
            }
            
            try {
              // 根据参数决定生成什么类型的文本
              // 生成带色带的文本
              if (hasColorBand && colorBandColor) {
                const result = await generateTextSubSVG(
                  cnText, 
                  enText, 
                  alignment, 
                  colorBandColor, 
                  fontBuffer
                );
                onAddItem(result.fileName, result.url, {
                  customText: {
                    cn: cnText,
                    en: enText,
                    alignment: alignment as 'start' | 'middle' | 'end'
                  },
                  hasColorBand: true,
                  colorBandColor
                });
              } else if (!hasColorBand) {
                // 生成普通文本
                const result = await generateTextSVG(cnText, enText, alignment, fontBuffer);
                onAddItem(result.fileName, result.url, {
                  customText: {
                    cn: cnText,
                    en: enText,
                    alignment: alignment as 'start' | 'middle' | 'end'
                  },
                  hasColorBand: false
                });
              }
            } catch (error) {
              console.error('生成文本失败:', error);
              alert('生成文本失败，请稍后再试');
            }
            
            setShowTextDialog(false);
          }}
        />
      )}
      
      {showSubDialog && (
        <SubDialog
          onClose={() => setShowSubDialog(false)}
          onConfirm={async (alignment, color) => {
            try {
              // 生成色带SVG
              const result = await generateSubSVG(alignment, color);
              onAddItem(result.fileName, result.url, {
                hasColorBand: true,
                colorBandColor: color
              });
            } catch (error) {
              console.error('生成失败:', error);
              alert('生成色带失败，请稍后再试');
            }
            
            setShowSubDialog(false);
          }}
        />
      )}
      
      {showColorDialog && (
        <ColorDialog
          onClose={() => setShowColorDialog(false)}
          onConfirm={async (color) => {
            try {
              // 生成着色SVG
              const result = await generateColoredSVG(currentColorFile, color);
              onAddItem(result.fileName, result.url, {
                customColor: color
              });
            } catch (error) {
              console.error('处理失败:', error);
              alert('文件加载失败，请检查网络连接');
            }
            
            setShowColorDialog(false);
          }}
          // originFile={currentColorFile}
        />
      )}
    </div>
  );
}
