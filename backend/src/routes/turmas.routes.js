// ============================================================
// Rotas das turmas (todas começam por /api/turmas)
// ============================================================
import { Router } from "express";
import { autenticar, autorizar } from "../middlewares/autenticar.js";
import * as turmas from "../controllers/turmas.controller.js";

const router = Router();

// Todas as rotas exigem login
router.use(autenticar);

// Qualquer perfil pode consultar
router.get("/", turmas.listar);
router.get("/:id", turmas.obter);

// Só ADMIN e SECRETARIA podem alterar
const gestao = autorizar("ADMIN", "SECRETARIA");
router.post("/", gestao, turmas.criar);
router.put("/:id", gestao, turmas.actualizar);
router.delete("/:id", gestao, turmas.remover);

export default router;
