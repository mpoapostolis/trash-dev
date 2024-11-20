import { useAtom } from "jotai"
import { 
  MessageSquare, Package, MapPin, Heart, Battery,
  Sun, Sunrise, Sunset, Moon, Trophy, Clock,
  Brain, ChevronRight
} from "lucide-react"
import { gameStateAtom, ITEMS, LOCATIONS, TIME_PROGRESSION } from "../state/game"
import { useEffect, useState } from "react"

export default function Interface() {
  const [gameState, setGameState] = useAtom(gameStateAtom)
  const [isTyping, setIsTyping] = useState(false)
  const [displayedText, setDisplayedText] = useState("")
  const [showStats, setShowStats] = useState(true)

  useEffect(() => {
    if (gameState.dialogue.isOpen) {
      const text = gameState.dialogue.messages[gameState.dialogue.currentIndex]
      setIsTyping(true)
      setDisplayedText("")
      
      let index = 0
      const timer = setInterval(() => {
        if (index < text.length) {
          setDisplayedText(prev => prev + text[index])
          index++
        } else {
          setIsTyping(false)
          clearInterval(timer)
        }
      }, 30)

      return () => clearInterval(timer)
    }
  }, [gameState.dialogue.isOpen, gameState.dialogue.currentIndex])

  const handleDialogueChoice = (choice) => {
    choice.action()
  }

  const handleNextDialogue = () => {
    if (isTyping) {
      setIsTyping(false)
      setDisplayedText(gameState.dialogue.messages[gameState.dialogue.currentIndex])
      return
    }

    if (gameState.dialogue.currentIndex < gameState.dialogue.messages.length - 1) {
      setGameState({
        ...gameState,
        dialogue: { ...gameState.dialogue, currentIndex: gameState.dialogue.currentIndex + 1 },
      })
    } else {
      setGameState({ 
        ...gameState, 
        dialogue: { 
          isOpen: false, 
          messages: [], 
          currentIndex: 0,
          choices: undefined 
        } 
      })
    }
  }

  const handleInventoryClick = () => {
    const inventoryItems = Object.entries(gameState.inventory.items)
    if (inventoryItems.length === 0) {
      setGameState({
        ...gameState,
        dialogue: {
          isOpen: true,
          messages: ["Your inventory is empty!"],
          currentIndex: 0
        }
      })
      return
    }

    setGameState({
      ...gameState,
      dialogue: {
        isOpen: true,
        messages: ["Your Inventory:"],
        currentIndex: 0,
        choices: inventoryItems.map(([itemId, quantity]) => ({
          text: `${ITEMS[itemId].icon} ${ITEMS[itemId].name} (${quantity}x)`,
          action: () => {
            if (ITEMS[itemId].type === 'consumable' && ITEMS[itemId].effect) {
              const newQuantity = quantity - 1
              const newItems = { ...gameState.inventory.items }
              
              if (newQuantity <= 0) {
                delete newItems[itemId]
              } else {
                newItems[itemId] = newQuantity
              }

              setGameState({
                ...gameState,
                health: Math.min(100, gameState.health + (ITEMS[itemId].effect.health || 0)),
                energy: Math.min(100, gameState.energy + (ITEMS[itemId].effect.energy || 0)),
                awareness: gameState.awareness + (ITEMS[itemId].effect.awareness || 0),
                inventory: {
                  ...gameState.inventory,
                  items: newItems
                },
                dialogue: {
                  isOpen: true,
                  messages: [`Used ${ITEMS[itemId].name}!`],
                  currentIndex: 0
                }
              })
            } else {
              setGameState({
                ...gameState,
                dialogue: {
                  isOpen: true,
                  messages: [ITEMS[itemId].description],
                  currentIndex: 0
                }
              })
            }
          }
        }))
      }
    })
  }

  const TimeIcon = {
    morning: Sunrise,
    noon: Sun,
    evening: Sunset,
    night: Moon
  }[gameState.timeOfDay]

  return (
    <div className="fixed inset-0 pointer-events-none">
      {/* Game HUD */}
      <div className="absolute inset-x-0 top-0 pointer-events-auto">
        {/* Top Stats Bar */}
        <div className="bg-gradient-to-b from-black/80 to-transparent p-4">
          <div className="container mx-auto">
            <div className="flex items-center justify-between">
              {/* Level & EXP */}
              <div className="flex items-center gap-4 bg-black/40 p-3 rounded-xl backdrop-blur-sm">
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                    <Trophy className="w-7 h-7 text-yellow-400" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-black text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                    {gameState.level}
                  </div>
                </div>
                <div>
                  <div className="w-32 h-2 bg-black/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 transition-all duration-300"
                      style={{ width: `${(gameState.exp / gameState.nextLevelExp) * 100}%` }}
                    />
                  </div>
                  <div className="text-xs text-yellow-400/80 mt-1">
                    EXP: {gameState.exp}/{gameState.nextLevelExp}
                  </div>
                </div>
              </div>

              {/* Time & Location */}
              <div className="flex items-center gap-3">
                <div className="bg-black/40 px-4 py-2 rounded-xl backdrop-blur-sm flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <TimeIcon className="w-5 h-5 text-sky-400" />
                    <span className="text-sm font-medium text-sky-400 capitalize">
                      {gameState.timeOfDay}
                    </span>
                  </div>
                  <div className="w-px h-4 bg-white/10" />
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-purple-400" />
                    <span className="text-sm font-medium text-purple-400">
                      {LOCATIONS[gameState.currentLocation].name}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-3 bg-black/40 p-3 rounded-xl backdrop-blur-sm">
                {/* Health */}
                <div className="flex items-center gap-2">
                  <Heart className={`w-5 h-5 ${gameState.health < 30 ? 'text-red-500 animate-pulse' : 'text-red-400'}`} />
                  <div className="w-24 h-2 bg-black/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-300"
                      style={{ width: `${gameState.health}%` }}
                    />
                  </div>
                </div>

                {/* Energy */}
                <div className="flex items-center gap-2">
                  <Battery className={`w-5 h-5 ${gameState.energy < 30 ? 'text-blue-500 animate-pulse' : 'text-blue-400'}`} />
                  <div className="w-24 h-2 bg-black/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-300"
                      style={{ width: `${gameState.energy}%` }}
                    />
                  </div>
                </div>

                {/* Awareness */}
                <div className="flex items-center gap-2">
                  <Brain className={`w-5 h-5 ${gameState.awareness > 70 ? 'text-emerald-400 animate-pulse' : 'text-emerald-500'}`} />
                  <div className="w-24 h-2 bg-black/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-300"
                      style={{ width: `${gameState.awareness}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Current Task */}
      {gameState.currentTask && (
        <div className="absolute top-28 right-4 pointer-events-auto">
          <div className="bg-black/90 border border-indigo-500/30 rounded-xl overflow-hidden w-80">
            <div className="bg-indigo-500/10 px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-medium text-indigo-400">Current Task</h3>
              </div>
              <div className="text-xs text-indigo-400/80">
                {gameState.taskProgress}% Complete
              </div>
            </div>
            <div className="p-4">
              <h4 className="text-lg font-medium text-white/90 mb-2">{gameState.currentTask.title}</h4>
              <p className="text-sm text-white/70 mb-3">{gameState.currentTask.description}</p>
              <div className="h-2 bg-black/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 transition-all duration-300"
                  style={{ width: `${gameState.taskProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Button */}
      <div className="absolute bottom-4 left-4 pointer-events-auto">
        <button
          onClick={handleInventoryClick}
          className="bg-purple-500/90 hover:bg-purple-500 text-white px-4 py-2.5 rounded-xl
                   transition-all duration-300 shadow-lg flex items-center gap-2 group
                   hover:shadow-purple-500/20 hover:shadow-xl"
        >
          <Package className="w-5 h-5" />
          <span className="text-sm font-medium">Inventory</span>
          <span className="text-xs bg-white/20 px-2 py-0.5 rounded-lg">
            {Object.keys(gameState.inventory.items).length}/{gameState.inventory.maxSlots}
          </span>
        </button>
      </div>

      {/* Dialog Box */}
      {gameState.dialogue.isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] pointer-events-auto">
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4">
            <div className="bg-gray-900/95 border border-indigo-500/30 rounded-xl shadow-2xl overflow-hidden">
              <div className="bg-indigo-500/10 border-b border-indigo-500/20 p-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-indigo-400">
                    {gameState.currentTask ? "Task Discussion" : "Conversation"}
                  </h3>
                </div>
              </div>

              <div className="p-4">
                <div className="min-h-[80px] text-base text-white/90 leading-relaxed">
                  {displayedText}
                  {isTyping && <span className="animate-pulse">▊</span>}
                </div>

                <div className="mt-4 flex flex-col gap-2">
                  {!isTyping && gameState.dialogue.choices ? (
                    gameState.dialogue.choices.map((choice, index) => (
                      <button
                        key={index}
                        onClick={() => handleDialogueChoice(choice)}
                        className="w-full bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 
                                 text-white px-4 py-3 rounded-lg text-sm font-medium transition-all 
                                 text-left hover:border-indigo-500/50 hover:pl-6 group"
                      >
                        <div className="flex items-center justify-between">
                          <span>{choice.text}</span>
                          <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                        </div>
                      </button>
                    ))
                  ) : (
                    <button
                      onClick={handleNextDialogue}
                      className="self-end bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2.5 
                               rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2
                               hover:shadow-lg hover:shadow-indigo-500/20"
                    >
                      {isTyping ? "Skip" : gameState.dialogue.currentIndex < gameState.dialogue.messages.length - 1 ? "Continue" : "Close"}
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}