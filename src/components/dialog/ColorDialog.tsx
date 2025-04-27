import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { colorPalette } from '@/data/colorPalette';

interface ColorDialogProps {
  onClose: () => void;
  onConfirm: (color: string) => void;
  originFile: string;
}

export default function ColorDialog({ onClose, onConfirm, originFile }: ColorDialogProps) {
  const [selectedColor, setSelectedColor] = useState('#001D31');
  
  const handleConfirm = () => {
    onConfirm(selectedColor);
  };
  
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>选择色带颜色</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <Label>选择颜色</Label>
          <div className="flex flex-wrap gap-2">
            {colorPalette.map((color) => (
              <div
                key={color.value}
                className="w-10 h-10 rounded cursor-pointer transition-all"
                style={{ 
                  backgroundColor: color.value,
                  border: selectedColor === color.value ? '2px solid white' : 'none',
                  boxShadow: selectedColor === color.value ? '0 0 0 1px rgba(0,0,0,0.3)' : 'none'
                }}
                onClick={() => setSelectedColor(color.value)}
                title={color.name}
              />
            ))}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>取消</Button>
          <Button onClick={handleConfirm}>确定</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}