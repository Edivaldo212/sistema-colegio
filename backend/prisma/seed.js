// ============================================================
// Seed: cria o primeiro administrador do sistema.
// Pode correr várias vezes sem criar duplicados (upsert).
// Uso: npm run seed
// ============================================================
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const { ADMIN_NOME, ADMIN_EMAIL, ADMIN_SENHA } = process.env;

  if (!ADMIN_NOME || !ADMIN_EMAIL || !ADMIN_SENHA) {
    throw new Error("Define ADMIN_NOME, ADMIN_EMAIL e ADMIN_SENHA no .env");
  }

  // Ciframos a palavra-passe. O número 12 é o "custo": quanto maior,
  // mais difícil para um atacante, mas mais lento. 12 é um bom equilíbrio.
  const senhaCifrada = await bcrypt.hash(ADMIN_SENHA, 12);

  // upsert = "actualiza se existir, cria se não existir"
  const admin = await prisma.utilizador.upsert({
    where: { email: ADMIN_EMAIL },
    update: {}, // se já existe, não mexe em nada
    create: {
      nome: ADMIN_NOME,
      email: ADMIN_EMAIL,
      senha: senhaCifrada,
      papel: "ADMIN",
    },
  });

  console.log(`Administrador pronto: ${admin.email}`);
}

main()
  .catch((erro) => {
    console.error(erro.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());