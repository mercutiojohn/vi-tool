import { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { SvgItem } from '@/types';
import { useHotkeys } from 'react-hotkeys-hook';
import CanvasItem from './CanvasItem';
import StepContextMenu from '../ContextMenu';
import TextDialog from '../dialog/TextDialog';
import ColorDialog from '../dialog/ColorDialog';
import { getDynamicSpacing } from '@/utils/spacingRules';
import { handleDragOver, handleDrop } from '@/utils/dragUtils';
import { cn } from '@/lib/utils';
import { generateTextSubSVG, generateTextSVG, generateColoredSVG } from '@/utils/svgGeneratorUtils';

interface CanvasProps {
  items?: SvgItem[];
  onItemsChange?: (items: SvgItem[]) => void;
  onAddItem?: (file: string, customUrl?: string) => void;
  onHistoryChange?: (state: { canUndo: boolean; canRedo: boolean }) => void;
  className?: string;
}

const CANVAS_HEIGHT = 150;
const DEFAULT_SPACING = 25;

export interface CanvasRef {
  undo: () => void;
  redo: () => void;
}

const Canvas = forwardRef<CanvasRef, CanvasProps>(({
  items: externalItems, 
  onItemsChange, 
  onAddItem,
  onHistoryChange,
  className 
}, ref) => {
  const [items, setItems] = useState<SvgItem[]>(externalItems || []);
  const [activeItem, setActiveItem] = useState<SvgItem | null>(null);
  const [draggingItem, setDraggingItem] = useState<string | null>(null);
  const [history, setHistory] = useState<SvgItem[][]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [showTextDialog, setShowTextDialog] = useState(false);
  const [showColorDialog, setShowColorDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<SvgItem | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // 同步状态和历史记录
  useEffect(() => {
    if (!externalItems) {
      setItems([]);
      // 只在初始化时重置历史
      if (history.length === 0) {
        setHistory([[]]);
        setHistoryIndex(0);
      }
    } else {
      setItems(externalItems);
      if (history.length === 0) {
        // 初始化历史
        console.log('初始化历史记录');
        setHistory([externalItems]);
        setHistoryIndex(0);
      } else {
        // 检查是否需要添加新的历史记录
        const currentState = JSON.stringify(history[historyIndex]);
        const newState = JSON.stringify(externalItems);
        if (currentState !== newState) {
          console.log('添加新的历史记录');
          const newHistory = history.slice(0, historyIndex + 1);
          newHistory.push(externalItems);
          setHistory(newHistory);
          setHistoryIndex(newHistory.length - 1);
        }
      }
    }
  }, [externalItems, history, historyIndex]);

  // 通知父组件历史状态变化
  useEffect(() => {
    if (onHistoryChange) {
      const canUndoValue = historyIndex > 0;
      const canRedoValue = historyIndex < history.length - 1;
      console.log('历史状态更新:', { canUndo: canUndoValue, canRedo: canRedoValue });
      onHistoryChange({
        canUndo: canUndoValue,
        canRedo: canRedoValue
      });
    }
  }, [historyIndex, history.length, onHistoryChange]);

  // 监听内部状态变化
  useEffect(() => {
    console.log('Canvas: 内部items发生变化:', items);
  }, [items]);
  
  // 更新items时通知父组件并记录历史
  const updateItems = useCallback((newItems: SvgItem[]) => {
    console.log('Canvas: 准备更新items:', newItems);
    
    // 添加新的历史记录
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newItems);
    
    console.log('更新历史记录:', {
      oldIndex: historyIndex,
      newIndex: newHistory.length - 1,
      historyLength: newHistory.length
    });
    
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setItems(newItems);
    
    if (onItemsChange) {
      console.log('Canvas: 通知父组件items变化');
      onItemsChange(newItems);
    }
  }, [history, historyIndex, onItemsChange]);

  // 撤销
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      console.log('执行撤销操作, 当前索引:', historyIndex);
      const newIndex = historyIndex - 1;
      const previousState = history[newIndex];
      setHistoryIndex(newIndex);
      setItems(previousState);
      if (onItemsChange) {
        onItemsChange(previousState);
      }
    }
  }, [history, historyIndex, onItemsChange]);

  // 重做
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      console.log('执行重做操作, 当前索引:', historyIndex);
      const newIndex = historyIndex + 1;
      const nextState = history[newIndex];
      setHistoryIndex(newIndex);
      setItems(nextState);
      if (onItemsChange) {
        onItemsChange(nextState);
      }
    }
  }, [history, historyIndex, onItemsChange]);

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    undo,
    redo
  }));

  // 键盘快捷键
  useHotkeys('ctrl+z, cmd+z', (e) => {
    e.preventDefault();
    console.log('触发撤销快捷键');
    undo();
  }, { enableOnFormTags: true });

  useHotkeys('ctrl+shift+z, cmd+shift+z', (e) => {
    e.preventDefault();
    console.log('触发重做快捷键');
    redo();
  }, { enableOnFormTags: true });
  
  // 添加新项目的处理函数
  const handleAddItem = (file: string, customUrl?: string) => {
    console.log('Canvas: 添加新项目:', file, customUrl);
    if (onAddItem) {
      onAddItem(file, customUrl);
    }
  };
  
  // 移动项目
  const moveItem = (id: string, direction: 'left' | 'right') => {
    const newItems = [...items];
    const index = newItems.findIndex(item => item.id === id);
    
    if (direction === 'left' && index > 0) {
      [newItems[index], newItems[index - 1]] = [newItems[index - 1], newItems[index]];
    } else if (direction === 'right' && index < newItems.length - 1) {
      [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    }
    
    updateItems(newItems);
  };
  
  // 复制项目
  const duplicateItem = (id: string) => {
    const itemToDuplicate = items.find(item => item.id === id);
    if (!itemToDuplicate) return;
    
    const newItem: SvgItem = {
      ...itemToDuplicate,
      id: Date.now() + Math.random().toString(36).substr(2, 9)
    };
    
    const index = items.findIndex(item => item.id === id);
    const newItems = [...items];
    newItems.splice(index + 1, 0, newItem);
    
    updateItems(newItems);
  };
  
  // 删除项目
  const removeItem = (id: string) => {
    const newItems = items.filter(item => item.id !== id);
    updateItems(newItems);
  };
  
  // 使用getDynamicSpacing获取元素间距
  const getItemSpacing = (index: number): number => {
    if (index >= items.length - 1) return 0;
    
    const current = items[index];
    const next = items[index + 1];
    const currentType = current.file.split('@')[0];
    const nextType = next.file.split('@')[0];
    
    return getDynamicSpacing(current.file, next.file, currentType, nextType, DEFAULT_SPACING);
  };
  
  // 将spacing转换为合适的CSS类名或样式
  const getSpacingStyle = (index: number): { marginRight: string } => {
    const spacing = getItemSpacing(index);
    return { marginRight: `${spacing}px` };
  };

  // 处理拖拽开始
  const handleDragStart = (itemId: string) => {
    setDraggingItem(itemId);
  };

  // 处理拖拽结束
  const handleDragEnd = () => {
    setDraggingItem(null);
  };
  
  return (
    <div className={cn("w-full mx-auto", className)}>
      <div 
        ref={canvasRef}
        className={`h-[${CANVAS_HEIGHT}px] bg-[#001D31] rounded-lg transition-all px-[25px] border-2 border-dashed border-border/50 overflow-x-auto overflow-y-hidden ${items.length === 0 ? 'min-w-[200px]' : ''}`}
        style={{ 
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255,255,255,0.3) transparent'
        }}
        onDragOver={(e) => handleDragOver(e, draggingItem, items, canvasRef as React.RefObject<HTMLDivElement>, updateItems)}
        onDrop={(e) => handleDrop(e, items, canvasRef as React.RefObject<HTMLDivElement>, handleAddItem, updateItems)}
      >
        <div 
          className="inline-flex items-center h-full min-w-full"
          style={{ flexShrink: 0 }}
        >
          {items.length === 0 ? (
            // <div className="text-white/50 text-sm w-full text-center">拖拽或点击导向标志添加到此区域</div>
            <div className="w-full text-center text-primary-foreground flex flex-col items-center">
              {/* <PanelLeft className="h-12 w-12 mb-4 text-muted-foreground/50" /> */}
              <h3 className="text-lg font-medium mb-2">开始创建您的导向标志</h3>
              <p className="max-w-md text-sm">从左侧工具栏拖拽元素到这里，或点击元素添加。点击画布中的元素可以编辑、复制或删除。</p>
            </div>
          ) : (
            items.map((item, index) => (
              <StepContextMenu
                key={item.id}
                onMoveLeft={() => moveItem(item.id, 'left')}
                onMoveRight={() => moveItem(item.id, 'right')}
                onDuplicate={() => duplicateItem(item.id)}
                onRemove={() => removeItem(item.id)}
                onEditText={item.file.startsWith('text@') || item.file.startsWith('sub@') ? () => {
                  setEditingItem(item);
                  setShowTextDialog(true);
                } : undefined}
                onEditColor={item.file.startsWith('sub@') || item.file.startsWith('cls@') || item.file.startsWith('clss@') ? () => {
                  setEditingItem(item);
                  setShowColorDialog(true);
                } : undefined}
                canMoveLeft={index > 0}
                canMoveRight={index < items.length - 1}
                onItemClick={() => setActiveItem(item.id === activeItem?.id ? null : item)}
              >
                <CanvasItem
                  item={item}
                  isActive={activeItem?.id === item.id}
                  isDragging={draggingItem === item.id}
                  onDragStart={() => handleDragStart(item.id)}
                  onDragEnd={handleDragEnd}
                  className="canvas-item"
                  style={getSpacingStyle(index)}
                  onItemClick={() => setActiveItem(item.id === activeItem?.id ? null : item)}
                />
              </StepContextMenu>
            ))
          )}
        </div>
      </div>

      <div className="p-2 rounded-lg mt-4 text-sm text-muted-foreground text-end">
        拖拽调整顺序；右键单击可进行更多操作
      </div>

      {/* Text Dialog */}
      {showTextDialog && editingItem && (
        <TextDialog
          onClose={() => {
            setShowTextDialog(false);
            setEditingItem(null);
          }}
          onConfirm={async (cnText, enText, alignment, hasColorBand, colorBandColor) => {
            try {
              // 获取字体
              const fontResponse = await fetch('/SourceHanSans.woff2');
              const fontBuffer = await fontResponse.arrayBuffer();
              
              // 生成新的SVG
              let result;
              if (hasColorBand) {
                result = await generateTextSubSVG(cnText, enText, alignment, colorBandColor || '#001D31', fontBuffer);
              } else {
                result = await generateTextSVG(cnText, enText, alignment, fontBuffer);
              }
              
              const newItems = items.map(item => 
                item.id === editingItem.id ? {
                  ...item,
                  customText: {
                    cn: cnText,
                    en: enText,
                    alignment: alignment as 'start' | 'middle' | 'end'
                  },
                  hasColorBand,
                  colorBandColor,
                  customUrl: result.url
                } : item
              );
              updateItems(newItems);
            } catch (error) {
              console.error('生成SVG失败:', error);
            }
            setShowTextDialog(false);
            setEditingItem(null);
          }}
          mode={editingItem.colorBandColor ? 'colorBand' : 'normal'}
          initialValues={editingItem.customText}
          initialColorBandColor={editingItem.colorBandColor}
        />
      )}

      {/* Color Dialog */}
      {showColorDialog && editingItem && (
        <ColorDialog
          onClose={() => {
            setShowColorDialog(false);
            setEditingItem(null);
          }}
          onConfirm={async (color) => {
            try {
              const result = await generateColoredSVG(editingItem.file, color);
              const newItems = items.map(item =>
                item.id === editingItem.id ? {
                  ...item,
                  customColor: color,
                  customUrl: result.url
                } : item
              );
              updateItems(newItems);
            } catch (error) {
              console.error('生成着色SVG失败:', error);
            }
            setShowColorDialog(false);
            setEditingItem(null);
          }}
          initialColor={editingItem.customColor}
        />
      )}
    </div>
  );
});

Canvas.displayName = 'Canvas';
export default Canvas;
