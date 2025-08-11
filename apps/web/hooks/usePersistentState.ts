import { Dispatch, SetStateAction, useEffect, useState } from "react"
import useLocalStorage from "react-use/lib/useLocalStorage"

type SetValue<T> = Dispatch<SetStateAction<T>>

/**
 * A hook that provides persistent state with localStorage synchronization.
 * Unlike useLocalStorage from react-use, this hook ensures proper re-renders
 * and functional updates by maintaining a local state that syncs with localStorage.
 *
 * @param key - The localStorage key to persist the state
 * @param initialValue - The initial value if no persisted value exists
 * @returns A tuple containing the current state and a setter function
 */
export const usePersistentState = <T>(
   key: string,
   initialValue: T
): [T, SetValue<T>] => {
   const [persistedValue, setPersistedValue] = useLocalStorage<T>(
      key,
      initialValue
   )

   const [localState, setLocalState] = useState<T>(
      persistedValue ?? initialValue
   )

   useEffect(() => {
      setPersistedValue(localState)
   }, [localState, setPersistedValue])

   return [localState, setLocalState]
}
