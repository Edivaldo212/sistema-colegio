// ============================================================
// Dados de exemplo (fictícios) para demonstração e portfólio.
// Pode correr várias vezes sem criar duplicados.
// Uso: npm run seed-demo
// ============================================================
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ANO = 2026;
const TURMAS = ["9ª A", "10ª A", "11ª B"];
const DISCIPLINAS = [
  "Matemática",
  "Língua Portuguesa",
  "Física",
  "Química",
  "Biologia",
  "História",
  "Inglês",
];

// Nomes fictícios: 15 nomes x 17 apelidos, combinados de forma variada
const NOMES = [
  "Maria",
  "João",
  "Ana",
  "Pedro",
  "Luísa",
  "Miguel",
  "Beatriz",
  "Tomás",
  "Joana",
  "Rui",
  "Carla",
  "Paulo",
  "Sofia",
  "Mateus",
  "Helena",
];
const APELIDOS = [
  "Silva",
  "Santos",
  "Ferreira",
  "Costa",
  "Pereira",
  "Fernandes",
  "Baptista",
  "Cardoso",
  "Gomes",
  "Neto",
  "Lopes",
  "Mendes",
  "Rocha",
  "Tavares",
  "Domingos",
  "Ribeiro",
  "Cunha",
];

// Gerador de números "aleatórios" com semente fixa: dá sempre os mesmos
// valores, por isso correr o script duas vezes não cria notas diferentes.
function gerador(semente) {
  let s = semente;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

async function main() {
  const aleatorio = gerador(2026);

  // 1. Turmas (upsert: cria se não existir)
  for (const nome of TURMAS) {
    await prisma.turma.upsert({
      where: { nome_anoLectivo: { nome, anoLectivo: ANO } },
      update: {},
      create: { nome, anoLectivo: ANO },
    });
  }

  // 2. Disciplinas (skipDuplicates ignora as que já existem)
  await prisma.disciplina.createMany({
    data: DISCIPLINAS.map((nome) => ({ nome })),
    skipDuplicates: true,
  });

  const turmas = await prisma.turma.findMany({
    where: { anoLectivo: ANO, nome: { in: TURMAS } },
  });
  const disciplinas = await prisma.disciplina.findMany({
    where: { nome: { in: DISCIPLINAS } },
  });

  // 3. Alunos: 10 por turma
  const alunos = [];
  for (let i = 0; i < 30; i++) {
    const indiceTurma = Math.floor(i / 10);
    const turma = turmas.find((t) => t.nome === TURMAS[indiceTurma]);

    alunos.push({
      nome: `${NOMES[i % NOMES.length]} ${APELIDOS[(i * 7 + 3) % APELIDOS.length]}`,
      numeroProcesso: `D${ANO}${String(i + 1).padStart(3, "0")}`,
      dataNascimento: new Date(Date.UTC(ANO - 15 - indiceTurma, (i * 5) % 12, 1 + ((i * 11) % 28))),
      turmaId: turma.id,
    });
  }

  await prisma.aluno.createMany({ data: alunos, skipDuplicates: true });

  const alunosGuardados = await prisma.aluno.findMany({
    where: { numeroProcesso: { startsWith: `D${ANO}` } },
  });

  // 4. Notas do 1º e 2º trimestres (entre 7 e 17, de meio em meio valor)
  const notas = [];
  for (const aluno of alunosGuardados) {
    for (const disciplina of disciplinas) {
      for (const trimestre of [1, 2]) {
        notas.push({
          alunoId: aluno.id,
          disciplinaId: disciplina.id,
          trimestre,
          valor: Math.round((7 + aleatorio() * 10) * 2) / 2,
        });
      }
    }
  }

  const resultado = await prisma.nota.createMany({ data: notas, skipDuplicates: true });

  console.log(`Turmas: ${turmas.length}`);
  console.log(`Disciplinas: ${disciplinas.length}`);
  console.log(`Alunos de exemplo: ${alunosGuardados.length}`);
  console.log(`Notas criadas agora: ${resultado.count}`);
}

main()
  .catch((erro) => {
    console.error(erro.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
