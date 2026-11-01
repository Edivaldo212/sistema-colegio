// ============================================================
// Lógica dos alunos: listar (com pesquisa e paginação), obter,
// criar, actualizar e apagar.
// ============================================================
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { ErroHttp, lerId, validar } from "../lib/http.js";

// Data no formato AAAA-MM-DD, convertida para objecto Date
const dataISO = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Data no formato AAAA-MM-DD")
  .transform((valor) => new Date(valor))
  .refine((data) => !Number.isNaN(data.getTime()), "Data inválida");

// Regras dos dados de um aluno
const esquemaAluno = z.object({
  nome: z.string().trim().min(3, "Nome com pelo menos 3 caracteres"),
  numeroProcesso: z.string().trim().min(1, "Número de processo obrigatório"),
  dataNascimento: dataISO.nullable().optional(),
  estado: z.enum(["ACTIVO", "INACTIVO"]).optional(),
  turmaId: z.number().int().positive().nullable().optional(),
});

// Parâmetros aceites na listagem: ?pesquisa=maria&turmaId=1&pagina=1&limite=20
const esquemaListagem = z.object({
  pesquisa: z.string().trim().optional(),
  turmaId: z.coerce.number().int().positive().optional(),
  estado: z.enum(["ACTIVO", "INACTIVO"]).optional(),
  pagina: z.coerce.number().int().min(1).default(1),
  limite: z.coerce.number().int().min(1).max(100).default(20),
});

// Só mostramos da turma o que interessa na listagem
const incluirTurma = { turma: { select: { id: true, nome: true, anoLectivo: true } } };

// Confirma que a turma indicada existe (ignora se não foi indicada turma)
async function garantirTurma(turmaId) {
  if (turmaId == null) return;

  const turma = await prisma.turma.findUnique({
    where: { id: turmaId },
    select: { id: true },
  });

  if (!turma) throw new ErroHttp(404, "Turma não encontrada");
}

// GET /api/alunos
export async function listar(req, res) {
  const { pesquisa, turmaId, estado, pagina, limite } = validar(esquemaListagem, req.query);

  // Montamos o filtro só com o que foi pedido
  const where = {
    ...(estado && { estado }),
    ...(turmaId && { turmaId }),
    ...(pesquisa && {
      OR: [
        { nome: { contains: pesquisa, mode: "insensitive" } }, // ignora maiúsculas
        { numeroProcesso: { contains: pesquisa, mode: "insensitive" } },
      ],
    }),
  };

  const [total, dados] = await Promise.all([
    prisma.aluno.count({ where }),
    prisma.aluno.findMany({
      where,
      include: incluirTurma,
      orderBy: { nome: "asc" },
      skip: (pagina - 1) * limite, // quantos saltar
      take: limite, // quantos devolver
    }),
  ]);

  res.json({
    dados,
    total,
    pagina,
    limite,
    totalPaginas: Math.ceil(total / limite),
  });
}

// GET /api/alunos/:id
export async function obter(req, res) {
  const aluno = await prisma.aluno.findUnique({
    where: { id: lerId(req.params.id) },
    include: incluirTurma,
  });

  if (!aluno) throw new ErroHttp(404, "Aluno não encontrado");
  res.json(aluno);
}

// POST /api/alunos
export async function criar(req, res) {
  const dados = validar(esquemaAluno, req.body);
  await garantirTurma(dados.turmaId);

  const aluno = await prisma.aluno.create({ data: dados, include: incluirTurma });
  res.status(201).json(aluno);
}

// PUT /api/alunos/:id (só precisas de enviar os campos a alterar)
export async function actualizar(req, res) {
  const id = lerId(req.params.id);
  const dados = validar(esquemaAluno.partial(), req.body);
  await garantirTurma(dados.turmaId);

  const aluno = await prisma.aluno.update({
    where: { id },
    data: dados,
    include: incluirTurma,
  });
  res.json(aluno);
}

// DELETE /api/alunos/:id (as notas do aluno são apagadas em cascata)
export async function remover(req, res) {
  await prisma.aluno.delete({ where: { id: lerId(req.params.id) } });
  res.status(204).send();
}
