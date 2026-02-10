import { useEffect, useRef, useCallback } from "react";

interface DotMatrixProps {
  isDark: boolean;
}

const HeroDotMatrix = ({ isDark }: DotMatrixProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const animFrameRef = useRef<number>(0);

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
    const hoverRadius = 120;
    const maxRadius = 2.8;
    const mx = mouseRef.current.x;
    const my = mouseRef.current.y;

    // Base dot colors
    const baseAlpha = isDark ? 0.18 : 0.12;
    const peakAlpha = isDark ? 0.7 : 0.55;

    for (let x = spacing / 2; x < w; x += spacing) {
      for (let y = spacing / 2; y < h; y += spacing) {
        const dx = x - mx;
        const dy = y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Proximity factor: 1 at cursor, 0 at hoverRadius+
        const proximity = Math.max(0, 1 - dist / hoverRadius);
        const eased = proximity * proximity; // quadratic ease for smooth falloff

        const r = baseRadius + (maxRadius - baseRadius) * eased;
        const alpha = baseAlpha + (peakAlpha - baseAlpha) * eased;

        // Color interpolation: base grey → amber/cyan glow near cursor
        let color: string;
        if (eased > 0.01) {
          // Blend between warm amber and cool cyan based on position
          const colorMix = ((x + y) % (spacing * 4)) / (spacing * 4);
          if (colorMix < 0.5) {
            // Amber tone
            const rr = 251, gg = 191, bb = 36;
            color = `rgba(${rr}, ${gg}, ${bb}, ${alpha})`;
          } else {
            // Cyan tone
            const rr = 6, gg = 182, bb = 212;
            color = `rgba(${rr}, ${gg}, ${bb}, ${alpha})`;
          }
        } else {
          // Base neutral dot
          if (isDark) {
            color = `rgba(148, 163, 184, ${alpha})`; // slate-400
          } else {
            color = `rgba(100, 116, 139, ${alpha})`; // slate-500
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

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  const handleMouseLeave = useCallback(() => {
    mouseRef.current = { x: -1000, y: -1000 };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="absolute inset-0 w-full h-full"
      style={{ zIndex: 1 }}
    />
  );
};

export default HeroDotMatrix;
