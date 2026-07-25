## Plano de correção: falha na análise por foto

### Evidência confirmada
- O navegador registrou um `POST /api/diagnose-photo` com status `422` em `2026-07-25T02:56:44Z`.
- A resposta foi `schema_mismatch` com a mensagem de que a IA não conseguiu estruturar o diagnóstico.
- Os logs do AI Gateway não mostraram chamadas recentes no período consultado, então o primeiro passo da implementação será reproduzir no ambiente atual para separar erro de rota/app de erro real do modelo.

### Objetivo
Garantir que o diagnóstico por foto nunca termine na tela genérica de “Falha na análise” quando houver foto válida. Se a IA ou o schema falhar, o app deve entregar um diagnóstico preliminar seguro, com baixa confiança, instruções úteis e opção de refazer.

### Implementação proposta

1. **Reproduzir o fluxo completo antes de editar**
   - Testar `/app/diagnostico?direct=camera` no preview local.
   - Enviar uma imagem de teste pelo endpoint `/api/diagnose-photo`.
   - Capturar status HTTP, payload de resposta e logs do servidor.

2. **Blindar a API `/api/diagnose-photo`**
   - Fazer a rota sempre retornar `200` com um objeto `Diagnosis` válido quando houver foto enviada, mesmo em erro de schema, validação, timeout ou falha do modelo.
   - Reservar erro HTTP real apenas para casos sem chave de IA, JSON inválido ou falha estrutural impossível de recuperar.
   - Adicionar uma função pequena de fallback tipado para evitar duplicação e garantir compatibilidade com `src/lib/types.ts`.

3. **Reduzir falhas do `generateObject`**
   - Ajustar o schema Zod para ser mais tolerante em listas e campos opcionais controlados.
   - Normalizar a resposta antes de enviar ao frontend: listas vazias recebem itens úteis padrão, `reevaluateInDays` fica sempre entre 3 e 14, confiança/status ficam sempre em enums válidos.

4. **Adicionar fallback também no cliente**
   - Em `diagnosisService.analyze`, se `/api/diagnose-photo` retornar `schema_mismatch`, `generation_failed`, `422` ou `500`, converter isso em diagnóstico preliminar em vez de lançar erro fatal.
   - A tela de erro ficará apenas para falha de rede real ou resposta completamente ilegível.

5. **Validar histórico e UI**
   - Confirmar que o diagnóstico fallback aparece em `DiagnosisResult`.
   - Confirmar que ele é salvo no histórico local com miniatura e pode ser refeito.
   - Confirmar que a foto capturada continua chegando na etapa “Fotos guiadas”.

6. **Teste completo final**
   - Testar endpoint com uma imagem base64 válida.
   - Testar fluxo visual no navegador do início até o resultado.
   - Verificar ausência da tela “Falha na análise” no caso de `schema_mismatch`.
   - Verificar console, rede e logs do servidor após o teste.

### Arquivos previstos
- `src/routes/api/diagnose-photo.ts`
- `src/lib/services.ts`
- Se necessário para teste/UX: `src/routes/app.diagnostico.tsx`

### Critério de aceite
- Ao enviar uma foto válida, o usuário sempre chega a uma tela de resultado.
- Erros de schema/modelo viram diagnóstico preliminar com confiança baixa, não uma falha bloqueante.
- O histórico local recebe o resultado.
- O teste completo confirma endpoint, UI, rede e logs sem `422 schema_mismatch` visível para o usuário.