// ============================================================
// Utilitários HTTP partilhados por todos os controladores.
// ============================================================

// Erro "esperado" com código HTTP (400, 404, 409...).
// O tratamento global em app.js converte-o numa resposta limpa.
export class ErroHttp extends Error {
  constructor(status, mensagem) {
    super(mensagem);
    this.status = status;
  }
}

// Valida dados com um esquema Zod. Se falhar, lança erro 400
// com o nome do campo e o motivo. Se passar, devolve os dados limpos.
export function validar(esquema, dados) {
  const resultado = esquema.safeParse(dados);

  if (!resultado.success) {
    const problema = resultado.error.issues[0];
    const campo = problema.path.join(".");
    throw new ErroHttp(400, campo ? `${campo}: ${problema.message}` : problema.message);
  }

  return resultado.data;
}

// Converte o :id da URL num número inteiro positivo (ou lança erro 400).
export function lerId(valor) {
  const id = Number(valor);

  if (!Number.isInteger(id) || id <= 0) {
    throw new ErroHttp(400, "Identificador inválido");
  }

  return id;
}
