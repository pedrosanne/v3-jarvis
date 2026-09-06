import { createFileRoute } from "@tanstack/react-router";
import { Download, Chrome, CheckCircle2, Globe } from "lucide-react";
import { AppLayout } from "@/components/app-layout";

export const Route = createFileRoute("/extension")({
  head: () => ({
    meta: [
      { title: "Extensão Chrome — JARVIS AI" },
      {
        name: "description",
        content:
          "Baixe a extensão da JARVIS AI para Chrome e abra o scalper neural com 1 clique em qualquer aba.",
      },
      { property: "og:title", content: "Extensão Chrome — JARVIS AI" },
      {
        property: "og:description",
        content:
          "Lançador rápido da JARVIS AI com suporte a domínio personalizado.",
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
        a.download = "jarvis-extension.zip";
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
              <h2 className="text-lg font-semibold">J.A.R.V.I.S. — Painel lateral</h2>
              <p className="text-sm text-muted-foreground">
                O JARVIS completo fixo na lateral do navegador, sempre à mão.
              </p>
            </div>
          </div>

          <ul className="mt-5 space-y-2 text-sm">
            {[
              "Side panel nativo do Chrome — fica fixo na lateral da guia",
              "Acesso direto à JARVIS AI, Journal, Risk, Analytics e mais",
              "Pré-loader cinematográfico ao abrir",
              "Domínio e rota inicial configuráveis",
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
            <h3 className="text-base font-semibold">Domínio personalizado & Solução para Erro 404</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            A extensão embute a aplicação web. Se você visualizar a página de <strong>Erro 404</strong> ao abrir o painel lateral:
          </p>
          <ol className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
            <li>Clique no ícone de engrenagem (<strong>⚙</strong>) no cabeçalho da extensão.</li>
            <li>Insira a URL base do seu servidor (ex: <code className="rounded bg-muted px-1.5 py-0.5">https://seu-dominio.com</code> ou <code className="rounded bg-muted px-1.5 py-0.5">http://localhost:5173</code>).</li>
            <li>Defina a rota inicial como <code className="rounded bg-muted px-1.5 py-0.5">/jarvis</code> (ou <code className="rounded bg-muted px-1.5 py-0.5">/</code>) e clique em <strong>Salvar e recarregar</strong>.</li>
          </ol>
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
              Clique em <strong>Carregar sem compactação</strong> e selecione a pasta
              descompactada.
            </li>
            <li>
              Fixe a extensão na barra e clique no ícone — o JARVIS abre no <strong>painel
              lateral</strong> da guia atual. Arraste a borda para ajustar a largura.
            </li>
          </ol>
        </section>
      </div>
    </AppLayout>
  );
}
