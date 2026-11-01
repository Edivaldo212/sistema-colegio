// ============================================================
// Lógica das notas: lançar, listar, editar, apagar e boletim.
// ============================================================
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { ErroHttp, lerId, validar } from "../lib/http.js";
import { media } from "../lib/calculos.js";

// Nota de 0 a 20
const valorNota = z.number().min(0, "A nota mínima é 0").max(20, "A nota máxima é 20");

// Regras para lançar uma nota
const esquemaNota = z.object({
  alunoId: z.number().int().positive(),
  disciplinaId: z.number().int().positive(),
  trimestre: z.number().int().min(1, "Trimestre entre 1 e 3").max(3, "Trimestre entre 1 e 3"),
  valor: valorNota,
});

// Parâmetros aceites na listagem
const esquemaListagem = z.object({
  alunoId: z.coerce.number().int().positive().optional(),
  disciplinaId: z.coerce.number().int().positive().optional(),
  turmaId: z.coerce.number().int().positive().optional(),
  trimestre: z.coerce.number().int().min(1).max(3).optional(),
  pagina: z.coerce.number().int().min(1).default(1),
  limite: z.coerce.number().int().min(1).max(100).default(50),
});

// O que mostramos do aluno e da disciplina em cada nota
const incluir = {
  aluno: { select: { id: true, nome: true, numeroProcesso: true } },
  disciplina: { select: { id: true, nome: true } },
};

// GET /api/notas?alunoId=1&disciplinaId=2&turmaId=3&trimestre=1
export async function listar(req, res) {
  const { alunoId, disciplinaId, turmaId, trimestre, pagina, limite } = validar(
    esquemaListagem,
    req.query
  );

  // Filtro montado só com o que foi pedido
  const where = {
    ...(alunoId && { alunoId }),
    ...(disciplinaId && { disciplinaId }),
    ...(trimestre && { trimestre }),
    ...(turmaId && { aluno: { turmaId } }), // filtra pela turma do aluno
  };

  const [total, dados] = await Promise.all([
    prisma.nota.count({ where }),
    prisma.nota.findMany({
      where,
      include: incluir,
      orderBy: [{ aluno: { nome: "asc" } }, { trimestre: "asc" }],
      skip: (pagina - 1) * limite,
      take: limite,
    }),
  ]);

  res.json({ dados, total, pagina, limite, totalPaginas: Math.ceil(total / limite) });
}

// POST /api/notas
export async function criar(req, res) {
  const dados = validar(esquemaNota, req.body);

  // Confirmamos que o aluno e a disciplina existem, com mensagens claras
  const [aluno, disciplina] = await Promise.all([
    prisma.aluno.findUnique({ where: { id: dados.alunoId }, select: { id: true } }),
    prisma.disciplina.findUnique({ where: { id: dados.disciplinaId }, select: { id: true } }),
  ]);

  if (!aluno) throw new ErroHttp(404, "Aluno não encontrado");
  if (!disciplina) throw new ErroHttp(404, "Disciplina não encontrada");

  // Se já existir nota para este aluno/disciplina/trimestre, a base de dados
  // recusa (regra @@unique do schema) e o app.js responde 409.
  const nota = await prisma.nota.create({ data: dados, include: incluir });
  res.status(201).json(nota);
}

// PUT /api/notas/:id (só o valor pode ser corrigido)
export async function actualizar(req, res) {
  const id = lerId(req.params.id);
  const { valor } = validar(z.object({ valor: valorNota }), req.body);

  const nota = await prisma.nota.update({
    where: { id },
    data: { valor },
    include: incluir,
  });
  res.json(nota);
}

// DELETE /api/notas/:id
export async function remover(req, res) {
  await prisma.nota.delete({ where: { id: lerId(req.params.id) } });
  res.status(204).send();
}

// GET /api/notas/boletim/:alunoId
// Devolve as notas do aluno por disciplina e trimestre, com as médias.
export async function boletim(req, res) {
  const alunoId = lerId(req.params.alunoId);

  const aluno = await prisma.aluno.findUnique({
    where: { id: alunoId },
    include: { turma: { select: { id: true, nome: true, anoLectivo: true } } },
  });

  if (!aluno) throw new ErroHttp(404, "Aluno não encontrado");

  const notas = await prisma.nota.findMany({
    where: { alunoId },
    include: { disciplina: { select: { id: true, nome: true } } },
    orderBy: [{ disciplina: { nome: "asc" } }, { trimestre: "asc" }],
  });

  // Agrupa as notas por disciplina: { disciplina, trimestres: {1, 2, 3} }
  const porDisciplina = new Map();

  for (const nota of notas) {
    if (!porDisciplina.has(nota.disciplinaId)) {
      porDisciplina.set(nota.disciplinaId, {
        disciplina: nota.disciplina,
        trimestres: { 1: null, 2: null, 3: null }, // null = ainda sem nota
      });
    }
    porDisciplina.get(nota.disciplinaId).trimestres[nota.trimestre] = nota.valor;
  }

  // Calcula a média de cada disciplina (só com os trimestres já lançados)
  const disciplinas = [...porDisciplina.values()].map((item) => ({
    ...item,
    media: media(Object.values(item.trimestres).filter((v) => v !== null)),
  }));

  // Média geral = média das médias das disciplinas
  const mediaGeral = media(disciplinas.map((d) => d.media).filter((m) => m !== null));

  res.json({
    aluno: {
      id: aluno.id,
      nome: aluno.nome,
      numeroProcesso: aluno.numeroProcesso,
      turma: aluno.turma,
    },
    disciplinas,
    mediaGeral,
  });
}
