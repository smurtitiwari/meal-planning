/**
 * Smruti API layer — thin wrappers around Supabase queries.
 * Each function returns { data, error } so callers can handle errors uniformly.
 */
import { supabase } from './supabase'
import type { Database } from './database.types'

// ─── Profile ──────────────────────────────────────────────────────────────────

export const getProfile = (userId: string) =>
  supabase.from('profiles').select('*').eq('id', userId).single()

export const upsertProfile = (profile: Database['public']['Tables']['profiles']['Insert']) =>
  supabase.from('profiles').upsert(profile, { onConflict: 'id' })

// ─── Groups ───────────────────────────────────────────────────────────────────

export const getMyGroups = async (userId: string) => {
  return supabase
    .from('group_members')
    .select(`
      role,
      groups (
        id,
        name,
        invite_code,
        created_at
      )
    `)
    .eq('user_id', userId)
}

export const createGroup = async (userId: string, name: string) => {
  // 1. Insert group
  const { data: group, error: gErr } = await supabase
    .from('groups')
    .insert({ name, created_by: userId })
    .select()
    .single()
  if (gErr || !group) return { data: null, error: gErr }

  // 2. Add creator as owner
  const { error: mErr } = await supabase
    .from('group_members')
    .insert({ group_id: group.id, user_id: userId, role: 'owner' })
  if (mErr) return { data: null, error: mErr }

  return { data: group, error: null }
}

export const joinGroupByCode = async (userId: string, inviteCode: string) => {
  // Lookup group by invite code
  const { data: group, error: gErr } = await supabase
    .from('groups')
    .select('id, name')
    .eq('invite_code', inviteCode.trim().toUpperCase())
    .single()
  if (gErr || !group) return { data: null, error: gErr ?? new Error('Invalid invite code') }

  // Add as member (upsert so re-joining is safe)
  const { error: mErr } = await supabase
    .from('group_members')
    .upsert({ group_id: group.id, user_id: userId, role: 'member' }, { onConflict: 'group_id,user_id' })
  if (mErr) return { data: null, error: mErr }

  return { data: group, error: null }
}

// ─── Group Members ────────────────────────────────────────────────────────────

export const getGroupMembers = (groupId: string) =>
  supabase
    .from('group_members')
    .select(`
      id, role, joined_at,
      profiles ( id, name, profile_image )
    `)
    .eq('group_id', groupId)

// ─── Recipes ──────────────────────────────────────────────────────────────────

export const getRecipes = (userId: string) =>
  supabase.from('recipes').select('*').eq('user_id', userId).order('created_at', { ascending: false })

export const upsertRecipe = (recipe: Database['public']['Tables']['recipes']['Insert'] & { id?: string }) =>
  supabase.from('recipes').upsert(recipe, { onConflict: 'id' }).select().single()

export const deleteRecipe = (recipeId: string) =>
  supabase.from('recipes').delete().eq('id', recipeId)

// ─── Shared Recipes ───────────────────────────────────────────────────────────

export const getSharedRecipes = (groupId: string) =>
  supabase
    .from('shared_recipes')
    .select('*')
    .eq('group_id', groupId)
    .order('created_at', { ascending: false })

export const shareRecipe = (recipe: Database['public']['Tables']['shared_recipes']['Insert']) =>
  supabase.from('shared_recipes').insert(recipe).select().single()

export const deleteSharedRecipe = (recipeId: string) =>
  supabase.from('shared_recipes').delete().eq('id', recipeId)

// ─── Meal Plans ───────────────────────────────────────────────────────────────

export const getMealPlans = (userId: string, startDate: string, endDate: string) =>
  supabase
    .from('meal_plans')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)

export const upsertMealPlan = (plan: Database['public']['Tables']['meal_plans']['Insert']) =>
  supabase
    .from('meal_plans')
    .upsert(plan, { onConflict: 'user_id,date,slot' })
    .select()
    .single()

export const deleteMealPlan = (userId: string, date: string, slot: string) =>
  supabase.from('meal_plans').delete().match({ user_id: userId, date, slot })

// ─── Grocery Items ────────────────────────────────────────────────────────────

export const getGroceryItems = (userId: string) =>
  supabase.from('grocery_items').select('*').eq('user_id', userId).order('created_at')

export const upsertGroceryItem = (item: Database['public']['Tables']['grocery_items']['Insert'] & { id?: string }) =>
  supabase.from('grocery_items').upsert(item, { onConflict: 'id' }).select().single()

export const deleteGroceryItem = (itemId: string) =>
  supabase.from('grocery_items').delete().eq('id', itemId)

export const clearCheckedGroceries = (userId: string) =>
  supabase.from('grocery_items').delete().eq('user_id', userId).eq('checked', true)

// ─── Friends ─────────────────────────────────────────────────────────────────

export const getFriends = (userId: string) =>
  supabase.from('friends').select('*').eq('user_id', userId).order('name')

export const upsertFriend = (friend: Database['public']['Tables']['friends']['Insert'] & { id?: string }) =>
  supabase.from('friends').upsert(friend, { onConflict: 'id' }).select().single()

export const deleteFriend = (friendId: string) =>
  supabase.from('friends').delete().eq('id', friendId)
