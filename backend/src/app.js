// ============================================================
// Configuração da aplicação Express (middlewares e rotas).
// Separamos o "app" do "server" para facilitar testes no futuro.
// ============================================================
import express from "express";
import cors from "cors";
import helmet from "helmet";
import routes from "./routes/index.js";
import { ErroHttp } from "./lib/http.js";

const app = express();

// --- Middlewares: funções que correm antes das rotas ---
app.use(helmet()); // cabeçalhos de segurança
app.use(
  cors({
    origin: process.env.FRONTEND_URL, // só o nosso frontend pode aceder
  })
);
app.use(express.json()); // permite ler JSON no corpo dos pedidos

// --- Rotas da API (todas começam por /api) ---
app.use("/api", routes);

// --- Rota não encontrada (404) ---
app.use((req, res) => {
  res.status(404).json({ erro: "Rota não encontrada" });
});

// --- Tratamento global de erros (4 parâmetros = middleware de erros) ---
app.use((erro, req, res, next) => {
  // Erros "esperados" lançados por nós (validação, não encontrado...)
  if (erro instanceof ErroHttp) {
    return res.status(erro.status).json({ erro: erro.message });
  }

  // JSON mal formado no corpo do pedido
  if (erro.type === "entity.parse.failed") {
    return res.status(400).json({ erro: "JSON inválido no corpo do pedido" });
  }

  // Erros conhecidos da base de dados (códigos do Prisma)
  if (erro.code === "P2002") {
    return res.status(409).json({ erro: "Já existe um registo com estes dados" });
  }
  if (erro.code === "P2025") {
    return res.status(404).json({ erro: "Registo não encontrado" });
  }
  if (erro.code === "P2003") {
    return res.status(409).json({
      erro: "Operação não permitida: existem registos associados ou a referência é inválida",
    });
  }

  // Qualquer outro erro é inesperado: regista no servidor,
  // mas NÃO mostra detalhes ao cliente (segurança).
  console.error(erro);
  res.status(500).json({ erro: "Erro interno do servidor" });
});

export default app;