// Auto-generate the full version with: npx supabase gen types typescript --project-id YOUR_PROJECT_ID
// This is a hand-written version matching our schema.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string | null
          email: string | null
          profile_image: string | null
          dietary_preferences: string[]
          avoidances: string[]
          meal_count: number
          has_cook: boolean
          cook_name: string | null
          cook_phone: string | null
          preferred_grocery_app: string | null
          preferred_grocery_apps: string[]
          onboarding_complete: boolean
          dark_mode: boolean
          cook_message_language: string
          share_recipes_with_group: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      groups: {
        Row: {
          id: string
          name: string
          invite_code: string
          created_by: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['groups']['Row'], 'id' | 'invite_code' | 'created_at'>
        Update: Partial<Pick<Database['public']['Tables']['groups']['Row'], 'name'>>
      }
      group_members: {
        Row: {
          id: string
          group_id: string
          user_id: string
          role: 'owner' | 'member'
          joined_at: string
        }
        Insert: Omit<Database['public']['Tables']['group_members']['Row'], 'id' | 'joined_at'>
        Update: Partial<Pick<Database['public']['Tables']['group_members']['Row'], 'role'>>
      }
      recipes: {
        Row: {
          id: string
          user_id: string
          name: string
          link: string | null
          ingredients: string[]
          category: string | null
          tags: string[]
          note: string | null
          image: string | null
          meal_type: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['recipes']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['recipes']['Insert']>
      }
      shared_recipes: {
        Row: {
          id: string
          group_id: string
          shared_by_id: string
          shared_by: string | null
          name: string
          link: string | null
          source_type: string | null
          ingredients: string[]
          tags: string[]
          note: string | null
          image: string | null
          meal_type: string | null
          cook_approved: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['shared_recipes']['Row'], 'created_at'> & { id?: string }
        Update: Partial<Pick<Database['public']['Tables']['shared_recipes']['Row'], 'cook_approved' | 'note'>>
      }
      meal_plans: {
        Row: {
          id: string
          user_id: string
          date: string
          slot: 'breakfast' | 'lunch' | 'dinner'
          meal_name: string
          meal_data: Json
          is_done: boolean
          is_skipped: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['meal_plans']['Row'], 'id' | 'created_at'>
        Update: Partial<Pick<Database['public']['Tables']['meal_plans']['Row'], 'is_done' | 'is_skipped' | 'meal_name' | 'meal_data'>>
      }
      grocery_items: {
        Row: {
          id: string
          user_id: string
          name: string
          unit: string | null
          checked: boolean
          for_dates: string[]
          source: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['grocery_items']['Row'], 'id' | 'created_at'>
        Update: Partial<Pick<Database['public']['Tables']['grocery_items']['Row'], 'checked' | 'name' | 'unit'>>
      }
      friends: {
        Row: {
          id: string
          user_id: string
          name: string
          phone: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['friends']['Row'], 'id' | 'created_at'>
        Update: Partial<Pick<Database['public']['Tables']['friends']['Row'], 'name' | 'phone'>>
      }
    }
  }
}
