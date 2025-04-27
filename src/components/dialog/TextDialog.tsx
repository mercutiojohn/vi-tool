import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface TextDialogProps {
  onClose: () => void;
  onConfirm: (cnText: string, enText: string, alignment: string) => void;
}

export default function TextDialog({ onClose, onConfirm }: TextDialogProps) {
  const [cnText, setCnText] = useState('');
  const [enText, setEnText] = useState('');
  const [alignment, setAlignment] = useState('start');
  
  const handleConfirm = () => {
    onConfirm(cnText, enText, alignment);
  };
  
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>添加文本框</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="cn-input">中文内容</Label>
            <Input 
              id="cn-input" 
              value={cnText} 
              onChange={(e) => setCnText(e.target.value)} 
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="en-input">英文内容</Label>
            <Input 
              id="en-input" 
              value={enText} 
              onChange={(e) => setEnText(e.target.value)} 
            />
          </div>
          
          <div className="grid gap-2">
            <Label>对齐方式</Label>
            <RadioGroup value={alignment} onValueChange={setAlignment}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="start" id="align-left" />
                <Label htmlFor="align-left">左对齐</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="middle" id="align-center" />
                <Label htmlFor="align-center">居中</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="end" id="align-right" />
                <Label htmlFor="align-right">右对齐</Label>
              </div>
            </RadioGroup>
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