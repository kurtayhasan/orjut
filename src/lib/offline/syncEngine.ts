/**
 * Offline sync engine — flush pending queue + helpers for NetworkStatus / AppSync.
 * Implementation lives in offlineQueue; this module is the canonical entrypoint.
 */

export {
  flushQueue,
  getQueueCount,
  listQueue,
  enqueue,
  removeByClientId,
  clearOrgQueue,
  newClientId,
  isTempId,
  isLikelyOfflineError,
  type PendingAction,
  type PendingType,
  type FlushResult,
  type EnqueueResult,
} from './offlineQueue';

/** Alias used by UI: run full pending flush for optional org. */
export async function runSyncEngine(orgId?: string) {
  const { flushQueue } = await import('./offlineQueue');
  return flushQueue(orgId);
}
