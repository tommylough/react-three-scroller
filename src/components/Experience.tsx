import { Suspense } from "react";
import { Environment } from "@react-three/drei";
import { LaunchPad } from "./LaunchPad";
import { ScrollRocket } from "./ScrollRocket";
import { StarField } from "./StarField.tsx";

interface ExperienceProps {
  scrollProgress: number;
  width: number;
}

export const Experience = ({ scrollProgress, width }: ExperienceProps) => {
  return (
    <>
      <Environment preset="dawn" />
      <Suspense
        fallback={
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial color="yellow" />
          </mesh>
        }
      >
        <StarField />
        <group>
          <LaunchPad scrollProgress={scrollProgress} width={width} />
          <ScrollRocket scrollProgress={scrollProgress} />
        </group>
      </Suspense>
    </>
  );
};
