"use client";

export type UiSound =
  | "click"
  | "select"
  | "open"
  | "reveal"
  | "success"
  | "error";

const SOUND_FILES: Record<UiSound, string> = {
  click: "/audio/ui-click.ogg",
  select: "/audio/ui-select.ogg",
  open: "/audio/ui-open-soft.wav",
  reveal: "/audio/ui-reveal-soft.wav",
  success: "/audio/ui-success.ogg",
  error: "/audio/ui-error.ogg",
};

const VOLUMES: Record<UiSound, number> = {
  click: 0.28,
  select: 0.24,
  open: 0.24,
  reveal: 0.22,
  success: 0.36,
  error: 0.34,
};

const audioCache: Partial<Record<UiSound, HTMLAudioElement>> = {};
let oggSupport: boolean | null = null;
let audioContext: AudioContext | null = null;

type AudioWindow = Window & {
  webkitAudioContext?: typeof AudioContext;
};

function supportsOgg(): boolean {
  if (oggSupport !== null) {
    return oggSupport;
  }

  if (typeof Audio === "undefined") {
    oggSupport = false;
    return oggSupport;
  }

  const probe = new Audio();
  oggSupport = Boolean(
    probe.canPlayType("audio/ogg; codecs=vorbis") ||
      probe.canPlayType("audio/ogg"),
  );

  return oggSupport;
}

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") {
    return null;
  }

  const AudioContextCtor =
    window.AudioContext || (window as AudioWindow).webkitAudioContext;

  if (!AudioContextCtor) {
    return null;
  }

  audioContext ??= new AudioContextCtor();
  return audioContext;
}

function playFallbackTone(kind: UiSound) {
  const context = getAudioContext();

  if (!context) {
    return;
  }

  if (context.state === "suspended") {
    void context.resume();
  }

  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const now = context.currentTime;

  const [startFrequency, endFrequency, duration] =
    kind === "success"
      ? [680, 960, 0.18]
      : kind === "error"
        ? [220, 140, 0.16]
        : kind === "reveal"
          ? [360, 620, 0.36]
        : kind === "open"
          ? [210, 460, 0.42]
          : kind === "select"
            ? [520, 620, 0.08]
            : [420, 520, 0.06];

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(startFrequency, now);
  oscillator.frequency.exponentialRampToValueAtTime(endFrequency, now + duration);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(VOLUMES[kind] * 0.18, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + duration + 0.02);
}

export function preloadUiSounds() {
  if (typeof Audio === "undefined" || !supportsOgg()) {
    return;
  }

  (Object.keys(SOUND_FILES) as UiSound[]).forEach((kind) => {
    if (audioCache[kind]) {
      return;
    }

    const audio = new Audio(SOUND_FILES[kind]);
    audio.preload = "auto";
    audio.volume = VOLUMES[kind];
    audioCache[kind] = audio;
  });
}

export function playUiSound(kind: UiSound) {
  if (typeof window === "undefined") {
    return;
  }

  if (!supportsOgg()) {
    playFallbackTone(kind);
    return;
  }

  preloadUiSounds();

  const source = audioCache[kind];
  if (!source) {
    playFallbackTone(kind);
    return;
  }

  const instance = source.cloneNode(true) as HTMLAudioElement;
  instance.volume = VOLUMES[kind];

  void instance.play().catch(() => {
    playFallbackTone(kind);
  });
}
