import { useEffect, useRef, useCallback } from "react";

interface DotMatrixProps {
  isDark: boolean;
  mousePos: { x: number; y: number };
}

const HeroDotMatrix = ({ isDark, mousePos }: DotMatrixProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const mousePosRef = useRef(mousePos);

  mousePosRef.current = mousePos;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    // Resize canvas buffer if needed
    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const spacing = 26;
    const baseRadius = 0.8;
    const hoverRadius = 150;
    const maxRadius = 2.2;
    const mx = mousePosRef.current.x;
    const my = mousePosRef.current.y;

    const baseAlpha = isDark ? 0.45 : 0.32;
    const peakAlpha = isDark ? 0.95 : 0.9;

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
          // Premium multi-tone glow: white-hot core blending to amber/cyan at edges
          const colorMix = ((x + y) % (spacing * 4)) / (spacing * 4);
          const innerBlend = Math.min(1, eased * 2.5); // stronger white at center
          
          if (colorMix < 0.5) {
            // Amber path: white → warm gold
            const rr = Math.round(255 * innerBlend + 220 * (1 - innerBlend));
            const gg = Math.round(255 * innerBlend + 170 * (1 - innerBlend));
            const bb = Math.round(255 * innerBlend + 60 * (1 - innerBlend));
            color = `rgba(${rr}, ${gg}, ${bb}, ${alpha})`;
          } else {
            // Cyan path: white → electric blue
            const rr = Math.round(255 * innerBlend + 100 * (1 - innerBlend));
            const gg = Math.round(255 * innerBlend + 210 * (1 - innerBlend));
            const bb = Math.round(255 * innerBlend + 255 * (1 - innerBlend));
            color = `rgba(${rr}, ${gg}, ${bb}, ${alpha})`;
          }
        } else {
          // Base neutral dots
          if (isDark) {
            color = `rgba(148, 163, 184, ${alpha})`;
          } else {
            color = `rgba(100, 116, 139, ${alpha})`;
          }
        }

        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      }
    }

    animFrameRef.current = requestAnimationFrame(draw);
  }, [isDark]);

  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ width: "100%", height: "100%" }}
    />
  );
};

export default HeroDotMatrix;
