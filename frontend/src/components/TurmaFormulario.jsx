// ============================================================
// Formulário para criar ou editar uma turma.
//   turma === null  -> modo "criar"
//   turma === {...} -> modo "editar"
// ============================================================
import { useState } from "react";

// Calculado uma vez: o ano sugerido ao criar uma turma nova
const ANO_ACTUAL = new Date().getFullYear();

export default function TurmaFormulario({ turma, onSubmeter, onCancelar }) {
  const [nome, setNome] = useState(turma?.nome ?? "");
  const [anoLectivo, setAnoLectivo] = useState(String(turma?.anoLectivo ?? ANO_ACTUAL));

  const [erro, setErro] = useState("");
  const [aEnviar, setAEnviar] = useState(false);

  async function aoSubmeter(evento) {
    evento.preventDefault();
    setErro("");
    setAEnviar(true);

    try {
      // O input devolve texto; a API quer número
      await onSubmeter({ nome, anoLectivo: Number(anoLectivo) });
    } catch (e) {
      setErro(e.message);
    } finally {
      setAEnviar(false);
    }
  }

  return (
    <form className="formulario" onSubmit={aoSubmeter}>
      <label htmlFor="turma-nome">Nome da turma</label>
      <input
        id="turma-nome"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="Ex.: 10ª A"
        required
      />

      <label htmlFor="turma-ano">Ano lectivo</label>
      <input
        id="turma-ano"
        type="number"
        min="2000"
        max="2100"
        value={anoLectivo}
        onChange={(e) => setAnoLectivo(e.target.value)}
        required
      />

      {erro && <p className="mensagem-erro" role="alert">{erro}</p>}

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