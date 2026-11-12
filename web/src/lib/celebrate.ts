/** Fires a short confetti burst. Loaded on demand so it never weighs on first paint. */
export async function celebrate() {
  const { default: confetti } = await import("canvas-confetti");
  confetti({
    particleCount: 110,
    spread: 75,
    startVelocity: 38,
    origin: { y: 0.75 },
    colors: ["#6366f1", "#8b5cf6", "#38bdf8", "#34d399", "#fbbf24"],
    // Respect users who prefer less motion.
    disableForReducedMotion: true,
  });
}
