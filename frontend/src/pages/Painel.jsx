// ============================================================
// Painel: mostra os números gerais e os últimos alunos,
// vindos da API (GET /api/painel).
// ============================================================
import { useEffect, useState } from "react";
import { api } from "../services/api.js";

// Formata números ao estilo português (13,4)
const formatarMedia = (valor) =>
  valor === null
    ? "—"
    : valor.toLocaleString("pt-PT", { minimumFractionDigits: 1, maximumFractionDigits: 2 });

export default function Painel() {
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState("");

  // useEffect com [] corre uma vez, quando a página aparece
  useEffect(() => {
    let activo = true; // evita actualizar o estado se a página já saiu do ecrã

    api
      .get("/painel")
      .then((resposta) => activo && setDados(resposta))
      .catch((e) => activo && setErro(e.message));

    return () => {
      activo = false;
    };
  }, []);

  if (erro)
    return (
      <p className="mensagem-erro" role="alert">
        {erro}
      </p>
    );
  if (!dados) return <p className="carregando">A carregar...</p>;

  return (
    <>
      <h1>Painel</h1>

      <section className="indicadores">
        <article className="indicador">
          <p className="indicador__titulo">Alunos activos</p>
          <p className="indicador__valor">{dados.totalAlunos}</p>
        </article>
        <article className="indicador">
          <p className="indicador__titulo">Turmas</p>
          <p className="indicador__valor">{dados.totalTurmas}</p>
        </article>
        <article className="indicador">
          <p className="indicador__titulo">Média geral</p>
          <p className="indicador__valor">{formatarMedia(dados.mediaGeral)}</p>
        </article>
      </section>

      <section className="tabela-cartao">
        <h2>Últimos alunos registados</h2>

        {dados.ultimosAlunos.length === 0 ? (
          <p className="vazio">Ainda não há alunos registados.</p>
        ) : (
          <table className="tabela">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Turma</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {dados.ultimosAlunos.map((aluno) => (
                <tr key={aluno.id}>
                  <td>{aluno.nome}</td>
                  <td>{aluno.turma?.nome ?? "Sem turma"}</td>
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
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}
