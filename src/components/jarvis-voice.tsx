import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Volume2, VolumeX, RotateCcw } from "lucide-react";

export type JarvisStep =
  // Etapas em português (Padrão)
  | "cole-a-url"
  | "adicione-o-id"
  | "envie-o-print"
  | "selecione-o-ativo"
  | "escolha-o-tempo"
  | "arraste-para-o-lado"
  // Etapas de resultado pós-hack
  | "sinal-compra"
  | "sinal-venda"
  // Compatibilidade legada e atalhos
  | "broker-url"
  | "account-id"
  | "screenshot"
  | "asset"
  | "timeframe"
  | "slide-hack"
  | "compra"
  | "venda"
  | "buy"
  | "sell"
  | "put";

/**
 * ============================================================================
 * CONFIGURAÇÃO DOS ÁUDIOS DO JARVIS (.mp3)
 * ============================================================================
 * Você pode alterar os nomes dos arquivos .mp3 e seus caminhos diretamente aqui!
 * Os arquivos devem ser colocados na pasta: public/jarvis-audio/
 * 
 * 1. Cole a URL:          /jarvis-audio/1-cole-a-url.mp3
 * 2. Adicione o ID:       /jarvis-audio/2-adicione-o-id.mp3
 * 3. Envie o Print:       /jarvis-audio/3-envie-o-print.mp3
 * 4. Selecione o Ativo:   /jarvis-audio/4-selecione-o-ativo.mp3
 * 5. Escolha o Tempo:     /jarvis-audio/5-escolha-o-tempo.mp3
 * 6. Arraste para o Lado: /jarvis-audio/6-arraste-para-o-lado.mp3
 * 7. Sinal de Compra:     /jarvis-audio/7-sinal-compra.mp3
 * 8. Sinal de Venda:      /jarvis-audio/8-sinal-venda.mp3
 */
export interface JarvisAudioConfig {
  file: string;
  url: string;
  fallbackUrls?: string[];
  caption: string;
}

export const JARVIS_AUDIO_FILES: Record<string, JarvisAudioConfig> = {
  // Etapa 1: Pedir ao usuário para colar a URL da corretora
  "cole-a-url": {
    file: "1-cole-a-url.mp3",
    url: "/jarvis-audio/1-cole-a-url.mp3",
    fallbackUrls: ["/jarvis-audio/cole-a-url.mp3", "/jarvis-audio/broker-url.mp3"],
    caption: "Adicione o link da sua corretora.",
  },
  // Etapa 2: Pedir para inserir o ID da conta
  "adicione-o-id": {
    file: "2-adicione-o-id.mp3",
    url: "/jarvis-audio/2-adicione-o-id.mp3",
    fallbackUrls: ["/jarvis-audio/adicione-o-id.mp3", "/jarvis-audio/account-id.mp3"],
    caption: "Adicione o ID da sua conta na corretora.",
  },
  // Etapa 3: Pedir para enviar o print do gráfico
  "envie-o-print": {
    file: "3-envie-o-print.mp3",
    url: "/jarvis-audio/3-envie-o-print.mp3",
    fallbackUrls: ["/jarvis-audio/envie-o-print.mp3", "/jarvis-audio/screenshot.mp3"],
    caption: "Envie um print do gráfico.",
  },
  // Etapa 4: Pedir para selecionar o ativo
  "selecione-o-ativo": {
    file: "4-selecione-o-ativo.mp3",
    url: "/jarvis-audio/4-selecione-o-ativo.mp3",
    fallbackUrls: ["/jarvis-audio/selecione-o-ativo.mp3", "/jarvis-audio/asset.mp3"],
    caption: "Selecione um ativo.",
  },
  // Etapa 5: Pedir para escolher o tempo/timeframe
  "escolha-o-tempo": {
    file: "5-escolha-o-tempo.mp3",
    url: "/jarvis-audio/5-escolha-o-tempo.mp3",
    fallbackUrls: ["/jarvis-audio/escolha-o-tempo.mp3", "/jarvis-audio/timeframe.mp3"],
    caption: "Escolha um tempo.",
  },
  // Etapa 6: Pedir para arrastar para o lado para ativar o hack
  "arraste-para-o-lado": {
    file: "6-arraste-para-o-lado.mp3",
    url: "/jarvis-audio/6-arraste-para-o-lado.mp3",
    fallbackUrls: ["/jarvis-audio/arraste-para-o-lado.mp3", "/jarvis-audio/slide-hack.mp3"],
    caption: "Arraste para o lado para ativar o hack.",
  },
  // Etapa 7: Resultado - COMPRA
  "sinal-compra": {
    file: "7-sinal-compra.mp3",
    url: "/jarvis-audio/7-sinal-compra.mp3",
    fallbackUrls: [
      "/jarvis-audio/sinal-compra.mp3",
      "/jarvis-audio/compra.mp3",
      "/jarvis-audio/buy.mp3",
    ],
    caption: "Sinal gerado com sucesso: COMPRA.",
  },
  // Etapa 8: Resultado - VENDA
  "sinal-venda": {
    file: "8-sinal-venda.mp3",
    url: "/jarvis-audio/8-sinal-venda.mp3",
    fallbackUrls: [
      "/jarvis-audio/sinal-venda.mp3",
      "/jarvis-audio/venda.mp3",
      "/jarvis-audio/sell.mp3",
      "/jarvis-audio/put.mp3",
    ],
    caption: "Sinal gerado com sucesso: VENDA.",
  },
};

const STEP_ALIASES: Record<string, string> = {
  "broker-url": "cole-a-url",
  "account-id": "adicione-o-id",
  screenshot: "envie-o-print",
  asset: "selecione-o-ativo",
  timeframe: "escolha-o-tempo",
  "slide-hack": "arraste-para-o-lado",
  compra: "sinal-compra",
  buy: "sinal-compra",
  venda: "sinal-venda",
  sell: "sinal-venda",
  put: "sinal-venda",
};

export function getAudioMeta(step: JarvisStep): JarvisAudioConfig {
  const normalizedKey = STEP_ALIASES[step] || step;
  return JARVIS_AUDIO_FILES[normalizedKey] || JARVIS_AUDIO_FILES["cole-a-url"];
}

let sharedCtx: AudioContext | null = null;
function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!sharedCtx) {
    try {
      const Ctor =
        (window as unknown as { AudioContext?: typeof AudioContext }).AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      sharedCtx = new Ctor();
    } catch {
      return null;
    }
  }
  if (sharedCtx.state === "suspended") void sharedCtx.resume();
  return sharedCtx;
}

export function JarvisVoice({
  step,
  muted,
  onToggleMute,
  accent = "cyan",
}: {
  step: JarvisStep | null;
  muted: boolean;
  onToggleMute: () => void;
  accent?: "cyan" | "red";
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const srcRef = useRef<MediaElementAudioSourceNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [caption, setCaption] = useState<string>("");
  const [playTrigger, setPlayTrigger] = useState(0);
  const lastKeyRef = useRef<string>("");

  // play on step change or explicit replay trigger
  useEffect(() => {
    if (!step || muted) {
      setPlaying(false);
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      if (audioRef.current) {
        audioRef.current.onerror = null;
        audioRef.current.pause();
      }
      return;
    }

    const currentKey = `${step}-${playTrigger}`;
    if (lastKeyRef.current === currentKey) return;
    lastKeyRef.current = currentKey;
    const meta = getAudioMeta(step);
    setCaption(meta.caption);

    const speakFallback = () => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
      try {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(meta.caption);
        utter.lang = "pt-BR";
        utter.rate = 1.0;
        utter.pitch = 0.95;

        const voices = window.speechSynthesis.getVoices();
        const ptVoice = voices.find((v) => v.lang.toLowerCase().includes("pt"));
        if (ptVoice) utter.voice = ptVoice;

        utter.onstart = () => setPlaying(true);
        utter.onend = () => setPlaying(false);
        utter.onerror = () => setPlaying(false);

        window.speechSynthesis.speak(utter);
      } catch {
        setPlaying(false);
      }
    };

    const audio = audioRef.current;
    if (!audio) {
      speakFallback();
      return;
    }

    // wire analyser once
    const ctx = getCtx();
    if (ctx && !srcRef.current) {
      try {
        const src = ctx.createMediaElementSource(audio);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 128;
        analyser.smoothingTimeConstant = 0.78;
        src.connect(analyser);
        analyser.connect(ctx.destination);
        srcRef.current = src;
        analyserRef.current = analyser;
      } catch {
        /* ignore */
      }
    }

    // Lista de URLs candidatas para tocar (.mp3 primário e fallbacks)
    const candidates = [meta.url, ...(meta.fallbackUrls || [])].filter(
      (u) => Boolean(u) && !u.startsWith("/__l5e/")
    );

    let candidateIndex = 0;
    let didStart = false;

    const playCandidate = () => {
      if (candidateIndex >= candidates.length) {
        audio.onerror = null;
        speakFallback();
        return;
      }

      const nextUrl = candidates[candidateIndex++];
      audio.onerror = () => {
        if (!didStart) {
          playCandidate();
        }
      };

      audio.src = nextUrl;
      audio.currentTime = 0;

      const p = audio.play();
      if (p) {
        p.then(() => {
          didStart = true;
          audio.onerror = null;
          setPlaying(true);
        }).catch(() => {
          if (!didStart) {
            playCandidate();
          }
        });
      } else {
        if (!didStart) {
          playCandidate();
        }
      }
    };

    playCandidate();

    return () => {
      if (audioRef.current) {
        audioRef.current.onerror = null;
      }
    };
  }, [step, muted, playTrigger]);

  // render wave
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx2d = canvas.getContext("2d");
    if (!ctx2d) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const data = new Uint8Array(64);
    let t = 0;
    const isRed = accent === "red";

    const draw = () => {
      t += 0.04;
      const W = canvas.width;
      const H = canvas.height;
      ctx2d.clearRect(0, 0, W, H);

      const analyser = analyserRef.current;
      let bins = data;
      if (analyser && playing) {
        analyser.getByteFrequencyData(bins);
      } else {
        // idle: gentle sine animation
        for (let i = 0; i < bins.length; i++) {
          bins[i] = 30 + Math.sin(t * 1.2 + i * 0.35) * 18 + Math.sin(t * 0.6 + i * 0.13) * 10;
        }
      }

      const cx = W / 2;
      const cy = H / 2;
      const N = bins.length;

      // 3D minimalistic stacked rings (perspective)
      const layers = 5;
      for (let L = layers - 1; L >= 0; L--) {
        const depth = L / (layers - 1); // 0..1
        const ySquash = 0.32 + depth * 0.08;
        const radiusBase = Math.min(W, H) * (0.18 + depth * 0.05);
        const yOffset = (L - (layers - 1) / 2) * H * 0.05;
        const alpha = (1 - depth) * 0.85 + 0.1;

        // ring path
        ctx2d.beginPath();
        for (let i = 0; i <= N; i++) {
          const idx = i % N;
          const a = (idx / N) * Math.PI * 2 - Math.PI / 2;
          const v = bins[idx] / 255;
          const r = radiusBase + v * Math.min(W, H) * 0.22 * (1 - depth * 0.5);
          const x = cx + Math.cos(a) * r;
          const y = cy + yOffset + Math.sin(a) * r * ySquash;
          if (i === 0) ctx2d.moveTo(x, y);
          else ctx2d.lineTo(x, y);
        }
        ctx2d.closePath();
        ctx2d.strokeStyle = isRed
          ? `rgba(239, 68, 68, ${alpha * 0.65})`
          : `rgba(34, 211, 238, ${alpha * 0.55})`;
        ctx2d.lineWidth = (1 - depth) * 2.2 * dpr + 0.6;
        ctx2d.shadowColor = isRed ? "rgba(239, 68, 68, 0.7)" : "rgba(34, 211, 238, 0.7)";
        ctx2d.shadowBlur = (1 - depth) * 18 * dpr;
        ctx2d.stroke();
      }
      ctx2d.shadowBlur = 0;

      // central bar wave (mirrored)
      const barW = (W * 0.6) / N;
      const startX = (W - barW * N) / 2;
      for (let i = 0; i < N; i++) {
        const v = bins[i] / 255;
        const h = Math.max(2 * dpr, v * H * 0.28);
        const x = startX + i * barW;
        const grad = ctx2d.createLinearGradient(0, cy - h, 0, cy + h);
        if (isRed) {
          grad.addColorStop(0, "rgba(254, 202, 202, 0.95)");
          grad.addColorStop(0.5, "rgba(239, 68, 68, 0.85)");
          grad.addColorStop(1, "rgba(239, 68, 68, 0.2)");
        } else {
          grad.addColorStop(0, "rgba(165, 243, 252, 0.95)");
          grad.addColorStop(0.5, "rgba(34, 211, 238, 0.85)");
          grad.addColorStop(1, "rgba(34, 211, 238, 0.2)");
        }
        ctx2d.fillStyle = grad;
        ctx2d.fillRect(x + barW * 0.18, cy - h / 2, barW * 0.55, h);
      }

      // center dot (pulse)
      const energy =
        bins.reduce((a, b) => a + b, 0) / (bins.length * 255);
      ctx2d.beginPath();
      ctx2d.arc(cx, cy, 4 * dpr + energy * 12 * dpr, 0, Math.PI * 2);
      ctx2d.fillStyle = isRed ? "rgba(254, 202, 202, 0.9)" : "rgba(165, 243, 252, 0.9)";
      ctx2d.shadowColor = isRed ? "rgba(239, 68, 68, 1)" : "rgba(34, 211, 238, 1)";
      ctx2d.shadowBlur = 24 * dpr;
      ctx2d.fill();
      ctx2d.shadowBlur = 0;

      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [playing, accent]);

  const isRed = accent === "red";

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-2xl border p-3",
        isRed
          ? "border-red-500/25 bg-gradient-to-b from-red-950/40 via-[#0a0505] to-[#0a0505] shadow-[0_0_60px_-20px_rgba(239,68,68,0.55)]"
          : "border-cyan-500/25 bg-gradient-to-b from-cyan-950/40 via-[#04080d] to-[#04080d] shadow-[0_0_60px_-20px_rgba(34,211,238,0.55)]",
      )}
    >
      {/* grid backdrop */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07] [background-size:18px_18px]"
        style={{
          backgroundImage: isRed
            ? "linear-gradient(rgba(239,68,68,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(239,68,68,.6) 1px, transparent 1px)"
            : "linear-gradient(rgba(34,211,238,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,.6) 1px, transparent 1px)",
        }}
      />
      {/* corner brackets */}
      <div className={cn("pointer-events-none absolute left-2 top-2 h-3 w-3 border-l border-t", isRed ? "border-red-400/60" : "border-cyan-300/60")} />
      <div className={cn("pointer-events-none absolute right-2 top-2 h-3 w-3 border-r border-t", isRed ? "border-red-400/60" : "border-cyan-300/60")} />
      <div className={cn("pointer-events-none absolute bottom-2 left-2 h-3 w-3 border-b border-l", isRed ? "border-red-400/60" : "border-cyan-300/60")} />
      <div className={cn("pointer-events-none absolute bottom-2 right-2 h-3 w-3 border-b border-r", isRed ? "border-red-400/60" : "border-cyan-300/60")} />

      <div className="relative flex items-center gap-2 sm:gap-3">
        <div
          className={cn(
            "flex h-9 shrink-0 items-center gap-2 rounded-full border bg-black/40 px-2.5 font-mono text-[10px] uppercase tracking-[0.25em]",
            isRed ? "border-red-400/30 text-red-200" : "border-cyan-400/30 text-cyan-200",
          )}
        >
          <span
            className={cn(
              "inline-block h-1.5 w-1.5 rounded-full",
              playing
                ? isRed
                  ? "animate-pulse bg-red-400 shadow-[0_0_8px_2px_rgba(248,113,113,0.8)]"
                  : "animate-pulse bg-emerald-300 shadow-[0_0_8px_2px_rgba(110,231,183,0.8)]"
                : isRed
                  ? "bg-red-500/60"
                  : "bg-cyan-400/60",
            )}
          />
          JARVIS {playing ? "• Falando" : "• Online"}
        </div>

        <div className={cn("relative h-14 flex-1 overflow-hidden rounded-lg bg-black/40 ring-1", isRed ? "ring-red-500/20" : "ring-cyan-500/20")}>
          <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
        </div>

        {/* Botão repetir áudio */}
        <button
          onClick={() => {
            if (typeof window !== "undefined" && "speechSynthesis" in window) {
              window.speechSynthesis.cancel();
            }
            if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current.currentTime = 0;
            }
            setPlayTrigger((p) => p + 1);
          }}
          aria-label="Tocar áudio novamente"
          title="Tocar áudio novamente"
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-black/40 transition",
            isRed
              ? "border-red-500/30 text-red-200 hover:bg-red-500/15"
              : "border-cyan-500/30 text-cyan-200 hover:bg-cyan-500/15",
          )}
        >
          <RotateCcw className="h-4 w-4" />
        </button>

        {/* Botão mutar */}
        <button
          onClick={onToggleMute}
          aria-label={muted ? "Ativar voz" : "Silenciar voz"}
          title={muted ? "Ativar voz" : "Silenciar voz"}
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-black/40 transition",
            isRed
              ? "border-red-500/30 text-red-200 hover:bg-red-500/15"
              : "border-cyan-500/30 text-cyan-200 hover:bg-cyan-500/15",
          )}
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
      </div>

      {caption && (
        <div
          key={caption}
          className={cn(
            "relative mt-2 animate-fade-in text-center font-mono text-[11px] uppercase tracking-[0.22em] sm:text-xs",
            isRed ? "text-red-200/90" : "text-cyan-200/90",
          )}
        >
          <span
            className={cn(
              "inline-block bg-gradient-to-r bg-clip-text text-transparent",
              isRed
                ? "from-red-200 via-white to-red-200"
                : "from-cyan-200 via-white to-cyan-200",
            )}
          >
            “{caption}”
          </span>
        </div>
      )}

      <audio
        ref={audioRef}
        onPlay={() => setPlaying(true)}
        onEnded={() => setPlaying(false)}
        onPause={() => setPlaying(false)}
        crossOrigin="anonymous"
        preload="auto"
      />
    </div>
  );
}
