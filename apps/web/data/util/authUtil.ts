/*
 * This function clears the ReactFire cache of preloaded observables associated with stale authentication tokens,
 * ensuring new observables are created with fresh tokens when the user signs back in to Firebase.
 * Related Issues:
 * - https://github.com/FirebaseExtended/reactfire/issues/485
 * - https://github.com/FirebaseExtended/reactfire/discussions/228
 * */
export const clearFirestoreCache = () => {
   const map = globalThis["_reactFirePreloadedObservables"] as
      | Map<string, unknown>
      | undefined
   Array.from(map.keys()).forEach(
      (key) => key.includes("firestore") && map.delete(key)
   )
}
