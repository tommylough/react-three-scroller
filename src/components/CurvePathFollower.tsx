import { useRef, useState, useEffect } from "react";
import { RootState, useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface CurvePathFollowerProps {
  scrollProgress: number;
}

export const CurvePathFollower = ({
  scrollProgress,
}: CurvePathFollowerProps) => {
  // Initial control points for the curve
  const [controlPoints, setControlPoints] = useState([
    new THREE.Vector3(-3, 0, 0),
    new THREE.Vector3(-1, 2, 1),
    new THREE.Vector3(1, -1, -1),
    new THREE.Vector3(3, 1, 0),
  ]);

  const [isPlaying, setIsPlaying] = useState(false); // Changed default to false
  const [animationProgress, setAnimationProgress] = useState(0);
  const [dragInfo, setDragInfo] = useState<{
    index: number;
    offset: THREE.Vector3;
  } | null>(null);

  const cubeRef = useRef<THREE.Mesh>(null);
  const lineRef = useRef<THREE.Line>(null);

  // Create curve from control points
  const curve = new THREE.CatmullRomCurve3(controlPoints, false);

  // Update curve visualization
  useEffect(() => {
    if (lineRef.current) {
      const points = curve.getPoints(100);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      lineRef.current.geometry.dispose();
      lineRef.current.geometry = geometry;
    }
  }, [controlPoints, curve]);

  // Animation loop
  useFrame((_: RootState, delta) => {
    // Only update animation progress if playing
    if (isPlaying) {
      setAnimationProgress((prev) => (prev + delta * 0.2) % 1);
    }

    if (cubeRef.current) {
      // Use scroll progress when not playing, animation progress when playing
      const progress = isPlaying ? animationProgress : scrollProgress;

      // Get position and tangent on curve
      const position = curve.getPointAt(progress);
      const tangent = curve.getTangentAt(progress);

      cubeRef.current.position.copy(position);
      cubeRef.current.lookAt(position.clone().add(tangent));
    }
  });

  // Handle dragging control points
  function DraggableHandle({
    position,
    index,
  }: {
    position: THREE.Vector3;
    index: number;
  }) {
    const meshRef = useRef<THREE.Mesh>(null);

    const handlePointerDown = (event: any) => {
      event.stopPropagation();

      // Calculate offset from handle center to click point
      const offset = event.point.clone().sub(position);
      setDragInfo({ index, offset });
    };

    return (
      <mesh ref={meshRef} position={position} onPointerDown={handlePointerDown}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial
          color={dragInfo?.index === index ? "#ff6b6b" : "#4ecdc4"}
          transparent
          opacity={0.8}
        />
      </mesh>
    );
  }

  // Handle global pointer events for dragging
  const handleGroupPointerMove = (event: any) => {
    if (dragInfo) {
      event.stopPropagation();

      // Calculate new position with offset
      const newPosition = event.point.clone().sub(dragInfo.offset);

      const newControlPoints = [...controlPoints];
      newControlPoints[dragInfo.index] = newPosition;
      setControlPoints(newControlPoints);
    }
  };

  const handleGroupPointerUp = () => {
    setDragInfo(null);
  };

  // Reset animation progress to current scroll position when stopping
  const togglePlayPause = () => {
    if (isPlaying) {
      // When stopping, sync animation progress with scroll progress
      setAnimationProgress(scrollProgress);
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <group>
      {/* Invisible drag plane to catch pointer events */}
      <mesh
        position={[0, 0, 0]}
        onPointerMove={handleGroupPointerMove}
        onPointerUp={handleGroupPointerUp}
        visible={false}
      >
        <planeGeometry args={[20, 20]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Curve line */}
      <line ref={lineRef as any}>
        <bufferGeometry />
        <lineBasicMaterial color="#ffffff" linewidth={2} />
      </line>

      {/* Control point handles */}
      {controlPoints.map((point, index) => (
        <DraggableHandle key={index} position={point} index={index} />
      ))}

      {/* Lines connecting control points (for visualization) */}
      {controlPoints.map((point, index) => {
        if (index < controlPoints.length - 1) {
          const nextPoint = controlPoints[index + 1];
          const points = [point, nextPoint];
          const geometry = new THREE.BufferGeometry().setFromPoints(points);

          return (
            <line key={`connection-${index}`}>
              <bufferGeometry attach="geometry" {...geometry} />
              <lineBasicMaterial
                color="#666666"
                opacity={0.3}
                transparent
                linewidth={1}
              />
            </line>
          );
        }
        return null;
      })}

      {/* Object following the curve */}
      <mesh ref={cubeRef}>
        <boxGeometry args={[0.2, 0.2, 0.2]} />
        <meshStandardMaterial color="#ff9ff3" />
      </mesh>

      {/* 3D Control spheres */}
      <group position={[0, 3, 0]}>
        {/* Play/Pause control */}
        <mesh position={[-0.5, 0, 0]} onClick={togglePlayPause}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color={isPlaying ? "#ff6b6b" : "#4ecdc4"} />
        </mesh>

        {/* Reset control - now resets to current scroll position */}
        <mesh
          position={[0.5, 0, 0]}
          onClick={() => setAnimationProgress(scrollProgress)}
        >
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color="#95a5a6" />
        </mesh>
      </group>
    </group>
  );
};
