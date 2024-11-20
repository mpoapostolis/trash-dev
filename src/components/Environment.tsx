import { useAtom } from 'jotai';
import { Environment as DreiEnvironment } from '@react-three/drei';
import { gameStateAtom } from '../state/game';

const ENVIRONMENT_PRESETS = {
  office: {
    preset: 'city',
    background: true,
    blur: 0.5,
    ground: {
      height: 15,
      radius: 60,
      scale: 20
    }
  },
  home: {
    preset: 'apartment',
    background: true,
    blur: 0.8,
    ground: {
      height: 8,
      radius: 40,
      scale: 15
    }
  },
  cafe: {
    preset: 'sunset',
    background: true,
    blur: 0.6,
    ground: {
      height: 10,
      radius: 50,
      scale: 18
    }
  },
  gym: {
    preset: 'warehouse',
    background: true,
    blur: 0.4,
    ground: {
      height: 12,
      radius: 45,
      scale: 16
    }
  },
  bar: {
    preset: 'night',
    background: true,
    blur: 1,
    ground: {
      height: 10,
      radius: 40,
      scale: 15
    }
  }
};

const TIME_FILTERS = {
  morning: {
    brightness: 1.2,
    contrast: 1.1,
    saturation: 1.1,
  },
  noon: {
    brightness: 1.4,
    contrast: 1.2,
    saturation: 1.2,
  },
  evening: {
    brightness: 0.9,
    contrast: 0.9,
    saturation: 0.8,
  },
  night: {
    brightness: 0.6,
    contrast: 0.8,
    saturation: 0.6,
  }
};

export default function Environment() {
  const [gameState] = useAtom(gameStateAtom);
  const envPreset = ENVIRONMENT_PRESETS[gameState.currentLocation];
  const timeFilter = TIME_FILTERS[gameState.timeOfDay];

  return (
    <>
      <DreiEnvironment 
        {...envPreset}
        ground={{
          ...envPreset.ground,
          roughness: 0.8,
          metalness: 0.2,
        }}
      />
      <fog attach="fog" args={['#000000', 5, 20]} />
      <ambientLight intensity={timeFilter.brightness * 0.5} />
      <directionalLight 
        position={[4, 4, 1]} 
        intensity={timeFilter.brightness}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={20}
        shadow-camera-near={1}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-camera-left={-10}
        shadow-camera-right={10}
      />
    </>
  );
}