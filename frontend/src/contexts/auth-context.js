// ============================================================
// Criação do contexto de autenticação (a "caixa" partilhada).
// O conteúdo é preenchido pelo AuthProvider.
// ============================================================
import { createContext } from "react";

export const AuthContext = createContext(null);