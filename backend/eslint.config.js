// ============================================================
// Configuração do ESLint para o backend (Node.js).
// ============================================================
import js from "@eslint/js";
import globals from "globals";

export default [
  // Pastas que o ESLint deve ignorar
  { ignores: ["node_modules/", "prisma/migrations/"] },

  // Regras recomendadas pelo próprio ESLint
  js.configs.recommended,

  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module", // usamos import/export
      globals: globals.node, // process, console, etc.
    },
    rules: {
      // O Express exige 4 parâmetros no tratador de erros,
      // por isso o "next" pode ficar sem uso.
      "no-unused-vars": ["error", { argsIgnorePattern: "^next$" }],
    },
  },
];
