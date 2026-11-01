// ============================================================
// Página de Notas: duas abas (Lançamento e Boletim).
// Carrega aqui as turmas e disciplinas, uma só vez, e passa-as às abas.
// ============================================================
import { useEffect, useState } from "react";
import { api } from "../services/api.js";
import LancamentoNotas from "../components/LancamentoNotas.jsx";
import BoletimAluno from "../components/BoletimAluno.jsx";

export default function Notas() {
  const [aba, setAba] = useState("lancamento");
  const [dados, setDados] = useState(null); // { turmas, disciplinas }
  const [erro, setErro] = useState("");

  useEffect(() => {
    let activo = true;

    Promise.all([api.get("/turmas"), api.get("/disciplinas")])
      .then(([turmas, disciplinas]) => activo && setDados({ turmas, disciplinas }))
      .catch((e) => activo && setErro(e.message));

    return () => {
      activo = false;
    };
  }, []);

  if (erro) return <p className="mensagem-erro" role="alert">{erro}</p>;
  if (!dados) return <p className="carregando">A carregar...</p>;

  const { turmas, disciplinas } = dados;

  return (
    <>
      <div className="cabecalho-pagina nao-imprimir">
        <h1>Notas</h1>
      </div>

      {turmas.length === 0 || disciplinas.length === 0 ? (
        <p className="vazio">
          Para lançar notas, cria primeiro pelo menos uma turma e uma disciplina.
        </p>
      ) : (
        <>
          <div className="abas nao-imprimir" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={aba === "lancamento"}
              className={aba === "lancamento" ? "aba aba--activa" : "aba"}
              onClick={() => setAba("lancamento")}
            >
              Lançamento
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={aba === "boletim"}
              className={aba === "boletim" ? "aba aba--activa" : "aba"}
              onClick={() => setAba("boletim")}
            >
              Boletim
            </button>
          </div>

          {aba === "lancamento" ? (
            <LancamentoNotas turmas={turmas} disciplinas={disciplinas} />
          ) : (
            <BoletimAluno turmas={turmas} />
          )}
        </>
      )}
    </>
  );
}