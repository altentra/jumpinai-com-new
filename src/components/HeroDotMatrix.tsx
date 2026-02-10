import { useEffect, useRef, useCallback } from "react";

interface DotMatrixProps {
  isDark: boolean;
  mousePos: { x: number; y: number };
}

const HeroDotMatrix = ({ isDark, mousePos }: DotMatrixProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const mousePosRef = useRef(mousePos);

  // Keep ref in sync without re-triggering effect
  mousePosRef.current = mousePos;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const spacing = 28;
    const baseRadius = 1;
    const hoverRadius = 140;
    const maxRadius = 3;
    const mx = mousePosRef.current.x;
    const my = mousePosRef.current.y;

    const baseAlpha = isDark ? 0.18 : 0.12;
    const peakAlpha = isDark ? 0.75 : 0.6;

    for (let x = spacing / 2; x < w; x += spacing) {
      for (let y = spacing / 2; y < h; y += spacing) {
        const dx = x - mx;
        const dy = y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const proximity = Math.max(0, 1 - dist / hoverRadius);
        const eased = proximity * proximity;

        const r = baseRadius + (maxRadius - baseRadius) * eased;
        const alpha = baseAlpha + (peakAlpha - baseAlpha) * eased;

        let color: string;
        if (eased > 0.01) {
          const colorMix = ((x + y) % (spacing * 4)) / (spacing * 4);
          if (colorMix < 0.5) {
            color = `rgba(251, 191, 36, ${alpha})`;
          } else {
            color = `rgba(6, 182, 212, ${alpha})`;
          }
        } else {
          if (isDark) {
            color = `rgba(148, 163, 184, ${alpha})`;
          } else {
            color = `rgba(100, 116, 139, ${alpha})`;
          }
        }

        ctx.beginPath();
        ctx.arc(x * dpr, y * dpr, r * dpr, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      }
    }

    animFrameRef.current = requestAnimationFrame(draw);
  }, [isDark]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    };

    resize();
    window.addEventListener("resize", resize);
    animFrameRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
};

export default HeroDotMatrix;
