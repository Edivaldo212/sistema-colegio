// ============================================================
// Configuração da aplicação Express (middlewares e rotas).
// Separamos o "app" do "server" para facilitar testes no futuro.
// ============================================================
import express from "express";
import cors from "cors";
import helmet from "helmet";
import routes from "./routes/index.js";

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
  console.error(erro);
  res.status(500).json({ erro: "Erro interno do servidor" });
});

export default app;