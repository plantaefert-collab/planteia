import { Link } from "@tanstack/react-router";
import { Droplets, Sprout, Camera, MessageCircle } from "lucide-react";
import type { Cuidado } from "./RegistroRapido";

/**
 * Faixa de ações da Home.
 *
 * Existe porque o produto tem oito capacidades e só uma aparecia na tela
 * inicial: a tarefa do dia. O usuário abria, via uma rega para fazer, e não
 * descobria que o app diagnostica por foto, conversa e guarda o que ele
 * aplicou.
 *
 * As duas primeiras registram cuidado já feito — o app sabia marcar tarefa
 * agendada, mas não sabia ouvir "reguei ontem". As duas últimas são
 * navegação para capacidades que existiam escondidas.
 */
export function FaixaDeAcoes({ onRegistrar }: { onRegistrar: (c: Cuidado) => void }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      <Botao icone={Droplets} rotulo="Reguei" onClick={() => onRegistrar("rega")} />
      <Botao icone={Sprout} rotulo="Adubei" onClick={() => onRegistrar("adubacao")} />
      <Atalho icone={Camera} rotulo="Diagnosticar" para="/app/diagnostico" />
      <Atalho icone={MessageCircle} rotulo="Perguntar" para="/app/jardineiro" />
    </div>
  );
}

const ESTILO =
  "tap-safe flex h-[66px] flex-col items-center justify-center gap-1 rounded-xl " +
  "border border-border bg-card text-[11px] font-semibold leading-tight text-muted-foreground " +
  "shadow-sm transition active:scale-95";

function Botao({
  icone: Ic,
  rotulo,
  onClick,
}: {
  icone: typeof Droplets;
  rotulo: string;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} className={ESTILO}>
      <Ic className="h-[18px] w-[18px] text-leaf" />
      {rotulo}
    </button>
  );
}

function Atalho({
  icone: Ic,
  rotulo,
  para,
}: {
  icone: typeof Droplets;
  rotulo: string;
  para: string;
}) {
  return (
    <Link to={para} className={ESTILO}>
      <Ic className="h-[18px] w-[18px] text-leaf" />
      {rotulo}
    </Link>
  );
}
