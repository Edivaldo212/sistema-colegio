// ============================================================
// Rotas das notas (todas começam por /api/notas)
// ============================================================
import { Router } from "express";
import { autenticar, autorizar } from "../middlewares/autenticar.js";
import * as notas from "../controllers/notas.controller.js";

const router = Router();

router.use(autenticar);

// Qualquer perfil pode consultar
router.get("/", notas.listar);
router.get("/boletim/:alunoId", notas.boletim);

// Só ADMIN e PROFESSOR podem lançar, corrigir e apagar notas
const lancamento = autorizar("ADMIN", "PROFESSOR");
router.post("/", lancamento, notas.criar);
router.put("/:id", lancamento, notas.actualizar);
router.delete("/:id", lancamento, notas.remover);

export default router;
