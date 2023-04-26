import confetti from "canvas-confetti"

export const responsiveConfetti = (isMobile: boolean): void =>
   confetti({
      particleCount: isMobile ? 500 : 1000,
      spread: 120,
      origin: { y: isMobile ? 0.9 : 0.7 },
      decay: isMobile ? null : 0.93,
      startVelocity: isMobile ? null : 45,
      zIndex: 99999,
   })
