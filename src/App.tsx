import { Canvas } from "@react-three/fiber";
import { Experience } from "./components/Experience";
import { OrbitControls } from "@react-three/drei";
import { useState, useEffect, useMemo, useRef } from "react";
import { Vector3 } from "three";

export const App = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<number | null>(null);
  //let controlsEnabled = false;

  const [controlsEnabled, setControlsEnabled] = useState(false);

  const toggleControls = () => {
    setControlsEnabled((prev) => !prev);
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = scrollTop / docHeight;
      setScrollProgress(Math.min(Math.max(scrollPercent, 0), 1));

      // Set scrolling state
      setIsScrolling(true);

      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Set timeout to detect when scrolling stops
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 150); // 150ms after scroll stops, re-enable controls
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial call

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Memoize camera position to avoid unnecessary Vector3 creation
  const cameraPosition = useMemo(() => {
    const v3 = new Vector3(
      0, // Move camera closer as rocket launches
      scrollProgress * 15, // Start at eye level, move up to follow rocket
      10 - scrollProgress * 2,
    );
    return v3;
  }, [scrollProgress]);

  console.log(`Scroll Progress for Sky: ${scrollProgress}`);

  return (
    <>
      <div className="header" onClick={toggleControls}>
        <h1>🚀</h1>
        <button className={"button"}>
          {controlsEnabled ? "Stop Controls" : "Start Controls"}
        </button>
      </div>
      <div className="scroll-container">
        {/* Fixed Canvas */}
        <div className="canvas-container">
          <Canvas
            shadows
            camera={{
              position: cameraPosition,
              fov: 60,
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

            {!isScrolling && (
              <OrbitControls
                makeDefault
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                dampingFactor={0.05}
                enableDamping={true}
              />
            )}
          </Canvas>
        </div>

        {/* Scrollable Content Overlay */}
        <div className={controlsEnabled ? "" : "content-overlay"}>
          <div className="scroll-section section">
            <div>
              <h1>🚀 Space Launch Mission</h1>
              <p>
                Scroll down to witness an incredible rocket launch journey from
                Earth to the stars.
              </p>
              <p style={{ fontSize: "0.9rem", opacity: 0.7 }}>
                Scroll Progress: {Math.round(scrollProgress * 100)}%
              </p>
              <p
                style={{ fontSize: "0.8rem", opacity: 0.5, marginTop: "10px" }}
              >
                {isScrolling
                  ? "🎬 Scroll Animation Active"
                  : "🎮 Manual Controls Available"}
              </p>
            </div>
          </div>

          <div className="scroll-section section-2">
            <div>
              <h1>🌍 Prepare for Launch</h1>
              <p>
                The rocket stands ready on the launch pad, surrounded by
                towering trees on a mysterious floating island.
              </p>
              <p
                style={{ fontSize: "0.8rem", opacity: 0.6, marginTop: "10px" }}
              >
                Stop scrolling to take manual control of the camera
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
                The rocket soars through the star-filled cosmos, leaving Earth
                far behind on its cosmic adventure.
              </p>
              <p
                style={{ fontSize: "0.8rem", opacity: 0.6, marginTop: "10px" }}
              >
                Animation complete - try the manual camera controls!
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
