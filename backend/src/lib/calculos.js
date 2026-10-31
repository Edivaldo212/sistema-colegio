// ============================================================
// Funções de cálculo reutilizáveis (médias e arredondamentos).
// ============================================================

// Arredonda para 2 casas decimais (ex.: 13.456 -> 13.46)
export function arredondar(numero) {
  return Math.round(numero * 100) / 100;
}

// Média de uma lista de números. Devolve null se a lista estiver vazia.
export function media(numeros) {
  if (numeros.length === 0) return null;
  const soma = numeros.reduce((total, n) => total + n, 0);
  return arredondar(soma / numeros.length);
}