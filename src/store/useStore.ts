import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'
import * as api from '../lib/api'

export interface Meal {
  id: string
  name: string
  type: 'breakfast' | 'lunch' | 'dinner'
  ingredients: string[]
  calories?: number
  image: string
  cookTime?: string
  tags?: string[]
  videoLink?: string
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
  groupId?: string
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
  unit?: string
  checked: boolean
  forDates?: string[]
  source?: 'auto' | 'manual'
}

export interface Friend {
  id: string
  name: string
  phone: string
}

export interface GroupMember {
  id: string
  groupId: string
  name: string
  role: 'owner' | 'member'
}

export interface Group {
  id: string
  name: string
  inviteCode: string
  role: 'owner' | 'member'
}

export interface UserPreferences {
  userId: string
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
  cookMessageLanguage: 'english' | 'hindi' | 'hinglish'
  groupEnabled: boolean
  groupId: string
  groupName: string
  groupInviteCode: string
  shareRecipesWithGroup: boolean
}

interface AppState {
  preferences: UserPreferences
  weeklyPlan: DayPlan[]
  recipes: Recipe[]
  sharedRecipes: SharedRecipe[]
  groceryList: GroceryItem[]
  friends: Friend[]
  groups: Group[]
  groupMembers: GroupMember[]

  loadUserData: (userId: string) => Promise<void>

  setPreferences: (prefs: Partial<UserPreferences>) => void
  createGroup: (groupName: string, cookName?: string) => void
  setActiveGroup: (groupId: string) => void
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
  syncGroceryWithPlans: () => void
  generateGroceryForDate: (date: string) => void
  generateWeeklyGrocery: () => void

  addFriend: (friend: Friend) => void
  removeFriend: (id: string) => void
}

export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const MEAL_IMAGES: Record<string, string> = {
  poha: 'https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=800&q=80',
  'idli sambar': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&q=80',
  'paratha with curd': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80',
  'scrambled egg': 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=800&q=80',
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
  'dal tadka roti': '',
  'chicken biryani': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80',
  'aloo gobi roti': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80',
  'moong dal cheela': 'https://images.unsplash.com/photo-1668236543090-82eb5eaf04b7?w=800&q=80',
}

export const DEFAULT_MEALS: Record<string, Meal[]> = {
  breakfast: [
    { id: 'b1', name: 'Poha', type: 'breakfast', ingredients: ['Flattened rice', 'Onion', 'Peanuts', 'Turmeric', 'Curry leaves'], calories: 250, image: MEAL_IMAGES['poha'], cookTime: '15 min', tags: ['Light', 'Quick'] },
    { id: 'b2', name: 'Idli Sambar', type: 'breakfast', ingredients: ['Idli batter', 'Toor dal', 'Mixed vegetables', 'Sambar powder'], calories: 200, image: MEAL_IMAGES['idli sambar'], cookTime: '20 min', tags: ['South Indian', 'Healthy'] },
    { id: 'b3', name: 'Paratha with Curd', type: 'breakfast', ingredients: ['Wheat flour', 'Potato', 'Curd', 'Butter', 'Pickle'], calories: 350, image: MEAL_IMAGES['paratha with curd'], cookTime: '25 min', tags: ['North Indian', 'Filling'], videoLink: 'https://youtu.be/example-paratha' },
    { id: 'b4', name: 'Scrambled Egg', type: 'breakfast', ingredients: ['Eggs', 'Butter', 'Onion', 'Green chili', 'Black pepper'], calories: 240, image: MEAL_IMAGES['scrambled egg'], cookTime: '10 min', tags: ['High Protein', 'Quick'] },
    { id: 'b5', name: 'Dosa with Chutney', type: 'breakfast', ingredients: ['Dosa batter', 'Coconut', 'Green chili', 'Oil'], calories: 180, image: MEAL_IMAGES['dosa with chutney'], cookTime: '20 min', tags: ['South Indian', 'Crispy'] },
    { id: 'b6', name: 'Bread Omelette', type: 'breakfast', ingredients: ['Eggs', 'Bread', 'Onion', 'Tomato', 'Green chili'], calories: 300, image: MEAL_IMAGES['bread omelette'], cookTime: '10 min', tags: ['High Protein', 'Quick'] },
    { id: 'b7', name: 'Sprouts Chaat', type: 'breakfast', ingredients: ['Moong sprouts', 'Onion', 'Tomato', 'Lemon', 'Chaat masala'], calories: 150, image: MEAL_IMAGES['sprouts chaat'], cookTime: '10 min', tags: ['Healthy', 'No Cook'] },
  ],
  lunch: [
    { id: 'l1', name: 'Dal Rice', type: 'lunch', ingredients: ['Toor dal', 'Rice', 'Ghee', 'Cumin', 'Tomato'], calories: 400, image: MEAL_IMAGES['dal rice'], cookTime: '30 min', tags: ['Comfort Food', 'Everyday'] },
    { id: 'l2', name: 'Rajma Chawal', type: 'lunch', ingredients: ['Kidney beans', 'Rice', 'Onion', 'Tomato', 'Rajma masala'], calories: 450, image: MEAL_IMAGES['rajma chawal'], cookTime: '45 min', tags: ['North Indian', 'Protein'] },
    { id: 'l3', name: 'Chole Roti', type: 'lunch', ingredients: ['Chickpeas', 'Wheat flour', 'Onion', 'Ginger garlic paste', 'Chole masala'], calories: 420, image: '', cookTime: '40 min', tags: ['Punjabi', 'Filling'], videoLink: 'https://youtu.be/example-chole' },
    { id: 'l4', name: 'Chicken Curry Rice', type: 'lunch', ingredients: ['Chicken', 'Rice', 'Onion', 'Tomato', 'Garam masala', 'Curd'], calories: 550, image: MEAL_IMAGES['chicken curry rice'], cookTime: '45 min', tags: ['Non-Veg', 'High Protein'] },
    { id: 'l5', name: 'Paneer Butter Masala Roti', type: 'lunch', ingredients: ['Paneer', 'Wheat flour', 'Butter', 'Cream', 'Tomato puree'], calories: 500, image: MEAL_IMAGES['paneer butter masala roti'], cookTime: '35 min', tags: ['Rich', 'Vegetarian'] },
    { id: 'l6', name: 'Sambar Rice', type: 'lunch', ingredients: ['Toor dal', 'Rice', 'Mixed vegetables', 'Sambar powder', 'Tamarind'], calories: 380, image: MEAL_IMAGES['sambar rice'], cookTime: '35 min', tags: ['South Indian', 'Healthy'] },
    { id: 'l7', name: 'Egg Curry Rice', type: 'lunch', ingredients: ['Eggs', 'Rice', 'Onion', 'Tomato', 'Garam masala'], calories: 400, image: MEAL_IMAGES['egg curry rice'], cookTime: '30 min', tags: ['Eggetarian', 'Easy'] },
  ],
  dinner: [
    { id: 'd1', name: 'Khichdi', type: 'dinner', ingredients: ['Rice', 'Moong dal', 'Ghee', 'Cumin', 'Turmeric'], calories: 300, image: MEAL_IMAGES['khichdi'], cookTime: '25 min', tags: ['Light', 'Comfort'] },
    { id: 'd2', name: 'Roti Sabzi', type: 'dinner', ingredients: ['Wheat flour', 'Mixed vegetables', 'Oil', 'Spices'], calories: 320, image: MEAL_IMAGES['roti sabzi'], cookTime: '30 min', tags: ['Everyday', 'Light'] },
    { id: 'd3', name: 'Palak Paneer Roti', type: 'dinner', ingredients: ['Spinach', 'Paneer', 'Wheat flour', 'Cream', 'Garlic'], calories: 400, image: MEAL_IMAGES['palak paneer roti'], cookTime: '35 min', tags: ['Iron Rich', 'Vegetarian'], videoLink: 'https://youtu.be/example-palak-paneer' },
    { id: 'd4', name: 'Dal Tadka Roti', type: 'dinner', ingredients: ['Toor dal', 'Wheat flour', 'Ghee', 'Garlic', 'Cumin'], calories: 350, image: '', cookTime: '30 min', tags: ['Everyday', 'Comfort'] },
    { id: 'd5', name: 'Chicken Biryani', type: 'dinner', ingredients: ['Chicken', 'Basmati rice', 'Onion', 'Biryani masala', 'Curd', 'Saffron'], calories: 600, image: MEAL_IMAGES['chicken biryani'], cookTime: '60 min', tags: ['Special', 'Non-Veg'] },
    { id: 'd6', name: 'Aloo Gobi Roti', type: 'dinner', ingredients: ['Potato', 'Cauliflower', 'Wheat flour', 'Turmeric', 'Cumin'], calories: 350, image: MEAL_IMAGES['aloo gobi roti'], cookTime: '30 min', tags: ['Everyday', 'Simple'] },
    { id: 'd7', name: 'Moong Dal Cheela', type: 'dinner', ingredients: ['Moong dal', 'Onion', 'Green chili', 'Curd'], calories: 250, image: MEAL_IMAGES['moong dal cheela'], cookTime: '20 min', tags: ['Light', 'High Protein'] },
  ],
}

function findDefaultMeal(name: string, type?: 'breakfast' | 'lunch' | 'dinner'): Meal | undefined {
  const target = name.trim().toLowerCase()
  const pools = type ? [DEFAULT_MEALS[type]] : Object.values(DEFAULT_MEALS)
  return pools.flat().find((meal) => meal.name.trim().toLowerCase() === target)
}

function normalizeMeal(meal: Meal | null, fallbackType?: 'breakfast' | 'lunch' | 'dinner'): Meal | null {
  if (!meal) return null
  const resolvedType = fallbackType || meal.type
  const isLegacyUpma = meal.id === 'b4' || meal.name.trim().toLowerCase() === 'upma'
  const defaultMeal = isLegacyUpma
    ? DEFAULT_MEALS.breakfast.find((item) => item.id === 'b4')
    : findDefaultMeal(meal.name, resolvedType)
  return {
    ...defaultMeal,
    ...meal,
    name: defaultMeal?.name || meal.name,
    type: resolvedType,
    image: isLegacyUpma
      ? defaultMeal?.image || ''
      : meal.image || defaultMeal?.image || MEAL_IMAGES[meal.name.trim().toLowerCase()] || '',
    ingredients: isLegacyUpma ? defaultMeal?.ingredients || meal.ingredients : meal.ingredients,
    cookTime: isLegacyUpma ? defaultMeal?.cookTime : meal.cookTime || defaultMeal?.cookTime,
    calories: isLegacyUpma ? defaultMeal?.calories : meal.calories ?? defaultMeal?.calories,
    tags: isLegacyUpma ? defaultMeal?.tags : meal.tags?.length ? meal.tags : defaultMeal?.tags,
    videoLink: meal.videoLink || defaultMeal?.videoLink,
  }
}

function recipeToMeal(recipe: Recipe, type: 'breakfast' | 'lunch' | 'dinner'): Meal {
  return {
    id: `recipe:${recipe.id}`,
    name: recipe.name,
    type,
    ingredients: recipe.ingredients,
    image: recipe.image || '',
    videoLink: recipe.link,
    tags: recipe.tags,
  }
}

export function getMealPool(recipes: Recipe[], type: 'breakfast' | 'lunch' | 'dinner'): Meal[] {
  const personalMeals = recipes
    .filter((recipe) => recipe.mealType === type)
    .map((recipe) => recipeToMeal(recipe, type))
  return [...DEFAULT_MEALS[type], ...personalMeals]
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
  userId: 'user_owner',
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
  cookMessageLanguage: 'hinglish',
  groupEnabled: false,
  groupId: '',
  groupName: '',
  groupInviteCode: '',
  shareRecipesWithGroup: true,
}

// ── Supabase helpers ──────────────────────────────────────────────────────────

function isRealUser(userId: string): boolean {
  return !!userId && userId !== 'user_owner' && userId.length > 10
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dbToRecipe(row: any): Recipe {
  return {
    id: row.id,
    name: row.name,
    link: row.link ?? undefined,
    ingredients: row.ingredients ?? [],
    category: (row.category as 'main' | 'additional') ?? 'main',
    tags: row.tags ?? [],
    note: row.note ?? undefined,
    image: row.image ?? undefined,
    mealType: (row.meal_type as Recipe['mealType']) ?? undefined,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dbToPreferences(row: any, userId: string): Partial<UserPreferences> {
  return {
    userId,
    name: row.name ?? '',
    email: row.email ?? '',
    profileImage: row.profile_image ?? '',
    dietaryPreferences: row.dietary_preferences ?? [],
    avoidances: row.avoidances ?? [],
    mealCount: row.meal_count ?? 3,
    hasCook: row.has_cook ?? false,
    cookName: row.cook_name ?? '',
    cookPhone: row.cook_phone ?? '',
    preferredGroceryApp: (row.preferred_grocery_app ?? '') as UserPreferences['preferredGroceryApp'],
    preferredGroceryApps: row.preferred_grocery_apps ?? [],
    onboardingComplete: row.onboarding_complete ?? false,
    darkMode: row.dark_mode ?? false,
    cookMessageLanguage: (row.cook_message_language ?? 'hinglish') as UserPreferences['cookMessageLanguage'],
    shareRecipesWithGroup: row.share_recipes_with_group ?? true,
  }
}

function preferencesToDb(prefs: UserPreferences) {
  return {
    id: prefs.userId,
    name: prefs.name,
    email: prefs.email,
    profile_image: prefs.profileImage,
    dietary_preferences: prefs.dietaryPreferences,
    avoidances: prefs.avoidances,
    meal_count: prefs.mealCount,
    has_cook: prefs.hasCook,
    cook_name: prefs.cookName,
    cook_phone: prefs.cookPhone,
    preferred_grocery_app: prefs.preferredGroceryApp || null,
    preferred_grocery_apps: prefs.preferredGroceryApps,
    onboarding_complete: prefs.onboardingComplete,
    dark_mode: prefs.darkMode,
    cook_message_language: prefs.cookMessageLanguage,
    share_recipes_with_group: prefs.shareRecipesWithGroup,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dbRowsToDayPlans(rows: any[]): DayPlan[] {
  const byDate = new Map<string, DayPlan>()
  for (const row of rows) {
    // Postgres date type returns as string 'YYYY-MM-DD'
    const dateStr: string = typeof row.date === 'string' ? row.date : String(row.date)
    if (!byDate.has(dateStr)) {
      byDate.set(dateStr, { date: dateStr, breakfast: null, lunch: null, dinner: null, done: {}, skipped: {} })
    }
    const plan = byDate.get(dateStr)!
    const slot = row.slot as 'breakfast' | 'lunch' | 'dinner'
    plan[slot] = row.meal_data as Meal
    plan.done![slot] = row.is_done
    plan.skipped![slot] = row.is_skipped
  }
  return Array.from(byDate.values())
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dbToGroceryItem(row: any): GroceryItem {
  return {
    id: row.id,
    name: row.name,
    unit: row.unit ?? undefined,
    checked: row.checked,
    forDates: row.for_dates ?? [],
    source: (row.source as GroceryItem['source']) ?? 'manual',
  }
}

function groceryToDb(item: GroceryItem, userId: string) {
  return {
    id: item.id,
    user_id: userId,
    name: item.name,
    unit: item.unit ?? null,
    checked: item.checked,
    for_dates: item.forDates ?? [],
    source: item.source ?? 'manual',
  }
}

function upsertMealSlot(
  userId: string,
  date: string,
  slot: 'breakfast' | 'lunch' | 'dinner',
  meal: Meal,
  isDone: boolean,
  isSkipped: boolean
) {
  api.upsertMealPlan({
    user_id: userId,
    date,
    slot,
    meal_name: meal.name,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    meal_data: meal as any,
    is_done: isDone,
    is_skipped: isSkipped,
  }).then(null, console.error)
}

// ─────────────────────────────────────────────────────────────────────────────

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      preferences: { ...DEFAULT_PREFERENCES },
      weeklyPlan: [],
      recipes: [],
      sharedRecipes: [],
      groceryList: [],
      friends: [],
      groups: [],
      groupMembers: [],

      // ── Load all user data from Supabase ─────────────────────────────────
      loadUserData: async (userId: string) => {
        if (!isRealUser(userId)) return

        try {
          // 1. Profile
          const { data: profile, error: profileErr } = await api.getProfile(userId)
          if (profile) {
            set((s) => ({
              preferences: { ...s.preferences, ...dbToPreferences(profile, userId) },
            }))
          } else if (profileErr?.code === 'PGRST116') {
            // Row not found — create one from current prefs
            const prefs = { ...get().preferences, userId }
            await api.upsertProfile(preferencesToDb(prefs)).then(null, console.error)
            set((s) => ({ preferences: { ...s.preferences, userId } }))
          }

          // 2. Recipes
          const { data: recipes } = await api.getRecipes(userId)
          if (recipes) {
            set({ recipes: recipes.map(dbToRecipe) })
          }

          // 3. Meal plans (current week)
          const dates = getWeekDates()
          const { data: plans } = await api.getMealPlans(userId, dates[0], dates[6])
          if (plans && plans.length > 0) {
            const dbPlans = dbRowsToDayPlans(plans)
            const dbDates = new Set(dbPlans.map((d) => d.date))
            const localOnly = get().weeklyPlan.filter((d) => !dbDates.has(d.date))
            set({
              weeklyPlan: [...dbPlans, ...localOnly].sort((a, b) => a.date.localeCompare(b.date)),
            })
          }

          // 4. Grocery items
          const { data: groceries } = await api.getGroceryItems(userId)
          if (groceries) {
            set({ groceryList: groceries.map(dbToGroceryItem) })
          }

          // 5. Friends
          const { data: friends } = await api.getFriends(userId)
          if (friends) {
            set({
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              friends: friends.map((f: any) => ({ id: f.id, name: f.name, phone: f.phone ?? '' })),
            })
          }

          // 6. Groups & members
          const { data: groupData } = await api.getMyGroups(userId)
          if (groupData && groupData.length > 0) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const groups: Group[] = groupData.map((gm: any) => ({
              id: gm.groups.id,
              name: gm.groups.name,
              inviteCode: gm.groups.invite_code,
              role: gm.role as 'owner' | 'member',
            }))
            set({ groups })

            const firstGroup = groups[0]
            set((s) => ({
              preferences: {
                ...s.preferences,
                groupEnabled: true,
                groupId: firstGroup.id,
                groupName: firstGroup.name,
                groupInviteCode: firstGroup.inviteCode,
              },
            }))

            const { data: members } = await api.getGroupMembers(firstGroup.id)
            if (members) {
              const groupMembers: GroupMember[] = members.map((m: any) => ({
                id: m.id,
                groupId: firstGroup.id,
                name: m.profiles?.name ?? 'Member',
                role: m.role as 'owner' | 'member',
              }))
              set({ groupMembers })

              // 7. Shared recipes
              const { data: shared } = await api.getSharedRecipes(firstGroup.id)
              if (shared) {
                const sharedRecipes: SharedRecipe[] = shared.map((r: any) => ({
                  id: r.id,
                  groupId: r.group_id,
                  name: r.name,
                  sharedBy: r.shared_by ?? '',
                  link: r.link ?? undefined,
                  sourceType: (r.source_type as SharedRecipe['sourceType']) ?? 'manual',
                  ingredients: r.ingredients ?? [],
                  tags: r.tags ?? [],
                  note: r.note ?? undefined,
                  timestamp: new Date(r.created_at).getTime(),
                  image: r.image ?? undefined,
                  cookApproved: r.cook_approved ?? false,
                  mealType: (r.meal_type as SharedRecipe['mealType']) ?? undefined,
                }))
                set({ sharedRecipes })
              }
            }
          }
        } catch (err) {
          console.error('[loadUserData]', err)
        }
      },

      // ── Preferences ──────────────────────────────────────────────────────
      setPreferences: (prefs) => {
        set((s) => ({ preferences: { ...s.preferences, ...prefs } }))
        const updated = get().preferences
        if (isRealUser(updated.userId)) {
          api.upsertProfile(preferencesToDb(updated)).then(null, console.error)
        }
      },

      createGroup: (groupName, cookName) => {
        set((s) => {
          const groupId = s.groups.find((g) => g.name === groupName.trim())?.id || `grp_${generateId()}`
          const inviteCode = `SMRUTI-${groupId.slice(-6).toUpperCase()}`
          const ownerName = s.preferences.name || 'You'
          const existingGroups = s.groups.filter((g) => g.id !== groupId)
          return {
            preferences: {
              ...s.preferences,
              groupEnabled: true,
              groupId,
              groupName: groupName.trim() || 'Flat 503 Kitchen',
              cookName: cookName?.trim() || s.preferences.cookName,
              groupInviteCode: inviteCode,
              shareRecipesWithGroup: true,
            },
            groups: [
              ...existingGroups,
              { id: groupId, name: groupName.trim() || 'Flat 503 Kitchen', inviteCode, role: 'owner' },
            ],
            groupMembers: [
              { id: s.preferences.userId, groupId, name: ownerName, role: 'owner' },
              ...s.groupMembers.filter((m) => !(m.id === s.preferences.userId && m.groupId === groupId)),
            ],
          }
        })
        const { userId } = get().preferences
        if (isRealUser(userId)) {
          api.createGroup(userId, groupName.trim() || 'Flat 503 Kitchen')
            .then(({ data, error }) => {
              if (data && !error) {
                set((s) => ({
                  preferences: {
                    ...s.preferences,
                    groupId: data.id,
                    groupInviteCode: data.invite_code,
                  },
                  groups: s.groups.map((g) =>
                    g.name === (groupName.trim() || 'Flat 503 Kitchen')
                      ? { ...g, id: data.id, inviteCode: data.invite_code }
                      : g
                  ),
                }))
              }
            })
            .then(null, console.error)
        }
      },

      setActiveGroup: (groupId) =>
        set((s) => {
          const group = s.groups.find((g) => g.id === groupId)
          if (!group) return {}
          return {
            preferences: {
              ...s.preferences,
              groupEnabled: true,
              groupId: group.id,
              groupName: group.name,
              groupInviteCode: group.inviteCode,
            },
          }
        }),

      completeOnboarding: () => {
        set((s) => ({ preferences: { ...s.preferences, onboardingComplete: true } }))
        const prefs = get().preferences
        if (isRealUser(prefs.userId)) {
          api.upsertProfile(preferencesToDb(prefs)).then(null, console.error)
        }
      },

      signOut: () => {
        supabase.auth.signOut().then(null, console.error)
        set({
          preferences: { ...DEFAULT_PREFERENCES },
          weeklyPlan: [],
          recipes: [],
          sharedRecipes: [],
          groceryList: [],
          friends: [],
          groups: [],
          groupMembers: [],
        })
      },

      // ── Weekly plan ──────────────────────────────────────────────────────
      initWeeklyPlan: () => {
        const dates = getWeekDates()
        const existing = get().weeklyPlan
        const existingDates = new Set(existing.map((d) => d.date))
        const normalizedExisting = existing
          .filter((d) => dates.includes(d.date))
          .map((d) => ({
            ...d,
            breakfast: normalizeMeal(d.breakfast, 'breakfast'),
            lunch: normalizeMeal(d.lunch, 'lunch'),
            dinner: normalizeMeal(d.dinner, 'dinner'),
          }))
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
            weeklyPlan: [...normalizedExisting, ...newPlans].sort((a, b) =>
              a.date.localeCompare(b.date)
            ),
          })
          // Sync new days to Supabase
          const { userId } = get().preferences
          if (isRealUser(userId)) {
            newPlans.forEach((day) => {
              const slots: ('breakfast' | 'lunch' | 'dinner')[] = ['breakfast', 'lunch', 'dinner']
              slots.forEach((slot) => {
                const meal = day[slot]
                if (meal) upsertMealSlot(userId, day.date, slot, meal, false, false)
              })
            })
          }
        } else if (
          normalizedExisting.length !== existing.length ||
          normalizedExisting.some((day, index) => day !== existing[index])
        ) {
          set({ weeklyPlan: normalizedExisting.sort((a, b) => a.date.localeCompare(b.date)) })
        }
      },

      setDayPlan: (date, meal) => {
        set((s) => ({
          weeklyPlan: s.weeklyPlan.map((d) =>
            d.date === date
              ? {
                  ...d,
                  ...meal,
                  breakfast: normalizeMeal((meal.breakfast ?? d.breakfast) as Meal | null, 'breakfast'),
                  lunch: normalizeMeal((meal.lunch ?? d.lunch) as Meal | null, 'lunch'),
                  dinner: normalizeMeal((meal.dinner ?? d.dinner) as Meal | null, 'dinner'),
                }
              : d
          ),
        }))
        const { userId } = get().preferences
        if (isRealUser(userId)) {
          const updatedDay = get().weeklyPlan.find((d) => d.date === date)
          if (!updatedDay) return
          const slots: ('breakfast' | 'lunch' | 'dinner')[] = ['breakfast', 'lunch', 'dinner']
          slots.forEach((slot) => {
            const mealData = updatedDay[slot]
            if (mealData) {
              upsertMealSlot(
                userId, date, slot, mealData,
                updatedDay.done?.[slot] ?? false,
                updatedDay.skipped?.[slot] ?? false
              )
            }
          })
        }
      },

      rotateMeal: (date, type) => {
        set((s) => {
          const meals = getMealPool(s.recipes, type)
          const dayPlan = s.weeklyPlan.find((d) => d.date === date)
          const current = dayPlan?.[type]
          const others = meals.filter((m) => m.id !== current?.id)
          const newMeal = others[Math.floor(Math.random() * others.length)]
          return {
            weeklyPlan: s.weeklyPlan.map((d) =>
              d.date === date ? { ...d, [type]: newMeal } : d
            ),
          }
        })
        const { userId } = get().preferences
        if (isRealUser(userId)) {
          const day = get().weeklyPlan.find((d) => d.date === date)
          const meal = day?.[type]
          if (meal) upsertMealSlot(userId, date, type, meal, day?.done?.[type] ?? false, day?.skipped?.[type] ?? false)
        }
      },

      skipMeal: (date, type) => {
        set((s) => ({
          weeklyPlan: s.weeklyPlan.map((d) =>
            d.date === date ? { ...d, skipped: { ...d.skipped, [type]: true } } : d
          ),
        }))
        const { userId } = get().preferences
        if (isRealUser(userId)) {
          const day = get().weeklyPlan.find((d) => d.date === date)
          const meal = day?.[type]
          if (meal) upsertMealSlot(userId, date, type, meal, day?.done?.[type] ?? false, true)
        }
      },

      markDone: (date, type) => {
        set((s) => ({
          weeklyPlan: s.weeklyPlan.map((d) =>
            d.date === date ? { ...d, done: { ...d.done, [type]: true } } : d
          ),
        }))
        const { userId } = get().preferences
        if (isRealUser(userId)) {
          const day = get().weeklyPlan.find((d) => d.date === date)
          const meal = day?.[type]
          if (meal) upsertMealSlot(userId, date, type, meal, true, day?.skipped?.[type] ?? false)
        }
      },

      // ── Recipes ──────────────────────────────────────────────────────────
      addRecipe: (recipe) => {
        set((s) => ({ recipes: [...s.recipes, recipe] }))
        const { userId } = get().preferences
        if (isRealUser(userId)) {
          api.upsertRecipe({
            id: recipe.id,
            user_id: userId,
            name: recipe.name,
            link: recipe.link ?? null,
            ingredients: recipe.ingredients,
            category: recipe.category,
            tags: recipe.tags ?? [],
            note: recipe.note ?? null,
            image: recipe.image ?? null,
            meal_type: recipe.mealType ?? null,
          }).then(null, console.error)
        }
      },

      updateRecipe: (id, data) => {
        set((s) => ({ recipes: s.recipes.map((r) => (r.id === id ? { ...r, ...data } : r)) }))
        const { userId } = get().preferences
        if (isRealUser(userId)) {
          const updated = get().recipes.find((r) => r.id === id)
          if (updated) {
            api.upsertRecipe({
              id: updated.id,
              user_id: userId,
              name: updated.name,
              link: updated.link ?? null,
              ingredients: updated.ingredients,
              category: updated.category,
              tags: updated.tags ?? [],
              note: updated.note ?? null,
              image: updated.image ?? null,
              meal_type: updated.mealType ?? null,
            }).then(null, console.error)
          }
        }
      },

      deleteRecipe: (id) => {
        set((s) => ({ recipes: s.recipes.filter((r) => r.id !== id) }))
        const { userId } = get().preferences
        if (isRealUser(userId)) {
          api.deleteRecipe(id).then(null, console.error)
        }
      },

      // ── Shared recipes ───────────────────────────────────────────────────
      addSharedRecipe: (recipe) => {
        set((s) => ({ sharedRecipes: [recipe, ...s.sharedRecipes] }))
        const { userId, groupId } = get().preferences
        const targetGroupId = recipe.groupId || groupId
        if (isRealUser(userId) && targetGroupId) {
          api.shareRecipe({
            id: recipe.id,
            group_id: targetGroupId,
            shared_by_id: userId,
            shared_by: recipe.sharedBy,
            name: recipe.name,
            link: recipe.link ?? null,
            source_type: recipe.sourceType,
            ingredients: recipe.ingredients,
            tags: recipe.tags,
            note: recipe.note ?? null,
            image: recipe.image ?? null,
            meal_type: recipe.mealType ?? null,
            cook_approved: recipe.cookApproved ?? false,
          }).then(({ data, error }) => {
            if (data && !error && data.id !== recipe.id) {
              set((s) => ({
                sharedRecipes: s.sharedRecipes.map((r) =>
                  r.id === recipe.id ? { ...r, id: data.id } : r
                ),
              }))
            }
          }).then(null, console.error)
        }
      },

      removeSharedRecipe: (id) => {
        set((s) => ({ sharedRecipes: s.sharedRecipes.filter((r) => r.id !== id) }))
        const { userId } = get().preferences
        if (isRealUser(userId)) {
          api.deleteSharedRecipe(id).then(null, console.error)
        }
      },

      // ── Grocery ──────────────────────────────────────────────────────────
      addGroceryItem: (item) => {
        set((s) => ({ groceryList: [...s.groceryList, item] }))
        const { userId } = get().preferences
        if (isRealUser(userId)) {
          api.upsertGroceryItem(groceryToDb(item, userId)).then(null, console.error)
        }
      },

      toggleGroceryItem: (id) => {
        set((s) => ({
          groceryList: s.groceryList.map((g) => (g.id === id ? { ...g, checked: !g.checked } : g)),
        }))
        const { userId } = get().preferences
        if (isRealUser(userId)) {
          const item = get().groceryList.find((g) => g.id === id)
          if (item) api.upsertGroceryItem(groceryToDb(item, userId)).then(null, console.error)
        }
      },

      removeGroceryItem: (id) => {
        set((s) => ({ groceryList: s.groceryList.filter((g) => g.id !== id) }))
        const { userId } = get().preferences
        if (isRealUser(userId)) {
          api.deleteGroceryItem(id).then(null, console.error)
        }
      },

      syncGroceryWithPlans: () => {
        const plans = get().weeklyPlan
        const currentItems = get().groceryList
        const manualItems = currentItems.filter((item) => item.source === 'manual' || item.source == null)
        const previousAutoByName = new Map(
          currentItems
            .filter((item) => item.source === 'auto')
            .map((item) => [item.name.toLowerCase(), item])
        )
        const autoMap = new Map<string, GroceryItem>()
        plans.forEach((day) => {
          ;[day.breakfast, day.lunch, day.dinner].forEach((meal) => {
            meal?.ingredients.forEach((ingredient) => {
              const key = ingredient.trim().toLowerCase()
              const existing = autoMap.get(key)
              if (existing) {
                if (!existing.forDates?.includes(day.date)) existing.forDates = [...(existing.forDates || []), day.date]
                return
              }
              const previous = previousAutoByName.get(key)
              autoMap.set(key, {
                id: `auto:${key.replace(/[^a-z0-9]+/g, '-')}`,
                name: ingredient,
                checked: previous?.checked ?? false,
                forDates: [day.date],
                source: 'auto',
              })
            })
          })
        })
        const newList = [...manualItems, ...Array.from(autoMap.values())]
        set({ groceryList: newList })
        // Sync all auto items to Supabase
        const { userId } = get().preferences
        if (isRealUser(userId)) {
          newList.forEach((item) => {
            api.upsertGroceryItem(groceryToDb(item, userId)).then(null, console.error)
          })
        }
      },

      generateGroceryForDate: (date) => {
        const dayPlan = get().weeklyPlan.find((d) => d.date === date)
        if (!dayPlan) return
        const existing = new Set(get().groceryList.map((g) => g.name.toLowerCase()))
        const newItems: GroceryItem[] = []
        ;[dayPlan.breakfast, dayPlan.lunch, dayPlan.dinner].forEach((meal) => {
          meal?.ingredients.forEach((ing) => {
            if (!existing.has(ing.toLowerCase())) {
              existing.add(ing.toLowerCase())
              newItems.push({ id: generateId(), name: ing, checked: false, forDates: [date], source: 'auto' })
            }
          })
        })
        if (newItems.length > 0) {
          set((s) => ({ groceryList: [...s.groceryList, ...newItems] }))
          const { userId } = get().preferences
          if (isRealUser(userId)) {
            newItems.forEach((item) => {
              api.upsertGroceryItem(groceryToDb(item, userId)).then(null, console.error)
            })
          }
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
                newItems.push({ id: generateId(), name: ing, checked: false, forDates: [day.date], source: 'auto' })
              }
            })
          })
        })
        if (newItems.length > 0) {
          set((s) => ({ groceryList: [...s.groceryList, ...newItems] }))
          const { userId } = get().preferences
          if (isRealUser(userId)) {
            newItems.forEach((item) => {
              api.upsertGroceryItem(groceryToDb(item, userId)).then(null, console.error)
            })
          }
        }
      },

      // ── Friends ──────────────────────────────────────────────────────────
      addFriend: (friend) => {
        set((s) => ({ friends: [...s.friends, friend] }))
        const { userId } = get().preferences
        if (isRealUser(userId)) {
          api.upsertFriend({ id: friend.id, user_id: userId, name: friend.name, phone: friend.phone || null }).then(null, console.error)
        }
      },

      removeFriend: (id) => {
        set((s) => ({ friends: s.friends.filter((f) => f.id !== id) }))
        const { userId } = get().preferences
        if (isRealUser(userId)) {
          api.deleteFriend(id).then(null, console.error)
        }
      },
    }),
    { name: 'smruticode-store' }
  )
)
