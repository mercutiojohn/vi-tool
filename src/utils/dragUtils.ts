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
  containerRef: React.RefObject<HTMLElement>,
  onItemsReorder: (newItems: SvgItem[]) => void
): void {
  e.preventDefault();
  if (!draggingItemId || !containerRef.current) return;

  const afterElement = getDragAfterElement(e.clientX, items, containerRef);
  
  if (afterElement) {
    const draggedItemIndex = items.findIndex(item => item.id === draggingItemId);
    const afterElementIndex = items.findIndex(item => item.id === afterElement.id);
    
    // 避免不必要的重新排序（如果放回原来的位置）
    if (draggedItemIndex !== afterElementIndex && draggedItemIndex !== afterElementIndex - 1) {
      const newItems = [...items];
      const [draggedItem] = newItems.splice(draggedItemIndex, 1);
      
      // 确定正确的插入位置
      const insertIndex = afterElementIndex > draggedItemIndex ? afterElementIndex - 1 : afterElementIndex;
      newItems.splice(insertIndex, 0, draggedItem);
      
      onItemsReorder(newItems);
    }
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
  containerRef: React.RefObject<HTMLElement>
): SvgItem | null {
  if (!containerRef.current) return null;
  
  // 获取所有非拖拽中的元素
  const domElements = Array.from(containerRef.current.querySelectorAll('.canvas-item:not(.dragging)'));
  
  // 初始化结果对象
  let result = { offset: Number.NEGATIVE_INFINITY, id: null as string | null };
  
  // 找出鼠标位置最近的元素
  for (const child of domElements) {
    const box = child.getBoundingClientRect();
    const offset = clientX - box.left - box.width / 2;
    
    if (offset < 0 && offset > result.offset) {
      const itemId = child.getAttribute('data-item-id');
      if (itemId) {
        result = { offset, id: itemId };
      }
    }
  }
  
  // 返回匹配的项目或null
  return result.id ? items.find(i => i.id === result.id) || null : null;
}