import { SvgTypes } from '@/types';
import { cn } from '@/lib/utils';

interface ToolbarTabProps {
  type: SvgTypes;
  isActive: boolean;
  onClick: () => void;
  label: string;
}

export default function ToolbarTab({ type, isActive, onClick, label }: ToolbarTabProps) {
  return (
    <div
      className={cn(
        "px-4 py-2 cursor-pointer text-primary-foreground rounded-md mr-2 whitespace-nowrap transition-colors",
        isActive 
          ? "bg-primary font-bold shadow-sm" 
          : "hover:bg-primary/70 hover:shadow-sm"
      )}
      onClick={onClick}
      data-type={type}
    >
      {label}
    </div>
  );
}