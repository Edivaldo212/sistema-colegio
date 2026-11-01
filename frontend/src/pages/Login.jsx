// ============================================================
// Página de login: envia email e palavra-passe à API.
// ============================================================
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

export default function Login() {
  const { utilizador, entrar } = useAuth();

  // Estado do formulário (cada useState guarda um valor que pode mudar)
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [aEnviar, setAEnviar] = useState(false);

  // Se já está autenticado, não faz sentido ver o login
  if (utilizador) return <Navigate to="/" replace />;

  async function aoSubmeter(evento) {
    evento.preventDefault(); // impede o browser de recarregar a página
    setErro("");
    setAEnviar(true);

    try {
      await entrar(email, senha);
      // Ao entrar, o utilizador fica definido e o <Navigate> acima leva-o ao painel
    } catch (e) {
      setErro(e.message);
    } finally {
      setAEnviar(false);
    }
  }

  return (
    <main className="login">
      <section className="login__cartao">
        <h1 className="login__titulo">Sistema Escolar</h1>
        <p className="login__subtitulo">Entra com a tua conta para continuar</p>

        <form className="login__form" onSubmit={aoSubmeter}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="exemplo@colegio.ao"
            autoComplete="username"
            required
          />

          <label htmlFor="senha">Palavra-passe</label>
          <input
            type="password"
            id="senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />

          {erro && <p className="mensagem-erro" role="alert">{erro}</p>}

          <button type="submit" disabled={aEnviar}>
            {aEnviar ? "A entrar..." : "Entrar"}
          </button>
        </form>
      </section>
    </main>
  );
}