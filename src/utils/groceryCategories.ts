export const GROCERY_CATEGORIES = [
  { title: 'Vegetables', emoji: '🥬', match: ['onion', 'tomato', 'potato', 'cauliflower', 'spinach', 'garlic', 'ginger', 'green chili', 'mixed vegetables', 'cucumber', 'lettuce', 'mint', 'curry leaves', 'lemon'] },
  { title: 'Dairy & Eggs', emoji: '🥛', match: ['milk', 'curd', 'paneer', 'cream', 'butter', 'cheese', 'ghee', 'egg', 'eggs'] },
  { title: 'Pulses & Grains', emoji: '🌾', match: ['dal', 'rice', 'flour', 'wheat', 'semolina', 'moong', 'kidney beans', 'chickpeas', 'flattened rice', 'batter', 'pasta', 'bread', 'basmati'] },
  { title: 'Spices & Staples', emoji: '🧂', match: ['salt', 'oil', 'masala', 'turmeric', 'cumin', 'mustard', 'saffron', 'pepper', 'powder', 'tamarind', 'water'] },
  { title: 'Protein', emoji: '🍗', match: ['chicken'] },
]

export const GROCERY_CATEGORY_EMOJI: Record<string, string> = {
  Vegetables: '🥬',
  'Dairy & Eggs': '🥛',
  'Pulses & Grains': '🌾',
  'Spices & Staples': '🧂',
  Protein: '🍗',
  Others: '🧺',
}

export function getCategoryForItem(name: string) {
  const lower = name.toLowerCase()
  return GROCERY_CATEGORIES.find((category) => category.match.some((token) => lower.includes(token)))?.title || 'Others'
}
