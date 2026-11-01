// ============================================================
// Rotas das disciplinas (todas começam por /api/disciplinas)
// ============================================================
import { Router } from "express";
import { autenticar, autorizar } from "../middlewares/autenticar.js";
import * as disciplinas from "../controllers/disciplinas.controller.js";

const router = Router();

router.use(autenticar);

router.get("/", disciplinas.listar);
router.get("/:id", disciplinas.obter);

const gestao = autorizar("ADMIN", "SECRETARIA");
router.post("/", gestao, disciplinas.criar);
router.put("/:id", gestao, disciplinas.actualizar);
router.delete("/:id", gestao, disciplinas.remover);

export default router;
