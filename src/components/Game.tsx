import { Suspense } from 'react';
import { Physics } from '@react-three/rapier';
import Level from './Level';
import Player from './Player';
import Environment from './Environment';
import Workstation from './Workstation';
import { NPCManager } from './NPCs';

export default function Game() {
  return (
    <Suspense fallback={null}>
      <Environment />
      <Physics debug>
        <Level />
        <Player />
        <Workstation />
        <NPCManager />
      </Physics>
    </Suspense>
  );
}