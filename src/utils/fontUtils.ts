export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

export async function loadFonts(): Promise<ArrayBuffer | null> {
  try {
    const fontResponse = await fetch('./SourceHanSans.woff2');
    const fontBuffer = await fontResponse.arrayBuffer();
    
    const font = new FontFace('SourceHanSansSC', `url(./SourceHanSans.woff2)`);
    await font.load();
    document.fonts.add(font);
    
    return fontBuffer;
  } catch (e) {
    console.error('字体加载失败:', e);
    return null;
  }
}