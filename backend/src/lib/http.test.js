// ============================================================
// Testes dos utilitários HTTP: lerId e validar.
// ============================================================
import { test } from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";
import { ErroHttp, lerId, validar } from "./http.js";

// Confirma que a função lança um ErroHttp com o código esperado
const erro400 = (erro) => erro instanceof ErroHttp && erro.status === 400;

test("lerId converte texto num número inteiro", () => {
  assert.equal(lerId("5"), 5);
});

test("lerId rejeita valores inválidos", () => {
  for (const invalido of ["abc", "0", "-3", "1.5", "", undefined]) {
    assert.throws(() => lerId(invalido), erro400);
  }
});

const esquema = z.object({ nome: z.string().min(3, "Nome demasiado curto") });

test("validar devolve os dados quando são válidos", () => {
  assert.deepEqual(validar(esquema, { nome: "Maria" }), { nome: "Maria" });
});

test("validar lança 400 com o nome do campo e o motivo", () => {
  assert.throws(
    () => validar(esquema, { nome: "Jo" }),
    (erro) => erro400(erro) && erro.message === "nome: Nome demasiado curto"
  );
});