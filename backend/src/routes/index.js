// ============================================================
// Ponto central das rotas da API.
// Mais tarde vamos adicionar aqui: alunos, turmas, notas...
// ============================================================
import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import authRoutes from "./auth.routes.js";

const router = Router();

// GET /api/saude -> verifica se o servidor e a base de dados estão vivos
router.get("/saude", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ estado: "ok", baseDeDados: "ligada" });
  } catch (erro) {
    console.error("Erro ao ligar à base de dados:", erro.message);
    res.status(500).json({ estado: "erro", baseDeDados: "sem ligação" });
  }
});

// Rotas de autenticação: /api/auth/...
router.use("/auth", authRoutes);

export default router;