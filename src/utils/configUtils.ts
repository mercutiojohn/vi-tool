import { SvgItem } from '@/types';

interface CanvasConfig {
  items: SvgItem[];
  version: string;
  exportDate: string;
}

const CONFIG_VERSION = '1.0.0';

export async function exportCanvasConfig(items: SvgItem[]): Promise<string> {
  // 将自定义 URL 转换为 blob 数据
  const processedItems = await Promise.all(items.map(async (item) => {
    if (item.customUrl?.startsWith('blob:')) {
      try {
        const response = await fetch(item.customUrl);
        const blob = await response.blob();
        // 将 blob 转换为 base64
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
        return {
          ...item,
          customUrl: base64
        };
      } catch (error) {
        console.error('处理自定义 URL 失败:', error);
        return item;
      }
    }
    return item;
  }));

  const config: CanvasConfig = {
    items: processedItems,
    version: CONFIG_VERSION,
    exportDate: new Date().toISOString()
  };

  return JSON.stringify(config);
}

export async function importCanvasConfig(configStr: string): Promise<SvgItem[]> {
  try {
    const config = JSON.parse(configStr) as CanvasConfig;
    
    // 版本检查
    if (!config.version || config.version !== CONFIG_VERSION) {
      throw new Error(`配置版本不兼容: ${config.version}`);
    }

    // 将 base64 转回 blob URL
    const processedItems = await Promise.all(config.items.map(async (item) => {
      if (item.customUrl?.startsWith('data:')) {
        try {
          const response = await fetch(item.customUrl);
          const blob = await response.blob();
          return {
            ...item,
            customUrl: URL.createObjectURL(blob)
          };
        } catch (error) {
          console.error('处理 base64 数据失败:', error);
          return item;
        }
      }
      return item;
    }));

    return processedItems;
  } catch (error) {
    console.error('解析配置失败:', error);
    throw new Error('无效的配置文件');
  }
}
