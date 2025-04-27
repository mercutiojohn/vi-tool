import { useRef, useEffect, useState, useCallback } from 'react';
import { CanvasItemProps } from '@/types';
import { cn } from '@/lib/utils';

interface Props extends CanvasItemProps {
  className?: string;
  style?: React.CSSProperties;
}

const CANVAS_HEIGHT = 150;

export default function CanvasItem({ item, isActive, onItemClick, className, style }: Props) {
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
        "h-[150px] cursor-move transition-transform flex items-center flex-shrink-0",
        isActive && "outline outline-4 outline-[#00a0e9] outline-offset-[-5px] rounded-md opacity-85",
        "hover:scale-105",
        className
      )}
      style={style}
      onClick={handleClick}
      draggable={true}
    >
      <img
        ref={imgRef}
        key={item.customUrl || item.file} // Add key to force re-render when URL changes
        src={item.customUrl || `./${item.file}`}
        alt={item.file}
        style={{ 
          height: `${imgSize.height}px`,
          width: `${imgSize.width}px`
        }}
        onLoad={updateImageSize}
        onError={handleError}
        crossOrigin="anonymous"
      />
    </div>
  );
}
