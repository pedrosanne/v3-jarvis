import { createFileRoute } from "@tanstack/react-router";
import { Download, Chrome, CheckCircle2, Globe } from "lucide-react";
import { AppLayout } from "@/components/app-layout";

export const Route = createFileRoute("/extension")({
  head: () => ({
    meta: [
      { title: "Extensão Chrome — Iara AI" },
      {
        name: "description",
        content:
          "Baixe a extensão da Iara AI para Chrome e abra o scalper neural com 1 clique em qualquer aba.",
      },
      { property: "og:title", content: "Extensão Chrome — Iara AI" },
      {
        property: "og:description",
        content:
          "Lançador rápido da Iara AI com suporte a domínio personalizado.",
      },
    ],
  }),
  component: ExtensionPage,
});

function ExtensionPage() {
  const download = () => {
    fetch("/daytrader-extension.zip")
      .then((res) => {
        if (!res.ok) throw new Error(`Falha no download: ${res.status}`);
        return res.blob();
      })
      .then((blob) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "iara-ai-extension.zip";
        a.click();
        URL.revokeObjectURL(a.href);
      })
      .catch((err) => alert(err.message));
  };

  return (
    <AppLayout title="Extensão Chrome">
      <div className="mx-auto max-w-2xl space-y-6">
        <section className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Chrome className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Iara AI para Chrome</h2>
              <p className="text-sm text-muted-foreground">
                Abra a Iara em 1 clique, de qualquer aba.
              </p>
            </div>
          </div>

          <ul className="mt-5 space-y-2 text-sm">
            {[
              "Lançador focado 100% na Iara AI",
              "Botão secundário para abrir o app completo",
              "Domínio configurável — funciona com qualquer deploy",
              "Compatível com Chrome, Edge, Brave, Arc e Opera",
            ].map((f) => (
              <li key={f} className="flex items-start gap-2 text-foreground">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{f}</span>
              </li>
            ))}
          </ul>

          <button
            onClick={download}
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            <Download className="h-4 w-4" />
            Baixar extensão (.zip)
          </button>
        </section>

        <section className="rounded-xl border border-border bg-card p-6">
          <div className="mb-3 flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            <h3 className="text-base font-semibold">Domínio personalizado</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            A extensão aponta por padrão para a URL pública do app. Para usar com seu próprio
            domínio (produção, staging, self-hosted), clique no ícone <strong>⚙</strong> no canto
            superior direito do popup e informe a URL base (ex.{" "}
            <code className="rounded bg-muted px-1.5 py-0.5">https://app.seudominio.com</code>). O
            valor fica salvo localmente — basta atualizar quando trocar de deploy.
          </p>
        </section>

        <section className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-base font-semibold">Como instalar</h3>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-foreground">
            <li>Descompacte o arquivo baixado.</li>
            <li>
              Abra <code className="rounded bg-muted px-1.5 py-0.5">chrome://extensions</code> no
              Chrome (ou outro navegador Chromium).
            </li>
            <li>
              Ative o <strong>Modo do desenvolvedor</strong> no canto superior direito.
            </li>
            <li>
              Clique em <strong>Carregar sem compactação</strong> e selecione a pasta descompactada.
            </li>
            <li>Fixe a extensão na barra. Clique nela e use o botão grande para abrir a Iara.</li>
          </ol>
        </section>
      </div>
    </AppLayout>
  );
}
