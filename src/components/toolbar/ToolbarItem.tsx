interface ToolbarItemProps {
  file: string;
  onClick: () => void;
}

export default function ToolbarItem({ file, onClick }: ToolbarItemProps) {
  return (
    <div 
      className="h-[60px] min-w-[60px] cursor-pointer transition-transform flex-shrink-0 
                flex items-center justify-center px-2.5 relative hover:scale-110"
      data-file={file}
      onClick={onClick}
    >
      <img 
        src={`./${file}`} 
        alt={file} 
        className="max-h-full max-w-full"
      />
    </div>
  );
}