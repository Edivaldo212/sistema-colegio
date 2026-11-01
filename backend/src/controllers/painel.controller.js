// ============================================================
// Dados resumidos para o painel (dashboard).
// ============================================================
import { prisma } from "../lib/prisma.js";
import { arredondar } from "../lib/calculos.js";

// GET /api/painel
export async function resumo(req, res) {
  // As 4 consultas correm ao mesmo tempo (mais rápido)
  const [totalAlunos, totalTurmas, notas, ultimosAlunos] = await Promise.all([
    prisma.aluno.count({ where: { estado: "ACTIVO" } }),
    prisma.turma.count(),
    prisma.nota.aggregate({ _avg: { valor: true } }), // média de todas as notas
    prisma.aluno.findMany({
      take: 5,
      orderBy: { criadoEm: "desc" },
      include: { turma: { select: { id: true, nome: true } } },
    }),
  ]);

  const mediaBruta = notas._avg.valor;

  res.json({
    totalAlunos, // só alunos activos
    totalTurmas,
    mediaGeral: mediaBruta === null ? null : arredondar(mediaBruta),
    ultimosAlunos,
  });
}
