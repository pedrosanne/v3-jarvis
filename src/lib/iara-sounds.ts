/**
 * Iara JARVIS-style sound engine.
 * 100% sintetizado via Web Audio API — sem assets externos.
 * Cada função dispara um efeito curto, não-bloqueante.
 */

let _ctx: AudioContext | null = null;
let _master: GainNode | null = null;
let _enabled = true;

function ctx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!_ctx) {
    try {
      const Ctor =
        (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }).AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      _ctx = new Ctor();
      _master = _ctx.createGain();
      _master.gain.value = 0.35;
      _master.connect(_ctx.destination);
    } catch {
      return null;
    }
  }
  if (_ctx && _ctx.state === "suspended") void _ctx.resume();
  return _ctx;
}

export function setSoundEnabled(on: boolean) {
  _enabled = on;
}
export function isSoundEnabled() {
  return _enabled;
}
export function primeAudio() {
  // Chamar dentro de um handler de gesto do usuário para destravar o áudio em mobile/Safari.
  ctx();
}

function env(
  c: AudioContext,
  dest: AudioNode,
  attack: number,
  decay: number,
  peak: number,
  sustain = 0,
  release = 0.02,
): GainNode {
  const g = c.createGain();
  const now = c.currentTime;
  g.gain.setValueAtTime(0, now);
  g.gain.linearRampToValueAtTime(peak, now + attack);
  g.gain.exponentialRampToValueAtTime(Math.max(sustain, 0.0001), now + attack + decay);
  g.gain.exponentialRampToValueAtTime(0.0001, now + attack + decay + release);
  g.connect(dest);
  return g;
}

function tone(
  freq: number,
  duration: number,
  type: OscillatorType = "sine",
  gain = 0.25,
  delay = 0,
  freqEnd?: number,
) {
  if (!_enabled) return;
  const c = ctx();
  if (!c || !_master) return;
  const start = c.currentTime + delay;
  const osc = c.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (freqEnd !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(freqEnd, 1), start + duration);
  }
  const g = c.createGain();
  g.gain.setValueAtTime(0, start);
  g.gain.linearRampToValueAtTime(gain, start + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(g).connect(_master);
  osc.start(start);
  osc.stop(start + duration + 0.05);
}

function noise(duration: number, gain = 0.15, filterFreq = 1800, type: BiquadFilterType = "bandpass") {
  if (!_enabled) return;
  const c = ctx();
  if (!c || !_master) return;
  const len = Math.floor(c.sampleRate * duration);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  const filt = c.createBiquadFilter();
  filt.type = type;
  filt.frequency.value = filterFreq;
  filt.Q.value = 0.8;
  const g = env(c, _master, 0.005, duration * 0.4, gain, gain * 0.3, duration * 0.5);
  src.connect(filt).connect(g);
  src.start();
  src.stop(c.currentTime + duration + 0.05);
}

/* ---------- Vocabulário de efeitos ---------- */

// Clique sutil de UI
export function sfxClick() {
  tone(720, 0.05, "square", 0.08);
  tone(1240, 0.05, "sine", 0.05, 0.005);
}

// Hover/foco leve
export function sfxHover() {
  tone(880, 0.04, "sine", 0.04);
}

// Beep de confirmação curto (passo concluído)
export function sfxBeep() {
  tone(1320, 0.08, "triangle", 0.12);
  tone(1760, 0.06, "sine", 0.06, 0.04);
}

// Toggle/checkbox
export function sfxToggle() {
  tone(540, 0.06, "square", 0.08);
  tone(820, 0.06, "square", 0.08, 0.05);
}

// Início de verificação — varredura ascendente
export function sfxScanStart() {
  tone(220, 0.45, "sawtooth", 0.08, 0, 880);
  noise(0.45, 0.05, 1600);
}

// Tick de progresso de varredura
export function sfxScanTick() {
  tone(1480 + Math.random() * 220, 0.03, "square", 0.05);
}

// Sucesso (curto e brilhante)
export function sfxSuccess() {
  tone(660, 0.1, "triangle", 0.18);
  tone(880, 0.1, "triangle", 0.18, 0.08);
  tone(1320, 0.18, "triangle", 0.18, 0.16);
  tone(1760, 0.22, "sine", 0.12, 0.22);
}

// Erro / rejeição
export function sfxError() {
  tone(220, 0.18, "sawtooth", 0.18, 0, 110);
  tone(180, 0.22, "square", 0.12, 0.06, 90);
  noise(0.18, 0.1, 600, "lowpass");
}

// Alerta / warning
export function sfxAlert() {
  tone(880, 0.12, "square", 0.14);
  tone(660, 0.12, "square", 0.14, 0.13);
  tone(880, 0.12, "square", 0.14, 0.26);
}

// Upload / arquivo recebido
export function sfxUpload() {
  tone(440, 0.08, "triangle", 0.12, 0, 880);
  tone(880, 0.1, "sine", 0.1, 0.07, 1320);
}

// Whoosh — transição/abre painel
export function sfxWhoosh() {
  noise(0.32, 0.18, 2200, "bandpass");
  tone(120, 0.32, "sine", 0.1, 0, 60);
}

// Power up — slide-to-hack desbloqueado
export function sfxPowerUp() {
  tone(120, 0.5, "sawtooth", 0.18, 0, 880);
  tone(220, 0.45, "square", 0.1, 0.05, 1320);
  tone(440, 0.4, "triangle", 0.1, 0.12, 1760);
  noise(0.5, 0.12, 1200);
  setTimeout(() => sfxSuccess(), 480);
}

// Fase: connecting — handshake / modem-ish
export function sfxConnecting() {
  tone(880, 0.08, "square", 0.1);
  tone(660, 0.08, "square", 0.1, 0.09);
  tone(990, 0.08, "square", 0.1, 0.18);
  tone(1320, 0.1, "square", 0.1, 0.27);
  noise(0.4, 0.05, 2400);
}

// Fase: scanning — sonar pulse
export function sfxSonar() {
  tone(440, 0.5, "sine", 0.18, 0, 110);
  setTimeout(() => tone(440, 0.5, "sine", 0.12, 0, 110), 220);
}

// Fase: intercepting — glitch agressivo
export function sfxIntercept() {
  tone(1760, 0.05, "square", 0.16);
  tone(220, 0.05, "square", 0.16, 0.05);
  tone(1320, 0.05, "square", 0.16, 0.1);
  tone(180, 0.08, "sawtooth", 0.12, 0.15);
  noise(0.25, 0.14, 3200);
}

// Fase: news — beeps em rajada (telex)
export function sfxNews() {
  for (let i = 0; i < 5; i++) {
    tone(1480, 0.04, "square", 0.08, i * 0.07);
  }
}

// Fase: deep neural — coro suave subindo
export function sfxNeural() {
  tone(220, 0.9, "sine", 0.12, 0, 660);
  tone(330, 0.9, "sine", 0.1, 0.05, 990);
  tone(440, 0.9, "sine", 0.08, 0.1, 1320);
  noise(0.9, 0.04, 800, "highpass");
}

// Sinal gerado — fanfarra futurista
export function sfxSignalReady() {
  tone(523, 0.12, "triangle", 0.22);
  tone(659, 0.12, "triangle", 0.22, 0.1);
  tone(784, 0.14, "triangle", 0.22, 0.2);
  tone(1047, 0.4, "sawtooth", 0.18, 0.32);
  tone(1568, 0.5, "sine", 0.14, 0.34);
  noise(0.4, 0.08, 4000, "highpass");
}

// Abortar / fechar
export function sfxAbort() {
  tone(440, 0.18, "sawtooth", 0.14, 0, 110);
  noise(0.18, 0.08, 600, "lowpass");
}

// Tipo digitando no terminal (random pitch curto)
export function sfxType() {
  if (Math.random() > 0.5) return; // não em toda linha
  tone(1800 + Math.random() * 600, 0.018, "square", 0.025);
}
