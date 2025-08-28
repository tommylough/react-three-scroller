import { useLoader } from "@react-three/fiber";
import * as THREE from "three";

interface SkyProps {
  scrollProgress: number;
  width: number;
}

export const ScrollingSky = ({ scrollProgress, width }: SkyProps) => {
  const opacity = 1 - scrollProgress;
  const texture = useLoader(THREE.TextureLoader, "/images/sky.png");
  console.log(`Width: ${width / 45}`);
  return (
    <mesh position={[0, 8, -5]}>
      <planeGeometry args={[width / 45, 20]} />
      <meshBasicMaterial transparent={true} map={texture} opacity={opacity} />
    </mesh>
  );
};
