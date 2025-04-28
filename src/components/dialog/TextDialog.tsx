import { useTextEditor } from '@/hooks/useTextEditor';
import { useFontLoader } from '@/hooks/useFontLoader';
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
import { ColorPicker } from '@/components/ui/color-picker';
import { GenerationError } from '@/types/errors';

interface TextDialogProps {
  onClose: () => void;
  onConfirm: (cnText: string, enText: string, alignment: string, hasColorBand: boolean, colorBandColor: string | undefined) => void;
  mode?: 'normal' | 'colorBand';
  initialValues?: {
    cn: string;
    en: string;
    alignment: 'start' | 'middle' | 'end';
  };
  initialColorBandColor?: string;
}

export default function TextDialog({ 
  onClose, 
  onConfirm, 
  mode = 'normal',
  initialValues,
  initialColorBandColor
}: TextDialogProps) {
  const { fontBuffer, loading } = useFontLoader();
  const {
    cnText,
    setCnText,
    enText,
    setEnText,
    alignment,
    setAlignment,
    colorBandColor,
    setColorBandColor,
    generateText
  } = useTextEditor({
    initialValues,
    initialColorBandColor,
    mode,
  });

  const handleConfirm = async () => {
    if (!fontBuffer) {
      alert('字体尚未加载完成，请稍后再试');
      return;
    }

    try {
      await generateText(fontBuffer);
      if (mode === 'colorBand') {
        onConfirm(cnText, enText, alignment, true, colorBandColor);
      } else {
        onConfirm(cnText, enText, alignment, false, undefined);
      }
    } catch (error) {
      if (error instanceof GenerationError) {
        alert(`${error.message}${error.code ? ` (错误代码: ${error.code})` : ''}`);
      } else {
        alert('生成文本失败，请稍后再试');
      }
    }
  };

  if (loading) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>加载中...</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={onClose}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
  
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === 'colorBand' ? '色带和文本框' : '文本框'}</DialogTitle>
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
            <RadioGroup 
              value={alignment} 
              onValueChange={(value: 'start' | 'middle' | 'end') => setAlignment(value)}
            >
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

          {/* 色带模式显示颜色选择器 */}
          {mode === 'colorBand' && (
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
