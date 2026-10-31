// ============================================================
// Rotas de autenticação (todas começam por /api/auth)
// ============================================================
import { Router } from "express";
import rateLimit from "express-rate-limit";
import { login, perfil, registar } from "../controllers/auth.controller.js";
import { autenticar, autorizar } from "../middlewares/autenticar.js";

const router = Router();

// Máximo de 10 tentativas de login por IP a cada 15 minutos
const limitarLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: { erro: "Demasiadas tentativas. Tenta novamente dentro de 15 minutos." },
});

router.post("/login", limitarLogin, login);
router.get("/perfil", autenticar, perfil);
router.post("/registar", autenticar, autorizar("ADMIN"), registar);

export default router;