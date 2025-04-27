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

// 新增：检查是否是子线路系列文件
export function isSubSeries(file: string): boolean {
  return /sub@(0[3-9]|1[0-9]|20|text|long|exit|space)\.svg/.test(file);
}

// 新增：更精确的检查两个子线路图标的间距规则
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
  
  // 默认子线路图标间距为0
  return 0;
}