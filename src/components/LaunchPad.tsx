import { useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { Group } from "three";
import { Smoke } from "./Smoke";

interface LaunchPadProps {
  scrollProgress: number;
}

export const LaunchPad = ({ scrollProgress }: LaunchPadProps) => {
  const group = useRef<Group>(null);

  const { scene } = useGLTF("/models/LaunchPad.glb");

  const engineStartThreshold = 0.05;
  const baseY = -4;

  let yPosition = baseY;
  if (scrollProgress > engineStartThreshold) {
    const launchProgress =
      (scrollProgress - engineStartThreshold) / (1 - engineStartThreshold);
    yPosition = baseY + -launchProgress * 30; // Move down as rocket launches
  }
  return (
    <group ref={group} position={[0, yPosition, 0]}>
      <primitive object={scene.clone()} />
      <group position={[0.8, 0.3, 0.2]}>
        {<Smoke scrollProgress={scrollProgress * 40} particleCount={30} />}
      </group>
    </group>
  );
};

useGLTF.preload("/models/LaunchPad.glb");
