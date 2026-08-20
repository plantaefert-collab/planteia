import type { Plant } from "@/lib/types";

/**
 * "Precisa de você" é a única pergunta que o jardim responde bem.
 * Status de saúde sozinho não basta: uma planta saudável com rega atrasada
 * há três dias precisa de você tanto quanto uma doente.
 */
export function precisaDeVoce(planta: Plant) {
  const quando = planta.nextCare?.whenLabel ?? "";
  return planta.status === "atencao" || quando.startsWith("atrasada") || quando === "hoje";
}

/** Menor peso vai primeiro: atrasadas, depois doentes, depois o resto. */
export function pesoDeUrgencia(planta: Plant) {
  const quando = planta.nextCare?.whenLabel ?? "";
  const atrasada = quando.startsWith("atrasada") ? 0 : 1;
  const porStatus = planta.status === "atencao" ? 0 : planta.status === "acompanhamento" ? 1 : 2;
  const hoje = quando === "hoje" ? 0 : 1;
  return atrasada * 100 + porStatus * 10 + hoje;
}

/** Uma linha curta que cabe em 166px: o que fazer, ou como a planta está. */
export function legendaDeCuidado(planta: Plant) {
  if (planta.nextCare) {
    const { label, whenLabel } = planta.nextCare;
    return whenLabel.startsWith("atrasada") ? `${label} · ${whenLabel}` : `${label} ${whenLabel}`;
  }
  if (planta.status === "atencao") return "Precisa de atenção";
  if (planta.status === "acompanhamento") return "Em acompanhamento";
  return "Saudável";
}
