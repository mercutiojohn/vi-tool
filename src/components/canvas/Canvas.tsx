import { useState, useRef, useEffect } from 'react';
import { SvgItem } from '@/types';
import CanvasItem from './CanvasItem';
import StepContextMenu from '../ContextMenu';
import { getDynamicSpacing } from '@/utils/spacingRules';
import { handleDragOver, handleDrop } from '@/utils/dragUtils';

interface CanvasProps {
  items?: SvgItem[];
  onItemsChange?: (items: SvgItem[]) => void;
  onAddItem?: (file: string, customUrl?: string) => void;
}

const CANVAS_HEIGHT = 150;
const DEFAULT_SPACING = 25;

export default function Canvas({ items: externalItems, onItemsChange, onAddItem }: CanvasProps) {
  const [items, setItems] = useState<SvgItem[]>(externalItems || []);
  const [activeItem, setActiveItem] = useState<SvgItem | null>(null);
  const [draggingItem, setDraggingItem] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // 同步内部状态和外部状态
  useEffect(() => {
    console.log('Canvas: 外部items发生变化:', externalItems);
    if (!externalItems) {
      console.log('Canvas: 外部items为空，设置为[]');
      setItems([]);
      return;
    }
    console.log('Canvas: 正在更新内部items状态');
    setItems(externalItems);
  }, [externalItems]);

  // 监听内部状态变化
  useEffect(() => {
    console.log('Canvas: 内部items发生变化:', items);
  }, [items]);
  
  // 更新items时通知父组件
  const updateItems = (newItems: SvgItem[]) => {
    console.log('Canvas: 准备更新items:', newItems);
    setItems(newItems);
    if (onItemsChange) {
      console.log('Canvas: 通知父组件items变化');
      onItemsChange(newItems);
    }
  };
  
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
    <div className="w-full mx-auto">
      <div className="bg-muted/50 p-2 rounded-lg mb-4 text-sm text-muted-foreground">
        设计区域 - 将图标添加到此处，拖拽调整顺序
      </div>
      
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
          className="inline-flex items-center h-full min-w-max"
          style={{ flexShrink: 0 }}
        >
          {items.length === 0 ? (
            <div className="text-white/50 text-sm w-full text-center">拖拽或点击图标添加到此区域</div>
          ) : (
            items.map((item, index) => (
              <StepContextMenu
                key={item.id}
                onMoveLeft={() => moveItem(item.id, 'left')}
                onMoveRight={() => moveItem(item.id, 'right')}
                onDuplicate={() => duplicateItem(item.id)}
                onRemove={() => removeItem(item.id)}
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
    </div>
  );
}
