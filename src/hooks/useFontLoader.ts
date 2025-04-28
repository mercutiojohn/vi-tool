import { useState, useEffect } from 'react';
import { loadFonts } from '@/utils/fontUtils';
import { GenerationError } from '@/types/errors';

export function useFontLoader() {
  const [fontBuffer, setFontBuffer] = useState<ArrayBuffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const buffer = await loadFonts();
        setFontBuffer(buffer);
        setLoading(false);
      } catch (err) {
        console.error('加载字体失败:', err);
        const error = new GenerationError(
          err instanceof Error ? err.message : '加载字体失败',
          'FONT_LOAD_ERROR',
          {
            timestamp: Date.now(),
            source: 'useFontLoader',
            originalError: err
          }
        );
        setError(error);
        setLoading(false);
      }
    }

    load();
  }, []);

  return {
    fontBuffer,
    loading,
    error
  };
}
