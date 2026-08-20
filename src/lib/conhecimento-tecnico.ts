// Conhecimento clínico do Jardineiro.
//
// CRITÉRIO DE INCLUSÃO — leia antes de acrescentar qualquer coisa aqui:
// isto vai no prompt. Entra apenas o que MUDA UMA DECISÃO que o modelo erraria
// sozinho: heurística de diagnóstico, calibragem local, protocolo da casa e
// mito que circula como verdade. Botânica geral que qualquer modelo já sabe não
// entra — só encarece o prompt e dilui as regras que importam.
//
// ESTRUTURA EM DUAS CAMADAS (importante):
//   1. CONHECIMENTO_TECNICO — geral, vai em toda conversa.
//   2. FICHAS — uma por família, injetada SÓ quando a planta em questão é
//      daquela família. Assim a profundidade por espécie não custa em todas as
//      mensagens; a ficha da orquídea só aparece quando se fala de orquídea.

export const CONHECIMENTO_TECNICO = `# Conhecimento clínico (para raciocinar, não para recitar)

## Rega — a causa nº 1 de morte
**Mais planta morre afogada do que de sede.** Nunca prescreva "regue a cada X dias"
sem antes descobrir o estado do substrato.
- Como checar: dedo 2–3 cm no substrato, ou peso do vaso (leve = seco). Superfície
  seca não significa raiz seca.
- **Rega é por observação, não por calendário.** Intervalo fixo é ponto de partida.
- **Prato com água parada apodrece raiz.** Esvaziar depois de regar.
- Regar pouco e sempre é pior que regar bem e esperar: molhar só a superfície faz a
  raiz crescer para cima, onde seca primeiro. Regue até escorrer pelo furo.

## Luz
- **"Luz indireta" não é penumbra** — é claridade sem sol batendo na folha.
- **Estiolamento** (caule esticado, folhas pequenas e espaçadas, planta pendendo
  para a janela) é falta de luz, e não se corrige com adubo.
- Sol direto através de vidro queima mais que sol aberto — o vidro concentra.
- Mudança brusca de local causa choque: adapte ao longo de alguns dias.
- Girar o vaso de vez em quando evita crescimento torto.

## Vaso e drenagem
- **Furo no fundo não é opcional.** Sem ele não existe manejo de rega que salve.
- **Vaso grande demais afoga:** muito substrato sem raiz para consumir a água fica
  úmido tempo demais. Ao trocar, suba pouco — 2 a 4 cm de diâmetro.
- **Pedras no fundo NÃO melhoram a drenagem.** Elevam a zona encharcada e pioram.
  O que drena é substrato adequado e furo desobstruído.
- Barro poroso respira e seca mais rápido; plástico e vidro retêm mais água.

## Substrato
- Terra de jardim comum em vaso compacta e sufoca a raiz.
- Cada grupo pede uma mistura: orquídea quer casca ou fibra com ar junto à raiz;
  cacto e suculenta querem mistura arenosa que seca rápido; folhagens querem
  substrato que segure umidade sem empapar.
- **Substrato velho avisa:** a água escorre na hora sem molhar, ou empoça sem
  entrar. Nos dois casos, é hora de trocar.

## Dentro de casa — onde colocar o vaso
Esta é a dúvida mais frequente de quem cultiva em apartamento, e a resposta quase
sempre está na janela, não no cômodo.

**Orientação da janela — no Brasil é o INVERSO do que se lê por aí.** Estamos no
hemisfério sul, e a maior parte do conteúdo de jardinagem é escrita para o norte,
onde a regra é oposta. Aqui:
- **Norte:** recebe sol a maior parte do dia, o ano todo. É a janela mais luminosa.
  Ótima para suculentas, cactos, rosa do deserto e frutíferas.
- **Sul:** recebe pouco ou nenhum sol direto. Luz suave e constante — boa para
  samambaias e folhagens de sombra; insuficiente para quem precisa de sol.
- **Leste:** sol da manhã, mais fraco e fresco. É o melhor lugar para orquídeas.
- **Oeste:** sol da tarde, quente e agressivo. Costuma queimar folha sem proteção.
Nunca afirme a orientação: **pergunte para que lado dá a janela**, ou peça uma
referência ("o sol bate aí de manhã ou de tarde?"), que é mais fácil de responder.

**A distância da janela engana muito.** A luz cai depressa: a um metro de distância
já é uma fração do que chega no peitoril, e a dois metros a maioria das plantas
está no escuro, mesmo que o cômodo pareça claro para nós — o olho se adapta, a
planta não.

**Teste da sombra**, para a pessoa medir sem aparelho: estenda a mão no local, num
dia claro. Sombra nítida e definida = luz forte. Sombra visível mas de borda macia
= luz média. Quase sem sombra = luz fraca, só folhagem tolerante sobrevive.

**Cômodos:**
- **Banheiro:** umidade alta favorece samambaias e folhagens, mas costuma ter pouca
  luz. Só funciona com janela; sem ela, não.
- **Cozinha:** calor e gordura no ar; a gordura fecha os poros da folha.
- **Quarto:** normalmente é o cômodo com menos luz da casa.
- Luz é o que decide, não o nome do cômodo.

**O que prejudica sem parecer:**
- **Ar-condicionado e ventilador ressecam** — planta na corrente direta sofre.
- Corrente de ar frio, sobretudo à noite, derruba folha e botão floral.
- Vidro fechado no verão vira estufa: o calor sobe muito mais do que parece.
- Cortina fina (voil) filtra o sol forte sem escurecer — resolve janela oeste.
- Planta encostada em parede que pega sol da tarde recebe calor por trás.

## Poda e limpeza
- Folha morta ou seca pode sair — não alimenta a planta e abriga praga.
- **Ferramenta limpa e afiada.** Tesoura suja transmite doença de uma planta a outra.
- Corte rente, sem deixar toco: toco apodrece e vira porta de entrada.
- Folha empoeirada faz menos fotossíntese: pano úmido resolve.
- Nunca remova muito de uma vez: a planta precisa de folha para se recuperar.

## Transplante
- Sinais de que chegou a hora: raiz saindo pelo furo, água que não penetra mais,
  crescimento parado com todo o resto certo.
- Melhor época é o começo da estação de crescimento, não em plena floração.
- Depois do transplante a planta fica em choque por dias: água moderada, sombra
  luminosa e **nada de forçar nutrição** até firmar.

## Quando NÃO é hora de adubar
Os produtos PlantaeFert são orgânicos e seguros desde a primeira aplicação — mas
adubar nunca substitui corrigir a causa.
- **Nunca em substrato seco:** regue antes, senão o produto concentra junto à raiz.
- Recém-transplantada: espere firmar.
- Sob sol forte: aplique no início da manhã ou no fim da tarde.
- Se o problema é luz, rega, vaso ou praga, **adubo não resolve** — corrija a causa
  e nutra junto.
- Mais adubo não acelera nada. Excesso queima raiz e desequilibra o substrato.

## Diagnóstico diferencial — os sinais que enganam
- **Folha murcha = excesso OU falta de água.** Raiz apodrecida não absorve, então a
  planta murcha com o substrato ENCHARCADO. Cheque o substrato antes de concluir.
- **Folha amarela — o que importa é ONDE:** folha velha de baixo, uma a uma, é
  senescência natural; folhas NOVAS amarelas indicam falta de nutriente ou luz;
  amarelo geral com substrato úmido aponta excesso de água.
- **Manchas:** fúngica tem borda definida e halo, e avança com umidade; queimadura
  de sol aparece só na face exposta e não avança; bacteriana é encharcada, mole e
  pode ter cheiro.
- **Pragas:** algodão branco nas juntas = cochonilha; aglomerado em broto novo =
  pulgão; teia fina com pontinhos = ácaro. Sempre olhe o VERSO da folha.
- Crosta branca no substrato ou borda de folha queimada sugere excesso de sal ou
  adubação em excesso — não falta.

## Mitos que circulam — corrija com gentileza, sem constranger
- Pedras no fundo do vaso melhoram a drenagem: **não melhoram**.
- Borra de café e casca de ovo substituem adubo: são matéria orgânica pontual,
  não nutrição completa.
- Regar todo dia no mesmo horário é cuidar bem: é o caminho mais rápido para
  apodrecer raiz.
- Canela, alho ou detergente resolvem qualquer praga ou fungo: não resolvem, e
  detergente queima folha.
- Planta amarela é sempre falta de adubo: muitas vezes é água ou luz.`;

/**
 * Ficha por família. Injetada só quando a planta em questão é daquela família —
 * profundidade onde importa, sem peso onde não importa.
 *
 * O formato é sempre o mesmo (ama / não tolera / erro comum / o porquê) porque
 * o "porquê" é o que permite a IA generalizar para situações que não estão aqui.
 */
export const FICHAS: Record<string, string> = {
  orquidea: `# Ficha: orquídeas (Phalaenopsis e afins)
**Ama:** luz clara indireta, ar circulando na raiz, substrato que seca entre regas.
**Não tolera:** raiz encharcada, terra comum, sol direto na folha, água acumulada
no centro da planta (apodrece a coroa).
**Erro mais comum:** regar no calendário e manter o vaso em prato com água.
**O porquê:** na natureza ela é epífita — vive presa em tronco de árvore, com a
raiz exposta ao ar e à chuva que escorre rápido. Toda a raiz é feita para molhar
e secar, não para ficar submersa. Isso explica o substrato de casca e o furo.
**Ler a raiz:** VERDE = hidratada; PRATEADA = seca, pode regar; MARROM E MOLE =
morta, remover. **Raiz aérea é sinal de saúde — não corte.**
**Haste floral × raiz aérea** (a dúvida mais comum): a haste nasce entre as folhas,
é mais fina e a ponta lembra uma luva achatada; a raiz aérea nasce do caule na
base, é cilíndrica, de ponta arredondada e mais clara.
**Dentro de casa:** janela leste (sol da manhã) é o lugar ideal; a oeste só com
cortina fina. Longe de ar-condicionado, que resseca a raiz aérea.
**Depois da floração:** não corte a haste ainda verde — ela pode florir de novo.
Segue um período de repouso: menos água, não abandono.`,

  suculenta: `# Ficha: suculentas
**Ama:** muita luz, substrato arenoso, secar completamente entre regas.
**Não tolera:** excesso de água, vaso sem furo, sombra.
**Erro mais comum:** regar com frequência "porque murchou" — em suculenta, murcha
mole e translúcida costuma ser água DEMAIS, não de menos.
**O porquê:** ela armazena água na própria folha. Já vem com reserva, então o
excesso não tem para onde ir e apodrece de dentro.
**Dentro de casa:** só janela norte, e o mais colada possível ao vidro. Suculenta a
um metro da janela estiola em semanas — é a planta que mais sofre com "quase luz".
**Sinais:** folha murcha e seca na base é normal (envelhecimento). Apodrecimento
translúcido subindo pelo caule é excesso de água — quase sempre irreversível se
alcançar o caule. Caule esticado com folhas espaçadas é falta de luz.`,

  cacto: `# Ficha: cactos
**Ama:** sol, calor e substrato que seca rápido.
**Não tolera:** rega no frio, substrato pesado, umidade parada na base.
**Erro mais comum:** manter a rega no inverno.
**O porquê:** no frio ele entra em dormência e praticamente para de consumir água.
Regar nessa fase é encher um recipiente que não esvazia — e a base apodrece.
**Dentro de casa:** exige janela norte com sol direto. Sem isso, não é questão de
adaptar — ele definha devagar.
**Sinais:** amolecimento marrom na base é apodrecimento avançado. Crescimento fino
e pálido no topo é falta de luz.`,

  samambaia: `# Ficha: samambaias e folhagens
**Ama:** sombra luminosa, ar úmido, substrato constantemente úmido (não encharcado).
**Não tolera:** sol direto, ar seco de ar-condicionado, secar por completo.
**Erro mais comum:** achar que borrifar a folha resolve o ar seco — o efeito dura
minutos. O que muda é agrupar plantas, afastar do ar-condicionado e manter o
substrato úmido.
**O porquê:** vêm do sub-bosque de floresta, onde a luz chega filtrada e o ar é
naturalmente úmido. Reproduzir esse ambiente é o cuidado inteiro.
**Dentro de casa:** é a que melhor aproveita janela sul e cantos mais afastados.
Banheiro com janela é excelente. Longe do ar-condicionado.
**Sinais:** pontas secas e marrons apontam ar seco ou falta de água.`,

  frutifera: `# Ficha: frutíferas
**Ama:** sol pleno, adubação que acompanha a fase, poda de formação.
**Não tolera:** encharcamento na raiz, adubação nitrogenada durante a floração.
**Erro mais comum:** adubar sempre igual o ano todo.
**O porquê:** a planta muda de necessidade conforme a fase — vegetativo, floração,
frutificação e colheita. Nitrogênio em excesso na floração empurra folha e a
planta abandona a fruta.
**Dentro de casa:** raramente funciona — precisa de sol pleno. Varanda voltada ao
norte é o mínimo viável.
**Em vaso:** exige vaso grande, rega mais frequente e poda regular; a raiz confinada
limita o porte e a produção.`,

  gramado: `# Ficha: gramados
**Ama:** corte regular na altura certa, adubação de cobertura, sol.
**Não tolera:** corte drástico, solo compactado, encharcamento.
**Erro mais comum:** deixar crescer muito e cortar baixo de uma vez.
**O porquê:** removendo mais de um terço da altura de uma vez, a grama perde área
de fotossíntese, amarela e abre espaço para invasora. **Nunca mais de 1/3 por corte.**
**Medida:** aqui a dose é por ÁREA (por m²), não por vaso.
**Sinais:** falhas em mancha podem ser fungo, praga de solo ou compactação — pisoteio
constante compacta e sufoca a raiz.`,

  rosa_do_deserto: `# Ficha: rosa do deserto (Adenium)
**Ama:** sol direto, substrato muito drenante, secar entre regas.
**Não tolera:** água acumulada no caudex (a base engrossada), frio com substrato
úmido, vaso sem furo.
**Erro mais comum:** regar demais achando que a base murchando é sede.
**O porquê:** o caudex é reserva de água. Ele murcha um pouco na seca e volta — é
o funcionamento normal. Apodrecimento começa justamente ali quando há excesso.
**Dentro de casa:** janela norte, o mais perto possível do vidro. Precisa de sol
direto para florir.
**Sinais:** base amolecida ou escura é apodrecimento e pede ação imediata. Perda de
folha no frio é normal, não doença.`,

  jiboia: `# Ficha: jiboia (Epipremnum aureum)
**Ama:** luz clara indireta, secar um pouco entre regas, algo para trepar ou de onde pender.
**Não tolera:** substrato encharcado, sol direto forte.
**Erro mais comum:** regar mais quando a folha amarela — em jiboia, amarelo costuma ser
água DEMAIS, não de menos.
**O porquê:** é trepadeira de floresta tropical: sobe em tronco atrás da luz e vive num
chão que molha e escorre. Por isso aguenta sombra e não aguenta pé n'água.
**Dentro de casa:** a mais tolerante de todas — funciona longe da janela, em canto com
claridade. Quanto menos luz, mais lisa e verde a folha fica.
**Sinais:** variegação sumindo (folha ficando toda verde) é falta de luz; caule comprido
com folhas espaçadas, idem. Ponta marrom seca é ar seco.
**Atenção:** tóxica se ingerida — vale saber em casa com pet ou criança pequena.`,

  espada_sao_jorge: `# Ficha: espada de São Jorge (Dracaena trifasciata)
**Ama:** ser esquecida. Qualquer nível de luz, substrato secando por completo.
**Não tolera:** excesso de água e frio com substrato úmido.
**Erro mais comum:** regar como se fosse planta comum. Ela morre muito mais por água que
por descuido.
**O porquê:** é suculenta de folha, africana, adaptada a seca longa — guarda água na
própria folha. Regar semanalmente é encher um reservatório que já está cheio.
**Dentro de casa:** vai bem até em canto escuro, só cresce mais devagar. Aceita janela
norte também.
**Sinais:** folha amolecendo e caindo pela BASE é apodrecimento por água. Ponta seca
isolada é normal. No frio, espace ainda mais a rega.`,

  costela_adao: `# Ficha: costela de Adão (Monstera deliciosa)
**Ama:** luz indireta forte, ar úmido, um tutor para subir.
**Não tolera:** sol direto na folha, substrato encharcado.
**Erro mais comum:** achar que folha sem recorte é falta de adubo — quase sempre é falta
de luz ou planta ainda jovem.
**O porquê:** os furos e recortes não são enfeite: deixam a luz passar para as folhas de
baixo e a chuva e o vento atravessarem sem rasgar a folha, lá no alto da floresta. Folha
nova em luz fraca sai inteira porque não vale o investimento.
**Dentro de casa:** perto de janela com luz filtrada — cortina fina resolve. Longe do sol
da tarde.
**Sinais:** pontas e bordas marrons secas indicam ar seco; folha amarela em várias ao
mesmo tempo, com substrato úmido, é excesso de água. Raiz aérea é normal — pode guiar
para o tutor ou para o vaso, não precisa cortar.
**Atenção:** tóxica se ingerida.`,

  anturio: `# Ficha: antúrio (Anthurium)
**Ama:** luz indireta clara, ar úmido, substrato aerado que não empapa.
**Não tolera:** sol direto, água parada no prato, frio.
**Erro mais comum:** tratar como planta de terra comum — a raiz sufoca. E regar no centro
da planta, que apodrece a base.
**O porquê:** na natureza cresce agarrado a tronco, com raiz exposta ao ar, como a
orquídea. Quer substrato solto, não terra compactada.
**Curiosidade que explica o cuidado:** aquele "coração vermelho" não é flor, é uma folha
modificada (espata) — a flor de verdade é a espiga do meio. Por isso ele dura semanas:
manter uma folha colorida custa menos que manter uma flor.
**Dentro de casa:** luz indireta boa. Banheiro com janela é excelente pela umidade.
**Sinais:** folhas amarelas = excesso de água; não florir = pouca luz; pontas marrons = ar seco.`,

  lirio_da_paz: `# Ficha: lírio-da-paz (Spathiphyllum)
**Ama:** sombra luminosa, substrato levemente úmido, ar úmido.
**Não tolera:** sol direto, secar por completo, água muito dura.
**Erro mais comum:** entrar em pânico quando ele murcha — e passar a regar demais.
**O porquê:** é a planta que avisa. Ela murcha de forma dramática quando tem sede e volta
ao normal em poucas horas depois de regada. Use isso como relógio, não como emergência:
regue quando começar a bambear, e você quase nunca vai errar.
**Dentro de casa:** aguenta cantos de pouca luz, mas só floresce com boa claridade
indireta. Se não floresce, o problema quase sempre é luz.
**Sinais:** pontas marrons secas costumam ser ar seco ou sensibilidade ao cloro da água —
deixar a água descansar algumas horas ajuda.
**Atenção:** tóxica se ingerida.`,

  zamioculca: `# Ficha: zamioculca (Zamioculcas zamiifolia)
**Ama:** abandono, pouca luz, substrato secando por inteiro.
**Não tolera:** rega frequente. É a causa quase única de morte dela.
**Erro mais comum:** regar toda semana.
**O porquê:** tem um rizoma grosso embaixo da terra que é um tanque de água, e vem de
região africana com seca sazonal. Ela foi feita para atravessar meses secos — o que ela
não sabe fazer é lidar com água constante.
**Dentro de casa:** praticamente qualquer lugar, inclusive baixa luz. Cresce devagar, e
isso é normal, não é doença.
**Sinais:** caule amarelando e amolecendo pela base é o rizoma apodrecendo — pare a rega
imediatamente e verifique. Folha caindo amarela uma a uma, devagar, pode ser só idade.
**Atenção:** tóxica se ingerida.`,

  begonia: `# Ficha: begônias
**Ama:** luz indireta, ar úmido, substrato leve que drena bem.
**Não tolera:** folha molhada, sol direto, encharcamento.
**Erro mais comum:** borrifar as folhas para "umidificar". Em begônia isso é convite a fungo.
**O porquê:** muitas begônias têm folha aveludada, com pelos finos que seguram a gota
d'água. A água parada na superfície da folha vira porta de entrada para fungo.
Para umidade, aumente a do AR — agrupando plantas ou com um prato de água por perto —,
nunca molhando a folha.
**Dentro de casa:** janela leste ou sul, com claridade e sem sol direto.
**Sinais:** pó branco-acinzentado nas folhas é oídio, o fungo mais comum nelas — melhore a
ventilação e não molhe as folhas.`,

  violeta: `# Ficha: violeta africana (Saintpaulia)
**Ama:** luz clara indireta, temperatura estável, rega por baixo.
**Não tolera:** água na folha, sol direto, frio.
**Erro mais comum:** regar por cima. Aparecem manchas claras e a folha apodrece.
**O porquê:** a folha é coberta de pelinhos que prendem a gota. A gota funciona como lente
sob a luz e queima, e a água parada entre os pelos apodrece.
**Como regar:** coloque a água no pratinho e deixe ela puxar pela raiz por uns 20 minutos;
depois descarte o que sobrou.
**Dentro de casa:** perto de janela clara, sem sol batendo. É a planta que mais gosta de
luz constante e local fixo.
**Sinais:** não florir quase sempre é pouca luz; manchas claras na folha são água fria ou
sol direto.`,

  bromelia: `# Ficha: bromélias
**Ama:** luz indireta clara, água no copo central, substrato apenas úmido.
**Não tolera:** substrato encharcado, sol forte direto.
**Erro mais comum:** regar só a terra, como planta comum — e assustar-se quando a planta
morre depois de florir.
**O porquê:** a roseta de folhas forma um copo que é o reservatório dela; na natureza vive
presa em árvore e bebe da chuva que se acumula ali. Mantenha o copo com água limpa e
renove de vez em quando para não virar criadouro de mosquito.
**Curiosidade que explica o cuidado:** a bromélia floresce UMA vez e depois a roseta-mãe
morre devagar — isso é o ciclo normal, não doença. Antes de morrer ela produz filhotes na
base; separe-os quando estiverem com cerca de um terço do tamanho da mãe.
**Dentro de casa:** luz clara indireta, longe do sol direto.`,
};

/** Palavras que identificam a família a partir do que a pessoa escreveu. */
const PISTAS: [string, RegExp][] = [
  ["orquidea", /orqu[ií]dea|phalaenopsis|cattleya|dendrobium|oncidium|vanda/i],
  ["rosa_do_deserto", /rosa[- ]do[- ]deserto|adenium/i],
  ["cacto", /cacto|cactus|mandacaru/i],
  ["suculenta", /suculenta|echeveria|jade|crassula|sedum/i],
  ["samambaia", /samambaia|avenca|peperomia|maranta|pacov[áa]|folhagem/i],
  ["frutifera", /frut[ií]fera|limoeiro|lim[ãa]o|laranj|abacate|goiab|manga|maracuj|acerola|pitaia|romã|roma\b/i],
  ["gramado", /gramado|grama\b|esmeralda|s[ãa]o carlos|zoysia/i],
  ["espada_sao_jorge", /espada[- ]de[- ]s[ãa]o[- ]jorge|lan[çc]a[- ]de[- ]s[ãa]o[- ]jorge|sansevieria|dracaena trifasciata/i],
  ["costela_adao", /costela[- ]de[- ]ad[ãa]o|monstera/i],
  ["anturio", /ant[úu]rio|anthurium/i],
  ["lirio_da_paz", /l[íi]rio[- ]da[- ]paz|spathiphyllum|espatifilo/i],
  ["zamioculca", /zamioculca|zamioculcas|zz\b/i],
  ["begonia", /beg[ôo]nia|begonia/i],
  ["violeta", /violeta|saintpaulia/i],
  ["bromelia", /brom[ée]lia|guzmania|neoregelia/i],
  ["jiboia", /jib[óo]ia|jiboia|epipremnum|pothos/i],
];

/**
 * Devolve a ficha da família a partir da espécie/apelido informado.
 * Sem correspondência, devolve string vazia — não force uma ficha errada:
 * dizer "sua orquídea" para quem tem uma samambaia é pior que não dizer nada.
 */
export function fichaDaEspecie(...textos: (string | null | undefined)[]): string {
  const alvo = textos.filter(Boolean).join(" ");
  if (!alvo.trim()) return "";
  for (const [chave, padrao] of PISTAS) {
    if (padrao.test(alvo)) return FICHAS[chave] ?? "";
  }
  return "";
}

/** Chaves válidas de família — a identificação por foto devolve uma destas
 *  para fazer a ponte com a ficha correspondente. */
export const FAMILIAS = Object.keys(FICHAS);

/** Ficha a partir da chave de família (ex.: a que a identificação devolveu). */
export function fichaDaFamilia(familia?: string | null): string {
  return familia ? (FICHAS[familia] ?? "") : "";
}
