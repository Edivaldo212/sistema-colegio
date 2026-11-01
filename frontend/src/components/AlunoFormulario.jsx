// ============================================================
// Formulário para criar ou editar um aluno.
//   aluno === null  -> modo "criar"
//   aluno === {...} -> modo "editar" (campos já preenchidos)
// ============================================================
import { useState } from "react";

// A API devolve "2010-05-14T00:00:00.000Z"; o <input type="date"> quer "2010-05-14"
const paraCampoData = (iso) => (iso ? iso.slice(0, 10) : "");

export default function AlunoFormulario({ aluno, turmas, onSubmeter, onCancelar }) {
  // Cada campo tem o seu estado (inputs "controlados" pelo React)
  const [nome, setNome] = useState(aluno?.nome ?? "");
  const [numeroProcesso, setNumeroProcesso] = useState(aluno?.numeroProcesso ?? "");
  const [dataNascimento, setDataNascimento] = useState(paraCampoData(aluno?.dataNascimento));
  const [turmaId, setTurmaId] = useState(aluno?.turmaId ? String(aluno.turmaId) : "");
  const [estado, setEstado] = useState(aluno?.estado ?? "ACTIVO");

  const [erro, setErro] = useState("");
  const [aEnviar, setAEnviar] = useState(false);

  async function aoSubmeter(evento) {
    evento.preventDefault();
    setErro("");
    setAEnviar(true);

    try {
      // Campos vazios viram null; o select devolve texto, a API quer número
      await onSubmeter({
        nome,
        numeroProcesso,
        dataNascimento: dataNascimento || null,
        turmaId: turmaId ? Number(turmaId) : null,
        estado,
      });
    } catch (e) {
      setErro(e.message); // mostra o erro da API (ex.: "nome: Nome com pelo menos 3 caracteres")
    } finally {
      setAEnviar(false);
    }
  }

  return (
    <form className="formulario" onSubmit={aoSubmeter}>
      <label htmlFor="aluno-nome">Nome completo</label>
      <input id="aluno-nome" value={nome} onChange={(e) => setNome(e.target.value)} required />

      <label htmlFor="aluno-processo">Número de processo</label>
      <input
        id="aluno-processo"
        value={numeroProcesso}
        onChange={(e) => setNumeroProcesso(e.target.value)}
        required
      />

      <label htmlFor="aluno-nascimento">Data de nascimento</label>
      <input
        id="aluno-nascimento"
        type="date"
        value={dataNascimento}
        onChange={(e) => setDataNascimento(e.target.value)}
      />

      <label htmlFor="aluno-turma">Turma</label>
      <select id="aluno-turma" value={turmaId} onChange={(e) => setTurmaId(e.target.value)}>
        <option value="">Sem turma</option>
        {turmas.map((turma) => (
          <option key={turma.id} value={turma.id}>
            {turma.nome} ({turma.anoLectivo})
          </option>
        ))}
      </select>

      <label htmlFor="aluno-estado">Estado</label>
      <select id="aluno-estado" value={estado} onChange={(e) => setEstado(e.target.value)}>
        <option value="ACTIVO">Activo</option>
        <option value="INACTIVO">Inactivo</option>
      </select>

      {erro && (
        <p className="mensagem-erro" role="alert">
          {erro}
        </p>
      )}

      <div className="formulario__acoes">
        <button type="button" className="botao botao--secundario" onClick={onCancelar}>
          Cancelar
        </button>
        <button type="submit" className="botao" disabled={aEnviar}>
          {aEnviar ? "A guardar..." : "Guardar"}
        </button>
      </div>
    </form>
  );
}
