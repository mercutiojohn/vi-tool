import { useRef, useEffect, useState, useCallback } from 'react';
import { CanvasItemProps } from '@/types';
import { cn } from '@/lib/utils';
import { handleDragStart, handleDragEnd } from '@/utils/dragUtils';

interface Props extends CanvasItemProps {
  className?: string;
  style?: React.CSSProperties;
  isDragging?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

const CANVAS_HEIGHT = 150;

export default function CanvasItem({ 
  item, 
  isActive, 
  isDragging,
  onItemClick, 
  onDragStart,
  onDragEnd,
  className, 
  style 
}: Props) {
  const [imgSize, setImgSize] = useState({ width: 0, height: CANVAS_HEIGHT });
  const imgRef = useRef<HTMLImageElement>(null);
  
  useEffect(() => {
    console.log('CanvasItem: 项目更新:', item);
    if (imgRef.current) {
      if (imgRef.current.complete) {
        console.log('CanvasItem: 图片已加载完成，更新尺寸');
        updateImageSize();
      } else {
        console.log('CanvasItem: 图片尚未加载完成');
      }
    }
  }, [item]);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error('CanvasItem: 图片加载失败:', {
      src: e.currentTarget.src,
      naturalWidth: e.currentTarget.naturalWidth,
      naturalHeight: e.currentTarget.naturalHeight,
      error: e
    });
  };
  
  const updateImageSize = useCallback(() => {
    if (!imgRef.current) return;
    
    const aspectRatio = imgRef.current.naturalWidth / imgRef.current.naturalHeight;
    setImgSize({
      width: CANVAS_HEIGHT * aspectRatio,
      height: CANVAS_HEIGHT
    });
  }, []);
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onItemClick(item, e.clientX, e.clientY);
  };
  
  return (
    <div 
      className={cn(
        "h-[150px] cursor-move transition-opacity flex items-center flex-shrink-0",
        isActive && "outline outline-4 outline-[#00a0e9] outline-offset-[-5px] rounded-md opacity-85",
        isDragging && "dragging opacity-50",
        className
      )}
      style={{
        width: imgSize.width ? `${imgSize.width}px` : undefined,
        ...style
      }}
      onClick={handleClick}
      draggable={true}
      onDragStart={(e) => handleDragStart(e, item.id, onDragStart)}
      onDragEnd={(e) => handleDragEnd(e, onDragEnd)}
      data-item-id={item.id}
    >
      <img
        ref={imgRef}
        key={item.customUrl || item.file}
        src={item.customUrl || `/${item.file}`}
        alt={item.file}
        style={{ 
          height: `${imgSize.height}px`,
          width: `${imgSize.width}px`,
          flexShrink: 0
        }}
        onLoad={updateImageSize}
        onError={handleError}
        crossOrigin="anonymous"
      />
    </div>
  );
}
