import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useAtom } from 'jotai';
import { gameStateAtom, LOCATIONS, Location } from '../state/game';
import { Box, Html } from '@react-three/drei';
import * as THREE from 'three';

const PORTAL_COLORS = {
  office: '#4f46e5',
  home: '#059669',
  cafe: '#b45309',
  gym: '#dc2626',
  bar: '#7c3aed'
};

export default function LocationPortal({ location, position }: { location: Location; position: [number, number, number] }) {
  const [hovered, setHovered] = useState(false);
  const [gameState, setGameState] = useAtom(gameStateAtom);
  const portalRef = useRef();

  useFrame((state) => {
    if (portalRef.current) {
      portalRef.current.rotation.y += 0.01;
      if (hovered) {
        portalRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.05);
      }
    }
  });

  const handleTravel = () => {
    const locationInfo = LOCATIONS[location];
    
    if (!locationInfo.availableAt.includes(gameState.timeOfDay)) {
      setGameState({
        ...gameState,
        dialogue: {
          isOpen: true,
          messages: [
            `${locationInfo.name} is not available at ${gameState.timeOfDay}!`,
            "Try visiting at a different time."
          ],
          currentIndex: 0
        }
      });
      return;
    }

    setGameState({
      ...gameState,
      currentLocation: location,
      dialogue: {
        isOpen: true,
        messages: [
          `Welcome to ${locationInfo.name}!`,
          locationInfo.description
        ],
        currentIndex: 0
      }
    });
  };

  const color = PORTAL_COLORS[location];

  return (
    <group
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={handleTravel}
    >
      <group ref={portalRef}>
        {/* Portal Frame */}
        <Box args={[1.5, 2, 0.1]}>
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.5}
            metalness={0.8}
            roughness={0.2}
          />
        </Box>
        
        {/* Portal Effect */}
        <Box args={[1.2, 1.7, 0.05]} position={[0, 0, 0.1]}>
          <meshStandardMaterial
            color={hovered ? "#ffffff" : color}
            emissive={hovered ? "#ffffff" : color}
            emissiveIntensity={1}
            transparent
            opacity={0.3}
          />
        </Box>
      </group>

      {/* Location Name */}
      {hovered && (
        <Html position={[0, 2.5, 0]} center>
          <div className="px-4 py-2 bg-black/90 text-white text-sm rounded-lg whitespace-nowrap">
            <div className="font-medium">{LOCATIONS[location].name}</div>
            <div className="text-xs text-white/60 mt-1">
              Available: {LOCATIONS[location].availableAt.join(', ')}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}