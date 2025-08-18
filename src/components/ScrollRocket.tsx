import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";

export function ScrollRocket({ scrollProgress }) {
  const rocketRef = useRef();

  // Load the rocket model
  const { scene } = useGLTF("/models/CartoonSpaceShipForExport.glb");

  // Stage 1: Engines fire (0% - 5% scroll) - rocket stays put
  // Stage 2: Rocket launches (5%+ scroll) - rocket moves up
  const engineStartThreshold = 0.05; // 5% of first page scroll

  // Calculate rocket position
  const startY = -3; // Start on launch pad
  const endY = 0; // End at center of viewable area

  let rocketY = startY;
  if (scrollProgress > engineStartThreshold) {
    // Only start moving after engines have been firing for a bit
    const launchProgress =
      (scrollProgress - engineStartThreshold) / (1 - engineStartThreshold);
    rocketY = startY + launchProgress * (endY - startY);
  }

  const isLaunching = scrollProgress > engineStartThreshold; // Rocket movement starts after 5%

  useFrame((state) => {
    if (rocketRef.current) {
      // Position update
      rocketRef.current.position.y = rocketY;

      // Only rotate if actually launching (not just engines firing)
      if (isLaunching) {
        const rotation = scrollProgress * Math.PI * 0.1;
        rocketRef.current.rotation.z = rotation * 0.1;
        rocketRef.current.rotation.x = rotation * 0.05;
      } else {
        // Completely stationary during engine warmup
        rocketRef.current.rotation.z = 0;
        rocketRef.current.rotation.x = 0;
      }
    }
  });

  return (
    <group ref={rocketRef}>
      <primitive
        object={scene.clone()}
        scale={[0.05, 0.05, 0.05]}
        position={[-0.05, -0.5, 0.2]}
      />
    </group>
  );
}

// Preload the model
useGLTF.preload("/models/CartoonSpaceShipForExport.glb");
