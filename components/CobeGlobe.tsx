"use client";

import createGlobe from "cobe";
import { useEffect, useRef, useState } from "react";

interface CobeGlobeProps {
  size?: number;
  className?: string;
}

export default function CobeGlobe({ size = 500, className = "" }: CobeGlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !canvasRef.current) return;

    let phi = 0;
    let width = size;

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi: 0,
      theta: 0.3,
      dark: 0,                           // Light mode (light base, dark dots)
      diffuse: 1.2,
      mapSamples: 16000,                 // Dotted landmasses
      mapBrightness: 6,
      baseColor: [0.9, 0.9, 0.9],        // Light gray base
      markerColor: [0.1, 0.1, 0.1],      // Dark markers/landmasses
      glowColor: [1, 1, 1],              // White glow
      markers: [
        // Orange County, CA marker
        { location: [33.7175, -117.8311], size: 0.04 }
      ],
      onRender: (state) => {
        state.phi = phi;
        phi += 0.001;  // Very slow rotation for polish
      },
    });

    return () => {
      globe.destroy();
    };
  }, [mounted, size]);

  if (!mounted) {
    return <div style={{ width: size, height: size }} className={className} />;
  }

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        width: size,
        height: size,
        maxWidth: "100%",
        aspectRatio: "1",
      }}
    />
  );
}
