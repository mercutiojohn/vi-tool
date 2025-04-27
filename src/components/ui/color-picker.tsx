import { colorPalette } from '@/data/colorPalette';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
}

export function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  return (
    <div className="grid gap-2">
      {label && <Label>{label}</Label>}
      <ScrollArea className="h-[200px] border rounded">
        <div className="flex flex-col">
          {colorPalette.map((color) => (
            <div
              key={color.value}
              className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-all hover:bg-gray-100 dark:hover:bg-gray-800 ${
                value === color.value ? 'bg-gray-100 dark:bg-gray-800' : ''
              }`}
              onClick={() => onChange(color.value)}
            >
              <div 
                className="w-6 h-6 rounded-full" 
                style={{ backgroundColor: color.value }}
              />
              <span className="text-sm">{color.name}</span>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}