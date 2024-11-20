import React from 'react';
import { Canvas } from '@react-three/fiber';
import { KeyboardControls } from '@react-three/drei';
import Game from './components/Game';
import Interface from './components/Interface';

const keyboardMap = [
  { name: "forward", keys: ["ArrowUp", "KeyW"] },
  { name: "backward", keys: ["ArrowDown", "KeyS"] },
  { name: "leftward", keys: ["ArrowLeft", "KeyA"] },
  { name: "rightward", keys: ["ArrowRight", "KeyD"] },
  { name: "jump", keys: ["Space"] },
  { name: "run", keys: ["Shift"] },
  { name: "interact", keys: ["KeyF"] },
];

function App() {
  return (
    <KeyboardControls map={keyboardMap}>
      <div className="h-screen w-screen">
        <Canvas
          shadows
          camera={{
            fov: 45,
            near: 0.1,
            far: 200,
            position: [0, 5, 10],
          }}
        >
          <Game />
        </Canvas>
        <Interface />
      </div>
    </KeyboardControls>
  );
}

export default App;