// ============================================================
// Lógica das turmas: listar, obter, criar, actualizar e apagar.
// ============================================================
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { ErroHttp, lerId, validar } from "../lib/http.js";

// Regras dos dados de uma turma
const esquemaTurma = z.object({
  nome: z.string().trim().min(1, "Nome obrigatório"),
  anoLectivo: z.coerce.number().int().min(2000).max(2100),
});

// GET /api/turmas?anoLectivo=2026
export async function listar(req, res) {
  const { anoLectivo } = validar(
    z.object({ anoLectivo: z.coerce.number().int().optional() }),
    req.query
  );

  const turmas = await prisma.turma.findMany({
    where: anoLectivo ? { anoLectivo } : {},
    include: { _count: { select: { alunos: true } } }, // nº de alunos
    orderBy: [{ anoLectivo: "desc" }, { nome: "asc" }],
  });

  res.json(turmas);
}

// GET /api/turmas/:id
export async function obter(req, res) {
  const turma = await prisma.turma.findUnique({
    where: { id: lerId(req.params.id) },
    include: { _count: { select: { alunos: true } } },
  });

  if (!turma) throw new ErroHttp(404, "Turma não encontrada");
  res.json(turma);
}

// POST /api/turmas
export async function criar(req, res) {
  const dados = validar(esquemaTurma, req.body);
  const turma = await prisma.turma.create({ data: dados });
  res.status(201).json(turma);
}

// PUT /api/turmas/:id (só precisas de enviar os campos a alterar)
export async function actualizar(req, res) {
  const id = lerId(req.params.id);
  const dados = validar(esquemaTurma.partial(), req.body);
  const turma = await prisma.turma.update({ where: { id }, data: dados });
  res.json(turma);
}

// DELETE /api/turmas/:id
export async function remover(req, res) {
  const id = lerId(req.params.id);

  // Regra de negócio: não se apaga uma turma que ainda tem alunos
  const totalAlunos = await prisma.aluno.count({ where: { turmaId: id } });
  if (totalAlunos > 0) {
    throw new ErroHttp(409, "Não é possível apagar: a turma ainda tem alunos");
  }

  await prisma.turma.delete({ where: { id } });
  res.status(204).send(); // 204 = sucesso, sem conteúdo
}