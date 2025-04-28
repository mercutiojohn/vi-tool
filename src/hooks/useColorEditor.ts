import { useState } from 'react';
import { generateColoredSVG } from '@/utils/svgGeneratorUtils';
import { GenerationError } from '@/types/errors';

export interface ColorEditorOptions {
  initialColor?: string;
  onGenerated?: (fileName: string, url: string) => void;
}

export function useColorEditor({
  initialColor,
  onGenerated
}: ColorEditorOptions = {}) {
  const [selectedColor, setSelectedColor] = useState(initialColor || '#001D31');

  const generateColored = async (file: string) => {
    try {
      const result = await generateColoredSVG(file, selectedColor);
      onGenerated?.(result.fileName, result.url);
      return result;
    } catch (error) {
      console.error('生成着色SVG失败:', error);
      throw new GenerationError(
        error instanceof Error ? error.message : '生成着色SVG失败',
        'COLOR_GENERATION_ERROR',
        {
          timestamp: Date.now(),
          source: 'useColorEditor',
          originalError: error,
          context: { selectedColor, file }
        }
      );
    }
  };

  return {
    selectedColor,
    setSelectedColor,
    generateColored
  };
}
