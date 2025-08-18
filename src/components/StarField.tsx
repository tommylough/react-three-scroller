import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Points } from "three";

export const StarField = ({ count = 1000 }) => {
  const mesh = useRef<Points>(null);

  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Distribute stars in a large sphere around the scene
      const radius = 100 + Math.random() * 200;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.cos(phi);
      positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

      // Random star colors (white to slightly blue/yellow)
      const intensity = 0.5 + Math.random() * 0.5;
      colors[i * 3] = intensity;
      colors[i * 3 + 1] = intensity;
      colors[i * 3 + 2] = intensity * (0.8 + Math.random() * 0.4);
    }

    return [positions, colors];
  }, [count]);

  useFrame(() => {
    if (mesh.current) {
      // Subtle rotation for twinkling effect
      mesh.current.rotation.y += 0.0002;
      mesh.current.rotation.x += 0.0001;
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.5}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation={true}
      />
    </points>
  );
};
