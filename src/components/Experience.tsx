import { Suspense } from "react";
import { Environment, Stars } from "@react-three/drei";
import { LaunchPad } from "./LaunchPad";
import { ScrollRocket } from "./ScrollRocket";
import { StarField } from "./StarField.tsx";

interface ExperienceProps {
  scrollProgress: number;
}

export const Experience = ({ scrollProgress }: ExperienceProps) => {
  return (
    <>
      {/* Use drei's Environment for realistic lighting */}
      <Environment preset="dawn" />

      {/* Use drei's Stars */}
      <Stars
        radius={100}
        depth={50}
        count={2000}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />

      {/* Main scene elements with visible loading fallback */}
      <Suspense
        fallback={
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial color="yellow" />
          </mesh>
        }
      >
        <StarField />
        <LaunchPad scrollProgress={scrollProgress} />
        <ScrollRocket scrollProgress={scrollProgress} />
      </Suspense>
    </>
  );
};
