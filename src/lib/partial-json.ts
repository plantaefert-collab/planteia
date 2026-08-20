/**
 * Parser tolerante de JSON incompleto.
 *
 * Existe porque o diagnóstico chega em fluxo: a cada pedaço de texto recebido do
 * modelo queremos renderizar os campos que já fecharam, sem esperar o objeto
 * inteiro. Ver `design/design-system.md` → P-002.
 *
 * Nota de arquitetura: NÃO usamos `streamObject` do AI SDK aqui. O structured
 * output não é honrado pelo AI Gateway com este provider/modelo — ver o comentário
 * em `src/routes/api/diagnose-photo.ts`. Mantemos JSON instruído por prompt, que
 * comprovadamente funciona, e parseamos o parcial nós mesmos.
 */

/** Isola o objeto JSON dentro de uma resposta em texto, tolerando cercas de código. */
function isolateObject(text: string): string | null {
  let t = text.trim();
  if (!t) return null;

  // Remove a cerca de abertura; a de fechamento pode ainda não ter chegado.
  const fenceStart = t.match(/^```(?:json)?\s*/i);
  if (fenceStart) t = t.slice(fenceStart[0].length);
  t = t.replace(/```[\s\S]*$/, "");

  const first = t.indexOf("{");
  if (first === -1) return null;
  return t.slice(first);
}

/**
 * Fecha strings, arrays e objetos deixados em aberto por um fluxo truncado,
 * descartando o último token incompleto.
 */
function repair(src: string): string {
  const closers: string[] = [];
  let out = "";
  let inString = false;
  let escaped = false;

  for (const char of src) {
    if (inString) {
      out += char;
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === '"') inString = false;
      continue;
    }

    if (char === '"') {
      inString = true;
      out += char;
    } else if (char === "{") {
      closers.push("}");
      out += char;
    } else if (char === "[") {
      closers.push("]");
      out += char;
    } else if (char === "}" || char === "]") {
      closers.pop();
      out += char;
    } else {
      out += char;
    }
  }

  // Escape pendente: a barra invertida ficou sem o caractere que ela escaparia.
  if (escaped) out = out.slice(0, -1);
  if (inString) out += '"';

  // Descarta restos incompletos na cauda, do mais específico ao mais genérico.
  out = out
    // literal ou número pela metade: `"confidence": mod` / `"dias": 1.`
    .replace(/:\s*(?:t|tr|tru|f|fa|fal|fals|n|nu|nul|[+-]?\d*\.)\s*$/, ": null")
    // chave sem valor: `"immediateActions":`
    .replace(/,?\s*"[^"]*"\s*:\s*$/, "")
    // vírgula órfã
    .replace(/,\s*$/, "");

  while (closers.length) out += closers.pop();
  return out;
}

/**
 * Devolve o maior objeto parseável contido em `text`, ou `null` se ainda não há
 * nada aproveitável. Seguro para chamar a cada chunk recebido.
 */
export function parsePartialJson<T = Record<string, unknown>>(text: string): T | null {
  const isolated = isolateObject(text);
  if (!isolated) return null;

  // Caminho feliz: o objeto já fechou sozinho.
  try {
    return JSON.parse(isolated) as T;
  } catch {
    /* segue para o reparo */
  }

  try {
    return JSON.parse(repair(isolated)) as T;
  } catch {
    /* segue para o recuo */
  }

  // Último recurso: recua até a vírgula anterior e tenta de novo. Cobre o caso em
  // que o token final é malformado de um jeito que o reparo não previu.
  let cut = isolated.lastIndexOf(",");
  for (let attempt = 0; attempt < 3 && cut > 0; attempt++) {
    try {
      return JSON.parse(repair(isolated.slice(0, cut))) as T;
    } catch {
      cut = isolated.lastIndexOf(",", cut - 1);
    }
  }

  return null;
}

/** Só considera preenchido o que de fato tem conteúdo — evita piscar campo vazio. */
export function hasContent(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0 && value.some(hasContent);
  if (typeof value === "number") return Number.isFinite(value);
  if (typeof value === "object") return Object.values(value).some(hasContent);
  return true;
}
