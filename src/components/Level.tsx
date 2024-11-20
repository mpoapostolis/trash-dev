import { useRef } from 'react';
import { RigidBody } from '@react-three/rapier';
import { useFrame } from '@react-three/fiber';
import { useAtom } from 'jotai';
import { gameStateAtom } from '../state/game';
import LocationPortal from './LocationPortal';
import * as THREE from 'three';

export default function Level() {
  const groundRef = useRef<THREE.Mesh>(null);
  const [gameState] = useAtom(gameStateAtom);

  useFrame((state) => {
    if (!groundRef.current) return;
    
    // Create grid effect
    const time = state.clock.getElapsedTime();
    groundRef.current.material.uniforms.uTime.value = time;
  });

  return (
    <group>
      <RigidBody type="fixed" colliders="trimesh">
        <mesh
          ref={groundRef}
          rotation-x={-Math.PI / 2}
          receiveShadow
        >
          <planeGeometry args={[50, 50]} />
          <shaderMaterial
            uniforms={{
              uTime: { value: 0 },
              uColor: { value: new THREE.Color('#2c3e50') },
              uGridColor: { value: new THREE.Color('#34495e') },
            }}
            vertexShader={`
              varying vec2 vUv;
              void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
              }
            `}
            fragmentShader={`
              uniform float uTime;
              uniform vec3 uColor;
              uniform vec3 uGridColor;
              varying vec2 vUv;
              
              void main() {
                float grid = abs(fract(vUv.x * 10.0 - uTime * 0.1) - 0.5);
                grid *= abs(fract(vUv.y * 10.0 - uTime * 0.1) - 0.5);
                vec3 color = mix(uGridColor, uColor, grid);
                gl_FragColor = vec4(color, 1.0);
              }
            `}
          />
        </mesh>
      </RigidBody>

      {/* Location Portals */}
      {gameState.currentLocation !== 'office' && (
        <LocationPortal location="office" position={[-8, 1, -8]} />
      )}
      {gameState.currentLocation !== 'home' && (
        <LocationPortal location="home" position={[-8, 1, 8]} />
      )}
      {gameState.currentLocation !== 'cafe' && (
        <LocationPortal location="cafe" position={[8, 1, -8]} />
      )}
      {gameState.currentLocation !== 'gym' && (
        <LocationPortal location="gym" position={[8, 1, 0]} />
      )}
      {gameState.currentLocation !== 'bar' && (
        <LocationPortal location="bar" position={[8, 1, 8]} />
      )}
    </group>
  );
}