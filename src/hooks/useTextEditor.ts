import { useState } from 'react';
import { generateTextSVG, generateTextSubSVG } from '@/utils/svgGeneratorUtils';
import { GenerationError } from '@/types/errors';

export interface TextEditorOptions {
  initialValues?: {
    cn: string;
    en: string;
    alignment: 'start' | 'middle' | 'end';
  };
  initialColorBandColor?: string;
  mode?: 'normal' | 'colorBand';
  onGenerated?: (fileName: string, url: string) => void;
}

export function useTextEditor({
  initialValues,
  initialColorBandColor,
  mode = 'normal',
  onGenerated
}: TextEditorOptions = {}) {
  const [cnText, setCnText] = useState(initialValues?.cn || '');
  const [enText, setEnText] = useState(initialValues?.en || '');
  const [alignment, setAlignment] = useState<'start' | 'middle' | 'end'>(initialValues?.alignment || 'start');
  const [colorBandColor, setColorBandColor] = useState(initialColorBandColor || '#001D31');

  const generateText = async (fontBuffer: ArrayBuffer) => {
    try {
      let result;
      if (mode === 'colorBand') {
        result = await generateTextSubSVG(cnText, enText, alignment, colorBandColor, fontBuffer);
      } else {
        result = await generateTextSVG(cnText, enText, alignment, fontBuffer);
      }

      onGenerated?.(result.fileName, result.url);
      return result;
    } catch (error) {
      console.error('生成文本失败:', error);
      throw new GenerationError(
        error instanceof Error ? error.message : '生成文本失败',
        'TEXT_GENERATION_ERROR',
        {
          timestamp: Date.now(),
          source: 'useTextEditor',
          originalError: error
        }
      );
    }
  };

  return {
    cnText,
    setCnText,
    enText,
    setEnText,
    alignment,
    setAlignment,
    colorBandColor,
    setColorBandColor,
    generateText,
  };
}
