"use client";

import { useRef, useState } from "react";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  FileUp,
  Link2,
  LockKeyhole,
  Upload,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";

export default function Home() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activityUrl, setActivityUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");


  function handleUrlSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!activityUrl.trim()) {
      setMessage("Introduz o link da atividade do Strava.");
      return;
    }

    try {
      const url = new URL(activityUrl.trim());

      if (
          url.hostname !== "strava.com" &&
          url.hostname !== "www.strava.com"
      ) {
        setMessage("Introduz um link válido de strava.com.");
        return;
      }

      const match = url.pathname.match(/^\/activities\/(\d+)/);

      if (!match) {
        setMessage("O link não parece corresponder a uma atividade do Strava.");
        return;
      }

      const activityId = match[1];
      const exportUrl = `https://www.strava.com/activities/${activityId}/export_tcx`;

      const newTab = window.open(exportUrl, "_blank");

      if (!newTab) {
        setMessage(
            "O navegador bloqueou a nova aba. Permite pop-ups para o RideMetrics e tenta novamente.",
        );
        return;
      }

      setMessage(
          "Abrimos a exportação TCX do Strava numa nova aba. Depois de descarregares o ficheiro, regressa ao RideMetrics e seleciona-o na área de upload.",
      );
    } catch {
      setMessage("O link introduzido não parece ser válido.");
    }
  }


  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    const extension = file.name.split(".").pop()?.toLowerCase();

    if (extension !== "tcx" && extension !== "gpx") {
      setSelectedFile(null);
      setMessage("Formato não suportado. Seleciona um ficheiro TCX ou GPX.");
      event.target.value = "";
      return;
    }

    setSelectedFile(file);
    setMessage("Ficheiro selecionado. A importação será ligada ao backend numa próxima etapa.");
  }

  return (
      <main className="min-h-screen bg-[#0b1220] text-white">
        <SiteHeader />

        <section className="mx-auto max-w-7xl px-6 pb-10 pt-16 md:pb-16 md:pt-24">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-lime-300/20 bg-lime-300/10 px-3 py-1.5 text-xs font-medium text-lime-200">
              <Activity size={14} />
              OS TEUS DADOS. O TEU PROGRESSO.
            </div>

            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
              Cada volta conta.
              <span className="mt-2 block text-lime-300">
              Treina com dados.
            </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-400 md:text-lg">
              Transforma as tuas atividades de ciclismo em informação útil.
              Analisa distância, velocidade, potência, frequência cardíaca e
              evolução ao longo do tempo.
            </p>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-6 px-6 pb-20 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-lime-300">
              <Link2 size={24} />
            </div>

            <p className="text-sm font-medium text-lime-300">PASSO 01</p>
            <h2 className="mt-2 text-2xl font-semibold">
              Encontra a tua atividade
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Cola o link da atividade do Strava para receberes indicações de
              como exportar o ficheiro.
            </p>

            <form onSubmit={handleUrlSubmit} className="mt-6 space-y-3">
              <label htmlFor="activity-url" className="text-sm text-slate-300">
                Link da atividade
              </label>

              <input
                  id="activity-url"
                  type="url"
                  value={activityUrl}
                  onChange={(event) => setActivityUrl(event.target.value)}
                  placeholder="https://www.strava.com/activities/..."
                  className="w-full rounded-xl border border-white/15 bg-[#0b1220] px-4 py-3 text-sm outline-none transition placeholder:text-slate-600 focus:border-lime-300"
              />

              <button
                  type="submit"
                  className="w-full rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold transition hover:bg-white/15"
              >
                Ver instruções de exportação
                <ArrowRight className="ml-2 inline" size={16} />
              </button>
            </form>

            <div className="mt-5 flex gap-3 rounded-xl bg-white/[0.04] p-4">
              <LockKeyhole className="mt-0.5 shrink-0 text-slate-400" size={18} />
              <p className="text-xs leading-5 text-slate-400">
                Não precisas de partilhar a tua palavra-passe do Strava. A
                exportação é feita diretamente na plataforma.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-300/10 text-lime-300">
              <FileUp size={24} />
            </div>

            <p className="text-sm font-medium text-lime-300">PASSO 02</p>
            <h2 className="mt-2 text-2xl font-semibold">
              Importa os teus dados
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Seleciona o ficheiro exportado para preparar a análise da tua
              atividade.
            </p>

            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-6 flex min-h-52 w-full flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-[#0b1220] p-6 text-center transition hover:border-lime-300/60 hover:bg-lime-300/[0.03]"
            >
              {selectedFile ? (
                  <CheckCircle2 className="mb-4 text-lime-300" size={36} />
              ) : (
                  <Upload className="mb-4 text-lime-300" size={36} />
              )}

              <span className="font-semibold">
              {selectedFile ? selectedFile.name : "Selecionar ficheiro"}
            </span>

              <span className="mt-2 text-sm text-slate-400">
              {selectedFile
                  ? `${(selectedFile.size / 1024).toFixed(1)} KB`
                  : "Escolhe um ficheiro TCX ou GPX"}
            </span>

              <span className="mt-4 rounded-lg bg-lime-300 px-4 py-2 text-sm font-semibold text-slate-950">
              Procurar ficheiro
            </span>
            </button>

            <input
                ref={fileInputRef}
                type="file"
                accept=".tcx,.gpx,application/xml,text/xml"
                onChange={handleFileChange}
                className="hidden"
            />

            <p className="mt-4 text-xs leading-5 text-slate-500">
              Nesta versão, o ficheiro fica apenas selecionado no navegador. O
              envio e o processamento serão implementados depois.
            </p>
          </div>
        </section>

        {message && (
            <div
                role="status"
                className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-xl rounded-2xl border border-lime-300/20 bg-[#172334] p-4 text-sm leading-6 text-slate-100 shadow-2xl"
            >
              {message}
              <button
                  type="button"
                  onClick={() => setMessage("")}
                  className="ml-3 font-semibold text-lime-300 underline"
              >
                Fechar
              </button>
            </div>
        )}

        <footer className="border-t border-white/10 px-6 py-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} RideMetrics</p>
            <p>Feito para quem quer compreender melhor cada treino.</p>
          </div>
        </footer>
      </main>
  );
}
