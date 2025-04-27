export interface ColorInfo {
  name: string;
  value: string;
}

export interface SvgItem {
  file: string;
  id: string;
  originalSvg?: string;
  customUrl?: string;
}

export interface CanvasItemProps {
  item: SvgItem;
  isActive: boolean;
  onItemClick: (item: SvgItem, x: number, y: number) => void;
  isDragging?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

export interface ToolbarItemProps {
  file: string;
  onClick: () => void;
}

export type SvgTypes = 'line' | 'way' | 'stn' | 'oth' | 'sub' | 'text' | 'cls' | 'clss';