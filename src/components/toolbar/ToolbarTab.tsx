import { SvgTypes } from '@/types';
import { cn } from '@/lib/utils';

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

const iconClassName = "size-5";

// 每种类型对应的图标
const typeIcons: Record<SvgTypes, React.ReactNode> = {
  'line': <LineChart className={iconClassName} />,
  'text': <Type className={iconClassName} />,
  'exit': <SquareArrowOutUpRight className={iconClassName} />,
  'sub': <Layers className={iconClassName} />,
  'branch': <ArrowRight className={iconClassName} />,
  'ic': <CircleDot className={iconClassName} />,
  'turn': <Recycle className={iconClassName} />,
  'way': <Layers className={iconClassName} />,
  'stn': <Layers className={iconClassName} />,
  'oth': <Layers className={iconClassName} />,
  'cls': <Layers className={iconClassName} />,
  'clss': <Layers className={iconClassName} />,
  // 'default': <CircleDot className={iconClassName} />
};

export default function ToolbarTab({ type, isActive, onClick, label, isCollapsed = false }: ToolbarTabProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 items-center justify-center cursor-pointer rounded-md transition-colors",
        isActive 
          ? "bg-primary text-primary-foreground font-medium" 
          : "text-muted-foreground hover:bg-secondary",
        isCollapsed ? "justify-center p-2" : "px-1 py-2"
      )}
      onClick={onClick}
      data-type={type}
    >
      <span className={cn(isCollapsed ? "" : "")}>
        {typeIcons[type] || <CircleDot className={iconClassName} />}
      </span>
      {!isCollapsed && <span className="text-xs">{label}</span>}
    </div>
  );
}