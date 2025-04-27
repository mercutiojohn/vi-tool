import { cn } from '@/lib/utils';

interface ContextMenuProps {
  x: number;
  y: number;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onDuplicate: () => void;
  onRemove: () => void;
  canMoveLeft: boolean;
  canMoveRight: boolean;
}

export default function ContextMenu({
  x, y, onMoveLeft, onMoveRight, onDuplicate, onRemove, canMoveLeft, canMoveRight
}: ContextMenuProps) {
  return (
    <div 
      className="fixed bg-white rounded-md flex gap-1 p-1 z-50"
      style={{ left: `${x}px`, top: `${y}px` }}
    >
      <button 
        className={cn(
          "p-2 rounded-md hover:bg-gray-100",
          !canMoveLeft && "opacity-50 cursor-not-allowed"
        )}
        onClick={onMoveLeft}
        disabled={!canMoveLeft}
      >
        ⬅️
      </button>
      <button 
        className="p-2 rounded-md hover:bg-gray-100"
        onClick={onDuplicate}
      >
        ➕
      </button>
      <button 
        className="p-2 rounded-md hover:bg-gray-100 text-red-500"
        onClick={onRemove}
      >
        ❌
      </button>
      <button 
        className={cn(
          "p-2 rounded-md hover:bg-gray-100",
          !canMoveRight && "opacity-50 cursor-not-allowed"
        )}
        onClick={onMoveRight}
        disabled={!canMoveRight}
      >
        ➡️
      </button>
    </div>
  );
}