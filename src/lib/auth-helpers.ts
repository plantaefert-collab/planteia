// Mensagens de erro de autenticação em português claro.
// O Supabase devolve mensagens técnicas em inglês; aqui traduzimos para algo
// que o usuário entenda e saiba o que fazer.
import { supabase } from "@/integrations/supabase/client";

export function traduzErroAuth(err: unknown): string {
  const msg = (err instanceof Error ? err.message : String(err ?? "")).toLowerCase();

  if (msg.includes("invalid login credentials")) {
    return "E-mail ou senha incorretos. Confira e tente de novo.";
  }
  if (msg.includes("email not confirmed")) {
    return "Esta conta ainda não foi confirmada. Fale com o suporte.";
  }
  if (msg.includes("user already registered") || msg.includes("already been registered")) {
    return "Já existe uma conta com este e-mail. Tente entrar.";
  }
  if (msg.includes("password") && msg.includes("weak")) {
    return "Senha muito fraca. Use letras maiúsculas, minúsculas e números.";
  }
  if (msg.includes("pwned") || msg.includes("compromised")) {
    return "Essa senha já apareceu em vazamentos. Escolha outra, mais difícil.";
  }
  if (msg.includes("should be at least") || msg.includes("password should")) {
    return "A senha precisa ter no mínimo 6 caracteres, com maiúscula, minúscula e número.";
  }
  if (msg.includes("rate limit") || msg.includes("too many")) {
    return "Muitas tentativas seguidas. Aguarde um instante e tente de novo.";
  }
  if (msg.includes("invalid email")) {
    return "E-mail inválido. Verifique se está escrito corretamente.";
  }
  if (msg.includes("network") || msg.includes("fetch")) {
    return "Sem conexão com o servidor. Verifique sua internet.";
  }
  return "Não consegui concluir agora. Tente novamente em instantes.";
}

/**
 * Descobre para onde mandar o usuário depois de autenticar:
 * quem ainda não respondeu as boas-vindas (perfil sem `level`) vai para o
 * onboarding; os demais vão direto para o app.
 */
export async function destinoPosLogin(): Promise<"/onboarding" | "/app/inicio"> {
  try {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return "/app/inicio";

    const { data: perfil } = await supabase
      .from("profiles")
      .select("level")
      .eq("id", auth.user.id)
      .maybeSingle();

    return perfil?.level ? "/app/inicio" : "/onboarding";
  } catch {
    return "/app/inicio";
  }
}
