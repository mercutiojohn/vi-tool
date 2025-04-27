import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { colorPalette } from '@/data/colorPalette';

interface SubDialogProps {
  onClose: () => void;
  onConfirm: (alignment: string, color: string) => void;
}

export default function SubDialog({ onClose, onConfirm }: SubDialogProps) {
  const [alignment, setAlignment] = useState('left');
  const [selectedColor, setSelectedColor] = useState('#001D31');
  
  const handleConfirm = () => {
    onConfirm(alignment, selectedColor);
  };
  
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>添加色带</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>对齐方式</Label>
            <RadioGroup value={alignment} onValueChange={setAlignment}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="left" id="align-left" />
                <Label htmlFor="align-left">左对齐</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="right" id="align-right" />
                <Label htmlFor="align-right">右对齐</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="grid gap-2">
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
        </div>
        
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>取消</Button>
          <Button onClick={handleConfirm}>确定</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}