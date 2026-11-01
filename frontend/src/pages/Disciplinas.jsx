// ============================================================
// Página de Disciplinas: listagem, criar, editar e apagar
// (criar, editar e apagar só para ADMIN e SECRETARIA).
// ============================================================
import { useEffect, useState } from "react";
import { api } from "../services/api.js";
import { useAuth } from "../hooks/useAuth.js";
import Modal from "../components/Modal.jsx";
import DisciplinaFormulario from "../components/DisciplinaFormulario.jsx";
import ConfirmarRemocao from "../components/ConfirmarRemocao.jsx";

export default function Disciplinas() {
  const { utilizador } = useAuth();
  const podeGerir = ["ADMIN", "SECRETARIA"].includes(utilizador.papel);

  // --- Dados vindos da API ---
  const [disciplinas, setDisciplinas] = useState(null);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [versao, setVersao] = useState(0);

  // --- Janelas ---
  const [formulario, setFormulario] = useState(null);
  const [aApagar, setAApagar] = useState(null);
  const [erroApagar, setErroApagar] = useState("");
  const [aApagarEmCurso, setAApagarEmCurso] = useState(false);

  useEffect(() => {
    let activo = true;

    api
      .get("/disciplinas")
      .then((resposta) => {
        if (!activo) return;
        setDisciplinas(resposta);
        setErro("");
      })
      .catch((e) => activo && setErro(e.message));

    return () => {
      activo = false;
    };
  }, [versao]);

  async function guardar(dados) {
    const aEditar = Boolean(formulario.disciplina);

    if (aEditar) {
      await api.put(`/disciplinas/${formulario.disciplina.id}`, dados);
    } else {
      await api.post("/disciplinas", dados);
    }

    setAviso(aEditar ? "Disciplina actualizada com sucesso." : "Disciplina criada com sucesso.");
    setFormulario(null);
    setVersao((v) => v + 1);
  }

  async function confirmarApagar() {
    setErroApagar("");
    setAApagarEmCurso(true);

    try {
      await api.delete(`/disciplinas/${aApagar.id}`);
      setAviso(`Disciplina "${aApagar.nome}" apagada.`);
      setAApagar(null);
      setVersao((v) => v + 1);
    } catch (e) {
      // Se já há notas lançadas nesta disciplina, a API recusa e explica porquê
      setErroApagar(e.message);
    } finally {
      setAApagarEmCurso(false);
    }
  }

  function abrirFormulario(disciplina) {
    setAviso("");
    setFormulario({ disciplina });
  }

  function pedirApagar(disciplina) {
    setAviso("");
    setErroApagar("");
    setAApagar(disciplina);
  }

  return (
    <>
      <div className="cabecalho-pagina">
        <h1>Disciplinas</h1>
        {podeGerir && (
          <button type="button" className="botao" onClick={() => abrirFormulario(null)}>
            Nova disciplina
          </button>
        )}
      </div>

      {aviso && <p className="mensagem-sucesso" role="status">{aviso}</p>}
      {erro && <p className="mensagem-erro" role="alert">{erro}</p>}

      {!disciplinas && !erro && <p className="carregando">A carregar...</p>}

      {disciplinas && (
        <section className="tabela-cartao">
          {disciplinas.length === 0 ? (
            <p className="vazio">Ainda não há disciplinas registadas.</p>
          ) : (
            <table className="tabela">
              <thead>
                <tr>
                  <th>Disciplina</th>
                  {podeGerir && <th>Acções</th>}
                </tr>
              </thead>
              <tbody>
                {disciplinas.map((disciplina) => (
                  <tr key={disciplina.id}>
                    <td>{disciplina.nome}</td>
                    {podeGerir && (
                      <td className="tabela__acoes">
                        <button
                          type="button"
                          className="botao botao--secundario botao--pequeno"
                          aria-label={`Editar ${disciplina.nome}`}
                          onClick={() => abrirFormulario(disciplina)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="botao botao--perigo botao--pequeno"
                          aria-label={`Apagar ${disciplina.nome}`}
                          onClick={() => pedirApagar(disciplina)}
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
        titulo={formulario?.disciplina ? "Editar disciplina" : "Nova disciplina"}
        onFechar={() => setFormulario(null)}
      >
        {formulario && (
          <DisciplinaFormulario
            disciplina={formulario.disciplina}
            onSubmeter={guardar}
            onCancelar={() => setFormulario(null)}
          />
        )}
      </Modal>

      {/* ----- Janela: confirmar remoção ----- */}
      <ConfirmarRemocao
        aberto={Boolean(aApagar)}
        titulo="Apagar disciplina"
        nome={aApagar?.nome}
        detalhe="Só é possível apagar disciplinas sem notas lançadas."
        erro={erroApagar}
        aApagar={aApagarEmCurso}
        onConfirmar={confirmarApagar}
        onCancelar={() => setAApagar(null)}
      />
    </>
  );
}