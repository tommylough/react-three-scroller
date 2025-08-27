import { useLoader } from "@react-three/fiber";
import * as THREE from "three";

interface SkyProps {
  scrollProgress: number;
}

export const ScrollingSky = ({ scrollProgress }: SkyProps) => {
  const opacity = 1 - scrollProgress;
  const texture = useLoader(THREE.TextureLoader, "/images/sky.png");
  return (
    <mesh position={[0, 8, -5]}>
      <planeGeometry args={[30, 20]} />
      <meshBasicMaterial transparent={true} map={texture} opacity={opacity} />
    </mesh>
  );
};
