import { useColorEditor } from '@/hooks/useColorEditor';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ColorPicker } from '@/components/ui/color-picker';

interface ColorDialogProps {
  onClose: () => void;
  onConfirm: (color: string) => void;
  initialColor?: string;
}

export default function ColorDialog({
  onClose,
  onConfirm,
  initialColor
}: ColorDialogProps) {
  const {
    selectedColor,
    setSelectedColor
  } = useColorEditor({
    initialColor
  });

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
          <ColorPicker
            label="选择颜色"
            value={selectedColor}
            onChange={setSelectedColor}
          />
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>取消</Button>
          <Button onClick={handleConfirm}>确定</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
