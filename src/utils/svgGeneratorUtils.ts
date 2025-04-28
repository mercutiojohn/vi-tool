import { arrayBufferToBase64 } from './fontUtils';

// 在创建Blob前验证SVG内容有效性
function validateSvg(svgText: string): boolean {
  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
  return !svgDoc.querySelector('parsererror');
}

/**
 * 生成色带SVG
 * @param alignment 对齐方式 ('left' | 'right')
 * @param color 颜色值
 * @returns Promise 包含 {fileName, url} 对象
 */
export async function generateSubSVG(alignment: string, color: string): Promise<{fileName: string, url: string}> {
  const svgFile = alignment === 'left' ? 'sub@03.svg' : 'sub@04.svg';
  
  try {
    const response = await fetch(`/${svgFile}`);
    let svgText = await response.text();
    
    // 替换颜色属性
    svgText = svgText
      // // 处理fill属性(包括双引号和单引号的情况)
      // .replace(/fill=["']#[0-9a-fA-F]{3,6}["']/g, `fill="${color}"`)
      // // 处理style中的fill
      // .replace(/(fill:\s*)(#[0-9a-fA-F]{3,6})/g, `$1${color}`)
      // .replace(/(style=["'].*?fill:\s*)(#[0-9a-fA-F]{3,6})(.*?["'])/g, `$1${color}$3`)
      // .replace(/#3670/g, color)
      // 处理fill属性(包括双引号和单引号的情况)
      .replace(/fill=["']#[0-9a-fA-F]{3,6}["']/g, (match) => {
        // 只替换id="c"组内的颜色
        return match.includes('#003670') ? `fill="${color}"` : match;
      })
      // 处理style中的fill，更精确匹配id="c"组内的内容
      .replace(/(style=["'][^"']*fill:\s*)(#[0-9a-fA-F]{3,6})([^"']*["'])/g, (match, p1, colorValue, p3) => {
        // 只替换特定颜色
        return colorValue === '#003670' ? `${p1}${color}${p3}` : match;
      })
      // 处理特定颜色值 - 只替换我们确定要替换的颜色
      .replace(/#003670/g, color)
      // 修复可能的引号问题
      .replace(/""+/g, '"')
      .replace(/''+/g, "'");
    
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
    const response = await fetch(`/${originFile}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    let svgText = await response.text();
    
    // 保存原始内容用于比较
    const originalSvgText = svgText;

    // 只替换色带部分的颜色
    svgText = svgText.replace(
      /(<g id="c"[^>]*>)([\s\S]*?)(<\/g>)/g,
      (_, openTag, content, closeTag) => {
        // 在色带部分内替换颜色
        const coloredContent = content
          .replace(/fill=["']#[0-9a-fA-F]{3,6}["']/g, `fill="${color}"`)
          .replace(/(fill:\s*)(#[0-9a-fA-F]{3,6})/g, `$1${color}`)
          .replace(/(style=["'][^"']*fill:\s*)(#[0-9a-fA-F]{3,6})([^"']*["'])/g, `$1${color}$3`)
          // 处理特定颜色值
          .replace(/#003670/g, color)
          .replace(/#3670/g, color);
        return openTag + coloredContent + closeTag;
      }
    );

    // 修复可能的引号问题
    svgText = svgText
      .replace(/""+/g, '"')
      .replace(/''+/g, "'");
    
    if (originalSvgText === svgText) {
      console.warn('警告: 未找到id="c"的色带部分或颜色替换失败');
    }
    
    // 打印SVG内容以便调试
    console.log('处理后的SVG内容:', svgText);
    
    // 确保SVG内容完整性
    if (!svgText.includes('<?xml')) {
      svgText = `<?xml version="1.0" encoding="UTF-8"?>${svgText}`;
    }
    
    // 确保SVG标签有正确的属性
    const svgMatch = svgText.match(/<svg[^>]*>/);
    if (svgMatch) {
      let svgTag = svgMatch[0];
      
      // 添加xmlns属性
      if (!svgTag.includes('xmlns=')) {
        svgTag = svgTag.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
      }
      
      // 确保有width和height属性
      if (!svgTag.includes('width=')) {
        svgTag = svgTag.replace('<svg', '<svg width="150"');
      }
      if (!svgTag.includes('height=')) {
        svgTag = svgTag.replace('<svg', '<svg height="150"');
      }
      
      // 确保有viewBox属性
      if (!svgTag.includes('viewBox=')) {
        svgTag = svgTag.replace('<svg', '<svg viewBox="0 0 150 150"');
      }
      
      svgText = svgText.replace(/<svg[^>]*>/, svgTag);
      console.log('更新后的SVG标签:', svgTag);
    }

    // 在生成Blob前使用此函数验证
    if (!validateSvg(svgText)) {
      console.error('生成的SVG无效，可能导致加载失败');
      console.log('无效的SVG内容:', svgText);
      // 可以选择抛出错误或使用默认SVG
    }

    // 创建Blob
    const blob = new Blob([svgText], {
      type: 'image/svg+xml;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    
    // 验证URL是否可访问
    try {
      const checkResponse = await fetch(url);
      if (!checkResponse.ok) {
        throw new Error(`Invalid blob URL: ${checkResponse.status}`);
      }
      console.log('Blob URL验证成功');
    } catch (error) {
      console.error('Blob URL验证失败:', error);
    }
    
    console.log('生成着色SVG成功:', {
      originFile,
      targetFile: `${originFile.split('.')[0]}_${color.slice(1)}.svg`,
      url,
      contentLength: svgText.length
    });
    
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

  console.log('生成文本SVG成功:', {
    cnText,
    enText,
    alignment,
    url,
    contentLength: svgContent.length
  });
  
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
