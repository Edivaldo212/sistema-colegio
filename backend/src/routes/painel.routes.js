// ============================================================
// Rota do painel (/api/painel)
// ============================================================
import { Router } from "express";
import { autenticar } from "../middlewares/autenticar.js";
import { resumo } from "../controllers/painel.controller.js";

const router = Router();

router.get("/", autenticar, resumo);

export default router;
