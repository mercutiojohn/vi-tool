import { SvgTypes } from '@/types';
import { cn } from '@/lib/utils';

// 导入图标映射
import { 
  LineChart, 
  Type, 
  CircleDot, 
  Layers, 
  ArrowRight, 
  SquareArrowOutUpRight, 
  Recycle 
} from 'lucide-react';

interface ToolbarTabProps {
  type: SvgTypes;
  isActive: boolean;
  onClick: () => void;
  label: string;
  isCollapsed?: boolean;
}

// 每种类型对应的图标
const typeIcons: Record<SvgTypes, React.ReactNode> = {
  'line': <LineChart className="h-4 w-4" />,
  'text': <Type className="h-4 w-4" />,
  'exit': <SquareArrowOutUpRight className="h-4 w-4" />,
  'sub': <Layers className="h-4 w-4" />,
  'branch': <ArrowRight className="h-4 w-4" />,
  'ic': <CircleDot className="h-4 w-4" />,
  'turn': <Recycle className="h-4 w-4" />
};

export default function ToolbarTab({ type, isActive, onClick, label, isCollapsed = false }: ToolbarTabProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center cursor-pointer rounded-md transition-colors",
        isActive 
          ? "bg-primary text-primary-foreground font-medium" 
          : "text-muted-foreground hover:bg-secondary",
        isCollapsed ? "justify-center p-2" : "px-1 py-2"
      )}
      onClick={onClick}
      data-type={type}
    >
      <span className={cn(isCollapsed ? "" : "")}>
        {typeIcons[type] || <CircleDot className="h-4 w-4" />}
      </span>
      {!isCollapsed && <span className="text-xs">{label}</span>}
    </div>
  );
}