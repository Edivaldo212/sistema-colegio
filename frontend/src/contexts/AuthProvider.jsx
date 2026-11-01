// ============================================================
// Guarda quem está autenticado e fornece entrar() e sair()
// a toda a aplicação.
// ============================================================
import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthContext } from "./auth-context.js";
import { api, guardarToken, lerToken, limparToken } from "../services/api.js";

export default function AuthProvider({ children }) {
  const [utilizador, setUtilizador] = useState(null);
  // Se há token guardado, ficamos "a carregar" até o validar no servidor
  const [carregando, setCarregando] = useState(Boolean(lerToken()));

  const sair = useCallback(() => {
    limparToken();
    setUtilizador(null);
  }, []);

  const entrar = useCallback(async (email, senha) => {
    const resposta = await api.post("/auth/login", { email, senha });
    guardarToken(resposta.token);
    setUtilizador(resposta.utilizador);
  }, []);

  // Ao abrir a aplicação: se há token, confirma-o e obtém o utilizador
  useEffect(() => {
    if (!lerToken()) return;

    api
      .get("/auth/perfil")
      .then(setUtilizador)
      .catch(() => {}) // se o token for inválido, a api.js já avisa a sessão a terminar
      .finally(() => setCarregando(false));
  }, []);

  // Se o servidor disser que o token expirou, termina a sessão
  useEffect(() => {
    window.addEventListener("sessao-expirada", sair);
    return () => window.removeEventListener("sessao-expirada", sair);
  }, [sair]);

  const valor = useMemo(
    () => ({ utilizador, carregando, entrar, sair }),
    [utilizador, carregando, entrar, sair]
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}
