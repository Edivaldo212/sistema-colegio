// ============================================================
// Ficheiro de arranque: liga o servidor a uma porta.
// ============================================================
import app from "./app.js";

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
  console.log(`Servidor a correr em http://localhost:${PORT}`);
});