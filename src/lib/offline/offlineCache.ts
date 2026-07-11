/**
 * Offline sync snapshot helpers for useAppSync.
 * Keeps localStorage usage bounded: strips heavy land geometry, caps log arrays,
 * soft size limit, and QuotaExceeded recovery.
 */

const PREFIX = 'orjut_sync_';
const MAX_BYTES = 1_500_000; // ~1.5MB soft cap — leave headroom under ~5MB browser quota
const LOG_LIMIT = 50;
const CACHE_VERSION = 1 as const;

export type SyncCachePayload = {
  version: typeof CACHE_VERSION;
  cachedAt: string;
  lands: unknown[];
  transactions: unknown[];
  seasons: unknown[];
  irrigationLogs: unknown[];
  fieldOperations: unknown[];
  scoutingLogs: unknown[];
  inventory: unknown[];
};

export type SyncCacheInput = Omit<SyncCachePayload, 'version' | 'cachedAt'>;

function stripLand(land: Record<string, unknown> | null | undefined) {
  if (!land || typeof land !== 'object') return land;
  // Offline list / dashboard does not need polygons; map loads full lands online.
  const { geometry, boundaries, ...rest } = land;
  return rest;
}

/** Prefer newest N when arrays are already date-desc from Supabase. */
function takeLast(arr: unknown[] | undefined, n: number): unknown[] {
  if (!arr?.length) return [];
  return arr.length <= n ? arr : arr.slice(0, n);
}

function cacheKey(orgId: string): string {
  return PREFIX + orgId;
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

/** Drop oldest weather + other-org sync keys to free space; keep current org key. */
function freeLocalStorageSpace(keepOrgId: string): void {
  if (typeof window === 'undefined') return;
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k) keys.push(k);
  }

  const weatherKeys = keys.filter((k) => k.startsWith('weather_cache_'));
  for (const k of weatherKeys) {
    try {
      localStorage.removeItem(k);
    } catch {
      /* ignore */
    }
  }

  const otherSync = keys.filter(
    (k) => k.startsWith(PREFIX) && k !== cacheKey(keepOrgId)
  );
  for (const k of otherSync) {
    try {
      localStorage.removeItem(k);
    } catch {
      /* ignore */
    }
  }
}

function buildPayload(raw: SyncCacheInput, logLimit: number): SyncCachePayload {
  return {
    version: CACHE_VERSION,
    cachedAt: new Date().toISOString(),
    lands: (raw.lands || []).map((land) =>
      stripLand(land as Record<string, unknown>)
    ),
    transactions: takeLast(raw.transactions as unknown[], logLimit),
    seasons: raw.seasons || [],
    irrigationLogs: takeLast(raw.irrigationLogs as unknown[], logLimit),
    fieldOperations: takeLast(raw.fieldOperations as unknown[], logLimit),
    scoutingLogs: takeLast(raw.scoutingLogs as unknown[], logLimit),
    inventory: raw.inventory || [],
  };
}

/**
 * Write slim sync snapshot. Returns false if payload still too large or write fails.
 */
export function writeSyncCache(orgId: string, raw: SyncCacheInput): boolean {
  if (typeof window === 'undefined' || !orgId) return false;

  let logLimit = LOG_LIMIT;
  let payload = buildPayload(raw, logLimit);
  let str = JSON.stringify(payload);

  // Progressive shrink if over soft cap
  while (str.length > MAX_BYTES && logLimit > 10) {
    logLimit = Math.floor(logLimit / 2);
    payload = buildPayload(raw, logLimit);
    str = JSON.stringify(payload);
  }

  // Last resort: drop scouting notes noise by keeping only inventory + lands + seasons + short logs
  if (str.length > MAX_BYTES) {
    payload = {
      ...payload,
      irrigationLogs: takeLast(payload.irrigationLogs, 10),
      fieldOperations: takeLast(payload.fieldOperations, 10),
      scoutingLogs: takeLast(payload.scoutingLogs, 10),
      transactions: takeLast(payload.transactions, 10),
    };
    str = JSON.stringify(payload);
  }

  if (str.length > MAX_BYTES) {
    console.warn('[offlineCache] payload too large after shrink', str.length);
    return false;
  }

  try {
    localStorage.setItem(cacheKey(orgId), str);
    return true;
  } catch (e) {
    if (isQuotaError(e)) {
      freeLocalStorageSpace(orgId);
      try {
        localStorage.setItem(cacheKey(orgId), str);
        return true;
      } catch (retryErr) {
        console.error('[offlineCache] write failed after quota recovery', retryErr);
        return false;
      }
    }
    console.error('[offlineCache] write failed', e);
    return false;
  }
}

/**
 * Read sync snapshot. Supports v1 and legacy unversioned blobs written before offlineCache.
 */
export function readSyncCache(orgId: string): SyncCachePayload | null {
  if (typeof window === 'undefined' || !orgId) return null;

  try {
    const cachedStr = localStorage.getItem(cacheKey(orgId));
    if (!cachedStr) return null;

    const parsed = JSON.parse(cachedStr) as Partial<SyncCachePayload> & Record<string, unknown>;
    if (!parsed || typeof parsed !== 'object') return null;

    return {
      version: parsed.version === CACHE_VERSION ? CACHE_VERSION : CACHE_VERSION,
      cachedAt:
        typeof parsed.cachedAt === 'string'
          ? parsed.cachedAt
          : '', // legacy cache has no timestamp
      lands: Array.isArray(parsed.lands) ? parsed.lands : [],
      transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
      seasons: Array.isArray(parsed.seasons) ? parsed.seasons : [],
      irrigationLogs: Array.isArray(parsed.irrigationLogs) ? parsed.irrigationLogs : [],
      fieldOperations: Array.isArray(parsed.fieldOperations) ? parsed.fieldOperations : [],
      scoutingLogs: Array.isArray(parsed.scoutingLogs) ? parsed.scoutingLogs : [],
      inventory: Array.isArray(parsed.inventory) ? parsed.inventory : [],
    };
  } catch (err) {
    console.error('[offlineCache] read/parse failed', err);
    return null;
  }
}

export function formatCacheAge(cachedAt: string): string | null {
  if (!cachedAt) return null;
  try {
    const d = new Date(cachedAt);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleString('tr-TR');
  } catch {
    return null;
  }
}
