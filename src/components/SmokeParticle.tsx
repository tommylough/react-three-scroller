import { animated, useSpring } from "@react-spring/three";
import { useEffect } from "react";

interface SmokeParticleProps {
  animationPhase?: string;
}

const GetRamdom = (min: number, max: number) => {
  return Math.random() * (max - min) + min;
};

export const SmokeParticle = ({ animationPhase }: SmokeParticleProps) => {
  const targetX = GetRamdom(-1, 1);
  const targetZ = GetRamdom(-1, 1);
  const targetY = GetRamdom(0.1, 0.3);
  const duration = GetRamdom(1000, 1500);

  const [springValues, api] = useSpring(() => {});

  const UpdateSpring = (isLooping = true) => {
    api.start({
      scale: [0.5, 0.5, 0.5],
      position: [targetX, targetY, targetZ],
      opacity: 0,
      from: { scale: [0, 0, 0], opacity: 1, position: [0, 0, 0] },
      config: { duration: duration },
      loop: isLooping,
    });
  };

  useEffect(() => {
    if (animationPhase === "idle") {
    } else if (animationPhase === "looping") {
      UpdateSpring();
    } else if (animationPhase === "stopping") {
      api.stop();
      UpdateSpring(false);
    }
  }, [animationPhase]);

  return (
    <animated.mesh scale={springValues.scale} position={springValues.position}>
      <sphereGeometry args={[0.5, 4, 4]} />
      <animated.meshStandardMaterial
        color={"white"}
        transparent
        opacity={springValues.opacity}
      />
    </animated.mesh>
  );
};
