import { supabase } from './supabase';
import { Transaction, Land, Season, Profile, IrrigationLog, FieldOperation, ScoutingLog, InventoryItem } from '@/types';

export const db = {
  // Profiles
  async getProfile(userId: string) {
    return supabase.from('profiles').select('*').eq('id', userId).single();
  },

  // Lands
  async getLands(userId: string) {
    return supabase.from('lands').select('*').eq('org_id', userId);
  },
  async insertLand(land: Omit<Land, 'id'>) {
    return supabase.from('lands').insert([land]).select().single();
  },
  async updateLand(id: string, updates: Partial<Land>) {
    return supabase.from('lands').update(updates).eq('id', id);
  },
  async deleteLand(id: string) {
    return supabase.from('lands').delete().eq('id', id);
  },

  // Transactions
  async getTransactions(userId: string, limit?: number) {
    let query = supabase.from('transactions').select('*, lands(block_no, parcel_no)').eq('org_id', userId).order('date', { ascending: false });
    if (limit) query = query.limit(limit);
    return query;
  },
  async getAllTransactionAmounts(userId: string) {
    return supabase.from('transactions').select('amount').eq('org_id', userId);
  },
  async insertTransaction(tx: any) {
    return supabase.from('transactions').insert([tx]).select().single();
  },
  async updateTransaction(id: string, updates: any) {
    return supabase.from('transactions').update(updates).eq('id', id);
  },
  async deleteTransaction(id: string) {
    return supabase.from('transactions').delete().eq('id', id);
  },

  // Seasons
  async getSeasons(userId: string) {
    return supabase.from('seasons').select('*').eq('org_id', userId).order('created_at', { ascending: false });
  },
  async insertSeason(season: any) {
    return supabase.from('seasons').insert([season]).select();
  },
  async updateSeason(id: string, updates: any) {
    return supabase.from('seasons').update(updates).eq('id', id);
  },

  // Irrigation
  async getIrrigationLogs(userId: string) {
    return supabase.from('irrigation_logs').select('*').eq('org_id', userId).order('date', { ascending: false });
  },
  async insertIrrigationLog(log: any) {
    return supabase.from('irrigation_logs').insert([log]).select().single();
  },
  async deleteIrrigationLog(id: string) {
    return supabase.from('irrigation_logs').delete().eq('id', id);
  },

  // Field Operations
  async getFieldOperations(userId: string) {
    return supabase.from('field_operations').select('*').eq('org_id', userId).order('date', { ascending: false });
  },
  async insertFieldOperation(op: any) {
    return supabase.from('field_operations').insert([op]).select().single();
  },
  async deleteFieldOperation(id: string) {
    return supabase.from('field_operations').delete().eq('id', id);
  },

  // Scouting
  async getScoutingLogs(userId: string) {
    return supabase.from('scouting_logs').select('*').eq('org_id', userId).order('date', { ascending: false });
  },
  async insertScoutingLog(log: any) {
    return supabase.from('scouting_logs').insert([log]).select().single();
  },
  async deleteScoutingLog(id: string) {
    return supabase.from('scouting_logs').delete().eq('id', id);
  },

  // Inventory
  async getInventory(userId: string) {
    return supabase.from('inventory').select('*').eq('org_id', userId);
  },
  async insertInventoryItem(item: any) {
    return supabase.from('inventory').insert([item]).select().single();
  },
  async updateInventoryItem(id: string, updates: Partial<InventoryItem>) {
    return supabase.from('inventory').update(updates).eq('id', id);
  },
  async deleteInventoryItem(id: string) {
    return supabase.from('inventory').delete().eq('id', id);
  },

  // Savings
  async insertSavingLog(log: any) {
    return supabase.from('savings_logs').insert([log]);
  }
};
