import { useRef, useState } from 'react';
import { Html, Float } from '@react-three/drei';
import { useAtom } from 'jotai';
import { gameStateAtom, LOCATIONS, ITEMS, SCRUM_EVENTS, TASKS, updateGameState } from '../state/game';
import * as THREE from 'three';

const NPC_CONFIG = {
  productOwner: {
    color: '#3498db',
    darkColor: '#2980b9',
    hoverColor: '#4aa3df',
    title: 'Product Owner',
    hintText: 'Get new task',
    position: [5, 0, 5],
    availableAt: ['morning', 'noon', 'evening']
  },
  scrumMaster: {
    color: '#e74c3c',
    darkColor: '#c0392b',
    hoverColor: '#e95e50',
    title: 'Scrum Master',
    hintText: 'Scrum activities',
    position: [-5, 0, 5],
    availableAt: ['morning', 'noon']
  },
  barista: {
    color: '#27ae60',
    darkColor: '#219a52',
    hoverColor: '#2ecc71',
    title: 'Barista',
    hintText: 'Buy coffee',
    position: [0, 0, 5],
    availableAt: ['morning', 'noon', 'evening']
  },
  trainer: {
    color: '#f1c40f',
    darkColor: '#d4ac0d',
    hoverColor: '#f4d03f',
    title: 'Trainer',
    hintText: 'Exercise',
    position: [3, 0, 3],
    availableAt: ['morning', 'noon', 'evening']
  },
  bartender: {
    color: '#9b59b6',
    darkColor: '#8e44ad',
    hoverColor: '#a66bbe',
    title: 'Bartender',
    hintText: 'Order drinks',
    position: [-3, 0, 3],
    availableAt: ['evening', 'night']
  }
};

function NPC({ config, onInteract }) {
  const [hovered, setHovered] = useState(false);
  const [gameState] = useAtom(gameStateAtom);
  const meshRef = useRef();

  const isAvailable = config.availableAt.includes(gameState.timeOfDay);

  return (
    <Float
      speed={2}
      rotationIntensity={0.2}
      floatIntensity={0.5}
      enabled={hovered}
    >
      <group
        position={config.position}
        onClick={isAvailable ? onInteract : null}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        scale={isAvailable ? 1 : 0.8}
      >
        <mesh castShadow ref={meshRef}>
          <capsuleGeometry args={[0.5, 1, 4, 8]} />
          <meshStandardMaterial
            color={hovered ? config.hoverColor : config.color}
            emissive={config.color}
            emissiveIntensity={hovered ? 0.6 : 0.3}
            opacity={isAvailable ? 1 : 0.5}
            transparent={!isAvailable}
          />
        </mesh>
        <mesh position={[0, 1.2, 0]} castShadow>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshStandardMaterial
            color={hovered ? config.hoverColor : config.darkColor}
            emissive={config.darkColor}
            emissiveIntensity={hovered ? 0.6 : 0.3}
            opacity={isAvailable ? 1 : 0.5}
            transparent={!isAvailable}
          />
        </mesh>

        {hovered && (
          <Html position={[0, 2, 0]} center>
            <div className="pointer-events-none select-none">
              <div className={`px-3 py-1.5 rounded-full text-white text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                hovered ? 'scale-110' : 'scale-100'
              }`} style={{ backgroundColor: config.color }}>
                {config.title}
              </div>
              {isAvailable ? (
                <div className="mt-2 bg-gray-900/90 text-white text-xs px-3 py-1.5 rounded-lg backdrop-blur-sm whitespace-nowrap transform transition-all duration-300 animate-fade-in">
                  Click to {config.hintText}
                </div>
              ) : (
                <div className="mt-2 bg-red-900/90 text-white text-xs px-3 py-1.5 rounded-lg backdrop-blur-sm whitespace-nowrap transform transition-all duration-300 animate-fade-in">
                  Available at: {config.availableAt.join(', ')}
                </div>
              )}
            </div>
          </Html>
        )}
      </group>
    </Float>
  );
}

export function NPCManager() {
  const [gameState, setGameState] = useAtom(gameStateAtom);

  const handleProductOwnerInteraction = () => {
    if (!gameState.currentTask) {
      const availableTasks = TASKS.filter(task => 
        !gameState.completedTasks.includes(task.id)
      );
      
      if (availableTasks.length > 0) {
        const randomTask = availableTasks[Math.floor(Math.random() * availableTasks.length)];
        setGameState({
          ...gameState,
          currentTask: randomTask,
          taskProgress: 0,
          dialogue: {
            isOpen: true,
            messages: randomTask.dialogue,
            currentIndex: 0
          }
        });
      } else {
        setGameState({
          ...gameState,
          dialogue: {
            isOpen: true,
            messages: [
              "Great work! You've completed all available tasks.",
              "Take a break and come back later for more challenges."
            ],
            currentIndex: 0
          }
        });
      }
    } else {
      setGameState({
        ...gameState,
        dialogue: {
          isOpen: true,
          messages: [
            "You still have an ongoing task!",
            "Let's focus on one thing at a time.",
            "Complete your current task first."
          ],
          currentIndex: 0
        }
      });
    }
  };

  const handleScrumMasterInteraction = () => {
    const availableEvents = SCRUM_EVENTS.filter(event => 
      !gameState.completedEvents.includes(event.id)
    );

    if (availableEvents.length > 0) {
      setGameState({
        ...gameState,
        dialogue: {
          isOpen: true,
          messages: ["What Scrum event would you like to participate in?"],
          currentIndex: 0,
          choices: availableEvents.map(event => ({
            text: `${event.title} (EXP +${event.expReward}, Energy -${event.energyCost})`,
            action: () => {
              if (gameState.energy >= event.energyCost) {
                const newState = updateGameState(gameState, {
                  energyCost: event.energyCost,
                  expGain: event.expReward,
                  awarenessGain: 5
                });
                
                setGameState({
                  ...newState,
                  completedEvents: [...newState.completedEvents, event.id],
                  dialogue: {
                    isOpen: true,
                    messages: event.dialogue,
                    currentIndex: 0
                  }
                });
              } else {
                setGameState({
                  ...gameState,
                  dialogue: {
                    isOpen: true,
                    messages: [
                      "You're too tired for this event.",
                      "Take a break and restore your energy first.",
                      "Remember, sustainable pace is key!"
                    ],
                    currentIndex: 0
                  }
                });
              }
            }
          }))
        }
      });
    } else {
      setGameState({
        ...gameState,
        dialogue: {
          isOpen: true,
          messages: [
            "You've participated in all events for now!",
            "Come back tomorrow for more Scrum events."
          ],
          currentIndex: 0
        }
      });
    }
  };

  const handleBaristaInteraction = () => {
    setGameState({
      ...gameState,
      dialogue: {
        isOpen: true,
        messages: ["Welcome! What can I get you?"],
        currentIndex: 0,
        choices: [
          {
            text: "Coffee (Energy +30, $5)",
            action: () => {
              const newItems = { ...gameState.inventory.items };
              newItems.coffee = (newItems.coffee || 0) + 1;
              setGameState({
                ...gameState,
                inventory: {
                  ...gameState.inventory,
                  items: newItems
                },
                dialogue: {
                  isOpen: true,
                  messages: ["Here's your coffee! Enjoy!"],
                  currentIndex: 0
                }
              });
            }
          },
          {
            text: "Energy Drink (Energy +50, Health -10, $8)",
            action: () => {
              const newItems = { ...gameState.inventory.items };
              newItems.energyDrink = (newItems.energyDrink || 0) + 1;
              setGameState({
                ...gameState,
                inventory: {
                  ...gameState.inventory,
                  items: newItems
                },
                dialogue: {
                  isOpen: true,
                  messages: ["One energy drink coming right up!"],
                  currentIndex: 0
                }
              });
            }
          }
        ]
      }
    });
  };

  const handleTrainerInteraction = () => {
    if (gameState.energy < 30) {
      setGameState({
        ...gameState,
        dialogue: {
          isOpen: true,
          messages: [
            "You look exhausted!",
            "Come back when you have more energy.",
            "Exercise requires at least 30 energy."
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
        messages: ["Ready for a workout?"],
        currentIndex: 0,
        choices: [
          {
            text: "Quick workout (Health +20, Energy -30)",
            action: () => {
              const newState = updateGameState(gameState, {
                energyCost: 30,
                healthCost: -20,
                awarenessGain: 5
              });
              setGameState({
                ...newState,
                dialogue: {
                  isOpen: true,
                  messages: [
                    "Great workout!",
                    "You're feeling energized and healthy.",
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

  const handleBartenderInteraction = () => {
    setGameState({
      ...gameState,
      dialogue: {
        isOpen: true,
        messages: ["Welcome to the Tech Bar! What can I get you?"],
        currentIndex: 0,
        choices: [
          {
            text: "Chat about tech (Awareness +10, Energy -10)",
            action: () => {
              const newState = updateGameState(gameState, {
                energyCost: 10,
                awarenessGain: 10
              });
              setGameState({
                ...newState,
                dialogue: {
                  isOpen: true,
                  messages: [
                    "Interesting discussion about the latest tech trends!",
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

  const npcHandlers = {
    productOwner: handleProductOwnerInteraction,
    scrumMaster: handleScrumMasterInteraction,
    barista: handleBaristaInteraction,
    trainer: handleTrainerInteraction,
    bartender: handleBartenderInteraction
  };

  return (
    <group>
      {Object.entries(NPC_CONFIG)
        .filter(([npcId]) => LOCATIONS[gameState.currentLocation].npcs.includes(npcId))
        .map(([npcId, config]) => (
          <NPC 
            key={npcId} 
            config={config} 
            onInteract={npcHandlers[npcId]} 
          />
        ))}
    </group>
  );
}