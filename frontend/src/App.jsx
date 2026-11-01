// ============================================================
// Raiz da aplicação: define que página aparece em cada endereço.
// ============================================================
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AuthProvider from "./contexts/AuthProvider.jsx";
import RotaProtegida from "./components/RotaProtegida.jsx";
import Layout from "./components/Layout.jsx";
import Login from "./pages/Login.jsx";
import Painel from "./pages/Painel.jsx";
import Alunos from "./pages/Alunos.jsx";
import Turmas from "./pages/Turmas.jsx";
import Disciplinas from "./pages/Disciplinas.jsx";
import EmConstrucao from "./pages/EmConstrucao.jsx";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Pública */}
          <Route path="/login" element={<Login />} />

          {/* Privadas: só com login, dentro do Layout (menu + topo) */}
          <Route element={<RotaProtegida />}>
            <Route element={<Layout />}>
              <Route index element={<Painel />} />
              <Route path="alunos" element={<Alunos />} />
              <Route path="turmas" element={<Turmas />} />
              <Route path="disciplinas" element={<Disciplinas />} />
              <Route path="notas" element={<EmConstrucao titulo="Notas" />} />
            </Route>
          </Route>

          {/* Qualquer outro endereço volta ao início */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}