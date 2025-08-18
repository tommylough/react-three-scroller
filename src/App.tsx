import { Canvas } from "@react-three/fiber";
import Experience from "./components/Experience";
import { useState, useEffect } from "react";
import { Vector3 } from "three";

function App() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = scrollTop / docHeight;
      setScrollProgress(Math.min(Math.max(scrollPercent, 0), 1));
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial call
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Dynamic camera position based on scroll - moderate positioning
  const cameraPosition = new Vector3(
    10 - scrollProgress * 3, // Move camera closer as rocket launches
    scrollProgress * 15, // Start at eye level, move up to follow rocket
    10 - scrollProgress * 2,
  );

  return (
    <div className="scroll-container">
      {/* Fixed Canvas */}
      <div className="canvas-container">
        <Canvas
          shadows
          camera={{
            position: cameraPosition,
            fov: 45,
            near: 0.1,
            far: 200,
          }}
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: "high-performance",
          }}
        >
          <color attach="background" args={["#0f0f23"]} />
          <Experience scrollProgress={scrollProgress} />
        </Canvas>
      </div>

      {/* Scrollable Content Overlay */}
      <div className="content-overlay">
        <div className="scroll-section section-1">
          <div>
            <h1>🚀 Space Launch Mission</h1>
            <p>
              Scroll down to witness an incredible rocket launch journey from
              Earth to the stars.
            </p>
            <p style={{ fontSize: "0.9rem", opacity: 0.7 }}>
              Scroll Progress: {Math.round(scrollProgress * 100)}%
            </p>
          </div>
        </div>

        <div className="scroll-section section-2">
          <div>
            <h1>🌍 Prepare for Launch</h1>
            <p>
              The rocket stands ready on the launch pad, surrounded by towering
              trees on a mysterious floating island.
            </p>
          </div>
        </div>

        <div className="scroll-section section-3">
          <div>
            <h1>🔥 Ignition Sequence</h1>
            <p>
              Engines are firing! Watch as the rocket begins its ascent while
              the launch pad falls away below.
            </p>
          </div>
        </div>

        <div className="scroll-section">
          <div>
            <h1>✨ To Infinity and Beyond</h1>
            <p>
              The rocket soars through the star-filled cosmos, leaving Earth far
              behind on its cosmic adventure.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
