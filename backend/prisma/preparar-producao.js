// ============================================================
// Prepara a base de dados para produção:
//   1. Define uma NOVA palavra-passe para o administrador
//   2. Apaga todos os outros utilizadores (contas de teste)
// Uso: npm run preparar-producao
// ============================================================
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const { ADMIN_EMAIL, ADMIN_SENHA } = process.env;

  if (!ADMIN_EMAIL || !ADMIN_SENHA) {
    throw new Error("Define ADMIN_EMAIL e ADMIN_SENHA no .env");
  }

  // Exigimos uma senha forte para o ambiente público
  if (ADMIN_SENHA.length < 12) {
    throw new Error("A senha do administrador deve ter pelo menos 12 caracteres");
  }

  const senhaCifrada = await bcrypt.hash(ADMIN_SENHA, 12);

  // Se o admin não existir, este comando falha (não cria contas por engano)
  await prisma.utilizador.update({
    where: { email: ADMIN_EMAIL },
    data: { senha: senhaCifrada },
  });

  const apagados = await prisma.utilizador.deleteMany({
    where: { email: { not: ADMIN_EMAIL } },
  });

  console.log(`Senha do administrador actualizada: ${ADMIN_EMAIL}`);
  console.log(`Utilizadores de teste apagados: ${apagados.count}`);
}

main()
  .catch((erro) => {
    console.error(erro.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
