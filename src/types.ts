export interface ColorInfo {
  name: string;
  value: string;
}

export interface SvgItem {
  file: string;
  id: string;
  originalSvg?: string;
  customUrl?: string;
  customText?: {
    cn: string;
    en: string;
    alignment: 'start' | 'middle' | 'end';
  };
  customColor?: string;
  hasColorBand?: boolean;
  colorBandColor?: string;
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

export type SvgTypes = 'line' | 'way' | 'stn' | 'oth' | 'sub' | 'text' | 'cls' | 'clss' | 'exit' | 'branch' | 'ic' | 'turn';
