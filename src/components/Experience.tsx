import { Suspense } from "react";
import { Environment } from "@react-three/drei";
import { LaunchPad } from "./LaunchPad";
import { ScrollRocket } from "./ScrollRocket";
import { StarField } from "./StarField.tsx";

interface ExperienceProps {
  scrollProgress: number;
}

export const Experience = ({ scrollProgress }: ExperienceProps) => {
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
          <LaunchPad scrollProgress={scrollProgress} />
          <ScrollRocket scrollProgress={scrollProgress} />
        </group>
        {/*<SimpleDreiSky scrollProgress={scrollProgress} />*/}
      </Suspense>
    </>
  );
};

/*interface SkyProps {
  scrollProgress: number;
}

/*const SimpleDreiSky = ({ scrollProgress }: SkyProps) => {
  return (
    <Sky
      sunPosition={[0.1, 1, 0]}
      inclination={0}
      azimuth={0.25}
      turbidity={2 + scrollProgress * 16}
    />
  );
};*/
