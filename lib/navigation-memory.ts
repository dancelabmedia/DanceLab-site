export const HISTORY_RESTORE_TARGET = 'dancelab:history-restore-target'
const SCROLL_PREFIX = 'dancelab:scroll:'
const STATE_PREFIX = 'dancelab:listing-state:'

export function currentNavigationKey() {
  return window.location.pathname + window.location.search
}

export function scrollStorageKey(url: string) {
  return SCROLL_PREFIX + url
}

export function listingStateStorageKey(namespace: string, url: string) {
  return `${STATE_PREFIX}${namespace}:${url}`
}

export function isHistoryRestoreTarget(url = currentNavigationKey()) {
  return sessionStorage.getItem(HISTORY_RESTORE_TARGET) === url
}
