import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Meal {
  id: string
  name: string
  type: 'breakfast' | 'lunch' | 'dinner'
  ingredients: string[]
  calories?: number
  image: string
  cookTime?: string
  tags?: string[]
}

export interface DayPlan {
  date: string
  breakfast: Meal | null
  lunch: Meal | null
  dinner: Meal | null
  skipped?: { breakfast?: boolean; lunch?: boolean; dinner?: boolean }
  done?: { breakfast?: boolean; lunch?: boolean; dinner?: boolean }
}

export interface Recipe {
  id: string
  name: string
  link?: string
  ingredients: string[]
  category: 'main' | 'additional'
  tags?: string[]
  note?: string
  image?: string
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snacks'
}

export interface SharedRecipe {
  id: string
  name: string
  sharedBy: string
  link?: string
  sourceType: 'youtube' | 'instagram' | 'manual'
  ingredients: string[]
  tags: string[]
  note?: string
  timestamp: number
  image?: string
  cookApproved?: boolean
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snacks'
}

export interface GroceryItem {
  id: string
  name: string
  checked: boolean
  forDate?: string
}

export interface Friend {
  id: string
  name: string
  phone: string
}

export interface UserPreferences {
  name: string
  email: string
  profileImage: string
  dietaryPreferences: string[]
  avoidances: string[]
  mealCount: number
  hasCook: boolean
  cookName: string
  cookPhone: string
  preferredGroceryApp: 'blinkit' | 'zepto' | 'swiggy' | 'bigbasket' | 'dunzo' | ''
  preferredGroceryApps: string[]
  onboardingComplete: boolean
  darkMode: boolean
}

interface AppState {
  preferences: UserPreferences
  weeklyPlan: DayPlan[]
  recipes: Recipe[]
  sharedRecipes: SharedRecipe[]
  groceryList: GroceryItem[]
  friends: Friend[]

  setPreferences: (prefs: Partial<UserPreferences>) => void
  completeOnboarding: () => void
  signOut: () => void

  setDayPlan: (date: string, meal: Partial<DayPlan>) => void
  initWeeklyPlan: () => void
  rotateMeal: (date: string, type: 'breakfast' | 'lunch' | 'dinner') => void
  skipMeal: (date: string, type: 'breakfast' | 'lunch' | 'dinner') => void
  markDone: (date: string, type: 'breakfast' | 'lunch' | 'dinner') => void

  addRecipe: (recipe: Recipe) => void
  updateRecipe: (id: string, recipe: Partial<Recipe>) => void
  deleteRecipe: (id: string) => void

  addSharedRecipe: (recipe: SharedRecipe) => void
  removeSharedRecipe: (id: string) => void

  addGroceryItem: (item: GroceryItem) => void
  toggleGroceryItem: (id: string) => void
  removeGroceryItem: (id: string) => void
  generateGroceryForDate: (date: string) => void
  generateWeeklyGrocery: () => void

  addFriend: (friend: Friend) => void
  removeFriend: (id: string) => void
}

export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// High-quality Unsplash food images mapped to meals
const MEAL_IMAGES: Record<string, string> = {
  poha: 'https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=800&q=80',
  'idli sambar': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&q=80',
  'paratha with curd': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80',
  upma: 'https://images.unsplash.com/photo-1606491956689-2ea866880049?w=800&q=80',
  'dosa with chutney': 'https://images.unsplash.com/photo-1668236543090-82eb5eaf04b7?w=800&q=80',
  'bread omelette': 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&q=80',
  'sprouts chaat': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
  'dal rice': 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800&q=80',
  'rajma chawal': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80',
  'chole roti': 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&q=80',
  'chicken curry rice': 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&q=80',
  'paneer butter masala roti': 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&q=80',
  'sambar rice': 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800&q=80',
  'egg curry rice': 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&q=80',
  khichdi: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800&q=80',
  'roti sabzi': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80',
  'palak paneer roti': 'https://images.unsplash.com/photo-1618449840665-9ed506d73a34?w=800&q=80',
  'dal tadka roti': 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800&q=80',
  'chicken biryani': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80',
  'aloo gobi roti': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80',
  'moong dal cheela': 'https://images.unsplash.com/photo-1668236543090-82eb5eaf04b7?w=800&q=80',
}

function getMealImage(name: string): string {
  const lower = name.toLowerCase()
  for (const [key, url] of Object.entries(MEAL_IMAGES)) {
    if (lower.includes(key) || key.includes(lower)) return url
  }
  const fallbacks = [
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
    'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80',
    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&q=80',
  ]
  return fallbacks[Math.floor(Math.random() * fallbacks.length)]
}

export const DEFAULT_MEALS: Record<string, Meal[]> = {
  breakfast: [
    { id: 'b1', name: 'Poha', type: 'breakfast', ingredients: ['Flattened rice', 'Onion', 'Peanuts', 'Turmeric', 'Curry leaves'], calories: 250, image: MEAL_IMAGES['poha'], cookTime: '15 min', tags: ['Light', 'Quick'] },
    { id: 'b2', name: 'Idli Sambar', type: 'breakfast', ingredients: ['Idli batter', 'Toor dal', 'Mixed vegetables', 'Sambar powder'], calories: 200, image: MEAL_IMAGES['idli sambar'], cookTime: '20 min', tags: ['South Indian', 'Healthy'] },
    { id: 'b3', name: 'Paratha with Curd', type: 'breakfast', ingredients: ['Wheat flour', 'Potato', 'Curd', 'Butter', 'Pickle'], calories: 350, image: MEAL_IMAGES['paratha with curd'], cookTime: '25 min', tags: ['North Indian', 'Filling'] },
    { id: 'b4', name: 'Upma', type: 'breakfast', ingredients: ['Semolina', 'Onion', 'Green chili', 'Mustard seeds', 'Curry leaves'], calories: 220, image: MEAL_IMAGES['upma'], cookTime: '15 min', tags: ['South Indian', 'Quick'] },
    { id: 'b5', name: 'Dosa with Chutney', type: 'breakfast', ingredients: ['Dosa batter', 'Coconut', 'Green chili', 'Oil'], calories: 180, image: MEAL_IMAGES['dosa with chutney'], cookTime: '20 min', tags: ['South Indian', 'Crispy'] },
    { id: 'b6', name: 'Bread Omelette', type: 'breakfast', ingredients: ['Eggs', 'Bread', 'Onion', 'Tomato', 'Green chili'], calories: 300, image: MEAL_IMAGES['bread omelette'], cookTime: '10 min', tags: ['High Protein', 'Quick'] },
    { id: 'b7', name: 'Sprouts Chaat', type: 'breakfast', ingredients: ['Moong sprouts', 'Onion', 'Tomato', 'Lemon', 'Chaat masala'], calories: 150, image: MEAL_IMAGES['sprouts chaat'], cookTime: '10 min', tags: ['Healthy', 'No Cook'] },
  ],
  lunch: [
    { id: 'l1', name: 'Dal Rice', type: 'lunch', ingredients: ['Toor dal', 'Rice', 'Ghee', 'Cumin', 'Tomato'], calories: 400, image: MEAL_IMAGES['dal rice'], cookTime: '30 min', tags: ['Comfort Food', 'Everyday'] },
    { id: 'l2', name: 'Rajma Chawal', type: 'lunch', ingredients: ['Kidney beans', 'Rice', 'Onion', 'Tomato', 'Rajma masala'], calories: 450, image: MEAL_IMAGES['rajma chawal'], cookTime: '45 min', tags: ['North Indian', 'Protein'] },
    { id: 'l3', name: 'Chole Roti', type: 'lunch', ingredients: ['Chickpeas', 'Wheat flour', 'Onion', 'Ginger garlic paste', 'Chole masala'], calories: 420, image: MEAL_IMAGES['chole roti'], cookTime: '40 min', tags: ['Punjabi', 'Filling'] },
    { id: 'l4', name: 'Chicken Curry Rice', type: 'lunch', ingredients: ['Chicken', 'Rice', 'Onion', 'Tomato', 'Garam masala', 'Curd'], calories: 550, image: MEAL_IMAGES['chicken curry rice'], cookTime: '45 min', tags: ['Non-Veg', 'High Protein'] },
    { id: 'l5', name: 'Paneer Butter Masala Roti', type: 'lunch', ingredients: ['Paneer', 'Wheat flour', 'Butter', 'Cream', 'Tomato puree'], calories: 500, image: MEAL_IMAGES['paneer butter masala roti'], cookTime: '35 min', tags: ['Rich', 'Vegetarian'] },
    { id: 'l6', name: 'Sambar Rice', type: 'lunch', ingredients: ['Toor dal', 'Rice', 'Mixed vegetables', 'Sambar powder', 'Tamarind'], calories: 380, image: MEAL_IMAGES['sambar rice'], cookTime: '35 min', tags: ['South Indian', 'Healthy'] },
    { id: 'l7', name: 'Egg Curry Rice', type: 'lunch', ingredients: ['Eggs', 'Rice', 'Onion', 'Tomato', 'Garam masala'], calories: 400, image: MEAL_IMAGES['egg curry rice'], cookTime: '30 min', tags: ['Eggetarian', 'Easy'] },
  ],
  dinner: [
    { id: 'd1', name: 'Khichdi', type: 'dinner', ingredients: ['Rice', 'Moong dal', 'Ghee', 'Cumin', 'Turmeric'], calories: 300, image: MEAL_IMAGES['khichdi'], cookTime: '25 min', tags: ['Light', 'Comfort'] },
    { id: 'd2', name: 'Roti Sabzi', type: 'dinner', ingredients: ['Wheat flour', 'Mixed vegetables', 'Oil', 'Spices'], calories: 320, image: MEAL_IMAGES['roti sabzi'], cookTime: '30 min', tags: ['Everyday', 'Light'] },
    { id: 'd3', name: 'Palak Paneer Roti', type: 'dinner', ingredients: ['Spinach', 'Paneer', 'Wheat flour', 'Cream', 'Garlic'], calories: 400, image: MEAL_IMAGES['palak paneer roti'], cookTime: '35 min', tags: ['Iron Rich', 'Vegetarian'] },
    { id: 'd4', name: 'Dal Tadka Roti', type: 'dinner', ingredients: ['Toor dal', 'Wheat flour', 'Ghee', 'Garlic', 'Cumin'], calories: 350, image: MEAL_IMAGES['dal tadka roti'], cookTime: '30 min', tags: ['Everyday', 'Comfort'] },
    { id: 'd5', name: 'Chicken Biryani', type: 'dinner', ingredients: ['Chicken', 'Basmati rice', 'Onion', 'Biryani masala', 'Curd', 'Saffron'], calories: 600, image: MEAL_IMAGES['chicken biryani'], cookTime: '60 min', tags: ['Special', 'Non-Veg'] },
    { id: 'd6', name: 'Aloo Gobi Roti', type: 'dinner', ingredients: ['Potato', 'Cauliflower', 'Wheat flour', 'Turmeric', 'Cumin'], calories: 350, image: MEAL_IMAGES['aloo gobi roti'], cookTime: '30 min', tags: ['Everyday', 'Simple'] },
    { id: 'd7', name: 'Moong Dal Cheela', type: 'dinner', ingredients: ['Moong dal', 'Onion', 'Green chili', 'Curd'], calories: 250, image: MEAL_IMAGES['moong dal cheela'], cookTime: '20 min', tags: ['Light', 'High Protein'] },
  ],
}

export function generateId() {
  return Math.random().toString(36).slice(2, 11)
}

function getWeekDates(): string[] {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d.toISOString().split('T')[0]
  })
}

export function guessIngredients(name: string): string[] {
  const lower = name.toLowerCase()
  const map: Record<string, string[]> = {
    biryani: ['Basmati rice', 'Onion', 'Curd', 'Biryani masala', 'Saffron', 'Ghee', 'Mint'],
    paneer: ['Paneer', 'Onion', 'Tomato', 'Cream', 'Garam masala', 'Ginger garlic paste'],
    chicken: ['Chicken', 'Onion', 'Tomato', 'Ginger garlic paste', 'Oil', 'Spices'],
    pasta: ['Pasta', 'Olive oil', 'Garlic', 'Tomato sauce', 'Cheese', 'Bell pepper'],
    dal: ['Toor dal', 'Onion', 'Tomato', 'Turmeric', 'Cumin', 'Ghee'],
    egg: ['Eggs', 'Onion', 'Oil', 'Salt', 'Pepper'],
    roti: ['Wheat flour', 'Water', 'Salt', 'Ghee'],
    dosa: ['Dosa batter', 'Oil', 'Butter'],
    salad: ['Lettuce', 'Tomato', 'Cucumber', 'Olive oil', 'Lemon'],
    soup: ['Mixed vegetables', 'Butter', 'Salt', 'Pepper', 'Cream'],
    omelette: ['Eggs', 'Onion', 'Green chili', 'Salt', 'Oil'],
    sandwich: ['Bread', 'Butter', 'Lettuce', 'Tomato', 'Cheese'],
    rice: ['Rice', 'Water', 'Salt'],
    curry: ['Onion', 'Tomato', 'Ginger garlic paste', 'Spices', 'Oil'],
    sabzi: ['Mixed vegetables', 'Oil', 'Cumin', 'Turmeric', 'Salt'],
    paratha: ['Wheat flour', 'Ghee', 'Salt', 'Water'],
    poha: ['Flattened rice', 'Onion', 'Peanuts', 'Turmeric', 'Curry leaves'],
    idli: ['Idli batter', 'Salt'],
    sambar: ['Toor dal', 'Mixed vegetables', 'Sambar powder', 'Tamarind'],
    upma: ['Semolina', 'Onion', 'Green chili', 'Mustard seeds'],
    khichdi: ['Rice', 'Moong dal', 'Ghee', 'Turmeric'],
    rajma: ['Kidney beans', 'Onion', 'Tomato', 'Rajma masala'],
    chole: ['Chickpeas', 'Onion', 'Chole masala', 'Ginger garlic paste'],
  }
  const matched: string[] = []
  for (const [key, ingredients] of Object.entries(map)) {
    if (lower.includes(key)) matched.push(...ingredients)
  }
  return matched.length > 0 ? [...new Set(matched)] : ['Oil', 'Salt', 'Onion', 'Spices']
}

export function detectSourceType(link?: string): 'youtube' | 'instagram' | 'manual' {
  if (!link) return 'manual'
  if (link.includes('youtube') || link.includes('youtu.be')) return 'youtube'
  if (link.includes('instagram')) return 'instagram'
  return 'manual'
}

export function getCurrentMealType(): 'breakfast' | 'lunch' | 'dinner' {
  const hour = new Date().getHours()
  if (hour < 11) return 'breakfast'
  if (hour < 16) return 'lunch'
  return 'dinner'
}

export function getNextMealTypes(): ('breakfast' | 'lunch' | 'dinner')[] {
  const current = getCurrentMealType()
  if (current === 'breakfast') return ['lunch', 'dinner']
  if (current === 'lunch') return ['dinner']
  return []
}

const DEFAULT_PREFERENCES: UserPreferences = {
  name: '',
  email: '',
  profileImage: '',
  dietaryPreferences: [],
  avoidances: [],
  mealCount: 3,
  hasCook: false,
  cookName: '',
  cookPhone: '',
  preferredGroceryApp: '',
  preferredGroceryApps: [],
  onboardingComplete: false,
  darkMode: false,
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      preferences: { ...DEFAULT_PREFERENCES },
      weeklyPlan: [],
      recipes: [],
      sharedRecipes: [],
      groceryList: [],
      friends: [],

      setPreferences: (prefs) =>
        set((s) => ({ preferences: { ...s.preferences, ...prefs } })),

      completeOnboarding: () =>
        set((s) => ({ preferences: { ...s.preferences, onboardingComplete: true } })),

      signOut: () =>
        set({
          preferences: { ...DEFAULT_PREFERENCES },
          weeklyPlan: [],
          recipes: [],
          sharedRecipes: [],
          groceryList: [],
          friends: [],
        }),

      initWeeklyPlan: () => {
        const dates = getWeekDates()
        const existing = get().weeklyPlan
        const existingDates = new Set(existing.map((d) => d.date))
        const newPlans = dates
          .filter((date) => !existingDates.has(date))
          .map((date, i) => ({
            date,
            breakfast: DEFAULT_MEALS.breakfast[i % 7],
            lunch: DEFAULT_MEALS.lunch[i % 7],
            dinner: DEFAULT_MEALS.dinner[i % 7],
            skipped: {},
            done: {},
          }))
        if (newPlans.length > 0) {
          set({
            weeklyPlan: [...existing.filter((d) => dates.includes(d.date)), ...newPlans].sort(
              (a, b) => a.date.localeCompare(b.date)
            ),
          })
        }
      },

      setDayPlan: (date, meal) =>
        set((s) => ({
          weeklyPlan: s.weeklyPlan.map((d) => (d.date === date ? { ...d, ...meal } : d)),
        })),

      rotateMeal: (date, type) =>
        set((s) => {
          const meals = DEFAULT_MEALS[type]
          const dayPlan = s.weeklyPlan.find((d) => d.date === date)
          const current = dayPlan?.[type]
          const others = meals.filter((m) => m.id !== current?.id)
          const newMeal = others[Math.floor(Math.random() * others.length)]
          return {
            weeklyPlan: s.weeklyPlan.map((d) =>
              d.date === date ? { ...d, [type]: newMeal } : d
            ),
          }
        }),

      skipMeal: (date, type) =>
        set((s) => ({
          weeklyPlan: s.weeklyPlan.map((d) =>
            d.date === date ? { ...d, skipped: { ...d.skipped, [type]: true } } : d
          ),
        })),

      markDone: (date, type) =>
        set((s) => ({
          weeklyPlan: s.weeklyPlan.map((d) =>
            d.date === date ? { ...d, done: { ...d.done, [type]: true } } : d
          ),
        })),

      addRecipe: (recipe) => set((s) => ({ recipes: [...s.recipes, recipe] })),
      updateRecipe: (id, data) =>
        set((s) => ({ recipes: s.recipes.map((r) => (r.id === id ? { ...r, ...data } : r)) })),
      deleteRecipe: (id) => set((s) => ({ recipes: s.recipes.filter((r) => r.id !== id) })),

      addSharedRecipe: (recipe) => set((s) => ({ sharedRecipes: [recipe, ...s.sharedRecipes] })),
      removeSharedRecipe: (id) => set((s) => ({ sharedRecipes: s.sharedRecipes.filter((r) => r.id !== id) })),

      addGroceryItem: (item) => set((s) => ({ groceryList: [...s.groceryList, item] })),
      toggleGroceryItem: (id) =>
        set((s) => ({
          groceryList: s.groceryList.map((g) => (g.id === id ? { ...g, checked: !g.checked } : g)),
        })),
      removeGroceryItem: (id) => set((s) => ({ groceryList: s.groceryList.filter((g) => g.id !== id) })),
      generateGroceryForDate: (date) => {
        const dayPlan = get().weeklyPlan.find((d) => d.date === date)
        if (!dayPlan) return
        const existing = new Set(get().groceryList.map((g) => g.name.toLowerCase()))
        const newItems: GroceryItem[] = []
        ;[dayPlan.breakfast, dayPlan.lunch, dayPlan.dinner].forEach((meal) => {
          meal?.ingredients.forEach((ing) => {
            if (!existing.has(ing.toLowerCase())) {
              existing.add(ing.toLowerCase())
              newItems.push({ id: generateId(), name: ing, checked: false, forDate: date })
            }
          })
        })
        if (newItems.length > 0) {
          set((s) => ({ groceryList: [...s.groceryList, ...newItems] }))
        }
      },

      generateWeeklyGrocery: () => {
        const plans = get().weeklyPlan
        const existing = new Set(get().groceryList.map((g) => g.name.toLowerCase()))
        const newItems: GroceryItem[] = []
        plans.forEach((day) => {
          ;[day.breakfast, day.lunch, day.dinner].forEach((meal) => {
            meal?.ingredients.forEach((ing) => {
              if (!existing.has(ing.toLowerCase())) {
                existing.add(ing.toLowerCase())
                newItems.push({ id: generateId(), name: ing, checked: false, forDate: day.date })
              }
            })
          })
        })
        if (newItems.length > 0) {
          set((s) => ({ groceryList: [...s.groceryList, ...newItems] }))
        }
      },

      addFriend: (friend) => set((s) => ({ friends: [...s.friends, friend] })),
      removeFriend: (id) => set((s) => ({ friends: s.friends.filter((f) => f.id !== id) })),
    }),
    { name: 'smruticode-store' }
  )
)
