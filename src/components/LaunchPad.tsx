import { useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { Group } from "three";

interface LaunchPadProps {
  scrollProgress: number;
}

export const LaunchPad = ({ scrollProgress }: LaunchPadProps) => {
  const group = useRef<Group>(null);

  // Load the launch pad model
  const { scene } = useGLTF("/models/LaunchPad.glb");

  // Only start moving down after rocket begins launching (5% threshold)
  const engineStartThreshold = 0.05; // 5% of first page scroll
  const baseY = -4; // Base position

  let yPosition = baseY;
  if (scrollProgress > engineStartThreshold) {
    // Only start moving after engines have been firing
    const launchProgress =
      (scrollProgress - engineStartThreshold) / (1 - engineStartThreshold);
    yPosition = baseY + -launchProgress * 30; // Move down as rocket launches
  }

  // Exhaust settings
  /*  const isEnginesFiring = scrollProgress > 0; // Engines start immediately when scrolling
  const isLaunching = scrollProgress > engineStartThreshold; // Rocket movement starts after 5%
  const exhaustPosition = [0.7, 0.5, 0]; // Relative to launch pad position*/

  return (
    <group ref={group} position={[0, yPosition, 0]}>
      <primitive object={scene.clone()} />
    </group>
  );
};

// Preload the model
useGLTF.preload("/models/LaunchPad.glb");
