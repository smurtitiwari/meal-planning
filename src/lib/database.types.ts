// Auto-generate the full version with: npx supabase gen types typescript --project-id YOUR_PROJECT_ID
// Hand-written version — updated to match Supabase JS v2.100+ type schema format.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
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
        Insert: {
          id: string
          name?: string | null
          email?: string | null
          profile_image?: string | null
          dietary_preferences?: string[]
          avoidances?: string[]
          meal_count?: number
          has_cook?: boolean
          cook_name?: string | null
          cook_phone?: string | null
          preferred_grocery_app?: string | null
          preferred_grocery_apps?: string[]
          onboarding_complete?: boolean
          dark_mode?: boolean
          cook_message_language?: string
          share_recipes_with_group?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          email?: string | null
          profile_image?: string | null
          dietary_preferences?: string[]
          avoidances?: string[]
          meal_count?: number
          has_cook?: boolean
          cook_name?: string | null
          cook_phone?: string | null
          preferred_grocery_app?: string | null
          preferred_grocery_apps?: string[]
          onboarding_complete?: boolean
          dark_mode?: boolean
          cook_message_language?: string
          share_recipes_with_group?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      groups: {
        Row: {
          id: string
          name: string
          invite_code: string
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          invite_code?: string
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          invite_code?: string
          created_by?: string | null
          created_at?: string
        }
        Relationships: []
      }
      group_members: {
        Row: {
          id: string
          group_id: string
          user_id: string
          role: string
          joined_at: string
        }
        Insert: {
          id?: string
          group_id: string
          user_id: string
          role?: string
          joined_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          user_id?: string
          role?: string
          joined_at?: string
        }
        Relationships: []
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
        Insert: {
          id?: string
          user_id: string
          name: string
          link?: string | null
          ingredients?: string[]
          category?: string | null
          tags?: string[]
          note?: string | null
          image?: string | null
          meal_type?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          link?: string | null
          ingredients?: string[]
          category?: string | null
          tags?: string[]
          note?: string | null
          image?: string | null
          meal_type?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
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
        Insert: {
          id?: string
          group_id: string
          shared_by_id: string
          shared_by?: string | null
          name: string
          link?: string | null
          source_type?: string | null
          ingredients?: string[]
          tags?: string[]
          note?: string | null
          image?: string | null
          meal_type?: string | null
          cook_approved?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          shared_by_id?: string
          shared_by?: string | null
          name?: string
          link?: string | null
          source_type?: string | null
          ingredients?: string[]
          tags?: string[]
          note?: string | null
          image?: string | null
          meal_type?: string | null
          cook_approved?: boolean
          created_at?: string
        }
        Relationships: []
      }
      meal_plans: {
        Row: {
          id: string
          user_id: string
          date: string
          slot: string
          meal_name: string
          meal_data: Json
          is_done: boolean
          is_skipped: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          slot: string
          meal_name: string
          meal_data: Json
          is_done?: boolean
          is_skipped?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          slot?: string
          meal_name?: string
          meal_data?: Json
          is_done?: boolean
          is_skipped?: boolean
          created_at?: string
        }
        Relationships: []
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
        Insert: {
          id?: string
          user_id: string
          name: string
          unit?: string | null
          checked?: boolean
          for_dates?: string[]
          source?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          unit?: string | null
          checked?: boolean
          for_dates?: string[]
          source?: string | null
          created_at?: string
        }
        Relationships: []
      }
      friends: {
        Row: {
          id: string
          user_id: string
          name: string
          phone: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          phone?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          phone?: string | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}
