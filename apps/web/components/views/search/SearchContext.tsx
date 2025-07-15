import { queryParamToArr } from "@careerfairy/shared-lib/utils"
import { useRouter } from "next/router"
import {
   createContext,
   ReactNode,
   useCallback,
   useContext,
   useEffect,
   useMemo,
   useState,
} from "react"
import { useRecentSearches } from "./useRecentSearches"

type SearchContextType = {
   searchQuery: string
   setSearchQuery: (query: string) => void
   handleDropdownSelect: (option: string) => void
   recentSearches: string[]
   removeRecentSearch: (search: string) => void
   clearRecentSearches: () => void
   handleSearchSubmit: (query: string) => void
   handleFilterSelect: (filter: string, value: string[]) => void
   getFilterValues: (filter: string) => string[]
}

const SearchContext = createContext<SearchContextType | undefined>(undefined)

type SearchContextProviderType = {
   children: ReactNode
}

export const SearchProvider = ({ children }: SearchContextProviderType) => {
   const [searchQuery, setSearchQuery] = useState("")
   const { query, push, pathname, isReady } = useRouter()
   const {
      recentSearches,
      addRecentSearch,
      removeRecentSearch,
      clearRecentSearches,
   } = useRecentSearches()

   // Initialize search query from URL parameter
   useEffect(() => {
      if (query.q) {
         const queryFromUrl = Array.isArray(query.q) ? query.q[0] : query.q
         if (queryFromUrl) {
            setSearchQuery(queryFromUrl)
         }
      }
   }, [isReady, query.q])

   const handleSearchSubmit = useCallback(
      (query: string) => {
         if (query.trim().length > 0) {
            const trimmedQuery = query.trim()
            addRecentSearch(trimmedQuery)
            // Redirect to search page with query as URL parameter
            push(`/portal/search?q=${encodeURIComponent(trimmedQuery)}`)
         }
      },
      [push, addRecentSearch]
   )

   const handleDropdownSelect = useCallback(
      (option: string) => {
         if (option.trim().length > 0) {
            setSearchQuery(option)
            handleSearchSubmit(option)
         }
      },
      [handleSearchSubmit]
   )

   const handleFilterSelect = useCallback(
      (filter: string, value: string[]) => {
         const newQuery = { ...query }
         if (value.length > 0) {
            newQuery[filter] = value.join(",")
         } else {
            delete newQuery[filter]
         }
         void push(
            {
               pathname: pathname,
               query: newQuery,
            },
            undefined,
            { shallow: true }
         )
      },
      [query, push, pathname]
   )

   const getFilterValues = useCallback(
      (filter: string) => {
         return queryParamToArr(query[filter])
      },
      [query]
   )

   const value: SearchContextType = useMemo(() => {
      return {
         searchQuery,
         setSearchQuery,
         handleDropdownSelect,
         recentSearches,
         removeRecentSearch,
         clearRecentSearches,
         handleSearchSubmit,
         handleFilterSelect,
         getFilterValues,
      }
   }, [
      searchQuery,
      setSearchQuery,
      handleDropdownSelect,
      recentSearches,
      removeRecentSearch,
      clearRecentSearches,
      handleSearchSubmit,
      handleFilterSelect,
      getFilterValues,
   ])

   return (
      <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
   )
}

export const useSearchContext = () => {
   const context = useContext(SearchContext)

   if (!context) {
      throw new Error(
         "useSearchContext must be used within a SearchContextProvider"
      )
   }

   return context
}

export default SearchContext
