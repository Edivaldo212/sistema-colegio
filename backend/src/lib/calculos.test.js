// ============================================================
// Testes das funções de cálculo.
// Correr com: npm test
// ============================================================
import { test } from "node:test";
import assert from "node:assert/strict";
import { arredondar, media } from "./calculos.js";

test("arredondar limita o número a 2 casas decimais", () => {
  assert.equal(arredondar(13.456), 13.46);
  assert.equal(arredondar(10), 10);
});

test("media devolve null quando a lista está vazia", () => {
  assert.equal(media([]), null);
});

test("media calcula a média de uma lista", () => {
  assert.equal(media([16, 12]), 14);
});

test("media arredonda o resultado a 2 casas decimais", () => {
  assert.equal(media([10, 11, 12.5]), 11.17);
});