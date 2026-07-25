/**
 * Processamento de imagem no cliente para melhorar a qualidade do diagnóstico por IA.
 */

export interface ImageProcessOptions {
  brightness?: number; // 1.0 = normal, 1.1 = +10%
  contrast?: number;   // 1.0 = normal, 1.15 = +15%
}

/**
 * Calcula um índice de "borrado" da imagem.
 * Quanto maior o valor, mais nítida (bordas mais fortes).
 * Valores baixos (< 10) geralmente indicam desfoque significativo.
 */
export async function calculateBlurriness(dataUrl: string): Promise<number> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) {
        resolve(100); // Fallback neutro
        return;
      }

      // Trabalha com uma versão pequena para performance
      const size = 200;
      canvas.width = size;
      canvas.height = size;
      ctx.drawImage(img, 0, 0, size, size);

      const imageData = ctx.getImageData(0, 0, size, size);
      const data = imageData.data;
      const width = imageData.width;
      const height = imageData.height;

      // Escala de cinza + Convolução simples (Laplaciano simplificado)
      let sum = 0;
      let count = 0;

      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const idx = (y * width + x) * 4;
          // Luminância simples
          const pixel = (data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114);
          
          // Diferença com vizinhos (Gradiente)
          const up = (data[((y - 1) * width + x) * 4] * 0.299 + data[((y - 1) * width + x) * 4 + 1] * 0.587 + data[((y - 1) * width + x) * 4 + 2] * 0.114);
          const down = (data[((y + 1) * width + x) * 4] * 0.299 + data[((y + 1) * width + x) * 4 + 1] * 0.587 + data[((y + 1) * width + x) * 4 + 2] * 0.114);
          const left = (data[(y * width + x - 1) * 4] * 0.299 + data[(y * width + x - 1) * 4 + 1] * 0.587 + data[(y * width + x - 1) * 4 + 2] * 0.114);
          const right = (data[(y * width + x + 1) * 4] * 0.299 + data[(y * width + x + 1) * 4 + 1] * 0.587 + data[(y * width + x + 1) * 4 + 2] * 0.114);

          const laplacian = Math.abs(4 * pixel - up - down - left - right);
          sum += laplacian;
          count++;
        }
      }

      const score = sum / count;
      resolve(score);
    };
    img.onerror = () => resolve(100);
    img.src = dataUrl;
  });
}

/**
 * Processamento de imagem no cliente para melhorar a qualidade do diagnóstico por IA.
 */
export async function processImageForAi(
  dataUrl: string, 
  options: ImageProcessOptions = { brightness: 1.1, contrast: 1.15 }
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      let width = img.width;
      let height = img.height;
      const MAX_SIZE = 1024;

      if (width > height) {
        if (width > MAX_SIZE) {
          height *= MAX_SIZE / width;
          width = MAX_SIZE;
        }
      } else {
        if (height > MAX_SIZE) {
          width *= MAX_SIZE / height;
          height = MAX_SIZE;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Brilho e Contraste
      const b = options.brightness ?? 1.1;
      const c = options.contrast ?? 1.15;
      
      ctx.filter = `brightness(${b}) contrast(${c})`;
      ctx.drawImage(img, 0, 0, width, height);
      ctx.filter = "none";

      // Redução de ruído via suavização
      ctx.globalAlpha = 0.5;
      ctx.drawImage(canvas, 0, 0);
      ctx.globalAlpha = 1.0;

      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}
