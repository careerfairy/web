import { useCallback } from "react"
import { localStorageRecentSearches } from "../../../constants/localStorageKeys"
import { usePersistentState } from "../../../hooks/usePersistentState"

const MAX_RECENT_SEARCHES = 5

export const useRecentSearches = () => {
   const [recentSearches, setRecentSearches] = usePersistentState<string[]>(
      localStorageRecentSearches,
      []
   )

   const addRecentSearch = useCallback(
      (search: string) => {
         setRecentSearches((prev) => {
            // Remove the search if it already exists
            const filtered = prev.filter((item) => item !== search)
            // Add the new search at the beginning
            const updated = [search, ...filtered]
            // Keep only the latest 5 searches
            return updated.slice(0, MAX_RECENT_SEARCHES)
         })
      },
      [setRecentSearches]
   )

   const removeRecentSearch = useCallback(
      (search: string) => {
         setRecentSearches((prev) => prev.filter((item) => item !== search))
      },
      [setRecentSearches]
   )

   const clearRecentSearches = useCallback(() => {
      setRecentSearches([])
   }, [setRecentSearches])

   return {
      recentSearches: recentSearches || [],
      addRecentSearch,
      removeRecentSearch,
      clearRecentSearches,
   }
}
