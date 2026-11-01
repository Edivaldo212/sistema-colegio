// ============================================================
// Lançamento de notas: o professor escolhe turma, disciplina e
// trimestre, preenche as notas dos alunos e guarda tudo de uma vez.
//
// Regras por aluno ao guardar:
//   - tinha nota e o campo ficou vazio -> apaga a nota
//   - tinha nota e o valor mudou       -> actualiza
//   - não tinha nota e escreveu uma    -> cria
// ============================================================
import { useEffect, useState } from "react";
import { api } from "../services/api.js";
import { useAuth } from "../hooks/useAuth.js";

const TRIMESTRES = ["1", "2", "3"];

// Converte o texto escrito numa nota. Aceita vírgula ou ponto (14,5 ou 14.5).
//   vazio -> { vazio: true } | inválido -> { erro: true } | válido -> { valor }
function lerNota(texto) {
  const limpo = texto.trim().replace(",", ".");

  if (limpo === "") return { vazio: true };
  if (!/^\d{1,2}(\.\d{1,2})?$/.test(limpo)) return { erro: true };

  const valor = Number(limpo);
  if (valor > 20) return { erro: true };

  return { valor };
}

// 14.5 -> "14,5" (como o utilizador está habituado a ver)
const paraTexto = (valor) => (valor == null ? "" : String(valor).replace(".", ","));

// Junta cada aluno à sua nota (se existir) e calcula o estado de cada linha
function montarLinhas(resultado, valoresEditados) {
  const notaPorAluno = new Map(resultado.notas.map((nota) => [nota.alunoId, nota]));

  return resultado.alunos.map((aluno) => {
    const nota = notaPorAluno.get(aluno.id) ?? null;
    const texto = valoresEditados[aluno.id] ?? paraTexto(nota?.valor);
    const lida = lerNota(texto);

    const invalido = Boolean(lida.erro);
    const novoValor = lida.vazio ? null : lida.valor; // null = sem nota
    const alterado = !invalido && novoValor !== (nota?.valor ?? null);

    return { aluno, nota, texto, invalido, novoValor, alterado };
  });
}

export default function LancamentoNotas({ turmas, disciplinas }) {
  const { utilizador } = useAuth();
  const podeLancar = ["ADMIN", "PROFESSOR"].includes(utilizador.papel);

  // --- Escolhas do utilizador ---
  const [turmaId, setTurmaId] = useState("");
  const [disciplinaId, setDisciplinaId] = useState("");
  const [trimestre, setTrimestre] = useState("1");
  const [versao, setVersao] = useState(0); // aumenta para recarregar depois de guardar

  // --- Dados e estado ---
  const [resultado, setResultado] = useState(null);
  const [edicoes, setEdicoes] = useState({ chave: "", valores: {} });
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [aGuardar, setAGuardar] = useState(false);

  const seleccionado = Boolean(turmaId && disciplinaId);

  // A "chave" identifica o que está no ecrã. Quando muda (outra turma,
  // disciplina, trimestre ou depois de guardar), as edições antigas deixam
  // de valer, sem precisarmos de as apagar à mão.
  const chave = `${turmaId}|${disciplinaId}|${trimestre}|${versao}`;

  // Carrega os alunos da turma e as notas já lançadas
  useEffect(() => {
    if (!turmaId || !disciplinaId) return;

    let activo = true;

    Promise.all([
      api.get(`/alunos?turmaId=${turmaId}&estado=ACTIVO&limite=100`),
      api.get(
        `/notas?turmaId=${turmaId}&disciplinaId=${disciplinaId}&trimestre=${trimestre}&limite=100`
      ),
    ])
      .then(([alunos, notas]) => {
        if (!activo) return;
        setResultado({ chave, alunos: alunos.dados, notas: notas.dados });
        setErro("");
      })
      .catch((e) => activo && setErro(e.message));

    return () => {
      activo = false;
    };
  }, [chave, turmaId, disciplinaId, trimestre]);

  const carregado = seleccionado && resultado?.chave === chave;
  const valoresEditados = edicoes.chave === chave ? edicoes.valores : {};
  const linhas = carregado ? montarLinhas(resultado, valoresEditados) : [];

  const alteracoes = linhas.filter((linha) => linha.alterado);
  const temInvalidos = linhas.some((linha) => linha.invalido);
  const comNota = linhas.filter((linha) => linha.nota).length;

  function escolher(definir) {
    return (evento) => {
      definir(evento.target.value);
      setAviso("");
      setErro("");
    };
  }

  function escreverNota(alunoId, texto) {
    setEdicoes((anterior) => ({
      chave,
      valores: { ...(anterior.chave === chave ? anterior.valores : {}), [alunoId]: texto },
    }));
  }

  async function guardar() {
    setAviso("");
    setErro("");
    setAGuardar(true);

    // Um pedido por aluno alterado, todos ao mesmo tempo
    const pedidos = alteracoes.map(({ aluno, nota, novoValor }) => {
      if (novoValor === null) return api.delete(`/notas/${nota.id}`);
      if (nota) return api.put(`/notas/${nota.id}`, { valor: novoValor });

      return api.post("/notas", {
        alunoId: aluno.id,
        disciplinaId: Number(disciplinaId),
        trimestre: Number(trimestre),
        valor: novoValor,
      });
    });

    // allSettled espera por todos, mesmo que alguns falhem
    const resultados = await Promise.allSettled(pedidos);
    const falhas = resultados.filter((r) => r.status === "rejected");
    const guardadas = resultados.length - falhas.length;

    if (guardadas > 0) {
      setAviso(`${guardadas} ${guardadas === 1 ? "alteração guardada" : "alterações guardadas"}.`);
    }
    if (falhas.length > 0) {
      setErro(`${falhas.length} não ${falhas.length === 1 ? "foi guardada" : "foram guardadas"}: ${falhas[0].reason.message}`);
    }

    setAGuardar(false);
    setVersao((v) => v + 1); // recarrega o que está na base de dados
  }

  return (
    <>
      {/* ----- Escolhas ----- */}
      <div className="filtros">
        <select aria-label="Turma" value={turmaId} onChange={escolher(setTurmaId)}>
          <option value="">Escolhe a turma</option>
          {turmas.map((turma) => (
            <option key={turma.id} value={turma.id}>
              {turma.nome} ({turma.anoLectivo})
            </option>
          ))}
        </select>

        <select aria-label="Disciplina" value={disciplinaId} onChange={escolher(setDisciplinaId)}>
          <option value="">Escolhe a disciplina</option>
          {disciplinas.map((disciplina) => (
            <option key={disciplina.id} value={disciplina.id}>
              {disciplina.nome}
            </option>
          ))}
        </select>

        <select aria-label="Trimestre" value={trimestre} onChange={escolher(setTrimestre)}>
          {TRIMESTRES.map((t) => (
            <option key={t} value={t}>
              {t}º trimestre
            </option>
          ))}
        </select>
      </div>

      {aviso && <p className="mensagem-sucesso" role="status">{aviso}</p>}
      {erro && <p className="mensagem-erro" role="alert">{erro}</p>}

      {!seleccionado && (
        <p className="vazio">Escolhe a turma e a disciplina para ver os alunos.</p>
      )}

      {seleccionado && !carregado && !erro && <p className="carregando">A carregar...</p>}

      {/* ----- Tabela de notas ----- */}
      {carregado && (
        <section className="tabela-cartao">
          {linhas.length === 0 ? (
            <p className="vazio">Esta turma não tem alunos activos.</p>
          ) : (
            <table className="tabela">
              <thead>
                <tr>
                  <th>Nº processo</th>
                  <th>Aluno</th>
                  <th>Nota (0 a 20)</th>
                </tr>
              </thead>
              <tbody>
                {linhas.map(({ aluno, nota, texto, invalido, alterado }) => (
                  <tr key={aluno.id}>
                    <td>{aluno.numeroProcesso}</td>
                    <td>{aluno.nome}</td>
                    <td>
                      {podeLancar ? (
                        <input
                          className={
                            invalido
                              ? "nota-input nota-input--invalida"
                              : alterado
                                ? "nota-input nota-input--alterada"
                                : "nota-input"
                          }
                          inputMode="decimal"
                          aria-label={`Nota de ${aluno.nome}`}
                          aria-invalid={invalido}
                          placeholder="—"
                          value={texto}
                          onChange={(e) => escreverNota(aluno.id, e.target.value)}
                        />
                      ) : (
                        paraTexto(nota?.valor) || "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="paginacao">
            <span>
              {comNota} de {linhas.length} alunos com nota
              {temInvalidos && " · Há notas inválidas (usa um valor entre 0 e 20)"}
            </span>

            {podeLancar && linhas.length > 0 && (
              <button
                type="button"
                className="botao"
                disabled={aGuardar || temInvalidos || alteracoes.length === 0}
                onClick={guardar}
              >
                {aGuardar
                  ? "A guardar..."
                  : alteracoes.length === 0
                    ? "Sem alterações"
                    : `Guardar ${alteracoes.length} ${alteracoes.length === 1 ? "alteração" : "alterações"}`}
              </button>
            )}
          </div>
        </section>
      )}
    </>
  );
}