// ============================================================
// Ponto central das rotas da API.
// Mais tarde vamos adicionar aqui: alunos, turmas, notas, auth...
// ============================================================
import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

// GET /api/saude -> verifica se o servidor e a base de dados estão vivos
router.get("/saude", async (req, res) => {
  try {
    // Pergunta simples à base de dados, só para testar a ligação
    await prisma.$queryRaw`SELECT 1`;
    res.json({ estado: "ok", baseDeDados: "ligada" });
  } catch (erro) {
    console.error("Erro ao ligar à base de dados:", erro.message);
    res.status(500).json({ estado: "erro", baseDeDados: "sem ligação" });
  }
});

export default router;