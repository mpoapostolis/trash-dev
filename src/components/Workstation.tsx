import { useRef, useState } from 'react';
import { useAtom } from 'jotai';
import { gameStateAtom, updateGameState } from '../state/game';
import { Box, Html } from '@react-three/drei';
import * as THREE from 'three';

export default function Workstation() {
  const [gameState, setGameState] = useAtom(gameStateAtom);
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef();

  const handleInteraction = () => {
    if (!gameState.currentTask) {
      setGameState({
        ...gameState,
        dialogue: {
          isOpen: true,
          messages: [
            "You need to get a task from the Product Owner first!",
            "Try talking to them to get your next assignment."
          ],
          currentIndex: 0
        }
      });
      return;
    }

    if (gameState.energy < 20) {
      setGameState({
        ...gameState,
        dialogue: {
          isOpen: true,
          messages: [
            "You're too tired to work!",
            "Take a break or get some coffee first."
          ],
          currentIndex: 0
        }
      });
      return;
    }

    setGameState({
      ...gameState,
      dialogue: {
        isOpen: true,
        messages: [
          "Time to work on the task!",
          "Let's start coding...",
          "*keyboard typing intensifies*"
        ],
        currentIndex: 0,
        choices: [
          {
            text: `Work on "${gameState.currentTask.title}" (Progress +25%, Energy -20)`,
            action: () => {
              const newProgress = Math.min(gameState.taskProgress + 25, 100);
              const isCompleted = newProgress === 100;
              
              const newState = updateGameState(gameState, {
                energyCost: 20,
                expGain: isCompleted ? gameState.currentTask.expReward : 0,
                awarenessGain: 5
              });

              setGameState({
                ...newState,
                taskProgress: newProgress,
                currentTask: isCompleted ? null : gameState.currentTask,
                completedTasks: isCompleted 
                  ? [...newState.completedTasks, gameState.currentTask.id]
                  : newState.completedTasks,
                dialogue: {
                  isOpen: true,
                  messages: [
                    isCompleted 
                      ? "Task completed! Great work!" 
                      : "Progress saved! Keep going!",
                    `Time passes... It's now ${newState.timeOfDay}.`
                  ],
                  currentIndex: 0
                }
              });
            }
          }
        ]
      }
    });
  };

  return (
    <group
      position={[0, 0.5, -5]}
      onClick={handleInteraction}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <Box
        ref={meshRef}
        args={[2, 1, 1]}
        scale={hovered ? 1.1 : 1}
      >
        <meshStandardMaterial
          color={hovered ? "#4f46e5" : "#3730a3"}
          emissive={hovered ? "#4f46e5" : "#3730a3"}
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </Box>

      {hovered && (
        <Html position={[0, 1.5, 0]} center>
          <div className="px-4 py-2 bg-black/90 text-white text-sm rounded-lg whitespace-nowrap">
            <div className="font-medium">Workstation</div>
            <div className="text-xs text-white/60 mt-1">
              Click to work on current task
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}