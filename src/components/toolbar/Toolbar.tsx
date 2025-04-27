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

interface ToolbarProps {
  onAddItem: (file: string, customUrl?: string) => void;
}

export default function Toolbar({ onAddItem }: ToolbarProps) {
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
  
  // 加载工具栏项目
  const renderToolbarItems = () => {
    if (activeTab === 'text') {
      return (
        <Button 
          variant="default" 
          className="bg-[#004080] hover:bg-[#0059b3] min-w-[120px]"
          onClick={() => setShowTextDialog(true)}
        >
          + 添加文本框
        </Button>
      );
    } 
    
    if (activeTab === 'sub') {
      return groupedSvgs[activeTab].map(file => {
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
      });
    }
    
    return groupedSvgs[activeTab]?.map(file => (
      <ToolbarItem 
        key={file} 
        file={file} 
        onClick={() => onAddItem(file)} 
      />
    ));
  };
  
  return (
    <div className="bg-[#001D31] -mt-20">
      <div className="flex bg-[#003366] px-4 py-2 overflow-x-auto">
        {Object.keys(groupedSvgs).map(type => (
          <ToolbarTab
            key={type}
            type={type as SvgTypes}
            isActive={activeTab === type}
            onClick={() => setActiveTab(type as SvgTypes)}
            label={typeNames[type] || type}
          />
        ))}
      </div>
      
      <div className="flex flex-wrap gap-4 p-4 overflow-x-auto">
        {renderToolbarItems()}
      </div>
      
      {showTextDialog && (
        <TextDialog 
          onClose={() => setShowTextDialog(false)}
          onConfirm={async (cnText, enText, alignment) => {
            console.log('TextDialog 开始处理:', { cnText, enText, alignment, activeTab });
            if (!fontBuffer) {
              console.warn('TextDialog 字体未加载完成');
              alert('字体尚未加载完成，请稍后再试');
              setShowTextDialog(false);
              return;
            }
            
            try {
              console.log('TextDialog 字体已加载, 准备生成SVG');
              // 根据当前标签页决定生成普通文本还是带色带的文本
              if (activeTab === 'sub') {
                console.log('TextDialog 正在生成带色带的文本');
                // 生成带色带的文本
                const result = await generateTextSubSVG(cnText, enText, alignment, '#001D31', fontBuffer);
                console.log('TextDialog 生成带色带文本成功:', result);
                onAddItem(result.fileName, result.url);
              } else {
                console.log('TextDialog 正在生成普通文本');
                // 生成普通文本
                const result = await generateTextSVG(cnText, enText, alignment, fontBuffer);
                console.log('TextDialog 生成普通文本成功:', result);
                onAddItem(result.fileName, result.url);
              }
              console.log('TextDialog 添加项目成功');
            } catch (error) {
              console.error('TextDialog 生成文本失败:', error);
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
            console.log('SubDialog 开始处理:', { alignment, color });
            try {
              // 生成色带SVG
              const result = await generateSubSVG(alignment, color);
              console.log('SubDialog 生成SVG成功:', result);
              onAddItem(result.fileName, result.url);
              console.log('SubDialog 添加项目成功');
            } catch (error) {
              console.error('SubDialog 生成失败:', error);
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
            console.log('ColorDialog 开始处理:', { color, currentColorFile });
            try {
              // 生成着色SVG
              const result = await generateColoredSVG(currentColorFile, color);
              console.log('ColorDialog 生成SVG成功:', result);
              onAddItem(result.fileName, result.url);
              console.log('ColorDialog 添加项目成功');
            } catch (error) {
              console.error('ColorDialog 处理失败:', error);
              alert('文件加载失败，请检查网络连接');
            }
            
            setShowColorDialog(false);
          }}
          originFile={currentColorFile}
        />
      )}
    </div>
  );
}
