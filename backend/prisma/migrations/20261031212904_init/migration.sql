-- CreateEnum
CREATE TYPE "Papel" AS ENUM ('ADMIN', 'PROFESSOR', 'SECRETARIA');

-- CreateEnum
CREATE TYPE "EstadoAluno" AS ENUM ('ACTIVO', 'INACTIVO');

-- CreateTable
CREATE TABLE "utilizadores" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "papel" "Papel" NOT NULL DEFAULT 'PROFESSOR',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "utilizadores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "turmas" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "anoLectivo" INTEGER NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "turmas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alunos" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "numeroProcesso" TEXT NOT NULL,
    "dataNascimento" TIMESTAMP(3),
    "estado" "EstadoAluno" NOT NULL DEFAULT 'ACTIVO',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "turmaId" INTEGER,

    CONSTRAINT "alunos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disciplinas" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "disciplinas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notas" (
    "id" SERIAL NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "trimestre" INTEGER NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "alunoId" INTEGER NOT NULL,
    "disciplinaId" INTEGER NOT NULL,

    CONSTRAINT "notas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "utilizadores_email_key" ON "utilizadores"("email");

-- CreateIndex
CREATE UNIQUE INDEX "turmas_nome_anoLectivo_key" ON "turmas"("nome", "anoLectivo");

-- CreateIndex
CREATE UNIQUE INDEX "alunos_numeroProcesso_key" ON "alunos"("numeroProcesso");

-- CreateIndex
CREATE UNIQUE INDEX "disciplinas_nome_key" ON "disciplinas"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "notas_alunoId_disciplinaId_trimestre_key" ON "notas"("alunoId", "disciplinaId", "trimestre");

-- AddForeignKey
ALTER TABLE "alunos" ADD CONSTRAINT "alunos_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "turmas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notas" ADD CONSTRAINT "notas_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "alunos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notas" ADD CONSTRAINT "notas_disciplinaId_fkey" FOREIGN KEY ("disciplinaId") REFERENCES "disciplinas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
