import { supabase } from './supabase';
import type { Land, Transaction, Season, InventoryItem } from '@/types';

// ─────────────────────────────────────────────
// Generic query helper — eliminates boilerplate
// ─────────────────────────────────────────────
type Table = 'profiles' | 'lands' | 'transactions' | 'seasons' | 'irrigation_logs'
  | 'field_operations' | 'scouting_logs' | 'inventory' | 'savings_logs'
  | 'engineer_clients' | 'push_subscriptions';

function from(table: Table) {
  return supabase.from(table);
}

// ─────────────────────────────────────────────
// Inventory type mapping (DB ENUM → TR label)
// ─────────────────────────────────────────────
const INVENTORY_TYPE_MAP: Record<string, string> = {
  gubre: 'fertilizer',
  tohum: 'seed',
  yakit: 'fuel',
  ilac:  'pesticide',
  diger: 'other',
};

function normalizeInventoryPayload(item: Record<string, any>) {
  const { name, last_unit_cost, last_purchase_date, ...rest } = item;
  return {
    ...rest,
    item_name:  name ?? item.item_name,
    unit_cost:  last_unit_cost ?? item.unit_cost ?? 0,
    type:       INVENTORY_TYPE_MAP[item.type] ?? item.type ?? 'other',
  };
}

// ─────────────────────────────────────────────
// DB — single unified data access object
// ─────────────────────────────────────────────
export const db = {

  /* ── Profiles ─────────────────────────── */
  getProfile: (userId: string) =>
    from('profiles').select('*').eq('id', userId).single(),

  getAllProfiles: () =>
    from('profiles').select('*').order('created_at', { ascending: false }),

  /* ── Lands ────────────────────────────── */
  getLands: (userId: string) =>
    from('lands').select('*').eq('org_id', userId),

  insertLand: (land: Omit<Land, 'id'>) =>
    from('lands').insert([land]).select().single(),

  updateLand: (id: string, updates: Partial<Land>) =>
    from('lands').update(updates).eq('id', id),

  deleteLand: (id: string) =>
    from('lands').delete().eq('id', id),

  /* ── Transactions ─────────────────────── */
  getTransactions: (userId: string, limit?: number) => {
    let q = from('transactions')
      .select('*, lands(block_no, parcel_no)')
      .eq('org_id', userId)
      .order('date', { ascending: false });
    if (limit) q = q.limit(limit);
    return q;
  },

  insertTransaction: (tx: Omit<Transaction, 'id' | 'lands'>) =>
    from('transactions').insert([tx]).select().single(),

  updateTransaction: (id: string, updates: Partial<Transaction>) =>
    from('transactions').update(updates).eq('id', id),

  deleteTransaction: (id: string) =>
    from('transactions').delete().eq('id', id),

  /* ── Seasons ──────────────────────────── */
  getSeasons: (userId: string) =>
    from('seasons').select('*').eq('org_id', userId).order('created_at', { ascending: false }),

  insertSeason: (season: Omit<Season, 'id'>) =>
    from('seasons').insert([season]).select(),

  updateSeason: (id: string, updates: Partial<Season>) =>
    from('seasons').update(updates).eq('id', id),

  /* ── Irrigation ───────────────────────── */
  getIrrigationLogs: (userId: string) =>
    from('irrigation_logs').select('*').eq('org_id', userId).order('date', { ascending: false }),

  insertIrrigationLog: (log: Record<string, unknown>) =>
    from('irrigation_logs').insert([log]).select().single(),

  deleteIrrigationLog: (id: string) =>
    from('irrigation_logs').delete().eq('id', id),

  /* ── Field Operations ─────────────────── */
  getFieldOperations: (userId: string) =>
    from('field_operations').select('*').eq('org_id', userId).order('date', { ascending: false }),

  insertFieldOperation: (op: Record<string, unknown>) =>
    from('field_operations').insert([op]).select().single(),

  deleteFieldOperation: (id: string) =>
    from('field_operations').delete().eq('id', id),

  /* ── Scouting ─────────────────────────── */
  getScoutingLogs: (userId: string) =>
    from('scouting_logs').select('*').eq('org_id', userId).order('date', { ascending: false }),

  insertScoutingLog: (log: Record<string, unknown>) =>
    from('scouting_logs').insert([log]).select().single(),

  deleteScoutingLog: (id: string) =>
    from('scouting_logs').delete().eq('id', id),

  /* ── Inventory ────────────────────────── */
  getInventory: (userId: string) =>
    from('inventory').select('*').eq('org_id', userId),

  insertInventoryItem: (item: Record<string, unknown>) =>
    from('inventory').insert([normalizeInventoryPayload(item)]).select().single(),

  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) =>
    from('inventory').update(updates).eq('id', id),

  deleteInventoryItem: (id: string) =>
    from('inventory').delete().eq('id', id),

  /* ── Savings ──────────────────────────── */
  insertSavingLog: (log: Record<string, unknown>) =>
    from('savings_logs').insert([log]),

  /* ── System Metrics (Admin) ───────────── */
  getSystemMetrics: async () => {
    const [users, lands, premium] = await Promise.all([
      from('profiles').select('*', { count: 'exact', head: true }),
      from('lands').select('*', { count: 'exact', head: true }),
      from('profiles').select('*', { count: 'exact', head: true }).eq('is_premium', true),
    ]);
    return {
      totalUsers:   users.count   ?? 0,
      totalLands:   lands.count   ?? 0,
      totalPremium: premium.count ?? 0,
    };
  },

  /* ── Engineer / Clients ───────────────── */
  getClients: (engineerId: string) =>
    from('engineer_clients')
      .select('*, farmer:profiles!farmer_id(*)')
      .eq('engineer_id', engineerId),

  addClientRequest: async (engineerId: string, phone: string) => {
    const { data: user, error } = await from('profiles').select('id').eq('phone', phone).single();
    if (error || !user) throw new Error('Bu telefon numarasına ait bir kullanıcı bulunamadı.');
    return from('engineer_clients').insert([{ engineer_id: engineerId, farmer_id: user.id, status: 'pending' }]);
  },

  updateClientRequestStatus: (requestId: string, status: 'approved' | 'rejected') =>
    from('engineer_clients').update({ status }).eq('id', requestId),

  getPendingRequests: (farmerId: string) =>
    from('engineer_clients')
      .select('*, engineer:profiles!engineer_id(*)')
      .eq('farmer_id', farmerId)
      .eq('status', 'pending'),

  /* ── Bulk Deletes (Orphan Prevention) ──── */
  deleteTransactionsByLand: (landId: string) =>
    from('transactions').delete().eq('land_id', landId),

  deleteIrrigationLogsByLand: (landId: string) =>
    from('irrigation_logs').delete().eq('land_id', landId),

  deleteScoutingLogsByLand: (landId: string) =>
    from('scouting_logs').delete().eq('land_id', landId),

  deleteFieldOperationsByLand: (landId: string) =>
    from('field_operations').delete().eq('land_id', landId),
};
