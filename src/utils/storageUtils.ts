import { SvgItem } from '@/types';

// 扩展SvgItem类型以包含blobData
interface StorageSvgItem extends SvgItem {
  blobData?: Blob;
}

// IndexedDB数据库配置
const DB_NAME = 'vi-tool-db';
const DB_VERSION = 1;
const STORE_NAME = 'canvas-items';

// 打开数据库
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

// 保存画布项目
export async function saveCanvasItems(items: SvgItem[]) {
  try {
    const db = await openDB();
    // 先获取所有的blob数据
    const itemsToSave = await Promise.all(items.map(async item => {
      if (item.customUrl?.startsWith('blob:')) {
        try {
          const response = await fetch(item.customUrl);
          const blob = await response.blob();
          return {
            ...item,
            customUrl: undefined,
            blobData: blob
          };
        } catch (error) {
          console.error('获取blob数据失败:', error);
          return item;
        }
      }
      return item;
    }));

    // 在一个事务中保存所有数据
    // 创建单个事务处理所有操作
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    // 清除旧数据
    await new Promise<void>((resolve, reject) => {
      const clearRequest = store.clear();
      clearRequest.onsuccess = () => resolve();
      clearRequest.onerror = () => reject(clearRequest.error);
    });

    // 保存所有项目
    for (const item of itemsToSave) {
      store.put(item);
    }

    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.error('保存数据失败:', error);
    throw error;
  }
}

// 加载画布项目
export async function loadCanvasItems(): Promise<SvgItem[]> {
  const db = await openDB();
  const transaction = db.transaction(STORE_NAME, 'readonly');
  const store = transaction.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const request = store.getAll();

    request.onsuccess = async () => {
      const items = request.result as StorageSvgItem[];
      // 处理每个项目，将blob数据转换回URL
      const processedItems = items.map(item => {
        if (item.blobData) {
          const url = URL.createObjectURL(item.blobData);
          return {
            ...item,
            blobData: undefined,
            customUrl: url
          };
        }
        return item;
      });
      resolve(processedItems);
    };

    request.onerror = () => reject(request.error);
  });
}
