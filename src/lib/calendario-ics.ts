// Exporta os cuidados para o calendário do próprio celular (formato iCalendar).
//
// Por que assim: notificação própria exigiria service worker, chaves de servidor
// e um agendador — e no iPhone só funciona se a pessoa instalar o app na tela de
// início. O calendário do celular já resolve o lembrete, já é confiável e a
// pessoa já confia nele. Aqui a gente só entrega os eventos.
import type { CareTask, Plant } from "./types";

const ROTULO_TIPO: Record<string, string> = {
  regar: "Regar",
  adubar: "Adubar",
  podar: "Podar",
  pragas: "Checar pragas",
  fotografar: "Fotografar",
  substrato: "Cuidar do substrato",
};

/** Datas do iCalendar são UTC compacto: 20260820T090000Z */
function paraDataIcs(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/** Quebras de linha e vírgulas precisam de escape no formato. */
function escapar(texto: string): string {
  return texto
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

/**
 * Linhas do iCalendar não podem passar de 75 octetos — celulares costumam
 * tolerar, mas o Google Agenda recusa o arquivo inteiro. Dobra por segurança.
 */
function dobrarLinha(linha: string): string {
  if (linha.length <= 74) return linha;
  const partes: string[] = [linha.slice(0, 74)];
  let resto = linha.slice(74);
  while (resto.length > 73) {
    partes.push(" " + resto.slice(0, 73));
    resto = resto.slice(73);
  }
  if (resto) partes.push(" " + resto);
  return partes.join("\r\n");
}

export function gerarIcs(tarefas: CareTask[], plantas: Plant[]): string {
  const nomePlanta = new Map(plantas.map((p) => [p.id, p.nickname]));
  const agora = paraDataIcs(new Date());

  const linhas: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Plantae AI//Cuidados//PT",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Cuidados das plantas",
  ];

  for (const t of tarefas) {
    const inicio = new Date(t.date);
    // Cuidado de planta é tarefa do dia, não compromisso de horário exato:
    // ancora às 9h para não cair de madrugada.
    if (inicio.getHours() === 0 && inicio.getMinutes() === 0) inicio.setHours(9, 0, 0, 0);
    const fim = new Date(inicio.getTime() + 30 * 60000);
    const planta = nomePlanta.get(t.plantId) ?? "sua planta";
    const titulo = `${ROTULO_TIPO[t.type] ?? "Cuidado"} — ${planta}`;

    linhas.push(
      "BEGIN:VEVENT",
      `UID:${t.id}@plantae-ai`,
      `DTSTAMP:${agora}`,
      `DTSTART:${paraDataIcs(inicio)}`,
      `DTEND:${paraDataIcs(fim)}`,
      dobrarLinha(`SUMMARY:${escapar(titulo)}`),
      dobrarLinha(`DESCRIPTION:${escapar(t.title)}`),
      // O lembrete: o celular avisa na hora do evento.
      "BEGIN:VALARM",
      "TRIGGER:PT0M",
      "ACTION:DISPLAY",
      dobrarLinha(`DESCRIPTION:${escapar(titulo)}`),
      "END:VALARM",
      "END:VEVENT",
    );
  }

  linhas.push("END:VCALENDAR");
  return linhas.join("\r\n");
}

/** Entrega o arquivo ao celular — abrir o .ics faz o sistema oferecer importar. */
export function baixarIcs(conteudo: string, nome = "cuidados-plantae.ics") {
  const blob = new Blob([conteudo], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
