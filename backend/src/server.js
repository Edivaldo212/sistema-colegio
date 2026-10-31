// ============================================================
// Ficheiro de arranque: liga o servidor a uma porta.
// ============================================================
import app from "./app.js";

const PORT = process.env.PORT || 3333;

// No Express 5, o callback recebe um erro se a porta não puder ser usada
app.listen(PORT, (erro) => {
  if (erro) {
    console.error(`Não foi possível arrancar na porta ${PORT}:`, erro.message);
    process.exit(1);
  }
  console.log(`Servidor a correr em http://localhost:${PORT}`);
});