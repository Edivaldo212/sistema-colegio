// ============================================================
// Ponto central das rotas da API.
// Mais tarde vamos adicionar aqui: notas...
// ============================================================
import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import authRoutes from "./auth.routes.js";
import turmasRoutes from "./turmas.routes.js";
import disciplinasRoutes from "./disciplinas.routes.js";
import alunosRoutes from "./alunos.routes.js";

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

router.use("/auth", authRoutes);
router.use("/turmas", turmasRoutes);
router.use("/disciplinas", disciplinasRoutes);
router.use("/alunos", alunosRoutes);

export default router;