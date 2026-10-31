// ============================================================
// Rotas dos alunos (todas começam por /api/alunos)
// ============================================================
import { Router } from "express";
import { autenticar, autorizar } from "../middlewares/autenticar.js";
import * as alunos from "../controllers/alunos.controller.js";

const router = Router();

router.use(autenticar);

router.get("/", alunos.listar);
router.get("/:id", alunos.obter);

const gestao = autorizar("ADMIN", "SECRETARIA");
router.post("/", gestao, alunos.criar);
router.put("/:id", gestao, alunos.actualizar);
router.delete("/:id", gestao, alunos.remover);

export default router;