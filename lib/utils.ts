import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const locales = ["zh"] as const;
export const detectLocale = (locale: string): (typeof locales)[number] => {
  const detectedLocale = locale.split("-")[0];
  if (["en", "zh", "ja"].includes(detectedLocale as (typeof locales)[number])) {
    return detectedLocale as (typeof locales)[number];
  }
  return locales[0];
};


export const base64ToFile = (base64Data: string, filename: string) => {
  const arr = base64Data.split(',');
  const mime = arr[0].match(/:(.*?);/);
  let type = '';
  if (mime) {
    type = mime[1];
  }
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type });
};

// 获取图片尺寸函数
export const getImageDimensions = (file: File): Promise<{ width: number, height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file); // 生成临时 URL

    img.onload = () => {
      const width = img.width;
      const height = img.height;
      URL.revokeObjectURL(url); // 释放URL对象
      resolve({ width, height });
    };

    img.onerror = reject;

    img.src = url;
  });
};