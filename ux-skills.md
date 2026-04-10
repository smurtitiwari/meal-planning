# UX Improvement Tracker — Meal Planning App

## Completed

### 1. Onboarding — Sign-In Screen Spacing
- **Issue:** Excessive whitespace above the "Let's sort your meals" card due to `paddingTop: 80` + `paddingTop: 40` and `marginBottom: auto` pushing the card too far down.
- **Fix:** Reduced `paddingTop` to `60`, removed inner `paddingTop: 40`, replaced `marginBottom: auto` with a fixed `24px` gap between the heading and the card.
- **File:** `src/pages/Onboarding.tsx` (Step 0)

### 2. Onboarding — Cook Details Mandatory Fields (Step 4)
- **Issue:** Cook's name and WhatsApp number fields were optional, allowing users to skip critical contact info needed for meal plan sharing.
- **Fix:**
  - Added red asterisk `*` required indicators on both field labels.
  - "Continue" button stays disabled until cook name is non-empty AND phone has 10 digits.
  - Phone input now only accepts digits, strips non-numeric chars, caps at 10 digits.
  - Live helper text shows remaining digit count while typing (e.g., "Enter 4 more digits —").
  - Input borders turn purple (`#B8A6E6`) once correctly filled for visual confirmation.
  - Helper text below name field: "Required — helps identify your cook's meals".
  - When "I cook myself" is selected, form doesn't appear and Continue is enabled immediately.
- **File:** `src/pages/Onboarding.tsx` (Step 4)

### 3. Home — Meal Card No-Image Edge Case
- **Issue:** All meal cards had images by default — no edge case tested for missing/empty image.
- **Fix:** Removed image from "Chole Roti" (lunch, `l3`) by setting `image: ''` in store data to test the no-image fallback. The `MealCard` component already handled this gracefully with a `16px` bottom spacer div when `showImage` is false.
- **Result:** Card renders cleanly with just meal label, calorie count, name, and ingredients — no broken image or awkward empty space.
- **Files:** `src/store/useStore.ts` (Chole Roti data), `src/pages/Home.tsx` (MealCard fallback already in place)

### 4. Home — Accessibility Text Color Fix
- **Issue:** Multiple text elements failed WCAG AA contrast ratios on the `#F7F3EE` background:
  - `#A09DAB` (secondary text) — ~2.8:1 ratio (fails 4.5:1 requirement)
  - `#B8A6E6` ("Nourishment" accent) — very low contrast for decorative heading
- **Fix:** Created centralized `colors` object with AA-compliant values:
  - `textSecondary`: `#A09DAB` → `#6B6779` (meets 4.5:1 for normal text)
  - `textTertiary`: `#7A768A` (labels, helper text — AA compliant)
  - `accentPurple`: `#B8A6E6` → `#7B68C4` (meets 3:1 for large text)
  - Applied consistently across meal labels, KCAL text, ingredients, date, and all secondary text
- **File:** `src/pages/Home.tsx`

### 5. Home — Logo Added
- **Issue:** No app logo/branding on the Home screen header.
- **Fix:** Added a logo bar at the top with a dark rounded icon (ChefHat from lucide-react) and "SmrutiCode" text in serif font. Positioned above the date line.
- **File:** `src/pages/Home.tsx`

### 6. Home — Smart Grocery Order Button
- **Issue:** Button said "Order ingredients on Blinkit" — hardcoded to one app regardless of user preference.
- **Fix:**
  - Renamed to **"Order Grocery"** with a ShoppingCart icon — generic, no app name shown.
  - **Single app selected:** Clicking redirects directly to that app's URL.
  - **Multiple apps selected:** Opens a bottom sheet popup ("Order from") listing only the user's selected apps (e.g., Blinkit, Zepto, Swiggy Instamart) with "Open →" action. Backdrop overlay dims the background. X button to close.
- **File:** `src/pages/Home.tsx`

### 7. Home — AI Generated Cook Message Card
- **Issue:** No way to preview/customize the meal plan message before sending to cook. Old "Send to cook" CTA was a plain button with no context.
- **Fix:** Added a full AI-generated message card below meal cards (visible when `hasCook` is true):
  - ✨ **"AI GENERATED"** badge header with "Today's plan for [cook name]"
  - **Full meal plan preview** showing all 3 meals with ingredients and cook times
  - **Custom note textarea** — user can type additional instructions (e.g., "make extra rice, use less oil")
  - **Green WhatsApp CTA** — "Send to [Cook Name] on WhatsApp" — sends AI message + custom note
- **File:** `src/pages/Home.tsx`

### 8. Home — Cook Message: Language Toggle + Cleaner Format
- **Issue:** Cook message included date, ingredients, and cook time — too verbose. No language option for cooks who prefer Hindi or Hinglish.
- **UX Decision:** Language selector placed **on the AI card itself** (not in settings) because:
  - It's contextual — user sees the live preview and can toggle instantly
  - Different cooks may need different languages — it's a per-message choice
  - A small pill toggle is clean, discoverable, and doesn't add settings clutter
- **Fix:**
  - Removed date, ingredients list, and cook time from the message
  - Added recipe video links instead (from new `videoLink` field on Meal interface)
  - Added **3-way language pill toggle**: English | Hindi | Hinglish (default: Hinglish)
  - Each language uses culturally appropriate labels:
    - English: "Breakfast / Lunch / Dinner" + "This is today's plan..."
    - Hindi: "Nashta / Dopahar ka khana / Raat ka khana" + "Yeh aaj ka plan hai..."
    - Hinglish: "Breakfast / Lunch / Dinner" + "Yeh aaj ka plan hai. Anything else needed..."
  - Pill toggle has smooth transition, active state with white bg + purple text + shadow
- **Files:** `src/pages/Home.tsx`, `src/store/useStore.ts` (added `videoLink` to Meal interface + sample data)

### 9. Home — Editable Cook Message + Better UX Copy
- **Issue:** AI-generated cook message was read-only — user had no freedom to edit the plan before sending. Separate "add a note" field felt disconnected. Badge "AI GENERATED" was too loud.
- **UX Decision:** Single editable textarea is better than preview + notes because:
  - User sees exactly what will be sent — WYSIWYG
  - Freedom to tweak meal names, add notes inline, remove items
  - Reduces cognitive load (one field vs two)
  - "Reset to AI draft" link gives safety net if edits go wrong
- **Fix:**
  - Replaced non-editable rich preview + separate notes textarea with **one editable textarea** pre-filled with AI draft
  - Badge changed: "AI GENERATED" → ✨ **"Message for [Cook Name]"** + small **"AI Draft"** purple pill
  - Textarea auto-sizes to content, is vertically resizable
  - **"↻ Reset to AI draft"** link appears only when user has manually edited
  - Switching language regenerates the draft (resets user edits)
- **File:** `src/pages/Home.tsx`

### 10. Home — Show Full Ingredients on Current Meal Card
- **Issue:** Ingredients were truncated to 4 items + "..." on ALL cards, including the current/active meal.
- **Fix:** Current meal card (`isCurrent === true`) now shows ALL ingredients without truncation. Other cards still show the truncated 4-item preview.
- **File:** `src/pages/Home.tsx` (MealCard component)

### 11. Home — Header Cleanup (Icon Only)
- **Issue:** Header had brand text "SmrutiCode" and date line — felt cluttered for a daily-use screen.
- **Fix:** Removed brand text and date. Header now shows only ChefHat icon (dark rounded pill) on the left, clean and minimal.
- **File:** `src/pages/Home.tsx`

### 12. Home — Headline Copy & Calorie Display
- **Issue:** Headline and calorie text were too large and generic.
- **Fix:**
  - Headline: "Your meal plan" + "for today" (italic purple accent) — warm, personal copy
  - Calories: Reduced from 28px to 22px, changed to sentence case "kcal planned"
- **File:** `src/pages/Home.tsx`

### 13. BottomNav — Removed Active Dot Indicator
- **Issue:** Active tab had a small purple dot below the label — redundant since bold weight + dark color already indicate active state.
- **Fix:** Removed the dot indicator div, replaced with a comment explaining rationale.
- **File:** `src/components/BottomNav.tsx`

### 14. Home → Profile — Language Preference Moved
- **Issue:** Language toggle (English/Hindi/Hinglish) was on the Home screen's cook message card — cluttered the daily view and felt per-message rather than a setting.
- **Fix:**
  - Removed language tabs from Home screen entirely
  - Added "Message language" section in Profile page (between Cook and Grocery sections)
  - Globe icon + current language display + modal picker with 3 options and preview descriptions
  - Saves to `preferences.cookMessageLanguage` in store (default: 'hinglish')
  - Home reads `cookLang` from store preference instead of local state
- **Files:** `src/pages/Home.tsx`, `src/pages/Profile.tsx`, `src/store/useStore.ts`

### 15. Home — Edit Message: Rich Preview + Save/Cancel
- **Issue:** Textarea was always visible for cook message — didn't feel like a curated AI draft. No clear affordance that it was editable.
- **Fix:**
  - Default view: Rich formatted preview (meal names as headings, blue hyperlinked video links, proper line spacing)
  - "Edit message" tertiary CTA (pencil icon) below the preview
  - Clicking Edit switches to textarea with Save + Cancel buttons
  - Save commits edits, Cancel reverts to last saved version
  - "Reset to AI draft" link available when user has made edits
- **File:** `src/pages/Home.tsx`

### 16. Home — CTA Hierarchy: Both CTAs Secondary Outlined
- **Issue:** WhatsApp CTA was primary green (#25D366) — too dominant. Order Grocery had faint border (#EAE4DC) — not legible.
- **Fix:**
  - Both CTAs now use identical secondary outlined style: `border: 1.5px solid #7B68C4`, `color: #7B68C4`, `bg: transparent`, `height: 48px`, `border-radius: 16px`
  - WhatsApp CTA: "Send on WhatsApp" with WhatsApp icon (kept as send action)
  - Order Grocery CTA: Placed BEFORE the cook message card (logical flow: review meals → order groceries → message cook)
  - Consistent visual weight — no single CTA dominates
- **File:** `src/pages/Home.tsx`

---

## Pending / To Review

### Onboarding Flow
- [ ] Review spacing/padding consistency across Steps 1–5
- [ ] Ensure CTA buttons are always visible above the fold on smaller screens
- [ ] Validate touch target sizes (min 44×44px) on all tappable elements

### Home Screen
- [x] ~~Review meal card layout — ensure food images are properly sized~~
- [x] ~~Check if bottom navigation is visible/accessible~~
- [x] ~~Validate calorie display readability~~ (fixed via accessibility colors)
- [ ] Apply accessibility color fixes to Planner, Recipes, Profile, MealDetail pages
- [ ] Add empty image guard to Planner.tsx and MealDetail.tsx (React warnings)

### General
- [ ] Consistent border-radius usage across cards and buttons
- [x] ~~Verify color contrast ratios meet WCAG AA standards~~ (Home page done)
- [ ] Extend WCAG AA colors to all other pages
- [ ] Test all screens on different mobile viewports (iPhone SE, iPhone 14 Pro, Android)
- [ ] Review font scale and line-height hierarchy
- [ ] Smooth transitions and micro-animations for navigation and state changes
