/**
 * `server-only` exists to make a client bundle fail at build time. Vitest runs
 * in Node, where that guard is meaningless and the real package's export map
 * resolves to nothing — so it is stubbed rather than dropped from the modules
 * under test, which would weaken the guard in the app itself.
 */
export {};
