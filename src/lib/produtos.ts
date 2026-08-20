// Produtos PlantaeFert em formato estruturado, para o app registrar o que foi
// aplicado. O catálogo em prosa que a IA usa vive em `ai-persona.ts`; aqui é a
// versão que a interface consome. No Bloco 8 os dois viram uma tabela só.

export type FormatoProduto = "pronto_uso" | "concentrado" | "solido";
export type UnidadeDose = "ml" | "ml/L" | "g" | "borrifadas";

export type Produto = {
  id: string;
  nome: string;
  categoria: "base" | "especifico" | "outro";
  formatos: FormatoProduto[];
};

export const PRODUTOS: Produto[] = [
  // Base — serve a todas as plantas, em todas as fases
  { id: "bokashi-premium", nome: "Bokashi Líquido Premium", categoria: "base", formatos: ["pronto_uso", "concentrado"] },

  // Específicos — resultado direcionado ao objetivo
  { id: "bokashi-orquideas", nome: "Bokashi Orquídeas", categoria: "especifico", formatos: ["pronto_uso", "concentrado"] },
  { id: "bokashi-rosa-do-deserto", nome: "Bokashi Rosa do Deserto", categoria: "especifico", formatos: ["pronto_uso", "concentrado"] },
  { id: "bokashi-frutas", nome: "Bokashi Frutas", categoria: "especifico", formatos: ["pronto_uso", "concentrado"] },
  { id: "bokashi-flores", nome: "Bokashi Flores", categoria: "especifico", formatos: ["pronto_uso", "concentrado"] },
  { id: "bokashi-cactos", nome: "Bokashi Cactos e Suculentas", categoria: "especifico", formatos: ["pronto_uso", "concentrado"] },
  { id: "bokashi-samambaias", nome: "Bokashi Samambaias e Ornamentais", categoria: "especifico", formatos: ["pronto_uso", "concentrado"] },

  // Complementares
  { id: "enraizador", nome: "Enraizador Orgânico", categoria: "outro", formatos: ["pronto_uso", "concentrado"] },
  { id: "humus", nome: "Húmus de Minhoca", categoria: "outro", formatos: ["solido"] },
  { id: "neem", nome: "Óleo de Neem", categoria: "outro", formatos: ["pronto_uso", "concentrado"] },
  { id: "calda-bordalesa", nome: "Calda Bordalesa", categoria: "outro", formatos: ["solido"] },
  { id: "outro", nome: "Outro produto", categoria: "outro", formatos: ["pronto_uso", "concentrado", "solido"] },
];

export function produtoPorId(id?: string | null): Produto | undefined {
  return id ? PRODUTOS.find((p) => p.id === id) : undefined;
}

/**
 * Unidades que fazem sentido para cada formato.
 * O pronto uso não se mede em ml por litro — o catálogo conta borrifadas
 * (1 borrifada ≈ 1 ml). Concentrado se mede diluído, em ml por litro.
 */
export function unidadesDoFormato(formato: FormatoProduto): UnidadeDose[] {
  if (formato === "concentrado") return ["ml/L", "ml"];
  if (formato === "solido") return ["g"];
  return ["borrifadas", "ml"];
}

export const ROTULO_FORMATO: Record<FormatoProduto, string> = {
  pronto_uso: "Pronto uso (não dilui)",
  concentrado: "Concentrado (dilui em água)",
  solido: "Sólido",
};

/** Descreve a dose em uma linha, para o diário. */
export function descreverDose(
  produtoId?: string | null,
  quantidade?: number | null,
  unidade?: string | null,
  formato?: string | null,
): string | null {
  const nome = produtoPorId(produtoId)?.nome;
  if (!nome) return null;
  const partes = [nome];
  if (quantidade != null && unidade) partes.push(`${quantidade} ${unidade}`);
  if (formato === "pronto_uso") partes.push("pronto uso");
  if (formato === "concentrado") partes.push("concentrado");
  return partes.join(" · ");
}
