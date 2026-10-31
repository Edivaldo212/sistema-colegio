// ============================================================
// Cliente do Prisma: a "ponte" entre o código e a base de dados.
// Criamos UMA única instância e reutilizamos em todo o projecto.
// ============================================================
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();