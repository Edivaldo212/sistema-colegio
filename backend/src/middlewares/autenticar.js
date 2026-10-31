// ============================================================
// Middlewares de autenticação e autorização.
//
// autenticar -> confirma que o utilizador enviou um token válido
// autorizar  -> confirma que o perfil dele tem permissão
// ============================================================
import jwt from "jsonwebtoken";

// O token vem no cabeçalho: Authorization: Bearer <token>
export function autenticar(req, res, next) {
  const cabecalho = req.headers.authorization;

  if (!cabecalho?.startsWith("Bearer ")) {
    return res.status(401).json({ erro: "Token de acesso em falta" });
  }

  const token = cabecalho.slice(7); // remove "Bearer "

  try {
    // verify lança erro se o token for falso ou estiver expirado
    const dados = jwt.verify(token, process.env.JWT_SECRET);

    // Guardamos quem é o utilizador no pedido, para as rotas usarem
    req.utilizador = { id: Number(dados.sub), papel: dados.papel };
    next();
  } catch {
    return res.status(401).json({ erro: "Token inválido ou expirado" });
  }
}

// Uso: autorizar("ADMIN", "SECRETARIA") -> só estes perfis passam
export function autorizar(...papeisPermitidos) {
  return (req, res, next) => {
    if (!papeisPermitidos.includes(req.utilizador.papel)) {
      return res.status(403).json({ erro: "Sem permissão para esta acção" });
    }
    next();
  };
}