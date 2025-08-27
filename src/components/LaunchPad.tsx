import { useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { Group } from "three";
import { Smoke } from "./Smoke";
import { ScrollingSky } from "./ScrollingSky.tsx";

interface LaunchPadProps {
  scrollProgress: number;
}

export const LaunchPad = ({ scrollProgress }: LaunchPadProps) => {
  const group = useRef<Group>(null);

  const { scene } = useGLTF("/models/Ground.glb");

  const engineStartThreshold = 0.05;
  const baseY = -4;

  let yPosition = baseY;
  if (scrollProgress > engineStartThreshold) {
    const launchProgress =
      (scrollProgress - engineStartThreshold) / (1 - engineStartThreshold);
    yPosition = baseY + -launchProgress * 30; // Move down as rocket launches
  }
  return (
    <group ref={group} position={[0, yPosition, 0]} rotation={[0, 0, 0]}>
      <ScrollingSky scrollProgress={scrollProgress} />
      <primitive object={scene.clone()} />
      <group position={[0.8, 0.3, 0.2]}>
        {<Smoke scrollProgress={scrollProgress * 40} particleCount={30} />}
      </group>
    </group>
  );
};

useGLTF.preload("/models/Ground.glb");
