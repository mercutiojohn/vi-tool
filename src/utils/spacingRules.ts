export function shouldReduceSpacing(currentFile: string, nextFile: string): boolean {
  const isSpecialCurrent = /oth@(one|two|thr|fou)\.svg/.test(currentFile);
  const isSpecialNext = /oth@(one|two|thr|fou)\.svg/.test(nextFile);
  const isOthSeriesCurrent = /oth@(0[1-9]|1[0-9]|2[0-9]|30|A)\.svg/.test(currentFile);
  const isOthSeriesNext = /oth@(0[1-9]|1[0-9]|2[0-9]|30|A)\.svg/.test(nextFile);
  
  return (isSpecialCurrent && isOthSeriesNext) || (isOthSeriesCurrent && isSpecialNext);
}

export function isDotPair(currentFile: string, nextFile: string): boolean {
  return (currentFile === 'oth@Dot.svg' && nextFile === 'oth@A.svg') || 
         (currentFile === 'oth@A.svg' && nextFile === 'oth@Dot.svg');
}

export function isSubLinePair(currentType: string, nextType: string): boolean {
  return (currentType === 'sub' && nextType === 'sub') ||
         (currentType === 'sub' && nextType === 'line') ||
         (currentType === 'line' && nextType === 'sub');
}

// 检查是否是子线路系列文件
export function isSubSeries(file: string): boolean {
  return /sub@(0[3-9]|1[0-9]|20|text|long|exit|space)\.svg/.test(file);
}

// 获取子线路系列之间的间距
export function getSubSeriesSpacing(currentFile: string, nextFile: string): number {
  const isExitCurrent = currentFile === 'sub@exit.svg';
  const isExitNext = nextFile === 'sub@exit.svg';
  const isLongCurrent = currentFile === 'sub@long.svg';
  const isLongNext = nextFile === 'sub@long.svg';
  const isTextCurrent = currentFile === 'sub@text.svg';
  const isTextNext = nextFile === 'sub@text.svg';
  
  // 出口标志特殊处理
  if (isExitCurrent || isExitNext) {
    return 10;
  }
  
  // 长直线标志特殊处理
  if (isLongCurrent || isLongNext) {
    return 0;
  }
  
  // 文本标志特殊处理
  if (isTextCurrent || isTextNext) {
    return 15;
  }
  
  // 默认子线路导向标志间距为0
  return 0;
}

// 动态计算两个元素之间的间距
export function getDynamicSpacing(currentFile: string, nextFile: string, currentType: string, nextType: string, defaultSpacing: number = 25): number {
  if (shouldReduceSpacing(currentFile, nextFile)) return 5;
  if (isDotPair(currentFile, nextFile)) return 0;
  if (isSubLinePair(currentType, nextType)) return 0;
  if (currentFile === 'oth@Dot.svg' || nextFile === 'oth@Dot.svg') return 15;
  
  // 检查子线路系列的特殊间距
  if (isSubSeries(currentFile) && isSubSeries(nextFile)) {
    return getSubSeriesSpacing(currentFile, nextFile);
  }
  
  return defaultSpacing;
}