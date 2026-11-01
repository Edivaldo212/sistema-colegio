// ============================================================
// Formulário para criar ou editar uma disciplina.
// ============================================================
import { useState } from "react";

export default function DisciplinaFormulario({ disciplina, onSubmeter, onCancelar }) {
  const [nome, setNome] = useState(disciplina?.nome ?? "");

  const [erro, setErro] = useState("");
  const [aEnviar, setAEnviar] = useState(false);

  async function aoSubmeter(evento) {
    evento.preventDefault();
    setErro("");
    setAEnviar(true);

    try {
      await onSubmeter({ nome });
    } catch (e) {
      setErro(e.message);
    } finally {
      setAEnviar(false);
    }
  }

  return (
    <form className="formulario" onSubmit={aoSubmeter}>
      <label htmlFor="disciplina-nome">Nome da disciplina</label>
      <input
        id="disciplina-nome"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="Ex.: Matemática"
        required
      />

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
