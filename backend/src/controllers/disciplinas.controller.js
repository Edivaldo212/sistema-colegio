// ============================================================
// Lógica das disciplinas: listar, obter, criar, actualizar e apagar.
// ============================================================
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { ErroHttp, lerId, validar } from "../lib/http.js";

const esquemaDisciplina = z.object({
  nome: z.string().trim().min(2, "Nome com pelo menos 2 caracteres"),
});

// GET /api/disciplinas
export async function listar(req, res) {
  const disciplinas = await prisma.disciplina.findMany({
    orderBy: { nome: "asc" },
  });
  res.json(disciplinas);
}

// GET /api/disciplinas/:id
export async function obter(req, res) {
  const disciplina = await prisma.disciplina.findUnique({
    where: { id: lerId(req.params.id) },
  });

  if (!disciplina) throw new ErroHttp(404, "Disciplina não encontrada");
  res.json(disciplina);
}

// POST /api/disciplinas
export async function criar(req, res) {
  const dados = validar(esquemaDisciplina, req.body);
  const disciplina = await prisma.disciplina.create({ data: dados });
  res.status(201).json(disciplina);
}

// PUT /api/disciplinas/:id
export async function actualizar(req, res) {
  const id = lerId(req.params.id);
  const dados = validar(esquemaDisciplina, req.body);
  const disciplina = await prisma.disciplina.update({ where: { id }, data: dados });
  res.json(disciplina);
}

// DELETE /api/disciplinas/:id
// Se a disciplina já tem notas lançadas, a base de dados recusa (erro P2003,
// tratado em app.js com uma mensagem clara).
export async function remover(req, res) {
  await prisma.disciplina.delete({ where: { id: lerId(req.params.id) } });
  res.status(204).send();
}