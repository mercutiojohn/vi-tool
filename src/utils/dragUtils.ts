import { SvgItem } from '@/types';

/**
 * 处理拖拽开始事件
 * @param e 拖拽事件
 * @param itemId 被拖拽项目ID
 * @param onDragStart 拖拽开始回调
 */
export function handleDragStart(
  e: React.DragEvent, 
  itemId: string, 
  onDragStart?: () => void
): void {
  e.dataTransfer.setData('text/plain', itemId);
  if (onDragStart) {
    onDragStart();
  }
  // 使用setTimeout解决Safari中拖拽图像立即消失的问题
  setTimeout(() => {
    const target = e.currentTarget as HTMLElement;
    target.classList.add('opacity-50');
  }, 0);
}

/**
 * 处理拖拽结束事件
 * @param e 拖拽事件
 * @param onDragEnd 拖拽结束回调
 */
export function handleDragEnd(
  e: React.DragEvent, 
  onDragEnd?: () => void
): void {
  const target = e.currentTarget as HTMLElement;
  target.classList.remove('opacity-50');
  if (onDragEnd) {
    onDragEnd();
  }
}

/**
 * 处理拖拽悬停事件
 * @param e 拖拽事件
 * @param draggingItemId 当前拖拽中的项目ID
 * @param items 所有项目列表
 * @param containerRef 容器引用
 * @param onItemsReorder 项目重新排序回调
 */
export function handleDragOver(
  e: React.DragEvent,
  draggingItemId: string | null,
  items: SvgItem[],
  containerRef: React.RefObject<HTMLDivElement>,
  onItemsReorder: (newItems: SvgItem[]) => void
): void {
  e.preventDefault();
  
  // 设置允许放置
  e.dataTransfer.dropEffect = 'copy';
  
  // 处理内部拖拽重排序
  if (draggingItemId && containerRef.current) {
    const afterElement = getDragAfterElement(e.clientX, items, containerRef);
    const draggedItemIndex = items.findIndex(item => item.id === draggingItemId);
    
    const newItems = [...items];
    const [draggedItem] = newItems.splice(draggedItemIndex, 1);
    
    if (afterElement) {
      // 插入到指定元素之前
      const afterElementIndex = items.findIndex(item => item.id === afterElement.id);
      if (draggedItemIndex !== afterElementIndex && draggedItemIndex !== afterElementIndex - 1) {
        const insertIndex = afterElementIndex > draggedItemIndex ? afterElementIndex - 1 : afterElementIndex;
        newItems.splice(insertIndex, 0, draggedItem);
        onItemsReorder(newItems);
      }
    } else {
      // 如果afterElement为null，表示拖到最后
      newItems.push(draggedItem);
      onItemsReorder(newItems);
    }
  }
}

/**
 * 处理拖拽释放事件
 * @param e 拖拽事件
 * @param items 当前项目列表
 * @param containerRef 容器引用
 * @param onAddItem 添加项目的回调
 * @param onItemsReorder 项目重新排序的回调
 */
export function handleDrop(
  e: React.DragEvent,
  items: SvgItem[],
  containerRef: React.RefObject<HTMLDivElement>,
  onAddItem: (file: string) => void,
  onItemsReorder: (newItems: SvgItem[]) => void
): void {
  e.preventDefault();
  
  // 处理从工具栏拖入的文件
  const file = e.dataTransfer.getData('application/vi-tool-file');
  if (file) {
    console.log('从工具栏拖入文件:', file);
    
    // 确定插入位置
    const afterElement = getDragAfterElement(e.clientX, items, containerRef);
    
    // 先添加项目
    onAddItem(file);
    
    // 获取最新的项目列表（应该包含刚添加的项目）
    const updatedItems = [...items, { id: Date.now().toString(), file: file }];
    
    if (afterElement) {
      // 新添加的项目在最后，将它移动到正确的位置
      const newItems = [...updatedItems];
      const newItemIndex = newItems.length - 1;
      const afterElementIndex = newItems.findIndex(item => item.id === afterElement.id);
      
      // 从最后位置删除
      const [newItem] = newItems.splice(newItemIndex, 1);
      
      // 插入到正确位置
      newItems.splice(afterElementIndex, 0, newItem);
      
      // 更新顺序
      onItemsReorder(newItems);
    } else {
      // 如果没有afterElement，则保持在最后位置
      onItemsReorder(updatedItems);
    }
    
    return;
  }
  
  // 处理画布内部拖拽的文件ID（保留现有功能）
  const itemId = e.dataTransfer.getData('text/plain');
  if (itemId && items.find(item => item.id === itemId)) {
    console.log('处理画布内部拖拽项:', itemId);
    // 内部拖拽的逻辑已在handleDragOver中处理
  }
}

/**
 * 获取拖拽目标后的元素
 * @param clientX 鼠标X坐标
 * @param items 所有项目
 * @param containerRef 容器引用
 * @returns 拖拽目标后的元素或null
 */
export function getDragAfterElement(
  clientX: number,
  items: SvgItem[],
  containerRef: React.RefObject<HTMLDivElement>
): SvgItem | null {
  if (!containerRef.current) return null;
  
  // 获取所有非拖拽中的元素
  const domElements = Array.from(containerRef.current.querySelectorAll('.canvas-item:not(.dragging)'));
  
  if (domElements.length === 0) return null;
  
  // 计算每个元素的位置和偏移量
  const itemsWithOffsets = domElements.map(child => {
    const box = child.getBoundingClientRect();
    const offset = clientX - box.left - box.width / 2;
    const itemId = child.getAttribute('data-item-id');
    return { offset, id: itemId };
  });

  // 找出最近的元素
  const closestItem = itemsWithOffsets.reduce((closest, current) => {
    if (current.offset < 0 && current.offset > closest.offset) {
      return current;
    }
    return closest;
  }, { offset: Number.NEGATIVE_INFINITY, id: null as string | null });

  return closestItem.id ? items.find(i => i.id === closestItem.id) || null : null;
}
