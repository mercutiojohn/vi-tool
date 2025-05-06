import { useState, useRef } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator
} from "@/components/ui/context-menu";
import { MoveLeft, MoveRight, Copy, Trash2, Type, Palette } from "lucide-react";

interface StepContextMenuProps {
  children: React.ReactNode;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onDuplicate: () => void;
  onRemove: () => void;
  onEditText?: () => void;
  onEditColor?: () => void;
  canMoveLeft: boolean;
  canMoveRight: boolean;
  onItemClick?: () => void; // 添加原有的点击处理
}

export default function StepContextMenu({
  children,
  onMoveLeft,
  onMoveRight,
  onDuplicate,
  onRemove,
  onEditText,
  onEditColor,
  canMoveLeft,
  canMoveRight,
  onItemClick
}: StepContextMenuProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  
  // 处理点击事件，如果不是右键点击则触发菜单
  const handleClick = (e: React.MouseEvent) => {
    // 确保只有左键点击才执行此功能
    if (e.button === 0) {
      // 阻止事件冒泡
      e.stopPropagation();
      
      // 调用原来的点击处理函数
      if (onItemClick) {
        onItemClick();
      }
      
      // 如果菜单已打开，则不要再次触发
      if (!isMenuOpen) {
        // 使用Radix上下文菜单API手动打开菜单
        const contextMenuElement = contextMenuRef.current;
        if (contextMenuElement) {
          // 创建并分发自定义上下文菜单事件
          const contextEvent = new MouseEvent('contextmenu', {
            bubbles: true,
            cancelable: true,
            clientX: e.clientX,
            clientY: e.clientY
          });
          contextMenuElement.dispatchEvent(contextEvent);
        }
      }
    }
  };
  
  return (
    <div ref={contextMenuRef} onClick={handleClick} className="inline-block">
      <ContextMenu onOpenChange={setIsMenuOpen}>
        <ContextMenuTrigger>{children}</ContextMenuTrigger>
        <ContextMenuContent className="w-48">
          <ContextMenuItem
            onClick={onMoveLeft}
            disabled={!canMoveLeft}
            className={!canMoveLeft ? "opacity-50 cursor-not-allowed" : ""}
          >
            <MoveLeft className="mr-2 h-4 w-4" />
            向左移动
          </ContextMenuItem>
          <ContextMenuItem
            onClick={onMoveRight}
            disabled={!canMoveRight}
            className={!canMoveRight ? "opacity-50 cursor-not-allowed" : ""}
          >
            <MoveRight className="mr-2 h-4 w-4" />
            向右移动
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={onDuplicate}>
            <Copy className="mr-2 h-4 w-4" />
            复制
          </ContextMenuItem>
          {(onEditText || onEditColor) && (<ContextMenuSeparator />)}
          {onEditText && (
            <ContextMenuItem onClick={onEditText}>
              <Type className="mr-2 h-4 w-4" />
              编辑文本
            </ContextMenuItem>
          )}
          {onEditColor && (
            <ContextMenuItem onClick={onEditColor}>
              <Palette className="mr-2 h-4 w-4" />
              编辑颜色
            </ContextMenuItem>
          )}
          <ContextMenuSeparator />
          <ContextMenuItem onClick={onRemove} variant="destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            删除
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  );
}
