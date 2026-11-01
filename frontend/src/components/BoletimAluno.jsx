// ============================================================
// Boletim: notas de um aluno por disciplina e trimestre,
// com a média de cada disciplina e a média geral.
// Os cálculos são feitos pela API (GET /api/notas/boletim/:alunoId).
// ============================================================
import { useEffect, useState } from "react";
import { api } from "../services/api.js";

// Nota mínima positiva (escala de 0 a 20). Ajusta se o regulamento do colégio for outro.
const NOTA_POSITIVA = 10;

// Mostra "—" quando ainda não há nota, e vírgula decimal (14,5)
const formatar = (valor) =>
  valor === null ? "—" : valor.toLocaleString("pt-PT", { maximumFractionDigits: 2 });

// Notas negativas ficam a vermelho
const classeNota = (valor) => (valor !== null && valor < NOTA_POSITIVA ? "nota--negativa" : "");

export default function BoletimAluno({ turmas }) {
  const [turmaId, setTurmaId] = useState("");
  const [alunoId, setAlunoId] = useState("");
  const [listaAlunos, setListaAlunos] = useState(null); // { turmaId, alunos }
  const [boletim, setBoletim] = useState(null); // { alunoId, dados }
  const [erro, setErro] = useState("");

  // Quando se escolhe a turma, carrega os alunos dela
  useEffect(() => {
    if (!turmaId) return;

    let activo = true;

    api
      .get(`/alunos?turmaId=${turmaId}&limite=100`)
      .then((resposta) => {
        if (!activo) return;
        setListaAlunos({ turmaId, alunos: resposta.dados });
        setErro("");
      })
      .catch((e) => activo && setErro(e.message));

    return () => {
      activo = false;
    };
  }, [turmaId]);

  // Quando se escolhe o aluno, carrega o boletim
  useEffect(() => {
    if (!alunoId) return;

    let activo = true;

    api
      .get(`/notas/boletim/${alunoId}`)
      .then((resposta) => {
        if (!activo) return;
        setBoletim({ alunoId, dados: resposta });
        setErro("");
      })
      .catch((e) => activo && setErro(e.message));

    return () => {
      activo = false;
    };
  }, [alunoId]);

  // Só usamos os dados que correspondem à escolha actual
  const alunos = listaAlunos?.turmaId === turmaId ? listaAlunos.alunos : null;
  const dados = alunoId && boletim?.alunoId === alunoId ? boletim.dados : null;

  function mudarTurma(evento) {
    setTurmaId(evento.target.value);
    setAlunoId(""); // outra turma, outro aluno
    setErro("");
  }

  function mudarAluno(evento) {
    setAlunoId(evento.target.value);
    setErro("");
  }

  return (
    <>
      <div className="filtros nao-imprimir">
        <select aria-label="Turma" value={turmaId} onChange={mudarTurma}>
          <option value="">Escolhe a turma</option>
          {turmas.map((turma) => (
            <option key={turma.id} value={turma.id}>
              {turma.nome} ({turma.anoLectivo})
            </option>
          ))}
        </select>

        <select
          aria-label="Aluno"
          value={alunoId}
          onChange={mudarAluno}
          disabled={!turmaId || !alunos}
        >
          <option value="">Escolhe o aluno</option>
          {(alunos ?? []).map((aluno) => (
            <option key={aluno.id} value={aluno.id}>
              {aluno.nome}
            </option>
          ))}
        </select>
      </div>

      {erro && (
        <p className="mensagem-erro" role="alert">
          {erro}
        </p>
      )}

      {!alunoId && <p className="vazio">Escolhe a turma e o aluno para ver o boletim.</p>}
      {alunoId && !dados && !erro && <p className="carregando">A carregar...</p>}

      {dados && (
        <section className="tabela-cartao">
          <div className="cabecalho-pagina">
            <div>
              <h2>{dados.aluno.nome}</h2>
              <p className="vazio" style={{ padding: 0, textAlign: "left" }}>
                Processo {dados.aluno.numeroProcesso} ·{" "}
                {dados.aluno.turma
                  ? `${dados.aluno.turma.nome} (${dados.aluno.turma.anoLectivo})`
                  : "Sem turma"}
              </p>
            </div>

            <button
              type="button"
              className="botao botao--secundario nao-imprimir"
              onClick={() => window.print()}
            >
              Imprimir
            </button>
          </div>

          {dados.disciplinas.length === 0 ? (
            <p className="vazio">Este aluno ainda não tem notas lançadas.</p>
          ) : (
            <table className="tabela">
              <thead>
                <tr>
                  <th>Disciplina</th>
                  <th>1º trim.</th>
                  <th>2º trim.</th>
                  <th>3º trim.</th>
                  <th>Média</th>
                </tr>
              </thead>
              <tbody>
                {dados.disciplinas.map((item) => (
                  <tr key={item.disciplina.id}>
                    <td>{item.disciplina.nome}</td>
                    {[1, 2, 3].map((t) => (
                      <td key={t} className={classeNota(item.trimestres[t])}>
                        {formatar(item.trimestres[t])}
                      </td>
                    ))}
                    <td className={classeNota(item.media)}>
                      <strong>{formatar(item.media)}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4}>
                    <strong>Média geral</strong>
                  </td>
                  <td className={classeNota(dados.mediaGeral)}>
                    <strong>{formatar(dados.mediaGeral)}</strong>
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </section>
      )}
    </>
  );
}
