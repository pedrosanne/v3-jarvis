import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Check,
  ChevronRight,
  Clock,
  CreditCard,
  Lock,
  Mail,
  Phone,
  QrCode,
  Shield,
  ShieldCheck,
  Sparkles,
  User,
  X,
  Zap,
  Bitcoin,
  Rocket,
  Users,
  EyeOff,
  Eye,
  Trophy,
  Megaphone,
  Wallet,
  Award,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Step = 1 | 2 | 3 | 4 | 5;
type PayMethod = "pix" | "card" | "crypto";
type ResellMode = "appear" | "anon";

interface Props {
  open: boolean;
  onClose: () => void;
  priceLabel?: string;
}

// ----- Validators -----
const validEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
const digits = (v: string) => v.replace(/\D/g, "");
const validPhone = (v: string) => {
  const d = digits(v);
  return d.length >= 10 && d.length <= 13;
};
const validName = (v: string) => {
  const parts = v.trim().split(/\s+/);
  return parts.length >= 2 && parts.every((p) => p.length >= 2);
};
const maskPhone = (v: string) => {
  const d = digits(v).slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};

export function OfertaCheckoutModal({ open, onClose, priceLabel = "R$ 997" }: Props) {
  const [step, setStep] = useState<Step>(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [touched, setTouched] = useState<{ [k: string]: boolean }>({});
  const [method, setMethod] = useState<PayMethod | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resellMode, setResellMode] = useState<ResellMode | null>(null);
  const [upsellAccepted, setUpsellAccepted] = useState(false);
  const firstInputRef = useRef<HTMLInputElement | null>(null);

  // Reset ao fechar
  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        setStep(1);
        setTouched({});
        setSubmitting(false);
        setMethod(null);
        setResellMode(null);
        setUpsellAccepted(false);
      }, 250);
      return () => clearTimeout(t);
    }
  }, [open]);

  // ESC + lock scroll
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    setTimeout(() => firstInputRef.current?.focus(), 60);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const errors = {
    name: !validName(name) ? "Digite seu nome completo (nome + sobrenome)." : "",
    email: !validEmail(email) ? "Informe um e-mail válido." : "",
    phone: !validPhone(phone) ? "Informe um WhatsApp válido com DDD." : "",
  };
  const step1Valid = !errors.name && !errors.email && !errors.phone;

  // Progresso gamificado
  const progress = useMemo(() => {
    let p = 0;
    if (validName(name)) p += 12;
    if (validEmail(email)) p += 12;
    if (validPhone(phone)) p += 12;
    if (step >= 2) p = Math.max(p, 50);
    if (method) p = Math.max(p, 65);
    if (step >= 3) p = Math.max(p, 75);
    if (step >= 4) p = Math.max(p, 90);
    if (step === 5) p = 100;
    return p;
  }, [name, email, phone, step, method]);

  const handleNext = () => {
    setTouched({ name: true, email: true, phone: true });
    if (!step1Valid) return;
    setStep(2);
  };

  const handleFinish = async () => {
    if (!method) return;
    setSubmitting(true);
    // Persistência local — futura integração com Mercado Pago/crypto vai consumir isso
    try {
      localStorage.setItem(
        "jarvis_lead",
        JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: digits(phone),
          method,
          created_at: new Date().toISOString(),
        }),
      );
    } catch { /* ignore */ }
    await new Promise((r) => setTimeout(r, 900));
    setSubmitting(false);
    setStep(3);
  };

  if (typeof document === "undefined" || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center overflow-y-auto bg-black/80 p-0 backdrop-blur-md sm:items-center sm:p-4">
      {/* Backdrop click */}
      <button
        aria-label="Fechar"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="oferta-modal-title"
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-t-3xl border border-cyan-400/40 bg-gradient-to-b from-[#050b12] via-[#04080d] to-[#03060a] shadow-[0_0_120px_-10px_rgba(34,211,238,0.7)] sm:rounded-3xl"
      >
        {/* Grid + glow decor */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(34,211,238,.7)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,.7)_1px,transparent_1px)] [background-size:22px_22px]" />
        <div className="pointer-events-none absolute -top-24 left-1/2 h-56 w-[130%] -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />

        {/* Header */}
        <div className="relative flex items-center justify-between border-b border-cyan-500/20 px-6 py-4">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.28em] text-cyan-200">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300 shadow-[0_0_8px_2px_rgba(110,231,183,0.8)]" />
            JARVIS • Ativação segura
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-full p-1.5 text-cyan-300/70 transition-colors hover:bg-cyan-500/10 hover:text-cyan-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Steps */}
        <div className="relative px-6 pt-5">
          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.24em]">
            <StepDot n={1} active={step >= 1} done={step > 1} label="Dados" />
            <div className="mx-2 h-px flex-1 bg-gradient-to-r from-cyan-500/20 via-cyan-400/60 to-cyan-500/20" />
            <StepDot n={2} active={step >= 2} done={step > 2} label="Pagamento" />
            <div className="mx-2 h-px flex-1 bg-gradient-to-r from-cyan-500/20 via-cyan-400/60 to-cyan-500/20" />
            <StepDot n={3} active={step >= 3} done={step > 3} label="Vaga" />
            <div className="mx-2 h-px flex-1 bg-gradient-to-r from-cyan-500/20 via-cyan-400/60 to-cyan-500/20" />
            <StepDot n={4} active={step >= 4} done={step > 4} label="Bônus" />
          </div>
          <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-cyan-950/60">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-cyan-300 to-emerald-300 shadow-[0_0_18px_rgba(34,211,238,0.9)] transition-[width] duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Body */}
        <div className="relative px-6 pb-6 pt-6">
          {step === 1 && (
            <div className="animate-in fade-in duration-300">
              <div className="mb-4 flex items-start gap-3 rounded-xl border border-emerald-400/30 bg-emerald-500/[0.06] p-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-emerald-400/40 bg-emerald-500/10 text-emerald-300">
                  <Zap className="h-4 w-4" />
                </div>
                <div className="text-sm">
                  <div className="font-semibold text-emerald-100">
                    Você vai receber o acesso ao JARVIS <span className="text-emerald-300">agora mesmo</span>
                  </div>
                  <div className="mt-0.5 text-xs text-emerald-100/70">
                    Enviamos por <b>e-mail</b> e <b>WhatsApp</b> assim que o pagamento for confirmado.
                  </div>
                </div>
              </div>

              <h3 id="oferta-modal-title" className="text-lg font-bold text-cyan-100">
                Confirme para onde enviar seu acesso
              </h3>
              <p className="mt-1 text-xs text-cyan-200/60">
                Use dados reais. É por aqui que sua licença JARVIS será liberada.
              </p>

              <div className="mt-5 space-y-4">
                <Field
                  ref={firstInputRef}
                  icon={User}
                  label="Nome completo"
                  placeholder="Ex.: João Pereira da Silva"
                  value={name}
                  onChange={setName}
                  onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                  error={touched.name ? errors.name : ""}
                  valid={validName(name)}
                  autoComplete="name"
                />
                <Field
                  icon={Mail}
                  label="Seu melhor e-mail"
                  placeholder="voce@email.com"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                  error={touched.email ? errors.email : ""}
                  valid={validEmail(email)}
                  autoComplete="email"
                  inputMode="email"
                />
                <Field
                  icon={Phone}
                  label="WhatsApp com DDD"
                  placeholder="(11) 99999-9999"
                  type="tel"
                  value={phone}
                  onChange={(v) => setPhone(maskPhone(v))}
                  onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
                  error={touched.phone ? errors.phone : ""}
                  valid={validPhone(phone)}
                  autoComplete="tel"
                  inputMode="tel"
                />
              </div>

              <button
                onClick={handleNext}
                disabled={!step1Valid}
                className={cn(
                  "group mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-black uppercase tracking-[0.18em] transition-all",
                  step1Valid
                    ? "bg-gradient-to-r from-cyan-400 via-cyan-300 to-cyan-400 text-black shadow-[0_0_40px_-6px_rgba(34,211,238,0.95)] hover:scale-[1.02]"
                    : "cursor-not-allowed bg-cyan-500/10 text-cyan-300/40",
                )}
              >
                Avançar para pagamento
                <ChevronRight className="h-4 w-4 transition-transform group-enabled:group-hover:translate-x-0.5" />
              </button>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 font-mono text-[10px] uppercase tracking-[0.22em] text-cyan-300/60">
                <span className="inline-flex items-center gap-1.5"><Lock className="h-3 w-3" /> Dados criptografados</span>
                <span className="inline-flex items-center gap-1.5"><Shield className="h-3 w-3" /> LGPD</span>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-3 duration-300">
              <div className="mb-4 flex items-center justify-between rounded-xl border border-cyan-500/25 bg-black/50 px-4 py-3">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-cyan-300/70">Você paga hoje</div>
                  <div className="text-2xl font-black text-amber-100 drop-shadow-[0_0_14px_rgba(251,191,36,0.6)]">
                    {priceLabel}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-cyan-300/70">Vaga reservada</div>
                  <div className="mt-0.5 inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.22em] text-emerald-200">
                    <Clock className="h-3 w-3" /> 15 min
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-bold text-cyan-100">Como você prefere pagar?</h3>
              <p className="mt-1 text-xs text-cyan-200/60">
                Escolha a forma de pagamento. Acesso liberado assim que confirmarmos.
              </p>

              <div className="mt-5 space-y-3">
                <PayOption
                  active={method === "pix"}
                  onClick={() => setMethod("pix")}
                  icon={QrCode}
                  title="PIX"
                  subtitle="Aprovação em segundos • Liberação imediata"
                  badge="+ rápido"
                  badgeTone="emerald"
                />
                <PayOption
                  active={method === "card"}
                  onClick={() => setMethod("card")}
                  icon={CreditCard}
                  title="Cartão de crédito"
                  subtitle="Até 10x sem juros • Visa, Master, Elo, Amex"
                />
                <PayOption
                  active={method === "crypto"}
                  onClick={() => setMethod("crypto")}
                  icon={Bitcoin}
                  title="Criptomoeda"
                  subtitle="USDT, BTC, ETH • Rede automática"
                  badge="anônimo"
                  badgeTone="cyan"
                />
              </div>

              {/* Trust panel */}
              <div className="mt-5 rounded-xl border border-cyan-500/20 bg-black/40 p-4">
                {method === "crypto" ? (
                  <div className="flex items-start gap-3 text-xs text-cyan-100/80">
                    <Bitcoin className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                    <span>
                      Pagamentos em cripto são processados na rede que você escolher.
                      Após confirmar, você recebe o endereço da carteira e o QR code.
                    </span>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 text-xs text-cyan-100/80">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                    <span>
                      <b className="text-cyan-100">PIX e cartão</b> são processados pelo{" "}
                      <b className="text-cyan-100">Mercado Pago</b> — ambiente <b>100% seguro</b>,
                      certificado PCI DSS. A Lovable/JARVIS <b>não armazena</b> seus dados de cartão.
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-6 grid grid-cols-[auto,1fr] items-center gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="rounded-full border border-cyan-500/30 bg-black/40 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.22em] text-cyan-200 hover:bg-cyan-500/10"
                >
                  Voltar
                </button>
                <button
                  onClick={handleFinish}
                  disabled={!method || submitting}
                  className={cn(
                    "group inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-black uppercase tracking-[0.18em] transition-all",
                    method && !submitting
                      ? "bg-gradient-to-r from-amber-300 via-amber-200 to-amber-300 text-black shadow-[0_0_40px_-6px_rgba(251,191,36,0.95)] hover:scale-[1.02]"
                      : "cursor-not-allowed bg-cyan-500/10 text-cyan-300/40",
                  )}
                >
                  {submitting ? (
                    <>
                      <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-black/40 border-t-black" />
                      Reservando vaga…
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" />
                      Finalizar por {priceLabel}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in zoom-in-95 py-6 text-center duration-500">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-emerald-400/60 bg-emerald-500/10 shadow-[0_0_60px_-6px_rgba(52,211,153,0.9)]">
                <Check className="h-10 w-10 text-emerald-300" />
              </div>
              <h3 className="mt-5 text-2xl font-black text-cyan-50">Vaga reservada!</h3>
              <p className="mx-auto mt-2 max-w-sm text-sm text-cyan-100/70">
                Enviamos as instruções de pagamento para o seu e-mail{" "}
                <b className="text-cyan-100">{email}</b> e WhatsApp{" "}
                <b className="text-cyan-100">{phone}</b>. Assim que confirmarmos, seu acesso ao
                JARVIS é liberado automaticamente.
              </p>

              <div className="mx-auto mt-6 grid max-w-xs gap-2 rounded-xl border border-cyan-500/20 bg-black/40 p-4 text-left">
                <Row icon={Mail} label="E-mail" value={email} />
                <Row icon={Phone} label="WhatsApp" value={phone} />
                <Row
                  icon={method === "pix" ? QrCode : method === "card" ? CreditCard : Bitcoin}
                  label="Pagamento"
                  value={method === "pix" ? "PIX (Mercado Pago)" : method === "card" ? "Cartão (Mercado Pago)" : "Criptomoeda"}
                />
              </div>

              <button
                onClick={onClose}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-cyan-300 px-6 py-3 text-xs font-black uppercase tracking-[0.18em] text-black shadow-[0_0_40px_-6px_rgba(34,211,238,0.9)] hover:scale-[1.02]"
              >
                <Sparkles className="h-4 w-4" /> Continuar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

// ---------- Small parts ----------

function StepDot({ n, active, done, label }: { n: number; active: boolean; done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-bold transition-all",
          done && "border-emerald-400/60 bg-emerald-500/20 text-emerald-200 shadow-[0_0_14px_rgba(52,211,153,0.6)]",
          !done && active && "border-cyan-400/60 bg-cyan-500/20 text-cyan-100 shadow-[0_0_14px_rgba(34,211,238,0.8)]",
          !done && !active && "border-cyan-500/25 bg-black/40 text-cyan-300/40",
        )}
      >
        {done ? <Check className="h-3 w-3" /> : n}
      </div>
      <span
        className={cn(
          "hidden sm:inline",
          active ? "text-cyan-100" : "text-cyan-300/40",
        )}
      >
        {label}
      </span>
    </div>
  );
}

interface FieldProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  error?: string;
  valid?: boolean;
  type?: string;
  autoComplete?: string;
  inputMode?: "text" | "email" | "tel" | "numeric";
}
const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  { icon: Icon, label, placeholder, value, onChange, onBlur, error, valid, type = "text", autoComplete, inputMode },
  ref,
) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-cyan-300/80">
        <Icon className="h-3 w-3" /> {label}
      </span>
      <div className="relative">
        <input
          ref={ref}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          inputMode={inputMode}
          className={cn(
            "w-full rounded-xl border bg-black/60 px-4 py-3 pr-10 text-sm text-cyan-50 placeholder:text-cyan-500/40 outline-none transition-colors",
            error
              ? "border-red-400/50 focus:border-red-300"
              : valid
              ? "border-emerald-400/50 focus:border-emerald-300"
              : "border-cyan-500/25 focus:border-cyan-300/70",
          )}
        />
        {valid && !error && (
          <Check className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-300" />
        )}
      </div>
      {error && <span className="mt-1 block text-[11px] text-red-300">{error}</span>}
    </label>
  );
});

function PayOption({
  active,
  onClick,
  icon: Icon,
  title,
  subtitle,
  badge,
  badgeTone = "cyan",
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  badge?: string;
  badgeTone?: "emerald" | "cyan";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all",
        active
          ? "border-cyan-300/70 bg-cyan-500/[0.08] shadow-[0_0_30px_-8px_rgba(34,211,238,0.9)]"
          : "border-cyan-500/20 bg-black/40 hover:border-cyan-400/50 hover:bg-cyan-500/[0.04]",
      )}
    >
      <div
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border",
          active
            ? "border-cyan-300/70 bg-cyan-500/15 text-cyan-100"
            : "border-cyan-500/25 bg-black/60 text-cyan-300",
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-bold text-cyan-50">{title}</span>
          {badge && (
            <span
              className={cn(
                "rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.22em]",
                badgeTone === "emerald"
                  ? "border border-emerald-400/40 bg-emerald-500/10 text-emerald-200"
                  : "border border-cyan-400/40 bg-cyan-500/10 text-cyan-200",
              )}
            >
              {badge}
            </span>
          )}
        </div>
        <div className="mt-0.5 text-xs text-cyan-200/60">{subtitle}</div>
      </div>
      <div
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
          active
            ? "border-cyan-200 bg-cyan-300 text-black"
            : "border-cyan-500/30 bg-transparent",
        )}
      >
        {active && <Check className="h-3 w-3" />}
      </div>
    </button>
  );
}

function Row({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 text-xs">
      <Icon className="h-3.5 w-3.5 text-cyan-300/80" />
      <span className="font-mono uppercase tracking-[0.2em] text-cyan-300/60">{label}:</span>
      <span className="truncate text-cyan-100">{value}</span>
    </div>
  );
}
