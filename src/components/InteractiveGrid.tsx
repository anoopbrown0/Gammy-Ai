import React, { useEffect, useRef } from "react";

interface InteractiveGridProps {
  className?: string;
  density?: "narrow" | "default";
}

/**
 * Interactive Rubber / Elastic Matrix Grid with dynamic canvas rendering.
 * As the mouse moves across the grid, the intersection nodes stretch and distort
 * like rubber, and then spring back smoothly to their original resting matrix coordinates.
 */
export const InteractiveGrid: React.FC<InteractiveGridProps> = ({
  className = "",
  density = "narrow",
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Spacing between grid lines
    const spacing = density === "narrow" ? 28 : 40;

    interface Node {
      origX: number;
      origY: number;
      currX: number;
      currY: number;
      vx: number;
      vy: number;
    }

    let nodes: Node[][] = [];
    let cols = 0;
    let rows = 0;

    const initNodes = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      cols = Math.ceil(width / spacing) + 2;
      rows = Math.ceil(height / spacing) + 2;

      nodes = [];
      for (let r = 0; r < rows; r++) {
        const rowNodes: Node[] = [];
        for (let c = 0; c < cols; c++) {
          const x = c * spacing;
          const y = r * spacing;
          rowNodes.push({
            origX: x,
            origY: y,
            currX: x,
            currY: y,
            vx: 0,
            vy: 0,
          });
        }
        nodes.push(rowNodes);
      }
    };

    initNodes();

    const mouse = {
      x: -9999,
      y: -9999,
      active: false,
    };

    const handlePointerMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };

    const handlePointerLeave = () => {
      mouse.active = false;
      mouse.x = -9999;
      mouse.y = -9999;
    };

    const handleResize = () => {
      initNodes();
    };

    window.addEventListener("mousemove", handlePointerMove, { passive: true });
    window.addEventListener("mouseleave", handlePointerLeave, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });

    // Spring physics configuration for rubber/elastic rebound
    const tension = 0.08;   // Spring pulling force back to origin
    const friction = 0.84;  // Damping so it smoothly settles back
    const radius = 120;     // Interaction disturbance radius around mouse
    const radiusSq = radius * radius;
    const maxPush = 38;     // Maximum elastic stretch amplitude

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Detect dark theme from document element
      const isDark = document.documentElement.classList.contains("dark");
      
      // Color styling for grid lines
      const lineColor = isDark ? "rgba(255, 255, 255, 0.045)" : "rgba(0, 0, 0, 0.048)";
      const highlightLineColor = isDark ? "rgba(96, 165, 250, 0.16)" : "rgba(37, 99, 235, 0.14)";

      // Update node physics
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const node = nodes[r][c];

          if (mouse.active) {
            const dx = node.currX - mouse.x;
            const dy = node.currY - mouse.y;
            const distSq = dx * dx + dy * dy;

            if (distSq < radiusSq && distSq > 0) {
              const dist = Math.sqrt(distSq);
              // Force strongest near cursor, tapering off smoothly to 0 at radius
              const force = (1 - dist / radius) * maxPush;
              const angle = Math.atan2(dy, dx);
              
              node.vx += Math.cos(angle) * force * 0.12;
              node.vy += Math.sin(angle) * force * 0.12;
            }
          }

          // Spring force pulling back to original matrix grid position
          const pullX = (node.origX - node.currX) * tension;
          const pullY = (node.origY - node.currY) * tension;

          node.vx = (node.vx + pullX) * friction;
          node.vy = (node.vy + pullY) * friction;

          node.currX += node.vx;
          node.currY += node.vy;
        }
      }

      // Draw horizontal rubber lines
      ctx.lineWidth = 1;
      for (let r = 0; r < rows; r++) {
        ctx.beginPath();
        let isStretched = false;
        const row = nodes[r];
        ctx.moveTo(row[0].currX, row[0].currY);
        for (let c = 1; c < cols; c++) {
          ctx.lineTo(row[c].currX, row[c].currY);
          if (Math.abs(row[c].currX - row[c].origX) > 1.5 || Math.abs(row[c].currY - row[c].origY) > 1.5) {
            isStretched = true;
          }
        }
        ctx.strokeStyle = isStretched ? highlightLineColor : lineColor;
        ctx.stroke();
      }

      // Draw vertical rubber lines
      for (let c = 0; c < cols; c++) {
        ctx.beginPath();
        let isStretched = false;
        ctx.moveTo(nodes[0][c].currX, nodes[0][c].currY);
        for (let r = 1; r < rows; r++) {
          const node = nodes[r][c];
          ctx.lineTo(node.currX, node.currY);
          if (Math.abs(node.currX - node.origX) > 1.5 || Math.abs(node.currY - node.origY) > 1.5) {
            isStretched = true;
          }
        }
        ctx.strokeStyle = isStretched ? highlightLineColor : lineColor;
        ctx.stroke();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseleave", handlePointerLeave);
      window.removeEventListener("resize", handleResize);
    };
  }, [density]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-0 radial-fade-grid transition-opacity duration-300 ${className}`}
    />
  );
};

export default InteractiveGrid;
