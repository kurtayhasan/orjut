/**
 * Offline write queue for farm create operations.
 * FIFO flush with temp land_id → server UUID remapping.
 * Storage: localStorage key orjut_pending_queue (bounded).
 */

import { db } from '@/lib/db';

const QUEUE_KEY = 'orjut_pending_queue';
const MAX_ITEMS = 50;
const MAX_BYTES = 400_000;
const FLUSH_LOCK_KEY = 'orjut_pending_flush_lock';

export type PendingType =
  | 'insert_land'
  | 'insert_scouting'
  | 'insert_irrigation'
  | 'insert_field_operation';

export type PendingAction = {
  clientId: string;
  orgId: string;
  type: PendingType;
  payload: Record<string, unknown>;
  createdAt: string;
  attempts: number;
  lastError?: string;
};

export type EnqueueResult =
  | { ok: true }
  | { ok: false; reason: string };

export type FlushResult = {
  success: number;
  failed: number;
  errors: { clientId: string; message: string }[];
};

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function notifyQueueChanged(): void {
  if (!isBrowser()) return;
  window.dispatchEvent(new CustomEvent('orjut:queue-changed'));
}

function notifyQueueFlushed(detail: FlushResult): void {
  if (!isBrowser()) return;
  window.dispatchEvent(
    new CustomEvent('orjut:offline-queue-flushed', { detail })
  );
}

function isQuotaError(e: unknown): boolean {
  if (!e || typeof e !== 'object') return false;
  const err = e as DOMException & { code?: number; name?: string };
  return (
    err.name === 'QuotaExceededError' ||
    err.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
    err.code === 22 ||
    err.code === 1014
  );
}

export function newClientId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `temp_${crypto.randomUUID()}`;
  }
  return `temp_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

export function isTempId(id: string | null | undefined): boolean {
  return typeof id === 'string' && id.startsWith('temp_');
}

export function listQueue(): PendingAction[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item) =>
        item &&
        typeof item === 'object' &&
        typeof item.clientId === 'string' &&
        typeof item.orgId === 'string' &&
        typeof item.type === 'string'
    ) as PendingAction[];
  } catch {
    return [];
  }
}

function writeQueue(items: PendingAction[]): EnqueueResult {
  if (!isBrowser()) {
    return { ok: false, reason: 'Tarayıcı ortamı yok; kuyruk yazılamadı.' };
  }
  try {
    const str = JSON.stringify(items);
    if (str.length > MAX_BYTES) {
      return {
        ok: false,
        reason:
          'Çevrimdışı kuyruk boyutu limitine ulaşıldı (~400KB). Bazı kayıtları silin veya online olun.',
      };
    }
    localStorage.setItem(QUEUE_KEY, str);
    notifyQueueChanged();
    return { ok: true };
  } catch (e) {
    if (isQuotaError(e)) {
      return {
        ok: false,
        reason:
          'Cihaz depolama kotası doldu. Çevrimdışı kayıt eklenemedi. Gereksiz verileri temizleyin veya online olun.',
      };
    }
    return {
      ok: false,
      reason: 'Çevrimdışı kuyruk kaydedilemedi.',
    };
  }
}

export function getQueueCount(orgId?: string): number {
  const q = listQueue();
  if (!orgId) return q.length;
  return q.filter((a) => a.orgId === orgId).length;
}

export function enqueue(
  action: Omit<PendingAction, 'createdAt' | 'attempts' | 'lastError'>
): EnqueueResult {
  const current = listQueue();

  if (current.some((a) => a.clientId === action.clientId)) {
    return { ok: true }; // idempotent re-enqueue of same clientId
  }

  if (current.length >= MAX_ITEMS) {
    return {
      ok: false,
      reason: `Çevrimdışı kuyruk dolu (en fazla ${MAX_ITEMS} kayıt). Bağlantı gelince senkronize edin.`,
    };
  }

  // Rough size check before push (payload should not include huge base64)
  const probe = JSON.stringify(action.payload);
  if (probe.length > 100_000) {
    return {
      ok: false,
      reason:
        'Kayıt çok büyük (ör. büyük görsel/geometri). Çevrimdışı kuyruğa alınamadı; online iken tekrar deneyin.',
    };
  }

  const item: PendingAction = {
    ...action,
    createdAt: new Date().toISOString(),
    attempts: 0,
  };

  return writeQueue([...current, item]);
}

export function removeByClientId(clientId: string): void {
  const next = listQueue().filter((a) => a.clientId !== clientId);
  writeQueue(next);
}

export function clearOrgQueue(orgId: string): void {
  writeQueue(listQueue().filter((a) => a.orgId !== orgId));
}

function acquireFlushLock(): boolean {
  if (!isBrowser()) return false;
  try {
    const existing = sessionStorage.getItem(FLUSH_LOCK_KEY);
    if (existing) {
      const ts = Number(existing);
      // stale lock after 60s
      if (!Number.isNaN(ts) && Date.now() - ts < 60_000) return false;
    }
    sessionStorage.setItem(FLUSH_LOCK_KEY, String(Date.now()));
    return true;
  } catch {
    return true; // proceed without lock if sessionStorage blocked
  }
}

function releaseFlushLock(): void {
  if (!isBrowser()) return;
  try {
    sessionStorage.removeItem(FLUSH_LOCK_KEY);
  } catch {
    /* ignore */
  }
}

function extractErrorMessage(error: unknown): string {
  if (!error) return 'Bilinmeyen senkronizasyon hatası.';
  if (typeof error === 'string') return error;
  const e = error as { message?: string; code?: string; details?: string };
  if (e.message) return e.message;
  if (e.details) return e.details;
  return 'Kayıt senkronize edilemedi.';
}

/**
 * FIFO flush. Lands first effectively via queue order (enqueue order).
 * Remaps temp land clientIds to server UUIDs for dependent ops.
 */
export async function flushQueue(orgId?: string): Promise<FlushResult> {
  const empty: FlushResult = { success: 0, failed: 0, errors: [] };
  if (!isBrowser()) return empty;

  if (!acquireFlushLock()) {
    return empty;
  }

  try {
    const all = listQueue();
    const toProcess = orgId ? all.filter((a) => a.orgId === orgId) : all;
    const otherOrgs = orgId ? all.filter((a) => a.orgId !== orgId) : [];

    if (toProcess.length === 0) {
      return empty;
    }

    // Process lands first within the batch, then other types (stable relative order)
    const lands = toProcess.filter((a) => a.type === 'insert_land');
    const rest = toProcess.filter((a) => a.type !== 'insert_land');
    const ordered = [...lands, ...rest];

    const idMap = new Map<string, string>(); // temp clientId → server id
    let success = 0;
    const errors: FlushResult['errors'] = [];
    const failedItems: PendingAction[] = [];

    for (const item of ordered) {
      try {
        const payload: Record<string, unknown> = { ...item.payload };

        if (typeof payload.land_id === 'string' && idMap.has(payload.land_id)) {
          payload.land_id = idMap.get(payload.land_id)!;
        }

        if (
          item.type !== 'insert_land' &&
          typeof payload.land_id === 'string' &&
          isTempId(payload.land_id)
        ) {
          throw new Error(
            'Bağlı arazi henüz senkronize edilmedi. Önce arazi kaydının başarılı olduğundan emin olun.'
          );
        }

        // Never send client-only flags to Supabase
        delete payload.isPending;
        // Server generates id; do not force temp id
        if (isTempId(payload.id as string)) {
          delete payload.id;
        }

        if (item.type === 'insert_land') {
          const { data, error } = await db.insertLand(
            payload as Parameters<typeof db.insertLand>[0]
          );
          if (error) throw error;
          if (!data?.id) throw new Error('Arazi sunucuya yazıldı ancak kimlik dönmedi.');
          idMap.set(item.clientId, data.id);
        } else if (item.type === 'insert_scouting') {
          const { error } = await db.insertScoutingLog(payload);
          if (error) throw error;
        } else if (item.type === 'insert_irrigation') {
          const { error } = await db.insertIrrigationLog(payload);
          if (error) throw error;
        } else if (item.type === 'insert_field_operation') {
          const { error } = await db.insertFieldOperation(payload);
          if (error) throw error;
        } else {
          throw new Error(`Bilinmeyen kuyruk tipi: ${(item as PendingAction).type}`);
        }

        success++;
      } catch (e: unknown) {
        const message = extractErrorMessage(e);
        errors.push({ clientId: item.clientId, message });
        failedItems.push({
          ...item,
          attempts: (item.attempts || 0) + 1,
          lastError: message,
        });
      }
    }

    const writeResult = writeQueue([...otherOrgs, ...failedItems]);
    if (!writeResult.ok) {
      console.error('[offlineQueue] failed to persist remaining queue', writeResult.reason);
    }

    const result: FlushResult = {
      success,
      failed: errors.length,
      errors,
    };
    notifyQueueFlushed(result);
    return result;
  } finally {
    releaseFlushLock();
  }
}

export function isLikelyOfflineError(err?: unknown): boolean {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return true;
  const msg = String(
    (err as { message?: string })?.message || err || ''
  );
  return (
    /Failed to fetch|NetworkError|Network request failed|fetch failed|Load failed|ERR_INTERNET|TypeError:\s*Failed/i.test(
      msg
    )
  );
}
