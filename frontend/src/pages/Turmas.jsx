// ============================================================
// Página de Turmas: listagem, criar, editar e apagar
// (criar, editar e apagar só para ADMIN e SECRETARIA).
// ============================================================
import { useEffect, useState } from "react";
import { api } from "../services/api.js";
import { useAuth } from "../hooks/useAuth.js";
import Modal from "../components/Modal.jsx";
import TurmaFormulario from "../components/TurmaFormulario.jsx";
import ConfirmarRemocao from "../components/ConfirmarRemocao.jsx";

export default function Turmas() {
  const { utilizador } = useAuth();
  const podeGerir = ["ADMIN", "SECRETARIA"].includes(utilizador.papel);

  // --- Dados vindos da API ---
  const [turmas, setTurmas] = useState(null); // null = ainda a carregar
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [versao, setVersao] = useState(0); // aumenta para forçar nova leitura

  // --- Janelas ---
  const [formulario, setFormulario] = useState(null); // null = fechada, { turma } = aberta
  const [aApagar, setAApagar] = useState(null);
  const [erroApagar, setErroApagar] = useState("");
  const [aApagarEmCurso, setAApagarEmCurso] = useState(false);

  // Carrega a lista ao abrir a página e sempre que a "versão" muda
  useEffect(() => {
    let activo = true;

    api
      .get("/turmas")
      .then((resposta) => {
        if (!activo) return;
        setTurmas(resposta);
        setErro("");
      })
      .catch((e) => activo && setErro(e.message));

    return () => {
      activo = false;
    };
  }, [versao]);

  async function guardar(dados) {
    const aEditar = Boolean(formulario.turma);

    if (aEditar) {
      await api.put(`/turmas/${formulario.turma.id}`, dados);
    } else {
      await api.post("/turmas", dados);
    }

    setAviso(aEditar ? "Turma actualizada com sucesso." : "Turma criada com sucesso.");
    setFormulario(null);
    setVersao((v) => v + 1);
  }

  async function confirmarApagar() {
    setErroApagar("");
    setAApagarEmCurso(true);

    try {
      await api.delete(`/turmas/${aApagar.id}`);
      setAviso(`Turma "${aApagar.nome}" apagada.`);
      setAApagar(null);
      setVersao((v) => v + 1);
    } catch (e) {
      // Ex.: "Não é possível apagar: a turma ainda tem alunos"
      setErroApagar(e.message);
    } finally {
      setAApagarEmCurso(false);
    }
  }

  function abrirFormulario(turma) {
    setAviso("");
    setFormulario({ turma });
  }

  function pedirApagar(turma) {
    setAviso("");
    setErroApagar("");
    setAApagar(turma);
  }

  return (
    <>
      <div className="cabecalho-pagina">
        <h1>Turmas</h1>
        {podeGerir && (
          <button type="button" className="botao" onClick={() => abrirFormulario(null)}>
            Nova turma
          </button>
        )}
      </div>

      {aviso && (
        <p className="mensagem-sucesso" role="status">
          {aviso}
        </p>
      )}
      {erro && (
        <p className="mensagem-erro" role="alert">
          {erro}
        </p>
      )}

      {!turmas && !erro && <p className="carregando">A carregar...</p>}

      {turmas && (
        <section className="tabela-cartao">
          {turmas.length === 0 ? (
            <p className="vazio">Ainda não há turmas registadas.</p>
          ) : (
            <table className="tabela">
              <thead>
                <tr>
                  <th>Turma</th>
                  <th>Ano lectivo</th>
                  <th>Alunos</th>
                  {podeGerir && <th>Acções</th>}
                </tr>
              </thead>
              <tbody>
                {turmas.map((turma) => (
                  <tr key={turma.id}>
                    <td>{turma.nome}</td>
                    <td>{turma.anoLectivo}</td>
                    <td>{turma._count.alunos}</td>
                    {podeGerir && (
                      <td className="tabela__acoes">
                        <button
                          type="button"
                          className="botao botao--secundario botao--pequeno"
                          aria-label={`Editar ${turma.nome}`}
                          onClick={() => abrirFormulario(turma)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="botao botao--perigo botao--pequeno"
                          aria-label={`Apagar ${turma.nome}`}
                          onClick={() => pedirApagar(turma)}
                        >
                          Apagar
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}

      {/* ----- Janela: criar / editar ----- */}
      <Modal
        aberto={Boolean(formulario)}
        titulo={formulario?.turma ? "Editar turma" : "Nova turma"}
        onFechar={() => setFormulario(null)}
      >
        {formulario && (
          <TurmaFormulario
            turma={formulario.turma}
            onSubmeter={guardar}
            onCancelar={() => setFormulario(null)}
          />
        )}
      </Modal>

      {/* ----- Janela: confirmar remoção ----- */}
      <ConfirmarRemocao
        aberto={Boolean(aApagar)}
        titulo="Apagar turma"
        nome={aApagar?.nome}
        detalhe="Só é possível apagar turmas sem alunos."
        erro={erroApagar}
        aApagar={aApagarEmCurso}
        onConfirmar={confirmarApagar}
        onCancelar={() => setAApagar(null)}
      />
    </>
  );
}
