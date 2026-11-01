// ============================================================
// Página de Alunos: listagem com pesquisa, filtros e paginação,
// mais criar, editar e apagar (só ADMIN e SECRETARIA).
// ============================================================
import { useEffect, useState } from "react";
import { api } from "../services/api.js";
import { useAuth } from "../hooks/useAuth.js";
import { useDebounce } from "../hooks/useDebounce.js";
import Modal from "../components/Modal.jsx";
import AlunoFormulario from "../components/AlunoFormulario.jsx";

const ALUNOS_POR_PAGINA = 10;

// "2010-05-14T00:00:00.000Z" -> "14/05/2010" (sem conversões de fuso horário)
function formatarData(iso) {
  if (!iso) return "—";
  const [ano, mes, dia] = iso.slice(0, 10).split("-");
  return `${dia}/${mes}/${ano}`;
}

export default function Alunos() {
  const { utilizador } = useAuth();
  const podeGerir = ["ADMIN", "SECRETARIA"].includes(utilizador.papel);

  // --- Filtros e paginação ---
  const [pesquisa, setPesquisa] = useState("");
  const [turmaFiltro, setTurmaFiltro] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("");
  const [pagina, setPagina] = useState(1);
  const [versao, setVersao] = useState(0); // aumenta para forçar nova pesquisa

  // --- Dados vindos da API ---
  const [turmas, setTurmas] = useState([]);
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");

  // --- Janelas ---
  const [formulario, setFormulario] = useState(null); // null = fechada, { aluno } = aberta
  const [aApagar, setAApagar] = useState(null);
  const [erroApagar, setErroApagar] = useState("");
  const [aApagarEmCurso, setAApagarEmCurso] = useState(false);

  // A pesquisa só segue para o servidor quando o utilizador pára de escrever
  const pesquisaAtrasada = useDebounce(pesquisa.trim());

  // Endereço do pedido, montado com os filtros activos
  const parametros = new URLSearchParams({ pagina, limite: ALUNOS_POR_PAGINA });
  if (pesquisaAtrasada) parametros.set("pesquisa", pesquisaAtrasada);
  if (turmaFiltro) parametros.set("turmaId", turmaFiltro);
  if (estadoFiltro) parametros.set("estado", estadoFiltro);
  const caminho = `/alunos?${parametros}`;

  // Carrega as turmas uma vez (para o filtro e para o formulário)
  useEffect(() => {
    api
      .get("/turmas")
      .then(setTurmas)
      .catch(() => {});
  }, []);

  // Carrega os alunos sempre que os filtros, a página ou a "versão" mudam
  useEffect(() => {
    let activo = true; // ignora respostas antigas se o utilizador já mudou os filtros

    api
      .get(caminho)
      .then((resposta) => {
        if (!activo) return;
        setResultado({ caminho, versao, resposta });
        setErro("");
      })
      .catch((e) => activo && setErro(e.message));

    return () => {
      activo = false;
    };
  }, [caminho, versao]);

  // "A carregar" quando o resultado guardado não corresponde ao pedido actual
  const carregando = !resultado || resultado.caminho !== caminho || resultado.versao !== versao;
  const alunos = resultado?.resposta.dados ?? [];
  const total = resultado?.resposta.total ?? 0;
  const totalPaginas = Math.max(resultado?.resposta.totalPaginas ?? 1, 1);

  // Ao mudar um filtro, volta à primeira página
  function mudarPesquisa(evento) {
    setPesquisa(evento.target.value);
    setPagina(1);
  }

  function mudarTurma(evento) {
    setTurmaFiltro(evento.target.value);
    setPagina(1);
  }

  function mudarEstado(evento) {
    setEstadoFiltro(evento.target.value);
    setPagina(1);
  }

  // Criar ou editar, conforme o formulário foi aberto
  async function guardar(dados) {
    const aEditar = Boolean(formulario.aluno);

    if (aEditar) {
      await api.put(`/alunos/${formulario.aluno.id}`, dados);
    } else {
      await api.post("/alunos", dados);
    }

    setAviso(aEditar ? "Aluno actualizado com sucesso." : "Aluno criado com sucesso.");
    setFormulario(null);
    setVersao((v) => v + 1); // volta a pedir a lista
  }

  async function confirmarApagar() {
    setErroApagar("");
    setAApagarEmCurso(true);

    try {
      await api.delete(`/alunos/${aApagar.id}`);
      setAviso(`Aluno "${aApagar.nome}" apagado.`);

      // Se era o único aluno da página (e não é a primeira), recua uma página
      if (alunos.length === 1 && pagina > 1) setPagina((p) => p - 1);

      setAApagar(null);
      setVersao((v) => v + 1);
    } catch (e) {
      setErroApagar(e.message);
    } finally {
      setAApagarEmCurso(false);
    }
  }

  function abrirFormulario(aluno) {
    setAviso("");
    setFormulario({ aluno });
  }

  function pedirApagar(aluno) {
    setAviso("");
    setErroApagar("");
    setAApagar(aluno);
  }

  return (
    <>
      <div className="cabecalho-pagina">
        <h1>Alunos</h1>
        {podeGerir && (
          <button type="button" className="botao" onClick={() => abrirFormulario(null)}>
            Novo aluno
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

      {/* ----- Filtros ----- */}
      <div className="filtros">
        <input
          type="search"
          className="filtros__pesquisa"
          placeholder="Pesquisar por nome ou nº de processo"
          aria-label="Pesquisar alunos"
          value={pesquisa}
          onChange={mudarPesquisa}
        />

        <select aria-label="Filtrar por turma" value={turmaFiltro} onChange={mudarTurma}>
          <option value="">Todas as turmas</option>
          {turmas.map((turma) => (
            <option key={turma.id} value={turma.id}>
              {turma.nome} ({turma.anoLectivo})
            </option>
          ))}
        </select>

        <select aria-label="Filtrar por estado" value={estadoFiltro} onChange={mudarEstado}>
          <option value="">Todos os estados</option>
          <option value="ACTIVO">Activos</option>
          <option value="INACTIVO">Inactivos</option>
        </select>
      </div>

      {/* ----- Tabela ----- */}
      {!resultado && !erro ? (
        <p className="carregando">A carregar...</p>
      ) : (
        resultado && (
          <section
            className={carregando ? "tabela-cartao tabela-cartao--a-carregar" : "tabela-cartao"}
          >
            {alunos.length === 0 ? (
              <p className="vazio">Nenhum aluno encontrado.</p>
            ) : (
              <table className="tabela">
                <thead>
                  <tr>
                    <th>Nº processo</th>
                    <th>Nome</th>
                    <th>Turma</th>
                    <th>Nascimento</th>
                    <th>Estado</th>
                    {podeGerir && <th>Acções</th>}
                  </tr>
                </thead>
                <tbody>
                  {alunos.map((aluno) => (
                    <tr key={aluno.id}>
                      <td>{aluno.numeroProcesso}</td>
                      <td>{aluno.nome}</td>
                      <td>{aluno.turma?.nome ?? "Sem turma"}</td>
                      <td>{formatarData(aluno.dataNascimento)}</td>
                      <td>
                        <span
                          className={
                            aluno.estado === "ACTIVO"
                              ? "estado estado--activo"
                              : "estado estado--inactivo"
                          }
                        >
                          {aluno.estado === "ACTIVO" ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      {podeGerir && (
                        <td className="tabela__acoes">
                          <button
                            type="button"
                            className="botao botao--secundario botao--pequeno"
                            aria-label={`Editar ${aluno.nome}`}
                            onClick={() => abrirFormulario(aluno)}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className="botao botao--perigo botao--pequeno"
                            aria-label={`Apagar ${aluno.nome}`}
                            onClick={() => pedirApagar(aluno)}
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

            {/* ----- Paginação ----- */}
            <div className="paginacao">
              <span>
                {total} {total === 1 ? "aluno" : "alunos"} · Página {pagina} de {totalPaginas}
              </span>
              <div className="paginacao__botoes">
                <button
                  type="button"
                  className="botao botao--secundario botao--pequeno"
                  disabled={pagina <= 1}
                  onClick={() => setPagina((p) => p - 1)}
                >
                  Anterior
                </button>
                <button
                  type="button"
                  className="botao botao--secundario botao--pequeno"
                  disabled={pagina >= totalPaginas}
                  onClick={() => setPagina((p) => p + 1)}
                >
                  Seguinte
                </button>
              </div>
            </div>
          </section>
        )
      )}

      {/* ----- Janela: criar / editar ----- */}
      <Modal
        aberto={Boolean(formulario)}
        titulo={formulario?.aluno ? "Editar aluno" : "Novo aluno"}
        onFechar={() => setFormulario(null)}
      >
        {formulario && (
          <AlunoFormulario
            aluno={formulario.aluno}
            turmas={turmas}
            onSubmeter={guardar}
            onCancelar={() => setFormulario(null)}
          />
        )}
      </Modal>

      {/* ----- Janela: confirmar remoção ----- */}
      <Modal aberto={Boolean(aApagar)} titulo="Apagar aluno" onFechar={() => setAApagar(null)}>
        {aApagar && (
          <>
            <p className="confirmacao">
              Tens a certeza que queres apagar <strong>{aApagar.nome}</strong>? As notas deste aluno
              também serão apagadas. Esta acção não pode ser desfeita.
            </p>

            {erroApagar && (
              <p className="mensagem-erro" role="alert">
                {erroApagar}
              </p>
            )}

            <div className="formulario__acoes">
              <button
                type="button"
                className="botao botao--secundario"
                onClick={() => setAApagar(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="botao botao--perigo"
                disabled={aApagarEmCurso}
                onClick={confirmarApagar}
              >
                {aApagarEmCurso ? "A apagar..." : "Apagar"}
              </button>
            </div>
          </>
        )}
      </Modal>
    </>
  );
}
