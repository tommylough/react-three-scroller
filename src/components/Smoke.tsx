import { SmokeParticle } from "./SmokeParticle.tsx";
import { useMemo, useState, useEffect } from "react";

interface ParticleData {
  id: string;
}

interface SmokeProps {
  scrollProgress: number; // 0-1
  particleCount?: number;
  maxScrollThreshold?: number; // When to stop cycling (default 0.05 = 5%)
}

export const Smoke = ({
  scrollProgress,
  particleCount = 10,
  maxScrollThreshold = 3,
}: SmokeProps) => {
  const [animationPhase, setAnimationPhase] = useState<
    "idle" | "looping" | "stopping"
  >("idle");

  // Determine animation phase based on scroll progress
  useEffect(() => {
    const isInCyclingRange =
      scrollProgress >= 0 && scrollProgress <= maxScrollThreshold;
    if (isInCyclingRange && animationPhase === "idle") {
      // Start looping when entering range
      //console.log("Starting loop animation");
      setAnimationPhase("looping");
    } else if (!isInCyclingRange && animationPhase === "looping") {
      // Stop looping when exiting range
      //console.log("Stopping loop animation");
      setAnimationPhase("stopping");
    } else if (isInCyclingRange && animationPhase === "stopping") {
      // Resume looping if we scroll back into range
      //console.log("Resuming loop animation");
      setAnimationPhase("looping");
    }
  }, [scrollProgress, maxScrollThreshold, animationPhase]);

  // Generate random particle data once
  const particleData: ParticleData[] = useMemo(() => {
    return Array.from({ length: particleCount }, (_, index) => ({
      id: `particle ${index}`,
    }));
  }, [particleCount]);

  return (
    <>
      {particleData.map((particle) => {
        return (
          <SmokeParticle key={particle.id} animationPhase={animationPhase} />
        );
      })}
    </>
  );
};
