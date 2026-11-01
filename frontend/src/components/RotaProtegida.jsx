// ============================================================
// "Porteiro": só deixa passar quem está autenticado.
// Quem não estiver é enviado para o login.
// ============================================================
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

export default function RotaProtegida() {
  const { utilizador, carregando } = useAuth();

  if (carregando) return <p className="carregando">A carregar...</p>;
  if (!utilizador) return <Navigate to="/login" replace />;

  // Outlet = "aqui entra a página filha"
  return <Outlet />;
}
