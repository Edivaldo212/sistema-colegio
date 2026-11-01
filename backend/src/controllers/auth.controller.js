// ============================================================
// Lógica de autenticação: login, perfil e registo de utilizadores.
// ============================================================
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";

// --- Regras de validação dos dados recebidos ---
const esquemaLogin = z.object({
  email: z.string().email("Email inválido"),
  senha: z.string().min(1, "Palavra-passe obrigatória"),
});

const esquemaRegisto = z.object({
  nome: z.string().min(3, "Nome com pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  senha: z.string().min(8, "Palavra-passe com pelo menos 8 caracteres"),
  papel: z.enum(["ADMIN", "PROFESSOR", "SECRETARIA"]),
});

// POST /api/auth/login
export async function login(req, res) {
  const dados = esquemaLogin.safeParse(req.body);
  if (!dados.success) {
    return res.status(400).json({ erro: dados.error.issues[0].message });
  }

  const { email, senha } = dados.data;

  const utilizador = await prisma.utilizador.findUnique({ where: { email } });

  // Compara a senha enviada com o hash guardado
  const senhaCorreta = utilizador ? await bcrypt.compare(senha, utilizador.senha) : false;

  // Mesma mensagem para "email não existe" e "senha errada":
  // assim não revelamos a um atacante quais emails existem.
  if (!utilizador || !senhaCorreta) {
    return res.status(401).json({ erro: "Email ou palavra-passe incorrectos" });
  }

  // Cria o token com o id (subject) e o perfil do utilizador
  const token = jwt.sign({ papel: utilizador.papel }, process.env.JWT_SECRET, {
    subject: String(utilizador.id),
    expiresIn: process.env.JWT_EXPIRA_EM || "8h",
  });

  res.json({
    token,
    utilizador: {
      id: utilizador.id,
      nome: utilizador.nome,
      email: utilizador.email,
      papel: utilizador.papel,
    },
  });
}

// GET /api/auth/perfil -> devolve os dados de quem está autenticado
export async function perfil(req, res) {
  const utilizador = await prisma.utilizador.findUnique({
    where: { id: req.utilizador.id },
    select: { id: true, nome: true, email: true, papel: true }, // sem a senha!
  });

  if (!utilizador) {
    return res.status(404).json({ erro: "Utilizador não encontrado" });
  }

  res.json(utilizador);
}

// POST /api/auth/registar -> só um ADMIN cria novos utilizadores
export async function registar(req, res) {
  const dados = esquemaRegisto.safeParse(req.body);
  if (!dados.success) {
    return res.status(400).json({ erro: dados.error.issues[0].message });
  }

  const { nome, email, senha, papel } = dados.data;

  const jaExiste = await prisma.utilizador.findUnique({ where: { email } });
  if (jaExiste) {
    return res.status(409).json({ erro: "Já existe um utilizador com este email" });
  }

  const senhaCifrada = await bcrypt.hash(senha, 12);

  const novo = await prisma.utilizador.create({
    data: { nome, email, senha: senhaCifrada, papel },
    select: { id: true, nome: true, email: true, papel: true },
  });

  res.status(201).json(novo);
}
