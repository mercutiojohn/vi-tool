import { useState, useRef, useEffect } from 'react';
import { SvgItem } from '@/types';
import CanvasItem from './CanvasItem';
import ContextMenu from '../ContextMenu';
import { isSubLinePair, isDotPair, shouldReduceSpacing } from '@/utils/spacingRules';

interface CanvasProps {
  items?: SvgItem[];
  onItemsChange?: (items: SvgItem[]) => void;
}

const CANVAS_HEIGHT = 150;
const DEFAULT_SPACING = 25;

export default function Canvas({ items: externalItems, onItemsChange }: CanvasProps) {
  const [items, setItems] = useState<SvgItem[]>(externalItems || []);
  const [activeItem, setActiveItem] = useState<SvgItem | null>(null);
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0 });
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
  
  // 处理项目点击
  const handleItemClick = (item: SvgItem, x: number, y: number) => {
    if (activeItem?.id === item.id) {
      hideContextMenu();
    } else {
      setActiveItem(item);
      setContextMenu({ show: true, x, y });
    }
  };
  
  // 隐藏上下文菜单
  const hideContextMenu = () => {
    setContextMenu({ show: false, x: 0, y: 0 });
    setActiveItem(null);
  };
  
  // 移动项目
  const moveItem = (direction: 'left' | 'right') => {
    if (!activeItem) return;
    
    const newItems = [...items];
    const index = newItems.findIndex(item => item.id === activeItem.id);
    
    if (direction === 'left' && index > 0) {
      [newItems[index], newItems[index - 1]] = [newItems[index - 1], newItems[index]];
    } else if (direction === 'right' && index < newItems.length - 1) {
      [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    }
    
    updateItems(newItems);
  };
  
  // 复制项目
  const duplicateItem = () => {
    if (!activeItem) return;
    
    const newItem: SvgItem = {
      ...activeItem,
      id: Date.now() + Math.random().toString(36).substr(2, 9)
    };
    
    const index = items.findIndex(item => item.id === activeItem.id);
    const newItems = [...items];
    newItems.splice(index + 1, 0, newItem);
    
    updateItems(newItems);
    setActiveItem(newItem);
  };
  
  // 删除项目
  const removeItem = () => {
    if (!activeItem) return;
    
    const newItems = items.filter(item => item.id !== activeItem.id);
    updateItems(newItems);
    hideContextMenu();
  };
  
  // 应用间距规则
  const getSpacingClass = (index: number): string => {
    if (index >= items.length - 1) return '';
    
    const current = items[index];
    const next = items[index + 1];
    const currentType = current.file.split('@')[0];
    const nextType = next.file.split('@')[0];
    
    if (shouldReduceSpacing(current.file, next.file)) {
      return 'mr-[5px]';
    } else if (isDotPair(current.file, next.file)) {
      return 'mr-0';
    } else if (isSubLinePair(currentType, nextType)) {
      return 'mr-0';
    } else if (current.file === 'oth@Dot.svg' || next.file === 'oth@Dot.svg') {
      return 'mr-[15px]';
    }
    
    return `mr-[${DEFAULT_SPACING}px]`;
  };
  
  // 点击事件监听
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contextMenu.show && 
          canvasRef.current && 
          !canvasRef.current.contains(e.target as Node)) {
        hideContextMenu();
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [contextMenu]);
  
  return (
    <div className="w-full max-w-6xl mx-auto overflow-x-auto">
      <div 
        ref={canvasRef}
        className={`h-[${CANVAS_HEIGHT}px] bg-[#001D31] rounded-lg flex items-center transition-all px-[25px] ${items.length === 0 ? 'w-[50px] p-0' : ''}`}
      >
        {items.length === 0 ? (
          <div className="text-white opacity-50">拖拽图标添加</div>
        ) : (
          items.map((item, index) => (
            <CanvasItem
              key={item.id}
              item={item}
              isActive={activeItem?.id === item.id}
              onItemClick={handleItemClick}
              className={getSpacingClass(index)}
            />
          ))
        )}
      </div>
      
      {contextMenu.show && activeItem && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onMoveLeft={() => moveItem('left')}
          onMoveRight={() => moveItem('right')}
          onDuplicate={duplicateItem}
          onRemove={removeItem}
          canMoveLeft={items.findIndex(item => item.id === activeItem.id) > 0}
          canMoveRight={items.findIndex(item => item.id === activeItem.id) < items.length - 1}
        />
      )}
    </div>
  );
}
