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
import { Switch } from '@/components/ui/switch';
import { ColorPicker } from '@/components/ui/color-picker';

interface TextDialogProps {
  onClose: () => void;
  onConfirm: (cnText: string, enText: string, alignment: string, hasColorBand: boolean, colorBandColor: string | undefined) => void;
  mode?: 'normal' | 'colorBand'; // 新增模式参数，默认为普通模式
}

export default function TextDialog({ onClose, onConfirm, mode = 'normal' }: TextDialogProps) {
  const [cnText, setCnText] = useState('');
  const [enText, setEnText] = useState('');
  const [alignment, setAlignment] = useState('start');
  const [hasColorBand, setHasColorBand] = useState(mode === 'colorBand');
  const [colorBandColor, setColorBandColor] = useState('#001D31');
  
  const handleConfirm = () => {
    if (mode === 'colorBand') {
      // 色带模式下，直接传递色带颜色
      onConfirm(cnText, enText, alignment, true, colorBandColor);
    } else {
      // 普通模式下，根据开关决定是否传递色带参数
      onConfirm(cnText, enText, alignment, hasColorBand, hasColorBand ? colorBandColor : undefined);
    }
  };
  
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === 'colorBand' ? '添加色带文本' : '添加文本框'}</DialogTitle>
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
          
          {/* 在色带模式下显示 */}
          {/* 普通模式下显示色带开关 */}
          {mode === 'normal' && (
            <div className="flex items-center space-x-2">
              <Switch
                id="color-band"
                checked={hasColorBand}
                onCheckedChange={setHasColorBand}
              />
              <Label htmlFor="color-band">添加色带</Label>
            </div>
          )}

          {/* 色带模式或启用了色带时显示颜色选择器 */}
          {(mode === 'colorBand' || hasColorBand) && (
            <ColorPicker
              label="色带颜色"
              value={colorBandColor}
              onChange={setColorBandColor}
            />
          )}
        </div>
        
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>取消</Button>
          <Button onClick={handleConfirm}>确定</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
