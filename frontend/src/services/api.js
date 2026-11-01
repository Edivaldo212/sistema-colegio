// ============================================================
// Cliente da API: todas as chamadas ao backend passam por aqui.
// Junta o token automaticamente e trata os erros num só sítio.
// ============================================================
const URL_BASE = import.meta.env.VITE_API_URL || "http://localhost:3333/api";
const CHAVE_TOKEN = "token";

// --- Gestão do token (guardado no localStorage do browser) ---
export const lerToken = () => localStorage.getItem(CHAVE_TOKEN);
export const guardarToken = (token) => localStorage.setItem(CHAVE_TOKEN, token);
export const limparToken = () => localStorage.removeItem(CHAVE_TOKEN);

// Erro com o código HTTP e a mensagem vinda do servidor
export class ErroApi extends Error {
  constructor(status, mensagem) {
    super(mensagem);
    this.status = status;
  }
}

async function pedido(caminho, { metodo = "GET", corpo } = {}) {
  const token = lerToken();
  const cabecalhos = {};

  if (corpo) cabecalhos["Content-Type"] = "application/json";
  if (token) cabecalhos.Authorization = `Bearer ${token}`;

  let resposta;
  try {
    resposta = await fetch(`${URL_BASE}${caminho}`, {
      method: metodo,
      headers: cabecalhos,
      body: corpo ? JSON.stringify(corpo) : undefined,
    });
  } catch {
    // fetch só falha assim quando não consegue falar com o servidor
    throw new ErroApi(0, "Não foi possível contactar o servidor. Tenta novamente.");
  }

  // 204 = sucesso sem conteúdo (ex.: apagar)
  if (resposta.status === 204) return null;

  const dados = await resposta.json().catch(() => null);

  if (!resposta.ok) {
    // Token inválido ou expirado: avisa a aplicação para terminar a sessão
    if (resposta.status === 401 && token && caminho !== "/auth/login") {
      window.dispatchEvent(new Event("sessao-expirada"));
    }
    throw new ErroApi(resposta.status, dados?.erro || "Ocorreu um erro inesperado");
  }

  return dados;
}

// Atalhos para os 4 métodos que vamos usar
export const api = {
  get: (caminho) => pedido(caminho),
  post: (caminho, corpo) => pedido(caminho, { metodo: "POST", corpo }),
  put: (caminho, corpo) => pedido(caminho, { metodo: "PUT", corpo }),
  delete: (caminho) => pedido(caminho, { metodo: "DELETE" }),
};