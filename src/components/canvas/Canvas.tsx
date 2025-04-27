import { useState, useRef, useEffect } from 'react';
import { SvgItem } from '@/types';
import CanvasItem from './CanvasItem';
import ContextMenu from '../ContextMenu';
import { getDynamicSpacing } from '@/utils/spacingRules';

interface CanvasProps {
  items?: SvgItem[];
  onItemsChange?: (items: SvgItem[]) => void;
}

const CANVAS_HEIGHT = 150;
const DEFAULT_SPACING = 25;

export default function Canvas({ items: externalItems, onItemsChange }: CanvasProps) {
  const [items, setItems] = useState<SvgItem[]>(externalItems || []);
  const [activeItem, setActiveItem] = useState<SvgItem | null>(null);
  const [draggingItem, setDraggingItem] = useState<string | null>(null);
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

  // 处理拖拽开始
  const handleDragStart = (itemId: string) => {
    hideContextMenu();
    setDraggingItem(itemId);
  };

  // 处理拖拽结束
  const handleDragEnd = () => {
    setDraggingItem(null);
  };

  // 处理拖拽悬停
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggingItem || !canvasRef.current) return;

    const afterElement = getDragAfterElement(e.clientX);
    
    if (afterElement) {
      const draggedItemIndex = items.findIndex(item => item.id === draggingItem);
      const afterElementIndex = items.findIndex(item => item.id === afterElement.id);
      
      // 避免不必要的重新排序（如果放回原来的位置）
      if (draggedItemIndex !== afterElementIndex && draggedItemIndex !== afterElementIndex - 1) {
        const newItems = [...items];
        const [draggedItem] = newItems.splice(draggedItemIndex, 1);
        
        // 确定正确的插入位置
        const insertIndex = afterElementIndex > draggedItemIndex ? afterElementIndex - 1 : afterElementIndex;
        newItems.splice(insertIndex, 0, draggedItem);
        
        updateItems(newItems);
      }
    }
  };

  // 获取拖拽目标后的元素
  const getDragAfterElement = (x: number): SvgItem | null => {
    if (!canvasRef.current) return null;
    
    // 获取所有非拖拽中的元素
    const domElements = Array.from(canvasRef.current.querySelectorAll('.canvas-item:not(.dragging)'));
    
    // 找出鼠标位置最近的元素
    return domElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = x - box.left - box.width / 2;
      
      if (offset < 0 && offset > closest.offset) {
        const itemId = child.getAttribute('data-item-id');
        const item = items.find(i => i.id === itemId);
        return item ? { offset, id: item.id } : closest;
      } else {
        return closest;
      }
    }, { offset: Number.NEGATIVE_INFINITY, id: null }).id 
      ? items.find(i => i.id === (domElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = x - box.left - box.width / 2;
        
        if (offset < 0 && offset > closest.offset) {
          const itemId = child.getAttribute('data-item-id');
          const item = items.find(i => i.id === itemId);
          return item ? { offset, id: item.id } : closest;
        } else {
          return closest;
        }
      }, { offset: Number.NEGATIVE_INFINITY, id: null }).id))
      : null;
  };
  
  return (
    <div className="w-full max-w-6xl mx-auto overflow-x-auto">
      <div 
        ref={canvasRef}
        className={`h-[${CANVAS_HEIGHT}px] bg-[#001D31] rounded-lg flex items-center transition-all px-[25px] ${items.length === 0 ? 'w-[50px] p-0' : ''}`}
        onDragOver={handleDragOver}
      >
        {items.length === 0 ? (
          <div className="text-white opacity-50">拖拽图标添加</div>
        ) : (
          items.map((item, index) => (
            <CanvasItem
              key={item.id}
              item={item}
              isActive={activeItem?.id === item.id}
              isDragging={draggingItem === item.id}
              onItemClick={handleItemClick}
              onDragStart={() => handleDragStart(item.id)}
              onDragEnd={handleDragEnd}
              className="canvas-item"
              style={getSpacingStyle(index)}
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
