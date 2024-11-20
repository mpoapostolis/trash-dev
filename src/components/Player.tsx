import { useRef } from 'react';
import { useThree } from '@react-three/fiber';
import Ecctrl from 'ecctrl';
import { CapsuleCollider } from '@react-three/rapier';

export default function Player() {
  const playerRef = useRef();

  return (
    <Ecctrl ref={playerRef}>
      <group>
        <mesh castShadow>
          <cylinderGeometry args={[0.5, 0.7, 1.5]} />
          <meshStandardMaterial color="#666666" />
        </mesh>
        <mesh position={[0, 0.8, 0]} castShadow>
          <cylinderGeometry args={[0.7, 0.7, 0.1]} />
          <meshStandardMaterial color="#444444" />
        </mesh>
      </group>
    </Ecctrl>
  );
}