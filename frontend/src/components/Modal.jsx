// ============================================================
// Modal: janela por cima da página, feita com o <dialog> nativo.
// Fecha com a tecla Esc ou ao clicar fora da janela.
// ============================================================
import { useEffect, useRef } from "react";

export default function Modal({ aberto, titulo, onFechar, children }) {
  const ref = useRef(null); // referência ao elemento <dialog>

  // Sincroniza o estado "aberto" do React com o <dialog> do browser
  useEffect(() => {
    const dialogo = ref.current;
    if (!dialogo) return;

    if (aberto && !dialogo.open) dialogo.showModal();
    if (!aberto && dialogo.open) dialogo.close();
  }, [aberto]);

  // Clicar no fundo escurecido (o próprio <dialog>) fecha a janela
  function aoClicar(evento) {
    if (evento.target === ref.current) onFechar();
  }

  return (
    <dialog ref={ref} className="modal" onClose={onFechar} onClick={aoClicar}>
      {/* O conteúdo só existe enquanto aberto: o formulário começa sempre limpo */}
      {aberto && (
        <div className="modal__conteudo">
          <h2>{titulo}</h2>
          {children}
        </div>
      )}
    </dialog>
  );
}