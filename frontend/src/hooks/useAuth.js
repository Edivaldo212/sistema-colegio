// ============================================================
// Atalho para qualquer componente consultar a autenticação:
//   const { utilizador, entrar, sair } = useAuth();
// ============================================================
import { useContext } from "react";
import { AuthContext } from "../contexts/auth-context.js";

export function useAuth() {
  const contexto = useContext(AuthContext);

  if (!contexto) {
    throw new Error("useAuth tem de ser usado dentro de <AuthProvider>");
  }

  return contexto;
}
