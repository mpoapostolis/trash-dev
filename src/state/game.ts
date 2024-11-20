import { atom } from 'jotai';

export type TimeOfDay = 'morning' | 'noon' | 'evening' | 'night';
export type Location = 'home' | 'office' | 'cafe' | 'gym' | 'bar';

export interface Task {
  id: string;
  title: string;
  description: string;
  expReward: number;
  timeLimit: number;
  dialogue: string[];
}

export interface ScrumEvent {
  id: string;
  title: string;
  description: string;
  expReward: number;
  energyCost: number;
  dialogue: string[];
}

export interface LocationInfo {
  name: string;
  description: string;
  availableAt: TimeOfDay[];
  npcs: string[];
}

export interface Item {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'consumable' | 'key' | 'collectible';
  effect?: {
    health?: number;
    energy?: number;
    awareness?: number;
  };
}

export const TIME_PROGRESSION: Record<TimeOfDay, TimeOfDay> = {
  morning: 'noon',
  noon: 'evening',
  evening: 'night',
  night: 'morning'
};

export const LOCATIONS: Record<Location, LocationInfo> = {
  home: {
    name: 'Home',
    description: 'Your cozy apartment. A perfect place to rest and recover.',
    availableAt: ['morning', 'evening', 'night'],
    npcs: ['roommate']
  },
  office: {
    name: 'Office',
    description: 'The bustling tech startup where you work.',
    availableAt: ['morning', 'noon', 'evening'],
    npcs: ['productOwner', 'scrumMaster', 'techLead']
  },
  cafe: {
    name: 'Coffee Shop',
    description: 'A quiet cafe perfect for focused work.',
    availableAt: ['morning', 'noon', 'evening'],
    npcs: ['barista', 'freelancer']
  },
  gym: {
    name: 'Gym',
    description: 'Keep your body and mind healthy.',
    availableAt: ['morning', 'noon', 'evening'],
    npcs: ['trainer']
  },
  bar: {
    name: 'Tech Bar',
    description: 'Popular hangout spot for local developers.',
    availableAt: ['evening', 'night'],
    npcs: ['bartender', 'seniorDev']
  }
};

export const ITEMS: Record<string, Item> = {
  coffee: {
    id: 'coffee',
    name: 'Coffee',
    description: 'A fresh cup of coffee. Restores energy.',
    icon: '☕',
    type: 'consumable',
    effect: {
      energy: 30
    }
  },
  energyDrink: {
    id: 'energyDrink',
    name: 'Energy Drink',
    description: 'Quick energy boost but might crash later.',
    icon: '🥤',
    type: 'consumable',
    effect: {
      energy: 50,
      health: -10
    }
  },
  healthySnack: {
    id: 'healthySnack',
    name: 'Healthy Snack',
    description: 'A nutritious snack. Restores health.',
    icon: '🥗',
    type: 'consumable',
    effect: {
      health: 20
    }
  },
  meditationGuide: {
    id: 'meditationGuide',
    name: 'Meditation Guide',
    description: 'Ancient wisdom for modern problems.',
    icon: '📔',
    type: 'collectible',
    effect: {
      awareness: 10
    }
  }
};

export const TASKS: Task[] = [
  {
    id: 'task1',
    title: 'Fix Critical Bug',
    description: 'Production is down! We need this fixed ASAP!',
    expReward: 100,
    timeLimit: 60,
    dialogue: [
      "Emergency! The main service is down!",
      "Users are complaining and the CEO is breathing down our necks.",
      "Can you handle this ASAP?"
    ]
  },
  {
    id: 'task2',
    title: 'Implement Dark Mode',
    description: 'Users have been requesting this feature for months.',
    expReward: 80,
    timeLimit: 120,
    dialogue: [
      "Hey dev! Our users really want a dark mode.",
      "Should be straightforward, right?",
      "The design team already provided the specs."
    ]
  },
  {
    id: 'task3',
    title: 'Optimize Performance',
    description: 'The app is getting sluggish. Time for some optimization.',
    expReward: 120,
    timeLimit: 180,
    dialogue: [
      "Our metrics show the app is slowing down.",
      "We need to improve performance across the board.",
      "Think you can handle this optimization task?"
    ]
  }
];

export const SCRUM_EVENTS: ScrumEvent[] = [
  {
    id: 'daily',
    title: 'Daily Standup',
    description: 'Quick sync with the team',
    expReward: 20,
    energyCost: 10,
    dialogue: [
      "Good morning team!",
      "Let's sync up on our progress.",
      "Any blockers we should discuss?"
    ]
  },
  {
    id: 'retro',
    title: 'Sprint Retrospective',
    description: 'Review and improve our process',
    expReward: 50,
    energyCost: 25,
    dialogue: [
      "Time to reflect on our sprint.",
      "What went well? What could be improved?",
      "Let's make actionable improvements."
    ]
  }
];

export interface GameState {
  level: number;
  exp: number;
  nextLevelExp: number;
  health: number;
  energy: number;
  awareness: number;
  day: number;
  timeOfDay: TimeOfDay;
  currentLocation: Location;
  currentTask: Task | null;
  taskProgress: number;
  completedTasks: string[];
  completedEvents: string[];
  inventory: {
    maxSlots: number;
    items: Record<string, number>;
  };
  dialogue: {
    isOpen: boolean;
    messages: string[];
    currentIndex: number;
    choices?: {
      text: string;
      action: () => void;
    }[];
  };
}

export const initialGameState: GameState = {
  level: 1,
  exp: 0,
  nextLevelExp: 100,
  health: 100,
  energy: 100,
  awareness: 0,
  day: 1,
  timeOfDay: 'morning',
  currentLocation: 'home',
  currentTask: null,
  taskProgress: 0,
  completedTasks: [],
  completedEvents: [],
  inventory: {
    maxSlots: 10,
    items: {}
  },
  dialogue: {
    isOpen: false,
    messages: [],
    currentIndex: 0
  }
};

export const gameStateAtom = atom<GameState>(initialGameState);

export function updateGameState(
  currentState: GameState,
  changes: {
    energyCost?: number;
    expGain?: number;
    awarenessGain?: number;
    healthCost?: number;
  }
): GameState {
  const newState = { ...currentState };

  // Update stats
  if (changes.energyCost) {
    newState.energy = Math.max(0, currentState.energy - changes.energyCost);
  }
  if (changes.healthCost) {
    newState.health = Math.max(0, currentState.health - changes.healthCost);
  }
  if (changes.expGain) {
    newState.exp += changes.expGain;
    // Level up check
    while (newState.exp >= newState.nextLevelExp) {
      newState.level += 1;
      newState.exp -= newState.nextLevelExp;
      newState.nextLevelExp = Math.floor(newState.nextLevelExp * 1.5);
    }
  }
  if (changes.awarenessGain) {
    newState.awareness = Math.min(100, currentState.awareness + changes.awarenessGain);
  }

  // Progress time
  newState.timeOfDay = TIME_PROGRESSION[currentState.timeOfDay];
  if (newState.timeOfDay === 'morning') {
    newState.day += 1;
    // Reset daily events
    newState.completedEvents = [];
  }

  return newState;
}