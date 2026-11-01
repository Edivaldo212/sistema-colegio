// ============================================================
// useDebounce: devolve o valor só depois de ele "estabilizar".
// Exemplo: o utilizador escreve "maria" letra a letra, mas a
// pesquisa só é feita 0,4 s depois da última letra.
// ============================================================
import { useEffect, useState } from "react";

export function useDebounce(valor, atrasoMs = 400) {
  const [valorAtrasado, setValorAtrasado] = useState(valor);

  useEffect(() => {
    // Cada vez que o valor muda, (re)começa a contagem
    const temporizador = setTimeout(() => setValorAtrasado(valor), atrasoMs);

    // Se o valor mudar antes do fim, cancela a contagem anterior
    return () => clearTimeout(temporizador);
  }, [valor, atrasoMs]);

  return valorAtrasado;
}
