// ============================================================
// Estrutura comum às páginas autenticadas:
// menu lateral + barra do topo + conteúdo da página.
// ============================================================
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

// Nomes amigáveis para os perfis vindos da API
const ROTULOS_PAPEL = {
  ADMIN: "Administrador",
  PROFESSOR: "Professor",
  SECRETARIA: "Secretaria",
};

// NavLink sabe se a rota está activa e deixa-nos mudar a classe
const classeLink = ({ isActive }) =>
  isActive ? "menu__link menu__link--ativo" : "menu__link";

export default function Layout() {
  const { utilizador, sair } = useAuth();

  return (
    <div className="layout">
      <aside className="menu">
        <h2 className="menu__logo">Sistema Escolar</h2>
        <nav>
          <ul className="menu__lista">
            <li><NavLink to="/" end className={classeLink}>Painel</NavLink></li>
            <li><NavLink to="/alunos" className={classeLink}>Alunos</NavLink></li>
            <li><NavLink to="/turmas" className={classeLink}>Turmas</NavLink></li>
            <li><NavLink to="/disciplinas" className={classeLink}>Disciplinas</NavLink></li>
            <li><NavLink to="/notas" className={classeLink}>Notas</NavLink></li>
          </ul>
        </nav>
      </aside>

      <div className="conteudo">
        <header className="topo">
          <span className="topo__papel">{ROTULOS_PAPEL[utilizador.papel]}</span>
          <div className="topo__utilizador">
            <span>Olá, {utilizador.nome}</span>
            <button type="button" className="botao-sair" onClick={sair}>
              Sair
            </button>
          </div>
        </header>

        <main className="principal">
          <Outlet />
        </main>
      </div>
    </div>
  );
}