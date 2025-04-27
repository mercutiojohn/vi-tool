interface ToolbarItemProps {
  file: string;
  onClick: () => void;
}

export default function ToolbarItem({ file, onClick }: ToolbarItemProps) {
  // 处理拖拽开始事件
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('application/vi-tool-file', file);
    e.dataTransfer.effectAllowed = 'copy'; // 表示这是复制操作
    
    // 设置拖拽时的图像
    const img = new Image();
    img.src = `./${file}`;
    
    // 使用setTimeout解决某些浏览器的渲染问题
    setTimeout(() => {
      try {
        if (img.complete) {
          e.dataTransfer.setDragImage(img, img.width / 2, img.height / 2);
        }
      } catch (error) {
        console.error('设置拖拽图像失败:', error);
      }
    }, 10);
  };

  return (
    <div 
      className="h-[60px] min-w-[60px] cursor-pointer flex-shrink-0 
                flex items-center justify-center px-2.5 relative 
                toolbar-item rounded-md bg-secondary hover:bg-secondary-foreground/20"
      data-file={file}
      onClick={onClick}
      draggable={true}
      onDragStart={handleDragStart}
    >
      <img 
        src={`./${file}`} 
        alt={file} 
        className="max-h-full max-w-full"
        draggable={false} // 防止图像本身被拖拽
      />
    </div>
  );
}