import { useRef, useEffect, useState } from 'react';
import { SvgItem, CanvasItemProps } from '@/types';
import { cn } from '@/lib/utils';

interface Props extends CanvasItemProps {
  className?: string;
}

const CANVAS_HEIGHT = 150;

export default function CanvasItem({ item, isActive, onItemClick, className }: Props) {
  const [imgSize, setImgSize] = useState({ width: 0, height: CANVAS_HEIGHT });
  const imgRef = useRef<HTMLImageElement>(null);
  
  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      updateImageSize();
    }
  }, [item]);
  
  const updateImageSize = () => {
    if (!imgRef.current) return;
    
    const aspectRatio = imgRef.current.naturalWidth / imgRef.current.naturalHeight;
    setImgSize({
      width: CANVAS_HEIGHT * aspectRatio,
      height: CANVAS_HEIGHT
    });
  };
  
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
      onClick={handleClick}
      draggable={true}
    >
      <img
        ref={imgRef}
        src={item.customUrl || `./${item.file}`}
        alt={item.file}
        style={{ 
          height: `${imgSize.height}px`,
          width: `${imgSize.width}px`
        }}
        onLoad={updateImageSize}
      />
    </div>
  );
}