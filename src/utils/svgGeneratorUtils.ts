import { arrayBufferToBase64 } from './fontUtils';

/**
 * 生成色带SVG
 * @param alignment 对齐方式 ('left' | 'right')
 * @param color 颜色值
 * @returns Promise 包含 {fileName, url} 对象
 */
export async function generateSubSVG(alignment: string, color: string): Promise<{fileName: string, url: string}> {
  const svgFile = alignment === 'left' ? 'sub@01.svg' : 'sub@02.svg';
  
  try {
    const response = await fetch(`./${svgFile}`);
    let svgText = await response.text();
    
    // 替换颜色 - 支持多种可能的颜色属性格式
    svgText = svgText.replace(/fill(:|=)["'\s]*#[0-9a-fA-F]{6}["'\s]*;?/g, `fill="${color}"`);
    svgText = svgText.replace(/fill(:|=)["'\s]*#003670["'\s]*;?/g, `fill="${color}"`);
    svgText = svgText.replace(/fill(:|=)["'\s]*#3670["'\s]*;?/g, `fill="${color}"`);
    
    // 创建Blob
    const blob = new Blob([svgText], {type: 'image/svg+xml'});
    const url = URL.createObjectURL(blob);
    
    console.log('生成色带SVG成功:', svgFile, '->',  `sub@custom-${Date.now()}.svg`);
    
    // 返回文件名和URL
    return {
      fileName: `sub@custom-${Date.now()}.svg`,
      url
    };
  } catch (error) {
    console.error('生成色带失败:', error);
    throw new Error('生成色带失败，请检查文件是否存在');
  }
}

/**
 * 生成着色SVG
 * @param originFile 原始文件名
 * @param color 颜色值
 * @returns Promise 包含 {fileName, url} 对象
 */
export async function generateColoredSVG(originFile: string, color: string): Promise<{fileName: string, url: string}> {
  try {
    console.log('开始生成着色SVG:', originFile, color);
    const response = await fetch(`./${originFile}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    let svgText = await response.text();
    
    // 替换颜色 - 支持多种可能的颜色属性格式
    const originalSvgText = svgText;
    svgText = svgText.replace(/fill(:|=)["'\s]*#[0-9a-fA-F]{6}["'\s]*;?/g, `fill="${color}"`);
    svgText = svgText.replace(/fill(:|=)["'\s]*#003670["'\s]*;?/g, `fill="${color}"`);
    svgText = svgText.replace(/fill(:|=)["'\s]*#3670["'\s]*;?/g, `fill="${color}"`);
    
    if (originalSvgText === svgText) {
      console.warn('警告: 未找到可替换的颜色属性');
    }
    
    // 创建Blob
    const blob = new Blob([svgText], {type: 'image/svg+xml'});
    const url = URL.createObjectURL(blob);
    
    console.log('生成着色SVG成功:', originFile, '->', `${originFile.split('.')[0]}_${color.slice(1)}.svg`, url);
    
    // 返回文件名和URL
    return {
      fileName: `${originFile.split('.')[0]}_${color.slice(1)}.svg`,
      url
    };
  } catch (error) {
    console.error('生成着色色带失败:', error);
    throw new Error('文件加载失败，请检查网络连接');
  }
}

/**
 * 生成文本SVG
 * @param cnText 中文文本
 * @param enText 英文文本
 * @param alignment 对齐方式 ('start' | 'middle' | 'end')
 * @param fontBuffer 字体缓冲区
 * @returns Promise 包含 {fileName, url} 对象
 */
export async function generateTextSVG(
  cnText: string, 
  enText: string, 
  alignment: string,
  fontBuffer: ArrayBuffer
): Promise<{fileName: string, url: string}> {
  document.body.style.fontFamily = 'Arial-Bold';
  await new Promise(resolve => requestAnimationFrame(resolve));
  
  // 确保字体加载
  try {
    await document.fonts.load("500 1px SourceHanSansSC");
    await document.fonts.ready;
  } catch (e) {
    console.error('字体加载失败:', e);
  }
  
  // 计算文本宽度
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  ctx.font = "500 54.68px SourceHanSansSC";
  const cnWidth = ctx.measureText(cnText).width;
  ctx.font = "700 34.4px Arial-Bold";
  const enWidth = ctx.measureText(enText).width;
  const svgWidth = Math.max(cnWidth, enWidth) + 5;
  
  // 设置对齐
  let textAnchor = 'start';
  let xPos = 0;
  if (alignment === 'middle') {
    textAnchor = 'middle';
    xPos = svgWidth / 2;
  } else if (alignment === 'end') {
    textAnchor = 'end';
    xPos = svgWidth;
  }

  // 获取字体Base64
  const fontBase64 = arrayBufferToBase64(fontBuffer);
  
  // 生成SVG
  const svgContent = `
<svg width="${svgWidth}" height="150" viewBox="0 0 ${svgWidth} 150" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      @font-face {
        font-family: 'SourceHanSansSC';
        src: url('data:font/woff2;base64,${fontBase64}') format('woff2');
        font-weight: 500;
      }
      .cn { font-family: 'SourceHanSansSC'; font-size: 54.68px; fill: #fff; }
      .en {
            font-family: 'Arial-Bold', Arial;
            font-synthesis: none;
            font-size: 34.4px;
            fill: #fff;
            font-weight: 700;
            font-style: normal;
      }
    </style>
  </defs>
  <text class="cn" x="${xPos}" y="71.81" text-anchor="${textAnchor}">${cnText}</text>
  <text class="en" x="${xPos}" y="115" text-anchor="${textAnchor}">${enText}</text>
</svg>`;
  
  // 创建Blob
  const blob = new Blob([svgContent], {type: 'image/svg+xml'});
  const url = URL.createObjectURL(blob);
  
  return {
    fileName: `text@custom-${Date.now()}.svg`,
    url
  };
}

/**
 * 生成文本色带SVG
 * @param cnText 中文文本
 * @param enText 英文文本
 * @param alignment 对齐方式 ('start' | 'middle' | 'end')
 * @param color 颜色值
 * @param fontBuffer 字体缓冲区
 * @returns Promise 包含 {fileName, url} 对象
 */
export async function generateTextSubSVG(
  cnText: string,
  enText: string,
  alignment: string,
  color: string,
  fontBuffer: ArrayBuffer
): Promise<{fileName: string, url: string}> {
  // 计算文本宽度
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  // 中文测量
  ctx.font = "500 47.6px SourceHanSansSC";
  const cnWidth = ctx.measureText(cnText).width;
  
  // 英文测量
  ctx.font = "700 26.5px Arial-Bold";
  const enWidth = ctx.measureText(enText).width;
  
  const totalWidth = Math.max(cnWidth, enWidth) + 2;
  const viewBoxWidth = Math.ceil(totalWidth);
  
  // 获取字体Base64
  const fontBase64 = arrayBufferToBase64(fontBuffer);

  // 生成SVG
  const svgContent = `
<svg height="150" viewBox="0 0 ${viewBoxWidth} 150" xmlns="http://www.w3.org/2000/svg">
  <style>
    @font-face {
      font-family: 'SourceHanSansSC';
      src: url('data:font/woff2;base64,${fontBase64}') format('woff2');
      font-weight: 500;
    }
    .text-base { dominant-baseline: alphabetic; }
    .cn {
      font-family: 'SourceHanSansSC';
      font-size: 47.63px;
      fill: #fff;
    }
    .en {
      font-family: 'Arial-Bold', Arial;
      font-size: 26.46px;
      fill: #fff;
      font-weight: 700;
      font-style: normal;
    }
  </style>
  <g id="b">
    <text class="text-base cn" x="${alignment === 'start' ? 0 : alignment === 'middle' ? viewBoxWidth/2 : viewBoxWidth}" 
          y="65.61" text-anchor="${alignment}">${cnText}</text>
    <text class="text-base en" x="${alignment === 'start' ? 0 : alignment === 'middle' ? viewBoxWidth/2 : viewBoxWidth}" 
          y="99" text-anchor="${alignment}">${enText}</text>
  </g>
  <g id="c">
    <rect x="0" y="110" width="${viewBoxWidth}" height="40" style="fill: ${color};"/>
  </g>
</svg>`;

  // 创建Blob
  const blob = new Blob([svgContent], {type: 'image/svg+xml'});
  const url = URL.createObjectURL(blob);
  
  return {
    fileName: `sub@text-custom-${Date.now()}.svg`,
    url
  };
}
