import { SvgItem } from '@/types';
import { arrayBufferToBase64 } from './fontUtils';
import { shouldReduceSpacing, isDotPair, isSubLinePair } from './spacingRules';

const CANVAS_HEIGHT = 150;
const DEFAULT_SPACING = 25;

export async function exportAsJPG(items: SvgItem[], fontBuffer: ArrayBuffer) {
  if (items.length === 0) {
    alert('画板中没有可导出的图标');
    return;
  }

  const scaleFactor = 4;
  const exportHeight = CANVAS_HEIGHT * scaleFactor;

  const tempCanvas = document.createElement('canvas');
  const ctx = tempCanvas.getContext('2d')!;
  
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // 初始宽度 = 左边距25px + 右边距25px
  let totalWidth = (25 + 25) * scaleFactor; 
  const itemWidths: number[] = [];
  const spacingMap: Record<number, number> = {};
  
  // 第一阶段：计算所有元素宽度
  for (const item of items) {
    const img = await loadImage(`./${item.file}`);
    if (img) {
      const aspectRatio = img.naturalWidth / img.naturalHeight;
      const scaledWidth = CANVAS_HEIGHT * aspectRatio * scaleFactor;
      itemWidths.push(scaledWidth);
      totalWidth += scaledWidth;
    }
  }

  // 第二阶段：计算所有间距
  items.forEach((item, index) => {
    if (index >= items.length - 1) return;
    
    const currentFile = item.file;
    const nextFile = items[index + 1].file;
    const currentType = item.file.split('@')[0];
    const nextType = items[index + 1].file.split('@')[0];

    let spacing = DEFAULT_SPACING * scaleFactor;
    
    if (shouldReduceSpacing(currentFile, nextFile)) {
      spacing = 5 * scaleFactor;
    } else if (isDotPair(currentFile, nextFile)) {
      spacing = 0;
    } else if (isSubLinePair(currentType, nextType)) {
      spacing = 0;
    } else if (currentFile === 'oth@Dot.svg' || nextFile === 'oth@Dot.svg') {
      spacing = 15 * scaleFactor;
    }
    
    spacingMap[index] = spacing;
    totalWidth += spacing;
  });

  // 设置画布尺寸
  tempCanvas.width = totalWidth;
  tempCanvas.height = exportHeight;
  ctx.fillStyle = '#001D31';
  ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

  // 第三阶段：绘制元素
  let xPos = 25 * scaleFactor;
  for (let i = 0; i < items.length; i++) {
    const img = await loadImage(`./${items[i].file}`);
    if (img) {
      const width = itemWidths[i];
      ctx.drawImage(img, xPos, 0, width, exportHeight);
      
      // 累加间距（最后一个元素不加）
      if (i < items.length - 1) {
        xPos += width + (spacingMap[i] || 0);
      } else {
        xPos += width;
      }
    }
  }

  // 生成下载
  const url = tempCanvas.toDataURL('image/jpeg', 0.95);
  downloadFile(url, '导向标志.jpg');
}

export async function exportAsSVG(items: SvgItem[], fontBuffer: ArrayBuffer) {
  if (items.length === 0) {
    alert('画板中没有可导出的图标');
    return;
  }

  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('xmlns', ns);
  svg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');

  // 先计算总宽度（包含左右边距）
  let totalWidth = 50; // 25 + 25
  const itemData: {element: SVGElement, width: number, spacing: number}[] = [];
  
  for (const item of items) {
    const svgContent = await fetchSvgContent(item.file);
    if (svgContent) {
      const parser = new DOMParser();
      const svgElement = parser.parseFromString(svgContent, 'image/svg+xml').documentElement as SVGElement;
      const viewBox = svgElement.getAttribute('viewBox');
      const width = viewBox ? parseInt(viewBox.split(' ')[2]) : 150;
      
      const index = items.indexOf(item);
      const spacing = index < items.length - 1 ? 
        getDynamicSpacing(index, items) : 0;
      
      itemData.push({ element: svgElement, width, spacing });
      totalWidth += width + spacing;
    }
  }

  // 设置SVG尺寸
  svg.setAttribute('width', totalWidth.toString());
  svg.setAttribute('height', '150');
  svg.setAttribute('viewBox', `0 0 ${totalWidth} 150`);

  // 添加全局定义
  const defs = document.createElementNS(ns, 'defs');
  defs.innerHTML = `
      <style type="text/css">
          @font-face {
              font-family: 'SourceHanSansSC';
              src: url('data:font/woff2;base64,${arrayBufferToBase64(fontBuffer)}');
          }
          @font-face {
              font-family: 'Arial-Bold';
              src: local('Arial Bold');
          }
      </style>
  `;
  svg.appendChild(defs);

  // 添加背景
  const bgRect = document.createElementNS(ns, 'rect');
  bgRect.setAttribute('width', '100%');
  bgRect.setAttribute('height', '100%');
  bgRect.setAttribute('fill', '#001D31');
  svg.appendChild(bgRect);

  // 绘制元素（从25px开始）
  let xPos = 25;
  itemData.forEach((item) => {
    const g = document.createElementNS(ns, 'g');
    g.setAttribute('transform', `translate(${xPos},0)`);

    Array.from(item.element.children).forEach(child => {
      const clonedNode = child.cloneNode(true) as SVGElement;
      clonedNode.removeAttribute('id');
      clonedNode.removeAttribute('class');
      g.appendChild(clonedNode);
    });

    svg.appendChild(g);
    xPos += item.width + item.spacing;
  });

  // 生成下载
  const svgData = new XMLSerializer().serializeToString(svg);
  const blob = new Blob([svgData], {type: 'image/svg+xml'});
  const url = URL.createObjectURL(blob);
  
  downloadFile(url, `导向标志_${new Date().toISOString().slice(0,10)}.svg`);
  URL.revokeObjectURL(url);
}

// 辅助函数
function getDynamicSpacing(index: number, items: SvgItem[]): number {
  if (index === items.length - 1) return 0;
  
  const currentFile = items[index].file;
  const nextFile = items[index + 1].file;
  const currentType = items[index].file.split('@')[0];
  const nextType = items[index + 1].file.split('@')[0];

  if (shouldReduceSpacing(currentFile, nextFile)) return 5;
  if (isDotPair(currentFile, nextFile)) return 0;
  if (isSubLinePair(currentType, nextType)) return 0;
  
  return DEFAULT_SPACING;
}

function downloadFile(url: string, filename: string): void {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function fetchSvgContent(file: string): Promise<string | null> {
  try {
    const response = await fetch(`./${file}`);
    return await response.text();
  } catch (error) {
    console.error('获取SVG内容失败:', error);
    return null;
  }
}