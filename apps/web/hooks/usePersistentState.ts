import { Dispatch, SetStateAction, useEffect, useState } from "react"
import useLocalStorage from "react-use/lib/useLocalStorage"

type SetValue<T> = Dispatch<SetStateAction<T>>

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
