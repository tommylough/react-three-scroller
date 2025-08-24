import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import * as THREE from "three";

// Create the flame shader material
const FlameMaterial = shaderMaterial(
  // Uniforms
  {
    uTime: 0,
    uIntensity: 1.0,
    uSpeed: 2.0,
    uNoiseScale: 3.0,
  },
  // Vertex shader
  `
    uniform float uTime;
    uniform float uIntensity;
    uniform float uSpeed;
    uniform float uNoiseScale;
    
    varying vec3 vPosition;
    varying float vHeight;
    varying float vNoise;
    
    // Improved noise function
    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }
    
    float noise(vec3 pos) {
      vec3 i = floor(pos);
      vec3 f = fract(pos);
      
      float a = random(i.xy);
      float b = random(i.xy + vec2(1.0, 0.0));
      float c = random(i.xy + vec2(0.0, 1.0));
      float d = random(i.xy + vec2(1.0, 1.0));
      
      vec2 u = f.xy * f.xy * (3.0 - 2.0 * f.xy);
      return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    }
    
    void main() {
      vPosition = position;
      vHeight = (position.y + 1.0) * 0.5; // Normalize height 0-1
      
      // Create multiple octaves of noise for realistic flame movement
      vec3 noisePos = position * uNoiseScale + vec3(0.0, uTime * uSpeed, 0.0);
      float noise1 = noise(noisePos);
      float noise2 = noise(noisePos * 2.0) * 0.5;
      float noise3 = noise(noisePos * 4.0) * 0.25;
      vNoise = noise1 + noise2 + noise3;
      
      // Height-based displacement (more movement at top)
      float heightFactor = smoothstep(0.0, 1.0, vHeight);
      
      // Main flame movement
      vec3 displacement = vec3(0.0);
      
      // Lateral swaying
      displacement.x += sin(uTime * uSpeed + position.y * 3.0) * heightFactor * uIntensity * 0.4;
      displacement.z += cos(uTime * uSpeed * 1.3 + position.y * 2.5) * heightFactor * uIntensity * 0.3;
      
      // Noise-based displacement for organic movement
      displacement += normal * vNoise * heightFactor * uIntensity * 0.2;
      
      // Turbulence for flame tips
      if (vHeight > 0.7) {
        float turbulence = sin(uTime * uSpeed * 3.0 + position.x * 10.0) * 
                          cos(uTime * uSpeed * 2.5 + position.z * 8.0);
        displacement += vec3(turbulence * 0.1, 0.0, turbulence * 0.08) * (vHeight - 0.7) * 3.0;
      }
      
      vec3 newPosition = position + displacement;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    }
  `,
  // Fragment shader
  `
    uniform float uTime;
    uniform float uIntensity;
    
    varying vec3 vPosition;
    varying float vHeight;
    varying float vNoise;
    
    void main() {
      // Realistic flame color palette
      vec3 blueFlame = vec3(0.1, 0.3, 1.0);      // Hot blue core
      vec3 whiteHot = vec3(1.0, 1.0, 0.95);      // White hot
      vec3 yellow = vec3(1.0, 0.9, 0.2);         // Yellow
      vec3 orange = vec3(1.0, 0.5, 0.1);         // Orange
      vec3 red = vec3(1.0, 0.2, 0.05);           // Red tips
      vec3 darkRed = vec3(0.8, 0.1, 0.0);        // Dark red edges
      
      vec3 flameColor;
      
      // Color gradient based on height with smooth transitions
      if (vHeight < 0.15) {
        // Blue to white hot core
        flameColor = mix(blueFlame, whiteHot, vHeight / 0.15);
      } else if (vHeight < 0.4) {
        // White to yellow
        flameColor = mix(whiteHot, yellow, (vHeight - 0.15) / 0.25);
      } else if (vHeight < 0.7) {
        // Yellow to orange
        flameColor = mix(yellow, orange, (vHeight - 0.4) / 0.3);
      } else if (vHeight < 0.9) {
        // Orange to red
        flameColor = mix(orange, red, (vHeight - 0.7) / 0.2);
      } else {
        // Red to dark red at tips
        flameColor = mix(red, darkRed, (vHeight - 0.9) / 0.1);
      }
      
      // Add noise variation to color intensity
      float colorVariation = 0.8 + vNoise * 0.4;
      flameColor *= colorVariation;
      
      // Flickering effect
      float flicker = sin(uTime * 8.0 + vPosition.x * 15.0 + vPosition.z * 12.0) * 0.1 + 0.9;
      flameColor *= flicker;
      
      // Temperature-based intensity (hotter = brighter)
      float temperature = 1.0 - vHeight * 0.3;
      flameColor *= temperature;
      
      // Alpha with soft edges and height-based transparency
      float alpha = 1.0 - vHeight * 0.8; // More transparent at top
      alpha *= smoothstep(0.0, 0.3, 1.0 - length(vPosition.xz)); // Soft radial falloff
      alpha *= (0.7 + vNoise * 0.3); // Noise variation in alpha
      alpha = clamp(alpha, 0.0, 1.0);
      
      gl_FragColor = vec4(flameColor, alpha);
    }
  `,
);

// Main flame component
export function RocketFlame({
  position = [0, 0, 0] as [number, number, number],
  scale = 1,
  intensity = 1.0,
  speed = 2.0,
  noiseScale = 3.0,
  ...props
}: {
  position?: [number, number, number];
  scale?: number;
  intensity?: number;
  speed?: number;
  noiseScale?: number;
  [key: string]: any;
}) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Update shader uniforms each frame
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      materialRef.current.uniforms.uIntensity.value = intensity;
      materialRef.current.uniforms.uSpeed.value = speed;
      materialRef.current.uniforms.uNoiseScale.value = noiseScale;
    }
  });

  // Create optimized flame geometry
  const flameGeometry = useMemo(() => {
    const geometry = new THREE.ConeGeometry(0.5, 2, 8, 16);

    // Modify the geometry to create a more flame-like shape
    const positions = geometry.attributes.position.array;

    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const y = positions[i + 1];
      const z = positions[i + 2];

      // Normalize height from -1 to 1 to 0 to 1
      const heightFactor = (y + 1) / 2;

      // Taper the flame more naturally
      const taper = 1 - Math.pow(heightFactor, 1.5) * 0.8;
      positions[i] = x * taper; // x
      positions[i + 2] = z * taper; // z

      // Slight upward curve for flame tips
      if (heightFactor > 0.8) {
        positions[i + 1] = y + (heightFactor - 0.8) * 0.3;
      }
    }

    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();

    return geometry;
  }, []);

  return (
    <mesh position={position} scale={scale} geometry={flameGeometry} {...props}>
      <primitive
        ref={materialRef}
        object={new FlameMaterial()}
        attach="material"
        transparent
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}
