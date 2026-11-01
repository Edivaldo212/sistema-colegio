// ============================================================
// Janela "Tens a certeza?" antes de apagar algo.
// Reutilizável: cada página só diz o nome do item e o que fazer.
// ============================================================
import Modal from "./Modal.jsx";

export default function ConfirmarRemocao({
  aberto,
  titulo,
  nome, // nome do item a apagar (mostrado a negrito)
  detalhe, // frase extra opcional (ex.: avisos sobre dados associados)
  erro,
  aApagar, // true enquanto o pedido está a decorrer
  onConfirmar,
  onCancelar,
}) {
  return (
    <Modal aberto={aberto} titulo={titulo} onFechar={onCancelar}>
      <p className="confirmacao">
        Tens a certeza que queres apagar <strong>{nome}</strong>? {detalhe} Esta acção não pode
        ser desfeita.
      </p>

      {erro && <p className="mensagem-erro" role="alert">{erro}</p>}

      <div className="formulario__acoes">
        <button type="button" className="botao botao--secundario" onClick={onCancelar}>
          Cancelar
        </button>
        <button
          type="button"
          className="botao botao--perigo"
          disabled={aApagar}
          onClick={onConfirmar}
        >
          {aApagar ? "A apagar..." : "Apagar"}
        </button>
      </div>
    </Modal>
  );
}