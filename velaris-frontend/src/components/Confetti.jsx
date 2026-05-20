import confetti from 'canvas-confetti';

export function launchConfetti() {
  confetti({
    particleCount: 120,
    spread: 80,
    origin: { y: 0.6 },
    colors: ['#b30069', '#00685b', '#F7C948', '#006b54'],
  });
}

export default function Confetti() {
  return null;
}